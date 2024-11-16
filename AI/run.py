from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from transformers import TextIteratorStreamer
from threading import Thread
from flask_socketio import emit  # Đảm bảo `emit` từ SocketIO được import để gửi tin nhắn realtime

# Khởi tạo model và tokenizer
model_name = "checkpoint-340"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.float16)

# Di chuyển model sang GPU nếu có
device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)

def askModel(messages, idSocket, socketio):  # Thêm socketio vào tham số
    try:
        chat_template = tokenizer.apply_chat_template(messages, tokenize=False)
        
        # Tokenize input
        inputs = tokenizer(chat_template, return_tensors="pt").to(device)
        
        # Initialize streamer for streaming generation
        streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)
        
        # Set up generation arguments
        generation_kwargs = dict(
            **inputs,
            max_new_tokens=512,
            do_sample=True,
            temperature=0.7,
            top_k=75,
            top_p=0.85,
            eos_token_id=tokenizer.eos_token_id,
            pad_token_id=tokenizer.pad_token_id,
            streamer=streamer
        )
        
        # Thread to handle generation without blocking
        thread = Thread(target=model.generate, kwargs=generation_kwargs)
        thread.start()

        # Gửi từng new_text qua WebSocket
        for new_text in streamer:
            print(new_text, end="", flush=True)  # Log ra từng đoạn văn bản được tạo
            emit('receive_message', {
                "role": "answer",
                "content": new_text,
                "idSocket": idSocket,
                "can_answer": True
            }, room=idSocket)  # Gửi về WebSocket

        thread.join()  # Wait for the generation to complete

        return "Generation complete."
    except Exception as e:
        print(f"Error during text generation: {e}")
        emit('receive_message', {
            "role": "answer",
            "content": "Có lỗi xảy ra, vui lòng thử lại sau.",
            "idSocket": idSocket,
            "can_answer": False
        }, room=idSocket)
        return "Có lỗi xảy ra, vui lòng thử lại sau."
