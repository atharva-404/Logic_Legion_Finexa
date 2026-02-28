# socket/consumers.py
import asyncio
from channels.generic.websocket import AsyncJsonWebsocketConsumer
from asgiref.sync import sync_to_async
from core.settings import GEMINI_API_KEY
from ai_assistant.services.document_chat import chat_with_document
from ai_assistant.models import ChatSession, ChatMessage
from django.contrib.auth.models import AnonymousUser


class DocumentChatConsumer(AsyncJsonWebsocketConsumer):
    """
    WebSocket endpoint for AI chat with SQL documents, with:
    - Support for specific document_id or all documents as context
    - Typing indicator and token streaming
    - Short, professional 2-line responses
    - History saved in DB

    URL: ws://<host>/ws/ai/chat/
    
    Expected payload:
    {
      "question": "How much did I spend?",
      "document_id": 123  (optional, if None uses all documents)
    }
    """
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.room_group_name = None
        self.user = None

    async def connect(self):
        user = self.scope.get("user")
        
        print(f"[CONSUMER] Connection attempt - User from scope: {user}")
        print(f"[CONSUMER] User is_anonymous: {getattr(user, 'is_anonymous', 'N/A')}")
        print(f"[CONSUMER] User is_authenticated: {getattr(user, 'is_authenticated', 'N/A')}")
        
        # Middleware already handled auth, but require authenticated user
        if not user or user.is_anonymous:
            print(f"[CONSUMER] ❌ Rejecting connection - user is anonymous")
            await self.close(code=4001)  # Custom close code for auth failure
            return

        print(f"[CONSUMER] ✅ Accepting connection for user: {user}")
        self.room_group_name = f"document_chat_{user.id}"
        self.user = user  # Store authenticated user

        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()

    async def disconnect(self, code):
        # Only discard from group if connection was successfully established
        if self.room_group_name:
            await self.channel_layer.group_discard(self.room_group_name, self.channel_name)

    async def receive_json(self, content, **kwargs):
        """
        Expected payload:
        {
          "question": "How much did I spend?",
          "document_id": 123  (optional)
        }
        """
        user = self.user  # Use stored user from connect()
        question = content.get("question")
        document_id = content.get("document_id")  # None = use all documents
        
        if not question:
            await self.send_json({"type": "error", "error": "question is required"})
            return

        # Verify user is authenticated
        if not user or user.is_anonymous:
            await self.send_json({"type": "error", "error": "Authentication required"})
            return

        # 1) Ensure ChatSession exists
        session = await sync_to_async(self._get_or_create_session)(user, document_id)

        # 1.5) Deduct Credits (2 Credits per question)
        try:
             await sync_to_async(self._deduct_chat_credits)(user.id)
        except ValueError as e:
             await self.send_json({"type": "error", "error": str(e)})
             return

        # 2) Save user message
        await sync_to_async(ChatMessage.objects.create)(
            session=session, sender="user", text=question
        )

        # 3) Notify room that AI is typing
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.typing",
                "document_id": document_id,
                "sender": "ai",
                "status": "start",
            },
        )

        # 4) Get LLM answer with document context (blocking → thread)
        try:
            answer = await sync_to_async(chat_with_document)(
                question, user.id, document_id
            )
        except Exception as e:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat.message",
                    "payload": {
                        "type": "error",
                        "error": f"Failed to generate response: {str(e)}",
                        "document_id": document_id,
                    },
                },
            )
            return

        # 5) Save AI message
        await sync_to_async(ChatMessage.objects.create)(
            session=session, sender="ai", text=answer
        )

        # 6) Tokenized stream: send one token at a time
        tokens = answer.split()
        for t in tokens:
            await self.channel_layer.group_send(
                self.room_group_name,
                {
                    "type": "chat.message",
                    "payload": {
                        "type": "token",
                        "document_id": document_id,
                        "text": t,
                    },
                },
            )
            # yield control to event loop for responsive streaming
            await asyncio.sleep(0)

        # 7) Typing stopped + done event
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.typing",
                "document_id": document_id,
                "sender": "ai",
                "status": "stop",
            },
        )

        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.message",
                "payload": {
                    "type": "done",
                    "document_id": document_id,
                    "complete": answer,
                },
            },
        )

    # === group handlers ===

    async def chat_message(self, event):
        # event["payload"] is already JSON-serializable
        await self.send_json(event["payload"])

    async def chat_typing(self, event):
        await self.send_json(
            {
                "type": "typing",
                "document_id": event.get("document_id"),
                "sender": event.get("sender"),
                "status": event.get("status"),  # "start" | "stop"
            }
        )

    # === helper ===

    def _get_or_create_session(self, user, document_id):
        # Create session per user + document_id combination
        session, _ = ChatSession.objects.get_or_create(
            user=user,
            mongo_id=f"doc_{document_id}" if document_id else "all_docs",
        )
        return session

    def _deduct_chat_credits(self, user_id):
        from django.contrib.auth import get_user_model
        User = get_user_model()
        user = User.objects.get(id=user_id)
        if user.credits < 2:
            raise ValueError("Insufficient credits (Required: 2)")
        user.credits -= 2
        user.save()
        return True
