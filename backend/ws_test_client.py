import asyncio
import json
import sys

# Simple websocket test client. Uses `websockets` package.
# Usage: python ws_test_client.py [mongo_id] [token]

mongo_id = sys.argv[1] if len(sys.argv) > 1 else "testdoc"
token = sys.argv[2] if len(sys.argv) > 2 else ""

URI = f"ws://127.0.0.1:8000/ws/ai/chat/{mongo_id}/"
if token:
    URI += f"?token={token}"

async def run():
    try:
        import websockets
    except ImportError:
        print("Missing dependency: install with `pip install websockets`")
        return

    try:
        print(f"Connecting to {URI}")
        async with websockets.connect(URI) as ws:
            print("Connected. Sending test question...")
            await ws.send(json.dumps({"question": "How much did I spend on food last month?"}))

            # Listen for messages until 'done' or timeout
            try:
                while True:
                    msg = await asyncio.wait_for(ws.recv(), timeout=15)
                    print("RECV:", msg)
                    try:
                        data = json.loads(msg)
                        if data.get("type") == "done":
                            print("Received done event. Closing.")
                            break
                    except Exception:
                        pass
            except asyncio.TimeoutError:
                print("Timed out waiting for messages (15s). Closing.")
    except Exception as e:
        print("Connection error:", repr(e))

if __name__ == '__main__':
    asyncio.run(run())
