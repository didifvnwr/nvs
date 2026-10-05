# פריסה ל-Netlify (הוראות לסשן שיש לו `netlify` CLI מחובר)

## מה לפרוס
התיקייה `site/` (או ה-ZIP `nvs-tools-site.zip`, שהוא תוכן `site/` בדיוק). אתר סטטי, בלי build.

- `site/index.html` – מרכז כלים ואתרים
- `site/audio-editor/index.html` – עורך הקלטות למרכזיות
- `site/audio-editor/music/music-{1,2,3,10}.mp3` – ספריית המוזיקה (11MB)

## לאן
פרויקט **חדש וריק שכבר נוצר** בחשבון (צוות nvs): `nvs-tools-hub`
- Site ID: `dcaec4ef-cf00-4133-9cd0-7c0144d3d9f1`
- כתובת: https://nvs-tools-hub.netlify.app
- **לא** לפרוס לפרויקטים קיימים (במיוחד `hakol-hachadash` = nvs.co.il) בלי אישור המשתמש – זה ידרוס אתר חי.

## פקודה
```bash
git clone -b claude/charming-cannon-99lwd0 https://github.com/didifvnwr/nvs.git && cd nvs
netlify deploy --dir=site --site dcaec4ef-cf00-4133-9cd0-7c0144d3d9f1 --prod
```
(או: `netlify deploy --dir=<התיקייה שנפתחה מה-ZIP> --site ... --prod`)

## בדיקות אחרי הפריסה
1. `https://nvs-tools-hub.netlify.app/` נטען, רואים כרטיס גדול "עורך הקלטות למרכזיות".
2. `/audio-editor/` נטען, ובשלב 2 כתוב "אורך המוזיקה: … שניות" (כלומר המוזיקה נטענה מ-`music/`).
3. `https://nvs-tools-hub.netlify.app/audio-editor/music/music-1.mp3` מחזיר 200 עם `audio/mpeg`.
4. בדיקה מלאה: להעלות קובץ קריינות, לבחור קידוד μ-law, ללחוץ "צור קבצים" ולהוריד.
   אימות הקובץ: `ffprobe out.wav` צריך להראות `pcm_mulaw, 8000 Hz, 1 channels`.

## הערות
- הדף הראשי מציג קישורים לכל 15 האתרים בחשבון; שמות הכרטיסים נוחשו מהכתובות – לתקן ב-`site/index.html` לפי בקשת המשתמש.
- `.netlify.app` בלבד; חיבור דומיין (למשל `tools.nvs.co.il`) רק אם המשתמש מבקש.
