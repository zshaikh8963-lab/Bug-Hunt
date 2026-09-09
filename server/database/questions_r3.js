/**
 * BUG HUNT 2K26 — Official Round 3: Identify, Fix & Run (Python) Question Bank
 * Official Organizer Questions & Specifications
 * Language: Python
 * Total Pool: 4 Questions — 2 Easy + 2 Hard
 * Team Attempt: Exactly 2 Questions (1 Easy + 1 Hard, Shuffled)
 * Marks: Easy = 12 Marks • Hard = 13 Marks • Total = 25 Marks
 */

export const r3PythonChallenges = [
  {
    challenge_code: 'PY-001',
    difficulty: 'Easy',
    title: 'Calculate Total',
    description: 'Examine this price summation function. Identify the buggy line, choose the bug type, and fix the code to accumulate total price properly.',
    expected_behavior: 'Accumulates all item prices and prints "Total: 500".',
    input_format: 'Pre-defined list of prices in script.',
    output_format: 'Total: 500',
    constraints: 'prices = [100, 200, 150, 50]',
    buggy_code: `def calculate_total(prices):
    total = 0
    for price in prices:
        total = price
    return total

prices = [100, 200, 150, 50]
print("Total:", calculate_total(prices))`,
    canonical_solution: `def calculate_total(prices):
    total = 0
    for price in prices:
        total += price
    return total

prices = [100, 200, 150, 50]
print("Total:", calculate_total(prices))`,
    faulty_line: 4,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "", expected_output: "Total: 500" }
    ],
    hidden_tests: [
      { input: "", expected_output: "Total: 500" }
    ]
  },
  {
    challenge_code: 'PY-002',
    difficulty: 'Easy',
    title: 'Find Maximum',
    description: 'Examine this maximum element finder. Identify the buggy line, choose the bug type, and fix the comparison logic to return the maximum value.',
    expected_behavior: 'Compares each number and prints "Maximum: 67".',
    input_format: 'Pre-defined list of numbers in script.',
    output_format: 'Maximum: 67',
    constraints: 'numbers = [12, 45, 23, 67, 34]',
    buggy_code: `def find_max(numbers):
    maximum = 0
    for num in numbers:
        if num < maximum:
            maximum = num
    return maximum

numbers = [12, 45, 23, 67, 34]
print("Maximum:", find_max(numbers))`,
    canonical_solution: `def find_max(numbers):
    maximum = 0
    for num in numbers:
        if num > maximum:
            maximum = num
    return maximum

numbers = [12, 45, 23, 67, 34]
print("Maximum:", find_max(numbers))`,
    faulty_line: 4,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "", expected_output: "Maximum: 67" }
    ],
    hidden_tests: [
      { input: "", expected_output: "Maximum: 67" }
    ]
  },
  {
    challenge_code: 'PY-003',
    difficulty: 'Hard',
    title: 'Student Average',
    description: 'Examine this student result evaluator. Identify the buggy line, choose the bug type, and fix the division operator to use true floating-point division.',
    expected_behavior: 'Computes true average and prints "Pass".',
    input_format: 'Pre-defined list of marks in script.',
    output_format: 'Pass',
    constraints: 'marks = [35, 42, 48, 51, 44]',
    buggy_code: `def calculate_result(marks):
    total = sum(marks)
    average = total // len(marks)
    if average >= 40:
        return "Pass"
    else:
        return "Fail"

marks = [35, 42, 48, 51, 44]
print(calculate_result(marks))`,
    canonical_solution: `def calculate_result(marks):
    total = sum(marks)
    average = total / len(marks)
    if average >= 40:
        return "Pass"
    else:
        return "Fail"

marks = [35, 42, 48, 51, 44]
print(calculate_result(marks))`,
    faulty_line: 3,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "", expected_output: "Pass" }
    ],
    hidden_tests: [
      { input: "", expected_output: "Pass" }
    ]
  },
  {
    challenge_code: 'PY-004',
    difficulty: 'Hard',
    title: 'Inventory Calculator',
    description: 'Examine this inventory valuation logic. Identify the buggy line, choose the bug type, and fix the total calculation so each item product accumulates.',
    expected_behavior: 'Accumulates each product valuation and prints "Total: 3900".',
    input_format: 'Pre-defined list of dictionaries in script.',
    output_format: 'Total: 3900',
    constraints: 'inventory with 3 item dicts',
    buggy_code: `def calculate_inventory(inventory):
    total = 0
    for item in inventory:
        price = item["price"]
        quantity = item["quantity"]
        total = price * quantity
    return total

inventory = [
    {"name": "Keyboard", "price": 800, "quantity": 2},
    {"name": "Mouse", "price": 500, "quantity": 3},
    {"name": "Cable", "price": 200, "quantity": 4}
]
print("Total:", calculate_inventory(inventory))`,
    canonical_solution: `def calculate_inventory(inventory):
    total = 0
    for item in inventory:
        price = item["price"]
        quantity = item["quantity"]
        total += price * quantity
    return total

inventory = [
    {"name": "Keyboard", "price": 800, "quantity": 2},
    {"name": "Mouse", "price": 500, "quantity": 3},
    {"name": "Cable", "price": 200, "quantity": 4}
]
print("Total:", calculate_inventory(inventory))`,
    faulty_line: 6,
    bug_type: 'Logical Error',
    visible_tests: [
      { input: "", expected_output: "Total: 3900" }
    ],
    hidden_tests: [
      { input: "", expected_output: "Total: 3900" }
    ]
  }
];
