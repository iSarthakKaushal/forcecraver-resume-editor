/* ==========================================================================
   FORCECRAVER RESUME STUDIO - CORE APPLICATION ENGINE
   AI-Powered Universal Resume Template Generator & Humanizer
   ========================================================================== */

// Configure PDF.js Worker
if (typeof pdfjsLib !== 'undefined') {
    const workerUrl = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
    const workerBlob = new Blob([`importScripts("${workerUrl}");`], { type: 'application/javascript' });
    pdfjsLib.GlobalWorkerOptions.workerSrc = URL.createObjectURL(workerBlob);
}

// Global Application State
let appState = {
    file: null,
    fileName: '',
    rawText: '',
    zoom: 1.0,
    aiMode: 'ollama', // Default: High-Speed Local Ollama AI Model
    ollamaEndpoint: 'http://localhost:11434',
    ollamaModel: 'qwen2.5:latest',
    data: getInitialResumeData()
};

// Initial Standard Resume Data Structure
function getInitialResumeData() {
    return {
        name: "OM PRAKASH",
        title: "Senior Liferay DXP Full Stack Portal Developer",
        experience: "Experience: (9+ Years)",
        summary: "Dynamic and results-driven Senior Software Engineer with 9+ years of extensive experience in architecting, developing, and deploying enterprise-grade web applications and cloud solutions. Proven expertise in Liferay DXP, Java/J2EE, Spring Boot, Microservices, and AWS/Azure Cloud environments. Strong track record of leading distributed teams, delivering high-impact client projects, and optimizing application scalability and performance.",
        skills: [
            { label: "Cloud & DevOps", value: "AWS (EC2, S3, RDS, Lambda, CloudFront), Azure DevOps, Docker, Kubernetes, CI/CD, Tomcat Server" },
            { label: "Languages & Stack", value: "Java 8/11/17, J2EE, Spring Boot, Hibernate, REST APIs, JSR 168, JSR 286, Microservices, Python" },
            { label: "Frontend & Portals", value: "Liferay DXP 7.x/6.x, React.js, JavaScript (ES6+), HTML5, CSS3, jQuery, AJAX" },
            { label: "Databases & Storage", value: "IBM DB2, Oracle, MySQL, MS SQL, Informix, Redis Caching" },
            { label: "Tools & Automation", value: "Git, SVN, Eclipse IDE, VS Code, SonarQube, Jira, Maven, Gradle, Postman, Agile/Scrum" }
        ],
        certifications: [
            "UI Path RPA Developer Foundation Diploma",
            "Liferay Certified Professional Developer",
            "Microsoft Certified: Azure Fundamentals (AZ-900)"
        ],
        education: [
            "Bachelor of Technology (B.Tech) in Information Technology – Anna University (2010)",
            "Master of Computer Applications (MCA) – Technical University"
        ],
        companies: [
            {
                company: "Forcecraver Technologies Pvt. Ltd.",
                role: "Tech Lead",
                duration: "Jan 2022 – Present",
                location: "Bengaluru, IN",
                responsibilities: [
                    "Spearhead architectural design and full-stack development for high-volume enterprise portals.",
                    "Mentor junior developers, run sprint code reviews, and maintain code quality standards.",
                    "Implement scalable microservices and cloud infrastructure reducing server latency by 35%."
                ]
            },
            {
                company: "Value Momentum Software Services",
                role: "Tech Lead",
                duration: "Jan 2022 – Nov 2025",
                location: "Coimbatore, IN",
                responsibilities: [
                    "Delivered enterprise portal modules, custom themes, and RESTful API web service integrations.",
                    "Optimized Apache Tomcat server performance and retrieved legacy records from IBM DB2 database."
                ]
            },
            {
                company: "Wipro Infotech",
                role: "Senior Software Engineer",
                duration: "May 2019 – Mar 2021",
                location: "Chennai, IN",
                responsibilities: [
                    "Managed technical deliverables for enterprise client web portals and integration services.",
                    "Implemented Liferay Kaleo multi-approval workflow for Web Content Management (WCM)."
                ]
            },
            {
                company: "Tech Mahindra",
                role: "Senior Software Engineer",
                duration: "Nov 2017 – Apr 2019",
                location: "Chennai, IN",
                responsibilities: [
                    "Engineered Service Builder finder methods, dynamic queries, and bilingual portal interfaces."
                ]
            },
            {
                company: "Constient Global Solutions",
                role: "System Engineer",
                duration: "Aug 2017 – Oct 2017",
                location: "Chennai, IN",
                responsibilities: [
                    "Implemented Liferay custom notification services and interactive communication portlets."
                ]
            },
            {
                company: "TransIT mPower Labs",
                role: "Software Engineer",
                duration: "Jun 2014 – Jul 2017",
                location: "Bangalore, IN",
                responsibilities: [
                    "Developed portal modules, integrated third-party RESTful APIs, and resolved production bugs."
                ]
            }
        ],
        projects: [
            {
                name: "West Bend Insurance Enterprise Portal",
                role: "Technical Lead",
                duration: "Jan 2024 – Nov 2025",
                client: "WBMI (West Bend Insurance, USA)",
                environment: "Liferay 7.4, Java 17, Spring Boot, IBM DB2, MS SQL, Docker, Azure DevOps",
                description: "Digital self-service and quote preparation portal designed for insurance agents across US states with third-party payment integrations.",
                responsibilities: [
                    "Spearheaded the portal modernization and migration from legacy VB.NET to modular Liferay 7.4 DXP.",
                    "Engineered resilient Service Builder backend services and consumed RESTful Web APIs across microservices.",
                    "Configured OpenLDAP directory integration for secure corporate user authentication and access control.",
                    "Implemented high-performance web content structures and custom themes aligned with enterprise branding.",
                    "Optimized Tomcat application server configurations and JVM garbage collection parameters.",
                    "Executed high-throughput data extraction and batch synchronization from IBM DB2 database clusters.",
                    "Conducted thorough technical architecture reviews and mentored 6+ distributed portal developers."
                ]
            },
            {
                name: "IRDAI Regulatory & Consumer Portal",
                role: "Senior Portal Developer",
                duration: "Jan 2022 – Nov 2023",
                client: "Insurance Regulatory & Development Authority of India",
                environment: "Liferay 7.3, Java, Spring MVC, MySQL, Elasticsearch, Tomcat Server, SonarQube",
                description: "Comprehensive regulatory and policyholder governance portal engineered to monitor national insurance operations.",
                responsibilities: [
                    "Developed custom portlet architectures and automated policyholder grievance reporting modules.",
                    "Integrated Elasticsearch indexing pipelines enabling sub-second search across regulatory circulars.",
                    "Built secure document repository workflows with role-based access management and audit trails.",
                    "Achieved 100% code quality compliance using SonarQube automated static analysis in CI/CD pipelines.",
                    "Handled database schema optimizations across MySQL clusters to sustain peak consumer filing traffic.",
                    "Participated in stakeholder requirement gathering, sprint retrospectives, and production releases."
                ]
            },
            {
                name: "Bank of the West Dealer Portal",
                role: "Lead Full Stack Developer",
                duration: "May 2019 – Mar 2022",
                client: "Bank of the West (USA)",
                environment: "Liferay 7.3, Java, J2EE, REST APIs, MS SQL, Tomcat, Azure DevOps",
                description: "Digital financial management portal enabling automotive dealers to process credit applications and finance quotes in real time.",
                responsibilities: [
                    "Architected custom portlets to consume secure banking REST web services with OAuth2 tokens.",
                    "Implemented automated multi-level approval workflows using Liferay Kaleo workflow engine.",
                    "Engineered responsive dealer dashboard components with live application status tracking.",
                    "Authored automated unit testing suites and enforced strict code review standards across the squad.",
                    "Reduced transaction processing latency by 40% through intelligent API payload caching.",
                    "Collaborated with US onsite coordinators and banking security auditors to ensure SOC2 compliance."
                ]
            },
            {
                name: "State Bank of India Corporate Portal",
                role: "Senior Portal Developer",
                duration: "Dec 2017 – Mar 2019",
                client: "State Bank of India (sbi.co.in)",
                environment: "Liferay 7.1, Java 8, Oracle 11g RDBMS, SVN, Tomcat Server",
                description: "High-volume corporate web portal serving millions of retail and institutional banking customers across India.",
                responsibilities: [
                    "Delivered end-to-end upgrade of the core corporate banking portal from Liferay 6.1 to Liferay 7.1.",
                    "Built bilingual content rendering engines supporting simultaneous English and Hindi languages.",
                    "Developed high-throughput Service Builder database connectors interfacing with Oracle 11g RDBMS.",
                    "Optimized database connection pooling and SQL execution plans for high-traffic financial periods.",
                    "Engineered custom portal themes with WCAG 2.1 accessibility compliance for all consumer devices.",
                    "Led critical production bug triage and patch deployments during nationwide release cycles."
                ]
            }
        ]
    };
}

// DOM Elements
const themeToggleBtn = document.getElementById('themeToggleBtn');
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const loadSampleBtn = document.getElementById('loadSampleBtn');
const uploadSection = document.getElementById('uploadSection');
const loaderSection = document.getElementById('loaderSection');
const workspaceSection = document.getElementById('workspaceSection');
const loaderTitle = document.getElementById('loaderTitle');
const loaderMessage = document.getElementById('loaderMessage');
const progressBarFill = document.getElementById('progressBarFill');
const uploadAnotherBtn = document.getElementById('uploadAnotherBtn');
const loadedFileNameText = document.getElementById('loadedFileNameText');

// Zoom & Toolbar Controls
const zoomInBtn = document.getElementById('zoomInBtn');
const zoomOutBtn = document.getElementById('zoomOutBtn');
const zoomResetBtn = document.getElementById('zoomResetBtn');
const zoomLevelText = document.getElementById('zoomLevelText');
const previewStage = document.getElementById('previewStage');
const resumeSheet = document.getElementById('resumeSheet');
const humanizeAllBtn = document.getElementById('humanizeAllBtn');
const downloadDocxBtn = document.getElementById('downloadDocxBtn');
const downloadPdfBtn = document.getElementById('downloadPdfBtn');
const humanizeSummaryBtn = document.getElementById('humanizeSummaryBtn');
const addExperienceBtn = document.getElementById('addExperienceBtn');
const addProjectBtn = document.getElementById('addProjectBtn');

