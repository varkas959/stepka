// All mock data for Stepkai. Replace with Supabase queries later.

export const COMPANIES = [
  { id: 'amazon',     name: 'Amazon',     color: '#FF9900', initials: 'AM' },
  { id: 'google',     name: 'Google',     color: '#4285F4', initials: 'GO' },
  { id: 'microsoft',  name: 'Microsoft',  color: '#00A4EF', initials: 'MS' },
  { id: 'flipkart',   name: 'Flipkart',   color: '#2874F0', initials: 'FK' },
  { id: 'swiggy',     name: 'Swiggy',     color: '#FC8019', initials: 'SW' },
  { id: 'meta',       name: 'Meta',       color: '#1877F2', initials: 'ME' },
  { id: 'apple',      name: 'Apple',      color: '#A2AAAD', initials: 'AP' },
  { id: 'netflix',    name: 'Netflix',    color: '#E50914', initials: 'NF' },
  { id: 'uber',       name: 'Uber',       color: '#000000', initials: 'UB' },
  { id: 'airbnb',     name: 'Airbnb',     color: '#FF5A5F', initials: 'AB' },
  { id: 'stripe',     name: 'Stripe',     color: '#635BFF', initials: 'ST' },
  { id: 'razorpay',   name: 'Razorpay',   color: '#3395FF', initials: 'RP' },
  { id: 'phonepe',    name: 'PhonePe',    color: '#5F259F', initials: 'PP' },
  { id: 'paytm',      name: 'Paytm',      color: '#00BAF2', initials: 'PT' },
  { id: 'zomato',     name: 'Zomato',     color: '#CB202D', initials: 'ZO' },
  { id: 'salesforce', name: 'Salesforce', color: '#00A1E0', initials: 'SF' },
  { id: 'oracle',     name: 'Oracle',     color: '#F80000', initials: 'OR' },
  { id: 'adobe',      name: 'Adobe',      color: '#FA0F00', initials: 'AD' },
  { id: 'linkedin',   name: 'LinkedIn',   color: '#0A66C2', initials: 'LI' },
  { id: 'atlassian',  name: 'Atlassian',  color: '#0052CC', initials: 'AT' },
  { id: 'accenture',  name: 'Accenture',  color: '#A100FF', initials: 'AC' },
  { id: 'deloitte',   name: 'Deloitte',   color: '#86BC25', initials: 'DL' },
  { id: 'wipro',      name: 'Wipro',      color: '#341C68', initials: 'WI' },
  { id: 'infosys',    name: 'Infosys',    color: '#007CC3', initials: 'IN' },
  { id: 'tcs',        name: 'TCS',        color: '#002E6E', initials: 'TC' },
  { id: 'capgemini',  name: 'Capgemini',  color: '#0070AD', initials: 'CG' },
];

export const TECH_STACK = [
  'Java', 'Python', 'JavaScript', 'TypeScript', 'Go', 'Rust', 'C++', 'C#', 'Kotlin', 'Swift', 'Ruby', 'Scala',
  'React', 'Next.js', 'Node.js', 'Vue', 'Angular', 'Svelte', 'React Native', 'iOS', 'Android',
  'Spring Boot', 'Django', 'FastAPI', 'Express', 'Rails', '.NET',
  'Selenium', 'Cypress', 'Playwright', 'Jest', 'JUnit', 'PyTest', 'Appium', 'Postman',
  'Kafka', 'RabbitMQ', 'gRPC', 'GraphQL', 'REST',
  'PostgreSQL', 'MySQL', 'MongoDB', 'Redis', 'DynamoDB', 'Cassandra', 'Elasticsearch',
  'AWS', 'GCP', 'Azure', 'Kubernetes', 'Docker', 'Terraform', 'Jenkins', 'GitHub Actions',
  'Distributed Systems', 'Microservices', 'System Design', 'LLD', 'OOD',
  'ML/AI', 'TensorFlow', 'PyTorch', 'LLM', 'RAG',
];

// Canonical role taxonomy — display names shown in UI and filters
export const ROLES = [
  // Engineering
  'Junior SDE', 'Senior SDE', 'Staff Engineer', 'Principal Engineer',
  // Product & Agile
  'Product Manager', 'Product Owner', 'Business Analyst', 'Scrum Master', 'Delivery Lead',
  // Data & ML
  'Data Scientist', 'Data Engineer', 'ML Engineer',
  // QA
  'QA Engineer', 'SDET',
  // Infrastructure
  'DevOps Engineer', 'SRE',
  // Architecture & General
  'Technical Architect', 'Full Stack Developer',
];

// Maps messy/legacy role values → canonical display name
export const ROLE_MAP = {
  'SDE1': 'Junior SDE',
  'SDE2': 'Senior SDE',
  'Staff': 'Staff Engineer',
  'DS': 'Data Scientist',
  'PM': 'Product Manager',
  'PO': 'Product Owner',
  'Product owner': 'Product Owner',
  'Tester': 'QA Engineer',
  'DevOps': 'DevOps Engineer',
  'Developer': 'Full Stack Developer',
  'BA': 'Business Analyst',
  'Scrum Lead': 'Scrum Master',
};

// Category taxonomy — what kind of question is this?
export const CATEGORIES = ['DSA', 'System Design', 'Behavioral', 'Technical', 'Domain', 'Agile', 'Testing', 'DevOps'];

// Maps topic id → category
export const CATEGORY_MAP = {
  'arrays': 'DSA', 'trees': 'DSA', 'graphs': 'DSA', 'dsa': 'DSA', 'DP': 'DSA',
  'Arrays': 'DSA', 'Trees': 'DSA', 'Graphs': 'DSA',
  'system-design': 'System Design', 'System Design': 'System Design',
  'HLD': 'System Design', 'LLD': 'System Design', 'OOD': 'System Design',
  'behavioral': 'Behavioral', 'Behavioral': 'Behavioral', 'Behavioral (LP)': 'Behavioral',
  'Machine Coding': 'Technical',
  'domain': 'Domain', 'Domain': 'Domain',
  'testing': 'Testing', 'api-testing': 'Testing', 'Testing': 'Testing', 'API Testing': 'Testing',
  'devops': 'DevOps', 'DevOps': 'DevOps',
};

export const TOPIC_TREE = [
  {
    id: 'dsa', name: 'DSA',
    children: [
      { id: 'arrays', name: 'Arrays' },
      { id: 'trees', name: 'Trees' },
      { id: 'graphs', name: 'Graphs' },
    ],
  },
  { id: 'system-design', name: 'System Design' },
  { id: 'behavioral', name: 'Behavioral' },
  { id: 'domain', name: 'Domain' },
  { id: 'testing', name: 'Testing' },
  { id: 'devops', name: 'DevOps' },
  { id: 'api-testing', name: 'API Testing' },
];

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
export const ROUND_TYPES = ['Screening', 'Technical', 'System Design', 'HR'];

