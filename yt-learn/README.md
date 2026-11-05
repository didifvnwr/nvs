# YT Learn

הדבק קישור יוטיוב ← הורדת אודיו (yt-dlp) ← תמלול מקומי (faster-whisper) ← למידה עם Claude:
סיכום, נקודות מפתח, פרקים, מילון מונחים, כרטיסיות, בוחן, ושאלות על הסרטון.

## הרצה
```bash
pip install -r requirements.txt   # נדרש ffmpeg מותקן
export ANTHROPIC_API_KEY=sk-ant-...   # לשלב הלמידה (בלי זה מקבלים תמלול בלבד)
python app.py                     # http://localhost:5000
```
משתני סביבה: `WHISPER_MODEL` (ברירת מחדל `small`; `base` מהיר יותר, `large-v3` מדויק יותר), `CLAUDE_MODEL`, `PORT`.