// AI Settings Modal Elements
const ollamaSettingsBtn = document.getElementById('ollamaSettingsBtn');
const aiSettingsModal = document.getElementById('aiSettingsModal');
const closeModalBtn = document.getElementById('closeModalBtn');
const saveAiSettingsBtn = document.getElementById('saveAiSettingsBtn');
const aiModeSelect = document.getElementById('aiModeSelect');
const ollamaConfigFields = document.getElementById('ollamaConfigFields');
const ollamaEndpointInput = document.getElementById('ollamaEndpointInput');
const ollamaModelInput = document.getElementById('ollamaModelInput');
const testOllamaBtn = document.getElementById('testOllamaBtn');
const ollamaTestStatus = document.getElementById('ollamaTestStatus');
const aiEngineLabel = document.getElementById('aiEngineLabel');

// Form Input Elements
const inputName = document.getElementById('inputName');
const inputTitle = document.getElementById('inputTitle');
const inputExp = document.getElementById('inputExp');
const inputSummary = document.getElementById('inputSummary');
const inputCertifications = document.getElementById('inputCertifications');
const inputEducation = document.getElementById('inputEducation');
const skillsContainer = document.getElementById('skillsContainer');
const addSkillCategoryBtn = document.getElementById('addSkillCategoryBtn');
const experienceContainer = document.getElementById('experienceContainer');
const projectsContainer = document.getElementById('projectsContainer');

// Preview Elements
const previewName = document.getElementById('previewName');
const previewTitle = document.getElementById('previewTitle');
const previewExp = document.getElementById('previewExp');
const previewSummary = document.getElementById('previewSummary');
const previewSkillsTable = document.getElementById('previewSkillsTable');
const previewCertsContainer = document.getElementById('previewCertsContainer');
const previewEduContainer = document.getElementById('previewEduContainer');
const previewExperienceList = document.getElementById('previewExperienceList');
const previewProjectsList = document.getElementById('previewProjectsList');

/* ==========================================================================
   INITIALIZATION & THEME HANDLERS
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    initTheme();
    attachEventListeners();
});

function initTheme() {
    const saved = localStorage.getItem('fc_theme') || 'dark';
    document.documentElement.setAttribute('data-theme', saved);
    if (themeToggleBtn) {
        themeToggleBtn.addEventListener('click', () => {
            const cur = document.documentElement.getAttribute('data-theme');
            const next = cur === 'dark' ? 'light' : 'dark';
            document.documentElement.setAttribute('data-theme', next);
            localStorage.setItem('fc_theme', next);
        });
    }
}

function showToast(message, type = 'info') {
    const toast = document.getElementById('toast');
    const toastMsg = document.getElementById('toastMessage');
    if (!toast || !toastMsg) return;
    toastMsg.textContent = message;
    
    if (type === 'success') toast.style.borderColor = 'var(--success-color)';
    else if (type === 'error') toast.style.borderColor = 'var(--danger-color)';
    else toast.style.borderColor = 'var(--accent-color)';

    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 3500);
}

/* ==========================================================================
   FILE DRAG & DROP AND PARSING PIPELINE
   ========================================================================== */

function attachEventListeners() {
    // Dropzone
    if (dropZone) {
        dropZone.addEventListener('click', (e) => {
            if (e.target.tagName !== 'BUTTON' && !e.target.closest('button')) {
                fileInput.click();
            }
        });
        dropZone.addEventListener('dragover', (e) => { e.preventDefault(); dropZone.classList.add('dragover'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
        dropZone.addEventListener('drop', (e) => {
            e.preventDefault();
            dropZone.classList.remove('dragover');
            if (e.dataTransfer.files.length > 0) processUploadedFile(e.dataTransfer.files[0]);
        });
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) processUploadedFile(e.target.files[0]);
        });
    }

    if (loadSampleBtn) {
        loadSampleBtn.addEventListener('click', () => {
            appState.data = getInitialResumeData();
            appState.fileName = 'Sample_Candidate_Resume.pdf';
            renderEntireWorkspace();
            showToast('Sample candidate resume loaded successfully!', 'success');
        });
    }

    if (uploadAnotherBtn) {
        uploadAnotherBtn.addEventListener('click', () => {
            workspaceSection.style.display = 'none';
            uploadSection.style.display = 'block';
            if (fileInput) fileInput.value = '';
        });
    }

    // Live Input Event Listeners
    setupLiveFormBindings();

    // Zoom Controls
    if (zoomInBtn) zoomInBtn.addEventListener('click', () => adjustZoom(0.1));
    if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => adjustZoom(-0.1));
    if (zoomResetBtn) zoomResetBtn.addEventListener('click', () => resetZoom());

    // Watermark ON / OFF Single Toggle
    const toggleWatermarkBtn = document.getElementById('toggleWatermarkBtn');
    const watermarkToggleLabel = document.getElementById('watermarkToggleLabel');
    const resumeWatermarkContainer = document.getElementById('resumeWatermarkContainer');
    let isWatermarkOn = true;

    if (toggleWatermarkBtn) {
        toggleWatermarkBtn.addEventListener('click', () => {
            isWatermarkOn = !isWatermarkOn;
            if (resumeWatermarkContainer) {
                resumeWatermarkContainer.classList.toggle('hidden', !isWatermarkOn);
            }
            toggleWatermarkBtn.classList.toggle('active', isWatermarkOn);
            if (watermarkToggleLabel) {
                watermarkToggleLabel.textContent = isWatermarkOn ? 'Watermark: ON' : 'Watermark: OFF';
            }
            const icon = toggleWatermarkBtn.querySelector('svg, i');
            if (icon) {
                icon.outerHTML = isWatermarkOn 
                    ? '<i data-lucide="shield-check"></i>' 
                    : '<i data-lucide="shield-off"></i>';
                if (typeof lucide !== 'undefined') lucide.createIcons();
            }
            showToast(isWatermarkOn ? 'Watermark: ON (Centered on page)' : 'Watermark: OFF', 'info');
        });
    }

    // Export Buttons
    if (downloadDocxBtn) downloadDocxBtn.addEventListener('click', exportToDocx);
    if (downloadPdfBtn) downloadPdfBtn.addEventListener('click', exportToPdf);
    if (humanizeAllBtn) humanizeAllBtn.addEventListener('click', humanizeEntireResume);
    if (humanizeSummaryBtn) humanizeSummaryBtn.addEventListener('click', humanizeSummary);

    // Add Dynamic Items
    if (addExperienceBtn) addExperienceBtn.addEventListener('click', addEmptyExperience);
    if (addProjectBtn) addProjectBtn.addEventListener('click', addEmptyProject);

    // AI Settings Modal
    if (ollamaSettingsBtn) ollamaSettingsBtn.addEventListener('click', () => aiSettingsModal.style.display = 'flex');
    if (closeModalBtn) closeModalBtn.addEventListener('click', () => aiSettingsModal.style.display = 'none');
    if (aiModeSelect) {
        aiModeSelect.addEventListener('change', (e) => {
            ollamaConfigFields.style.display = e.target.value === 'ollama' ? 'block' : 'none';
        });
    }
    if (testOllamaBtn) testOllamaBtn.addEventListener('click', testOllamaConnection);
    if (saveAiSettingsBtn) saveAiSettingsBtn.addEventListener('click', saveAiSettings);
}

// Processing File Upload with High-Speed Local Ollama AI Engine
async function processUploadedFile(file) {
    appState.file = file;
    appState.fileName = file.name;
    const ext = file.name.split('.').pop().toLowerCase();

    uploadSection.style.display = 'none';
    loaderSection.style.display = 'flex';
    setLoaderProgress(20, '1. Extracting Text from ' + file.name + '...', 'Reading document stream in memory...');

    try {
        let extractedText = '';
        const arrayBuffer = await file.arrayBuffer();

        if (ext === 'pdf') {
            extractedText = await extractTextFromPdf(arrayBuffer);
        } else if (ext === 'docx' || ext === 'doc') {
            if (typeof mammoth !== 'undefined') {
                const res = await mammoth.extractRawText({ arrayBuffer });
                extractedText = res.value || '';
            }
        } else {
            extractedText = new TextDecoder().decode(arrayBuffer);
        }

        appState.rawText = extractedText;
        setLoaderProgress(45, `2. Running Local AI Model (${appState.ollamaModel})...`, 'Extracting candidate profile, technical competencies & employment history...');

        let structured = null;

        try {
            const aiRes = await fetch('/api/process-resume', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    text: extractedText,
                    model: appState.ollamaModel || 'qwen2.5:latest'
                })
            });

            if (aiRes.ok) {
                const aiJson = await aiRes.json();
                if (aiJson.success && aiJson.data && aiJson.data.name) {
                    structured = aiJson.data;
                }
            }
        } catch (ollamaErr) {
            console.warn('[AI] Ollama server request failed, falling back to local extractor:', ollamaErr);
        }

        if (!structured) {
            structured = await parseRawResumeTextWithNLP(extractedText);
        }

        // Post-processing: Guarantee Forcecraver rules, valid projects & 6-7 humanized bullet points
        setLoaderProgress(85, '3. Finalizing Forcecraver Standards...', 'Generating realistic engineering achievements...');
        sanitizeAndEnrichStructuredData(structured);
        await humanizeProjectsInMemory(structured);

        appState.data = structured;
        setLoaderProgress(100, '4. Rendering Live A4 Preview...', 'Loading live WYSIWYG editor...');

        // Instant Zero-Delay Workspace Render
        loaderSection.style.display = 'none';
        renderEntireWorkspace();
        if (typeof confetti === 'function') {
            confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
        }
        showToast('Resume parsed & humanized in record time!', 'success');

    } catch (err) {
        console.error('File parsing error:', err);
        loaderSection.style.display = 'none';
        uploadSection.style.display = 'block';
        showToast('Failed to parse resume: ' + (err.message || 'Check file format'), 'error');
    }
}

function setLoaderProgress(percent, title, msg) {
    if (progressBarFill) progressBarFill.style.width = percent + '%';
    if (loaderTitle) loaderTitle.textContent = title;
    if (loaderMessage) loaderMessage.textContent = msg;

    const stepId = percent <= 25 ? 'step1' : percent <= 55 ? 'step2' : percent <= 85 ? 'step3' : 'step4';
    ['step1', 'step2', 'step3', 'step4'].forEach(s => {
        const el = document.getElementById(s);
        if (el) {
            if (s === stepId) el.className = 'step-badge active';
            else if (['step1', 'step2', 'step3', 'step4'].indexOf(s) < ['step1', 'step2', 'step3', 'step4'].indexOf(stepId)) el.className = 'step-badge done';
            else el.className = 'step-badge';
        }
    });
}

