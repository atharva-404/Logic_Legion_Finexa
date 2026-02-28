"""
Custom WebSocket authentication middleware for JWT token-based auth
"""
from django.contrib.auth.models import AnonymousUser
from channels.db import database_sync_to_async
from channels.middleware import BaseMiddleware
from channels.auth import AuthMiddlewareStack, CookieMiddleware, SessionMiddleware
import logging

logger = logging.getLogger(__name__)


@database_sync_to_async
def get_user_from_jwt_token(token_string):
    """
    Validate JWT token and return user if valid.
    Returns User object if token is valid, None otherwise.
    """
    try:
        from rest_framework_simplejwt.tokens import AccessToken
        from django.contrib.auth import get_user_model
        
        User = get_user_model()
        
        # Decode and validate the JWT token
        token = AccessToken(token_string)
        user_id = token.get('user_id')
        
        if user_id:
            user = User.objects.get(id=user_id)
            logger.info(f"✅ JWT token valid for user: {user}")
            return user
        else:
            logger.warning("⚠️ JWT token missing user_id claim")
            return None
            
    except Exception as e:
        logger.debug(f"JWT validation failed: {str(e)}")
        return None


async def get_user_from_session(scope):
    """
    Get user from Django session (fallback auth method).
    """
    from django.contrib.auth.models import AnonymousUser
    from channels.auth import get_user
    
    try:
        user = await get_user(scope)
        return user
    except Exception as e:
        logger.debug(f"Session auth failed: {str(e)}")
        return AnonymousUser()


class TokenAuthMiddleware(BaseMiddleware):
    """
    Custom middleware that authenticates WebSocket connections using:
    1. JWT token in query string: ?token=abc123...
    2. Fallback to Django session authentication
    """

    async def __call__(self, scope, receive, send):
        """
        Called when a WebSocket connection is initiated.
        Tries to authenticate user from JWT token, then falls back to session.
        """
        scope = dict(scope)
        logger.info(f"[MIDDLEWARE] WebSocket connection attempt from {scope.get('client', 'unknown')}")
        
        # Try JWT token-based auth first (from query string)
        user = await self._authenticate_token(scope)
        
        # If token auth fails, try session-based auth
        if user is None or (hasattr(user, 'is_anonymous') and user.is_anonymous):
            logger.info("[MIDDLEWARE] Token auth failed, trying session auth")
            user = await self._authenticate_session(scope)
        
        # Set user in scope
        scope['user'] = user if user is not None else AnonymousUser()
        
        logger.info(f"[MIDDLEWARE] Final auth result - User: {scope['user']}, "
                   f"Anonymous: {scope['user'].is_anonymous}, "
                   f"Is authenticated: {getattr(scope['user'], 'is_authenticated', False)}")
        
        return await super().__call__(scope, receive, send)

    async def _authenticate_token(self, scope):
        """
        Try to authenticate using JWT token from query string.
        """
        query_string = scope.get('query_string', b'').decode()
        logger.info(f"[TOKEN AUTH] Full query string: '{query_string}'")
        
        # Parse query string for token parameter
        if 'token=' in query_string:
            try:
                # Extract token value (simple parsing)
                token_part = query_string.split('token=')[1]
                # Remove any other query params
                token_string = token_part.split('&')[0]
                
                logger.info(f"[TOKEN AUTH] Extracted token: '{token_string[:50]}...'")
                logger.info(f"[TOKEN AUTH] Token length: {len(token_string)}")
                
                user = await get_user_from_jwt_token(token_string)
                
                if user:
                    logger.info(f"✅ [TOKEN AUTH] Success - User: {user} (ID: {user.id})")
                    return user
                else:
                    logger.warning(f"⚠️ [TOKEN AUTH] Failed - JWT token validation failed")
                    return None
            except Exception as e:
                logger.error(f"❌ [TOKEN AUTH] Error: {str(e)}", exc_info=True)
                return None
        else:
            logger.info(f"[TOKEN AUTH] No token parameter found in query string")
            return None

    async def _authenticate_session(self, scope):
        """
        Fallback: Try Django session-based authentication.
        """
        try:
            # Check if session data is available
            if 'session' in scope:
                from channels.auth import get_user as channels_get_user
                user = await channels_get_user(scope)
                
                if user and not user.is_anonymous:
                    logger.info(f"✅ Session auth successful for user: {user}")
                    return user
                else:
                    logger.debug("Session auth failed - no authenticated user in session")
                    return AnonymousUser()
            else:
                logger.debug("No session in scope")
                return AnonymousUser()
        except Exception as e:
            logger.error(f"Session auth error: {str(e)}")
            return AnonymousUser()


def TokenAuthMiddlewareStack(inner):
    """
    Wraps with cookie and session middleware, then applies token auth.
    This ensures all authentication methods are available.
    """
    return CookieMiddleware(
        SessionMiddleware(
            TokenAuthMiddleware(inner)
        )
    )
