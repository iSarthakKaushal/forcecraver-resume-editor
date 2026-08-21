const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Helper to auto-load .env file without external dependencies
function loadEnvFile() {
    const envPath = path.join(__dirname, '..', '.env');
    if (fs.existsSync(envPath)) {
        const lines = fs.readFileSync(envPath, 'utf8').split('\n');
        for (const line of lines) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith('#')) {
                const eqIdx = trimmed.indexOf('=');
                if (eqIdx !== -1) {
                    const key = trimmed.substring(0, eqIdx).trim();
                    const val = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
                    if (!process.env[key]) {
                        process.env[key] = val;
                    }
                }
            }
        }
    }
}
loadEnvFile();

const PORT = process.env.PORT || 3000;
const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

const MIME_TYPES = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'text/javascript',
    '.json': 'application/json',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const SYSTEM_PROMPT = `You are a high-speed, loss-free Technical Resume JSON Parser. Your objective is to parse candidate resumes with 100% completeness into structured JSON.

MANDATORY RULES (ZERO DATA LOSS):
1. NAME, TITLE, EXPERIENCE: Authentic full name, headline, experience badge (e.g. "Experience: (6+ Years)").
2. SUMMARY: Authentic summary text from resume.
3. SKILLS: Categorized objects: [{"label": "Category", "value": "Comma-separated skills"}]. Include all skills.
4. COMPANIES: Extract EVERY employer in reverse chronological order. Replace ONLY the most recent/present company name with "Forcecraver Technologies Pvt. Ltd.". Retain authentic names for all previous companies. Include all responsibility bullets.
5. PROJECTS (CRITICAL): If the resume has a "KEY PROJECTS", "PROJECTS", or individual project descriptions, extract EVERY SINGLE PROJECT (e.g. all 4-8 projects) into the "projects" array. Each project MUST have:
   - "name": Project Name
   - "role": Project Role or Candidate Title
   - "duration": Duration or ""
   - "client": Client Name or ""
   - "environment": Complete tech stack / tools / libraries
   - "description": 1-sentence overview description
   - "responsibilities": Array of original bullet points
6. CERTIFICATIONS: Array of certification strings. If none, [].
7. EDUCATION: Array of degree strings. If none, [].

Return ONLY a valid JSON object matching this schema:
{
  "name": "Full Name",
  "title": "Title",
  "experience": "Experience: (X+ Years)",
  "summary": "Summary text",
  "skills": [{"label": "Category", "value": "Skills"}],
  "companies": [
    {
      "company": "Forcecraver Technologies Pvt. Ltd.",
      "role": "Role",
      "duration": "Duration",
      "location": "Location",
      "responsibilities": ["Bullet 1", "Bullet 2"]
    }
  ],
  "projects": [
    {
      "name": "Project Name",
      "role": "Role",
      "duration": "Duration",
      "client": "Client",
      "environment": "Tech Stack",
      "description": "Description",
      "responsibilities": ["Bullet 1", "Bullet 2"]
    }
  ],
  "certifications": [],
  "education": ["Degree – University (Year)"]
}`;

function normalizeExperienceString(exp, role, summary, companies) {
    let s = String(exp || '').trim();
    
    // Check if candidate is intern / fresher / student / trainee
    const isInternOrFresher = /fresher|intern|trainee|student/i.test(s) ||
                             /intern|trainee|student/i.test(role || '') ||
                             /internship|seeking\s+(?:a\s+)?(?:full-time|entry|fresher)/i.test(summary || '');

    if (isInternOrFresher) {
        return 'Experience: (Fresher / Intern)';
    }

    // Check company durations: if only 1 company with <= 6 months or intern
    if (Array.isArray(companies) && companies.length === 1) {
        const c = companies[0];
        if (/intern|trainee/i.test(c.role || '') || /months?|weeks?/i.test(c.duration || '')) {
            return 'Experience: (Fresher / Intern)';
        }
    }

    const m = s.match(/(\d+(?:\.\d+)?)/);
    if (m) {
        const num = Math.floor(parseFloat(m[1]));
        if (num === 0) return 'Experience: (Fresher / Intern)';
        return `Experience: (${num}+ Years)`;
    }

    return 'Experience: (Fresher / Intern)';
}