export const QUESTIONS = [
  {
    id: 'q1', company: 'amazon', role: 'SDE2', topic: 'arrays', topicPath: 'DSA / Arrays',
    difficulty: 'Medium', round: 'Technical',
    body: 'Given an array of integers and a target sum, return all unique triplets that sum to the target. Discuss time and space complexity. Then extend the problem to k-sum and analyze how recursion depth changes performance for large k.',
    verifyCount: 8, upvotes: 54, daysAgo: 3, asked: 47,
    tech: ['Java', 'Python', 'JavaScript'],
  },
  {
    id: 'q2', company: 'amazon', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design a distributed rate limiter that can handle 10M requests per second across multiple data centers. Discuss consistency tradeoffs, the choice between token bucket vs leaky bucket, and how you would handle clock skew across regions.',
    verifyCount: 12, upvotes: 99, daysAgo: 1, asked: 89,
    tech: ['Distributed Systems', 'System Design', 'AWS', 'Java'],
  },
  {
    id: 'q3', company: 'google', role: 'SDE2', topic: 'trees', topicPath: 'DSA / Trees',
    difficulty: 'Medium', round: 'Technical',
    body: 'Given a binary tree, return the boundary of the tree in anti-clockwise direction starting from the root. The boundary consists of the left boundary, leaves, and the right boundary in reverse.',
    verifyCount: 5, upvotes: 96, daysAgo: 6, asked: 31,
    tech: ['Java', 'C++', 'Python'],
  },
  {
    id: 'q4', company: 'google', role: 'Staff', topic: 'graphs', topicPath: 'DSA / Graphs',
    difficulty: 'Hard', round: 'Technical',
    body: 'Implement Dijkstra\'s algorithm using a Fibonacci heap. Compare amortized complexity with a binary heap and explain when the Fibonacci heap is actually slower in practice despite the better theoretical bound.',
    verifyCount: 3, upvotes: 71, daysAgo: 10, asked: 18,
  },
  {
    id: 'q5', company: 'google', role: 'SDE1', topic: 'behavioral', topicPath: 'Behavioral',
    difficulty: 'Easy', round: 'HR',
    body: 'Tell me about a time you had a strong technical disagreement with a senior engineer. How did you handle it, and what was the outcome? Be specific about the technical context and your reasoning.',
    verifyCount: 6, upvotes: 54, daysAgo: 2, asked: 22,
  },
  {
    id: 'q6', company: 'microsoft', role: 'SDE2', topic: 'arrays', topicPath: 'DSA / Arrays',
    difficulty: 'Medium', round: 'Technical',
    body: 'Given a matrix of 0s and 1s, find the largest rectangle containing only 1s and return its area. Walk through the histogram-based O(n*m) solution and discuss why the naive O(n2*m2) approach is unacceptable at scale.',
    verifyCount: 7, upvotes: 43, daysAgo: 4, asked: 38,
  },
  {
    id: 'q7', company: 'microsoft', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Microsoft Teams\' presence system. How do you propagate "online / away / busy" status to millions of users with sub-second latency without overwhelming the backend?',
    verifyCount: 4, upvotes: 89, daysAgo: 8, asked: 27,
  },
  {
    id: 'q8', company: 'microsoft', role: 'SDE1', topic: 'trees', topicPath: 'DSA / Trees',
    difficulty: 'Easy', round: 'Screening',
    body: 'Given a binary search tree, find the kth smallest element. Optimize for the case where this function is called many times on a static tree.',
    verifyCount: 9, upvotes: 67, daysAgo: 5, asked: 41,
  },
  {
    id: 'q9', company: 'flipkart', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Flipkart\'s flash sale system. The system must handle 1M concurrent users trying to buy a limited inventory of 10K items without overselling. Walk through the inventory locking, queueing, and database isolation strategy.',
    verifyCount: 11, upvotes: 75, daysAgo: 2, asked: 64,
  },
  {
    id: 'q10', company: 'flipkart', role: 'SDE1', topic: 'arrays', topicPath: 'DSA / Arrays',
    difficulty: 'Easy', round: 'Screening',
    body: 'Given a stock price array, find the maximum profit you can make with at most two buy-sell transactions. Discuss the DP state and how it generalizes to k transactions.',
    verifyCount: 6, upvotes: 78, daysAgo: 7, asked: 29,
  },
  {
    id: 'q11', company: 'flipkart', role: 'PM', topic: 'behavioral', topicPath: 'Behavioral',
    difficulty: 'Medium', round: 'HR',
    body: 'How would you prioritize between fixing a bug that affects 1% of users vs shipping a new feature requested by the sales team for a key enterprise client? Walk me through your reasoning.',
    verifyCount: 3, upvotes: 32, daysAgo: 14, asked: 12,
  },
  {
    id: 'q12', company: 'amazon', role: 'Staff', topic: 'graphs', topicPath: 'DSA / Graphs',
    difficulty: 'Hard', round: 'Technical',
    body: 'Given a directed graph representing service dependencies, detect all strongly connected components and explain how this maps to identifying circular dependencies in a microservices architecture.',
    verifyCount: 5, upvotes: 39, daysAgo: 1, asked: 33,
    tech: ['System Design', 'Microservices', 'Java', 'Go'],
  },

  // â”€â”€ Accenture Â· Selenium Developer Â· 0-2 yrs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q13', company: 'accenture', role: 'Developer', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Medium', round: 'Technical',
    body: 'What differences do you see between Selenium and Playwright in automation testing? Cover architecture, browser support, speed, built-in waiting mechanisms, and cross-language support.',
    verifyCount: 4, upvotes: 61, daysAgo: 5, asked: 22,
    tech: ['Selenium', 'Playwright', 'JavaScript', 'Java'],
  },
  {
    id: 'q14', company: 'accenture', role: 'Developer', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Medium', round: 'Technical',
    body: 'How can you retrieve all the options available in a dropdown using Selenium? Explain the Select class, how to handle both static and dynamic dropdowns, and edge cases like dropdowns built with div/ul instead of the native select element.',
    verifyCount: 3, upvotes: 44, daysAgo: 6, asked: 18,
    tech: ['Selenium', 'Java'],
  },
  {
    id: 'q15', company: 'accenture', role: 'Developer', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Medium', round: 'Technical',
    body: 'What are the different wait mechanisms in Selenium (Implicit, Explicit, Fluent Wait), and when should each be used? Explain the downsides of Thread.sleep() and how WebDriverWait improves reliability.',
    verifyCount: 6, upvotes: 78, daysAgo: 4, asked: 31,
    tech: ['Selenium', 'Java'],
  },
  {
    id: 'q16', company: 'accenture', role: 'Developer', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Medium', round: 'Technical',
    body: 'How do you handle dynamic elements or changing locators in Selenium automation? Discuss strategies like relative locators, XPath axes, CSS attribute wildcards, and Page Object Model to insulate tests from DOM changes.',
    verifyCount: 5, upvotes: 67, daysAgo: 3, asked: 26,
    tech: ['Selenium', 'Java'],
  },
  {
    id: 'q17', company: 'accenture', role: 'Developer', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Medium', round: 'Technical',
    body: 'If a team currently using Selenium plans to migrate to Playwright, how would you help them adopt the new framework? Cover project structure, locator migration, parallel execution setup, and CI integration.',
    verifyCount: 3, upvotes: 52, daysAgo: 7, asked: 15,
    tech: ['Selenium', 'Playwright', 'JavaScript', 'TypeScript'],
  },
  {
    id: 'q18', company: 'accenture', role: 'Developer', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'What is the purpose of the indexOf() method and how can it be used when removing duplicate characters from a string in Java? Walk through an O(n) solution using a LinkedHashSet or boolean array.',
    verifyCount: 2, upvotes: 29, daysAgo: 8, asked: 11,
    tech: ['Java'],
  },

  {
    id: 'q18b', company: 'accenture', role: 'Developer', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'When two developers push changes to the same file in Git simultaneously, how would you resolve the merge conflict?\nWalk through: pulling latest, identifying conflict markers (<<<, ===, >>>), choosing which changes to keep, testing after resolution, and committing the merge.',
    verifyCount: 4, upvotes: 53, daysAgo: 5, asked: 20,
    tech: ['Java', 'JavaScript'],
  },
  {
    id: 'q18c', company: 'accenture', role: 'Developer', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'Have you worked with CI/CD pipelines, and how were they used in your project?\nDescribe the tools used (Jenkins, GitHub Actions, GitLab CI), the stages in your pipeline, how tests were triggered, and how deployments were automated.',
    verifyCount: 3, upvotes: 41, daysAgo: 6, asked: 15,
    tech: ['Jenkins', 'GitHub Actions', 'Docker'],
  },
  {
    id: 'q18d', company: 'accenture', role: 'Developer', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'How does adding + "" help convert a char value into a String in Java?\nExplain Java\'s string concatenation rules, why char + "" produces a String while char + char produces an int, and alternative approaches like String.valueOf(char) or Character.toString(char).',
    verifyCount: 2, upvotes: 31, daysAgo: 7, asked: 11,
    tech: ['Java'],
  },

  // â”€â”€ Deloitte Â· DevOps Engineer Â· 3-4 yrs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q19', company: 'deloitte', role: 'DevOps', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'Describe the complete CI/CD pipeline you have implemented in your projects. Walk through every stage from code commit to production deployment, including linting, unit tests, build, artifact storage, staging deploy, integration tests, and release gates.',
    verifyCount: 7, upvotes: 94, daysAgo: 2, asked: 38,
    tech: ['Jenkins', 'GitHub Actions', 'Docker', 'Kubernetes'],
  },
  {
    id: 'q20', company: 'deloitte', role: 'DevOps', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'Explain the difference between Declarative and Scripted pipelines in Jenkins. When would you choose one over the other? Show a code snippet illustrating the structural difference.',
    verifyCount: 5, upvotes: 71, daysAgo: 3, asked: 27,
    tech: ['Jenkins'],
  },
  {
    id: 'q21', company: 'deloitte', role: 'DevOps', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'What are Jenkins Shared Libraries and how are they used in Jenkinsfiles? Explain the directory structure, how to import them, and how they help enforce consistency across multiple pipelines in a large organisation.',
    verifyCount: 4, upvotes: 58, daysAgo: 5, asked: 21,
    tech: ['Jenkins'],
  },
  {
    id: 'q22', company: 'deloitte', role: 'DevOps', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'If a Jenkins job runs but the build does not trigger, what could be the possible reasons? Systematically diagnose: webhook misconfiguration, SCM polling, branch filter mismatch, credential errors, and agent availability.',
    verifyCount: 3, upvotes: 46, daysAgo: 6, asked: 17,
    tech: ['Jenkins', 'GitHub Actions'],
  },
  {
    id: 'q23', company: 'deloitte', role: 'DevOps', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'What is the difference between ENTRYPOINT and CMD in Docker? Explain with examples how they interact when both are specified, and how CMD can be overridden at runtime while ENTRYPOINT cannot easily be replaced.',
    verifyCount: 6, upvotes: 83, daysAgo: 1, asked: 34,
    tech: ['Docker'],
  },
  {
    id: 'q24', company: 'deloitte', role: 'DevOps', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'Which Git branching strategy do you follow â€” GitFlow or trunk-based development â€” and why? Compare release cadence, merge complexity, hotfix handling, and suitability for CI/CD pipelines.',
    verifyCount: 4, upvotes: 62, daysAgo: 4, asked: 24,
    tech: ['GitHub Actions'],
  },
  {
    id: 'q24b', company: 'deloitte', role: 'DevOps', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'What stages do you generally include in a Jenkins pipeline to ensure code quality? Walk through each stage: checkout, static analysis (SonarQube/ESLint), unit tests with coverage thresholds, security scanning, build, and artifact publishing.',
    verifyCount: 5, upvotes: 74, daysAgo: 3, asked: 29,
    tech: ['Jenkins', 'Docker'],
  },
  {
    id: 'q24c', company: 'deloitte', role: 'DevOps', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'What is a webhook and how is it used in CI/CD automation? Explain how a GitHub webhook triggers a Jenkins job, the payload structure, how to secure it with a secret token, and how to debug failed webhook deliveries.',
    verifyCount: 4, upvotes: 55, daysAgo: 5, asked: 20,
    tech: ['Jenkins', 'GitHub Actions'],
  },
  {
    id: 'q24d', company: 'deloitte', role: 'DevOps', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'How do you prevent breaking the release branch during development? Discuss branch protection rules, required PR reviews, mandatory status checks, feature flags, and how to use a staging environment as a gate before merging to release.',
    verifyCount: 3, upvotes: 48, daysAgo: 6, asked: 17,
    tech: ['GitHub Actions', 'Jenkins'],
  },
  {
    id: 'q24e', company: 'deloitte', role: 'DevOps', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'If a critical issue is found in production, what steps would you take to resolve it quickly? Walk through: immediate triage, deciding between hotfix vs rollback, creating a hotfix branch, fast-track CI pipeline, communication protocol, and post-mortem.',
    verifyCount: 6, upvotes: 91, daysAgo: 1, asked: 38,
    tech: ['Jenkins', 'Docker', 'Kubernetes'],
  },
  {
    id: 'q24f', company: 'deloitte', role: 'DevOps', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'Explain your deployment workflow starting from code commit until production release. Cover feature branch â†’ PR â†’ CI â†’ merge â†’ staging deploy â†’ smoke tests â†’ canary/blue-green production deploy â†’ monitoring and rollback plan.',
    verifyCount: 7, upvotes: 39, daysAgo: 2, asked: 41,
    tech: ['Jenkins', 'Docker', 'Kubernetes', 'AWS'],
  },
  {
    id: 'q24g', company: 'deloitte', role: 'DevOps', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'What are the key steps involved in building a Docker image? Explain each Dockerfile instruction (FROM, RUN, COPY, WORKDIR, EXPOSE, CMD), multi-stage builds for smaller images, layer caching best practices, and how to scan images for vulnerabilities.',
    verifyCount: 5, upvotes: 76, daysAgo: 3, asked: 30,
    tech: ['Docker'],
  },
  {
    id: 'q24h', company: 'deloitte', role: 'DevOps', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'How do you pass environment variables during Docker build and runtime? Compare ARG (build-time) vs ENV (runtime), how to use --build-arg and --env-file, the security implications of baking secrets into layers, and safer alternatives like Docker secrets.',
    verifyCount: 4, upvotes: 61, daysAgo: 4, asked: 23,
    tech: ['Docker'],
  },
  {
    id: 'q24i', company: 'deloitte', role: 'DevOps', topic: 'devops', topicPath: 'DevOps',
    difficulty: 'Medium', round: 'Technical',
    body: 'How can Jenkins pipelines be created and triggered automatically? Explain pipeline-as-code with Jenkinsfile in SCM, multibranch pipelines that auto-discover branches, Organization Folders for GitHub orgs, and automatic triggering via webhooks vs SCM polling.',
    verifyCount: 3, upvotes: 52, daysAgo: 5, asked: 19,
    tech: ['Jenkins', 'GitHub Actions'],
  },

  // â”€â”€ Wipro Â· Tester Â· Selenium Â· 3-4 yrs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q25', company: 'wipro', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'Explain the difference between a Scenario and a Scenario Outline in Cucumber BDD. When would you use a Scenario Outline, and how do you supply multiple data rows using the Examples table? Show a real-world login test example.',
    verifyCount: 5, upvotes: 72, daysAgo: 3, asked: 28,
    tech: ['Selenium', 'Java'],
  },
  {
    id: 'q26', company: 'wipro', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'Describe how pop-ups can be handled using Selenium. Cover alert/confirm/prompt dialogs (driver.switchTo().alert()), browser-native file upload dialogs, and custom modal pop-ups built with HTML/CSS.',
    verifyCount: 4, upvotes: 65, daysAgo: 4, asked: 23,
    tech: ['Selenium', 'Java'],
  },
  {
    id: 'q27', company: 'wipro', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'What is Fluent Wait in Selenium and when is it used? Compare it with WebDriverWait, explain how to configure polling interval and ignored exceptions, and give a scenario where Fluent Wait is the only viable option.',
    verifyCount: 6, upvotes: 88, daysAgo: 2, asked: 35,
    tech: ['Selenium', 'Java'],
  },
  {
    id: 'q28', company: 'wipro', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'What is Parallel Testing and why is it useful in automation? Explain how to configure parallel execution in TestNG using the suite XML, the thread-safety concerns with WebDriver instances, and how to manage them with ThreadLocal.',
    verifyCount: 5, upvotes: 79, daysAgo: 5, asked: 29,
    tech: ['Selenium', 'Java', 'Jest'],
  },
  {
    id: 'q29', company: 'wipro', role: 'Tester', topic: 'api-testing', topicPath: 'API Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'Explain common HTTP status codes returned by APIs (2xx, 3xx, 4xx, 5xx). Differentiate between 401 vs 403, 404 vs 400, and 502 vs 503. How do you validate these in automated API tests?',
    verifyCount: 4, upvotes: 58, daysAgo: 6, asked: 21,
    tech: ['Postman', 'REST'],
  },
  {
    id: 'q30', company: 'wipro', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'Provide an XPath expression to fetch values from the second column of a web table. Explain absolute vs relative XPath, axes like following-sibling and child, and how to handle tables with dynamic row counts.',
    verifyCount: 3, upvotes: 47, daysAgo: 7, asked: 16,
    tech: ['Selenium', 'Java'],
  },

  {
    id: 'q30b', company: 'wipro', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'Describe the role of a Step Definition file in Cucumber BDD.\nHow does Cucumber link a Gherkin step to a Java method using annotations like @Given, @When, @Then? Show a complete example with a feature file and its corresponding step definition.',
    verifyCount: 4, upvotes: 58, daysAgo: 3, asked: 21,
    tech: ['Selenium', 'Java'],
  },
  {
    id: 'q30c', company: 'wipro', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'How are Tags used to organise or control test execution in Cucumber?\nExplain how to tag scenarios with @smoke, @regression, @wip, how to run only specific tagged tests from the command line, and how tags can be combined with AND/OR/NOT logic.',
    verifyCount: 3, upvotes: 46, daysAgo: 4, asked: 17,
    tech: ['Selenium', 'Java'],
  },
  {
    id: 'q30d', company: 'wipro', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'Explain the purpose of Data Tables in Cucumber scenarios.\nHow do they differ from Scenario Outline? Show an example where a Data Table passes multiple fields to a single step (e.g., a registration form), and how to read it using DataTable or a list of maps in the step definition.',
    verifyCount: 4, upvotes: 54, daysAgo: 5, asked: 19,
    tech: ['Selenium', 'Java'],
  },
  {
    id: 'q30e', company: 'wipro', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'Explain different ways to perform page scrolling during Selenium automation.\nCover: JavascriptExecutor (scrollBy, scrollIntoView), Actions class for keyboard scroll, scrolling to a specific element, and infinite scroll testing strategies.',
    verifyCount: 3, upvotes: 43, daysAgo: 6, asked: 15,
    tech: ['Selenium', 'Java'],
  },
  {
    id: 'q30f', company: 'wipro', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'Explain the purpose of the pom.xml file in a Maven project.\nDescribe the key sections: groupId/artifactId/version, dependencies, plugins, build lifecycle phases (compile, test, package, install), and how to add a Selenium + TestNG dependency with the correct scope.',
    verifyCount: 5, upvotes: 67, daysAgo: 3, asked: 24,
    tech: ['Java', 'Selenium'],
  },
  {
    id: 'q30g', company: 'wipro', role: 'Tester', topic: 'api-testing', topicPath: 'API Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'Describe JSON Schema Validation and its importance in API testing.\nWhat is a JSON schema? How do you validate that an API response conforms to the expected schema using Rest Assured or Postman? Give an example schema for a user object with required fields and type constraints.',
    verifyCount: 4, upvotes: 61, daysAgo: 4, asked: 22,
    tech: ['Postman', 'REST', 'Java'],
  },
  {
    id: 'q30h', company: 'wipro', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'Write a program to remove duplicate elements from an array and calculate the frequency of each character in a string.\nFor the array: use a LinkedHashSet or a frequency map. For character frequency: use a HashMap<Character, Integer>. Analyse time and space complexity of each approach.',
    verifyCount: 3, upvotes: 49, daysAgo: 5, asked: 18,
    tech: ['Java'],
  },
  {
    id: 'q30i', company: 'wipro', role: 'Tester', topic: 'api-testing', topicPath: 'API Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'Differentiate between Path Parameters and Query Parameters in REST APIs.\nGive examples: /users/{id} vs /users?role=admin. When should each be used? How do you pass and validate them in automated API tests using Rest Assured or Postman?',
    verifyCount: 4, upvotes: 57, daysAgo: 3, asked: 21,
    tech: ['Postman', 'REST'],
  },
  {
    id: 'q30j', company: 'wipro', role: 'Tester', topic: 'api-testing', topicPath: 'API Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'How can nested JSON responses be handled in API testing?\nShow how to extract a deeply nested value (e.g., response.data.user.address.city) using Rest Assured\'s JsonPath, and how to validate arrays of objects within the response.',
    verifyCount: 3, upvotes: 44, daysAgo: 6, asked: 16,
    tech: ['Java', 'REST', 'Postman'],
  },
  {
    id: 'q30k', company: 'wipro', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'What is an Automation Framework? Explain its structure.\nDescribe the layers: test data, page objects, utilities, test runner, reporters. Why is a framework needed vs raw Selenium scripts? Compare Data-Driven, Keyword-Driven, and Hybrid frameworks.',
    verifyCount: 5, upvotes: 72, daysAgo: 2, asked: 26,
    tech: ['Selenium', 'Java'],
  },
  {
    id: 'q30l', company: 'wipro', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'Describe OOP concepts and how they are applied in automation frameworks.\nGive concrete examples: Encapsulation in Page Objects (private WebElements), Inheritance for BaseTest/BasePage, Polymorphism for multi-browser driver factories, and Abstraction via interfaces for reporting.',
    verifyCount: 4, upvotes: 63, daysAgo: 4, asked: 23,
    tech: ['Java', 'Selenium'],
  },
  {
    id: 'q30m', company: 'wipro', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Hard', round: 'Technical',
    body: 'Explain the usage of Java collections in automation frameworks.\nWhen would you use a List vs Set vs Map in a test framework? Give real examples: storing test data in a List, deduplicating locators in a Set, mapping test case names to results in a LinkedHashMap.',
    verifyCount: 3, upvotes: 51, daysAgo: 5, asked: 19,
    tech: ['Java'],
  },

  // â”€â”€ Infosys Â· Java Developer Â· 3-5 yrs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q31', company: 'infosys', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'Explain the difference between JDK, JRE, and JVM. How are they related? Describe the JVM internals: class loader, bytecode verifier, interpreter, JIT compiler, garbage collector, and how they work together to run a Java program.',
    verifyCount: 8, upvotes: 43, daysAgo: 2, asked: 45,
    tech: ['Java'],
  },
  {
    id: 'q32', company: 'infosys', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'What is the difference between String, StringBuilder, and StringBuffer in Java? When would you use each? Explain immutability, thread safety, performance implications, and give an example where using String in a loop causes excessive object creation.',
    verifyCount: 7, upvotes: 98, daysAgo: 3, asked: 39,
    tech: ['Java'],
  },
  {
    id: 'q33', company: 'infosys', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'How do you implement custom validation in Spring Boot? Explain the approach using @Constraint and ConstraintValidator, where to place the annotation, and how to return meaningful error messages through BindingResult.',
    verifyCount: 5, upvotes: 74, daysAgo: 4, asked: 28,
    tech: ['Java', 'Spring Boot'],
  },
  {
    id: 'q34', company: 'infosys', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'Explain the Java Memory Model. What are heap and stack? How does garbage collection work? Describe generational GC (Young, Old, Metaspace), GC roots, mark-and-sweep, and how to diagnose memory leaks with tools like VisualVM or jmap.',
    verifyCount: 6, upvotes: 89, daysAgo: 5, asked: 34,
    tech: ['Java'],
  },
  {
    id: 'q35', company: 'infosys', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Medium', round: 'System Design',
    body: 'Design a library management system. Include entities (Book, Member, Loan), relationships, and key operations: borrow, return, search, fine calculation. Discuss how to handle concurrent borrows of the last copy of a book.',
    verifyCount: 4, upvotes: 61, daysAgo: 6, asked: 22,
    tech: ['Java', 'Spring Boot', 'MySQL'],
  },

  // â”€â”€ TCS Â· Java Developer Â· 4-6 yrs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q36', company: 'tcs', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'Explain the difference between HashMap and ConcurrentHashMap in Java. When would you use each? Describe segment locking in Java 7 vs the CAS-based approach in Java 8+, and why you should never use HashMap in a multi-threaded context.',
    verifyCount: 9, upvotes: 51, daysAgo: 1, asked: 52,
    tech: ['Java'],
  },
  {
    id: 'q37', company: 'tcs', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'How do you handle transactions in Spring Boot? Explain the @Transactional annotation, propagation levels (REQUIRED, REQUIRES_NEW, NESTED), isolation levels, and how Spring proxies intercept methods â€” including why self-invocation bypasses the proxy.',
    verifyCount: 7, upvotes: 41, daysAgo: 2, asked: 43,
    tech: ['Java', 'Spring Boot'],
  },
  {
    id: 'q38', company: 'tcs', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Medium', round: 'System Design',
    body: 'Design a REST API for an e-commerce cart system. Define the endpoints (add item, remove item, get cart, checkout), explain authentication with JWT, handle race conditions on inventory, and discuss idempotency for the checkout endpoint.',
    verifyCount: 8, upvotes: 46, daysAgo: 3, asked: 47,
    tech: ['Java', 'Spring Boot', 'REST', 'PostgreSQL'],
  },
  {
    id: 'q39', company: 'tcs', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'What is the difference between fail-fast and fail-safe iterators in Java Collections? Give examples of collections that use each, explain the ConcurrentModificationException, and show how to safely remove elements during iteration.',
    verifyCount: 5, upvotes: 76, daysAgo: 4, asked: 29,
    tech: ['Java'],
  },
  {
    id: 'q40', company: 'tcs', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'Write a SQL query to find the second highest salary from an Employee table. Show at least two approaches: using LIMIT/OFFSET, using a subquery with MAX, and using DENSE_RANK(). Discuss which is most efficient and why.',
    verifyCount: 10, upvotes: 55, daysAgo: 1, asked: 58,
    tech: ['MySQL', 'PostgreSQL'],
  },
  {
    id: 'q41', company: 'tcs', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'What are the SOLID principles? Explain each with a real-world Java example. Then describe a scenario where rigidly following SOLID leads to over-engineering, and how you balance pragmatism with good design.',
    verifyCount: 6, upvotes: 93, daysAgo: 5, asked: 36,
    tech: ['Java', 'Spring Boot'],
  },

  // â”€â”€ Capgemini Â· Playwright Tester Â· 4 yrs â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q42', company: 'capgemini', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Medium', round: 'Technical',
    body: 'Write Playwright code to handle multiple windows (browser contexts/tabs) and perform actions on a new page. Explain the difference between new page events and popup events, and how to wait for a page load before interacting.',
    verifyCount: 5, upvotes: 68, daysAgo: 3, asked: 24,
    tech: ['Playwright', 'TypeScript', 'JavaScript'],
  },
  {
    id: 'q43', company: 'capgemini', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Medium', round: 'Technical',
    body: 'Explain the different types of locators available in Playwright (CSS, XPath, text, role, test-id). Which are most resilient and why? Explain why role-based locators are preferred over XPath for accessibility and test stability.',
    verifyCount: 4, upvotes: 55, daysAgo: 4, asked: 19,
    tech: ['Playwright', 'TypeScript'],
  },
  {
    id: 'q44', company: 'capgemini', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Medium', round: 'Technical',
    body: 'Explain the debug process in Playwright. Cover Playwright Inspector (PWDEBUG=1), trace viewer (playwright show-trace), headed mode, slow-motion, and how to capture video/screenshots on test failure for CI debugging.',
    verifyCount: 3, upvotes: 42, daysAgo: 5, asked: 15,
    tech: ['Playwright', 'TypeScript'],
  },
  {
    id: 'q45', company: 'capgemini', role: 'Tester', topic: 'api-testing', topicPath: 'API Testing',
    difficulty: 'Medium', round: 'Technical',
    body: 'Explain the difference between PUT and PATCH in REST APIs. When is each appropriate? Show how you would test both verbs using Playwright\'s APIRequestContext, and explain how to validate partial vs full resource updates.',
    verifyCount: 4, upvotes: 59, daysAgo: 2, asked: 22,
    tech: ['Playwright', 'REST', 'TypeScript'],
  },
  {
    id: 'q46', company: 'capgemini', role: 'Tester', topic: 'testing', topicPath: 'Testing',
    difficulty: 'Medium', round: 'Technical',
    body: 'Explain the filter(), map(), and reduce() array methods in JavaScript with examples.\nShow how you would use them together to process a list of test results: filtering failures, mapping to error messages, and reducing to a summary count.',
    verifyCount: 3, upvotes: 47, daysAgo: 6, asked: 17,
    tech: ['JavaScript', 'TypeScript', 'Playwright'],
  },

  // â”€â”€ Swiggy â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q47', company: 'swiggy', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Swiggy\'s real-time order tracking system. A customer should see their delivery agent\'s location update every 5 seconds on a map.\nCover: location ingestion from agents, WebSocket vs SSE for pushing updates to clients, data store choices, and how you scale to 100k concurrent orders during peak hours.',
    verifyCount: 9, upvotes: 63, daysAgo: 1, asked: 62,
    tech: ['Kafka', 'Redis', 'AWS', 'Distributed Systems'],
  },
  {
    id: 'q48', company: 'swiggy', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Swiggy\'s restaurant search and ranking system.\nHow do you index 200k restaurants? Discuss full-text search (Elasticsearch), geospatial filtering, personalised ranking signals (past orders, ratings, delivery time), and how to refresh the index when a restaurant updates its menu.',
    verifyCount: 7, upvotes: 51, daysAgo: 3, asked: 48,
    tech: ['Elasticsearch', 'Redis', 'Distributed Systems'],
  },
  {
    id: 'q49', company: 'swiggy', role: 'SDE1', topic: 'arrays', topicPath: 'DSA / Arrays',
    difficulty: 'Medium', round: 'Technical',
    body: 'Given a list of delivery time windows for N restaurants, find the maximum number of restaurants whose windows overlap at any point in time.\nExplain the sweep-line approach, time complexity, and how this maps to capacity planning for Swiggy\'s logistics team.',
    verifyCount: 5, upvotes: 78, daysAgo: 4, asked: 29,
    tech: ['Java', 'Python'],
  },

  // â”€â”€ Meta â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q50', company: 'meta', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Facebook\'s News Feed ranking system.\nHow do you score posts from thousands of friends and pages? Cover: candidate generation, feature extraction, ML ranking model, how you handle near-real-time freshness, and edge vs server-side ranking for mobile clients.',
    verifyCount: 11, upvotes: 83, daysAgo: 2, asked: 81,
    tech: ['Distributed Systems', 'Kafka', 'Microservices'],
  },
  {
    id: 'q51', company: 'meta', role: 'SDE2', topic: 'graphs', topicPath: 'DSA / Graphs',
    difficulty: 'Hard', round: 'Technical',
    body: 'Given Meta\'s social graph, find all friend-of-friend recommendations for a user that are not already friends.\nDiscuss BFS at scale, how to prune the search space, and how to rank recommendations by mutual friend count efficiently.',
    verifyCount: 8, upvotes: 54, daysAgo: 3, asked: 54,
    tech: ['Java', 'Python', 'Distributed Systems'],
  },
  {
    id: 'q52', company: 'meta', role: 'SDE1', topic: 'behavioral', topicPath: 'Behavioral',
    difficulty: 'Medium', round: 'HR',
    body: 'Tell me about a time you had to make a decision with incomplete data.\nMeta values moving fast â€” how did you balance the need for speed against the risk of being wrong? What would you do differently today?',
    verifyCount: 6, upvotes: 87, daysAgo: 5, asked: 33,
  },

  // â”€â”€ Zomato â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q53', company: 'zomato', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Zomato\'s surge pricing engine.\nWhen demand spikes (rain, IPL final), delivery fees increase automatically.\nCover: demand signals, pricing formula, fairness constraints, A/B testing pricing strategies, and how to avoid customer backlash.',
    verifyCount: 7, upvotes: 49, daysAgo: 2, asked: 47,
    tech: ['Kafka', 'Redis', 'AWS'],
  },
  {
    id: 'q54', company: 'zomato', role: 'SDE1', topic: 'arrays', topicPath: 'DSA / Arrays',
    difficulty: 'Medium', round: 'Technical',
    body: 'Given a list of restaurant ratings and a minimum threshold, return the top-k restaurants sorted by rating using a min-heap.\nExplain why a heap beats a full sort for large k, and the time complexity of both approaches.',
    verifyCount: 4, upvotes: 61, daysAgo: 5, asked: 22,
    tech: ['Java', 'Python'],
  },

  // â”€â”€ Razorpay â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q55', company: 'razorpay', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Razorpay\'s payment retry system.\nWhen a payment fails due to a transient error (bank timeout, network blip), how do you retry safely without double-charging the customer?\nCover: idempotency keys, exponential backoff with jitter, dead-letter queues, and reconciliation with bank statements.',
    verifyCount: 10, upvotes: 72, daysAgo: 1, asked: 71,
    tech: ['Kafka', 'Redis', 'PostgreSQL', 'Distributed Systems'],
  },
  {
    id: 'q56', company: 'razorpay', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'Explain the difference between a payment gateway, payment processor, and acquiring bank.\nHow does money actually move when a customer pays with a credit card on a Razorpay-powered checkout? Walk through each hop end to end.',
    verifyCount: 6, upvotes: 39, daysAgo: 4, asked: 38,
    tech: ['REST', 'Distributed Systems'],
  },

  // â”€â”€ PhonePe â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q57', company: 'phonepe', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design PhonePe\'s UPI transaction system to handle 1 billion transactions per day.\nCover: request routing to the correct bank, NPCI integration, handling duplicate transactions, consistency vs availability trade-offs, and how you build a reliable audit trail for regulatory compliance.',
    verifyCount: 12, upvotes: 89, daysAgo: 1, asked: 89,
    tech: ['Kafka', 'Distributed Systems', 'PostgreSQL', 'Redis'],
  },
  {
    id: 'q58', company: 'phonepe', role: 'SDE1', topic: 'behavioral', topicPath: 'Behavioral',
    difficulty: 'Easy', round: 'HR',
    body: 'Why do you want to work at a fintech company specifically?\nDescribe a situation where you had to learn a domain (payments, banking, compliance) quickly to solve a technical problem. What was your approach?',
    verifyCount: 3, upvotes: 44, daysAgo: 7, asked: 16,
  },

  // â”€â”€ Paytm â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q59', company: 'paytm', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Paytm\'s wallet system that supports deposits, withdrawals, peer-to-peer transfers, and merchant payments.\nEnsure ACID properties for all transfers, discuss optimistic vs pessimistic locking, and explain how you handle a split-brain scenario where two nodes disagree on a wallet balance.',
    verifyCount: 8, upvotes: 58, daysAgo: 2, asked: 57,
    tech: ['MySQL', 'Redis', 'Distributed Systems'],
  },

  // â”€â”€ LinkedIn â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q60', company: 'linkedin', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design LinkedIn\'s "People You May Know" feature.\nHow do you compute second and third-degree connections for 900 million users efficiently?\nDiscuss graph storage (adjacency list vs matrix), batch vs real-time computation, and how to refresh recommendations when someone adds a new connection.',
    verifyCount: 9, upvotes: 65, daysAgo: 2, asked: 63,
    tech: ['Distributed Systems', 'Kafka', 'Elasticsearch'],
  },
  {
    id: 'q61', company: 'linkedin', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design LinkedIn\'s job recommendation engine.\nGiven a user\'s profile, skills, and activity, rank the most relevant open positions.\nCover candidate retrieval, feature engineering (skills overlap, company affinity, recency), and how you A/B test ranking changes at scale.',
    verifyCount: 7, upvotes: 52, daysAgo: 4, asked: 52,
    tech: ['Distributed Systems', 'Elasticsearch', 'Kafka'],
  },

  // â”€â”€ Atlassian â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q62', company: 'atlassian', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Jira\'s real-time collaborative issue editor (multiple teammates editing the same ticket simultaneously).\nCover: Operational Transformation vs CRDTs, conflict resolution, last-write-wins vs merge, and how you persist the final state while keeping latency low for users on slow connections.',
    verifyCount: 6, upvotes: 45, daysAgo: 3, asked: 44,
    tech: ['Distributed Systems', 'WebSockets'],
  },
  {
    id: 'q63', company: 'atlassian', role: 'SDE1', topic: 'behavioral', topicPath: 'Behavioral',
    difficulty: 'Medium', round: 'HR',
    body: 'Atlassian values "open company, no bullshit" and "play as a team".\nDescribe a situation where you raised a concern about a technical decision that the team had already committed to. How did you raise it, and what happened?',
    verifyCount: 4, upvotes: 63, daysAgo: 6, asked: 24,
  },

  // â”€â”€ Uber â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q64', company: 'uber', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Uber\'s driver-rider matching system.\nHow do you match the nearest available driver to a rider within 200ms at global scale?\nCover: geospatial indexing (H3/S2), the dispatch algorithm, how you handle supply-demand imbalances, and what happens when a matched driver rejects the trip.',
    verifyCount: 12, upvotes: 99, daysAgo: 1, asked: 98,
    tech: ['Distributed Systems', 'Redis', 'Kafka', 'AWS'],
  },
  {
    id: 'q65', company: 'uber', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Uber\'s dynamic pricing (surge) system.\nWhen supply is low and demand is high in a geofenced zone, prices increase automatically.\nExplain the data pipeline, the pricing model, how you prevent oscillations (price going up â†’ drivers rush in â†’ price drops â†’ drivers leave), and regulatory constraints.',
    verifyCount: 10, upvotes: 75, daysAgo: 2, asked: 74,
    tech: ['Kafka', 'Redis', 'Distributed Systems'],
  },

  // â”€â”€ Stripe â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q66', company: 'stripe', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Stripe\'s webhook delivery system.\nStripe sends millions of webhooks per day to customer endpoints that can be slow, down, or buggy.\nCover: at-least-once delivery guarantees, retry with exponential backoff, ordering guarantees (or lack thereof), how to handle a customer endpoint that is down for 24h, and the dead-letter strategy.',
    verifyCount: 11, upvotes: 79, daysAgo: 1, asked: 77,
    tech: ['Kafka', 'PostgreSQL', 'Distributed Systems', 'AWS'],
  },
  {
    id: 'q67', company: 'stripe', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Hard', round: 'Technical',
    body: 'Explain how Stripe handles exactly-once payment processing.\nA customer clicks "Pay" twice in quick succession. How does Stripe prevent double-charging?\nWalk through idempotency keys in the API, database-level constraints, and how the client should handle the case where the first request times out.',
    verifyCount: 9, upvotes: 67, daysAgo: 3, asked: 65,
    tech: ['PostgreSQL', 'REST', 'Distributed Systems'],
  },

  // â”€â”€ Salesforce â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q68', company: 'salesforce', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design a multi-tenant SaaS database architecture like Salesforce\'s.\nThousands of enterprise customers share the same infrastructure but must never see each other\'s data.\nCompare silo (one DB per tenant), pool (shared DB, tenant_id column), and bridge models. Discuss query performance, schema customisation, and compliance isolation.',
    verifyCount: 7, upvotes: 47, daysAgo: 3, asked: 46,
    tech: ['PostgreSQL', 'Distributed Systems', 'AWS'],
  },

  // â”€â”€ Oracle â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q69', company: 'oracle', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'Explain Oracle\'s MVCC (Multi-Version Concurrency Control) and how it enables consistent reads without blocking writers.\nHow does it differ from SQL Server\'s locking approach? What are the downsides of MVCC (undo log growth, long-running transactions)?',
    verifyCount: 5, upvotes: 88, daysAgo: 4, asked: 33,
    tech: ['PostgreSQL', 'MySQL'],
  },
  {
    id: 'q70', company: 'oracle', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design a distributed SQL database that supports ACID transactions across shards.\nExplain two-phase commit (2PC), its failure modes, and how Google Spanner uses TrueTime to replace 2PC with a more scalable approach.',
    verifyCount: 6, upvotes: 41, daysAgo: 5, asked: 39,
    tech: ['Distributed Systems', 'PostgreSQL'],
  },

  // â”€â”€ Adobe â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q71', company: 'adobe', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Adobe\'s document collaboration system (similar to Google Docs for PDFs).\nMultiple users can annotate and comment on a PDF simultaneously.\nCover: conflict-free annotation merging, storing annotation deltas vs full snapshots, real-time sync via WebSockets, and how you export the final annotated PDF.',
    verifyCount: 6, upvotes: 43, daysAgo: 3, asked: 41,
    tech: ['Distributed Systems', 'WebSockets', 'AWS'],
  },
  {
    id: 'q72', company: 'adobe', role: 'SDE1', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'Explain the difference between raster and vector image formats. How does Adobe Photoshop store a PSD file differently from Illustrator\'s AI format?\nDiscuss lossy vs lossless compression and when you would choose PNG vs JPEG vs WebP.',
    verifyCount: 3, upvotes: 52, daysAgo: 6, asked: 19,
    tech: ['Java', 'C++'],
  },

  // â”€â”€ Apple â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q73', company: 'apple', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design iCloud Photo Library â€” 2 billion photos synced across iPhone, iPad, and Mac.\nCover: deduplication (perceptual hashing), delta sync (only changed chunks), offline-first with conflict resolution, and privacy â€” how Apple performs server-side processing without seeing unencrypted photos.',
    verifyCount: 8, upvotes: 59, daysAgo: 2, asked: 57,
    tech: ['Distributed Systems', 'AWS', 'Kafka'],
  },
  {
    id: 'q74', company: 'apple', role: 'SDE1', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'Explain how ARC (Automatic Reference Counting) works in Swift/Objective-C.\nWhat is a retain cycle and how do you break one? Give an example using a delegate pattern and explain when to use weak vs unowned references.',
    verifyCount: 6, upvotes: 91, daysAgo: 4, asked: 34,
    tech: ['Swift', 'iOS'],
  },

  // â”€â”€ Netflix â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q75', company: 'netflix', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Netflix\'s video recommendation system.\nNetflix serves 250 million subscribers. How do you generate personalised top-10 rows for each user in real time?\nCover: collaborative filtering, content-based signals, contextual signals (time of day, device), and how you handle the cold-start problem for new users.',
    verifyCount: 12, upvotes: 95, daysAgo: 1, asked: 93,
    tech: ['Distributed Systems', 'Kafka', 'AWS'],
  },
  {
    id: 'q76', company: 'netflix', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Netflix\'s adaptive bitrate streaming (ABR) system.\nHow does the client decide which video quality to stream second by second based on available bandwidth?\nExplain DASH vs HLS, the segment request pipeline, buffer-based rate adaptation algorithms, and CDN architecture.',
    verifyCount: 10, upvotes: 74, daysAgo: 2, asked: 73,
    tech: ['Distributed Systems', 'AWS'],
  },

  // â”€â”€ Airbnb â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
  {
    id: 'q77', company: 'airbnb', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design Airbnb\'s search and availability system.\nA guest searches for "Paris, 3 nights, 2 guests" and sees ranked listings.\nCover: availability calendar storage, real-time inventory updates (when host blocks dates), geospatial search, ranking signals (price, reviews, Superhost status), and how you handle the thundering herd on popular dates.',
    verifyCount: 9, upvotes: 64, daysAgo: 2, asked: 62,
    tech: ['Elasticsearch', 'Redis', 'Distributed Systems', 'PostgreSQL'],
  },

  // ── Amazon (additional) ───────────────────────────────────────────────────
  { id: 'q78', company: 'amazon', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Tell me about a time you had to deliver a project under a very tight deadline. What trade-offs did you make and how did you communicate them to stakeholders? Which Amazon Leadership Principle guided your decision?',
    verifyCount: 8, upvotes: 62, daysAgo: 2, asked: 44 },
  { id: 'q79', company: 'amazon', role: 'SDE1', topic: 'arrays', topicPath: 'DSA / Arrays', difficulty: 'Medium', round: 'Technical',
    body: 'Given an array of integers, find the length of the longest subarray with a sum equal to zero.\nExplain the prefix sum + HashMap approach and why the naive O(n2) solution is unacceptable for large inputs.',
    verifyCount: 6, upvotes: 51, daysAgo: 4, asked: 32, tech: ['Java', 'Python'] },
  { id: 'q80', company: 'amazon', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Amazon\'s recommendation engine (customers who bought X also bought Y).\nCover: collaborative filtering vs content-based, item-item similarity at scale, real-time vs batch computation, and how you handle the cold-start problem for new products.',
    verifyCount: 7, upvotes: 58, daysAgo: 3, asked: 38, tech: ['Distributed Systems', 'Kafka', 'AWS'] },
  { id: 'q81', company: 'amazon', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'Explain Amazon\'s DynamoDB single-table design pattern.\nWhy do you put multiple entity types in one table? Walk through a real example with access patterns, partition key / sort key design, and GSI usage.',
    verifyCount: 5, upvotes: 47, daysAgo: 5, asked: 28, tech: ['AWS', 'DynamoDB', 'Java'] },
  { id: 'q82', company: 'amazon', role: 'SDE1', topic: 'trees', topicPath: 'DSA / Trees', difficulty: 'Medium', round: 'Technical',
    body: 'Serialize and deserialize a binary tree. Implement both functions and explain why BFS serialization makes deserialization simpler than DFS. What is the time and space complexity?',
    verifyCount: 6, upvotes: 44, daysAgo: 6, asked: 27, tech: ['Java', 'Python'] },
  { id: 'q83', company: 'amazon', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Describe a time you disagreed with a decision made by your team or manager. How did you raise the concern? What was the outcome? (Amazon LP: Have Backbone; Disagree and Commit)',
    verifyCount: 7, upvotes: 55, daysAgo: 3, asked: 36 },

  // ── Google (additional) ───────────────────────────────────────────────────
  { id: 'q84', company: 'google', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Google Search autocomplete. As a user types "wea", suggest "weather", "weather today", "weather London".\nCover: trie vs inverted index, personalisation, freshness, latency budget (<100ms), and how you handle offensive query suggestions.',
    verifyCount: 11, upvotes: 79, daysAgo: 1, asked: 55, tech: ['Distributed Systems', 'Redis'] },
  { id: 'q85', company: 'google', role: 'SDE2', topic: 'graphs', topicPath: 'DSA / Graphs', difficulty: 'Hard', round: 'Technical',
    body: 'Implement a topological sort for a directed acyclic graph. Then extend it to detect cycles and explain how this maps to dependency resolution in build systems like Bazel.',
    verifyCount: 7, upvotes: 61, daysAgo: 3, asked: 38, tech: ['Java', 'Python', 'Go'] },
  { id: 'q86', company: 'google', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Google Maps ETA calculation.\nHow do you compute the fastest route for 1B+ users in real time? Cover: graph representation of road network, Dijkstra vs A* vs Contraction Hierarchies, live traffic data ingestion, and how you handle road closures.',
    verifyCount: 9, upvotes: 72, daysAgo: 2, asked: 48, tech: ['Distributed Systems', 'Kafka', 'GCP'] },
  { id: 'q87', company: 'google', role: 'SDE1', topic: 'arrays', topicPath: 'DSA / Arrays', difficulty: 'Medium', round: 'Technical',
    body: 'Given a list of intervals, merge all overlapping intervals and return the result.\nExplain the sort-then-scan approach and the edge cases (touching intervals, single interval, all disjoint).',
    verifyCount: 8, upvotes: 67, daysAgo: 3, asked: 43, tech: ['Java', 'Python', 'C++'] },
  { id: 'q88', company: 'google', role: 'Staff', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Bigtable or a wide-column store from scratch. Explain SSTable, memtable, compaction strategies (size-tiered vs levelled), bloom filters for read optimisation, and how you handle tombstones for deletes.',
    verifyCount: 6, upvotes: 53, daysAgo: 5, asked: 31, tech: ['Distributed Systems', 'GCP'] },
  { id: 'q89', company: 'google', role: 'SDE1', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Easy', round: 'HR',
    body: 'Google values "Googleyness". Describe a situation where you went significantly beyond your role to help a colleague or improve something that was not your responsibility.',
    verifyCount: 5, upvotes: 42, daysAgo: 6, asked: 25 },
  { id: 'q90', company: 'google', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'Explain how a browser renders a web page from the moment the user presses Enter.\nCover: DNS resolution, TCP handshake, HTTP request, HTML parsing, CSSOM, render tree, layout, paint, and compositing. Where would you optimise for Core Web Vitals?',
    verifyCount: 7, upvotes: 58, daysAgo: 4, asked: 35, tech: ['JavaScript', 'Node.js'] },

  // ── Microsoft (additional) ────────────────────────────────────────────────
  { id: 'q91', company: 'microsoft', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Azure Blob Storage.\nHow do you store, replicate, and serve petabytes of unstructured data with 11 nines of durability? Cover: chunking, erasure coding vs 3-way replication, geo-redundancy, and handling hot blobs.',
    verifyCount: 7, upvotes: 57, daysAgo: 3, asked: 36, tech: ['Distributed Systems', 'Azure'] },
  { id: 'q92', company: 'microsoft', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'Explain the difference between process and thread in Windows. What is a fiber? Describe how the .NET thread pool works and when you would use async/await vs raw Thread vs ThreadPool.',
    verifyCount: 6, upvotes: 48, daysAgo: 4, asked: 29, tech: ['.NET', 'C#'] },
  { id: 'q93', company: 'microsoft', role: 'SDE1', topic: 'trees', topicPath: 'DSA / Trees', difficulty: 'Medium', round: 'Technical',
    body: 'Given a binary tree, print nodes level by level (BFS traversal). Then modify it to print alternate levels in reverse order (zigzag traversal). Analyse time and space complexity.',
    verifyCount: 8, upvotes: 61, daysAgo: 2, asked: 40, tech: ['Java', 'C#', 'Python'] },
  { id: 'q94', company: 'microsoft', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Microsoft asks about "growth mindset". Tell me about a significant technical failure you experienced. What did you learn and how did you change your approach as a result?',
    verifyCount: 6, upvotes: 45, daysAgo: 5, asked: 27 },
  { id: 'q95', company: 'microsoft', role: 'SDE2', topic: 'graphs', topicPath: 'DSA / Graphs', difficulty: 'Hard', round: 'Technical',
    body: 'Given a 2D grid of 0s and 1s, count the number of islands. Then extend: find the largest island, and then explain how you would solve this for a streaming grid that changes in real time using a Union-Find structure.',
    verifyCount: 7, upvotes: 54, daysAgo: 3, asked: 34, tech: ['Java', 'Python', 'C#'] },
  { id: 'q96', company: 'microsoft', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design a collaborative code editor like VS Code Live Share. Multiple developers edit the same file simultaneously with cursors visible to all.\nCover: OT vs CRDT, undo/redo in a collaborative context, and low-latency sync across regions.',
    verifyCount: 5, upvotes: 49, daysAgo: 5, asked: 30, tech: ['Distributed Systems', 'WebSockets'] },
  { id: 'q97', company: 'microsoft', role: 'SDE1', topic: 'arrays', topicPath: 'DSA / Arrays', difficulty: 'Easy', round: 'Screening',
    body: 'Find all pairs in an array that sum to a given target value. Explain the HashSet approach for O(n) time, handle duplicate pairs correctly, and discuss edge cases (negative numbers, empty array).',
    verifyCount: 9, upvotes: 55, daysAgo: 2, asked: 37, tech: ['Java', 'C#', 'Python'] },

  // ── Flipkart (additional) ─────────────────────────────────────────────────
  { id: 'q98', company: 'flipkart', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Flipkart\'s product search and ranking system. A user searches "wireless earphones under 2000". How do you retrieve, rank, and filter 10,000+ matching products in under 200ms?',
    verifyCount: 8, upvotes: 63, daysAgo: 2, asked: 41, tech: ['Elasticsearch', 'Kafka', 'Redis'] },
  { id: 'q99', company: 'flipkart', role: 'SDE1', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'Implement a LRU (Least Recently Used) cache with O(1) get and put operations.\nExplain the HashMap + doubly linked list approach and why a simple array or single HashMap is insufficient.',
    verifyCount: 9, upvotes: 67, daysAgo: 1, asked: 45, tech: ['Java'] },
  { id: 'q100', company: 'flipkart', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Describe a time you had to convince a skeptical stakeholder to adopt a technical solution. What data or arguments did you use and what was the outcome?',
    verifyCount: 5, upvotes: 38, daysAgo: 6, asked: 22 },
  { id: 'q101', company: 'flipkart', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'Design a coupon/discount system for Flipkart Big Billion Days. The system must validate, apply, and prevent double-use of millions of coupons with high concurrency. Cover idempotency and distributed locking.',
    verifyCount: 7, upvotes: 56, daysAgo: 3, asked: 35, tech: ['Java', 'Redis', 'PostgreSQL'] },
  { id: 'q102', company: 'flipkart', role: 'SDE1', topic: 'graphs', topicPath: 'DSA / Graphs', difficulty: 'Medium', round: 'Technical',
    body: 'Given a directed graph representing category hierarchies in an e-commerce catalog, find the shortest path between two categories. Explain BFS vs Dijkstra for unweighted vs weighted graphs.',
    verifyCount: 4, upvotes: 33, daysAgo: 7, asked: 18, tech: ['Java', 'Python'] },
  { id: 'q103', company: 'flipkart', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Flipkart\'s order management system. From "Place Order" to "Delivered", walk through every state transition, the microservices involved, how you handle partial failures (payment succeeds but inventory deduct fails), and eventual consistency.',
    verifyCount: 8, upvotes: 59, daysAgo: 2, asked: 38, tech: ['Kafka', 'Distributed Systems', 'Java'] },

  // ── Swiggy (additional) ───────────────────────────────────────────────────
  { id: 'q104', company: 'swiggy', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Swiggy\'s delivery partner assignment algorithm. When an order is placed, how do you assign the optimal nearby delivery partner within 2 minutes considering distance, current load, and restaurant prep time?',
    verifyCount: 8, upvotes: 61, daysAgo: 2, asked: 40, tech: ['Redis', 'Kafka', 'Distributed Systems'] },
  { id: 'q105', company: 'swiggy', role: 'SDE1', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'Implement a rate limiter for Swiggy\'s API gateway using the token bucket algorithm. Handle 1000 requests/second per user. Code the solution and explain how you\'d deploy it across multiple API servers with Redis.',
    verifyCount: 6, upvotes: 49, daysAgo: 4, asked: 30, tech: ['Redis', 'Java', 'Python'] },
  { id: 'q106', company: 'swiggy', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Tell me about a time you had to make a quick technical decision with limited information. How did you validate the decision afterwards? What would you do differently?',
    verifyCount: 4, upvotes: 35, daysAgo: 5, asked: 20 },
  { id: 'q107', company: 'swiggy', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Swiggy\'s notification system. When an order status changes (Confirmed, Picked Up, Arriving), send push notification, SMS, and in-app notification reliably with at-least-once delivery. Cover fan-out and handling inactive devices.',
    verifyCount: 7, upvotes: 53, daysAgo: 3, asked: 33, tech: ['Kafka', 'Redis', 'AWS'] },
  { id: 'q108', company: 'swiggy', role: 'SDE1', topic: 'arrays', topicPath: 'DSA / Arrays', difficulty: 'Medium', round: 'Technical',
    body: 'Given delivery time estimates for N restaurants, find the restaurant with the minimum average delivery time across all its orders. Handle ties and explain your data structure choices.',
    verifyCount: 5, upvotes: 41, daysAgo: 5, asked: 24, tech: ['Java', 'Python'] },
  { id: 'q109', company: 'swiggy', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'Design the data model for Swiggy\'s menu system. A restaurant has categories, items, add-ons, variants, and availability windows (breakfast/lunch/dinner). How do you model this in PostgreSQL and handle real-time menu updates?',
    verifyCount: 6, upvotes: 48, daysAgo: 4, asked: 28, tech: ['PostgreSQL', 'Redis', 'Java'] },

  // ── Meta (additional) ─────────────────────────────────────────────────────
  { id: 'q110', company: 'meta', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Facebook Live - a system to stream live video from one user to potentially millions of concurrent viewers with low latency.\nCover: ingest pipeline, transcoding, CDN edge caching, adaptive bitrate, and how you handle a celebrity going live.',
    verifyCount: 10, upvotes: 71, daysAgo: 2, asked: 48, tech: ['Distributed Systems', 'Kafka', 'AWS'] },
  { id: 'q111', company: 'meta', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design WhatsApp\'s end-to-end encrypted messaging system. How do you exchange keys, store messages server-side without reading them, and handle multi-device sync? Cover the Signal Protocol basics.',
    verifyCount: 8, upvotes: 65, daysAgo: 3, asked: 43, tech: ['Distributed Systems', 'Kafka'] },
  { id: 'q112', company: 'meta', role: 'SDE1', topic: 'graphs', topicPath: 'DSA / Graphs', difficulty: 'Medium', round: 'Technical',
    body: 'Given a social graph, find all users within K hops of a given user. Implement BFS with a visited set. Then discuss how you would scale this to Meta\'s 3 billion user graph using partitioning.',
    verifyCount: 7, upvotes: 58, daysAgo: 3, asked: 37, tech: ['Python', 'Java'] },
  { id: 'q113', company: 'meta', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Meta values moving fast. Describe a time you shipped something that later needed to be rolled back or significantly reworked. What was the cost and what did you learn about the balance between speed and reliability?',
    verifyCount: 6, upvotes: 47, daysAgo: 5, asked: 28 },
  { id: 'q114', company: 'meta', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'Explain how React\'s virtual DOM diffing algorithm (reconciliation) works. Why is it O(n) instead of O(n3)? What are the assumptions it makes and when do those break down (causing performance issues)?',
    verifyCount: 7, upvotes: 56, daysAgo: 4, asked: 34, tech: ['React', 'JavaScript'] },
  { id: 'q115', company: 'meta', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Instagram Stories. A story disappears after 24 hours and is shown in a ring around profile pictures. Cover: upload pipeline, storage with TTL, efficient delivery to followers, and view count tracking at scale.',
    verifyCount: 9, upvotes: 66, daysAgo: 2, asked: 44, tech: ['Distributed Systems', 'Kafka', 'Redis'] },
  { id: 'q116', company: 'meta', role: 'SDE1', topic: 'arrays', topicPath: 'DSA / Arrays', difficulty: 'Medium', round: 'Technical',
    body: 'Given an array of N integers, find the maximum product subarray. Explain why you need to track both the maximum and minimum product ending at each position, and handle zeros and negative numbers.',
    verifyCount: 6, upvotes: 52, daysAgo: 3, asked: 33, tech: ['Python', 'Java', 'JavaScript'] },

  // ── Apple (additional) ────────────────────────────────────────────────────
  { id: 'q117', company: 'apple', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Apple Pay\'s tap-to-pay system. When a user taps their iPhone, a payment must complete in under 500ms even with no internet connection. Cover: secure element, tokenisation, NFC protocol, and offline authorisation.',
    verifyCount: 7, upvotes: 59, daysAgo: 3, asked: 38, tech: ['Distributed Systems', 'iOS'] },
  { id: 'q118', company: 'apple', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Apple is obsessed with privacy. Describe a feature you designed or could design where user privacy was a significant engineering constraint. How did you balance functionality with privacy?',
    verifyCount: 6, upvotes: 47, daysAgo: 4, asked: 28 },
  { id: 'q119', company: 'apple', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'Explain iOS memory management: ARC, strong/weak/unowned references, retain cycles. How does the system handle memory pressure? Walk through what happens when an app receives a memory warning and is then terminated.',
    verifyCount: 8, upvotes: 62, daysAgo: 2, asked: 39, tech: ['Swift', 'iOS', 'Kotlin'] },
  { id: 'q120', company: 'apple', role: 'SDE1', topic: 'trees', topicPath: 'DSA / Trees', difficulty: 'Medium', round: 'Technical',
    body: 'Given a BST, find the closest value to a given target. Explain the O(log n) iterative approach using BST properties, and how the answer changes if the tree is unbalanced.',
    verifyCount: 5, upvotes: 41, daysAgo: 5, asked: 24, tech: ['Swift', 'Java', 'Python'] },
  { id: 'q121', company: 'apple', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Siri\'s speech recognition pipeline. Audio is captured on-device, processed, and a response is returned. How do you split on-device vs server processing to balance latency, privacy, and accuracy?',
    verifyCount: 6, upvotes: 53, daysAgo: 4, asked: 32, tech: ['Distributed Systems', 'iOS'] },
  { id: 'q122', company: 'apple', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'How does Core Data work in iOS? Explain the managed object context, persistent store coordinator, and the fetch request pipeline. When would you use Core Data vs Realm vs SQLite directly?',
    verifyCount: 5, upvotes: 43, daysAgo: 5, asked: 26, tech: ['Swift', 'iOS'] },

  // ── Netflix (additional) ──────────────────────────────────────────────────
  { id: 'q123', company: 'netflix', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Netflix\'s content delivery pipeline. A new movie is added. Walk through transcoding into 50+ formats, uploading to CDN edge nodes globally, and ensuring playback starts within 200ms for any device anywhere.',
    verifyCount: 9, upvotes: 69, daysAgo: 2, asked: 46, tech: ['Distributed Systems', 'AWS', 'Kafka'] },
  { id: 'q124', company: 'netflix', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Netflix\'s culture deck says "adequate performance gets a generous severance". Describe how you handled a situation where a team member was underperforming. What was your approach?',
    verifyCount: 5, upvotes: 42, daysAgo: 5, asked: 26 },
  { id: 'q125', company: 'netflix', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'Explain Netflix\'s Chaos Engineering philosophy and the Simian Army. How do you design a system to be resilient to random instance failures, network partitions, and zone outages? Give a concrete example.',
    verifyCount: 7, upvotes: 57, daysAgo: 3, asked: 35, tech: ['AWS', 'Distributed Systems'] },
  { id: 'q126', company: 'netflix', role: 'SDE1', topic: 'arrays', topicPath: 'DSA / Arrays', difficulty: 'Medium', round: 'Technical',
    body: 'Given a list of movie ratings (1-5 stars) for N users, compute the Pearson correlation between two users to measure taste similarity. Explain how this feeds into collaborative filtering.',
    verifyCount: 5, upvotes: 44, daysAgo: 4, asked: 27, tech: ['Python', 'Java'] },
  { id: 'q127', company: 'netflix', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Netflix\'s A/B testing platform. Engineers run 100+ experiments simultaneously on different features. How do you assign users to buckets consistently, collect metrics, measure statistical significance, and avoid interaction effects?',
    verifyCount: 8, upvotes: 62, daysAgo: 3, asked: 40, tech: ['Distributed Systems', 'Kafka', 'AWS'] },
  { id: 'q128', company: 'netflix', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'What is the circuit breaker pattern? Explain the three states (Closed, Open, Half-Open), when to trip and reset the breaker, and how Netflix\'s Hystrix library implements it. When would you NOT use a circuit breaker?',
    verifyCount: 7, upvotes: 55, daysAgo: 4, asked: 33, tech: ['Java', 'Spring Boot', 'Distributed Systems'] },

  // ── Uber (additional) ─────────────────────────────────────────────────────
  { id: 'q129', company: 'uber', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Uber Eats\' order batching system. A single delivery partner picks up orders from multiple nearby restaurants and delivers to multiple customers in one trip. How do you optimise the route and assignment?',
    verifyCount: 8, upvotes: 62, daysAgo: 2, asked: 41, tech: ['Distributed Systems', 'Redis', 'Kafka'] },
  { id: 'q130', company: 'uber', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Describe a time you had to work with a very ambiguous technical requirement. How did you clarify scope, make progress, and manage stakeholder expectations during the process?',
    verifyCount: 5, upvotes: 39, daysAgo: 5, asked: 24 },
  { id: 'q131', company: 'uber', role: 'SDE1', topic: 'graphs', topicPath: 'DSA / Graphs', difficulty: 'Hard', round: 'Technical',
    body: 'Given a city map as a weighted graph, find the shortest travel time from a driver\'s current location to all potential passenger pickup points simultaneously. How does Dijkstra\'s multi-source variant solve this?',
    verifyCount: 6, upvotes: 49, daysAgo: 4, asked: 30, tech: ['Java', 'Python', 'Go'] },
  { id: 'q132', company: 'uber', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'Uber uses H3 hexagonal geospatial indexing. Explain why hexagons are better than squares or lat/lng grids for proximity searches. How do you find all drivers within 2km of a rider using H3 resolution levels?',
    verifyCount: 7, upvotes: 54, daysAgo: 3, asked: 34, tech: ['Distributed Systems', 'Redis'] },
  { id: 'q133', company: 'uber', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Uber\'s payment reconciliation system. Uber collects payments in 70+ countries with different currencies, payment methods, and regulations. How do you reconcile driver payouts against rider charges and detect discrepancies?',
    verifyCount: 8, upvotes: 60, daysAgo: 3, asked: 38, tech: ['Distributed Systems', 'PostgreSQL', 'Kafka'] },
  { id: 'q134', company: 'uber', role: 'SDE1', topic: 'arrays', topicPath: 'DSA / Arrays', difficulty: 'Medium', round: 'Technical',
    body: 'Given a list of GPS coordinates representing a driver\'s path, compute the total distance travelled. Then find the longest contiguous segment where the driver was stationary (speed < 5 km/h). Discuss floating-point precision issues.',
    verifyCount: 5, upvotes: 42, daysAgo: 5, asked: 26, tech: ['Java', 'Python'] },

  // ── Airbnb (additional) ───────────────────────────────────────────────────
  { id: 'q135', company: 'airbnb', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Airbnb\'s trust and safety system. How do you detect fraudulent listings, scam messages, and fake reviews at scale without blocking legitimate hosts and guests?',
    verifyCount: 7, upvotes: 58, daysAgo: 3, asked: 37, tech: ['Distributed Systems', 'Kafka', 'Elasticsearch'] },
  { id: 'q136', company: 'airbnb', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Airbnb talks about "belonging anywhere". Describe a time you built something that made a product more inclusive or accessible. What trade-offs did it involve?',
    verifyCount: 4, upvotes: 35, daysAgo: 6, asked: 20 },
  { id: 'q137', company: 'airbnb', role: 'SDE1', topic: 'arrays', topicPath: 'DSA / Arrays', difficulty: 'Medium', round: 'Technical',
    body: 'Given a list of bookings with start and end dates, find the minimum number of rooms needed so that no two overlapping bookings share a room. Explain the sweep-line and min-heap approaches.',
    verifyCount: 8, upvotes: 63, daysAgo: 2, asked: 42, tech: ['Java', 'Python'] },
  { id: 'q138', company: 'airbnb', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'How does Airbnb\'s dynamic pricing work? Given historical booking data, seasonality, local events, and competitor prices, how do you recommend a nightly rate that maximises host revenue? Discuss the ML pipeline.',
    verifyCount: 6, upvotes: 51, daysAgo: 4, asked: 31, tech: ['Python', 'Distributed Systems'] },
  { id: 'q139', company: 'airbnb', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Airbnb\'s review system. Guests and hosts review each other after a stay. Reviews are revealed simultaneously to prevent bias. Cover: the blind reveal mechanism, preventing fake reviews, and abuse detection.',
    verifyCount: 7, upvotes: 55, daysAgo: 3, asked: 34, tech: ['PostgreSQL', 'Kafka', 'Redis'] },
  { id: 'q140', company: 'airbnb', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Airbnb\'s host payout system. Hosts in 220+ countries receive payouts in local currency via bank transfer, PayPal, or Payoneer. Cover: currency conversion, scheduled payouts, failed payout handling, and tax compliance.',
    verifyCount: 6, upvotes: 48, daysAgo: 4, asked: 30, tech: ['Distributed Systems', 'Kafka', 'PostgreSQL'] },

  // ── Stripe (additional) ───────────────────────────────────────────────────
  { id: 'q141', company: 'stripe', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Stripe\'s fraud detection system. For every payment, you must decide accept/decline in under 100ms using hundreds of signals. Cover: feature engineering, real-time ML scoring, rule engine, and how you minimise false positives (declined legitimate payments).',
    verifyCount: 9, upvotes: 68, daysAgo: 2, asked: 44, tech: ['Distributed Systems', 'Kafka', 'PostgreSQL'] },
  { id: 'q142', company: 'stripe', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Stripe is known for extremely high engineering standards ("move carefully and fix things"). Describe a time you pushed back on a deadline to ensure correctness. Was it the right call?',
    verifyCount: 5, upvotes: 43, daysAgo: 5, asked: 27 },
  { id: 'q143', company: 'stripe', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'Explain PCI-DSS compliance requirements for handling card data. What is tokenisation? How does Stripe use it to ensure raw card numbers never touch customer servers? What are the implications for your API design?',
    verifyCount: 6, upvotes: 52, daysAgo: 4, asked: 32, tech: ['REST', 'Distributed Systems'] },
  { id: 'q144', company: 'stripe', role: 'SDE1', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'Explain the difference between synchronous and asynchronous API design using Stripe as an example. When does a charge complete immediately vs require a webhook? How do you handle the intermediate "pending" state in your database?',
    verifyCount: 7, upvotes: 57, daysAgo: 3, asked: 36, tech: ['REST', 'PostgreSQL', 'Java'] },
  { id: 'q145', company: 'stripe', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Stripe\'s subscription billing system (Stripe Billing). Customers are charged on recurring intervals (monthly/annual) in different currencies, with proration for plan upgrades. Cover: invoice generation, dunning for failed payments, and SCA (Strong Customer Authentication) compliance.',
    verifyCount: 8, upvotes: 63, daysAgo: 3, asked: 40, tech: ['PostgreSQL', 'Kafka', 'Distributed Systems'] },

  // ── Razorpay (additional) ─────────────────────────────────────────────────
  { id: 'q146', company: 'razorpay', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Razorpay\'s payout system (RazorpayX). Businesses send bulk payouts to thousands of vendor accounts simultaneously. Cover: batching, bank API rate limits, real-time status tracking, and failure handling.',
    verifyCount: 8, upvotes: 61, daysAgo: 2, asked: 39, tech: ['Kafka', 'PostgreSQL', 'Redis'] },
  { id: 'q147', company: 'razorpay', role: 'SDE1', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'Explain the UPI payment flow end-to-end: from user entering a VPA to money credited. What is NPCI\'s role? What happens when the beneficiary bank is down? How does Razorpay handle UPI collect vs UPI intent flows?',
    verifyCount: 6, upvotes: 51, daysAgo: 4, asked: 32, tech: ['REST', 'Java'] },
  { id: 'q148', company: 'razorpay', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Describe a production incident you were part of. Walk through the detection, triage, resolution, and post-mortem. What monitoring or process changes did you introduce afterwards?',
    verifyCount: 6, upvotes: 48, daysAgo: 4, asked: 29 },
  { id: 'q149', company: 'razorpay', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'How do you implement a distributed ledger for financial transactions? Explain double-entry bookkeeping in code, why you never update a balance directly, and how you use event sourcing to reconstruct the current balance from a transaction log.',
    verifyCount: 7, upvotes: 56, daysAgo: 3, asked: 35, tech: ['PostgreSQL', 'Java', 'Kafka'] },
  { id: 'q150', company: 'razorpay', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Razorpay\'s dashboard for merchants. A merchant wants to see real-time revenue, transaction success rates, and refund trends. How do you aggregate millions of transactions into live charts with under 5-second latency?',
    verifyCount: 6, upvotes: 49, daysAgo: 4, asked: 30, tech: ['Kafka', 'Redis', 'PostgreSQL'] },

  // ── PhonePe (additional) ──────────────────────────────────────────────────
  { id: 'q151', company: 'phonepe', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design PhonePe\'s switch - the internal routing layer that forwards UPI requests to the correct bank. It must be highly available (99.999%), handle 50k TPS, and complete each request within 30 seconds (NPCI timeout). Cover: circuit breakers, retries, and bank-specific timeouts.',
    verifyCount: 9, upvotes: 66, daysAgo: 2, asked: 43, tech: ['Distributed Systems', 'Kafka', 'Redis'] },
  { id: 'q152', company: 'phonepe', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'Explain how PhonePe handles transaction deduplication. A user taps "Pay" twice due to network lag. The same debit must not happen twice. Walk through idempotency at the API level, database level, and bank integration level.',
    verifyCount: 7, upvotes: 55, daysAgo: 3, asked: 35, tech: ['PostgreSQL', 'Redis', 'Java'] },
  { id: 'q153', company: 'phonepe', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Tell me about a time you had to debug a critical production issue affecting financial transactions. What was your systematic approach, how did you communicate during the incident, and what was the resolution?',
    verifyCount: 6, upvotes: 47, daysAgo: 4, asked: 29 },
  { id: 'q154', company: 'phonepe', role: 'SDE1', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'What is eventual consistency and why is it acceptable for some PhonePe features but not others? Give examples: where strong consistency is mandatory (debit/credit) vs where eventual consistency is fine (notification delivery, analytics).',
    verifyCount: 5, upvotes: 43, daysAgo: 5, asked: 26, tech: ['Distributed Systems', 'Java'] },
  { id: 'q155', company: 'phonepe', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design PhonePe\'s merchant settlement system. Thousands of merchants receive daily settlements of their collected payments minus fees. How do you compute net payables, batch into bank transfers, and provide a reconciliation report?',
    verifyCount: 7, upvotes: 54, daysAgo: 3, asked: 33, tech: ['Kafka', 'PostgreSQL', 'Redis'] },

  // ── Paytm (additional) ────────────────────────────────────────────────────
  { id: 'q156', company: 'paytm', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Paytm\'s cashback system. When a user completes a transaction, they may receive cashback based on complex rules (merchant, time, amount, user segment). The cashback is credited to their wallet. Cover: rule engine, deduplication, and fraud prevention.',
    verifyCount: 7, upvotes: 56, daysAgo: 3, asked: 36, tech: ['Kafka', 'Redis', 'PostgreSQL'] },
  { id: 'q157', company: 'paytm', role: 'SDE1', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'How does Paytm\'s QR code payment work technically? Explain the difference between static QR (merchant VPA encoded) and dynamic QR (amount pre-filled). What are the security implications of each?',
    verifyCount: 5, upvotes: 44, daysAgo: 5, asked: 27, tech: ['Java', 'REST'] },
  { id: 'q158', company: 'paytm', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Paytm operates in a highly regulated environment (RBI guidelines). Describe a time when a regulatory requirement forced you to change a technical design. How did you balance compliance with user experience?',
    verifyCount: 4, upvotes: 36, daysAgo: 6, asked: 22 },
  { id: 'q159', company: 'paytm', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Paytm\'s KYC (Know Your Customer) pipeline. Users must submit Aadhaar/PAN documents for verification. How do you store documents securely (encrypted at rest), verify them (ML + manual review), and handle status callbacks?',
    verifyCount: 6, upvotes: 49, daysAgo: 4, asked: 30, tech: ['AWS', 'Kafka', 'PostgreSQL'] },
  { id: 'q160', company: 'paytm', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'Explain Paytm\'s mini-app platform architecture. Third-party developers build apps that run inside the Paytm super-app. How do you sandbox them (security), manage their lifecycle, share user identity safely (OAuth), and handle payments on their behalf?',
    verifyCount: 5, upvotes: 45, daysAgo: 5, asked: 28, tech: ['JavaScript', 'React', 'REST'] },

  // ── Zomato (additional) ───────────────────────────────────────────────────
  { id: 'q161', company: 'zomato', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Zomato\'s delivery time prediction system. Before placing an order, show "Delivers in 35 minutes". The estimate must account for restaurant preparation time, distance, traffic, and number of parallel orders the partner is handling.',
    verifyCount: 8, upvotes: 62, daysAgo: 2, asked: 40, tech: ['Kafka', 'Redis', 'Distributed Systems'] },
  { id: 'q162', company: 'zomato', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Tell me about a time you had to optimise a system under pressure (peak load, Black Friday equivalent). What specific changes did you make and what was the measurable impact?',
    verifyCount: 5, upvotes: 42, daysAgo: 5, asked: 26 },
  { id: 'q163', company: 'zomato', role: 'SDE1', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'How does Zomato calculate a restaurant\'s "delivery fee"? The fee depends on distance, demand, time of day, and partner availability. Implement a pricing function given these inputs and discuss fairness trade-offs.',
    verifyCount: 5, upvotes: 43, daysAgo: 4, asked: 27, tech: ['Python', 'Java'] },
  { id: 'q164', company: 'zomato', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Zomato Pro (subscription). Members get free delivery, discounts, and priority support. Cover: subscription lifecycle, prorated upgrades/downgrades, cohort-based analytics to measure retention, and how you handle payment failures.',
    verifyCount: 6, upvotes: 50, daysAgo: 3, asked: 31, tech: ['Kafka', 'PostgreSQL', 'Redis'] },
  { id: 'q165', company: 'zomato', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'Explain Zomato\'s restaurant onboarding data pipeline. A new restaurant submits menus, photos, and operating hours. How do you validate, normalise, and make this data searchable within minutes of submission?',
    verifyCount: 5, upvotes: 44, daysAgo: 4, asked: 27, tech: ['Kafka', 'Elasticsearch', 'PostgreSQL'] },

  // ── Salesforce (additional) ───────────────────────────────────────────────
  { id: 'q166', company: 'salesforce', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Salesforce\'s governor limits enforcement system. Every Apex code execution is limited (SOQL queries, CPU time, heap). How do you track and enforce these limits in real time across millions of concurrent org executions?',
    verifyCount: 6, upvotes: 50, daysAgo: 4, asked: 31, tech: ['Java', 'Distributed Systems'] },
  { id: 'q167', company: 'salesforce', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'Explain Salesforce\'s metadata-driven architecture. Why does storing field definitions as data (instead of schema changes) enable the multi-tenant model? What are the trade-offs in query performance?',
    verifyCount: 5, upvotes: 45, daysAgo: 5, asked: 28, tech: ['PostgreSQL', 'Java'] },
  { id: 'q168', company: 'salesforce', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Salesforce emphasises trust as its #1 value. Describe a situation where you discovered a potential security vulnerability or data leak. What did you do and how did you balance urgency with transparency?',
    verifyCount: 5, upvotes: 40, daysAgo: 5, asked: 24 },
  { id: 'q169', company: 'salesforce', role: 'SDE1', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'What is Salesforce\'s SOQL and how does it differ from SQL? Explain relationship queries (parent-to-child and child-to-parent), the 100-SOQL governor limit, and how you optimise queries to avoid hitting it.',
    verifyCount: 6, upvotes: 48, daysAgo: 4, asked: 29, tech: ['Java'] },
  { id: 'q170', company: 'salesforce', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Salesforce Flow (visual process automation). Users define business workflows (if-then rules, send emails, create records) in a UI. How do you store, version, execute, and debug millions of active flows in a multi-tenant environment?',
    verifyCount: 7, upvotes: 54, daysAgo: 3, asked: 33, tech: ['Java', 'Distributed Systems'] },

  // ── Oracle (additional) ───────────────────────────────────────────────────
  { id: 'q171', company: 'oracle', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'Explain Oracle\'s redo log and undo log. How do they work together to provide crash recovery and read consistency? Walk through what happens when a transaction commits, then the server crashes, then restarts.',
    verifyCount: 6, upvotes: 51, daysAgo: 4, asked: 31, tech: ['PostgreSQL', 'MySQL', 'Java'] },
  { id: 'q172', company: 'oracle', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Oracle sells to enterprise clients with very long sales cycles. Describe a time you worked closely with a customer (internal or external) to solve a complex technical problem. How did you manage their expectations?',
    verifyCount: 4, upvotes: 35, daysAgo: 6, asked: 21 },
  { id: 'q173', company: 'oracle', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Oracle Cloud\'s IAM (Identity and Access Management) system. Thousands of customers, each with their own users, groups, and policies. How do you evaluate a permission check in under 10ms for every API call?',
    verifyCount: 7, upvotes: 56, daysAgo: 3, asked: 34, tech: ['Distributed Systems', 'Redis', 'Java'] },
  { id: 'q174', company: 'oracle', role: 'SDE1', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'Write a SQL query to find the Nth highest salary from an Employee table without using LIMIT/TOP. Then solve it with a window function (DENSE_RANK) and explain which is more portable across Oracle, PostgreSQL, and MySQL.',
    verifyCount: 8, upvotes: 63, daysAgo: 2, asked: 42, tech: ['PostgreSQL', 'MySQL'] },
  { id: 'q175', company: 'oracle', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'Explain Oracle RAC (Real Application Clusters). How do multiple nodes access the same database storage? What is the Cache Fusion protocol? When would you choose RAC over a primary-replica setup?',
    verifyCount: 5, upvotes: 44, daysAgo: 5, asked: 27, tech: ['Java', 'Distributed Systems'] },

  // ── Adobe (additional) ────────────────────────────────────────────────────
  { id: 'q176', company: 'adobe', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Adobe Experience Cloud\'s customer data platform. Unify customer profiles from website visits, email clicks, and CRM data across devices and sessions. Cover identity resolution (same person on mobile and desktop), real-time segment computation, and privacy (GDPR right-to-erasure).',
    verifyCount: 7, upvotes: 56, daysAgo: 3, asked: 35, tech: ['Kafka', 'Elasticsearch', 'Distributed Systems'] },
  { id: 'q177', company: 'adobe', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Adobe moved from perpetual licenses to Creative Cloud subscriptions. Describe a time you were part of a major product pivot or architecture migration. How did you manage the technical debt and user impact?',
    verifyCount: 5, upvotes: 41, daysAgo: 5, asked: 25 },
  { id: 'q178', company: 'adobe', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'Explain how font rendering works at the operating system level. How does Adobe handle vector-to-raster conversion (hinting, anti-aliasing) for different DPI screens? Why do fonts look different on Windows vs macOS?',
    verifyCount: 4, upvotes: 38, daysAgo: 6, asked: 22, tech: ['C++', 'JavaScript'] },
  { id: 'q179', company: 'adobe', role: 'SDE1', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'Implement a basic version of Adobe Lightroom\'s non-destructive editing model. All edits (brightness, contrast, crop) are stored as a list of operations, not applied to the original image. Explain the data structure and how you apply/undo operations.',
    verifyCount: 6, upvotes: 49, daysAgo: 4, asked: 30, tech: ['C++', 'Python', 'Java'] },
  { id: 'q180', company: 'adobe', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Adobe Sign (e-signature platform). A contract is sent to 5 signatories who must sign in a specific order. Cover: document integrity (hash verification), audit trail, legal compliance (e-SIGN Act), and what happens if a signatory refuses.',
    verifyCount: 7, upvotes: 54, daysAgo: 3, asked: 33, tech: ['AWS', 'PostgreSQL', 'Kafka'] },

  // ── LinkedIn (additional) ─────────────────────────────────────────────────
  { id: 'q181', company: 'linkedin', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design LinkedIn\'s feed. Each user sees posts from their connections, pages they follow, and sponsored content. Posts must be ranked by relevance. Cover: fan-out-on-write vs fan-out-on-read, feed generation for users with 30k connections, and freshness.',
    verifyCount: 9, upvotes: 67, daysAgo: 2, asked: 44, tech: ['Kafka', 'Redis', 'Distributed Systems'] },
  { id: 'q182', company: 'linkedin', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'LinkedIn is a professional network. Describe a project where you had to balance user privacy with platform analytics needs. What principles guided your decisions?',
    verifyCount: 5, upvotes: 40, daysAgo: 5, asked: 24 },
  { id: 'q183', company: 'linkedin', role: 'SDE1', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'How does LinkedIn\'s "Who viewed your profile" feature work? What data is stored, how long is it retained, and how do you provide the feature to free users (last 5 viewers) vs Premium (full list) without exposing premium-only data?',
    verifyCount: 6, upvotes: 50, daysAgo: 4, asked: 31, tech: ['Java', 'Redis'] },
  { id: 'q184', company: 'linkedin', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'LinkedIn uses Kafka extensively. Explain how you would design the Kafka topic structure for LinkedIn\'s activity events (profile view, connection request, message sent). Cover: topic naming, partitioning strategy, consumer group design, and exactly-once semantics.',
    verifyCount: 7, upvotes: 56, daysAgo: 3, asked: 35, tech: ['Kafka', 'Java', 'Distributed Systems'] },
  { id: 'q185', company: 'linkedin', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design LinkedIn\'s InMail spam filtering system. Premium users can message strangers. How do you detect and block spam campaigns while allowing legitimate cold outreach? Cover: sender reputation, content analysis, and feedback loops.',
    verifyCount: 6, upvotes: 48, daysAgo: 4, asked: 30, tech: ['Kafka', 'Distributed Systems', 'Elasticsearch'] },

  // ── Atlassian (additional) ────────────────────────────────────────────────
  { id: 'q186', company: 'atlassian', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Confluence\'s page version history. Every edit creates a new version. Users can view any historical version and restore it. Cover: delta vs full-snapshot storage, efficient diff computation, and how you handle concurrent edits creating a branch.',
    verifyCount: 7, upvotes: 56, daysAgo: 3, asked: 35, tech: ['PostgreSQL', 'AWS', 'Distributed Systems'] },
  { id: 'q187', company: 'atlassian', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Atlassian is fully distributed (no offices). Describe how you have successfully collaborated with engineers in different time zones. What tools and processes made it work and what broke down?',
    verifyCount: 6, upvotes: 45, daysAgo: 4, asked: 27 },
  { id: 'q188', company: 'atlassian', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Hard', round: 'Technical',
    body: 'Explain how Jira\'s JQL (Jira Query Language) parser works. Walk through lexing, parsing, and AST generation. How do you translate a JQL query like "assignee = currentUser() AND status = Done" into an efficient SQL query?',
    verifyCount: 5, upvotes: 44, daysAgo: 5, asked: 26, tech: ['Java', 'PostgreSQL'] },
  { id: 'q189', company: 'atlassian', role: 'SDE1', topic: 'arrays', topicPath: 'DSA / Arrays', difficulty: 'Medium', round: 'Technical',
    body: 'Given a list of Jira sprint start/end dates, find all sprints that overlap with a given date range. Implement an efficient solution using interval trees or sorted arrays with binary search.',
    verifyCount: 5, upvotes: 42, daysAgo: 5, asked: 25, tech: ['Java', 'Python'] },
  { id: 'q190', company: 'atlassian', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Hard', round: 'System Design',
    body: 'Design Bitbucket\'s code review system (Pull Requests). Multiple reviewers comment on specific lines of code. The PR is mergeable when all reviewers approve. Cover: diff computation, inline comments anchored to code lines, and what happens when new commits invalidate existing comments.',
    verifyCount: 8, upvotes: 60, daysAgo: 3, asked: 37, tech: ['Distributed Systems', 'PostgreSQL', 'AWS'] },

  // ── TCS (additional) ──────────────────────────────────────────────────────
  { id: 'q191', company: 'tcs', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Tell me about a time you worked in a large team and had to coordinate your work with multiple developers. How did you avoid merge conflicts and integration issues?',
    verifyCount: 6, upvotes: 47, daysAgo: 4, asked: 28 },
  { id: 'q192', company: 'tcs', role: 'SDE1', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'Explain the difference between ArrayList and LinkedList in Java. For a TCS banking project, you need to insert records at the front of a list frequently. Which would you choose and why?',
    verifyCount: 7, upvotes: 55, daysAgo: 3, asked: 34, tech: ['Java'] },
  { id: 'q193', company: 'tcs', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'Explain Spring Boot auto-configuration. How does @SpringBootApplication work under the hood? What is the difference between @Component, @Service, @Repository, and @Controller in Spring?',
    verifyCount: 8, upvotes: 61, daysAgo: 2, asked: 39, tech: ['Java', 'Spring Boot'] },
  { id: 'q194', company: 'tcs', role: 'SDE2', topic: 'system-design', topicPath: 'System Design', difficulty: 'Medium', round: 'System Design',
    body: 'Design a library management system with online book reservation. Students can search, reserve, and borrow books. Librarians can manage inventory. Cover the database schema, REST APIs, and how you handle concurrent reservations of the last copy.',
    verifyCount: 7, upvotes: 54, daysAgo: 3, asked: 33, tech: ['Java', 'Spring Boot', 'MySQL'] },
  { id: 'q195', company: 'tcs', role: 'SDE1', topic: 'arrays', topicPath: 'DSA / Arrays', difficulty: 'Medium', round: 'Technical',
    body: 'Write a Java program to rotate a matrix 90 degrees clockwise in-place. Explain the transpose-then-reverse approach and why it is O(n2) time with O(1) extra space.',
    verifyCount: 6, upvotes: 49, daysAgo: 4, asked: 30, tech: ['Java'] },

  // ── Infosys (additional) ──────────────────────────────────────────────────
  { id: 'q196', company: 'infosys', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'What are design patterns? Explain Singleton, Factory, and Observer patterns with Java code examples. In which Spring Boot components are these patterns used internally?',
    verifyCount: 8, upvotes: 62, daysAgo: 2, asked: 39, tech: ['Java', 'Spring Boot'] },
  { id: 'q197', company: 'infosys', role: 'SDE1', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'What is the difference between checked and unchecked exceptions in Java? When should you use each? Explain the exception hierarchy and best practices for custom exceptions in a Spring Boot REST API.',
    verifyCount: 7, upvotes: 55, daysAgo: 3, asked: 34, tech: ['Java', 'Spring Boot'] },
  { id: 'q198', company: 'infosys', role: 'SDE2', topic: 'behavioral', topicPath: 'Behavioral', difficulty: 'Medium', round: 'HR',
    body: 'Infosys works with large enterprise clients. Describe a time you had to explain a complex technical decision to a non-technical stakeholder. How did you frame it and what was the outcome?',
    verifyCount: 6, upvotes: 46, daysAgo: 4, asked: 27 },
  { id: 'q199', company: 'infosys', role: 'SDE2', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'Explain REST API best practices. What makes an API RESTful? Cover: proper use of HTTP verbs, status codes, versioning strategies (/v1/users vs Accept header), pagination (cursor vs offset), and HATEOAS.',
    verifyCount: 8, upvotes: 60, daysAgo: 2, asked: 38, tech: ['Java', 'Spring Boot', 'REST'] },
  { id: 'q200', company: 'infosys', role: 'SDE1', topic: 'domain', topicPath: 'Domain', difficulty: 'Easy', round: 'Screening',
    body: 'What is multithreading in Java? Explain synchronised keyword, wait/notify, and the difference between Thread and Runnable. Write a simple producer-consumer implementation using BlockingQueue.',
    verifyCount: 9, upvotes: 64, daysAgo: 1, asked: 43, tech: ['Java'] },

  // ── Capgemini (additional) ────────────────────────────────────────────────
  { id: 'q201', company: 'capgemini', role: 'Tester', topic: 'testing', topicPath: 'Testing', difficulty: 'Medium', round: 'Technical',
    body: 'What is the Page Object Model (POM) design pattern in Selenium? Why is it used? Show the structure of a POM class for a login page and explain how it improves test maintainability.',
    verifyCount: 7, upvotes: 55, daysAgo: 3, asked: 34, tech: ['Selenium', 'Java'] },
  { id: 'q202', company: 'capgemini', role: 'Tester', topic: 'testing', topicPath: 'Testing', difficulty: 'Medium', round: 'Technical',
    body: 'Explain the difference between Playwright\'s page.fill(), page.type(), and page.locator().pressSequentially(). When would you use each? How does Playwright handle Angular or React forms that rely on input events?',
    verifyCount: 5, upvotes: 44, daysAgo: 4, asked: 27, tech: ['Playwright', 'TypeScript'] },
  { id: 'q203', company: 'capgemini', role: 'Tester', topic: 'api-testing', topicPath: 'API Testing', difficulty: 'Medium', round: 'Technical',
    body: 'How do you test a REST API that requires OAuth 2.0 authentication? Walk through obtaining a token (client credentials flow), storing it, using it in subsequent requests, and handling token expiry in your automation framework.',
    verifyCount: 6, upvotes: 50, daysAgo: 3, asked: 31, tech: ['Playwright', 'Postman', 'REST'] },
  { id: 'q204', company: 'capgemini', role: 'Developer', topic: 'domain', topicPath: 'Domain', difficulty: 'Medium', round: 'Technical',
    body: 'Explain async/await in JavaScript. How does it differ from Promise chaining? Write a function that fetches data from three APIs in parallel (Promise.all) and one after another (sequential await). When would you choose each?',
    verifyCount: 6, upvotes: 51, daysAgo: 3, asked: 32, tech: ['JavaScript', 'TypeScript'] },
  { id: 'q205', company: 'capgemini', role: 'Tester', topic: 'testing', topicPath: 'Testing', difficulty: 'Medium', round: 'Technical',
    body: 'What is test reporting in automation? How do you generate Allure reports in a Playwright/TestNG framework? What information should a good test report contain and how do you integrate it with your CI/CD pipeline?',
    verifyCount: 5, upvotes: 43, daysAgo: 4, asked: 26, tech: ['Playwright', 'Java', 'Jenkins'] },
  { id: 'q206', company: 'capgemini', role: 'Tester', topic: 'testing', topicPath: 'Testing', difficulty: 'Medium', round: 'Technical',
    body: 'What is cross-browser testing? How do you run the same Playwright test suite on Chrome, Firefox, and WebKit simultaneously? How do you handle browser-specific issues in your automation code?',
    verifyCount: 4, upvotes: 38, daysAgo: 5, asked: 22, tech: ['Playwright', 'TypeScript', 'JavaScript'] },
];

