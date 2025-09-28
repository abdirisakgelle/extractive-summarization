import os, json, regex as re
from typing import List, Optional
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from dotenv import load_dotenv
import torch
from transformers import AutoTokenizer, AutoModelForSequenceClassification
import uvicorn

# Load config
load_dotenv()
ARTIFACTS = os.getenv("ARTIFACTS_DIR", "artifacts/afriberta_extractive_v1")
DEVICE = "cuda" if torch.cuda.is_available() else "cpu"
ALLOWED_ORIGINS = [o.strip() for o in os.getenv("ALLOWED_ORIGINS","").split(",") if o.strip()]

with open(f"{ARTIFACTS}/inference_config.json") as f:
    INF_CFG = json.load(f)

tokenizer = AutoTokenizer.from_pretrained(ARTIFACTS)
model = AutoModelForSequenceClassification.from_pretrained(ARTIFACTS).to(DEVICE)
model.eval()

# FastAPI app
app = FastAPI(title="Extractive Summarization API")
if ALLOWED_ORIGINS:
    app.add_middleware(
        CORSMiddleware,
        allow_origins=ALLOWED_ORIGINS,
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )

SENT_SPLIT = re.compile(r'(?:\r?\n|\r)+|(?<=[\.\?\!۔።])\s+')

class SummarizeIn(BaseModel):
    text: str
    top_k: Optional[int] = None
    threshold: Optional[float] = None

class SummarizeOut(BaseModel):
    summary: str

@torch.inference_mode()
def score_sentences(sentences: List[str]) -> List[float]:
    scores = []
    batch_size = 16
    max_len = int(INF_CFG.get("max_input_tokens", 2048))
    for i in range(0, len(sentences), batch_size):
        batch = sentences[i:i+batch_size]
        enc = tokenizer(batch, padding=True, truncation=True, max_length=max_len, return_tensors="pt")
        enc = {k: v.to(DEVICE) for k, v in enc.items()}
        out = model(**enc)
        if out.logits.ndim == 2 and out.logits.size(-1) == 2:
            probs = torch.softmax(out.logits, dim=-1)[:, 1]
        else:
            probs = torch.sigmoid(out.logits.squeeze(-1))
        scores.extend(probs.detach().cpu().tolist())
    return scores

@app.post("/summarize", response_model=SummarizeOut)
def summarize(payload: SummarizeIn):
    sentences = [s.strip() for s in SENT_SPLIT.split(payload.text) if s.strip()] or [payload.text.strip()]
    if len(sentences) < 2 and len(sentences[0]) > 200:
        alt_split = re.split(r'[؛;:,،،,·・\u2022\u2023\u2043\u2219\-\–\—]\s+', sentences[0])
        sentences = [s.strip() for s in alt_split if s.strip()] or sentences
    scores = score_sentences(sentences)
    top_k = payload.top_k or INF_CFG["selection"]["top_k"]
    thr = payload.threshold if payload.threshold is not None else INF_CFG["selection"]["threshold"]

    ranked = sorted(list(enumerate(scores)), key=lambda x: x[1], reverse=True)[:max(1, top_k)]
    keep = [i for i, sc in ranked if sc >= thr] or [i for i, _ in ranked]
    keep_sorted = sorted(keep)
    summary = " ".join([sentences[i] for i in keep_sorted])
    return SummarizeOut(summary=summary)

@app.get("/healthz")
def healthz():
    return {"status": "ok", "device": DEVICE}

if __name__ == "__main__":
    port_str = os.getenv("PORT", "8000")
    try:
        port = int(port_str)
    except ValueError:
        port = 8000
    uvicorn.run("server:app", host="0.0.0.0", port=port, reload=False)
