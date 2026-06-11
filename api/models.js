export default async function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'Chave não configurada' });
  const r = await fetch(
    'https://generativelanguage.googleapis.com/v1beta/models?key=' + apiKey
  );
  const text = await r.text();
  res.status(r.status).send(text);
}
