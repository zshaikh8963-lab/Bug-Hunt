/**
 * Round 3: Identify Bug & Correct Error (Python) Question Bank
 * Total: 30+ Python Debugging Challenges
 * Each challenge includes:
 *  - Problem statement, expected behavior, constraints
 *  - Initial buggy code (loaded in Monaco editor)
 *  - Faulty line number and bug type
 *  - Canonical working solution
 *  - Visible test cases (shown to team)
 *  - Hidden test cases (never exposed to frontend, used for server grading)
 */

export const r3PythonChallenges = [
  {
    challenge_code: 'PY-001',
    title: 'Palindrome String Cleaner',
    description: 'Write a program that takes a string, ignores all non-alphanumeric characters and case, and checks if it reads the same forward and backward. Print "TRUE" if it is a palindrome, or "FALSE" otherwise.',
    expected_behavior: 'Filters non-alphanumeric characters, converts to lowercase, and prints "TRUE" or "FALSE".',
    input_format: 'A single string on standard input.',
    output_format: '"TRUE" or "FALSE" on standard output.',
    constraints: '1 <= len(s) <= 1000',
    buggy_code: `import sys

def check_palindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    # Bug: Off-by-one slice does not reverse the string properly
    reversed_str = cleaned[0:-1]
    if cleaned == reversed_str:
        return "TRUE"
    return "FALSE"

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print(check_palindrome(line))`,
    canonical_solution: `import sys

def check_palindrome(s):
    cleaned = ''.join(c.lower() for c in s if c.isalnum())
    reversed_str = cleaned[::-1]
    if cleaned == reversed_str:
        return "TRUE"
    return "FALSE"

if __name__ == "__main__":
    line = sys.stdin.read().strip()
    print(check_palindrome(line))`,
    faulty_line: 6,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "A man, a plan, a canal: Panama", expected_output: "TRUE" },
      { input: "race a car", expected_output: "FALSE" }
    ],
    hidden_tests: [
      { input: "Was it a car or a cat I saw?", expected_output: "TRUE" },
      { input: "No 'x' in Nixon", expected_output: "TRUE" },
      { input: "Hello World", expected_output: "FALSE" }
    ]
  },
  {
    challenge_code: 'PY-002',
    title: 'Two Sum Target Finder',
    description: 'Given a list of comma-separated integers and a target integer on line 2, find the 0-based indices of the two numbers that add up to target. Print the indices separated by a space (smaller index first).',
    expected_behavior: 'Finds two indices whose values sum to the target and prints "i j".',
    input_format: 'Line 1: Comma-separated integers. Line 2: Integer target.',
    output_format: 'Two space-separated integers.',
    constraints: '2 <= len(nums) <= 10^4, exactly one solution exists.',
    buggy_code: `import sys

def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return f"{seen[complement]} {i}"
        # Bug: Stores index as value instead of number as key
        seen[i] = complement
    return ""

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    nums = [int(x.strip()) for x in lines[0].split(',') if x.strip()]
    target = int(lines[1].strip())
    print(two_sum(nums, target))`,
    canonical_solution: `import sys

def two_sum(nums, target):
    seen = {}
    for i, num in enumerate(nums):
        complement = target - num
        if complement in seen:
            return f"{seen[complement]} {i}"
        seen[num] = i
    return ""

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    nums = [int(x.strip()) for x in lines[0].split(',') if x.strip()]
    target = int(lines[1].strip())
    print(two_sum(nums, target))`,
    faulty_line: 10,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "2,7,11,15\n9", expected_output: "0 1" },
      { input: "3,2,4\n6", expected_output: "1 2" }
    ],
    hidden_tests: [
      { input: "3,3\n6", expected_output: "0 1" },
      { input: "1,5,8,12,19\n20", expected_output: "0 4" },
      { input: "-3,4,3,90\n0", expected_output: "0 2" }
    ]
  },
  {
    challenge_code: 'PY-003',
    title: 'Binary Search Implementation',
    description: 'Given a sorted comma-separated list of integers and a target integer on line 2, output the index of target using binary search, or -1 if target is not found.',
    expected_behavior: 'Returns the 0-based index of target or -1.',
    input_format: 'Line 1: Comma-separated sorted integers. Line 2: Integer target.',
    output_format: 'Integer index or -1.',
    constraints: '1 <= len(nums) <= 10^5, -10^4 <= target <= 10^4.',
    buggy_code: `import sys

def binary_search(nums, target):
    low = 0
    high = len(nums) - 1
    # Bug: Loop condition fails when low == high
    while low < high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    nums = [int(x.strip()) for x in lines[0].split(',') if x.strip()]
    target = int(lines[1].strip())
    print(binary_search(nums, target))`,
    canonical_solution: `import sys

def binary_search(nums, target):
    low = 0
    high = len(nums) - 1
    while low <= high:
        mid = (low + high) // 2
        if nums[mid] == target:
            return mid
        elif nums[mid] < target:
            low = mid + 1
        else:
            high = mid - 1
    return -1

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    nums = [int(x.strip()) for x in lines[0].split(',') if x.strip()]
    target = int(lines[1].strip())
    print(binary_search(nums, target))`,
    faulty_line: 6,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "-1,0,3,5,9,12\n9", expected_output: "4" },
      { input: "-1,0,3,5,9,12\n2", expected_output: "-1" }
    ],
    hidden_tests: [
      { input: "5\n5", expected_output: "0" },
      { input: "1,2,3,4,5\n1", expected_output: "0" },
      { input: "1,2,3,4,5\n5", expected_output: "4" }
    ]
  },
  {
    challenge_code: 'PY-004',
    title: 'Anamoly Frequency Counter',
    description: 'Find the element that appears an odd number of times in a comma-separated list of integers. Exactly one element has an odd frequency.',
    expected_behavior: 'Outputs the integer with an odd frequency count.',
    input_format: 'A comma-separated string of integers.',
    output_format: 'A single integer.',
    constraints: '1 <= len(nums) <= 10^5.',
    buggy_code: `import sys
from collections import defaultdict

def find_odd(nums):
    counts = defaultdict(int)
    for n in nums:
        counts[n] += 1
    for num, count in counts.items():
        # Bug: Checks for even count instead of odd
        if count % 2 == 0:
            return num
    return -1

if __name__ == "__main__":
    data = sys.stdin.read().strip()
    nums = [int(x.strip()) for x in data.split(',') if x.strip()]
    print(find_odd(nums))`,
    canonical_solution: `import sys
from collections import defaultdict

def find_odd(nums):
    counts = defaultdict(int)
    for n in nums:
        counts[n] += 1
    for num, count in counts.items():
        if count % 2 != 0:
            return num
    return -1

if __name__ == "__main__":
    data = sys.stdin.read().strip()
    nums = [int(x.strip()) for x in data.split(',') if x.strip()]
    print(find_odd(nums))`,
    faulty_line: 9,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "1,2,2,3,3,3,4,3,3,3,2,2,1", expected_output: "4" },
      { input: "20,1,-1,2,-2,3,3,5,5,1,2,4,20,4,-1,-2,5", expected_output: "5" }
    ],
    hidden_tests: [
      { input: "7", expected_output: "7" },
      { input: "1,1,2", expected_output: "2" },
      { input: "0,1,0", expected_output: "1" }
    ]
  },
  {
    challenge_code: 'PY-005',
    title: 'Valid Bracket Sequence Validator',
    description: 'Determine if a string consisting of "(", ")", "{", "}", "[", and "]" is valid. Brackets must close in correct order and type.',
    expected_behavior: 'Outputs "VALID" if all brackets are properly matched, otherwise "INVALID".',
    input_format: 'A single string of brackets.',
    output_format: '"VALID" or "INVALID".',
    constraints: '1 <= len(s) <= 10^4.',
    buggy_code: `import sys

def is_valid(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return "INVALID"
        else:
            stack.append(char)
    # Bug: Returns VALID regardless of whether stack is empty
    return "VALID"

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print(is_valid(s))`,
    canonical_solution: `import sys

def is_valid(s):
    stack = []
    mapping = {")": "(", "}": "{", "]": "["}
    for char in s:
        if char in mapping:
            top = stack.pop() if stack else '#'
            if mapping[char] != top:
                return "INVALID"
        else:
            stack.append(char)
    return "VALID" if not stack else "INVALID"

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print(is_valid(s))`,
    faulty_line: 13,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "()[]{}", expected_output: "VALID" },
      { input: "(]", expected_output: "INVALID" }
    ],
    hidden_tests: [
      { input: "([)]", expected_output: "INVALID" },
      { input: "{[]}", expected_output: "VALID" },
      { input: "((", expected_output: "INVALID" }
    ]
  },
  {
    challenge_code: 'PY-006',
    title: 'Merge Sorted Arrays',
    description: 'Merge two sorted comma-separated integer arrays into a single sorted array. Output the merged integers separated by commas.',
    expected_behavior: 'Outputs comma-separated sorted integers.',
    input_format: 'Line 1: First array. Line 2: Second array.',
    output_format: 'Comma-separated merged integers.',
    constraints: '0 <= len(arr) <= 10^4.',
    buggy_code: `import sys

def merge_sorted(a, b):
    i = 0
    j = 0
    res = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            res.append(a[i])
            i += 1
        else:
            res.append(b[j])
            # Bug: Increments i instead of j
            i += 1
    res.extend(a[i:])
    res.extend(b[j:])
    return ','.join(str(x) for x in res)

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    a = [int(x.strip()) for x in lines[0].split(',') if x.strip()] if len(lines) > 0 and lines[0].strip() else []
    b = [int(x.strip()) for x in lines[1].split(',') if x.strip()] if len(lines) > 1 and lines[1].strip() else []
    print(merge_sorted(a, b))`,
    canonical_solution: `import sys

def merge_sorted(a, b):
    i = 0
    j = 0
    res = []
    while i < len(a) and j < len(b):
        if a[i] <= b[j]:
            res.append(a[i])
            i += 1
        else:
            res.append(b[j])
            j += 1
    res.extend(a[i:])
    res.extend(b[j:])
    return ','.join(str(x) for x in res)

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    a = [int(x.strip()) for x in lines[0].split(',') if x.strip()] if len(lines) > 0 and lines[0].strip() else []
    b = [int(x.strip()) for x in lines[1].split(',') if x.strip()] if len(lines) > 1 and lines[1].strip() else []
    print(merge_sorted(a, b))`,
    faulty_line: 14,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "1,3,5\n2,4,6", expected_output: "1,2,3,4,5,6" },
      { input: "1,2,3\n4,5,6", expected_output: "1,2,3,4,5,6" }
    ],
    hidden_tests: [
      { input: "10\n1,5,20", expected_output: "1,5,10,20" },
      { input: "2,2\n2,2", expected_output: "2,2,2,2" },
      { input: "-5,0\n-3,4", expected_output: "-5,-3,0,4" }
    ]
  },
  {
    challenge_code: 'PY-007',
    title: 'Longest Common Prefix Finder',
    description: 'Find the longest common prefix string amongst a comma-separated list of strings. If there is no common prefix, print an empty string "".',
    expected_behavior: 'Prints the longest common prefix.',
    input_format: 'A comma-separated string of words.',
    output_format: 'The prefix string.',
    constraints: '1 <= words.length <= 200, 0 <= words[i].length <= 200.',
    buggy_code: `import sys

def longest_common_prefix(strs):
    if not strs:
        return ""
    prefix = strs[0]
    for s in strs[1:]:
        # Bug: startswith called in reverse direction
        while not s.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    words = [w.strip() for w in raw.split(',') if w.strip()]
    print(longest_common_prefix(words))`,
    canonical_solution: `import sys

def longest_common_prefix(strs):
    if not strs:
        return ""
    prefix = strs[0]
    for s in strs[1:]:
        while not s.startswith(prefix):
            prefix = prefix[:-1]
            if not prefix:
                return ""
    return prefix

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    words = [w.strip() for w in raw.split(',') if w.strip()]
    print(longest_common_prefix(words))`,
    faulty_line: 9,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "flower,flow,flight", expected_output: "fl" },
      { input: "dog,racecar,car", expected_output: "" }
    ],
    hidden_tests: [
      { input: "interspecies,interstellar,interstate", expected_output: "inters" },
      { input: "throne,throne", expected_output: "throne" },
      { input: "a", expected_output: "a" }
    ]
  },
  {
    challenge_code: 'PY-008',
    title: 'Fibonacci Sequence Generator',
    description: 'Given an integer N on input, print the N-th Fibonacci number where Fib(0) = 0 and Fib(1) = 1.',
    expected_behavior: 'Outputs Fib(N).',
    input_format: 'An integer N.',
    output_format: 'An integer representing the N-th Fibonacci number.',
    constraints: '0 <= N <= 35.',
    buggy_code: `import sys

def fib(n):
    if n <= 0:
        return 0
    # Bug: Base case should return 1 for n == 1, but returns n-1
    if n == 1:
        return 0
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

if __name__ == "__main__":
    n = int(sys.stdin.read().strip())
    print(fib(n))`,
    canonical_solution: `import sys

def fib(n):
    if n <= 0:
        return 0
    if n == 1:
        return 1
    a, b = 0, 1
    for _ in range(2, n + 1):
        a, b = b, a + b
    return b

if __name__ == "__main__":
    n = int(sys.stdin.read().strip())
    print(fib(n))`,
    faulty_line: 7,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "2", expected_output: "1" },
      { input: "4", expected_output: "3" }
    ],
    hidden_tests: [
      { input: "0", expected_output: "0" },
      { input: "1", expected_output: "1" },
      { input: "10", expected_output: "55" }
    ]
  },
  {
    challenge_code: 'PY-009',
    title: 'Anagram String Checker',
    description: 'Given two comma-separated words on line 1, determine if they are anagrams of each other. Print "YES" if anagrams, else "NO".',
    expected_behavior: 'Prints "YES" or "NO".',
    input_format: 'Comma-separated pair of words.',
    output_format: '"YES" or "NO".',
    constraints: '1 <= len(word) <= 10^4.',
    buggy_code: `import sys

def is_anagram(s1, s2):
    # Bug: Uses set() which destroys letter frequency counts
    return "YES" if set(s1) == set(s2) else "NO"

if __name__ == "__main__":
    raw = sys.stdin.read().strip().split(',')
    w1 = raw[0].strip().lower()
    w2 = raw[1].strip().lower()
    print(is_anagram(w1, w2))`,
    canonical_solution: `import sys

def is_anagram(s1, s2):
    return "YES" if sorted(s1) == sorted(s2) else "NO"

if __name__ == "__main__":
    raw = sys.stdin.read().strip().split(',')
    w1 = raw[0].strip().lower()
    w2 = raw[1].strip().lower()
    print(is_anagram(w1, w2))`,
    faulty_line: 5,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "anagram,nagaram", expected_output: "YES" },
      { input: "rat,car", expected_output: "NO" }
    ],
    hidden_tests: [
      { input: "aacc,ccac", expected_output: "NO" },
      { input: "listen,silent", expected_output: "YES" },
      { input: "ab,a", expected_output: "NO" }
    ]
  },
  {
    challenge_code: 'PY-010',
    title: 'Maximum Subarray Sum (Kadane)',
    description: 'Find the maximum sum of a contiguous subarray in a comma-separated list of integers.',
    expected_behavior: 'Prints the maximum subarray sum.',
    input_format: 'Comma-separated integers.',
    output_format: 'Single integer.',
    constraints: '1 <= len(nums) <= 10^5.',
    buggy_code: `import sys

def max_sub_array(nums):
    max_so_far = nums[0]
    curr_max = nums[0]
    for x in nums[1:]:
        # Bug: Fails when all numbers are negative because it resets to 0
        curr_max = max(0, curr_max + x)
        max_so_far = max(max_so_far, curr_max)
    return max_so_far

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    nums = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(max_sub_array(nums))`,
    canonical_solution: `import sys

def max_sub_array(nums):
    max_so_far = nums[0]
    curr_max = nums[0]
    for x in nums[1:]:
        curr_max = max(x, curr_max + x)
        max_so_far = max(max_so_far, curr_max)
    return max_so_far

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    nums = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(max_sub_array(nums))`,
    faulty_line: 8,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "-2,1,-3,4,-1,2,1,-5,4", expected_output: "6" },
      { input: "1", expected_output: "1" }
    ],
    hidden_tests: [
      { input: "-1,-2,-3", expected_output: "-1" },
      { input: "5,4,-1,7,8", expected_output: "23" },
      { input: "-2,-1", expected_output: "-1" }
    ]
  },
  {
    challenge_code: 'PY-011',
    title: 'Matrix 90 Degree Rotation',
    description: 'Rotate an N x N matrix 90 degrees clockwise in place. Input is N followed by N rows of comma-separated numbers.',
    expected_behavior: 'Prints the rotated matrix with rows separated by newlines and cells by commas.',
    input_format: 'Line 1: N. Following N lines: comma-separated row integers.',
    output_format: 'N lines of comma-separated numbers.',
    constraints: '1 <= N <= 20.',
    buggy_code: `import sys

def rotate_matrix(matrix):
    n = len(matrix)
    # Transpose
    for i in range(n):
        for j in range(i, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    # Bug: Reversed vertically instead of horizontally
    matrix.reverse()
    return matrix

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    n = int(lines[0].strip())
    matrix = []
    for l in lines[1:n+1]:
        matrix.append([int(x.strip()) for x in l.split(',') if x.strip()])
    rot = rotate_matrix(matrix)
    for row in rot:
        print(','.join(str(x) for x in row))`,
    canonical_solution: `import sys

def rotate_matrix(matrix):
    n = len(matrix)
    for i in range(n):
        for j in range(i, n):
            matrix[i][j], matrix[j][i] = matrix[j][i], matrix[i][j]
    for row in matrix:
        row.reverse()
    return matrix

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    n = int(lines[0].strip())
    matrix = []
    for l in lines[1:n+1]:
        matrix.append([int(x.strip()) for x in l.split(',') if x.strip()])
    rot = rotate_matrix(matrix)
    for row in rot:
        print(','.join(str(x) for x in row))`,
    faulty_line: 10,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "3\n1,2,3\n4,5,6\n7,8,9", expected_output: "7,4,1\n8,5,2\n9,6,3" },
      { input: "1\n5", expected_output: "5" }
    ],
    hidden_tests: [
      { input: "2\n1,2\n3,4", expected_output: "3,1\n4,2" },
      { input: "3\n0,0,0\n1,1,1\n2,2,2", expected_output: "2,1,0\n2,1,0\n2,1,0" },
      { input: "2\n10,20\n30,40", expected_output: "30,10\n40,20" }
    ]
  },
  {
    challenge_code: 'PY-012',
    title: 'Run Length Encoding String Compressor',
    description: 'Compress a string using basic run-length encoding. For consecutive repeated characters, output the character followed by its count. If the compressed string is not shorter than the original, return original.',
    expected_behavior: 'Prints compressed string or original if compressed is not strictly shorter.',
    input_format: 'A single string.',
    output_format: 'The compressed or original string.',
    constraints: '1 <= len(s) <= 10^4.',
    buggy_code: `import sys

def compress_string(s):
    if not s:
        return ""
    res = []
    count = 1
    for i in range(1, len(s)):
        if s[i] == s[i - 1]:
            count += 1
        else:
            res.append(s[i - 1] + str(count))
            # Bug: Does not reset count to 1
            count = 0
    res.append(s[-1] + str(count))
    compressed = ''.join(res)
    return compressed if len(compressed) < len(s) else s

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print(compress_string(s))`,
    canonical_solution: `import sys

def compress_string(s):
    if not s:
        return ""
    res = []
    count = 1
    for i in range(1, len(s)):
        if s[i] == s[i - 1]:
            count += 1
        else:
            res.append(s[i - 1] + str(count))
            count = 1
    res.append(s[-1] + str(count))
    compressed = ''.join(res)
    return compressed if len(compressed) < len(s) else s

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print(compress_string(s))`,
    faulty_line: 13,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "aabcccccaaa", expected_output: "a2b1c5a3" },
      { input: "abcdef", expected_output: "abcdef" }
    ],
    hidden_tests: [
      { input: "aaaaa", expected_output: "a5" },
      { input: "aabb", expected_output: "aabb" },
      { input: "zzzzzzzzzz", expected_output: "z10" }
    ]
  },
  {
    challenge_code: 'PY-013',
    title: 'Integer Power Without In-Built Pow',
    description: 'Compute x raised to power n (x^n). Input has float x on line 1 and integer n on line 2. Round answer to 4 decimal places.',
    expected_behavior: 'Outputs x^n formatted to 4 decimal places.',
    input_format: 'Line 1: float x. Line 2: integer n.',
    output_format: 'Float with 4 decimal places.',
    constraints: '-100.0 < x < 100.0, -100 <= n <= 100.',
    buggy_code: `import sys

def my_pow(x, n):
    if n < 0:
        x = 1 / x
        n = -n
    ans = 1.0
    # Bug: Multiplies x by itself instead of accumulating into ans
    while n > 0:
        if n % 2 == 1:
            ans = ans * x
        x = x * 2
        n = n // 2
    return ans

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    x = float(lines[0].strip())
    n = int(lines[1].strip())
    print(f"{my_pow(x, n):.4f}")`,
    canonical_solution: `import sys

def my_pow(x, n):
    if n < 0:
        x = 1 / x
        n = -n
    ans = 1.0
    while n > 0:
        if n % 2 == 1:
            ans = ans * x
        x = x * x
        n = n // 2
    return ans

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    x = float(lines[0].strip())
    n = int(lines[1].strip())
    print(f"{my_pow(x, n):.4f}")`,
    faulty_line: 12,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "2.0\n10", expected_output: "1024.0000" },
      { input: "2.1\n3", expected_output: "9.2610" }
    ],
    hidden_tests: [
      { input: "2.0\n-2", expected_output: "0.2500" },
      { input: "5.0\n0", expected_output: "1.0000" },
      { input: "-1.0\n3", expected_output: "-1.0000" }
    ]
  },
  {
    challenge_code: 'PY-014',
    title: 'Array Inversion Count',
    description: 'Count the number of inversions in a comma-separated list of integers. An inversion is a pair (i, j) such that i < j and arr[i] > arr[j].',
    expected_behavior: 'Outputs total inversion count.',
    input_format: 'Comma-separated integers.',
    output_format: 'Integer.',
    constraints: '1 <= len(arr) <= 10^4.',
    buggy_code: `import sys

def count_inversions(arr):
    inv_count = 0
    n = len(arr)
    for i in range(n):
        # Bug: j starts from 0 instead of i + 1
        for j in range(0, n):
            if arr[i] > arr[j]:
                inv_count += 1
    return inv_count

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    arr = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(count_inversions(arr))`,
    canonical_solution: `import sys

def count_inversions(arr):
    inv_count = 0
    n = len(arr)
    for i in range(n):
        for j in range(i + 1, n):
            if arr[i] > arr[j]:
                inv_count += 1
    return inv_count

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    arr = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(count_inversions(arr))`,
    faulty_line: 8,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "2,4,1,3,5", expected_output: "3" },
      { input: "1,2,3", expected_output: "0" }
    ],
    hidden_tests: [
      { input: "3,2,1", expected_output: "3" },
      { input: "5,4,3,2,1", expected_output: "10" },
      { input: "1,1,1", expected_output: "0" }
    ]
  },
  {
    challenge_code: 'PY-015',
    title: 'Climbing Stairs Minimum Cost',
    description: 'You are given a comma-separated integer array cost where cost[i] is the cost of i-th step on a staircase. Once paid, you can climb one or two steps. Find minimum cost to reach top.',
    expected_behavior: 'Prints minimum cost.',
    input_format: 'Comma-separated integers.',
    output_format: 'Single integer.',
    constraints: '2 <= len(cost) <= 1000.',
    buggy_code: `import sys

def min_cost_climbing_stairs(cost):
    n = len(cost)
    dp = [0] * (n + 1)
    # Bug: Loop range does not compute dp up to n
    for i in range(2, n):
        dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])
    return dp[n]

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    cost = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(min_cost_climbing_stairs(cost))`,
    canonical_solution: `import sys

def min_cost_climbing_stairs(cost):
    n = len(cost)
    dp = [0] * (n + 1)
    for i in range(2, n + 1):
        dp[i] = min(dp[i - 1] + cost[i - 1], dp[i - 2] + cost[i - 2])
    return dp[n]

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    cost = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(min_cost_climbing_stairs(cost))`,
    faulty_line: 7,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "10,15,20", expected_output: "15" },
      { input: "1,100,1,1,1,100,1,1,100,1", expected_output: "6" }
    ],
    hidden_tests: [
      { input: "0,0,0,0", expected_output: "0" },
      { input: "1,2", expected_output: "1" },
      { input: "5,10,20", expected_output: "10" }
    ]
  },
  {
    challenge_code: 'PY-016',
    title: 'First Non-Repeating Character Index',
    description: 'Find the first non-repeating character in a string and print its 0-based index. If it does not exist, print -1.',
    expected_behavior: 'Outputs index of first unique character or -1.',
    input_format: 'A single string.',
    output_format: 'An integer.',
    constraints: '1 <= len(s) <= 10^5.',
    buggy_code: `import sys
from collections import Counter

def first_unique_char(s):
    count = Counter(s)
    for idx, ch in enumerate(s):
        # Bug: Checks if frequency is greater than 1 instead of exactly 1
        if count[ch] > 1:
            return idx
    return -1

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print(first_unique_char(s))`,
    canonical_solution: `import sys
from collections import Counter

def first_unique_char(s):
    count = Counter(s)
    for idx, ch in enumerate(s):
        if count[ch] == 1:
            return idx
    return -1

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print(first_unique_char(s))`,
    faulty_line: 8,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "bughunt", expected_output: "0" },
      { input: "lovebughunt", expected_output: "2" }
    ],
    hidden_tests: [
      { input: "aabb", expected_output: "-1" },
      { input: "z", expected_output: "0" },
      { input: "dddccdbba", expected_output: "8" }
    ]
  },
  {
    challenge_code: 'PY-017',
    title: 'Missing Number in Range [0, N]',
    description: 'Given an array containing N distinct numbers taken from 0, 1, 2, ..., N, find the one number in the range that is missing from the array.',
    expected_behavior: 'Outputs missing integer.',
    input_format: 'Comma-separated integers.',
    output_format: 'Single integer.',
    constraints: 'N == nums.length, 1 <= N <= 10^4.',
    buggy_code: `import sys

def missing_number(nums):
    n = len(nums)
    # Bug: Sum formula missing division by 2
    expected_sum = n * (n + 1)
    actual_sum = sum(nums)
    return expected_sum - actual_sum

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    nums = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(missing_number(nums))`,
    canonical_solution: `import sys

def missing_number(nums):
    n = len(nums)
    expected_sum = (n * (n + 1)) // 2
    actual_sum = sum(nums)
    return expected_sum - actual_sum

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    nums = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(missing_number(nums))`,
    faulty_line: 6,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "3,0,1", expected_output: "2" },
      { input: "0,1", expected_output: "2" }
    ],
    hidden_tests: [
      { input: "9,6,4,2,3,5,7,0,1", expected_output: "8" },
      { input: "0", expected_output: "1" },
      { input: "1", expected_output: "0" }
    ]
  },
  {
    challenge_code: 'PY-018',
    title: 'Reverse Words in a String',
    description: 'Given an input string s, reverse the order of the words. A word is defined as a sequence of non-space characters. Output words separated by a single space with no leading/trailing spaces.',
    expected_behavior: 'Outputs words in reverse order.',
    input_format: 'A string.',
    output_format: 'String with words reversed.',
    constraints: '1 <= len(s) <= 10^4.',
    buggy_code: `import sys

def reverse_words(s):
    # Bug: Splits by literal space which preserves empty tokens from multiple spaces
    words = s.split(" ")
    return " ".join(reversed(words))

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print(reverse_words(s))`,
    canonical_solution: `import sys

def reverse_words(s):
    words = s.split()
    return " ".join(reversed(words))

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print(reverse_words(s))`,
    faulty_line: 5,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "the sky is blue", expected_output: "blue is sky the" },
      { input: "  hello world  ", expected_output: "world hello" }
    ],
    hidden_tests: [
      { input: "a good   example", expected_output: "example good a" },
      { input: "SingleWord", expected_output: "SingleWord" },
      { input: "Alice   Bob", expected_output: "Bob Alice" }
    ]
  },
  {
    challenge_code: 'PY-019',
    title: 'Find Peak Element Index',
    description: 'A peak element is an element that is strictly greater than its neighbors. Find the index of any peak element in a comma-separated list of integers.',
    expected_behavior: 'Outputs index of a peak element.',
    input_format: 'Comma-separated integers.',
    output_format: 'Integer index.',
    constraints: '1 <= len(nums) <= 1000.',
    buggy_code: `import sys

def find_peak_element(nums):
    low = 0
    high = len(nums) - 1
    # Bug: high updated to mid - 1 skips peak
    while low < high:
        mid = (low + high) // 2
        if nums[mid] > nums[mid + 1]:
            high = mid - 1
        else:
            low = mid + 1
    return low

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    nums = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(find_peak_element(nums))`,
    canonical_solution: `import sys

def find_peak_element(nums):
    low = 0
    high = len(nums) - 1
    while low < high:
        mid = (low + high) // 2
        if nums[mid] > nums[mid + 1]:
            high = mid
        else:
            low = mid + 1
    return low

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    nums = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(find_peak_element(nums))`,
    faulty_line: 10,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "1,2,3,1", expected_output: "2" },
      { input: "1,2,1,3,5,6,4", expected_output: "5" }
    ],
    hidden_tests: [
      { input: "1", expected_output: "0" },
      { input: "1,2", expected_output: "1" },
      { input: "2,1", expected_output: "0" }
    ]
  },
  {
    challenge_code: 'PY-020',
    title: 'Valid IPv4 Address Checker',
    description: 'Validate whether a given string is a valid IPv4 address (four decimal numbers separated by dots, each between 0 and 255 with no leading zeros). Print "VALID" or "INVALID".',
    expected_behavior: 'Outputs "VALID" or "INVALID".',
    input_format: 'Single string.',
    output_format: '"VALID" or "INVALID".',
    constraints: '1 <= len(s) <= 50.',
    buggy_code: `import sys

def validate_ipv4(ip):
    parts = ip.split('.')
    if len(parts) != 4:
        return "INVALID"
    for p in parts:
        if not p.isdigit():
            return "INVALID"
        # Bug: Overlooks leading zero check when length > 1
        val = int(p)
        if val < 0 or val > 255:
            return "INVALID"
    return "VALID"

if __name__ == "__main__":
    ip = sys.stdin.read().strip()
    print(validate_ipv4(ip))`,
    canonical_solution: `import sys

def validate_ipv4(ip):
    parts = ip.split('.')
    if len(parts) != 4:
        return "INVALID"
    for p in parts:
        if not p.isdigit():
            return "INVALID"
        if len(p) > 1 and p[0] == '0':
            return "INVALID"
        val = int(p)
        if val < 0 or val > 255:
            return "INVALID"
    return "VALID"

if __name__ == "__main__":
    ip = sys.stdin.read().strip()
    print(validate_ipv4(ip))`,
    faulty_line: 10,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "192.168.1.1", expected_output: "VALID" },
      { input: "192.168.01.1", expected_output: "INVALID" }
    ],
    hidden_tests: [
      { input: "256.100.0.1", expected_output: "INVALID" },
      { input: "0.0.0.0", expected_output: "VALID" },
      { input: "192.168.1", expected_output: "INVALID" }
    ]
  },
  {
    challenge_code: 'PY-021',
    title: 'Array Product Except Self',
    description: 'Given a comma-separated list of integers nums, return a comma-separated list answer such that answer[i] is equal to the product of all the elements of nums except nums[i]. Do without division.',
    expected_behavior: 'Outputs comma-separated products.',
    input_format: 'Comma-separated integers.',
    output_format: 'Comma-separated integers.',
    constraints: '2 <= len(nums) <= 10^4.',
    buggy_code: `import sys

def product_except_self(nums):
    n = len(nums)
    output = [1] * n
    prefix = 1
    for i in range(n):
        output[i] = prefix
        prefix *= nums[i]
    postfix = 1
    # Bug: Loop direction goes forward instead of backwards
    for i in range(n):
        output[i] *= postfix
        postfix *= nums[i]
    return ','.join(str(x) for x in output)

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    nums = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(product_except_self(nums))`,
    canonical_solution: `import sys

def product_except_self(nums):
    n = len(nums)
    output = [1] * n
    prefix = 1
    for i in range(n):
        output[i] = prefix
        prefix *= nums[i]
    postfix = 1
    for i in range(n - 1, -1, -1):
        output[i] *= postfix
        postfix *= nums[i]
    return ','.join(str(x) for x in output)

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    nums = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(product_except_self(nums))`,
    faulty_line: 13,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "1,2,3,4", expected_output: "24,12,8,6" },
      { input: "-1,1,0,-3,3", expected_output: "0,0,9,0,0" }
    ],
    hidden_tests: [
      { input: "2,3", expected_output: "3,2" },
      { input: "1,1,1", expected_output: "1,1,1" },
      { input: "0,0", expected_output: "0,0" }
    ]
  },
  {
    challenge_code: 'PY-022',
    title: 'Top K Frequent Elements',
    description: 'Given a comma-separated list of integers on line 1 and integer k on line 2, find the k most frequent elements. Output sorted ascending separated by commas.',
    expected_behavior: 'Outputs comma-separated top k frequent numbers in ascending order.',
    input_format: 'Line 1: Comma-separated integers. Line 2: Integer k.',
    output_format: 'Comma-separated numbers.',
    constraints: '1 <= k <= distinct elements.',
    buggy_code: `import sys
from collections import Counter

def top_k_frequent(nums, k):
    count = Counter(nums)
    # Bug: Takes the lowest frequency elements instead of most common
    sorted_items = sorted(count.items(), key=lambda x: x[1])
    top_k = [x[0] for x in sorted_items[:k]]
    top_k.sort()
    return ','.join(str(x) for x in top_k)

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    nums = [int(x.strip()) for x in lines[0].split(',') if x.strip()]
    k = int(lines[1].strip())
    print(top_k_frequent(nums, k))`,
    canonical_solution: `import sys
from collections import Counter

def top_k_frequent(nums, k):
    count = Counter(nums)
    sorted_items = sorted(count.items(), key=lambda x: x[1], reverse=True)
    top_k = [x[0] for x in sorted_items[:k]]
    top_k.sort()
    return ','.join(str(x) for x in top_k)

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    nums = [int(x.strip()) for x in lines[0].split(',') if x.strip()]
    k = int(lines[1].strip())
    print(top_k_frequent(nums, k))`,
    faulty_line: 7,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "1,1,1,2,2,3\n2", expected_output: "1,2" },
      { input: "1\n1", expected_output: "1" }
    ],
    hidden_tests: [
      { input: "4,4,4,6,6,7,8,8,8,8\n2", expected_output: "4,8" },
      { input: "5,5,5,2,2,1\n1", expected_output: "5" },
      { input: "1,2,3\n3", expected_output: "1,2,3" }
    ]
  },
  {
    challenge_code: 'PY-023',
    title: 'Container With Most Water',
    description: 'Given N non-negative integers a1, a2, ..., an where each represents a point at coordinate (i, ai), find two lines that together with x-axis forms a container that holds the most water.',
    expected_behavior: 'Outputs maximum water area.',
    input_format: 'Comma-separated integers.',
    output_format: 'Single integer.',
    constraints: '2 <= len(height) <= 10^5.',
    buggy_code: `import sys

def max_area(height):
    left = 0
    right = len(height) - 1
    max_water = 0
    while left < right:
        width = right - left
        h = min(height[left], height[right])
        max_water = max(max_water, width * h)
        # Bug: Advances shorter line incorrectly (advances taller instead)
        if height[left] > height[right]:
            left += 1
        else:
            right -= 1
    return max_water

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    height = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(max_area(height))`,
    canonical_solution: `import sys

def max_area(height):
    left = 0
    right = len(height) - 1
    max_water = 0
    while left < right:
        width = right - left
        h = min(height[left], height[right])
        max_water = max(max_water, width * h)
        if height[left] < height[right]:
            left += 1
        else:
            right -= 1
    return max_water

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    height = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(max_area(height))`,
    faulty_line: 12,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "1,8,6,2,5,4,8,3,7", expected_output: "49" },
      { input: "1,1", expected_output: "1" }
    ],
    hidden_tests: [
      { input: "4,3,2,1,4", expected_output: "16" },
      { input: "1,2,1", expected_output: "2" },
      { input: "10,9,8,7,6,5,4,3,2,1", expected_output: "25" }
    ]
  },
  {
    challenge_code: 'PY-024',
    title: 'Roman Numeral to Integer Converter',
    description: 'Convert a Roman numeral string (I, V, X, L, C, D, M) to its corresponding integer value.',
    expected_behavior: 'Outputs integer value of Roman numeral.',
    input_format: 'A single string in uppercase.',
    output_format: 'An integer.',
    constraints: '1 <= len(s) <= 15.',
    buggy_code: `import sys

def roman_to_int(s):
    vals = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
    total = 0
    for i in range(len(s)):
        # Bug: Index out of range check inverted
        if i + 1 < len(s) and vals[s[i]] < vals[s[i + 1]]:
            total += vals[s[i]]
        else:
            total += vals[s[i]]
    return total

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print(roman_to_int(s))`,
    canonical_solution: `import sys

def roman_to_int(s):
    vals = {'I': 1, 'V': 5, 'X': 10, 'L': 50, 'C': 100, 'D': 500, 'M': 1000}
    total = 0
    for i in range(len(s)):
        if i + 1 < len(s) and vals[s[i]] < vals[s[i + 1]]:
            total -= vals[s[i]]
        else:
            total += vals[s[i]]
    return total

if __name__ == "__main__":
    s = sys.stdin.read().strip()
    print(roman_to_int(s))`,
    faulty_line: 9,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "III", expected_output: "3" },
      { input: "LVIII", expected_output: "58" }
    ],
    hidden_tests: [
      { input: "MCMXCIV", expected_output: "1994" },
      { input: "IV", expected_output: "4" },
      { input: "IX", expected_output: "9" }
    ]
  },
  {
    challenge_code: 'PY-025',
    title: 'Longest Consecutive Elements Sequence',
    description: 'Given an unsorted comma-separated list of integers, find the length of the longest consecutive elements sequence in O(N) time.',
    expected_behavior: 'Outputs length of longest consecutive sequence.',
    input_format: 'Comma-separated integers.',
    output_format: 'Single integer.',
    constraints: '0 <= len(nums) <= 10^5.',
    buggy_code: `import sys

def longest_consecutive(nums):
    if not nums:
        return 0
    num_set = set(nums)
    longest = 0
    for n in num_set:
        # Bug: Checks if n+1 is missing instead of n-1 to start a sequence
        if (n + 1) not in num_set:
            curr = n
            streak = 1
            while (curr + 1) in num_set:
                curr += 1
                streak += 1
            longest = max(longest, streak)
    return longest

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    nums = [int(x.strip()) for x in raw.split(',') if x.strip()] if raw else []
    print(longest_consecutive(nums))`,
    canonical_solution: `import sys

def longest_consecutive(nums):
    if not nums:
        return 0
    num_set = set(nums)
    longest = 0
    for n in num_set:
        if (n - 1) not in num_set:
            curr = n
            streak = 1
            while (curr + 1) in num_set:
                curr += 1
                streak += 1
            longest = max(longest, streak)
    return longest

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    nums = [int(x.strip()) for x in raw.split(',') if x.strip()] if raw else []
    print(longest_consecutive(nums))`,
    faulty_line: 10,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "100,4,200,1,3,2", expected_output: "4" },
      { input: "0,3,7,2,5,8,4,6,0,1", expected_output: "9" }
    ],
    hidden_tests: [
      { input: "", expected_output: "0" },
      { input: "10", expected_output: "1" },
      { input: "1,2,0,1", expected_output: "3" }
    ]
  },
  {
    challenge_code: 'PY-026',
    title: 'Group Anagrams by Signature',
    description: 'Given a comma-separated list of words, group the anagrams together. Output each group as sorted comma-separated words, and output groups sorted by the first word in each group.',
    expected_behavior: 'Outputs grouped anagrams.',
    input_format: 'Comma-separated words.',
    output_format: 'Lines of comma-separated words.',
    constraints: '1 <= words.length <= 10^3.',
    buggy_code: `import sys
from collections import defaultdict

def group_anagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        # Bug: Uses set as dictionary key (unhashable and loses count)
        key = tuple(set(s))
        groups[key].append(s)
    result = []
    for g in groups.values():
        g.sort()
        result.append(','.join(g))
    result.sort()
    return '\\n'.join(result)

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    strs = [x.strip() for x in raw.split(',') if x.strip()]
    print(group_anagrams(strs))`,
    canonical_solution: `import sys
from collections import defaultdict

def group_anagrams(strs):
    groups = defaultdict(list)
    for s in strs:
        key = ''.join(sorted(s))
        groups[key].append(s)
    result = []
    for g in groups.values():
        g.sort()
        result.append(','.join(g))
    result.sort()
    return '\\n'.join(result)

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    strs = [x.strip() for x in raw.split(',') if x.strip()]
    print(group_anagrams(strs))`,
    faulty_line: 8,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "eat,tea,tan,ate,nat,bat", expected_output: "ate,eat,tea\nbat\nnat,tan" },
      { input: "a", expected_output: "a" }
    ],
    hidden_tests: [
      { input: "cab,tin,pew,duh,may,ill,buy,bar,max,doc", expected_output: "bar\nbuy\ncab\ndoc\nduh\nill\nmay\nmax\npew\ntin" },
      { input: "zoo,oox", expected_output: "oox\nzoo" },
      { input: "ab,ba,abc,bca", expected_output: "ab,ba\nabc,bca" }
    ]
  },
  {
    challenge_code: 'PY-027',
    title: 'Valid Sudoku Sub-Box Validator',
    description: 'Check if a 9x9 Sudoku board is valid so far. Only filled cells (1-9) need to be validated. Empty cells are represented by ".". Rows, columns, and 3x3 sub-boxes must contain no duplicates.',
    expected_behavior: 'Outputs "VALID" or "INVALID".',
    input_format: '9 lines of 9 comma-separated values.',
    output_format: '"VALID" or "INVALID".',
    constraints: 'Board is 9x9.',
    buggy_code: `import sys

def is_valid_sudoku(board):
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    for r in range(9):
        for c in range(9):
            val = board[r][c]
            if val == '.':
                continue
            # Bug: Box index formula calculation error
            box_idx = (r // 3) + (c // 3)
            if val in rows[r] or val in cols[c] or val in boxes[box_idx]:
                return "INVALID"
            rows[r].add(val)
            cols[c].add(val)
            boxes[box_idx].add(val)
    return "VALID"

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    board = [[x.strip() for x in line.split(',') if x.strip()] for line in lines if line.strip()]
    print(is_valid_sudoku(board))`,
    canonical_solution: `import sys

def is_valid_sudoku(board):
    rows = [set() for _ in range(9)]
    cols = [set() for _ in range(9)]
    boxes = [set() for _ in range(9)]
    for r in range(9):
        for c in range(9):
            val = board[r][c]
            if val == '.':
                continue
            box_idx = (r // 3) * 3 + (c // 3)
            if val in rows[r] or val in cols[c] or val in boxes[box_idx]:
                return "INVALID"
            rows[r].add(val)
            cols[c].add(val)
            boxes[box_idx].add(val)
    return "VALID"

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    board = [[x.strip() for x in line.split(',') if x.strip()] for line in lines if line.strip()]
    print(is_valid_sudoku(board))`,
    faulty_line: 13,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "5,3,.,.,7,.,.,.,.\n6,.,.,1,9,5,.,.,.\n.,9,8,.,.,.,.,6,.\n8,.,.,.,6,.,.,.,3\n4,.,.,8,.,3,.,.,1\n7,.,.,.,2,.,.,.,6\n.,6,.,.,.,.,2,8,.\n.,.,.,4,1,9,.,.,5\n.,.,.,.,8,.,.,7,9", expected_output: "VALID" },
      { input: "8,3,.,.,7,.,.,.,.\n6,.,.,1,9,5,.,.,.\n.,9,8,.,.,.,.,6,.\n8,.,.,.,6,.,.,.,3\n4,.,.,8,.,3,.,.,1\n7,.,.,.,2,.,.,.,6\n.,6,.,.,.,.,2,8,.\n.,.,.,4,1,9,.,.,5\n.,.,.,.,8,.,.,7,9", expected_output: "INVALID" }
    ],
    hidden_tests: [
      { input: ".,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.", expected_output: "VALID" },
      { input: "1,2,3,4,5,6,7,8,9\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.", expected_output: "VALID" },
      { input: "1,1,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.\n.,.,.,.,.,.,.,.,.", expected_output: "INVALID" }
    ]
  },
  {
    challenge_code: 'PY-028',
    title: 'Find Minimum in Rotated Sorted Array',
    description: 'Suppose a sorted comma-separated array of unique integers is rotated at some pivot unknown to you. Find the minimum element in O(log N) time.',
    expected_behavior: 'Outputs minimum integer value.',
    input_format: 'Comma-separated integers.',
    output_format: 'Single integer.',
    constraints: '1 <= len(nums) <= 10^5.',
    buggy_code: `import sys

def find_min(nums):
    low = 0
    high = len(nums) - 1
    # Bug: Compares with nums[low] instead of nums[high]
    while low < high:
        mid = (low + high) // 2
        if nums[mid] > nums[low]:
            low = mid + 1
        else:
            high = mid
    return nums[low]

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    nums = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(find_min(nums))`,
    canonical_solution: `import sys

def find_min(nums):
    low = 0
    high = len(nums) - 1
    while low < high:
        mid = (low + high) // 2
        if nums[mid] > nums[high]:
            low = mid + 1
        else:
            high = mid
    return nums[low]

if __name__ == "__main__":
    raw = sys.stdin.read().strip()
    nums = [int(x.strip()) for x in raw.split(',') if x.strip()]
    print(find_min(nums))`,
    faulty_line: 9,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "3,4,5,1,2", expected_output: "1" },
      { input: "4,5,6,7,0,1,2", expected_output: "0" }
    ],
    hidden_tests: [
      { input: "11,13,15,17", expected_output: "11" },
      { input: "2,1", expected_output: "1" },
      { input: "1", expected_output: "1" }
    ]
  },
  {
    challenge_code: 'PY-029',
    title: 'Word Break Segmentation Checker',
    description: 'Given a string on line 1 and a dictionary of words (comma-separated on line 2), determine if the string can be segmented into a space-separated sequence of dictionary words. Output "TRUE" or "FALSE".',
    expected_behavior: 'Outputs "TRUE" or "FALSE".',
    input_format: 'Line 1: string s. Line 2: comma-separated word dictionary.',
    output_format: '"TRUE" or "FALSE".',
    constraints: '1 <= len(s) <= 300.',
    buggy_code: `import sys

def word_break(s, word_dict):
    words = set(word_dict)
    dp = [False] * (len(s) + 1)
    # Bug: dp[0] should be True as base case
    dp[0] = False
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break
    return "TRUE" if dp[len(s)] else "FALSE"

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    s = lines[0].strip()
    words = [w.strip() for w in lines[1].split(',') if w.strip()]
    print(word_break(s, words))`,
    canonical_solution: `import sys

def word_break(s, word_dict):
    words = set(word_dict)
    dp = [False] * (len(s) + 1)
    dp[0] = True
    for i in range(1, len(s) + 1):
        for j in range(i):
            if dp[j] and s[j:i] in words:
                dp[i] = True
                break
    return "TRUE" if dp[len(s)] else "FALSE"

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    s = lines[0].strip()
    words = [w.strip() for w in lines[1].split(',') if w.strip()]
    print(word_break(s, words))`,
    faulty_line: 7,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "bughunt\nbug,hunt", expected_output: "TRUE" },
      { input: "applepenapple\napple,pen", expected_output: "TRUE" }
    ],
    hidden_tests: [
      { input: "catsandog\ncats,dog,sand,and,cat", expected_output: "FALSE" },
      { input: "a\na", expected_output: "TRUE" },
      { input: "a\nb", expected_output: "FALSE" }
    ]
  },
  {
    challenge_code: 'PY-030',
    title: 'Course Schedule Dependency Cycle Detection',
    description: 'There are N courses labeled 0 to N-1. You are given N on line 1, and prerequisite pairs on subsequent lines in format "a,b" (meaning to take a, you must take b first). Can you finish all courses? Print "YES" or "NO".',
    expected_behavior: 'Outputs "YES" if topological sort has no cycles, else "NO".',
    input_format: 'Line 1: N. Line 2+: "a,b" prerequisites.',
    output_format: '"YES" or "NO".',
    constraints: '1 <= N <= 2000.',
    buggy_code: `import sys
from collections import defaultdict, deque

def can_finish(n, prerequisites):
    adj = defaultdict(list)
    indegree = [0] * n
    for u, v in prerequisites:
        adj[v].append(u)
        indegree[u] += 1
    # Bug: Queue initialized with nodes having indegree > 0 instead of == 0
    q = deque([i for i in range(n) if indegree[i] > 0])
    count = 0
    while q:
        node = q.popleft()
        count += 1
        for neighbor in adj[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                q.append(neighbor)
    return "YES" if count == n else "NO"

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if not lines:
        print("YES")
        sys.exit(0)
    n = int(lines[0].strip())
    prereqs = []
    for line in lines[1:]:
        if line.strip():
            parts = line.split(',')
            prereqs.append((int(parts[0].strip()), int(parts[1].strip())))
    print(can_finish(n, prereqs))`,
    canonical_solution: `import sys
from collections import defaultdict, deque

def can_finish(n, prerequisites):
    adj = defaultdict(list)
    indegree = [0] * n
    for u, v in prerequisites:
        adj[v].append(u)
        indegree[u] += 1
    q = deque([i for i in range(n) if indegree[i] == 0])
    count = 0
    while q:
        node = q.popleft()
        count += 1
        for neighbor in adj[node]:
            indegree[neighbor] -= 1
            if indegree[neighbor] == 0:
                q.append(neighbor)
    return "YES" if count == n else "NO"

if __name__ == "__main__":
    lines = sys.stdin.read().strip().splitlines()
    if not lines:
        print("YES")
        sys.exit(0)
    n = int(lines[0].strip())
    prereqs = []
    for line in lines[1:]:
        if line.strip():
            parts = line.split(',')
            prereqs.append((int(parts[0].strip()), int(parts[1].strip())))
    print(can_finish(n, prereqs))`,
    faulty_line: 11,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "2\n1,0", expected_output: "YES" },
      { input: "2\n1,0\n0,1", expected_output: "NO" }
    ],
    hidden_tests: [
      { input: "1", expected_output: "YES" },
      { input: "3\n0,1\n1,2", expected_output: "YES" },
      { input: "3\n0,1\n1,2\n2,0", expected_output: "NO" }
    ]
  }
];
