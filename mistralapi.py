from mistralai.client import MistralClient
from mistralai.models import DeltaMessage
import sys
import os

def mistralapi(message):
    client = MistralClient(api_key="L9hMCFF2pCsgW7jyffojIN4NMmIaol5P")
    messages = [
        ChatMessage(role='user', content=message)
    ]

    chat_response = client.chat(
        model='mistral-small',
        messages=messages,
    )
    print(chat_response.choices[0].message.content)
    sys.stdout.flush()


if __name__ == '__main__':
    finalInput = sys.stdin.read().strip()
    mistralapi(finalInput)




