
from transformers import AutoModelForCausalLM, AutoTokenizer
import torch
from transformers import TextIteratorStreamer
from threading import Thread
from flask_socketio import emit
# Khởi tạo model và tokenizer
model_name = "Sailor0.5B2/checkpoints/Sailor_0.5B_Finetune_LoRA/checkpoint-340"
tokenizer = AutoTokenizer.from_pretrained(model_name)
model = AutoModelForCausalLM.from_pretrained(model_name, torch_dtype=torch.float16)

# Di chuyển model sang GPU nếu có
device = "cuda" if torch.cuda.is_available() else "cpu"
model = model.to(device)
# messages = [
#     {"role": "system", "content": "Bạn là một trợ lí ảo."}
# ]
# messages.append({"role": "system", "content": "Bạn là một trợ lí ảo. Tên của bạn là 13Bee (Một Ba Bi). Bạn được sinh ra ngày 01/10/2024. Hãy trả lời một cách ngắn gọn. Nếu không biết thì trả lời là 'Tôi không biết', đừng cố trả lời."})
def askModel(messages, idSocket):
    # Chuẩn bị chat template
    # messages.append({"role": "user", "content": prompt})
    # print(messages)
    # print("")
    chat_template = tokenizer.apply_chat_template(messages, tokenize=False)
    
    # Tokenize input
    inputs = tokenizer(chat_template, return_tensors="pt").to(device)
    
    # Khởi tạo streamer
    streamer = TextIteratorStreamer(tokenizer, skip_prompt=True, skip_special_tokens=True)
    
    # Chuẩn bị generation arguments
    generation_kwargs = dict(
        **inputs,
        max_new_tokens=512,
        do_sample=True,
        temperature=0.7,
        top_k=75,
        top_p=0.85,
        # num_return_sequences=1,
        eos_token_id=tokenizer.eos_token_id,
        pad_token_id=tokenizer.pad_token_id,
        streamer=streamer
    )
    
    # Tạo thread cho việc generation
    thread = Thread(target=model.generate, kwargs=generation_kwargs)
    thread.start()
    
    # In từng token được sinh ra trong main thread
    print("\n\n")
    generated_text = ""
    for new_text in streamer:
        print(new_text, end="", flush=True)
        generated_text += new_text
        # return generated_text
    
    thread.join()  # Đợi thread generation hoàn thành
    
    # print("\n" + "-"*50)
    # print("Full generated text:", generated_text)
    # messages.append({"role": "answer", "content": generated_text})
    # print(messages)
    print("\n\n")
    return generated_text

# Vòng lặp chính để tương tác
# while True:
#     user_input = input("\nNhập câu hỏi của bạn (hoặc 'quit' để thoát): ")
#     if user_input.lower() == 'quit':
#         break
    
#     # print("\nĐang generate câu trả lời...")
#     text = generate_with_streaming(user_input)
#     # print(text)
        

