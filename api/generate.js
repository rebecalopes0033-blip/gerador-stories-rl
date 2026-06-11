export default async function handler(req, res) {
    if (req.method !== 'POST') {
          return res.status(405).json({ error: 'Método não permitido' });
    }

  const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
          return res.status(500).json({ error: 'Chave da API não configurada no servidor.' });
    }

  const { prompt, systemPrompt } = req.body;
    if (!prompt) {
          return res.status(400).json({ error: 'Prompt ausente.' });
    }

  try {
        const body = {
                contents: [{ role: 'user', parts: [{ text: prompt }] }],
                generationConfig: { maxOutputTokens: 2000 }
        };
        if (systemPrompt) {
                body.systemInstruction = { parts: [{ text: systemPrompt }] };
        }

      const response = await fetch(
              `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(body)
        }
            );

      const data = await response.json();

      if (!response.ok) {
              return res.status(response.status).json({ error: data?.error?.message || 'Erro na API.' });
      }

      const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        return res.status(200).json({ content: [{ text }] });
  } catch (err) {
        return res.status(500).json({ error: err.message });
  }
}
