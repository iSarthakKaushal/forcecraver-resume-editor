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
const GROQ_MODEL = process.env.GROQ_MODEL || 'openai/gpt-oss-120b';
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

const SYSTEM_PROMPT = `You are an elite, highly accurate Technical Resume Parser & Information Extraction Engine.
Your sole mission is 100% accurate, complete, and lossless data extraction from the provided candidate resume into valid JSON format.

CRITICAL EXTRACTION DIRECTIVES (ZERO DATA LOSS):
1. NAME: Extract candidate's authentic full name. Completely omit phone numbers, emails, addresses, links, or headers.
2. TITLE: Primary professional job title, headline, or current role directly from the resume.
3. EXPERIENCE BADGE:
   - Calculate total full-time professional experience strictly from the employment/work history dates (NOT from college/education graduation years).
   - If candidate is a student/fresher/intern or has < 1 year experience: "Experience: (Fresher / Intern)".
   - For experienced professionals: "Experience: (X+ Years)" (e.g. "Experience: (9+ Years)").
4. SUMMARY: Extract candidate's professional summary / profile text (3-4 sentences). Omit raw contact info or bulleted project dumps. If none exists, return "".
5. SKILLS (100% COMPLETE):
   - Extract ALL technical skills, programming languages, tools, frameworks, databases, cloud platforms, and libraries present anywhere in the resume.
   - Format as an array of categorized objects: [{"label": "Category Name", "value": "Skill 1, Skill 2, Skill 3"}]
   - If categories are not explicitly named in the resume, group them logically (e.g. "Languages & Frameworks", "Cloud & DevOps", "Databases & Storage", "Tools & Platforms").
   - NEVER drop or omit any technical skill mentioned in the resume.
6. CERTIFICATIONS:
   - Extract ALL verified certifications, licenses, and badges into an array of strings: ["Certification Name"].
   - If none, return []. DO NOT include table headers.
7. EDUCATION:
   - Extract ALL degrees, diplomas, and colleges into an array: ["Degree / Course – University / Institute (Year / Score)"].
   - If none, return []. DO NOT include table headers.
8. COMPANIES (ALL WORK EXPERIENCES - LOSSLESS):
   - Extract EVERY employer/company from the candidate's entire career history in reverse chronological order.
   - Replace ONLY the present/most recent company name with "Forcecraver Technologies Pvt. Ltd." while preserving candidate's authentic role, exact duration, location, and ALL responsibility bullets.
   - Retain authentic names and dates for all previous employers.
   - Extract ALL responsibility bullets for each company without truncating, summarizing, or skipping any.
9. PROJECTS (ALL PROJECTS & ENGAGEMENTS - LOSSLESS):
   - Extract EVERY project, client engagement, and software system mentioned in the resume.
   - Include: "name", "role", "duration", "client", "environment" (tech stack), "description", and "responsibilities" (ALL original bullet points for that project).
   - DO NOT omit, summarize, or discard any project.
10. STRICT NO-HALLUCINATION & NO-OMISSION RULE:
   - Extract ONLY genuine facts present directly in the resume text.
   - DO NOT fabricate fake information, but NEVER omit genuine information present in the resume.

Return ONLY a valid JSON object matching this exact schema:
{
  "name": "Candidate Full Name",
  "title": "Candidate Professional Title",
  "experience": "Experience: (X+ Years) OR Experience: (Fresher / Intern)",
  "summary": "Crisp professional summary from resume",
  "skills": [
    { "label": "Category Name from Resume", "value": "Extracted Skill 1, Extracted Skill 2, Extracted Skill 3" }
  ],
  "certifications": ["Certification Name from Resume"],
  "education": ["Degree – University/College (Year)"],
  "companies": [
    {
      "company": "Forcecraver Technologies Pvt. Ltd.",
      "role": "Present Job Role from Resume",
      "duration": "Present Job Duration from Resume",
      "location": "Location from Resume or empty",
      "responsibilities": [
        "Authentic responsibility bullet 1 directly from resume",
        "Authentic responsibility bullet 2 directly from resume"
      ]
    },
    {
      "company": "Previous Company Name from Resume",
      "role": "Past Job Role from Resume",
      "duration": "Past Job Duration from Resume",
      "location": "Location from Resume or empty",
      "responsibilities": [
        "Authentic responsibility bullet 1 directly from resume",
        "Authentic responsibility bullet 2 directly from resume"
      ]
    }
  ],
  "projects": [
    {
      "name": "Project Name from Resume",
      "role": "Project Role from Resume",
      "duration": "Project Duration from Resume or empty",
      "client": "Client Name from Resume or empty",
      "environment": "Tech Stack / Environment from Resume or empty",
      "description": "Project Description from Resume or empty",
      "responsibilities": [
        "Authentic project responsibility bullet 1 from resume",
        "Authentic project responsibility bullet 2 from resume"
      ]
    }
  ]
}`;