function cleanSummaryString(summary, title, experience, skills) {
    if (!summary || typeof summary !== 'string') {
        const role = title || 'Software Developer';
        const exp = experience ? experience.replace(/Experience:\s*/i, '').replace(/[()]/g, '').trim() : '';
        const expClause = exp ? `with ${exp} of` : 'with';
        return `Dynamic and results-driven ${role} ${expClause} demonstrated expertise across modern technologies and distributed software systems. Proven track record of architecting scalable applications and collaborating with engineering teams.`;
    }

    let s = summary.trim();
    s = s.replace(/(?:Project\s*Highlight|Project\s*Description|Key\s*Contributions|Key\s*Responsibilities|Client\s*:|Environment\s*:|Tools\/Tech\s*:)[\s\S]*/i, '');
    s = s.replace(/^[•\-\*\d\.\(\)\s,;:|]+/, '');
    s = s.replace(/^[a-z0-9]+\s*\.\s*/i, '');
    s = s.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
    s = s.replace(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g, '');
    s = s.replace(/\s+/g, ' ').trim();

    if (s.length < 50) {
        const role = title || 'Software Developer';
        const exp = experience ? experience.replace(/Experience:\s*/i, '').replace(/[()]/g, '').trim() : '';
        const expClause = exp ? `with ${exp} of` : 'with';
        return `Dynamic and results-driven ${role} ${expClause} demonstrated expertise across modern technologies and distributed software systems. Proven track record of architecting scalable applications and collaborating with engineering teams.`;
    }

    if (!/[.!?]$/.test(s)) s += '.';
    return s;
}

function normalizeCompaniesWithForcecraver(companies, title) {
    if (!Array.isArray(companies) || companies.length === 0) {
        return [{
            company: "Forcecraver Technologies Pvt. Ltd.",
            role: title || "Software Engineer",
            duration: "2022 – Present",
            location: "Bengaluru, IN",
            responsibilities: [
                "Spearhead core software development and architectural deliverables for enterprise clients.",
                "Collaborate with cross-functional engineering and QA teams to maintain code quality.",
                "Implement scalable backend APIs and optimize database query performance."
            ]
        }];
    }

    let presentIndex = -1;
    for (let i = 0; i < companies.length; i++) {
        const dur = String(companies[i].duration || '').toLowerCase();
        if (/present|current|till\s*date|ongoing|now/i.test(dur)) {
            presentIndex = i;
            break;
        }
    }

    if (presentIndex === -1) {
        let maxYear = -1;
        for (let i = 0; i < companies.length; i++) {
            const dur = String(companies[i].duration || '');
            const years = dur.match(/\b(20\d\d)\b/g);
            if (years) {
                const latestYear = Math.max(...years.map(Number));
                if (latestYear > maxYear) {
                    maxYear = latestYear;
                    presentIndex = i;
                }
            }
        }
    }

    if (presentIndex === -1) presentIndex = 0;

    const result = companies.map((c, i) => {
        const comp = { ...c };
        if (i === presentIndex) {
            comp.company = "Forcecraver Technologies Pvt. Ltd.";
            if (!/present|current|till\s*date|now|ongoing/i.test(comp.duration || '')) {
                comp.duration = (comp.duration ? comp.duration.split(/[-–—]/)[0].trim() + " – Present" : "Present");
            }
        }
        return comp;
    });

    if (presentIndex > 0) {
        const [presentComp] = result.splice(presentIndex, 1);
        result.unshift(presentComp);
    }

    return result;
}

