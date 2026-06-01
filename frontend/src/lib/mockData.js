// All mock data for AskTaaza. Replace with Supabase queries later.

export const COMPANIES = [
  { id: 'amazon', name: 'Amazon', color: '#FF9900', initials: 'AM' },
  { id: 'google', name: 'Google', color: '#4285F4', initials: 'GO' },
  { id: 'microsoft', name: 'Microsoft', color: '#00A4EF', initials: 'MS' },
  { id: 'flipkart', name: 'Flipkart', color: '#2874F0', initials: 'FK' },
  { id: 'swiggy', name: 'Swiggy', color: '#FC8019', initials: 'SW' },
];

export const ROLES = ['SDE1', 'SDE2', 'Staff', 'DS', 'PM'];

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
];

export const DIFFICULTIES = ['Easy', 'Medium', 'Hard'];
export const ROUND_TYPES = ['Screening', 'Technical', 'System Design', 'HR'];

export const QUESTIONS = [
  {
    id: 'q1', company: 'amazon', role: 'SDE2', topic: 'arrays', topicPath: 'DSA / Arrays',
    difficulty: 'Medium', round: 'Technical',
    body: 'Given an array of integers and a target sum, return all unique triplets that sum to the target. Discuss time and space complexity. Then extend the problem to k-sum and analyze how recursion depth changes performance for large k.',
    verifyCount: 8, upvotes: 142, daysAgo: 3, asked: 47,
  },
  {
    id: 'q2', company: 'amazon', role: 'SDE2', topic: 'system-design', topicPath: 'System Design',
    difficulty: 'Hard', round: 'System Design',
    body: 'Design a distributed rate limiter that can handle 10M requests per second across multiple data centers. Discuss consistency tradeoffs, the choice between token bucket vs leaky bucket, and how you would handle clock skew across regions.',
    verifyCount: 12, upvotes: 287, daysAgo: 1, asked: 89,
  },
  {
    id: 'q3', company: 'google', role: 'SDE2', topic: 'trees', topicPath: 'DSA / Trees',
    difficulty: 'Medium', round: 'Technical',
    body: 'Given a binary tree, return the boundary of the tree in anti-clockwise direction starting from the root. The boundary consists of the left boundary, leaves, and the right boundary in reverse.',
    verifyCount: 5, upvotes: 96, daysAgo: 6, asked: 31,
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