function filterAndCleanEduCertText(text) {
    if (!text || typeof text !== 'string') return '';
    let s = text.trim();
    
    // Remove table headers like "Degree / Exam", "Year", "Institution", "Result", "Score", "Board / University"
    s = s.replace(/\b(?:Degree\s*(?:\/|&)?\s*Exam(?:ination)?|Year\s*(?:\/|&)?\s*Passing|Institution|Result|CGPA\s*Score|Score|Board\s*(?:\/|&)?\s*University)\b/gi, ' ');
    
    // Clean orphan punctuation, slashes, bars, leading bullets
    s = s.replace(/^[•\-\*\d\.\(\)\s,;:|/]+/, '');
    s = s.replace(/[\s|/]+$/, '');
    s = s.replace(/\s+/g, ' ').trim();
    
    // If it's just leftover junk headers, return empty
    if (/^(?:degree|exam|year|institution|result|score|percentage|passing|board|university|\/|\||-|\.)+$/i.test(s) || s.length < 3) {
        return '';
    }
    return s;
}

function normalizeExperienceString(exp, role, summary, companies) {
    const combined = `${exp || ''} ${summary || ''}`;
    
    // 1. Look for explicit years pattern first: "7+ years", "7 + years", "7 years", "9+ Years"
    const yearMatch = combined.match(/(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)/i) || String(exp || '').match(/(\d+(?:\.\d+)?)/);
    if (yearMatch) {
        const num = Math.floor(parseFloat(yearMatch[1]));
        if (num >= 1) {
            return `Experience: (${num}+ Years)`;
        }
    }

    // 2. Check if genuinely an intern/fresher
    const isIntern = /fresher|intern|trainee|seeking\s+(?:a\s+)?(?:entry|fresher)/i.test(`${role || ''} ${summary || ''}`);
    if (isIntern) {
        return 'Experience: (Fresher / Intern)';
    }

    // 3. Fallback check on companies
    if (Array.isArray(companies) && companies.length >= 2) {
        return 'Experience: (3+ Years)';
    }

    return 'Experience: (Fresher / Intern)';
}

function cleanSummaryString(summary, title, experience) {
    if (!summary || typeof summary !== 'string') {
        return '';
    }

    let s = summary.trim();
    s = s.replace(/^(?:CORE\s*PROFICIENCIES|PROFESSIONAL\s*SUMMARY|EXECUTIVE\s*SUMMARY|CORE\s*COMPETENCIES|PROFILE\s*SUMMARY)\s*[:.-]?\s*/i, '');
    s = s.replace(/(?:Project\s*Highlight|Project\s*Description|Key\s*Contributions|Key\s*Responsibilities|Client\s*:|Environment\s*:|Tools\/Tech\s*:)[\s\S]*/i, '');
    s = s.replace(/^[•\-\*\d\.\(\)\s,;:|]+/, '');
    s = s.replace(/^[a-z0-9]+\s*\.\s*/i, '');
    s = s.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
    s = s.replace(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g, '');
    s = s.replace(/\s+/g, ' ').trim();

    if (s.length < 25) {
        return '';
    }

    if (!/[.!?]$/.test(s)) s += '.';
    return s;
}