export const COMPANY_BLUEPRINTS = {
  amazon: {
    rounds: ['Online Assessment', 'Phone Screen', 'Loop 1: Coding', 'Loop 2: System Design', 'Loop 3: Bar Raiser', 'Loop 4: Behavioral (LP)'],
    questionTypes: ['Leadership Principles', 'Distributed Systems', 'OOD/LLD', 'Arrays & Trees', 'Behavioral STAR'],
    heatmap: [
      { topic: 'Behavioral (LP)', count: 28 },
      { topic: 'System Design', count: 22 },
      { topic: 'Arrays', count: 18 },
      { topic: 'Trees', count: 14 },
      { topic: 'Graphs', count: 9 },
      { topic: 'OOD', count: 12 },
    ],
  },
  google: {
    rounds: ['Phone Screen', 'Onsite Coding 1', 'Onsite Coding 2', 'Onsite System Design', 'Googleyness & Leadership'],
    questionTypes: ['Algorithms (deep)', 'System Design', 'Open-ended problem solving'],
    heatmap: [
      { topic: 'Graphs', count: 24 },
      { topic: 'Trees', count: 21 },
      { topic: 'DP', count: 19 },
      { topic: 'System Design', count: 16 },
      { topic: 'Arrays', count: 12 },
      { topic: 'Behavioral', count: 8 },
    ],
  },
  microsoft: {
    rounds: ['Online Assessment', 'Phone Screen', 'Onsite Coding', 'Onsite System Design', 'AA (As-Appropriate)'],
    questionTypes: ['Trees & Graphs', 'System Design', 'OOD'],
    heatmap: [
      { topic: 'Trees', count: 19 },
      { topic: 'System Design', count: 17 },
      { topic: 'Arrays', count: 15 },
      { topic: 'OOD', count: 13 },
      { topic: 'Behavioral', count: 10 },
      { topic: 'Graphs', count: 7 },
    ],
  },
  flipkart: {
    rounds: ['Machine Coding', 'DSA Round', 'System Design / HLD', 'LLD / OOD', 'Hiring Manager'],
    questionTypes: ['Machine Coding', 'HLD', 'LLD', 'DSA'],
    heatmap: [
      { topic: 'Machine Coding', count: 26 },
      { topic: 'HLD', count: 21 },
      { topic: 'LLD', count: 18 },
      { topic: 'DSA', count: 15 },
      { topic: 'Behavioral', count: 6 },
    ],
  },
  swiggy: {
    rounds: ['DSA', 'Machine Coding', 'System Design', 'Hiring Manager'],
    questionTypes: ['DSA', 'Machine Coding', 'HLD'],
    heatmap: [
      { topic: 'Machine Coding', count: 18 },
      { topic: 'HLD', count: 14 },
      { topic: 'DSA', count: 12 },
      { topic: 'Behavioral', count: 5 },
    ],
  },
};