function executeGroqRequest(cleanedText, modelName) {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            model: modelName,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Extract all resume information into a valid JSON object:\n\n${cleanedText}` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.0,
            max_tokens: 3000
        });

        const req = https.request('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 40000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) {
                    return reject(new Error(`Groq API returned ${res.statusCode}: ${data}`));
                }
                try {
                    const parsed = JSON.parse(data);
                    const rawContent = parsed.choices?.[0]?.message?.content || '';
                    resolve(rawContent);
                } catch (e) {
                    reject(new Error(`Failed to parse Groq response: ${e.message}`));
                }
            });
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Groq API request timed out'));
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

// Call Groq API via HTTPS with automatic fallback across active models
async function processWithGroq(cleanedText) {
    const candidateModels = [
        (process.env.GROQ_MODEL || GROQ_MODEL || 'openai/gpt-oss-120b').trim(),
        'openai/gpt-oss-120b',
        'openai/gpt-oss-20b'
    ];
    const uniqueModels = Array.from(new Set(candidateModels.filter(Boolean)));

    let lastError = null;
    for (const modelName of uniqueModels) {
        try {
            const content = await executeGroqRequest(cleanedText, modelName);
            if (content && content.length > 20) {
                return content;
            }
        } catch (err) {
            lastError = err;
        }
    }
    throw new Error(`All Groq models failed. Last error: ${lastError ? lastError.message : 'Unknown'}`);
}

// Call Ollama API via HTTP
function processWithOllama(cleanedText, model = 'qwen2.5:latest') {
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            model: model,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Extract candidate resume details into JSON:\n\n${cleanedText}` }
            ],
            format: 'json',
            stream: false,
            options: {
                temperature: 0.0,
                num_ctx: 32768,
                num_predict: 8192,
                top_p: 0.95,
                seed: 42
            }
        });

        const urlObj = new URL(OLLAMA_HOST);
        const transport = urlObj.protocol === 'https:' ? https : http;

        const req = transport.request(`${OLLAMA_HOST}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 180000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                try {
                    const parsed = JSON.parse(data);
                    const rawContent = parsed.message?.content || parsed.response || '';
                    resolve(rawContent);
                } catch (e) {
                    reject(new Error(`Failed to parse Ollama response: ${e.message}`));
                }
            });
        });

        req.on('timeout', () => {
            req.destroy();
            reject(new Error('Ollama request timed out'));
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

async function requestListener(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    // API: Status of AI Provider (Groq vs Ollama)
    if (req.url === '/api/ai-status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            provider: GROQ_API_KEY ? 'groq' : 'ollama',
            model: GROQ_API_KEY ? GROQ_MODEL : 'qwen2.5:latest',
            groqConfigured: !!GROQ_API_KEY,
            ollamaHost: OLLAMA_HOST
        }));
        return;
    }

    // API: Check Ollama status & models (Legacy compatibility)
    if (req.url === '/api/ollama-status' && req.method === 'GET') {
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
            const ollamaReq = transport.request(`${OLLAMA_HOST}/api/tags`, { method: 'GET', timeout: 4000 }, (oRes) => {
                let data = '';
                oRes.on('data', chunk => data += chunk);
                oRes.on('end', () => {
                    res.writeHead(200, { 'Content-Type': 'application/json' });
                    res.end(data);
                });
            });
            ollamaReq.on('error', (err) => {
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'offline', error: err.message }));
            });
            ollamaReq.on('timeout', () => {
                ollamaReq.destroy();
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ status: 'offline', error: 'Ollama connection timed out' }));
            });
            ollamaReq.end();
        } catch (e) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ status: 'offline', error: e.message }));
        }
        return;
    }

    // API: Process raw resume text
    if (req.url === '/api/process-resume' && req.method === 'POST') {
        let body = '';
        req.on('data', chunk => body += chunk);
        req.on('end', async () => {
            try {
                const { text, model = 'qwen2.5:latest' } = JSON.parse(body);

                if (!text || text.trim().length === 0) {
                    res.writeHead(400, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify({ error: 'No resume text provided' }));
                    return;
                }

                // Clean and truncate text safely
                const cleanedText = text
                    .split('\n')
                    .map(l => l.trim())
                    .filter(l => l.length > 0 && !/page\s*\d+\s*of\s*\d+/i.test(l))
                    .join('\n');

                let rawContent = '';
                let usedProvider = 'ollama';
                const startTime = Date.now();
                const apiKey = (process.env.GROQ_API_KEY || GROQ_API_KEY || '').trim();

                if (apiKey) {
                    console.log(`[AI-Groq] Processing resume via Groq Cloud (${GROQ_MODEL})...`);
                    rawContent = await processWithGroq(cleanedText);
                    usedProvider = 'groq';
                } else {
                    console.log(`[AI-Ollama] Processing resume via Ollama (${model})...`);
                    rawContent = await processWithOllama(cleanedText, model);
                    usedProvider = 'ollama';
                }

                const elapsedMs = Date.now() - startTime;
                console.log(`[AI] Response received via ${usedProvider} in ${elapsedMs}ms`);

                // Parse returned JSON safely
                let cleanJsonStr = rawContent.trim();
                if (cleanJsonStr.startsWith('```json')) {
                    cleanJsonStr = cleanJsonStr.replace(/^```json\s*/i, '').replace(/```\s*$/i, '');
                } else if (cleanJsonStr.startsWith('```')) {
                    cleanJsonStr = cleanJsonStr.replace(/^```\s*/i, '').replace(/```\s*$/i, '');
                }
                
                const firstBrace = cleanJsonStr.indexOf('{');
                const lastBrace = cleanJsonStr.lastIndexOf('}');
                if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
                    cleanJsonStr = cleanJsonStr.substring(firstBrace, lastBrace + 1);
                }

                const jsonResult = JSON.parse(cleanJsonStr);

                // Standardize and normalize
                jsonResult.experience = normalizeExperienceString(jsonResult.experience, jsonResult.title, jsonResult.summary, jsonResult.companies);
                jsonResult.summary = cleanSummaryString(jsonResult.summary, jsonResult.title, jsonResult.experience, jsonResult.skills);
                jsonResult.companies = normalizeCompaniesWithForcecraver(jsonResult.companies, jsonResult.title);

                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({
                    success: true,
                    provider: GROQ_API_KEY ? 'groq' : 'ollama',
                    elapsedMs,
                    data: jsonResult
                }));
                console.log(`[AI] Successfully parsed resume for: ${jsonResult.name} | Exp: ${jsonResult.experience}`);

            } catch (err) {
                console.error('[AI] Resume processing error:', err.message);
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ error: err.message }));
            }
        });
        return;
    }

    // Static File Serving
    let relativePath = req.url === '/' ? 'index.html' : req.url.split('?')[0];
    let filePath = path.join(__dirname, '..', 'public', relativePath);
    const ext = path.extname(filePath);
    const contentType = MIME_TYPES[ext] || 'application/octet-stream';

    fs.readFile(filePath, (err, content) => {
        if (err) {
            if (err.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/plain' });
                res.end('404 Not Found');
            } else {
                res.writeHead(500);
                res.end('Server Error: ' + err.code);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
}

const server = http.createServer(requestListener);

function getLocalIpAddresses() {
    const interfaces = os.networkInterfaces();
    const addresses = [];
    for (const name of Object.keys(interfaces)) {
        for (const iface of interfaces[name]) {
            if (iface.family === 'IPv4' && !iface.internal) {
                addresses.push(iface.address);
            }
        }
    }
    return addresses;
}

if (require.main === module) {
    server.listen(PORT, '0.0.0.0', () => {
        const ips = getLocalIpAddresses();
        console.log(`==================================================================`);
        console.log(`  FORCECRAVER RESUME STUDIO & AI SERVER RUNNING`);
        console.log(`  Port:              ${PORT}`);
        console.log(`  AI Engine:         ${GROQ_API_KEY ? `Groq Cloud (${GROQ_MODEL}) [Ultra-Fast]` : `Local/Remote Ollama (${OLLAMA_HOST})`}`);
        console.log(`  Local URL:         http://localhost:${PORT}`);
        ips.forEach(ip => {
            console.log(`  Network (LAN) URL: http://${ip}:${PORT}`);
        });
        console.log(`==================================================================`);
    });
}

module.exports = requestListener;
