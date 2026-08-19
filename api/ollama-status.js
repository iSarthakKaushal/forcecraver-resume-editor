const https = require('https');
const http = require('http');

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

    if (GROQ_API_KEY) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            status: 'online',
            provider: 'groq',
            models: [{ name: GROQ_MODEL }]
        }));
        return;
    }

    try {
        const urlObj = new URL(OLLAMA_HOST);
        const transport = urlObj.protocol === 'https:' ? https : http;
        const oReq = transport.request(`${OLLAMA_HOST}/api/tags`, { method: 'GET', timeout: 4000 }, (oRes) => {
            let data = '';
            oRes.on('data', chunk => data += chunk);
            oRes.on('end', () => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        });
        oReq.on('error', (err) => {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'offline', error: err.message }));
        });
        oReq.on('timeout', () => {
            oReq.destroy();
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'offline', error: 'Ollama connection timed out' }));
        });
        oReq.end();
    } catch (e) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ status: 'offline', error: e.message }));
    }
};