// High-Speed Multi-Column Aware PDF Text Extractor Helper
async function extractTextFromPdf(arrayBuffer) {
    const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer.slice(0), disableWorker: true });
    const pdf = await loadingTask.promise;
    
    const pagePromises = Array.from({ length: pdf.numPages }, async (_, index) => {
        const pageNum = index + 1;
        const page = await pdf.getPage(pageNum);
        const viewport = page.getViewport({ scale: 1.0 });
        const pageWidth = viewport.width || 595;
        const textContent = await page.getTextContent();
        if (!textContent.items || textContent.items.length === 0) return '';

        const validItems = textContent.items.filter(it => it.str && it.str.trim() && it.transform);
        if (validItems.length === 0) return '';

        // Helper to extract lines from a set of text items
        const extractLinesFromItems = (items) => {
            items.sort((a, b) => b.transform[5] - a.transform[5]);
            const lines = [];
            items.forEach(item => {
                const y = item.transform[5];
                const fontSize = Math.abs(item.transform[0]) || 10;
                const threshold = Math.max(3.5, fontSize * 0.45);

                let line = lines.find(l => Math.abs(l.y - y) <= threshold);
                if (!line) {
                    line = { y, items: [] };
                    lines.push(line);
                }
                line.items.push(item);
            });

            let columnText = '';
            lines.forEach(line => {
                line.items.sort((a, b) => a.transform[4] - b.transform[4]);
                const lineStr = line.items.map(it => it.str).join(' ').trim();
                if (lineStr) columnText += lineStr + '\n';
            });
            return columnText;
        };

        // Multi-column sidebar detection:
        // Check if there is a 2-column or sidebar layout on this page
        let bestSplitX = -1;
        for (let ratio of [0.30, 0.35, 0.40, 0.50]) {
            const split = pageWidth * ratio;
            const left = validItems.filter(it => it.transform[4] < split);
            const right = validItems.filter(it => it.transform[4] >= split);

            if (left.length >= 8 && right.length >= 12) {
                bestSplitX = split;
                break;
            }
        }

        if (bestSplitX > 0) {
            const leftItems = validItems.filter(it => it.transform[4] < bestSplitX);
            const rightItems = validItems.filter(it => it.transform[4] >= bestSplitX);

            const leftText = extractLinesFromItems(leftItems);
            const rightText = extractLinesFromItems(rightItems);
            return leftText + '\n\n' + rightText;
        } else {
            return extractLinesFromItems(validItems);
        }
    });

    const pageTexts = await Promise.all(pagePromises);
    return pageTexts.join('\n\n');
}

/* ==========================================================================
   INTELLIGENT NLP PARSER & ENTITY EXTRACTOR (100% Client-Side Fallback)
   ========================================================================== */

function cleanRawLine(line) {
    return line.replace(/^[•\-\*\d\.\(\)]+\s*/, '').trim();
}

