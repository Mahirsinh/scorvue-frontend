// constants/interview.ts

// ============================================
// ROLE HIERARCHY - Main Categories & Sub-fields
// ============================================

export interface SubRole {
  id: string;
  label: string;
  value: string;
  parentCategory: string;
  isCoding: boolean; // Whether this role requires coding mix
}

export interface RoleCategory {
  id: string;
  label: string;
  value: string;
  icon?: string;
  subRoles: SubRole[];
  isCoding: boolean; // Default coding requirement for category
}

export const ROLE_CATEGORIES: RoleCategory[] = [
  // ===== CODING / TECHNOLOGY =====
  {
    id: "coding",
    label: "💻 Coding & Software Development",
    value: "coding",
    isCoding: true,
    subRoles: [
      // Backend
      { id: "backend-dotnet", label: ".NET / C#", value: "backend-dotnet", parentCategory: "coding", isCoding: true },
      { id: "backend-java", label: "Java / Spring Boot", value: "backend-java", parentCategory: "coding", isCoding: true },
      { id: "backend-python", label: "Python / Django / Flask", value: "backend-python", parentCategory: "coding", isCoding: true },
      { id: "backend-node", label: "Node.js / Express", value: "backend-node", parentCategory: "coding", isCoding: true },
      { id: "backend-go", label: "Go / Gin", value: "backend-go", parentCategory: "coding", isCoding: true },
      { id: "backend-ruby", label: "Ruby on Rails", value: "backend-ruby", parentCategory: "coding", isCoding: true },
      { id: "backend-php", label: "PHP / Laravel", value: "backend-php", parentCategory: "coding", isCoding: true },
      
      // Frontend
      { id: "frontend-react", label: "React / Next.js", value: "frontend-react", parentCategory: "coding", isCoding: true },
      { id: "frontend-angular", label: "Angular / TypeScript", value: "frontend-angular", parentCategory: "coding", isCoding: true },
      { id: "frontend-vue", label: "Vue.js / Nuxt", value: "frontend-vue", parentCategory: "coding", isCoding: true },
      { id: "frontend-svelte", label: "Svelte / SvelteKit", value: "frontend-svelte", parentCategory: "coding", isCoding: true },
      { id: "frontend-html-css", label: "HTML / CSS / UI", value: "frontend-html-css", parentCategory: "coding", isCoding: true },
      
      // Full Stack
      { id: "fullstack-mern", label: "MERN Stack (Mongo, Express, React, Node)", value: "fullstack-mern", parentCategory: "coding", isCoding: true },
      { id: "fullstack-mean", label: "MEAN Stack (Mongo, Express, Angular, Node)", value: "fullstack-mean", parentCategory: "coding", isCoding: true },
      { id: "fullstack-java", label: "Full Stack Java (Spring + Angular/React)", value: "fullstack-java", parentCategory: "coding", isCoding: true },
      { id: "fullstack-python", label: "Full Stack Python (Django/Flask + React)", value: "fullstack-python", parentCategory: "coding", isCoding: true },
      { id: "fullstack-dotnet", label: "Full Stack .NET (C# + React/Angular)", value: "fullstack-dotnet", parentCategory: "coding", isCoding: true },
      
      // Mobile
      { id: "mobile-android", label: "Android (Kotlin/Java)", value: "mobile-android", parentCategory: "coding", isCoding: true },
      { id: "mobile-ios", label: "iOS (Swift/Objective-C)", value: "mobile-ios", parentCategory: "coding", isCoding: true },
      { id: "mobile-react-native", label: "React Native", value: "mobile-react-native", parentCategory: "coding", isCoding: true },
      { id: "mobile-flutter", label: "Flutter (Dart)", value: "mobile-flutter", parentCategory: "coding", isCoding: true },
      { id: "mobile-xamarin", label: "Xamarin / .NET MAUI", value: "mobile-xamarin", parentCategory: "coding", isCoding: true },
      
      // Data & ML
      { id: "data-scientist", label: "Data Scientist", value: "data-scientist", parentCategory: "coding", isCoding: true },
      { id: "data-analyst", label: "Data Analyst", value: "data-analyst", parentCategory: "coding", isCoding: true },
      { id: "ml-engineer", label: "Machine Learning Engineer", value: "ml-engineer", parentCategory: "coding", isCoding: true },
      { id: "ai-engineer", label: "AI / NLP Engineer", value: "ai-engineer", parentCategory: "coding", isCoding: true },
      { id: "data-engineer", label: "Data Engineer (ETL, Pipelines)", value: "data-engineer", parentCategory: "coding", isCoding: true },
      { id: "database-admin", label: "Database Administrator (SQL/NoSQL)", value: "database-admin", parentCategory: "coding", isCoding: true },
      
      // DevOps & Cloud
      { id: "devops", label: "DevOps Engineer", value: "devops", parentCategory: "coding", isCoding: true },
      { id: "cloud-aws", label: "Cloud Engineer (AWS)", value: "cloud-aws", parentCategory: "coding", isCoding: true },
      { id: "cloud-azure", label: "Cloud Engineer (Azure)", value: "cloud-azure", parentCategory: "coding", isCoding: true },
      { id: "cloud-gcp", label: "Cloud Engineer (GCP)", value: "cloud-gcp", parentCategory: "coding", isCoding: true },
      { id: "sre", label: "Site Reliability Engineer (SRE)", value: "sre", parentCategory: "coding", isCoding: true },
      { id: "security", label: "Cyber Security Engineer", value: "security", parentCategory: "coding", isCoding: true },
      
      // Systems & Embedded
      { id: "systems", label: "Systems Programmer (C/C++/Rust)", value: "systems", parentCategory: "coding", isCoding: true },
      { id: "embedded", label: "Embedded Systems Engineer", value: "embedded", parentCategory: "coding", isCoding: true },
      { id: "game-dev", label: "Game Developer (Unity/Unreal)", value: "game-dev", parentCategory: "coding", isCoding: true },
      { id: "blockchain", label: "Blockchain / Web3 Developer", value: "blockchain", parentCategory: "coding", isCoding: true },
      
      // QA & Testing
      { id: "qa-manual", label: "QA Engineer (Manual)", value: "qa-manual", parentCategory: "coding", isCoding: false },
      { id: "qa-automation", label: "QA Automation Engineer (Selenium/Playwright)", value: "qa-automation", parentCategory: "coding", isCoding: true },
      { id: "sdet", label: "SDET (Software Development Engineer in Test)", value: "sdet", parentCategory: "coding", isCoding: true },
    ]
  },
  
  // ===== FINANCE & ACCOUNTING =====
  {
    id: "finance",
    label: "💰 Finance & Accounting",
    value: "finance",
    isCoding: false,
    subRoles: [
      // Core Finance
      { id: "finance-analyst", label: "Financial Analyst", value: "finance-analyst", parentCategory: "finance", isCoding: false },
      { id: "finance-manager", label: "Finance Manager", value: "finance-manager", parentCategory: "finance", isCoding: false },
      { id: "finance-director", label: "Director of Finance", value: "finance-director", parentCategory: "finance", isCoding: false },
      { id: "cfo", label: "Chief Financial Officer (CFO)", value: "cfo", parentCategory: "finance", isCoding: false },
      
      // Accounting
      { id: "accountant", label: "Accountant (General)", value: "accountant", parentCategory: "finance", isCoding: false },
      { id: "accounting-manager", label: "Accounting Manager", value: "accounting-manager", parentCategory: "finance", isCoding: false },
      { id: "tax-accountant", label: "Tax Accountant / Tax Specialist", value: "tax-accountant", parentCategory: "finance", isCoding: false },
      { id: "auditor", label: "Internal / External Auditor", value: "auditor", parentCategory: "finance", isCoding: false },
      { id: "controller", label: "Financial Controller", value: "controller", parentCategory: "finance", isCoding: false },
      { id: "cpa", label: "CPA (Certified Public Accountant)", value: "cpa", parentCategory: "finance", isCoding: false },
      
      // Investment & Banking
      { id: "investment-analyst", label: "Investment Analyst", value: "investment-analyst", parentCategory: "finance", isCoding: false },
      { id: "portfolio-manager", label: "Portfolio Manager", value: "portfolio-manager", parentCategory: "finance", isCoding: false },
      { id: "wealth-manager", label: "Wealth / Asset Manager", value: "wealth-manager", parentCategory: "finance", isCoding: false },
      { id: "investment-banker", label: "Investment Banker", value: "investment-banker", parentCategory: "finance", isCoding: false },
      { id: "private-equity", label: "Private Equity Associate", value: "private-equity", parentCategory: "finance", isCoding: false },
      { id: "venture-capital", label: "Venture Capital Associate", value: "venture-capital", parentCategory: "finance", isCoding: false },
      { id: "stock-trader", label: "Stock Trader / Equity Analyst", value: "stock-trader", parentCategory: "finance", isCoding: false },
      
      // FinTech & Quant
      { id: "fintech-dev", label: "FinTech Developer", value: "fintech-dev", parentCategory: "finance", isCoding: true },
      { id: "quant-analyst", label: "Quantitative Analyst (Quant)", value: "quant-analyst", parentCategory: "finance", isCoding: true },
      { id: "quant-trader", label: "Quantitative Trader", value: "quant-trader", parentCategory: "finance", isCoding: true },
      { id: "blockchain-finance", label: "Blockchain / Crypto Finance", value: "blockchain-finance", parentCategory: "finance", isCoding: true },
      
      // Risk & Compliance
      { id: "risk-analyst", label: "Risk Analyst", value: "risk-analyst", parentCategory: "finance", isCoding: false },
      { id: "risk-manager", label: "Risk Manager", value: "risk-manager", parentCategory: "finance", isCoding: false },
      { id: "compliance-officer", label: "Compliance Officer", value: "compliance-officer", parentCategory: "finance", isCoding: false },
      { id: "credit-analyst", label: "Credit Analyst", value: "credit-analyst", parentCategory: "finance", isCoding: false },
      { id: "underwriter", label: "Underwriter", value: "underwriter", parentCategory: "finance", isCoding: false },
      
      // FP&A & Strategy
      { id: "fpna", label: "FP&A (Financial Planning & Analysis)", value: "fpna", parentCategory: "finance", isCoding: false },
      { id: "business-intelligence", label: "Business Intelligence (BI) Analyst", value: "business-intelligence", parentCategory: "finance", isCoding: false },
      { id: "corporate-strategy", label: "Corporate Strategy / M&A", value: "corporate-strategy", parentCategory: "finance", isCoding: false },
    ]
  },
  
  // ===== BUSINESS & MANAGEMENT =====
  {
    id: "business",
    label: "📊 Business & Management",
    value: "business",
    isCoding: false,
    subRoles: [
      { id: "product-manager", label: "Product Manager", value: "product-manager", parentCategory: "business", isCoding: false },
      { id: "project-manager", label: "Project Manager", value: "project-manager", parentCategory: "business", isCoding: false },
      { id: "program-manager", label: "Program Manager", value: "program-manager", parentCategory: "business", isCoding: false },
      { id: "business-analyst", label: "Business Analyst", value: "business-analyst", parentCategory: "business", isCoding: false },
      { id: "operations-manager", label: "Operations Manager", value: "operations-manager", parentCategory: "business", isCoding: false },
      { id: "scrum-master", label: "Scrum Master", value: "scrum-master", parentCategory: "business", isCoding: false },
      { id: "agile-coach", label: "Agile Coach", value: "agile-coach", parentCategory: "business", isCoding: false },
      { id: "strategy-consultant", label: "Strategy Consultant", value: "strategy-consultant", parentCategory: "business", isCoding: false },
      { id: "management-consultant", label: "Management Consultant", value: "management-consultant", parentCategory: "business", isCoding: false },
    ]
  },
  
  // ===== MARKETING & DESIGN =====
  {
    id: "marketing",
    label: "🎨 Marketing & Design",
    value: "marketing",
    isCoding: false,
    subRoles: [
      { id: "ui-ux-designer", label: "UI/UX Designer", value: "ui-ux-designer", parentCategory: "marketing", isCoding: false },
      { id: "product-designer", label: "Product Designer", value: "product-designer", parentCategory: "marketing", isCoding: false },
      { id: "graphic-designer", label: "Graphic Designer", value: "graphic-designer", parentCategory: "marketing", isCoding: false },
      { id: "marketing-manager", label: "Marketing Manager", value: "marketing-manager", parentCategory: "marketing", isCoding: false },
      { id: "digital-marketing", label: "Digital Marketing Specialist", value: "digital-marketing", parentCategory: "marketing", isCoding: false },
      { id: "content-strategist", label: "Content Strategist", value: "content-strategist", parentCategory: "marketing", isCoding: false },
      { id: "seo-specialist", label: "SEO / SEM Specialist", value: "seo-specialist", parentCategory: "marketing", isCoding: false },
      { id: "social-media-manager", label: "Social Media Manager", value: "social-media-manager", parentCategory: "marketing", isCoding: false },
      { id: "brand-manager", label: "Brand Manager", value: "brand-manager", parentCategory: "marketing", isCoding: false },
    ]
  },
  
  // ===== HEALTHCARE & SCIENCE =====
  {
    id: "healthcare",
    label: "🏥 Healthcare & Science",
    value: "healthcare",
    isCoding: false,
    subRoles: [
      { id: "doctor", label: "Doctor / Physician", value: "doctor", parentCategory: "healthcare", isCoding: false },
      { id: "nurse", label: "Nurse / Registered Nurse", value: "nurse", parentCategory: "healthcare", isCoding: false },
      { id: "surgeon", label: "Surgeon", value: "surgeon", parentCategory: "healthcare", isCoding: false },
      { id: "dentist", label: "Dentist", value: "dentist", parentCategory: "healthcare", isCoding: false },
      { id: "pharmacist", label: "Pharmacist", value: "pharmacist", parentCategory: "healthcare", isCoding: false },
      { id: "clinical-research", label: "Clinical Research Associate", value: "clinical-research", parentCategory: "healthcare", isCoding: false },
      { id: "biotech", label: "Biotech / Life Sciences", value: "biotech", parentCategory: "healthcare", isCoding: false },
      { id: "public-health", label: "Public Health Specialist", value: "public-health", parentCategory: "healthcare", isCoding: false },
      { id: "healthcare-admin", label: "Healthcare Administrator", value: "healthcare-admin", parentCategory: "healthcare", isCoding: false },
      { id: "bioinformatics", label: "Bioinformatics Scientist", value: "bioinformatics", parentCategory: "healthcare", isCoding: true },
    ]
  },
  
  // ===== LEGAL & COMPLIANCE =====
  {
    id: "legal",
    label: "⚖️ Legal & Compliance",
    value: "legal",
    isCoding: false,
    subRoles: [
      { id: "lawyer", label: "Lawyer / Attorney", value: "lawyer", parentCategory: "legal", isCoding: false },
      { id: "corporate-counsel", label: "Corporate Counsel", value: "corporate-counsel", parentCategory: "legal", isCoding: false },
      { id: "legal-assistant", label: "Legal Assistant / Paralegal", value: "legal-assistant", parentCategory: "legal", isCoding: false },
      { id: "compliance-manager", label: "Compliance Manager", value: "compliance-manager", parentCategory: "legal", isCoding: false },
      { id: "ip-lawyer", label: "Intellectual Property Lawyer", value: "ip-lawyer", parentCategory: "legal", isCoding: false },
      { id: "contract-manager", label: "Contract Manager", value: "contract-manager", parentCategory: "legal", isCoding: false },
    ]
  },
  
  // ===== EDUCATION =====
  {
    id: "education",
    label: "📚 Education & Academia",
    value: "education",
    isCoding: false,
    subRoles: [
      { id: "teacher", label: "Teacher / Educator", value: "teacher", parentCategory: "education", isCoding: false },
      { id: "professor", label: "Professor / Academic", value: "professor", parentCategory: "education", isCoding: false },
      { id: "principal", label: "Principal / Head of School", value: "principal", parentCategory: "education", isCoding: false },
      { id: "educational-consultant", label: "Educational Consultant", value: "educational-consultant", parentCategory: "education", isCoding: false },
      { id: "curriculum-developer", label: "Curriculum Developer", value: "curriculum-developer", parentCategory: "education", isCoding: false },
      { id: "edtech", label: "EdTech Specialist", value: "edtech", parentCategory: "education", isCoding: true },
    ]
  },
  
  // ===== CONSULTING =====
  {
    id: "consulting",
    label: "🤝 Consulting",
    value: "consulting",
    isCoding: false,
    subRoles: [
      { id: "management-consultant", label: "Management Consultant", value: "management-consultant", parentCategory: "consulting", isCoding: false },
      { id: "strategy-consultant", label: "Strategy Consultant", value: "strategy-consultant", parentCategory: "consulting", isCoding: false },
      { id: "it-consultant", label: "IT / Technology Consultant", value: "it-consultant", parentCategory: "consulting", isCoding: true },
      { id: "financial-consultant", label: "Financial Consultant", value: "financial-consultant", parentCategory: "consulting", isCoding: false },
      { id: "hr-consultant", label: "HR Consultant", value: "hr-consultant", parentCategory: "consulting", isCoding: false },
    ]
  },
  
  // ===== HR & TALENT =====
  {
    id: "hr",
    label: "👥 Human Resources & Talent",
    value: "hr",
    isCoding: false,
    subRoles: [
      { id: "hr-manager", label: "HR Manager", value: "hr-manager", parentCategory: "hr", isCoding: false },
      { id: "hr-business-partner", label: "HR Business Partner", value: "hr-business-partner", parentCategory: "hr", isCoding: false },
      { id: "talent-acquisition", label: "Talent Acquisition Specialist", value: "talent-acquisition", parentCategory: "hr", isCoding: false },
      { id: "recruiter", label: "Recruiter", value: "recruiter", parentCategory: "hr", isCoding: false },
      { id: "learning-development", label: "Learning & Development Specialist", value: "learning-development", parentCategory: "hr", isCoding: false },
      { id: "compensation-benefits", label: "Compensation & Benefits Manager", value: "compensation-benefits", parentCategory: "hr", isCoding: false },
      { id: "people-ops", label: "People Operations", value: "people-ops", parentCategory: "hr", isCoding: false },
    ]
  },
  
  // ===== ENGINEERING (Non-Software) =====
  {
    id: "engineering",
    label: "🔧 Engineering (Non-Software)",
    value: "engineering",
    isCoding: false,
    subRoles: [
      { id: "mechanical-eng", label: "Mechanical Engineer", value: "mechanical-eng", parentCategory: "engineering", isCoding: false },
      { id: "electrical-eng", label: "Electrical Engineer", value: "electrical-eng", parentCategory: "engineering", isCoding: false },
      { id: "civil-eng", label: "Civil Engineer", value: "civil-eng", parentCategory: "engineering", isCoding: false },
      { id: "chemical-eng", label: "Chemical Engineer", value: "chemical-eng", parentCategory: "engineering", isCoding: false },
      { id: "aerospace-eng", label: "Aerospace Engineer", value: "aerospace-eng", parentCategory: "engineering", isCoding: false },
      { id: "industrial-eng", label: "Industrial Engineer", value: "industrial-eng", parentCategory: "engineering", isCoding: false },
      { id: "structural-eng", label: "Structural Engineer", value: "structural-eng", parentCategory: "engineering", isCoding: false },
      { id: "environmental-eng", label: "Environmental Engineer", value: "environmental-eng", parentCategory: "engineering", isCoding: false },
    ]
  },
  
  // ===== ARCHITECTURE & CONSTRUCTION =====
  {
    id: "architecture",
    label: "🏗️ Architecture & Construction",
    value: "architecture",
    isCoding: false,
    subRoles: [
      { id: "architect", label: "Architect", value: "architect", parentCategory: "architecture", isCoding: false },
      { id: "interior-designer", label: "Interior Designer", value: "interior-designer", parentCategory: "architecture", isCoding: false },
      { id: "construction-manager", label: "Construction Manager", value: "construction-manager", parentCategory: "architecture", isCoding: false },
      { id: "urban-planner", label: "Urban Planner", value: "urban-planner", parentCategory: "architecture", isCoding: false },
      { id: "landscape-architect", label: "Landscape Architect", value: "landscape-architect", parentCategory: "architecture", isCoding: false },
    ]
  },
];

