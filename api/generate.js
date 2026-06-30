export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Chave da API não configurada no servidor.' });
  }

  const { prompt, systemPrompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Prompt ausente.' });
  }

  try {
    const body = {
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }]
    };

    if (systemPrompt) {
      body.system = systemPrompt;
    }

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(body)
    });

    const rawText = await response.text();

    let data;
    try {
      data = JSON.parse(rawText);
    } catch {
      return res.status(500).json({ error: `Resposta inválida da API: ${rawText.slice(0, 200)}` });
    }

    if (!response.ok) {
      return res.status(response.status).json({ error: data?.error?.message || 'Erro na API.' });
    }

    // Anthropic retorna: { content: [{ type: 'text', text: '...' }] }
    // O frontend lê: data.content?.[0]?.text — funciona direto
    return res.status(200).json({ content: data.content });

  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
