// api/gsheet.js
// Vercel Serverless Function - proxy ל‑Google Apps Script עם CORS
export default async function handler(req, res) {
  const AS_URL = "https://script.google.com/macros/s/AKfycbz9UwCkg64Och-R4FyjLEhNMrXN2qDOyYn98JnT3qdY66lQBRgBIOH5vV_OAThGRDEksw/exec";

  // תמיכה ב‑OPTIONS (preflight)
  if (req.method === "OPTIONS") {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    return res.status(204).end();
  }

  try {
    // העתק את הבקשה ל‑Apps Script (GET/POST)
    const fetchOptions = {
      method: req.method === "POST" ? "POST" : "GET",
      headers: {}
    };

    // אם יש body (POST) – העבר אותו
    if (req.method === "POST" && req.body) {
      fetchOptions.body = JSON.stringify(req.body);
      fetchOptions.headers["Content-Type"] = "application/json";
    }

    const r = await fetch(AS_URL, fetchOptions);
    const text = await r.text();

    // החזר בדיוק את מה שה‑Apps Script החזיר, עם כותרות CORS
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS");
    res.setHeader("Content-Type", r.headers.get("content-type") || "application/json");
    // Cache קצר (אופציונלי) - תוכל לשנות או להסיר
    res.setHeader("Cache-Control", "s-maxage=30, stale-while-revalidate=60");

    return res.status(r.status).send(text);
  } catch (err) {
    console.error("proxy error:", err);
    res.setHeader("Access-Control-Allow-Origin", "*");
    return res.status(500).json({ ok: false, error: String(err) });
  }
}
