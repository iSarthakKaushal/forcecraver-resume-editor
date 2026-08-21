const https = require('https');
const http = require('http');

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

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

function filterAndCleanEduCertText(text) {
    if (!text || typeof text !== 'string') return '';
    let s = text.trim();
    s = s.replace(/\b(?:Degree\s*(?:\/|&)?\s*Exam(?:ination)?|Year\s*(?:\/|&)?\s*Passing|Institution|Result|CGPA\s*Score|Score|Board\s*(?:\/|&)?\s*University)\b/gi, ' ');
    s = s.replace(/^[•\-\*\d\.\(\)\s,;:|/]+/, '');
    s = s.replace(/[\s|/]+$/, '');
    s = s.replace(/\s+/g, ' ').trim();
    if (/^(?:degree|exam|year|institution|result|score|percentage|passing|board|university|\/|\||-|\.)+$/i.test(s) || s.length < 3) {
        return '';
    }
    return s;
}

function normalizeExperienceString(exp, role, summary, companies) {
    const combined = `${exp || ''} ${summary || ''}`;
    const yearMatch = combined.match(/(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)/i) || String(exp || '').match(/(\d+(?:\.\d+)?)/);
    if (yearMatch) {
        const num = Math.floor(parseFloat(yearMatch[1]));
        if (num >= 1) return `Experience: (${num}+ Years)`;
    }
    const isIntern = /fresher|intern|trainee|seeking\s+(?:a\s+)?(?:entry|fresher)/i.test(`${role || ''} ${summary || ''}`);
    if (isIntern) return 'Experience: (Fresher / Intern)';
    if (Array.isArray(companies) && companies.length >= 2) return 'Experience: (3+ Years)';
    return 'Experience: (Fresher / Intern)';
}

function cleanSummaryString(summary, title, experience) {
    if (!summary || typeof summary !== 'string') {
        const role = title || 'Software Developer';
        const exp = experience ? experience.replace(/Experience:\s*/i, '').replace(/[()]/g, '').trim() : '';
        const expClause = exp ? `with over ${exp} of` : 'with';
        return `Dynamic and results-driven ${role} ${expClause} demonstrated expertise across modern technologies and distributed software systems. Proven track record of architecting scalable applications and collaborating with engineering teams.`;
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
                { role: 'user', content: `Extract all resume information into a valid JSON object:\n\n${cleanedText}` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.0,
            max_tokens: 3000
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
    const candidateModels = [
        (process.env.GROQ_MODEL || 'openai/gpt-oss-120b').trim(),
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
            timeout: 60000
        }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => {
                if (res.statusCode >= 400) {
                    return reject(new Error(`Ollama returned status ${res.statusCode}: ${data}`));
                }
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
            reject(new Error('Ollama request timed out after 180s'));
        });

        req.on('error', reject);
        req.write(payload);
        req.end();
    });
}

module.exports = async (req, res) => {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        res.status(405).json({ error: 'Method Not Allowed' });
        return;
    }

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
        res.status(400).json({ error: 'No resume text provided' });
        return;
    }

    const cleanedText = String(text)
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !/page\s*\d+\s*of\s*\d+/i.test(l))
        .join('\n');

    const startTime = Date.now();
    const apiKey = (process.env.GROQ_API_KEY || GROQ_API_KEY || '').trim();

    try {
        let rawContent = '';
        let usedProvider = 'ollama';
        if (apiKey) {
            rawContent = await processWithGroq(cleanedText);
            usedProvider = 'groq';
        } else {
            rawContent = await processWithOllama(cleanedText, model);
            usedProvider = 'ollama';
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

        res.status(200).json({
            success: true,
            provider: apiKey ? 'groq' : 'ollama',
            elapsedMs,
            data: jsonResult
        });
    } catch (err) {
        console.error('Error processing resume:', err.message);
        res.status(500).json({ error: err.message });
    }
};
