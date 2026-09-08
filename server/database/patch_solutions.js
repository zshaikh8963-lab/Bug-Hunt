import db from './db.js';

console.log('Patching questions with solution_code and validation_rules...');

const patches = [
    // --- ROUND 2 ---
    {
        title: 'Binary Search Infinite Loop',
        solution_code: `def binary_search(arr, target):
    left, right = 0, len(arr) - 1
    while left <= right:
        mid = (left + right) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            left = mid + 1
        else:
            right = mid - 1
    return -1`,
        validation_rules: JSON.stringify({
            required_patterns: ['left = mid + 1', 'right = mid - 1'],
            forbidden_patterns: ['left = mid\n', 'right = mid\n', 'left = mid;', 'right = mid;'],
            hint_on_missing: 'Remember to advance pointers past mid: left = mid + 1 and right = mid - 1 to prevent infinite loop.'
        })
    },
    {
        title: 'Off-By-One Buffer Overflow',
        solution_code: `void safe_copy(char* dest, const char* src, size_t dest_size) {
    size_t i;
    for (i = 0; i < dest_size - 1 && src[i] != '\\0'; i++) {
        dest[i] = src[i];
    }
    dest[i] = '\\0';
}`,
        validation_rules: JSON.stringify({
            required_any: [
                'regex:i\\s*<\\s*dest_size\\s*-\\s*1',
                'regex:i\\s*<=\\s*dest_size\\s*-\\s*2',
                'regex:dest_size\\s*-\\s*1\\s*>\\s*i'
            ],
            forbidden_patterns: ['regex:i\\s*<=\\s*dest_size\\b(?!\\s*-\\s*1)'],
            hint_on_missing: 'The loop condition must be i < dest_size - 1 to leave room for the terminating null byte.'
        })
    },
    {
        title: 'Promise Error Swallowing',
        solution_code: `async function fetchUserData(userId) {
    try {
        const response = await fetch(\`/api/users/\${userId}\`);
        if (!response.ok) {
            throw new Error("HTTP error " + response.status);
        }
        return await response.json();
    } catch (err) {
        console.error("Error logged:", err);
        throw err;
    }
}`,
        validation_rules: JSON.stringify({
            required_any: ['throw err', 'throw error', 'return Promise.reject'],
            forbidden_patterns: ['// Silent failure: caller receives undefined!'],
            hint_on_missing: 'The catch block must rethrow the caught error using "throw err;" so caller promises reject.'
        })
    },
    {
        title: 'Thread Safety in Singleton',
        solution_code: `public class DatabaseManager {
    private static volatile DatabaseManager instance;
    private DatabaseManager() {}

    public static DatabaseManager getInstance() {
        if (instance == null) {
            synchronized (DatabaseManager.class) {
                if (instance == null) {
                    instance = new DatabaseManager();
                }
            }
        }
        return instance;
    }
}`,
        validation_rules: JSON.stringify({
            required_patterns: ['volatile', 'synchronized'],
            hint_on_missing: 'Use volatile on the instance variable and a synchronized block with double-check inside getInstance().'
        })
    },
    {
        title: 'Dictionary Iteration Mutation',
        solution_code: `scores = {"Alice": 95, "Bob": 42, "Charlie": 38, "Diana": 88}

for student, score in list(scores.items()):
    if score < 50:
        del scores[student]`,
        validation_rules: JSON.stringify({
            required_any: [
                'list(scores.items())',
                'list(scores.keys())',
                'list(scores)',
                'scores.copy().items()',
                '{k: v for',
                '[k for k'
            ],
            hint_on_missing: 'Iterate over a copy using list(scores.items()) or a comprehension to avoid mutating the dictionary while iterating.'
        })
    },
    {
        title: 'Memory Leak in Linked List Deletion',
        solution_code: `struct Node {
    int val;
    Node* next;
};

void clearList(Node* head) {
    Node* curr = head;
    while (curr != nullptr) {
        Node* next = curr->next;
        delete curr;
        curr = next;
    }
}`,
        validation_rules: JSON.stringify({
            required_any: [
                'Node* next = curr->next',
                'auto next = curr->next',
                'Node *next = curr->next',
                'Node* temp = curr'
            ],
            forbidden_patterns: [
                'regex:delete\\s+curr;\\s*curr\\s*=\\s*curr->next'
            ],
            hint_on_missing: 'Save curr->next into a temporary pointer before calling delete curr to avoid use-after-free.'
        })
    },
    {
        title: 'Vulnerable Dynamic SQL',
        solution_code: `// Secure parameterized query:
const query = "SELECT * FROM users WHERE email = ? AND password = ?";
db.query(query, [req.body.email, req.body.password]);`,
        validation_rules: JSON.stringify({
            required_patterns: ['?', 'db.query'],
            forbidden_patterns: ['+ req.body.email', 'req.body.email +'],
            hint_on_missing: 'Use parameterized SQL with ? placeholders instead of string concatenation.'
        })
    },
    {
        title: 'Flexbox Centering Mishap',
        solution_code: `.container {
    display: flex;
    height: 100vh;
    justify-content: center;
    align-items: center;
}`,
        validation_rules: JSON.stringify({
            required_patterns: ['justify-content: center', 'align-items: center'],
            hint_on_missing: 'Add justify-content: center; and align-items: center; to center items on both axes.'
        })
    },
    {
        title: 'Deep Clone Reference Contamination',
        solution_code: `const userSession = {
    user: { id: 101, username: "admin" },
    preferences: { theme: "dark", notifications: true }
};

const sessionCopy = JSON.parse(JSON.stringify(userSession));
sessionCopy.user.username = "guest";`,
        validation_rules: JSON.stringify({
            required_any: [
                'JSON.parse(JSON.stringify(userSession))',
                'structuredClone(userSession)',
                'structuredClone'
            ],
            forbidden_patterns: ['{ ...userSession }'],
            hint_on_missing: 'Use JSON.parse(JSON.stringify(userSession)) or structuredClone(userSession) for a deep clone.'
        })
    },
    {
        title: 'Missing Break in Switch Statement',
        solution_code: `switch(statusCode) {
    case 200:
        handleSuccess();
        break;
    case 404:
        handleNotFound();
        break;
    case 500:
        handleServerError();
        break;
    default:
        handleUnknown();
        break;
}`,
        validation_rules: JSON.stringify({
            required_patterns: ['break;'],
            hint_on_missing: 'Add break; statements at the end of each case block to prevent fall-through.'
        })
    },
    {
        title: 'Unchecked Null Pointer in equals()',
        solution_code: `public boolean isAdmin(String role) {
    return "ADMIN".equals(role);
}`,
        validation_rules: JSON.stringify({
            required_any: [
                '"ADMIN".equals(role)',
                '"ADMIN".equalsIgnoreCase(role)',
                'role != null && role.equals("ADMIN")'
            ],
            hint_on_missing: 'Call .equals() on the non-null string literal "ADMIN".equals(role) or check role != null first.'
        })
    },
    {
        title: 'Missing Base Case in Recursion',
        solution_code: `def factorial(n):
    if n <= 1:
        return 1
    return n * factorial(n - 1)`,
        validation_rules: JSON.stringify({
            required_any: [
                'if n <= 1: return 1',
                'if n <= 1:\n        return 1',
                'if n == 0 or n == 1: return 1',
                'if n < 2: return 1',
                'if (n <= 1): return 1'
            ],
            hint_on_missing: 'Add a base condition if n <= 1: return 1 to stop the recursion.'
        })
    },
    {
        title: 'Generator Exhaustion Bug',
        solution_code: `def get_numbers():
    yield 1
    yield 2
    yield 3

nums = list(get_numbers())
sum1 = sum(nums)
sum2 = sum(nums)`,
        validation_rules: JSON.stringify({
            required_patterns: ['list(get_numbers())'],
            hint_on_missing: 'Convert the generator to a persistent list using list(get_numbers()) before consuming it.'
        })
    },
    {
        title: 'Asynchronous Array forEach Trap',
        solution_code: `async function processAll(items) {
    for (const item of items) {
        await processItem(item);
    }
}`,
        validation_rules: JSON.stringify({
            required_any: [
                'for (const item of items)',
                'for (let item of items)',
                'for(const item of items)',
                'Promise.all(items.map('
            ],
            forbidden_patterns: ['items.forEach(async'],
            hint_on_missing: 'Replace items.forEach with a for...of loop or Promise.all(items.map(...)) to properly await asynchronous operations.'
        })
    },

    // --- ROUND 3 (Bug Hunt - Multi Bug) ---
    {
        title: 'Custom Dynamic Array (Vector) Class',
        solution_code: `class SimpleVector {
private:
    int* buffer;
    size_t capacity;
    size_t size;

public:
    SimpleVector(size_t cap = 4) : capacity(cap), size(0) {
        buffer = new int[capacity];
    }

    ~SimpleVector() {
        delete[] buffer;
    }

    void push_back(int val) {
        if (size == capacity) {
            capacity *= 2;
            int* new_buf = new int[capacity];
            for (size_t i = 0; i < size; i++) {
                new_buf[i] = buffer[i];
            }
            delete[] buffer;
            buffer = new_buf;
        }
        buffer[size] = val;
        size++;
    }

    int at(size_t idx) {
        if (idx >= size) {
            throw "Out of range";
        }
        return buffer[idx];
    }

    size_t get_size() const {
        return size;
    }
};`,
        validation_rules: JSON.stringify({
            required_patterns: [
                'delete[] buffer',
                'regex:i\\s*<\\s*size\\b',
                'regex:idx\\s*>=\\s*size',
                'return size;'
            ],
            forbidden_patterns: [
                'delete buffer;',
                'regex:i\\s*<=\\s*size\\b',
                'return capacity;'
            ],
            hint_on_missing: 'Fix all 4 bugs: 1) delete[] buffer; 2) i < size in push_back; 3) idx >= size in at(); 4) return size; in get_size().'
        })
    },
    {
        title: 'Banking Account Transaction Processor',
        solution_code: `class BankAccount:
    def __init__(self, account_id, balance=0):
        self.account_id = account_id
        self.balance = balance
        self.transaction_history = []

    def deposit(self, amount):
        if amount <= 0:
            return False
        self.balance += amount
        self.transaction_history.append(f"Deposit: {amount}")
        return True

    def withdraw(self, amount):
        if amount <= 0 or amount > self.balance:
            return False
        self.balance -= amount
        self.transaction_history.append(f"Withdrawal: {amount}")
        return True

    def transfer(self, target_account, amount):
        if target_account is None or amount <= 0:
            return False
        if not self.withdraw(amount):
            return False
        target_account.deposit(amount)
        return True`,
        validation_rules: JSON.stringify({
            required_patterns: [
                'amount > self.balance',
                'target_account is None'
            ],
            hint_on_missing: 'Prevent overdraft in withdraw() and verify target_account is not None before deducting funds.'
        })
    },
    {
        title: 'JWT Authentication Middleware',
        solution_code: `const jwt = require('jsonwebtoken');

function authMiddleware(req, res, next) {
    const authHeader = req.headers['authorization'];
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: "Missing Bearer token" });
    }

    const token = authHeader.split(' ')[1];
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        next();
    } catch (err) {
        return res.status(403).json({ error: "Invalid or expired token" });
    }
}`,
        validation_rules: JSON.stringify({
            required_patterns: [
                'startsWith',
                'jwt.verify',
                'return res.status'
            ],
            hint_on_missing: 'Check for "Bearer " prefix in Authorization header, verify token with jwt.verify, and ensure return res.status is called.'
        })
    },
    {
        title: 'Thread-Safe Fixed-Size Circular Queue',
        solution_code: `public class CircularQueue<T> {
    private Object[] elements;
    private int head = 0, tail = 0, count = 0;

    public CircularQueue(int capacity) {
        elements = new Object[capacity];
    }

    public synchronized void enqueue(T item) throws InterruptedException {
        while (count == elements.length) {
            wait();
        }
        elements[tail] = item;
        tail = (tail + 1) % elements.length;
        count++;
        notifyAll();
    }

    @SuppressWarnings("unchecked")
    public synchronized T dequeue() throws InterruptedException {
        while (count == 0) {
            wait();
        }
        T item = (T) elements[head];
        elements[head] = null;
        head = (head + 1) % elements.length;
        count--;
        notifyAll();
        return item;
    }
}`,
        validation_rules: JSON.stringify({
            required_patterns: [
                'notifyAll()',
                'elements[head] = null'
            ],
            forbidden_patterns: ['notify();'],
            hint_on_missing: 'Use notifyAll() instead of notify() and nullify elements[head] in dequeue() to avoid memory leak.'
        })
    },
    {
        title: 'Binary Search Tree Operations',
        solution_code: `typedef struct BSTNode {
    int key;
    struct BSTNode *left, *right;
} BSTNode;

BSTNode* insert(BSTNode* root, int key) {
    if (root == NULL) {
        BSTNode* node = (BSTNode*)malloc(sizeof(BSTNode));
        node->key = key;
        node->left = NULL;
        node->right = NULL;
        return node;
    }
    if (key < root->key) {
        root->left = insert(root->left, key);
    } else if (key > root->key) {
        root->right = insert(root->right, key);
    }
    return root;
}

bool search(BSTNode* root, int key) {
    if (root == NULL) return false;
    if (root->key == key) return true;
    if (key < root->key)
        return search(root->left, key);
    return search(root->right, key);
}`,
        validation_rules: JSON.stringify({
            required_patterns: [
                'node->left = NULL',
                'node->right = NULL',
                'root->right = insert(root->right',
                'return search(root->right'
            ],
            forbidden_patterns: [
                'root->left = insert(root->right'
            ],
            hint_on_missing: 'Initialize node->left and right to NULL, assign to root->right when key > root->key, and return the recursive search.'
        })
    },

    // --- ROUND 4 (Boss Bug) ---
    {
        title: '⚠️ BOSS BUG: Multi-Threaded Memory Pool Corrupter',
        solution_code: `#include <pthread.h>
#include <stdlib.h>
#include <stdbool.h>

typedef struct Block {
    struct Block* next;
    size_t size;
    bool is_free;
} Block;

static Block* free_list = NULL;
static pthread_mutex_t pool_lock = PTHREAD_MUTEX_INITIALIZER;

void* mem_alloc(size_t bytes) {
    pthread_mutex_lock(&pool_lock);
    
    Block* curr = free_list;
    while (curr) {
        if (curr->is_free && curr->size >= bytes) {
            curr->is_free = false;
            pthread_mutex_unlock(&pool_lock);
            return (void*)(curr + 1);
        }
        curr = curr->next;
    }
    
    Block* new_block = (Block*)malloc(sizeof(Block) + bytes);
    if (!new_block) {
        pthread_mutex_unlock(&pool_lock);
        return NULL;
    }
    new_block->size = bytes;
    new_block->is_free = false;
    new_block->next = free_list;
    free_list = new_block;
    
    pthread_mutex_unlock(&pool_lock);
    return (void*)(new_block + 1);
}

void mem_free(void* ptr) {
    if (!ptr) return;
    Block* block = (Block*)ptr - 1;
    pthread_mutex_lock(&pool_lock);
    if (block->is_free) {
        pthread_mutex_unlock(&pool_lock);
        return;
    }
    block->is_free = true;
    pthread_mutex_unlock(&pool_lock);
}`,
        validation_rules: JSON.stringify({
            required_patterns: [
                'pthread_mutex_unlock(&pool_lock);\n            return (void*)(curr + 1)',
                'if (block->is_free)'
            ],
            hint_on_missing: 'Unlock pool_lock before returning (curr + 1) in mem_alloc(), initialize mutex, and guard against double free.'
        })
    },
    {
        title: '⚠️ BOSS BUG: Asyncio Distributed Task Scheduler',
        solution_code: `import asyncio

queue = asyncio.Queue(maxsize=10)
results = []

async def worker(worker_id):
    while True:
        task = await queue.get()
        try:
            res = await asyncio.wait_for(task(), timeout=2.0)
            results.append(res)
        except asyncio.TimeoutError:
            print(f"Worker {worker_id} timed out on task")
        finally:
            queue.task_done()

async def make_task():
    await asyncio.sleep(0.1)
    return "done"

async def main():
    workers = [asyncio.create_task(worker(i)) for i in range(3)]
    
    for i in range(15):
        await queue.put(make_task)
        
    await queue.join()
    
    for w in workers:
        w.cancel()`,
        validation_rules: JSON.stringify({
            required_patterns: [
                'w.cancel()',
                'make_task'
            ],
            hint_on_missing: 'Define tasks as async coroutines rather than standard lambdas, and cancel background workers after queue.join().'
        })
    },
    {
        title: '⚠️ BOSS BUG: Custom LRU Cache Invalidation Crash',
        solution_code: `public class LRUCache {
    class Node {
        int key, value;
        Node prev, next;
        Node(int k, int v) { key = k; value = v; }
    }

    private final int capacity;
    private final Map<Integer, Node> map = new HashMap<>();
    private Node head, tail;

    public LRUCache(int capacity) {
        this.capacity = capacity;
        head = new Node(0, 0);
        tail = new Node(0, 0);
        head.next = tail;
        tail.prev = head;
    }

    public int get(int key) {
        if (!map.containsKey(key)) return -1;
        Node node = map.get(key);
        remove(node);
        addToHead(node);
        return node.value;
    }

    public void put(int key, int value) {
        if (map.containsKey(key)) {
            remove(map.get(key));
        } else if (map.size() >= capacity) {
            Node lru = tail.prev;
            map.remove(lru.key);
            remove(lru);
        }
        Node newNode = new Node(key, value);
        map.put(key, newNode);
        addToHead(newNode);
    }
}`,
        validation_rules: JSON.stringify({
            required_patterns: [
                'head.next = tail',
                'tail.prev'
            ],
            hint_on_missing: 'Initialize pseudo head/tail sentinels in constructor and evict tail.prev (LRU) instead of head.'
        })
    },
    {
        title: '⚠️ BOSS BUG: Distributed Leaky Token Bucket Rate Limiter',
        solution_code: `import time

class TokenBucket:
    def __init__(self, capacity, fill_rate):
        self.capacity = capacity
        self.fill_rate = fill_rate
        self.tokens = capacity
        self.last_update = time.time()

    def allow_request(self, tokens_needed=1):
        now = time.time()
        elapsed = now - self.last_update
        self.last_update = now
        
        self.tokens = min(self.capacity, self.tokens + elapsed * self.fill_rate)
        
        if self.tokens >= tokens_needed:
            self.tokens -= tokens_needed
            return True
            
        return False`,
        validation_rules: JSON.stringify({
            required_patterns: [
                'min(self.capacity',
                'self.last_update = now'
            ],
            hint_on_missing: 'Cap tokens at self.capacity using min(self.capacity, ...) and update self.last_update on each check.'
        })
    }
];

let updatedCount = 0;
const updateStmt = db.prepare(`
    UPDATE questions 
    SET solution_code = ?, validation_rules = ?
    WHERE title = ?
`);

for (const p of patches) {
    const res = updateStmt.run(p.solution_code, p.validation_rules, p.title);
    if (res.changes > 0) {
        updatedCount += res.changes;
        console.log(`✓ Patched: "${p.title}"`);
    } else {
        console.log(`- Not found by title: "${p.title}"`);
    }
}

console.log(`Done! Patched ${updatedCount} questions.`);