// SRS cards
export const SRS_CARDS = [
  { id: 's1', kind: 'coding', topic: 'Arrays', company: 'amazon',
    front: 'Explain Kadane\'s algorithm and its invariant.',
    back: 'Maintain a running max-sum ending at index i. Reset to current element when prefix sum becomes negative. O(n) time, O(1) space. Invariant: best_ending_here is the optimal subarray sum that includes element i.' },
  { id: 's2', kind: 'concept', topic: 'System Design', company: 'amazon',
    front: 'Why is consistent hashing preferred over modulo hashing for distributed caches?',
    back: 'Consistent hashing minimizes key remapping when nodes are added/removed (only K/N keys move vs all K keys). Critical for cache warmup and avoiding thundering herd on backends.' },
  { id: 's3', kind: 'star', topic: 'Behavioral', company: 'google',
    front: 'STAR: Tell me about a time you missed a deadline.',
    back: 'S: Q3 migration. T: Lead the cutover. A: Identified scope creep, negotiated phased rollout, communicated risk upfront. R: Shipped phase 1 on time; full migration 2 weeks later with zero downtime.' },
  { id: 's4', kind: 'coding', topic: 'Trees', company: 'google',
    front: 'How do you compute the lowest common ancestor of two nodes in a BST in O(h)?',
    back: 'Walk from the root: if both values < node, go left; if both > node, go right; otherwise current node is the LCA. O(h) time, O(1) space iterative.' },
  { id: 's5', kind: 'concept', topic: 'Graphs', company: 'microsoft',
    front: 'When would you use Bellman-Ford over Dijkstra?',
    back: 'When edges can have negative weights. Bellman-Ford handles negative edges and detects negative cycles in O(V*E). Dijkstra fails with negative edges because the greedy assumption breaks.' },
  { id: 's6', kind: 'coding', topic: 'System Design', company: 'flipkart',
    front: 'How would you design idempotent payment APIs?',
    back: 'Use idempotency keys: client generates a UUID per request, server stores response keyed by UUID for N hours. Duplicates return cached response. Combine with DB-level unique constraints on (idempotency_key, account).' },
  { id: 's7', kind: 'star', topic: 'Behavioral', company: 'amazon',
    front: 'STAR: Tell me about a time you disagreed with your manager.',
    back: 'S: Manager wanted to ship without load tests. T: I owned the launch risk. A: Presented data on similar prior incidents, proposed a 2-day test window. R: Caught a connection-pool leak that would have failed at 30% rollout.' },
  { id: 's8', kind: 'concept', topic: 'Arrays', company: 'microsoft',
    front: 'Two pointers vs sliding window: when do you use each?',
    back: 'Two pointers: sorted array, looking for pairs/triplets. Sliding window: contiguous subarrays/substrings with a constraint (sum, distinct chars). Sliding window expands then contracts based on the constraint.' },
];

