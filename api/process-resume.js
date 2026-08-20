const https = require('https');
const http = require('http');

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const OLLAMA_HOST = process.env.OLLAMA_HOST || 'http://localhost:11434';

const SYSTEM_PROMPT = `You are an expert Technical Resume Strategist and Recruiter.
Extract structured data from the candidate resume text into valid JSON format.

CRITICAL RULES:
1. NAME: Extract candidate's real full name only. Completely omit phone numbers, emails, addresses, or links.
2. EXPERIENCE:
   - Calculate total work experience ONLY from actual company/employment history. DO NOT calculate from education/college years (e.g. BCA/MCA years).
   - If candidate is a fresher, intern, student, or has under 1 year of total full-time experience, set experience strictly to "Experience: (Fresher / Intern)".
   - For experienced professionals, set to "Experience: (X+ Years)" based on actual work history years.
3. TITLE: Professional designation (e.g. "Software Developer", "ServiceNow Developer", "Senior Salesforce Consultant", "Site Reliability Engineer").
4. SUMMARY: Exactly 3 to 4 crisp sentences summarizing overall career background, core tech stack, and primary strengths.
   STRICT RULE: NEVER include project highlights, client names, tool dumps, or bullet points in the summary.
5. SKILLS: Extract the candidate's authentic skill categories and technologies directly from their resume (e.g. "ServiceNow Platform", "Development", "Integration", "Languages & Stack", "Tools & DevOps", "Methodologies", or standard categories).
   Format skills as an array of objects:
   "skills": [
     { "label": "ServiceNow Platform", "value": "ITSM, CMDB, Service Catalog, Knowledge Management, Asset Management" },
     { "label": "Development", "value": "Business Rules, Client Scripts, UI Policies, UI Actions, Script Includes, Flow Designer" },
     { "label": "Integration", "value": "REST API, SOAP API, Integration Hub, Import Sets, Transform Maps, LDAP, OAuth 2.0" },
     { "label": "Languages & Stack", "value": "JavaScript, HTML, CSS, XML, MySQL, SQL" },
     { "label": "Tools & DevOps", "value": "Update Sets, ServiceNow Studio, Git, Jira" }
   ]
6. CERTIFICATIONS: Array of verified credentials only (e.g. ["ServiceNow Certified System Administrator (CSA)"]).
   STRICT RULE: NEVER mix education table headers into certifications.
7. EDUCATION: Array of degrees with university/school/year/grades (e.g. ["Bachelor of Commerce (B.COM) – Osmania University, Hyderabad, India"]).
   STRICT RULE: NEVER include table headers as an education entry.
8. COMPANIES: Extract actual employers where the candidate was formally employed (e.g. Epam Systems, Wipro, TCS, PwC).
   - Replace ONLY the present/first employer's company name with "Forcecraver Technologies Pvt. Ltd." while preserving candidate's authentic job title/role, exact duration, and exact bullet points from the resume.
   - For past employers, retain their real authentic company names, authentic roles, and authentic dates.
   - If duration is given (e.g. "Aug 2021 – Present" or "Jan 2018 – May 2021"), keep the exact duration. If duration is NOT given, set "duration": "". NEVER invent fake dates like "2020 – 2022"!
   - IMPORTANT: If a resume lists Client projects / project engagements under Work History (e.g. "Client: UnitedHealth Group", "Client: Kaiser Permanente", "Client: Wells Fargo"), do NOT classify those clients as employers in "companies". Extract them into the "projects" array instead!
9. PROJECTS: Array of candidate's authentic projects (name, role, duration, client, environment, description, responsibilities).
   - If a project specifies a client (e.g. "UnitedHealth Group, USA", "Kaiser Permanente, USA", "Wells Fargo"), set "client": "<Client Name>".
   - If duration is given in the resume, set exact duration; if NOT given in the resume, set "duration": "". NEVER invent fake durations like "12 Months" or "2020 – 2022"!
   - Extract candidate's REAL project bullet points directly from the resume for "responsibilities".
   - If candidate's resume has NO separate projects or client engagements, return an empty array "projects": [].
10. STRICT NO-HALLUCINATION RULE: If the candidate's resume does NOT contain an Education section, Certifications section, or separate Projects section, set that field strictly to an empty array []. NEVER make up fake degrees, fake certifications, or fake projects!

Return ONLY a valid JSON object matching this exact schema:
{
  "name": "Candidate Full Name",
  "title": "Professional Title",
  "experience": "Experience: (X+ Years) OR Experience: (Fresher / Intern)",
  "summary": "Crisp 3-4 line professional summary...",
  "skills": [
    { "label": "ServiceNow Platform", "value": "ITSM, CMDB, Service Catalog" },
    { "label": "Development", "value": "Business Rules, Client Scripts, Script Includes" },
    { "label": "Integration", "value": "REST API, SOAP API, Integration Hub" }
  ],
  "certifications": ["Cert 1"],
  "education": ["Degree 1"],
  "companies": [
    {
      "company": "Forcecraver Technologies Pvt. Ltd.",
      "role": "ServiceNow Developer",
      "duration": "Aug 2021 – Present",
      "location": "DELHI, IN",
      "responsibilities": [
        "Developed and customized ServiceNow ITSM modules including Incident Management, Problem Management, and Change Management.",
        "Implemented Flow Designer flows and Workflow solutions to automate service fulfillment."
      ]
    }
  ],
  "projects": [
    {
      "name": "Healthcare IT Service Management & Automation Platform",
      "role": "ServiceNow Developer",
      "duration": "",
      "client": "UnitedHealth Group, USA",
      "environment": "ServiceNow ITSM, REST/SOAP APIs, JavaScript, Flow Designer",
      "description": "Developed and enhanced a ServiceNow-based healthcare service management platform to automate IT operations.",
      "responsibilities": [
        "Gathered business requirements and customized ServiceNow applications to meet healthcare operational needs.",
        "Configured and developed ITSM modules including Incident Management, Problem Management, and Service Catalog."
      ]
    }
  ]
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
                { role: 'user', content: `Extract candidate resume details into JSON:\n\n${cleanedText}` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.0,
            max_tokens: 3500
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
    const models = [
        'openai/gpt-oss-120b',
        'openai/gpt-oss-20b',
        'qwen/qwen3.6-27b'
    ];

    let lastError = null;
    for (const modelName of models) {
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
            reject(new Error('Ollama request timed out after 60s'));
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
        .join('\n')
        .substring(0, 8000);

    const startTime = Date.now();
    const apiKey = (process.env.GROQ_API_KEY || GROQ_API_KEY || '').trim();

    try {
        let rawContent = '';
        if (apiKey) {
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
