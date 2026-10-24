# מחולל מדיטציות

בקשה חופשית -> Claude כותב טקסט -> ElevenLabs מקליט -> ffmpeg מערבב עם המוזיקה שלך.

## הגדרה
```
export ANTHROPIC_API_KEY=...
export ELEVENLABS_API_KEY=...
export ELEVENLABS_VOICE_ID=...   # voice_id מתוך ElevenLabs, רצוי קול עברי רגוע
```
דרוש `ffmpeg`. שים/י את קבצי המוזיקה בתיקיית `music/`.

## הרצה
```
python meditate.py "מדיטציה לשחרור מלחץ אחרי יום עבודה" --minutes 10 --music music/calm.mp3
python meditate.py "..." --script-only        # לבדיקת הטקסט לפני הקלטה (חוסך קרדיטים)
python meditate.py "..." --script-file output/meditation.txt   # הקלטה מטקסט שערכת
```
התוצאה: `output/meditation.mp3` ולצידה `output/meditation.txt`.

## איך זה עובד
- הטקסט כולל סימוני `[הפסקה N]`; כל קטע דיבור מוקלט בנפרד והשקטים נוצרים ב-ffmpeg (מדויק יותר מתגיות break).
- המוזיקה בלופ, מונמכת אוטומטית בזמן דיבור, עם פייד אין/אאוט ונרמול עוצמה.
