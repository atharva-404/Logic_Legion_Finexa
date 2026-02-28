import asyncio
from channels.generic.websocket import AsyncJsonWebsocketConsumer


class SimpleTestConsumer(AsyncJsonWebsocketConsumer):
    """Simple test consumer for websocket connectivity."""

    async def connect(self):
        self.room_group_name = "test_chat"
        await self.channel_layer.group_add(self.room_group_name, self.channel_name)
        await self.accept()
        print(f"Client connected: {self.channel_name}")

    async def disconnect(self, code):
        await self.channel_layer.group_discard(self.room_group_name, self.channel_name)
        print(f"Client disconnected: {self.channel_name}")

    async def receive_json(self, content, **kwargs):
        """Echo back the received message."""
        question = content.get("question", "No question provided")
        print(f"Received question: {question}")
        
        # Send typing indicator
        await self.channel_layer.group_send(
            self.room_group_name,
            {"type": "chat.typing", "status": "start"},
        )

        # Simulate processing
        await asyncio.sleep(2)
        
        # Send mock response
        answer = f"Mock response to: {question}"
        await self.channel_layer.group_send(
            self.room_group_name,
            {
                "type": "chat.message",
                "payload": {"type": "done", "complete": answer},
            },
        )

    async def chat_message(self, event):
        await self.send_json(event["payload"])

    async def chat_typing(self, event):
        await self.send_json({"type": "typing", "status": event.get("status")})