// ============================================
// LEGACY SUPPORT (Maintain backward compatibility)
// ============================================

// Flatten all sub-roles into a simple array for dropdown
export const ALL_ROLES = ROLE_CATEGORIES.flatMap(cat => 
  cat.subRoles.map(role => role.value)
);

// Map for backward compatibility
export const ROLES = ALL_ROLES;

// Map role to language (for coding roles)
export const ROLE_LANGUAGE_MAP: Record<string, string> = {
  // Backend
  "backend-dotnet": "csharp",
  "backend-java": "java",
  "backend-python": "python",
  "backend-node": "javascript",
  "backend-go": "go",
  "backend-ruby": "ruby",
  "backend-php": "php",
  
  // Frontend
  "frontend-react": "javascript",
  "frontend-angular": "typescript",
  "frontend-vue": "javascript",
  "frontend-svelte": "javascript",
  "frontend-html-css": "html",
  
  // Full Stack
  "fullstack-mern": "javascript",
  "fullstack-mean": "typescript",
  "fullstack-java": "java",
  "fullstack-python": "python",
  "fullstack-dotnet": "csharp",
  
  // Mobile
  "mobile-android": "kotlin",
  "mobile-ios": "swift",
  "mobile-react-native": "javascript",
  "mobile-flutter": "dart",
  "mobile-xamarin": "csharp",
  
  // Data & ML
  "data-scientist": "python",
  "data-analyst": "python",
  "ml-engineer": "python",
  "ai-engineer": "python",
  "data-engineer": "python",
  "database-admin": "sql",
  
  // DevOps & Cloud
  "devops": "shell",
  "cloud-aws": "yaml",
  "cloud-azure": "yaml",
  "cloud-gcp": "yaml",
  "sre": "go",
  "security": "python",
  
  // Systems & Embedded
  "systems": "cpp",
  "embedded": "c",
  "game-dev": "cpp",
  "blockchain": "solidity",
  
  // QA
  "qa-automation": "javascript",
  "sdent": "javascript",
  
  // FinTech
  "fintech-dev": "python",
  "quant-analyst": "python",
  "quant-trader": "python",
  "blockchain-finance": "solidity",
  
  // Others (non-coding default)
  "finance-analyst": "plaintext",
  "accountant": "plaintext",
  "product-manager": "markdown",
  "ui-ux-designer": "css",
  "project-manager": "markdown",
  "business-analyst": "sql",
  "it-consultant": "plaintext",
  "edtech": "javascript",
  "bioinformatics": "python",
};

