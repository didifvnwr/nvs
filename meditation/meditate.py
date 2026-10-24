#!/usr/bin/env python3
"""מחולל מדיטציות: טקסט (Claude) -> הקלטה (ElevenLabs) -> מיקס עם מוזיקה (ffmpeg).

שימוש:
    python meditate.py "מדיטציה לשחרור מלחץ אחרי יום עבודה" --minutes 10 --music music/calm.mp3
"""
import argparse
import json
import os
import re
import subprocess
import sys
import tempfile
import urllib.request
from pathlib import Path

CLAUDE_MODEL = os.getenv("CLAUDE_MODEL", "claude-sonnet-5-5")
TTS_MODEL = os.getenv("ELEVENLABS_MODEL", "eleven_multilingual_v2")
WORDS_PER_MINUTE = 100  # קצב דיבור איטי של מדיטציה, לא כולל הפסקות

SYSTEM_PROMPT = """את/ה כותב/ת מדיטציות מודרכות מקצועיות.
כתוב/י את הטקסט בשפה המבוקשת, בקול רגוע, חם ופשוט, בגוף שני.
כללים:
- פלט: טקסט להקראה בלבד. בלי כותרות, בלי הערות במאי, בלי אימוג'ים, בלי כוכביות.
- משפטים קצרים. בין קטעים מסמן/ת הפסקות שקט בשורה נפרדת בפורמט [הפסקה N] כש-N הוא מספר שניות (2 עד 20).
- מבנה: פתיחה והתיישבות, נשימות, גוף הליווי המרכזי לפי הנושא, חזרה הדרגתית ופרידה.
- אל תכתוב/י מילים באנגלית ואל תשתמש/י בקיצורים או במספרים בספרות; כתוב/י הכול במילים כדי שההקראה תהיה נכונה.
"""

PAUSE_RE = re.compile(r"\[\s*הפסקה\s+(\d+(?:\.\d+)?)\s*\]")


def http_json(url, payload, headers):
    req = urllib.request.Request(url, json.dumps(payload).encode(), headers, method="POST")
    with urllib.request.urlopen(req, timeout=300) as r:
        return r.read()


def write_script(prompt, minutes):
    key = os.environ["ANTHROPIC_API_KEY"]
    words = int(minutes * WORDS_PER_MINUTE * 0.7)  # ~30% מהזמן הוא שקט
    user = (f"בקשה: {prompt}\nאורך יעד: כ-{minutes} דקות. "
            f"כ-{words} מילים של דיבור, והשאר הפסקות שקט.")
    out = http_json(
        "https://api.anthropic.com/v1/messages",
        {"model": CLAUDE_MODEL, "max_tokens": 8000, "system": SYSTEM_PROMPT,
         "messages": [{"role": "user", "content": user}]},
        {"x-api-key": key, "anthropic-version": "2023-06-01", "content-type": "application/json"},
    )
    return json.loads(out)["content"][0]["text"].strip()


def split_script(text):
    """מחזיר רשימה של ('speech', טקסט) / ('pause', שניות)."""
    parts, pos = [], 0
    for m in PAUSE_RE.finditer(text):
        chunk = text[pos:m.start()].strip()
        if chunk:
            parts.append(("speech", chunk))
        parts.append(("pause", float(m.group(1))))
        pos = m.end()
    tail = text[pos:].strip()
    if tail:
        parts.append(("speech", tail))
    return parts


def tts(text, voice_id, out_path, prev=None, nxt=None):
    key = os.environ["ELEVENLABS_API_KEY"]
    payload = {
        "text": text,
        "model_id": TTS_MODEL,
        "voice_settings": {"stability": 0.75, "similarity_boost": 0.8, "style": 0.0, "speed": 0.9},
    }
    if prev:
        payload["previous_text"] = prev[-300:]
    if nxt:
        payload["next_text"] = nxt[:300]
    audio = http_json(
        f"https://api.elevenlabs.io/v1/text-to-speech/{voice_id}?output_format=mp3_44100_128",
        payload,
        {"xi-api-key": key, "content-type": "application/json", "accept": "audio/mpeg"},
    )
    Path(out_path).write_bytes(audio)


def ffmpeg(*args):
    subprocess.run(["ffmpeg", "-y", "-loglevel", "error", *args], check=True)


