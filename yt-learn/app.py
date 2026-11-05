"""YT Learn - הורדה, תמלול ולמידה מסרטוני יוטיוב.

pipeline: yt-dlp (הורדת אודיו) -> faster-whisper (תמלול מקומי) -> Claude (סיכום, כרטיסיות, בוחן, שאלות)
"""
import json
import os
import re
import threading
import traceback
import uuid
from pathlib import Path

from flask import Flask, abort, jsonify, request, send_from_directory

BASE = Path(__file__).parent
DATA = BASE / "data"
DATA.mkdir(exist_ok=True)

WHISPER_MODEL = os.environ.get("WHISPER_MODEL", "small")
CLAUDE_MODEL = os.environ.get("CLAUDE_MODEL", "claude-sonnet-5-5")
MAX_TRANSCRIPT_CHARS = 400_000

app = Flask(__name__, static_folder="static", static_url_path="/static")
jobs: dict[str, dict] = {}
_whisper = None
_whisper_lock = threading.Lock()


# ---------- עזרים ----------
def job_dir(jid: str) -> Path:
    if not re.fullmatch(r"[0-9a-f]{12}", jid):
        abort(404)
    return DATA / jid


def save(jid: str, name: str, obj) -> None:
    (DATA / jid / name).write_text(json.dumps(obj, ensure_ascii=False, indent=2), encoding="utf-8")


def load(jid: str, name: str):
    p = job_dir(jid) / name
    return json.loads(p.read_text(encoding="utf-8")) if p.exists() else None


def set_status(jid: str, stage: str, msg: str, progress: float | None = None, **extra) -> None:
    j = jobs[jid]
    j.update(stage=stage, message=msg, **extra)
    if progress is not None:
        j["progress"] = progress


def fmt_ts(sec: float) -> str:
    sec = int(sec)
    h, r = divmod(sec, 3600)
    m, s = divmod(r, 60)
    return f"{h}:{m:02d}:{s:02d}" if h else f"{m:02d}:{s:02d}"


# ---------- שלב 1: הורדה ----------
def download(jid: str, url: str) -> dict:
    import yt_dlp

    out = DATA / jid

    def hook(d):
        if d["status"] == "downloading":
            total = d.get("total_bytes") or d.get("total_bytes_estimate") or 0
            if total:
                set_status(jid, "download", "מוריד את הסרטון...", 0.05 + 0.25 * d["downloaded_bytes"] / total)

    opts = {
        "format": "bestaudio/best",
        "outtmpl": str(out / "audio.%(ext)s"),
        "noplaylist": True,
        "quiet": True,
        "no_warnings": True,
        "progress_hooks": [hook],
        "postprocessors": [
            {"key": "FFmpegExtractAudio", "preferredcodec": "mp3", "preferredquality": "128"}
        ],
    }
    with yt_dlp.YoutubeDL(opts) as ydl:
        info = ydl.extract_info(url, download=True)
    meta = {
        "title": info.get("title"),
        "channel": info.get("uploader"),
        "duration": info.get("duration"),
        "url": url,
        "thumbnail": info.get("thumbnail"),
    }
    save(jid, "meta.json", meta)
    return meta


# ---------- שלב 2: תמלול ----------
def get_whisper():
    global _whisper
    with _whisper_lock:
        if _whisper is None:
            from faster_whisper import WhisperModel

            _whisper = WhisperModel(WHISPER_MODEL, device="auto", compute_type="auto")
        return _whisper


def transcribe(jid: str, duration: float | None) -> dict:
    audio = DATA / jid / "audio.mp3"
    set_status(jid, "transcribe", f"טוען מודל תמלול ({WHISPER_MODEL})...", 0.32)
    model = get_whisper()
    segments_iter, info = model.transcribe(str(audio), vad_filter=True, beam_size=5)
    segs = []
    for s in segments_iter:
        segs.append({"start": round(s.start, 2), "end": round(s.end, 2), "text": s.text.strip()})
        if duration:
            set_status(jid, "transcribe", "מתמלל...", 0.35 + 0.4 * min(s.end / duration, 1))
    result = {
        "language": info.language,
        "segments": segs,
        "text": " ".join(s["text"] for s in segs),
    }
    save(jid, "transcript.json", result)
    return result


# ---------- שלב 3: למידה (Claude) ----------
def claude():
    import anthropic

    return anthropic.Anthropic()  # קורא את ANTHROPIC_API_KEY מהסביבה


def timestamped(transcript: dict) -> str:
    text = "\n".join(f"[{fmt_ts(s['start'])}] {s['text']}" for s in transcript["segments"])
    return text[:MAX_TRANSCRIPT_CHARS]


def extract_json(text: str):
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text)
    start = text.find("{")
    end = text.rfind("}")
    return json.loads(text[start : end + 1])