// ============================================
// Other Constants (Unchanged)
// ============================================

export const SUPPORTED_LANGUAGES = [
  { label: 'JavaScript', value: 'javascript' },
  { label: 'TypeScript', value: 'typescript' },
  { label: 'Python', value: 'python' },
  { label: 'Java', value: 'java' },
  { label: 'C++', value: 'cpp' },
  { label: 'C', value: 'c' },
  { label: 'C#', value: 'csharp' },
  { label: 'Go', value: 'go' },
  { label: 'Rust', value: 'rust' },
  { label: 'PHP', value: 'php' },
  { label: 'Ruby', value: 'ruby' },
  { label: 'Swift', value: 'swift' },
  { label: 'Kotlin', value: 'kotlin' },
  { label: 'Scala', value: 'scala' },
  { label: 'Haskell', value: 'haskell' },
  { label: 'Elixir', value: 'elixir' },
  { label: 'Clojure', value: 'clojure' },
  { label: 'F#', value: 'fsharp' },
  { label: 'R', value: 'r' },
  { label: 'SQL', value: 'sql' },
  { label: 'HTML', value: 'html' },
  { label: 'CSS', value: 'css' },
  { label: 'Solidity', value: 'solidity' },
  { label: 'YAML', value: 'yaml' },
  { label: 'Markdown', value: 'markdown' },
  { label: 'Plain Text', value: 'plaintext' },
  { label: 'Shell', value: 'shell' },
  { label: 'Bash', value: 'bash' },
  { label: 'PowerShell', value: 'powershell' },
  { label: 'Perl', value: 'perl' },
  { label: 'Lua', value: 'lua' },
  { label: 'Dart', value: 'dart' },
  { label: 'Julia', value: 'julia' },
  { label: 'Objective-C', value: 'objective-c' }
];

export const LEVELS = ["Fresher", "1-2 years", "3-5 years", "5-10 years", "10+ years"];

export const TYPES = [
  { label: "Oral only", value: "oral-only" }, 
  { label: "Coding mix", value: "coding-mix" }
];

export const COUNTS = [5, 10, 15, 20];