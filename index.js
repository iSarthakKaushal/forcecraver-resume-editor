const http = require('http');
const https = require('https');
const fs = require('fs');
const path = require('path');
const os = require('os');

// Helper to auto-load .env file without external dependencies
function loadEnvFile() {
    const envPath = path.join(__dirname, '.env');
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
const GROQ_MODEL = process.env.GROQ_MODEL || 'llama-3.1-8b-instant';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

const MIME_TYPES = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'application/javascript; charset=utf-8',
    '.json': 'application/json; charset=utf-8',
    '.png': 'image/png',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const SYSTEM_PROMPT = `You are an expert Technical Resume Strategist and Recruiter.
Extract structured data from the candidate resume text into valid JSON format.

CRITICAL RULES:
1. NAME: Extract candidate's real full name only. Completely omit phone numbers, emails, addresses, or links.
2. EXPERIENCE:
   - Calculate total work experience ONLY from actual company/employment history. DO NOT calculate from education/college years (e.g. BCA/MCA years).
   - If candidate is a fresher, intern, student, or has under 1 year of total full-time experience, set experience strictly to "Experience: (Fresher / Intern)".
   - For experienced professionals, set to "Experience: (X+ Years)" based on actual work history years.
3. TITLE: Professional designation (e.g. "Software Developer", "Senior QA Automation Engineer", "Senior Liferay DXP Full Stack Developer").
4. SUMMARY: Exactly 3 to 4 crisp sentences summarizing overall career background, core tech stack, and primary strengths.
   STRICT RULE: NEVER include project highlights, client names, tool dumps, or bullet points in the summary.
5. SKILLS: Categorize into: cloud, languages, frontend, databases, tools.
6. CERTIFICATIONS: Array of verified credentials (e.g. ["AWS Cloud Practitioner Essentials"]).
7. EDUCATION: Array of degrees with university/year (e.g. ["Master of Computer Applications (MCA) – Amity University (2024–2026)"]).
8. COMPANIES: Array of all employers (company, role, duration, location). Always set first (present) company to "Forcecraver Technologies Pvt. Ltd.". Retain authentic role and authentic duration.
9. PROJECTS: Array of candidate's authentic projects from the PROJECTS section (e.g., "Scene Text Recognition & Assistive Vision System", "Face Recognition System", "Patient Crowdfunding Platform").
   STRICT RULE: NEVER use company or client names as project titles.

Return ONLY a valid JSON object matching this exact schema:
{
  "name": "Candidate Full Name",
  "title": "Professional Title",
  "experience": "Experience: (X+ Years) OR Experience: (Fresher / Intern)",
  "summary": "Crisp 3-4 line professional summary...",
  "skills": {
    "cloud": "AWS, Docker, CI/CD",
    "languages": "Python, Java, C++, SQL",
    "frontend": "React, HTML5, CSS3, JavaScript",
    "databases": "MySQL, PostgreSQL, MongoDB",
    "tools": "Git, VS Code, Jira, Agile"
  },
  "certifications": ["Cert 1"],
  "education": ["Degree 1"],
  "companies": [
    {
      "company": "Forcecraver Technologies Pvt. Ltd.",
      "role": "Software Developer Intern",
      "duration": "May 2025 – Jul 2025",
      "location": "Noida, IN",
      "responsibilities": ["Engineered real-time presentation tool.", "Optimized frame processing pipeline."]
    }
  ],
  "projects": [
    {
      "name": "Scene Text Recognition & Assistive Vision System",
      "role": "Developer",
      "duration": "Jan 2026 – Mar 2026",
      "client": "N/A",
      "environment": "Python, OpenCV, EasyOCR, EAST",
      "description": "Designed a modular scene-text recognition pipeline for real-time video-frame analysis."
    }
  ]
}`;

function normalizeExperienceString(exp, role, summary, companies) {
    let s = String(exp || '').trim();
    const isInternOrFresher = /fresher|intern|trainee|student/i.test(s) ||
                             /intern|trainee|student/i.test(role || '') ||
                             /internship|seeking\s+(?:a\s+)?(?:full-time|entry|fresher)/i.test(summary || '');

    if (isInternOrFresher) return 'Experience: (Fresher / Intern)';

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

function cleanSummaryString(summary, title, experience) {
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
                { role: 'user', content: `Extract candidate resume details into JSON:\n\n${cleanedText}` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1,
            max_tokens: 3000
        });

        const req = https.request('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(payload)
            },
            timeout: 30000
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

async function processWithGroq(cleanedText) {
    const candidateModels = [GROQ_MODEL, 'llama-3.1-8b-instant', 'llama3-70b-8192', 'llama-3.1-70b-versatile', 'mixtral-8x7b-32768'];
    const uniqueModels = Array.from(new Set(candidateModels));
    let lastError = null;

    for (const model of uniqueModels) {
        try {
            console.log(`[AI-Groq] Requesting model ${model}...`);
            return await executeGroqRequest(cleanedText, model);
        } catch (err) {
            lastError = err;
            console.warn(`[AI-Groq] Model ${model} failed (${err.message}), trying fallback model...`);
        }
    }
    throw lastError || new Error('All Groq models failed');
}

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
                temperature: 0.1,
                num_ctx: 4096,
                num_predict: 2000,
                top_p: 0.8
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

async function requestHandler(req, res) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        res.writeHead(204);
        res.end();
        return;
    }

    const parsedUrl = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const pathname = parsedUrl.pathname;

    // API: Status of AI Provider
    if (pathname === '/api/ai-status' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
            provider: GROQ_API_KEY ? 'groq' : 'ollama',
            model: GROQ_API_KEY ? GROQ_MODEL : 'qwen2.5:latest',
            groqConfigured: !!GROQ_API_KEY,
            ollamaHost: OLLAMA_HOST
        }));
        return;
    }

    // API: Check Ollama status
    if (pathname === '/api/ollama-status' && req.method === 'GET') {
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
    if (pathname === '/api/process-resume' && req.method === 'POST') {
        let body = req.body;
        if (!body || typeof body !== 'object') {
            body = await new Promise((resolve) => {
                let data = '';
                req.on('data', chunk => data += chunk);
                req.on('end', () => {
                    try {
                        resolve(JSON.parse(data));
                    } catch (e) {
                        resolve({});
                    }
                });
            });
        }

        const { text, model = 'qwen2.5:latest' } = body || {};

        if (!text || String(text).trim().length === 0) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'No resume text provided' }));
            return;
        }

        const cleanedText = String(text)
            .split('\n')
            .map(l => l.trim())
            .filter(l => l.length > 0 && !/page\s*\d+\s*of\s*\d+/i.test(l))
            .join('\n')
            .substring(0, 8000);

        const startTime = Date.now();
        try {
            let rawContent = '';
            if (GROQ_API_KEY) {
                rawContent = await processWithGroq(cleanedText);
            } else {
                rawContent = await processWithOllama(cleanedText, model);
            }

            const elapsedMs = Date.now() - startTime;

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
            jsonResult.experience = normalizeExperienceString(jsonResult.experience, jsonResult.title, jsonResult.summary, jsonResult.companies);
            jsonResult.summary = cleanSummaryString(jsonResult.summary, jsonResult.title, jsonResult.experience);
            jsonResult.companies = normalizeCompaniesWithForcecraver(jsonResult.companies, jsonResult.title);

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
                success: true,
                provider: GROQ_API_KEY ? 'groq' : 'ollama',
                elapsedMs,
                data: jsonResult
            }));
        } catch (err) {
            console.error('Error processing resume:', err.message);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
        return;
    }

    // Static File Serving from public folder
    let relativePath = pathname === '/' ? 'index.html' : pathname.replace(/^\//, '');
    let filePath = path.join(__dirname, 'public', relativePath);
    if (!fs.existsSync(filePath)) {
        filePath = path.join(process.cwd(), 'public', relativePath);
    }

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
            res.end(content);
        }
    });
}

const server = http.createServer(requestHandler);

if (require.main === module) {
    server.listen(PORT, '0.0.0.0', () => {
        console.log(`==================================================================`);
        console.log(`  FORCECRAVER RESUME STUDIO & AI SERVER RUNNING ON PORT ${PORT}`);
        console.log(`  AI Engine: ${GROQ_API_KEY ? `Groq Cloud (${GROQ_MODEL}) [Ultra-Fast]` : `Local Ollama (${OLLAMA_HOST})`}`);
        console.log(`==================================================================`);
    });
}

module.exports = requestHandler;
