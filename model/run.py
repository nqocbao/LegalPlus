import torch
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from transformers import AutoTokenizer, AutoModelForCausalLM, BitsAndBytesConfig
from peft import PeftModel
import uvicorn
import os

SCRIPT_DIR = os.path.dirname(os.path.abspath(__file__))
ADAPTER_PATH = SCRIPT_DIR
BASE_MODEL_ID = "unsloth/llama-3.2-3b-instruct-bnb-4bit"

if not os.path.exists(ADAPTER_PATH):
    if not os.path.exists(os.path.join(SCRIPT_DIR, "adapter_config.json")):
        print(f"❌ ERROR: Không tìm thấy thư mục model tại: {ADAPTER_PATH}")
        exit(1)
    ADAPTER_PATH = SCRIPT_DIR

app = FastAPI(title="My Traffic Law AI")

class QuestionRequest(BaseModel):
    question: str
    context: str = ""

model = None
tokenizer = None

@app.on_event("startup")
async def load_model():
    global model, tokenizer
    tokenizer = AutoTokenizer.from_pretrained(ADAPTER_PATH)
    print("⏳ Đang tải Base Model (8-bit)...")

    print("Adapter path:", ADAPTER_PATH)
    print("Files:", os.listdir(ADAPTER_PATH))
    print("Tokenizer class:", type(tokenizer))
    
    bnb_config = BitsAndBytesConfig(
        load_in_4bit=True,
        bnb_4bit_compute_dtype=torch.float16,
    )

    base_model = AutoModelForCausalLM.from_pretrained(
        BASE_MODEL_ID,
        quantization_config=bnb_config,
        device_map="auto",
        trust_remote_code=True,
        low_cpu_mem_usage=True,
    )

    print("⏳ Đang ghép Adapter...")
    model = PeftModel.from_pretrained(base_model, ADAPTER_PATH)
    print("✅ Model Ready!")

@app.post("/generate")
async def generate_answer(request: QuestionRequest):
    if not model:
        raise HTTPException(status_code=503, detail="Model Loading...")

    messages = [
    {
        "role": "system",
        "content": (
            "Bạn là trợ lý pháp lý giao thông Việt Nam. "
            "Nhiệm vụ: Giải thích và áp dụng các quy định pháp luật giao thông đường bộ Việt Nam "
            "một cách ngắn gọn, dễ hiểu, nêu rõ điều kiện áp dụng và mức xử phạt (nếu có). "
            "Nếu không chắc chắn hoặc luật không quy định rõ, hãy trả lời: "
            "\"Tôi không tìm thấy quy định phù hợp\" và khuyến nghị người dùng hỏi cơ quan chức năng."
        ),
    },
    {
        "role": "user",
        "content": (
            f"Câu hỏi của tôi về luật giao thông Việt Nam: {request.question}\n\n"
            f"Thông tin bổ sung (nếu có): {request.context}"
        ),
    },
    ]


    input_ids = tokenizer.apply_chat_template(
        messages,
        add_generation_prompt=True,
        return_tensors="pt"
    ).to("cuda")

    terminators = [
        tokenizer.eos_token_id,
        tokenizer.convert_tokens_to_ids("<|eot_id|>")
    ]

    outputs = model.generate(
        input_ids,
        max_new_tokens=512,
        temperature=0.3,
        top_p=0.9,
        repetition_penalty=1.1,
        eos_token_id=terminators,
        pad_token_id=tokenizer.eos_token_id,
        do_sample=True
    )
    
    response_text = tokenizer.decode(outputs[0][input_ids.shape[-1]:], skip_special_tokens=True)

    return {"answer": response_text.strip()}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)