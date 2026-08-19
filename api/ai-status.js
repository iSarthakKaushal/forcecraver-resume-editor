const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

module.exports = (req, res) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
        provider: GROQ_API_KEY ? 'groq' : 'ollama',
        model: GROQ_API_KEY ? GROQ_MODEL : 'qwen2.5:latest',
        groqConfigured: !!GROQ_API_KEY,
        ollamaHost: OLLAMA_HOST
    }));
};
