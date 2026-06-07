// All mock data for AskTaaza. Replace with Supabase queries later.

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

export const ROLES = ['SDE1', 'SDE2', 'Staff', 'DS', 'PM', 'Tester', 'DevOps', 'Developer'];

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
    verifyCount: 8, upvotes: 142, daysAgo: 3, asked: 47,
    tech: ['Java', 'Python', 'JavaScript'],
  },
  {
    id: 'q2', company: 'amazon', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design a distributed rate limiter that can handle 10M requests per second across multiple data centers. Discuss consistency tradeoffs, the choice between token bucket vs leaky bucket, and how you would handle clock skew across regions.',
    verifyCount: 12, upvotes: 287, daysAgo: 1, asked: 89,
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
    body: 'Given a matrix of 0s and 1s, find the largest rectangle containing only 1s and return its area. Walk through the histogram-based O(n*m) solution and discuss why the naive O(n²m²) approach is unacceptable at scale.',
    verifyCount: 7, upvotes: 113, daysAgo: 4, asked: 38,
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
    verifyCount: 11, upvotes: 198, daysAgo: 2, asked: 64,
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
    verifyCount: 5, upvotes: 102, daysAgo: 1, asked: 33,
    tech: ['System Design', 'Microservices', 'Java', 'Go'],
  },

  // ── Accenture · Selenium Developer · 0-2 yrs ──────────────────────────────
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

  // ── Deloitte · DevOps Engineer · 3-4 yrs ──────────────────────────────────
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
    body: 'Which Git branching strategy do you follow — GitFlow or trunk-based development — and why? Compare release cadence, merge complexity, hotfix handling, and suitability for CI/CD pipelines.',
    verifyCount: 4, upvotes: 62, daysAgo: 4, asked: 24,
    tech: ['GitHub Actions'],
  },

  // ── Wipro · Tester · Selenium · 3-4 yrs ───────────────────────────────────
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

  // ── Infosys · Java Developer · 3-5 yrs ────────────────────────────────────
  {
    id: 'q31', company: 'infosys', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'Explain the difference between JDK, JRE, and JVM. How are they related? Describe the JVM internals: class loader, bytecode verifier, interpreter, JIT compiler, garbage collector, and how they work together to run a Java program.',
    verifyCount: 8, upvotes: 112, daysAgo: 2, asked: 45,
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

  // ── TCS · Java Developer · 4-6 yrs ────────────────────────────────────────
  {
    id: 'q36', company: 'tcs', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'Explain the difference between HashMap and ConcurrentHashMap in Java. When would you use each? Describe segment locking in Java 7 vs the CAS-based approach in Java 8+, and why you should never use HashMap in a multi-threaded context.',
    verifyCount: 9, upvotes: 134, daysAgo: 1, asked: 52,
    tech: ['Java'],
  },
  {
    id: 'q37', company: 'tcs', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'How do you handle transactions in Spring Boot? Explain the @Transactional annotation, propagation levels (REQUIRED, REQUIRES_NEW, NESTED), isolation levels, and how Spring proxies intercept methods — including why self-invocation bypasses the proxy.',
    verifyCount: 7, upvotes: 108, daysAgo: 2, asked: 43,
    tech: ['Java', 'Spring Boot'],
  },
  {
    id: 'q38', company: 'tcs', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Medium', round: 'System Design',
    body: 'Design a REST API for an e-commerce cart system. Define the endpoints (add item, remove item, get cart, checkout), explain authentication with JWT, handle race conditions on inventory, and discuss idempotency for the checkout endpoint.',
    verifyCount: 8, upvotes: 121, daysAgo: 3, asked: 47,
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
    verifyCount: 10, upvotes: 145, daysAgo: 1, asked: 58,
    tech: ['MySQL', 'PostgreSQL'],
  },
  {
    id: 'q41', company: 'tcs', role: 'SDE2', topic: 'domain', topicPath: 'Domain',
    difficulty: 'Medium', round: 'Technical',
    body: 'What are the SOLID principles? Explain each with a real-world Java example. Then describe a scenario where rigidly following SOLID leads to over-engineering, and how you balance pragmatism with good design.',
    verifyCount: 6, upvotes: 93, daysAgo: 5, asked: 36,
    tech: ['Java', 'Spring Boot'],
  },

  // ── Capgemini · Playwright Tester · 4 yrs ─────────────────────────────────
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
    body: 'Explain the filter(), map(), and reduce() array methods in JavaScript with examples. Then show how you would use them together to process a list of test results — filtering failures, mapping to error messages, and reducing to a summary count.',
    verifyCount: 3, upvotes: 47, daysAgo: 6, asked: 17,
    tech: ['JavaScript', 'TypeScript', 'Playwright'],
  },
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
  { id: 'e2', source: 'submission', amount: 80, label: 'Graded answer · Amazon q', ago: '5h ago' },
  { id: 'e3', source: 'review', amount: 60, label: 'Reviewed 6 cards', ago: 'yesterday' },
  { id: 'e4', source: 'contribution', amount: 40, label: 'Submitted question · Google', ago: '2d ago' },
  { id: 'e5', source: 'submission', amount: 100, label: 'Graded answer · System Design', ago: '3d ago' },
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