def build_voice_track(parts, voice_id, workdir):
    """מקליט כל קטע דיבור, מוסיף שקט להפסקות, ומחבר לקובץ אחד."""
    files = []
    for i, (kind, val) in enumerate(parts):
        f = workdir / f"{i:03d}.wav"
        if kind == "speech":
            mp3 = workdir / f"{i:03d}.mp3"
            prev = next((v for k, v in reversed(parts[:i]) if k == "speech"), None)
            nxt = next((v for k, v in parts[i + 1:] if k == "speech"), None)
            print(f"  מקליט קטע {i + 1}/{len(parts)} ({len(val.split())} מילים)")
            tts(val, voice_id, mp3, prev, nxt)
            ffmpeg("-i", str(mp3), "-ar", "44100", "-ac", "2", str(f))
        else:
            ffmpeg("-f", "lavfi", "-i", "anullsrc=r=44100:cl=stereo", "-t", str(val), str(f))
        files.append(f)
    listing = workdir / "list.txt"
    listing.write_text("".join(f"file '{p}'\n" for p in files))
    voice = workdir / "voice.wav"
    ffmpeg("-f", "concat", "-safe", "0", "-i", str(listing), "-c", "copy", str(voice))
    return voice


def duration(path):
    out = subprocess.check_output(
        ["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(path)])
    return float(out)


def mix(voice, music, out_path, lead_in=6.0, tail=10.0, music_db=-14):
    """מוזיקה בלופ מתחת לקול (עם הנמכה אוטומטית בזמן דיבור), פייד אין/אאוט."""
    total = lead_in + duration(voice) + tail
    fade_out_start = max(total - 8, 0)
    graph = (
        f"[0:a]adelay={int(lead_in * 1000)}|{int(lead_in * 1000)},apad,asplit=2[v][vsc];"
        f"[1:a]volume={music_db}dB,afade=t=in:d=4[m];"
        f"[m][vsc]sidechaincompress=threshold=0.02:ratio=6:attack=200:release=1200[ducked];"
        f"[v][ducked]amix=inputs=2:duration=first:normalize=0,"
        f"afade=t=out:st={fade_out_start}:d=8,atrim=0:{total},loudnorm=I=-18:TP=-1.5[out]"
    )
    ffmpeg("-i", str(voice), "-stream_loop", "-1", "-i", str(music),
           "-filter_complex", graph, "-map", "[out]", "-b:a", "192k", str(out_path))


def main():
    ap = argparse.ArgumentParser(description="מחולל מדיטציות לפי דרישה")
    ap.add_argument("prompt", help="על מה המדיטציה (נושא, מטרה, קהל, סגנון)")
    ap.add_argument("--minutes", type=float, default=10)
    ap.add_argument("--music", help="קובץ מוזיקת רקע (mp3/wav). ברירת מחדל: הראשון בתיקיית music/")
    ap.add_argument("--voice", default=os.getenv("ELEVENLABS_VOICE_ID"), help="ElevenLabs voice_id")
    ap.add_argument("--out", default="output/meditation.mp3")
    ap.add_argument("--script-only", action="store_true", help="רק לכתוב את הטקסט, בלי הקלטה")
    ap.add_argument("--script-file", help="להשתמש בטקסט קיים במקום לכתוב חדש")
    args = ap.parse_args()

    out = Path(args.out)
    out.parent.mkdir(parents=True, exist_ok=True)

    if args.script_file:
        text = Path(args.script_file).read_text(encoding="utf-8")
    else:
        print("כותב טקסט...")
        text = write_script(args.prompt, args.minutes)
    script_path = out.with_suffix(".txt")
    script_path.write_text(text, encoding="utf-8")
    print(f"הטקסט נשמר ב-{script_path}")
    if args.script_only:
        return

    if not args.voice:
        sys.exit("חסר voice_id: --voice או משתנה סביבה ELEVENLABS_VOICE_ID")
    music = args.music or next(iter(sorted(Path(__file__).parent.glob("music/*.[mw][pa][3v]"))), None)
    if not music:
        sys.exit("לא נמצאה מוזיקה: שים/י קובץ בתיקיית music/ או השתמש/י ב---music")

    with tempfile.TemporaryDirectory() as d:
        work = Path(d)
        print("מקליט עם ElevenLabs...")
        voice = build_voice_track(split_script(text), args.voice, work)
        print("מערבב עם מוזיקה...")
        mix(voice, music, out)
    print(f"מוכן: {out}")


if __name__ == "__main__":
    main()