async function parseRawResumeTextWithNLP(fullBlock) {
    const rawLines = fullBlock.split('\n').map(l => l.trim()).filter(Boolean);

    // 1. Extract Candidate Name (Strip emails, phones, parentheses first)
    let candidateName = "CANDIDATE NAME";
    for (let i = 0; i < Math.min(10, rawLines.length); i++) {
        let cleaned = rawLines[i]
            .replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
            .replace(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g, '')
            .replace(/\([^\)]*\)/g, '')
            .replace(/ph:\s*\d+/gi, '')
            .replace(/[^A-Za-z\s.'-]/g, '')
            .trim();

        if (cleaned.length > 2 && cleaned.length < 40 &&
            !/resume|curriculum|profile|experience|summary|email|phone|mobile|developer|engineer|lead|architect|contact|page/i.test(cleaned)) {
            candidateName = cleaned.toUpperCase();
            break;
        }
    }

    // 2. Extract Experience Years (Check for explicit years: e.g. 7+ years, 7 + years, 9 years)
    let expBadge = "Experience: (Fresher / Intern)";
    const expMatch = fullBlock.match(/(\d+(?:\.\d+)?)\s*\+?\s*(?:years?|yrs?)/i);
    if (expMatch) {
        const num = Math.floor(parseFloat(expMatch[1]));
        if (num >= 1) {
            expBadge = `Experience: (${num}+ Years)`;
        }
    } else {
        const isFresher = /fresher|intern|trainee|seeking\s+entry/i.test(fullBlock);
        if (!isFresher) expBadge = "Experience: (1+ Years)";
    }

    // 3. Extract Professional Title
    let professionalTitle = "Senior Software Engineer";
    const titleMatch = fullBlock.match(/\b(Senior\s+Salesforce\s+Developer|Salesforce\s+Developer|Salesforce\s+Technical\s+Lead|Salesforce\s+Consultant|Senior\s+Salesforce\s+Consultant|Site\s+Reliability\s+Engineer|DevOps\s+Engineer|Senior\s+Full\s+Stack\s+Developer|Full\s+Stack\s+Developer|Technical\s+Lead|Tech\s+Lead|Software\s+Architect|Senior\s+Software\s+Engineer|Software\s+Engineer|Cloud\s+Architect|Java\s+Developer)\b/i);
    if (titleMatch) {
        professionalTitle = titleMatch[1].trim();
    }

    // 4. Categorized Skills (Extract directly from text without hardcoded fallbacks)
    const skillsObj = {
        cloud: "",
        languages: "",
        frontend: "",
        databases: "",
        tools: ""
    };

    const skillsMatch = fullBlock.match(/(?:skills|core\s+competencies|technical\s+skills|technical\s+expertise|technologies|core\s+proficiencies)\s*[:.-]?\s*([\s\S]+?)(?=(?:experience\s+details|work\s+experience|professional\s+experience|projects|education|certifications)\b)/i);
    if (skillsMatch) {
        const rawSkills = skillsMatch[1];
        const extractedTokens = rawSkills.split(/[\n,;|•·\t]+/).map(s => s.trim()).filter(s => s.length > 1 && s.length < 50 && !/category|tools|servers|database|systems/i.test(s));
        
        const cloudTokens = extractedTokens.filter(t => /sales\s*cloud|service\s*cloud|community\s*cloud|cpq|aws|azure|gcp|docker|kubernetes|ci\/cd|cloud|terraform|jenkins|server/i.test(t));
        const langTokens = extractedTokens.filter(t => /apex|lwc|aura|visualforce|soql|sosl|triggers|java|spring|boot|python|c#|\.net|node|rest|api|hibernate|javascript|typescript/i.test(t));
        const frontTokens = extractedTokens.filter(t => /react|angular|vue|lightning|html|css|jquery|ajax|json|xml/i.test(t));
        const dbTokens = extractedTokens.filter(t => /sql|soql|sosl|postgres|oracle|mongo|redis|database|dynamo/i.test(t));
        const toolTokens = extractedTokens.filter(t => /git|jira|salesforce\s*cli|gearset|bluecanvas|copado|postman|junit|sonar|agile|scrum|vs\s*code|workato|shopify|zuora/i.test(t));

        if (cloudTokens.length) skillsObj.cloud = Array.from(new Set(cloudTokens)).join(', ');
        if (langTokens.length) skillsObj.languages = Array.from(new Set(langTokens)).join(', ');
        if (frontTokens.length) skillsObj.frontend = Array.from(new Set(frontTokens)).join(', ');
        if (dbTokens.length) skillsObj.databases = Array.from(new Set(dbTokens)).join(', ');
        if (toolTokens.length) skillsObj.tools = Array.from(new Set(toolTokens)).join(', ');
    }

    // 5. Extract Summary
    let summaryText = "";
    const summaryMatch = fullBlock.match(/(?:professional\s+summary|executive\s+summary|summary|profile\s+summary)\s*[:.-]?\s*([\s\S]+?)(?=(?:skills|core\s+competencies|technical\s+skills|experience\s+details|work\s+experience|experience|employment|projects|education|certifications)\b)/i);
    if (summaryMatch) {
        summaryText = normalizeProfessionalSummary(summaryMatch[1], professionalTitle, expBadge, skillsObj);
    }
    if (!summaryText || summaryText.length < 50) {
        summaryText = generateDefaultSummary(professionalTitle, expBadge, skillsObj);
    }

    // 6. Extract Education & Certifications (Strict Table Header Filtering)
    const certsList = [];
    const eduList = [];

    // Check for explicit CERTIFICATIONS section
    const certMatch = fullBlock.match(/(?:certifications?|licenses?\s*&(?:amp;)?\s*certifications?|credentials?)\s*[:.-]?\s*([\s\S]+?)(?=(?:education|academic|work\s+experience|professional\s+experience|experience|projects|skills)\b)/i);
    if (certMatch) {
        const lines = certMatch[1].split(/[\n;•·]+/);
        lines.forEach(l => {
            const clean = filterAndCleanEduCertText(l);
            if (clean && clean.length > 3 && clean.length < 120) {
                certsList.push(clean);
            }
        });
    }

    // Check for explicit EDUCATION section
    const eduMatch = fullBlock.match(/(?:education|academic\s+background|qualifications?)\s*[:.-]?\s*([\s\S]+?)(?=(?:certifications?|work\s+experience|professional\s+experience|experience|projects|skills)\b)/i);
    if (eduMatch) {
        const lines = eduMatch[1].split(/[\n;•·]+/);
        lines.forEach(l => {
            const clean = filterAndCleanEduCertText(l);
            if (clean && clean.length > 3 && clean.length < 140) {
                eduList.push(clean);
            }
        });
    }

    // 7. Extract Companies (Dynamic Multi-Company Extractor across all candidate employers)
    const companies = [];
    const expSectionMatch = fullBlock.match(/(?:work\s+experience|professional\s+experience|employment\s+history|experience\s+details|experience)\s*[:.-]?\s*([\s\S]+?)(?=(?:projects?\s+detail|projects?|education|certifications?|academic|technical\s+skills)\b)/i);
    const expText = expSectionMatch ? expSectionMatch[1] : fullBlock;

    // Detect lines like "Role | Company Date – Date" or "Company | Role Date – Date"
    const companyHeaderRegex = /(?:^|\n)\s*([A-Za-z0-9\s,&/().'-]+?)\s*[|–—•-]\s*([A-Za-z0-9\s,&/().'-]+?)(?:\s*[|–—•-]\s*|\s+)([A-Za-z]{3,9}\s*\d{4}|\d{4})\s*[-–—to]+\s*(Present|Current|Till\s*Date|Ongoing|[A-Za-z]{3,9}\s*\d{4}|\d{4})/gi;
    
    let match;
    const matchedBlocks = [];
    while ((match = companyHeaderRegex.exec(expText)) !== null) {
        matchedBlocks.push({
            index: match.index,
            part1: match[1].trim(),
            part2: match[2].trim(),
            startDate: match[3].trim(),
            endDate: match[4].trim(),
            fullHeader: match[0]
        });
    }

    if (matchedBlocks.length > 0) {
        matchedBlocks.forEach((mb, idx) => {
            const nextIdx = (idx + 1 < matchedBlocks.length) ? matchedBlocks[idx + 1].index : expText.length;
            const blockContent = expText.substring(mb.index + mb.fullHeader.length, nextIdx).trim();
            const bullets = blockContent.split('\n')
                .map(l => l.replace(/^[•\-\*\d\.\(\)]+\s*/, '').trim())
                .filter(l => l.length > 15 && l.length < 350 && !/^(?:education|certifications?|projects?|skills)\b/i.test(l));

            let compName = mb.part2;
            let roleName = mb.part1;
            if (/engineer|developer|lead|consultant|architect|manager|analyst|specialist|officer|associate|intern/i.test(mb.part2) && !/engineer|developer|lead|consultant/i.test(mb.part1)) {
                compName = mb.part1;
                roleName = mb.part2;
            }

            const duration = `${mb.startDate} – ${mb.endDate}`;
            const isPresent = /present|current|till\s*date|ongoing/i.test(mb.endDate);

            companies.push({
                company: (idx === 0 || isPresent) ? "Forcecraver Technologies Pvt. Ltd." : compName,
                role: roleName || professionalTitle,
                duration: duration,
                location: "Bengaluru, IN",
                responsibilities: bullets.length ? bullets.slice(0, 6) : [
                    "Led enterprise system engineering and technical deliverables for production microservices.",
                    "Collaborated with cross-functional development and QA teams to ensure high availability.",
                    "Optimized database query performance and streamlined incident response workflows."
                ]
            });
        });
    }

    if (companies.length === 0) {
        companies.push({
            company: "Forcecraver Technologies Pvt. Ltd.",
            role: professionalTitle,
            duration: "Jan 2022 – Present",
            location: "Bengaluru, IN",
            responsibilities: [
                "Spearhead architectural design and full-stack development for high-volume enterprise portals.",
                "Mentor engineering team members, conduct sprint code reviews, and enforce quality standards.",
                "Implement scalable microservices and cloud infrastructure reducing server response latency by 35%."
            ]
        });
    }

    // 8. Extract Projects
    let extractedProjects = [];
    const projectSplits = fullBlock.split(/(?:(?:^|\n)\s*(?:Project\s*(?:#\s*\d+|\d+|:)|PROJECT\s*(?:#\s*\d+|\d+|:)))/i);

    if (projectSplits.length > 1) {
        for (let i = 1; i < Math.min(6, projectSplits.length); i++) {
            const block = projectSplits[i];
            const lines = block.split('\n').map(l => l.trim()).filter(Boolean);
            if (lines.length === 0) continue;

            let firstLine = lines[0].replace(/^[:.-]\s*/, '').trim();
            let duration = "14 Months";
            const dateMatch = firstLine.match(/\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})[^\n\r]*/i);
            if (dateMatch) {
                duration = dateMatch[0].trim();
                firstLine = firstLine.replace(dateMatch[0], '').replace(/[-–—/]\s*$/, '').trim();
            }

            const projectName = firstLine || `Enterprise Project ${i}`;

            let client = "Confidential";
            const clientMatch = block.match(/(?:Client|Project\s*Domain|Customer)\s*[:.-]?\s*([^\n\r]+)/i);
            if (clientMatch) client = clientMatch[1].trim();

            let role = professionalTitle || "Portal Developer";
            const roleMatch = block.match(/(?:Role|Designation)\s*[:.-]?\s*([^\n\r]+)/i);
            if (roleMatch) role = roleMatch[1].trim();

            let env = skillsObj.languages + ", " + skillsObj.cloud;
            const envMatch = block.match(/(?:Environment|Tech\s*Stack|Technologies|Languages)\s*(?:\([^\)]*\))?\s*[:.-]?\s*([^\n\r]+)/i);
            if (envMatch) env = envMatch[1].replace(/skill\s*versions|portal\s*technology\s*:/gi, '').trim();

            let desc = "";
            const descMatch = block.match(/(?:Project\s*Description|Description)\s*[:.-]?\s*([\s\S]+?)(?=(?:Responsibilities|Environment|Tools|Server|$))/i);
            if (descMatch) desc = descMatch[1].replace(/\n+/g, ' ').trim();
            if (!desc) desc = `High-throughput digital portal engineered for enterprise users, providing seamless integration and optimized performance.`;

            let responsibilities = [];
            const respMatch = block.match(/(?:Responsibilities|Key\s*Responsibilities)\s*[:.-]?\s*([\s\S]+?)(?=(?:Project\s*(?:#|\d+|:)|$))/i);
            if (respMatch) {
                responsibilities = respMatch[1].split('\n')
                    .map(l => l.replace(/^[•\-\*\d\.]+\s*/, '').trim())
                    .filter(l => l.length > 10);
            }

            extractedProjects.push({
                name: projectName.substring(0, 60),
                role: role,
                duration: duration,
                client: client,
                environment: env,
                description: desc,
                responsibilities: responsibilities
            });
        }
    }

    return {
        name: candidateName,
        title: professionalTitle,
        experience: expBadge,
        summary: summaryText,
        skills: normalizeSkillsStructure(skillsObj),
        certifications: Array.from(new Set(certsList)),
        education: Array.from(new Set(eduList)),
        companies: companies,
        projects: extractedProjects
    };
}

/* ==========================================================================
   AI HUMANIZER & BULLET POLISHING ENGINE (6-7 Lines Without AI Clichés)
   ========================================================================== */

async function humanizeProjectsInMemory(data) {
    if (!data.projects || data.projects.length === 0) return;

    for (let p of data.projects) {
        p.responsibilities = generateHumanizedProjectBullets(p.name, p.environment, p.role);
    }
}

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

function normalizeProfessionalSummary(summary, title, experience, skills) {
    if (!summary || typeof summary !== 'string') {
        return generateDefaultSummary(title, experience, skills);
    }

    let s = summary.trim();

    // 1. Remove heading prefixes
    s = s.replace(/^(?:CORE\s*PROFICIENCIES|PROFESSIONAL\s*SUMMARY|EXECUTIVE\s*SUMMARY|CORE\s*COMPETENCIES|PROFILE\s*SUMMARY)\s*[:.-]?\s*/i, '');

    // 2. Remove project highlights, client descriptions, key contributions dumped into summary
    s = s.replace(/(?:Project\s*Highlight|Project\s*Description|Key\s*Contributions|Key\s*Responsibilities|Client\s*:|Environment\s*:|Tools\/Tech\s*:)[\s\S]*/i, '');
    
    // 3. Remove leading bullet symbols, broken words, or orphan punctuation
    s = s.replace(/^[•\-\*\d\.\(\)\s,;:|]+/, '');
    s = s.replace(/^[a-z0-9]+\s*\.\s*/i, '');

    // 4. Remove email, phone, addresses
    s = s.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '')
         .replace(/(?:\+?\d{1,3}[\s-]?)?\(?\d{3}\)?[\s-]?\d{3}[\s-]?\d{4}/g, '')
         .replace(/ph:\s*\d+/gi, '');

    // 5. Normalize spaces
    s = s.replace(/\s+/g, ' ').trim();

    // 6. Fix trailing broken sentences like "with 7 + years of."
    if (/\b(?:with|of|in|and|for)\s*\.?$/i.test(s) || s.length < 50) {
        return generateDefaultSummary(title, experience, skills);
    }

    if (!/[.!?]$/.test(s)) s += '.';

    return s;
}

function generateDefaultSummary(title, experience, skills) {
    const roleTitle = title || 'Senior Software Engineer';
    const cleanExp = experience ? experience.replace(/Experience:\s*/i, '').replace(/[()]/g, '').trim() : '';
    const expClause = cleanExp ? `with over ${cleanExp} of` : 'with';
    const cloudStack = (skills && skills.cloud) ? skills.cloud : 'modern cloud infrastructure';
    const backendStack = (skills && skills.languages) ? skills.languages : 'scalable software systems';

    return `Dynamic and results-driven ${roleTitle} ${expClause} comprehensive expertise in designing, developing, and deploying enterprise applications. Demonstrated proficiency across ${cloudStack}, ${backendStack}, and distributed architectures. Proven track record of optimizing system performance, leading cross-functional engineering deliverables, and maintaining high software quality standards.`;
}

// Guarantee valid project titles, roles, environments, exactly 6-7 bullets, and single Forcecraver company
function sanitizeAndEnrichStructuredData(data) {
    if (!data) return;

    // Normalize Candidate Name
    if (!data.name || data.name.trim().length === 0) {
        data.name = "CANDIDATE NAME";
    }

    // Normalize Experience (Smart Fresher vs Experienced detection)
    data.experience = normalizeExperienceString(data.experience, data.title, data.summary, data.companies);

    // Normalize Summary (Strict isolation from project highlights)
    data.summary = normalizeProfessionalSummary(data.summary, data.title, data.experience, data.skills);

    // Normalize Skills as dynamic array of categories
    data.skills = normalizeSkillsStructure(data.skills);
    if (!data.skills || data.skills.length === 0) {
        data.skills = [
            { label: "Cloud & DevOps", value: "AWS, Azure DevOps, Docker, Kubernetes, CI/CD" },
            { label: "Languages & Stack", value: "Java, Python, Spring Boot, REST APIs" },
            { label: "Frontend & UI", value: "React, JavaScript, HTML5, CSS3" },
            { label: "Databases & Storage", value: "PostgreSQL, Oracle, MySQL, Redis" },
            { label: "Tools & Methodologies", value: "Git, VS Code, Jira, Agile, Scrum" }
        ];
    }

    // Normalize Certifications (Strict Filtering without fake defaults)
    if (!Array.isArray(data.certifications)) {
        data.certifications = typeof data.certifications === 'string' ? [data.certifications] : [];
    } else {
        data.certifications = data.certifications.map(c => {
            let str = '';
            if (typeof c === 'object' && c !== null) str = c.name || c.title || c.certification || '';
            else str = String(c);
            return filterAndCleanEduCertText(str);
        }).filter(Boolean);
    }

    // Normalize Education (Strict Filtering without fake defaults)
    if (!Array.isArray(data.education)) {
        data.education = typeof data.education === 'string' ? [data.education] : [];
    } else {
        data.education = data.education.map(e => {
            let str = '';
            if (typeof e === 'object' && e !== null) {
                str = `${e.degree || e.title || ''} ${e.institution || e.university || ''} ${e.year || ''} ${e.result || e.cgpa || ''}`.trim();
            } else {
                str = String(e);
            }
            return filterAndCleanEduCertText(str);
        }).filter(Boolean);
    }

    // Normalize Companies (Accurately detect the PRESENT company and replace with Forcecraver)
    if (!Array.isArray(data.companies) || data.companies.length === 0) {
        data.companies = [
            {
                company: "Forcecraver Technologies Pvt. Ltd.",
                role: data.title || "Technical Lead",
                duration: "Jan 2022 – Present",
                location: "Bengaluru, IN",
                responsibilities: [
                    "Spearhead core software development and architectural deliverables for enterprise clients.",
                    "Collaborate with cross-functional engineering and QA teams to maintain code quality.",
                    "Implement scalable backend APIs and optimize database query performance."
                ]
            }
        ];
    } else {
        // Find the PRESENT / CURRENT company:
        let presentIdx = -1;
        for (let i = 0; i < data.companies.length; i++) {
            const dur = String(data.companies[i].duration || '').toLowerCase();
            if (/present|current|till\s*date|ongoing|now/i.test(dur)) {
                presentIdx = i;
                break;
            }
        }

        if (presentIdx === -1) {
            let maxYear = -1;
            for (let i = 0; i < data.companies.length; i++) {
                const dur = String(data.companies[i].duration || '');
                const years = dur.match(/\b(20\d\d)\b/g);
                if (years) {
                    const latestYear = Math.max(...years.map(Number));
                    if (latestYear > maxYear) {
                        maxYear = latestYear;
                        presentIdx = i;
                    }
                }
            }
        }

        if (presentIdx === -1) presentIdx = 0;

        // Clone and format
        const formattedCompanies = data.companies.map((c, idx) => {
            const isPresent = (idx === presentIdx);
            const compName = isPresent ? "Forcecraver Technologies Pvt. Ltd." : (c.company || c.name || "Previous Organization");
            const compObj = {
                company: compName,
                role: c.role || c.title || data.title || "Software Engineer",
                duration: c.duration || (isPresent ? "2022 – Present" : "2020 – 2022"),
                location: c.location || "Bengaluru, IN",
                responsibilities: []
            };

            if (Array.isArray(c.responsibilities)) {
                compObj.responsibilities = c.responsibilities.map(r => String(r)).filter(Boolean);
            } else if (typeof c.responsibilities === 'string') {
                compObj.responsibilities = c.responsibilities.split('\n').map(r => r.trim()).filter(Boolean);
            }

            if (compObj.responsibilities.length === 0) {
                compObj.responsibilities = [
                    "Spearhead core software development and architectural deliverables for enterprise clients.",
                    "Collaborate with cross-functional engineering and QA teams to maintain code quality.",
                    "Implement scalable backend APIs and optimize database query performance."
                ];
            }
            return compObj;
        });

        // Ensure Present company is always index 0 (Top of Professional Experience)
        if (presentIdx > 0 && formattedCompanies.length > presentIdx) {
            const [presentComp] = formattedCompanies.splice(presentIdx, 1);
            formattedCompanies.unshift(presentComp);
        }

        data.companies = formattedCompanies;
    }

    // Normalize Projects (Do NOT inject fake sample projects if candidate has none)
    if (!Array.isArray(data.projects)) {
        data.projects = [];
    }
    data.projects = data.projects.map((p, idx) => {
            let pName = (p.name || p.project || '').trim();
            // Strip leading prefixes like "PROJECT 1: ", "Project 2:", "1. "
            pName = pName.replace(/^project\s*(?:#?\d+|\d+|:)\s*[:.-]?\s*/i, '').replace(/^\d+[\.\)]\s*/, '').trim();

            if (!pName) {
                pName = `Enterprise Software Project ${idx + 1}`;
            }

            const pRole = p.role || data.title || "Developer";
            const pEnv = p.environment || `${data.skills.languages || 'Java, Spring Boot'}, ${data.skills.frontend || 'React, Liferay DXP'}, ${data.skills.databases || 'PostgreSQL'}`;
            const pClient = p.client || 'Confidential';
            const pDesc = cleanProjectDescription(p.description, pName, pRole, pEnv);

            let pBullets = [];
            if (Array.isArray(p.responsibilities)) {
                pBullets = p.responsibilities.map(b => String(b)).filter(Boolean);
            } else if (typeof p.responsibilities === 'string') {
                pBullets = p.responsibilities.split('\n').map(b => b.trim()).filter(Boolean);
            }

            // Always expand to 6-7 bullets
            if (pBullets.length < 6) {
                const expanded = generateHumanizedProjectBullets(pName, pEnv, pRole);
                pBullets = Array.from(new Set([...pBullets, ...expanded])).slice(0, 7);
            }

            return {
                name: pName,
                role: pRole,
                duration: p.duration || "12 Months",
                client: pClient,
                environment: pEnv,
                description: pDesc,
                responsibilities: pBullets
            };
        });
}

function cleanProjectDescription(rawDesc, projectName, role, env) {
    if (!rawDesc || typeof rawDesc !== 'string') {
        return `Engineered a scalable enterprise solution delivering automated processing, high availability, and robust API workflows.`;
    }

    let s = rawDesc.trim();

    // 1. Cut off at "Key Contributions", "Responsibilities", "Highlights", "Achievements", "Tools", "Client", or next Company
    s = s.replace(/(?:Key\s*Contributions?|Responsibilities|Highlights|Achievements|Key\s*Deliverables|Core\s*Responsibilities|Tech\s*Stack|Tools|Environment|Client\s*:|Duration\s*:|Alliance\s*technologies|JAN|FEB|MAR|APR|MAY|JUN|JUL|AUG|SEP|OCT|NOV|DEC)[\s\S]*/i, '');

    // 2. Remove leading bullet symbols, broken words, or orphan punctuation
    s = s.replace(/^[•\-\*\d\.\(\)\s,;:|]+/, '');
    s = s.replace(/^[a-z0-9]{1,2}\s+(?:to|for|and|in)\s+/i, 'Designed system to ');

    // 3. Remove email, phone, addresses
    s = s.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, '');
    s = s.replace(/\s+/g, ' ').trim();

    // 4. Limit to max 2 crisp sentences / ~200 characters
    const sentences = s.split(/(?<=[.!?])\s+/).filter(Boolean);
    if (sentences.length > 2) {
        s = sentences.slice(0, 2).join(' ');
    }
    if (s.length > 220) {
        s = s.substring(0, 217).trim() + '...';
    }

    if (s.length < 25) {
        return `Engineered an end-to-end scalable application for ${projectName || 'enterprise workflows'}, optimizing API performance and data processing.`;
    }

    if (!/[.!?]$/.test(s)) s += '.';
    return s;
}

// Generate 6-7 realistic, impactful, natural domain-specific engineer bullet points
function generateHumanizedProjectBullets(projectName, env, role) {
    const isLead = /lead|architect|senior|manager/i.test(role);
    const envLower = `${env || ''} ${projectName || ''}`.toLowerCase();

    // 1. Computer Vision / ML / Deep Learning / AI / OCR
    if (/opencv|ocr|vision|easyocr|east|vgg|mtcnn|pytorch|tensorflow|cnn|scikit|image|detection|recognition|yolo|mediapipe|nlp|llm|deep\s*learning|machine\s*learning|gesture/i.test(envLower)) {
        return [
            `Engineered the end-to-end architecture and deep learning pipeline for ${projectName}.`,
            `Implemented robust dataset preprocessing, image normalization, and data augmentation workflows using OpenCV.`,
            `Integrated GPU-accelerated inference pipelines to cut latency by over 40% for real-time video-frame processing.`,
            `Trained, fine-tuned, and benchmarked neural network models achieving superior accuracy and precision metrics.`,
            `Designed custom confidence thresholding and similarity scoring algorithms to minimize false-positive detections.`,
            `Engineered real-time frame capture and feature localized extraction modules operating smoothly at 30+ FPS.`,
            `Packaged the inference pipeline into modular Python services for seamless integration with client applications.`
        ];
    }

    // 2. ETL / Data Engineering / QA Automation
    if (/etl|snowflake|tosca|sql|databricks|qa|tester|test\s*case|informatica|data\s*pipeline|airflow|dbeaver/i.test(envLower)) {
        return [
            `Spearheaded automated end-to-end data pipeline validation and ETL test suites for ${projectName}.`,
            `Architected automated reconciliation test frameworks to verify row counts, checksums, and schema integrity across data warehouse layers.`,
            `Constructed optimized SQL audit scripts to validate complex multi-table joins, lookups, and stored procedure business logic.`,
            `Automated high-impact regression and functional test cases, reducing manual testing cycles by 40%.`,
            `Validated batch and incremental delta-load workflows ensuring accurate watermark logic and audit column compliance.`,
            `Embedded automated test execution and anomaly detection into CI/CD pipelines for continuous quality gates.`,
            `Collaborated with cross-functional data engineering and stakeholder teams to maintain zero-defect release readiness.`
        ];
    }

    // 3. Full Stack / Web / Cloud
    const hasCloud = /aws|azure|cloud|docker|kubernetes/i.test(env);
    const hasDb = /sql|postgres|oracle|mongo|db2|mysql|informix/i.test(env);
    return [
        `Spearheaded the modular design, responsive frontend development, and production deployment of ${projectName}.`,
        `Architected resilient RESTful backend APIs and microservices, improving request handling and data throughput by 38%.`,
        `Designed an intuitive, accessible user interface utilizing modern responsive design principles and component-driven architecture.`,
        hasCloud ? `Implemented automated CI/CD build and deployment pipelines to accelerate production delivery cycles.`
                 : `Engineered optimized frontend asset delivery and client-side caching, achieving sub-2-second page load times.`,
        hasDb ? `Optimized database indexing and queries across relational data models, reducing average query execution latency by 45%.`
              : `Engineered efficient state management and modular reusable components for maintainable software architecture.`,
        `Engineered secure authentication, input validation, and role-based access control (RBAC) protocols.`,
        isLead ? `Conducted technical code reviews, guided junior developers on engineering best practices, and managed sprint deliverables.`
               : `Collaborated closely with cross-functional QA and product teams to translate business requirements into clean, testable code.`
    ];
}

// Humanize Single Project Button Handler
window.humanizeSingleProject = function(index) {
    if (appState.data.projects && appState.data.projects[index]) {
        const p = appState.data.projects[index];
        p.responsibilities = generateHumanizedProjectBullets(p.name, p.environment, p.role);
        renderEntireWorkspace();
        showToast(`Project "${p.name}" humanized with 7 clean action bullets!`, 'success');
    }
};

// Humanize Summary
function humanizeSummary() {
    const d = appState.data;
    const title = d.title || "Senior Software Engineer";
    const cleanExp = (d.experience || "2+ Years").replace(/Experience:\s*/i, '').replace(/[()]/g, '').trim();
    const expClause = cleanExp ? `with over ${cleanExp} of` : 'with';
    const cloud = (d.skills && d.skills.cloud) ? d.skills.cloud : "AWS and Cloud infrastructure";
    const langs = (d.skills && d.skills.languages) ? d.skills.languages : "backend services";
    
    d.summary = `Dynamic and results-driven ${title} ${expClause} extensive hands-on expertise in architecting, building, and deploying enterprise-scale software solutions. Demonstrated mastery in ${cloud}, ${langs}, and high-throughput systems. Proven track record in driving engineering best practices, optimizing system performance, and delivering robust mission-critical solutions on time.`;
    
    renderEntireWorkspace();
    showToast('Professional summary humanized with engineering impact!', 'success');
}

// Humanize Entire Resume
function humanizeEntireResume() {
    humanizeSummary();
    humanizeProjectsInMemory(appState.data);
    renderEntireWorkspace();
    if (typeof confetti === 'function') confetti({ particleCount: 50, spread: 50 });
    showToast('Full resume & all 6-7 line project bullets humanized!', 'success');
}

/* ==========================================================================
   WORKSPACE RENDERING & LIVE BINDING
   ========================================================================== */

function renderEntireWorkspace() {
    uploadSection.style.display = 'none';
    loaderSection.style.display = 'none';
    workspaceSection.style.display = 'flex';

    if (loadedFileNameText) loadedFileNameText.textContent = appState.fileName || 'Candidate_Resume.pdf';

    const d = appState.data;

    // Populate Left Editor Form Inputs
    if (inputName) inputName.value = d.name || '';
    if (inputTitle) inputTitle.value = d.title || '';
    if (inputExp) inputExp.value = d.experience || '';
    if (inputSummary) inputSummary.value = d.summary || '';
    if (inputCertifications) inputCertifications.value = (d.certifications || []).join('\n');
    if (inputEducation) inputEducation.value = (d.education || []).join('\n');

    // Render Dynamic Skills Form in Editor
    renderDynamicSkillsForm();

    // Render Dynamic Experience Cards in Editor
    renderDynamicExperienceForm();

    // Render Dynamic Projects Cards in Editor
    renderDynamicProjectsForm();

    // Render Live A4 Sheet Preview
    renderLiveResumePreview();

    // Ensure all accordions are uncollapsed
    document.querySelectorAll('.form-card').forEach(card => card.classList.remove('collapsed'));

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function setupLiveFormBindings() {
    const bind = (el, key, subkey = null) => {
        if (!el) return;
        el.addEventListener('input', (e) => {
            if (subkey) appState.data[key][subkey] = e.target.value;
            else appState.data[key] = e.target.value;
            renderLiveResumePreview();
        });
    };

    bind(inputName, 'name');
    bind(inputTitle, 'title');
    bind(inputExp, 'experience');
    bind(inputSummary, 'summary');

    if (inputCertifications) {
        inputCertifications.addEventListener('input', (e) => {
            appState.data.certifications = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
            renderLiveResumePreview();
        });
    }

    if (inputEducation) {
        inputEducation.addEventListener('input', (e) => {
            appState.data.education = e.target.value.split('\n').map(s => s.trim()).filter(Boolean);
            renderLiveResumePreview();
        });
    }
}

// Render Form Dynamic Skills List
function renderDynamicSkillsForm() {
    if (!skillsContainer) return;
    skillsContainer.innerHTML = '';
    const skillsList = normalizeSkillsStructure(appState.data.skills);
    appState.data.skills = skillsList;

    skillsList.forEach((s, idx) => {
        const card = document.createElement('div');
        card.className = 'dynamic-skill-card';
        card.innerHTML = `
            <div class="dynamic-skill-top">
                <input type="text" class="form-input" style="font-weight:700; width: 70%;" value="${escapeHtml(s.label)}" placeholder="Category Name (e.g. Salesforce Platform)" oninput="updateSkillCategoryLabel(${idx}, this.value)">
                <button type="button" class="btn-micro-danger" onclick="deleteSkillCategory(${idx})">
                    <i data-lucide="trash-2"></i> Delete
                </button>
            </div>
            <textarea class="form-textarea" rows="2" placeholder="Skills (e.g. Apex, LWC, Aura, Visualforce...)" oninput="updateSkillCategoryValue(${idx}, this.value)">${escapeHtml(s.value)}</textarea>
        `;
        skillsContainer.appendChild(card);
    });

    if (typeof lucide !== 'undefined') lucide.createIcons();
}

window.updateSkillCategoryLabel = (idx, label) => {
    if (appState.data.skills && appState.data.skills[idx]) {
        appState.data.skills[idx].label = label;
        renderLiveResumePreview();
    }
};

window.updateSkillCategoryValue = (idx, val) => {
    if (appState.data.skills && appState.data.skills[idx]) {
        appState.data.skills[idx].value = val;
        renderLiveResumePreview();
    }
};

window.deleteSkillCategory = (idx) => {
    if (appState.data.skills && appState.data.skills[idx]) {
        appState.data.skills.splice(idx, 1);
        renderDynamicSkillsForm();
        renderLiveResumePreview();
    }
};

window.addEmptySkillCategory = () => {
    if (!Array.isArray(appState.data.skills)) {
        appState.data.skills = normalizeSkillsStructure(appState.data.skills);
    }
    appState.data.skills.push({
        label: 'New Skill Category',
        value: ''
    });
    renderDynamicSkillsForm();
    renderLiveResumePreview();
};

// Render Form Experience List
function renderDynamicExperienceForm() {
    if (!experienceContainer) return;
    experienceContainer.innerHTML = '';

    (appState.data.companies || []).forEach((c, idx) => {
        const card = document.createElement('div');
        card.className = 'dynamic-item-card';
        card.innerHTML = `
            <div class="item-card-topbar">
                <span class="item-card-title">#${idx + 1} Company: ${escapeHtml(c.company)}</span>
                <button type="button" class="btn-micro-danger" onclick="deleteExperienceItem(${idx})">
                    <i data-lucide="trash-2"></i> Delete
                </button>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>Company Name</label>
                    <input type="text" class="form-input" value="${escapeHtml(c.company)}" oninput="updateCompanyField(${idx}, 'company', this.value)">
                </div>
                <div class="form-group">
                    <label>Role / Title</label>
                    <input type="text" class="form-input" value="${escapeHtml(c.role)}" oninput="updateCompanyField(${idx}, 'role', this.value)">
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>Duration / Dates</label>
                    <input type="text" class="form-input" value="${escapeHtml(c.duration)}" oninput="updateCompanyField(${idx}, 'duration', this.value)">
                </div>
                <div class="form-group">
                    <label>Location</label>
                    <input type="text" class="form-input" value="${escapeHtml(c.location || 'Bengaluru, IN')}" oninput="updateCompanyField(${idx}, 'location', this.value)">
                </div>
            </div>
            <div class="form-group">
                <label>Key Responsibilities (One per line)</label>
                <textarea class="form-textarea bullet-textarea" rows="3" oninput="updateCompanyBullets(${idx}, this.value)">${escapeHtml((c.responsibilities || []).join('\n'))}</textarea>
            </div>
        `;
        experienceContainer.appendChild(card);
    });
}

// Render Form Projects List
function renderDynamicProjectsForm() {
    if (!projectsContainer) return;
    projectsContainer.innerHTML = '';

    (appState.data.projects || []).forEach((p, idx) => {
        const card = document.createElement('div');
        card.className = 'dynamic-item-card';
        card.innerHTML = `
            <div class="item-card-topbar">
                <span class="item-card-title">PROJECT ${idx + 1}: ${escapeHtml(p.name)}</span>
                <div style="display:flex; gap:6px;">
                    <button type="button" class="btn-micro" onclick="humanizeSingleProject(${idx})">
                        <i data-lucide="wand-2"></i> Humanize 7 Bullets
                    </button>
                    <button type="button" class="btn-micro-danger" onclick="deleteProjectItem(${idx})">
                        <i data-lucide="trash-2"></i> Delete
                    </button>
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>Project Name</label>
                    <input type="text" class="form-input" value="${escapeHtml(p.name)}" oninput="updateProjectField(${idx}, 'name', this.value)">
                </div>
                <div class="form-group">
                    <label>Role</label>
                    <input type="text" class="form-input" value="${escapeHtml(p.role)}" oninput="updateProjectField(${idx}, 'role', this.value)">
                </div>
            </div>
            <div class="form-grid-2">
                <div class="form-group">
                    <label>Client</label>
                    <input type="text" class="form-input" value="${escapeHtml(p.client || 'Enterprise Client')}" oninput="updateProjectField(${idx}, 'client', this.value)">
                </div>
                <div class="form-group">
                    <label>Duration</label>
                    <input type="text" class="form-input" value="${escapeHtml(p.duration)}" oninput="updateProjectField(${idx}, 'duration', this.value)">
                </div>
            </div>
            <div class="form-group">
                <label>Environment / Tech Stack</label>
                <input type="text" class="form-input" value="${escapeHtml(p.environment || '')}" oninput="updateProjectField(${idx}, 'environment', this.value)">
            </div>
            <div class="form-group">
                <label>Project Description</label>
                <textarea class="form-textarea" rows="2" oninput="updateProjectField(${idx}, 'description', this.value)">${escapeHtml(p.description || '')}</textarea>
            </div>
            <div class="form-group">
                <label>Responsibilities & Achievements (6-7 Bullet Lines, One per line)</label>
                <textarea class="form-textarea bullet-textarea" rows="6" oninput="updateProjectBullets(${idx}, this.value)">${escapeHtml((p.responsibilities || []).join('\n'))}</textarea>
            </div>
        `;
        projectsContainer.appendChild(card);
    });
}

// Live Update Handlers for Dynamic Form
window.updateCompanyField = (idx, field, val) => {
    if (appState.data.companies && appState.data.companies[idx]) {
        appState.data.companies[idx][field] = val;
        const titles = document.querySelectorAll('#experienceContainer .item-card-title');
        if (titles && titles[idx] && field === 'company') {
            titles[idx].textContent = `#${idx + 1} Company: ${val || 'Company ' + (idx + 1)}`;
        }
        renderLiveResumePreview();
    }
};
window.updateCompanyBullets = (idx, val) => {
    if (appState.data.companies && appState.data.companies[idx]) {
        appState.data.companies[idx].responsibilities = val.split('\n').map(s => s.trim()).filter(Boolean);
        renderLiveResumePreview();
    }
};
window.deleteExperienceItem = (idx) => {
    if (appState.data.companies && appState.data.companies.length > idx) {
        appState.data.companies.splice(idx, 1);
        renderDynamicExperienceForm();
        renderLiveResumePreview();
        showToast('Company removed from experience list.', 'info');
    }
};
function addEmptyExperience() {
    appState.data.companies.push({
        company: "Previous Organization Name",
        role: "Software Engineer",
        duration: "Jan 2018 – May 2021",
        location: "Bengaluru, IN",
        responsibilities: [
            "Contributed to core feature engineering and backend microservices.",
            "Integrated third-party APIs and performed code optimization."
        ]
    });
    renderDynamicExperienceForm();
    renderLiveResumePreview();
}

window.updateProjectField = (idx, field, val) => {
    if (appState.data.projects && appState.data.projects[idx]) {
        appState.data.projects[idx][field] = val;
        const titles = document.querySelectorAll('#projectsContainer .item-card-title');
        if (titles && titles[idx] && field === 'name') {
            titles[idx].textContent = `PROJECT ${idx + 1}: ${val || 'Project ' + (idx + 1)}`;
        }
        renderLiveResumePreview();
    }
};
window.updateProjectBullets = (idx, val) => {
    appState.data.projects[idx].responsibilities = val.split('\n').map(s => s.trim()).filter(Boolean);
    renderLiveResumePreview();
};
window.deleteProjectItem = (idx) => {
    appState.data.projects.splice(idx, 1);
    renderDynamicProjectsForm();
    renderLiveResumePreview();
};
function addEmptyProject() {
    const num = (appState.data.projects.length + 1);
    appState.data.projects.push({
        name: `Enterprise Cloud Application ${num}`,
        role: appState.data.title || "Senior Software Engineer",
        duration: "12 Months",
        client: "Global Client (Confidential)",
        environment: appState.data.skills.languages + ", " + appState.data.skills.cloud,
        description: "Enterprise software solution engineered to automate distributed workflows and optimize data processing.",
        responsibilities: generateHumanizedProjectBullets(`Enterprise Cloud Application ${num}`, appState.data.skills.cloud, appState.data.title)
    });
    renderDynamicProjectsForm();
    renderLiveResumePreview();
}

/* ==========================================================================
   RENDER LIVE A4 RESUME SHEET (WYSIWYG)
   ========================================================================== */

function renderLiveResumePreview() {
    const d = appState.data;

    // Header
    if (previewName) previewName.textContent = (d.name || 'CANDIDATE NAME').toUpperCase();
    if (previewTitle) previewTitle.textContent = d.title || '';
    if (previewExp) previewExp.textContent = d.experience || '';

    // Summary
    const secSummary = document.getElementById('secSummary');
    if (previewSummary) {
        previewSummary.textContent = d.summary || '';
        if (secSummary) secSummary.style.display = d.summary ? 'block' : 'none';
    }

    // Skills Table
    const secSkills = document.getElementById('secSkills');
    if (previewSkillsTable) {
        previewSkillsTable.innerHTML = '';
        const skillsList = normalizeSkillsStructure(d.skills);
        let hasSkills = false;
        skillsList.forEach(r => {
            if (r.value && r.value.trim()) {
                hasSkills = true;
                const rowEl = document.createElement('div');
                rowEl.className = 'res-skill-row';
                rowEl.innerHTML = `
                    <span class="res-skill-label">• ${escapeHtml(r.label)}</span>
                    <span class="res-skill-sep">:</span>
                    <span class="res-skill-val">${escapeHtml(r.value)}</span>
                `;
                previewSkillsTable.appendChild(rowEl);
            }
        });
        if (secSkills) secSkills.style.display = hasSkills ? 'block' : 'none';
    }

    // Certifications (Separate Distinct Section)
    const secCertifications = document.getElementById('secCertifications');
    const previewCertsContainer = document.getElementById('previewCertsContainer');
    if (previewCertsContainer) {
        previewCertsContainer.innerHTML = '';
        const validCerts = (d.certifications || [])
            .map(c => filterAndCleanEduCertText(String(c)))
            .filter(Boolean);

        if (validCerts.length > 0) {
            if (secCertifications) secCertifications.style.display = 'block';
            const ul = document.createElement('ul');
            ul.className = 'res-bullet-list';
            validCerts.forEach(cert => {
                const li = document.createElement('li');
                li.textContent = cert;
                ul.appendChild(li);
            });
            previewCertsContainer.appendChild(ul);
        } else {
            if (secCertifications) secCertifications.style.display = 'none';
        }
    }

    // Education (Separate Distinct Section)
    const secEducation = document.getElementById('secEducation');
    const previewEduContainer = document.getElementById('previewEduContainer');
    if (previewEduContainer) {
        previewEduContainer.innerHTML = '';
        const validEdu = (d.education || [])
            .map(e => filterAndCleanEduCertText(String(e)))
            .filter(Boolean);

        if (validEdu.length > 0) {
            if (secEducation) secEducation.style.display = 'block';
            const ul = document.createElement('ul');
            ul.className = 'res-bullet-list';
            validEdu.forEach(edu => {
                const li = document.createElement('li');
                li.textContent = edu;
                ul.appendChild(li);
            });
            previewEduContainer.appendChild(ul);
        } else {
            if (secEducation) secEducation.style.display = 'none';
        }
    }

    // Professional Experience
    const secExp = document.getElementById('secExp');
    if (previewExperienceList) {
        previewExperienceList.innerHTML = '';
        const validCompanies = (d.companies || []).filter(c => c && (c.company !== undefined || c.role || (c.responsibilities && c.responsibilities.length)));
        
        if (validCompanies.length > 0) {
            if (secExp) secExp.style.display = 'block';
            validCompanies.forEach(c => {
                const item = document.createElement('div');
                item.className = 'res-exp-item';
                
                let bulletsHtml = '';
                if (c.responsibilities && c.responsibilities.length > 0) {
                    bulletsHtml = `<ul class="res-exp-bullets">${c.responsibilities.map(b => `<li>${escapeHtml(b)}</li>`).join('')}</ul>`;
                }

                const compText = c.company !== undefined && c.company.trim() ? escapeHtml(c.company) : '';
                const roleText = c.role ? escapeHtml(c.role) : '';
                const durText = c.duration ? escapeHtml(c.duration) : '';

                item.innerHTML = `
                    <div class="res-exp-header">
                        <div>
                            ${compText ? `<span class="res-exp-company">${compText}</span>` : ''}
                            ${roleText ? `${compText ? `<span style="color: #64748b;"> | </span>` : ''}<span class="res-exp-role">${roleText}</span>` : ''}
                        </div>
                        ${durText ? `<span class="res-exp-date">${durText}</span>` : ''}
                    </div>
                    ${bulletsHtml}
                `;
                previewExperienceList.appendChild(item);
            });
        } else {
            if (secExp) secExp.style.display = 'none';
        }
    }

    // Projects Detail
    const secProjects = document.getElementById('secProjects');
    if (previewProjectsList) {
        previewProjectsList.innerHTML = '';
        const validProjects = (d.projects || []).filter(p => p && (p.name !== undefined || p.role || (p.responsibilities && p.responsibilities.length)));

        if (validProjects.length > 0) {
            if (secProjects) secProjects.style.display = 'block';
            validProjects.forEach((p, idx) => {
                const card = document.createElement('div');
                card.className = 'res-proj-card';

                let bulletsHtml = '';
                if (p.responsibilities && p.responsibilities.length > 0) {
                    bulletsHtml = `
                        <div style="font-weight: 700; font-size: 8.9pt; color: #0f172a; margin-bottom: 4px;">• Responsibilities & Achievements:</div>
                        <ol class="res-proj-bullets">
                            ${p.responsibilities.map(b => `<li>${escapeHtml(b)}</li>`).join('')}
                        </ol>
                    `;
                }

                const pTitle = p.name && p.name.trim() ? escapeHtml(p.name) : `PROJECT ${idx + 1}`;

                card.innerHTML = `
                    <div class="res-proj-top">
                        <span class="res-proj-name">PROJECT ${idx + 1}: ${pTitle}</span>
                        <span class="res-exp-date">${escapeHtml(p.duration || '')}</span>
                    </div>
                    <div class="res-proj-meta-grid">
                        <div class="res-proj-meta-item"><span class="res-proj-meta-label">• Role</span>: <span class="res-proj-meta-val">${escapeHtml(p.role || '')}</span></div>
                        <div class="res-proj-meta-item"><span class="res-proj-meta-label">• Client</span>: <span class="res-proj-meta-val">${escapeHtml(p.client || 'Confidential')}</span></div>
                        <div class="res-proj-meta-item res-proj-env"><span class="res-proj-meta-label">• Environment</span>: <span class="res-proj-meta-val">${escapeHtml(p.environment || '')}</span></div>
                    </div>
                    ${p.description ? `<div class="res-proj-desc">• <strong>Description:</strong> ${escapeHtml(p.description)}</div>` : ''}
                    ${bulletsHtml}
                `;
                previewProjectsList.appendChild(card);
            });
        } else {
            if (secProjects) secProjects.style.display = 'none';
        }
    }

    // Render Watermarks on EVERY A4 Page
    renderWatermarksOnEveryPage();
}

function renderWatermarksOnEveryPage() {
    const container = document.getElementById('resumeWatermarkContainer');
    if (!container) return;

    const sheet = document.getElementById('resumeSheet');
    if (!sheet) return;

    // Standard A4 physical height in px at standard 96dpi (297mm ≈ 1122.5px)
    const totalHeight = Math.max(sheet.scrollHeight, sheet.offsetHeight, 1122);
    const totalPages = Math.max(1, Math.ceil(totalHeight / 1122.5));

    container.innerHTML = '';
    for (let p = 0; p < totalPages; p++) {
        const pageCenterY = (p * 1122.5) + 560;
        const wrapper = document.createElement('div');
        wrapper.className = 'page-watermark-wrapper';
        wrapper.style.top = `${pageCenterY}px`;
        wrapper.innerHTML = `<img src="logo.png" class="resume-watermark-img" alt="Forcecraver Watermark">`;
        container.appendChild(wrapper);
    }
}

/* ==========================================================================
   EXPORT TO NATIVE WORD DOCX (With Pixel-Perfect Matching Styles)
   ========================================================================== */

async function exportToDocx() {
    if (typeof docx === 'undefined') {
        showToast('DOCX export library is loading, please try in a moment...', 'warning');
        return;
    }

    try {
        showToast('Generating Native Word DOCX document...', 'info');
        const { Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, BorderStyle, HeadingLevel, AlignmentType } = docx;
        const d = appState.data;

        const docChildren = [];

        // 1. Header (Name, Title, Exp)
        docChildren.push(
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 80 },
                children: [
                    new TextRun({ text: (d.name || 'CANDIDATE NAME').toUpperCase(), bold: true, size: 36, font: "Arial", color: "0F172A" })
                ]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 60 },
                children: [
                    new TextRun({ text: d.title || '', bold: true, size: 22, font: "Arial", color: "334155" })
                ]
            }),
            new Paragraph({
                alignment: AlignmentType.CENTER,
                spacing: { after: 200 },
                border: {
                    bottom: { style: BorderStyle.SINGLE, size: 12, color: "1E293B" }
                },
                children: [
                    new TextRun({ text: d.experience || '', bold: true, size: 20, font: "Arial", color: "475569" })
                ]
            })
        );

        // Helper for Section Heading
        const addSectionHeading = (title) => {
            return new Paragraph({
                spacing: { before: 240, after: 120 },
                border: {
                    bottom: { style: BorderStyle.SINGLE, size: 8, color: "1E293B" }
                },
                children: [
                    new TextRun({ text: title, bold: true, size: 22, font: "Arial", color: "0F172A" })
                ]
            });
        };

        // 2. Professional Summary
        if (d.summary) {
            docChildren.push(addSectionHeading("PROFESSIONAL SUMMARY"));
            docChildren.push(
                new Paragraph({
                    spacing: { after: 160 },
                    children: [
                        new TextRun({ text: d.summary, size: 19, font: "Arial", color: "1E293B" })
                    ]
                })
            );
        }

        // 3. Core Competencies & Skills Table
        const skillsList = normalizeSkillsStructure(d.skills);
        if (skillsList.length > 0) {
            docChildren.push(addSectionHeading("CORE COMPETENCIES & TECH SKILLS"));
            skillsList.forEach(sr => {
                if (sr.value && sr.value.trim()) {
                    docChildren.push(
                        new Paragraph({
                            spacing: { after: 60 },
                            children: [
                                new TextRun({ text: `• ${sr.label} : `, bold: true, size: 19, font: "Arial", color: "0F172A" }),
                                new TextRun({ text: sr.value, size: 19, font: "Arial", color: "1E293B" })
                            ]
                        })
                    );
                }
            });
        }

        // 4. Certifications (Separate Section)
        const validCerts = (d.certifications || [])
            .map(c => filterAndCleanEduCertText(String(c)))
            .filter(Boolean);

        if (validCerts.length > 0) {
            docChildren.push(addSectionHeading("CERTIFICATIONS"));
            validCerts.forEach(cert => {
                docChildren.push(
                    new Paragraph({
                        bullet: { level: 0 },
                        spacing: { after: 40 },
                        children: [
                            new TextRun({ text: cert, size: 19, font: "Arial", color: "1E293B" })
                        ]
                    })
                );
            });
        }

        // 5. Education (Separate Section)
        const validEdu = (d.education || [])
            .map(e => filterAndCleanEduCertText(String(e)))
            .filter(Boolean);

        if (validEdu.length > 0) {
            docChildren.push(addSectionHeading("EDUCATION"));
            validEdu.forEach(edu => {
                docChildren.push(
                    new Paragraph({
                        bullet: { level: 0 },
                        spacing: { after: 40 },
                        children: [
                            new TextRun({ text: edu, size: 19, font: "Arial", color: "1E293B" })
                        ]
                    })
                );
            });
        }

        // 5. Professional Experience
        if (d.companies && d.companies.length) {
            docChildren.push(addSectionHeading("PROFESSIONAL EXPERIENCE"));
            d.companies.forEach(c => {
                docChildren.push(
                    new Paragraph({
                        spacing: { before: 100, after: 40 },
                        children: [
                            new TextRun({ text: c.company, bold: true, size: 20, font: "Arial", color: "0F172A" }),
                            new TextRun({ text: ` | ${c.role || ''}`, bold: true, size: 19, font: "Arial", color: "334155" }),
                            new TextRun({ text: `\t${c.duration || ''}`, bold: true, size: 18, font: "Arial", color: "475569" })
                        ]
                    })
                );
                (c.responsibilities || []).forEach(r => {
                    docChildren.push(
                        new Paragraph({
                            bullet: { level: 0 },
                            spacing: { after: 30 },
                            children: [
                                new TextRun({ text: r, size: 18, font: "Arial", color: "1E293B" })
                            ]
                        })
                    );
                });
            });
        }

        // 6. Projects Detail
        if (d.projects && d.projects.length) {
            docChildren.push(addSectionHeading("PROJECTS DETAIL"));
            d.projects.forEach((p, idx) => {
                docChildren.push(
                    new Paragraph({
                        spacing: { before: 140, after: 40 },
                        children: [
                            new TextRun({ text: `PROJECT ${idx + 1}: ${p.name.toUpperCase()}`, bold: true, size: 20, font: "Arial", color: "0F172A" }),
                            new TextRun({ text: `\t${p.duration || ''}`, bold: true, size: 18, font: "Arial", color: "475569" })
                        ]
                    }),
                    new Paragraph({
                        spacing: { after: 30 },
                        children: [
                            new TextRun({ text: "• Role: ", bold: true, size: 18, font: "Arial", color: "334155" }),
                            new TextRun({ text: p.role + " | ", size: 18, font: "Arial", color: "0F172A" }),
                            new TextRun({ text: "• Client: ", bold: true, size: 18, font: "Arial", color: "334155" }),
                            new TextRun({ text: p.client || 'Confidential', size: 18, font: "Arial", color: "0F172A" })
                        ]
                    }),
                    new Paragraph({
                        spacing: { after: 60 },
                        children: [
                            new TextRun({ text: "• Environment: ", bold: true, size: 18, font: "Arial", color: "334155" }),
                            new TextRun({ text: p.environment || '', size: 18, font: "Arial", color: "0F172A" })
                        ]
                    })
                );

                if (p.description) {
                    docChildren.push(
                        new Paragraph({
                            spacing: { after: 60 },
                            children: [
                                new TextRun({ text: "• Description: ", bold: true, size: 18, font: "Arial", color: "334155" }),
                                new TextRun({ text: p.description, italics: true, size: 18, font: "Arial", color: "334155" })
                            ]
                        })
                    );
                }

                if (p.responsibilities && p.responsibilities.length) {
                    docChildren.push(
                        new Paragraph({
                            spacing: { after: 30 },
                            children: [
                                new TextRun({ text: "• Responsibilities & Achievements:", bold: true, size: 18, font: "Arial", color: "0F172A" })
                            ]
                        })
                    );
                    p.responsibilities.forEach(r => {
                        docChildren.push(
                            new Paragraph({
                                bullet: { level: 0 },
                                spacing: { after: 30 },
                                children: [
                                    new TextRun({ text: r, size: 18, font: "Arial", color: "0F172A" })
                                ]
                            })
                        );
                    });
                }
            });
        }

        // Build Word Document
        const doc = new Document({
            sections: [{
                properties: {
                    page: {
                        margin: { top: 720, right: 720, bottom: 720, left: 720 } // 0.5 inch margins
                    }
                },
                children: docChildren
            }]
        });

        const blob = await docx.Packer.toBlob(doc);
        const fileName = `Forcecraver_${(d.name || 'Candidate').replace(/\s+/g, '_')}_Resume.docx`;

        if (typeof saveAs === 'function') {
            saveAs(blob, fileName);
        } else {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName;
            document.body.appendChild(a);
            a.click();
            setTimeout(() => {
                document.body.removeChild(a);
                URL.revokeObjectURL(url);
            }, 300);
        }

        if (typeof confetti === 'function') confetti({ particleCount: 80, spread: 70 });
        showToast('DOCX Word Document downloaded successfully!', 'success');

    } catch (err) {
        console.error('DOCX Export error:', err);
        showToast('DOCX Generation failed: ' + err.message, 'error');
    }
}

/* ==========================================================================
   EXPORT TO HIGH RESOLUTION VECTOR PDF
   ========================================================================== */

async function exportToPdf() {
    showToast('Opening High-Resolution Print / PDF Dialog (Watermark in center of every A4 page)...', 'info');
    setTimeout(() => {
        window.print();
    }, 300);
}

/* ==========================================================================
   ZOOM & ACCORDION HELPERS
   ========================================================================== */

function adjustZoom(delta) {
    appState.zoom = Math.max(0.6, Math.min(1.8, appState.zoom + delta));
    applyZoom();
}
function resetZoom() {
    appState.zoom = 1.0;
    applyZoom();
}
function applyZoom() {
    if (previewStage) previewStage.style.transform = `scale(${appState.zoom})`;
    if (zoomLevelText) zoomLevelText.textContent = `${Math.round(appState.zoom * 100)}%`;
}

window.toggleAccordion = function(cardId) {
    const card = document.getElementById(cardId) || document.getElementById(cardId.replace('Card', ''));
    const parentCard = event.currentTarget.closest('.form-card');
    if (parentCard) {
        parentCard.classList.toggle('collapsed');
    }
};

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

/* ==========================================================================
   LOCAL OLLAMA LLM SETTINGS & CONNECTIVITY
   ========================================================================== */

async function testOllamaConnection() {
    const endpoint = (ollamaEndpointInput ? ollamaEndpointInput.value : 'http://localhost:11434').trim();
    if (ollamaTestStatus) {
        ollamaTestStatus.className = 'status-msg';
        ollamaTestStatus.textContent = 'Connecting to ' + endpoint + '...';
    }

    try {
        const res = await fetch(endpoint + '/api/tags', { method: 'GET' });
        if (res.ok) {
            const data = await res.json();
            const models = (data.models || []).map(m => m.name).join(', ');
            if (ollamaTestStatus) {
                ollamaTestStatus.className = 'status-msg success';
                ollamaTestStatus.textContent = `Connected! Available models: ${models || 'None found'}`;
            }
        } else {
            throw new Error('HTTP ' + res.status);
        }
    } catch (e) {
        if (ollamaTestStatus) {
            ollamaTestStatus.className = 'status-msg error';
            ollamaTestStatus.textContent = `Cannot reach Ollama at ${endpoint}. (Ensure Ollama is running locally: \`ollama serve\`)`;
        }
    }
}

function saveAiSettings() {
    appState.ollamaEndpoint = ollamaEndpointInput ? ollamaEndpointInput.value.trim() : 'http://localhost:11434';
    appState.ollamaModel = ollamaModelInput ? ollamaModelInput.value.trim() : 'qwen2.5:latest';

    if (aiEngineLabel) {
        aiEngineLabel.textContent = `Ollama (${appState.ollamaModel}): Active`;
    }

    aiSettingsModal.style.display = 'none';
    showToast(`Ollama Model updated to "${appState.ollamaModel}"!`, 'success');
}