function normalizeSkillsStructure(skillsInput) {
    if (!skillsInput) return [];
    if (Array.isArray(skillsInput)) {
        return skillsInput.map(item => {
            if (typeof item === 'object' && item !== null) {
                const label = item.label || item.category || item.name || 'Core Skills';
                const val = item.value || item.val || item.skills || '';
                return { label: String(label).trim(), value: String(val).trim() };
            }
            return { label: 'Key Skills', value: String(item).trim() };
        }).filter(s => s.value.length > 0);
    }
    if (typeof skillsInput === 'object') {
        const list = [];
        const labelMap = {
            cloud: 'Cloud & DevOps',
            languages: 'Languages & Stack',
            frontend: 'Frontend & Portals',
            databases: 'Databases & Storage',
            tools: 'Tools & Automation'
        };
        for (const [k, v] of Object.entries(skillsInput)) {
            if (v && String(v).trim()) {
                const label = labelMap[k] || k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' ').trim();
                list.push({ label: label.charAt(0).toUpperCase() + label.slice(1), value: String(v).trim() });
            }
        }
        return list;
    }
    if (typeof skillsInput === 'string' && skillsInput.trim()) {
        return [{ label: 'Core Technical Skills', value: skillsInput.trim() }];
    }
    return [];
}

function normalizeCompaniesWithForcecraver(companies, title) {
    if (!Array.isArray(companies) || companies.length === 0) {
        return [];
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
    const apiKey = (process.env.GROQ_API_KEY || GROQ_API_KEY || '').trim();
    return new Promise((resolve, reject) => {
        const payload = JSON.stringify({
            model: modelName,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Extract candidate resume details into JSON:\n\n${cleanedText}` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.0,
            max_tokens: 2800
        });

        const req = https.request('https://api.groq.com/openai/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
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

async function processWithGroq(cleanedText) {
    const apiKey = (process.env.GROQ_API_KEY || GROQ_API_KEY || '').trim();
    if (!apiKey) {
        throw new Error('GROQ_API_KEY is not configured in environment variables');
    }

    const candidateModels = [
        (process.env.GROQ_MODEL || GROQ_MODEL || 'openai/gpt-oss-120b').trim(),
        'openai/gpt-oss-120b',
        'openai/gpt-oss-20b',
        'qwen/qwen3.6-27b'
    ];
    const uniqueModels = Array.from(new Set(candidateModels.filter(Boolean)));
    const errors = [];

    for (const model of uniqueModels) {
        try {
            console.log(`[AI-Groq] Attempting extraction with model: ${model}...`);
            const res = await executeGroqRequest(cleanedText, model);
            if (res && res.length > 20) {
                console.log(`[AI-Groq] Successfully parsed resume with model: ${model}`);
                return res;
            }
        } catch (err) {
            errors.push(`[${model}] ${err.message}`);
            console.warn(`[AI-Groq] Model ${model} failed: ${err.message}`);
        }
    }
    throw new Error(`Groq AI Extraction failed on all models: ${errors.join(' --- ')}`);
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
            model: GROQ_API_KEY ? GROQ_MODEL : 'llama-3.1-8b-instant',
            groqConfigured: !!GROQ_API_KEY,
            ollamaHost: OLLAMA_HOST
        }));
        return;
    }

    // API: Query Active Groq Models directly
    if (pathname === '/api/groq-models' && req.method === 'GET') {
        const apiKey = (process.env.GROQ_API_KEY || GROQ_API_KEY || '').trim();
        if (!apiKey) {
            res.writeHead(200, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'No GROQ_API_KEY set' }));
        }

        const groqReq = https.request('https://api.groq.com/openai/v1/models', {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            timeout: 10000
        }, (gRes) => {
            let data = '';
            gRes.on('data', chunk => data += chunk);
            gRes.on('end', () => {
                res.writeHead(gRes.statusCode, { 'Content-Type': 'application/json' });
                res.end(data);
            });
        });

        groqReq.on('error', (err) => {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        });
        groqReq.end();
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
            .join('\n');

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
            jsonResult.skills = normalizeSkillsStructure(jsonResult.skills);
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