// XP & dashboard data
export const XP_EVENTS = [
  { id: 'e1', source: 'review', amount: 120, label: 'Reviewed 12 cards', ago: '2h ago' },
  { id: 'e2', source: 'submission', amount: 80, label: 'Graded answer Â· Amazon q', ago: '5h ago' },
  { id: 'e3', source: 'review', amount: 60, label: 'Reviewed 6 cards', ago: 'yesterday' },
  { id: 'e4', source: 'contribution', amount: 40, label: 'Submitted question Â· Google', ago: '2d ago' },
  { id: 'e5', source: 'submission', amount: 100, label: 'Graded answer Â· System Design', ago: '3d ago' },
];

export const XP_BREAKDOWN = [
  { source: 'Review', value: 1840 },
  { source: 'Submission', value: 920 },
  { source: 'Contribution', value: 480 },
];

export const TOPIC_MASTERY = [
  { topic: 'Arrays', level: 4 },
  { topic: 'Trees', level: 3 },
  { topic: 'Graphs', level: 2 },
  { topic: 'System Design', level: 3 },
  { topic: 'Behavioral', level: 4 },
  { topic: 'LLD/OOD', level: 2 },
];

// 8 weeks of contribution data (56 days). Day 0 = oldest.
export const HEATMAP_DATA = (() => {
  const arr = [];
  // deterministic pseudo-random for stability
  let seed = 7;
  const rnd = () => {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
  for (let i = 0; i < 56; i++) {
    const r = rnd();
    let v = 0;
    if (r > 0.85) v = 4;
    else if (r > 0.65) v = 3;
    else if (r > 0.40) v = 2;
    else if (r > 0.20) v = 1;
    arr.push(v);
  }
  // last 7 days higher activity to show current streak
  for (let i = 49; i < 56; i++) arr[i] = Math.max(arr[i], 2);
  return arr;
})();

// JD analyzer mock outputs
export const JD_MOCK_RESULT = {
  extractedSkills: [
    { name: 'Distributed Systems', mastery: 55 },
    { name: 'Java', mastery: 72 },
    { name: 'System Design', mastery: 48 },
    { name: 'LLD / OOD', mastery: 40 },
    { name: 'Kafka', mastery: 25 },
    { name: 'AWS', mastery: 60 },
    { name: 'Microservices', mastery: 58 },
    { name: 'SQL', mastery: 78 },
  ],
  readiness: 61,
};

// Generate a 14-day plan with 2-3 topics per day, pulling question ids from QUESTIONS
export const STUDY_PLAN = (() => {
  const topicPool = [
    ['Arrays', 'Trees'],
    ['System Design', 'LLD'],
    ['Graphs', 'DP'],
    ['Behavioral (LP)', 'Arrays'],
    ['System Design', 'Kafka'],
    ['LLD', 'Trees'],
    ['Mock Interview'],
    ['Arrays', 'Graphs', 'Trees'],
    ['System Design', 'Microservices'],
    ['Behavioral (STAR)', 'LLD'],
    ['Distributed Systems', 'Kafka'],
    ['Mock Interview', 'Trees'],
    ['Review Weak Topics'],
    ['Final Mock + Behavioral'],
  ];
  return topicPool.map((topics, i) => {
    const dayQs = QUESTIONS.slice((i * 2) % QUESTIONS.length, (i * 2) % QUESTIONS.length + 3);
    return { day: i + 1, topics, questions: dayQs.map(q => q.id) };
  });
})();

