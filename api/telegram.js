export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(200).end();
  if (req.method !== "POST") return res.status(405).send("Use POST");

  const { fan, model, prize, datetime, note, thread_id } = req.body || {};
  if (!fan || !model || !prize || !datetime) {
    return res.status(400).send("Missing fields");
  }

  const token = process.env.TG_BOT_TOKEN;
  const chatId = process.env.TG_CHAT_ID;

  if (!token || !chatId) return res.status(500).send("Server not configured");

  const lines = [
    "🎡 *Ruleta*",
    `👤 *Fan:* ${fan}`,
    `💃 *Modelo:* ${model}`,
    `🏆 *Premio:* ${prize}`,
    `🕒 *Fecha:* ${datetime}`,
    note ? `📝 *Nota:* ${note}` : null,
  ].filter(Boolean);

  const payload = {
    chat_id: chatId,
    text: lines.join("\n"),
    parse_mode: "Markdown",
  };

  if (thread_id) payload.message_thread_id = Number(thread_id);

  const r = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  if (!r.ok) {
    const t = await r.text();
    return res.status(500).send(t);
  }

  return res.status(200).json({ ok: true });
}
