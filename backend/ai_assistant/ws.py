"""
Simple ASGI WebSocket chat handler for conversations.
This keeps an in-memory list of connected websockets per conversation id.
It saves messages to the Django DB (Message model) using sync_to_async.

Note: For production use, run under Daphne/Uvicorn and consider using Redis/pubsub
for multiple worker broadcasting and persistence.
"""
import asyncio
import json
from typing import Dict, Set

from asgiref.sync import sync_to_async

from django.contrib.auth import get_user_model
from .models import Conversation, Message

# In-memory mapping: conversation_id -> set of websocket send coroutines
CONNECTIONS: Dict[str, Set] = {}


@sync_to_async
def save_message_to_db(conversation_id, user_id, text):
    # Create Message object in sync DB context
    try:
        conv = Conversation.objects.get(id=conversation_id)
    except Conversation.DoesNotExist:
        return None
    User = get_user_model()
    try:
        user = User.objects.get(id=user_id)
    except User.DoesNotExist:
        return None
    msg = Message.objects.create(conversation=conv, user=user, text=text)
    # update conversation last_updated
    conv.save()
    return {
        "id": msg.id,
        "conversation": conversation_id,
        "user": user_id,
        "text": text,
        "created_at": msg.created_at.isoformat(),
    }


async def chat_app(scope, receive, send):
    """ASGI app for handling websocket chat connections.

    Expected path: /ws/chat/{conversation_id}
    Messages exchanged are JSON with keys: "message_text" and "user_id".
    """
    assert scope["type"] == "websocket"
    path = scope.get("path", "")
    # extract conversation id from path
    # path like: /ws/chat/123/
    conversation_id = path.rstrip("/").split("/")[-1]

    # Accept connection
    await send({"type": "websocket.accept"})

    # Register connection
    connections = CONNECTIONS.setdefault(conversation_id, set())

    # We will push messages by calling websocket_send
    async def websocket_send(message_text: str):
        await send({"type": "websocket.send", "text": message_text})

    connections.add(websocket_send)

    try:
        while True:
            event = await receive()
            if event["type"] == "websocket.receive":
                text = event.get("text")
                if not text:
                    continue
                try:
                    payload = json.loads(text)
                except Exception:
                    # ignore invalid payloads
                    continue
                message_text = payload.get("message_text")
                user_id = payload.get("user_id")
                if message_text and user_id:
                    # save to DB
                    saved = await save_message_to_db(conversation_id, user_id, message_text)
                    if saved:
                        # broadcast to all other connections in the same conversation
                        data = json.dumps({"type": "message", "data": saved})
                        coros = [c(data) for c in connections]
                        # fire-and-forget but wait to ensure send order
                        await asyncio.gather(*coros, return_exceptions=True)
            elif event["type"] == "websocket.disconnect":
                break
    finally:
        # cleanup
        try:
            connections.discard(websocket_send)
            if not connections:
                CONNECTIONS.pop(conversation_id, None)
        except Exception:
            pass