LEARN_PROMPT = """להלן תמלול של סרטון. הכן חומר לימוד מלא בעברית (שמור מונחים מקצועיים/שמות באנגלית כשזה טבעי יותר).
התבסס אך ורק על התמלול. החזר JSON תקין בלבד, בלי טקסט נוסף, במבנה הבא:
{{
  "summary": "סיכום של 1-2 פסקאות",
  "key_points": [{{"point": "...", "time": "mm:ss"}}],
  "chapters": [{{"title": "...", "time": "mm:ss", "summary": "משפט-שניים"}}],
  "glossary": [{{"term": "...", "definition": "..."}}],
  "flashcards": [{{"q": "...", "a": "..."}}],
  "quiz": [{{"q": "...", "options": ["...","...","...","..."], "answer": 0, "explanation": "..."}}],
  "study_tips": ["..."]
}}
כמויות: 6-12 נקודות מפתח, פרקים לפי מבנה הסרטון, 8-15 כרטיסיות, 6-10 שאלות אמריקאיות (answer = אינדקס התשובה הנכונה, החל מ-0).

כותרת: {title}
תמלול:
{transcript}"""


def learn(jid: str, meta: dict, transcript: dict) -> dict:
    set_status(jid, "learn", "לומד את הסרטון: סיכום, כרטיסיות ובוחן...", 0.8)
    resp = claude().messages.create(
        model=CLAUDE_MODEL,
        max_tokens=8000,
        messages=[
            {
                "role": "user",
                "content": LEARN_PROMPT.format(title=meta.get("title"), transcript=timestamped(transcript)),
            }
        ],
    )
    data = extract_json("".join(b.text for b in resp.content if b.type == "text"))
    save(jid, "learn.json", data)
    return data


# ---------- ניהול משימה ----------
def run_job(jid: str, url: str) -> None:
    try:
        (DATA / jid).mkdir(exist_ok=True)
        set_status(jid, "download", "מתחיל הורדה...", 0.05)
        meta = download(jid, url)
        set_status(jid, "transcribe", "הורדה הסתיימה", 0.3, title=meta["title"])
        tr = transcribe(jid, meta.get("duration"))
        set_status(jid, "transcribed", "התמלול מוכן", 0.78)
        if os.environ.get("ANTHROPIC_API_KEY"):
            learn(jid, meta, tr)
        else:
            set_status(jid, "done", "התמלול מוכן. לא הוגדר ANTHROPIC_API_KEY ולכן שלב הלמידה דולג.", 1.0)
            jobs[jid]["done"] = True
            return
        set_status(jid, "done", "הכול מוכן!", 1.0)
        jobs[jid]["done"] = True
    except Exception as e:  # noqa: BLE001
        traceback.print_exc()
        set_status(jid, "error", f"שגיאה: {e}")
        jobs[jid]["error"] = True


@app.post("/api/jobs")
def create_job():
    url = (request.json or {}).get("url", "").strip()
    if not re.match(r"https?://", url):
        return jsonify(error="נא להדביק קישור תקין"), 400
    jid = uuid.uuid4().hex[:12]
    jobs[jid] = {"id": jid, "stage": "queued", "message": "בתור...", "progress": 0}
    threading.Thread(target=run_job, args=(jid, url), daemon=True).start()
    return jsonify(id=jid)


@app.get("/api/jobs/<jid>")
def job_status(jid):
    job_dir(jid)
    j = dict(jobs.get(jid) or {"id": jid, "stage": "done", "done": True, "progress": 1})
    j["meta"] = load(jid, "meta.json")
    if j.get("done") or j.get("stage") == "transcribed":
        j["transcript"] = load(jid, "transcript.json")
        j["learn"] = load(jid, "learn.json")
    return jsonify(j)


@app.get("/api/library")
def library():
    items = []
    for d in sorted(DATA.iterdir(), key=lambda p: p.stat().st_mtime, reverse=True):
        m = d / "meta.json"
        if m.exists() and (d / "transcript.json").exists():
            meta = json.loads(m.read_text(encoding="utf-8"))
            items.append({"id": d.name, "title": meta.get("title"), "duration": meta.get("duration")})
    return jsonify(items)


@app.get("/api/jobs/<jid>/audio")
def audio(jid):
    return send_from_directory(job_dir(jid), "audio.mp3")


@app.post("/api/jobs/<jid>/ask")
def ask(jid):
    q = (request.json or {}).get("question", "").strip()
    tr = load(jid, "transcript.json")
    if not tr or not q:
        return jsonify(error="אין תמלול או שאלה"), 400
    if not os.environ.get("ANTHROPIC_API_KEY"):
        return jsonify(error="חסר ANTHROPIC_API_KEY"), 400
    meta = load(jid, "meta.json") or {}
    resp = claude().messages.create(
        model=CLAUDE_MODEL,
        max_tokens=1500,
        system=(
            "אתה מורה פרטי. ענה בעברית על שאלות בהסתמך אך ורק על תמלול הסרטון. "
            "ציין חותמות זמן [mm:ss] רלוונטיות. אם התשובה לא בתמלול - אמור זאת.\n\n"
            f"כותרת: {meta.get('title')}\nתמלול:\n{timestamped(tr)}"
        ),
        messages=[{"role": "user", "content": q}],
    )
    return jsonify(answer="".join(b.text for b in resp.content if b.type == "text"))


@app.get("/")
def index():
    return send_from_directory(BASE / "static", "index.html")


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.environ.get("PORT", 5000)), threaded=True)
