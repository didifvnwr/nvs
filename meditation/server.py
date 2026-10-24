#!/usr/bin/env python3
"""ממשק אינטרנט מקומי למחולל המדיטציות. הרצה: python server.py  ואז http://localhost:8000"""
import json
import os
import re
import tempfile
import threading
import urllib.request
import uuid
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlparse

BASE = Path(__file__).parent
MUSIC_DIR = BASE / "music"
OUT_DIR = BASE / "output"
AUDIO_EXT = {".mp3", ".wav", ".m4a", ".ogg"}
DEFAULT_VOICE = ("uwHajH4FhtzVp6X17pr7", "שי (הקול החדש)")
MAX_UPLOAD = 100 * 1024 * 1024


def load_env():
    f = BASE / ".env"
    if f.exists():
        for line in f.read_text(encoding="utf-8").splitlines():
            if "=" in line and not line.lstrip().startswith("#"):
                k, v = line.split("=", 1)
                os.environ.setdefault(k.strip(), v.strip().strip("\"'"))


load_env()
import meditate  # noqa: E402  (אחרי טעינת .env)

JOBS = {}


def list_voices():
    voices = [{"id": DEFAULT_VOICE[0], "name": DEFAULT_VOICE[1]}]
    key = os.getenv("ELEVENLABS_API_KEY")
    if not key:
        return voices
    try:
        req = urllib.request.Request("https://api.elevenlabs.io/v1/voices", headers={"xi-api-key": key})
        with urllib.request.urlopen(req, timeout=20) as r:
            for v in json.load(r).get("voices", []):
                if v["voice_id"] != DEFAULT_VOICE[0]:
                    voices.append({"id": v["voice_id"], "name": v["name"]})
    except Exception as e:  # noqa: BLE001
        print("לא הצלחתי לטעון קולים:", e)
    return voices


def list_music():
    MUSIC_DIR.mkdir(exist_ok=True)
    return sorted(p.name for p in MUSIC_DIR.iterdir() if p.suffix.lower() in AUDIO_EXT)


def safe_name(name):
    name = re.sub(r"[^\w.\- ]", "_", Path(name).name, flags=re.UNICODE)
    return name or "music.mp3"


def run_job(job_id, text, voice, music, music_db):
    job = JOBS[job_id]
    try:
        OUT_DIR.mkdir(exist_ok=True)
        out = OUT_DIR / f"{job_id}.mp3"
        with tempfile.TemporaryDirectory() as d:
            track = meditate.build_voice_track(
                meditate.split_script(text), voice, Path(d),
                progress=lambda m: job.update(status=m))
            if music:
                job["status"] = "מערבב עם מוזיקה..."
                meditate.mix(track, MUSIC_DIR / music, out, music_db=music_db)
            else:
                meditate.ffmpeg("-i", str(track), "-b:a", "192k", str(out))
        (OUT_DIR / f"{job_id}.txt").write_text(text, encoding="utf-8")
        job.update(done=True, status="מוכן", file=f"/output/{out.name}")
    except Exception as e:  # noqa: BLE001
        job.update(done=True, error=str(e), status="נכשל")


class Handler(BaseHTTPRequestHandler):
    def log_message(self, *a):
        pass

    def send_json(self, obj, code=200):
        body = json.dumps(obj, ensure_ascii=False).encode()
        self.send_response(code)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def send_file(self, path, ctype):
        if not path.is_file():
            return self.send_json({"error": "not found"}, 404)
        data = path.read_bytes()
        self.send_response(200)
        self.send_header("Content-Type", ctype)
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def body(self):
        return self.rfile.read(int(self.headers.get("Content-Length", 0)))

    def do_GET(self):
        path = unquote(urlparse(self.path).path)
        if path == "/":
            return self.send_file(BASE / "index.html", "text/html; charset=utf-8")
        if path == "/api/config":
            return self.send_json({
                "anthropic": bool(os.getenv("ANTHROPIC_API_KEY")),
                "elevenlabs": bool(os.getenv("ELEVENLABS_API_KEY")),
                "voices": list_voices(), "music": list_music()})
        if path.startswith("/api/job/"):
            return self.send_json(JOBS.get(path.rsplit("/", 1)[1], {"error": "unknown job"}))
        if path.startswith("/music/") or path.startswith("/output/"):
            root = MUSIC_DIR if path.startswith("/music/") else OUT_DIR
            f = root / Path(path).name
            ctype = "audio/wav" if f.suffix == ".wav" else "audio/mpeg"
            return self.send_file(f, ctype)
        self.send_json({"error": "not found"}, 404)

    def do_POST(self):
        path = urlparse(self.path).path
        try:
            if path == "/api/upload":
                if int(self.headers.get("Content-Length", 0)) > MAX_UPLOAD:
                    return self.send_json({"error": "הקובץ גדול מדי"}, 413)
                name = safe_name(unquote(self.headers.get("X-Filename", "music.mp3")))
                if Path(name).suffix.lower() not in AUDIO_EXT:
                    return self.send_json({"error": "סוג קובץ לא נתמך"}, 400)
                MUSIC_DIR.mkdir(exist_ok=True)
                (MUSIC_DIR / name).write_bytes(self.body())
                return self.send_json({"name": name})
            data = json.loads(self.body() or b"{}")
            if path == "/api/script":
                text = meditate.write_script(
                    data["prompt"], float(data.get("minutes", 10)), data.get("kind", "meditation"))
                return self.send_json({"text": text})
            if path == "/api/produce":
                music = data.get("music") or None
                if music and music not in list_music():
                    return self.send_json({"error": "מוזיקה לא נמצאה"}, 400)
                job_id = uuid.uuid4().hex[:10]
                JOBS[job_id] = {"done": False, "status": "מתחיל..."}
                threading.Thread(target=run_job, daemon=True, args=(
                    job_id, data["text"], data.get("voice") or DEFAULT_VOICE[0], music,
                    float(data.get("music_db", -14)))).start()
                return self.send_json({"job": job_id})
        except KeyError as e:
            return self.send_json({"error": f"חסר מפתח סביבה או שדה: {e}"}, 400)
        except Exception as e:  # noqa: BLE001
            return self.send_json({"error": str(e)}, 500)
        self.send_json({"error": "not found"}, 404)


if __name__ == "__main__":
    port = int(os.getenv("PORT", 8000))
    print(f"פתח/י בדפדפן: http://localhost:{port}")
    ThreadingHTTPServer(("127.0.0.1", port), Handler).serve_forever()
