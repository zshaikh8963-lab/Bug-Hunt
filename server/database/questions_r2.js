/**
 * BUG HUNT 2K26 — Official Round 2: Identify the Bug (Java) Question Bank
 * Official Organizer Questions & Answer Key
 * Language: Java
 * Total Pool: 10 Challenges
 * Sequence per team: Easy -> Moderate -> Hard (3 Challenges per team = 15 Marks total)
 * Scoring: Buggy Line = 2 Marks • Bug Type = 3 Marks (5 Marks per challenge)
 * Timer: 3 minutes (180 seconds) per challenge
 */

export const r2JavaChallenges = [
  {
    challenge_code: 'JAVA-001',
    difficulty: 'Easy',
    title: 'Even or Odd',
    description: 'Identify the buggy line and the bug type in this number parity check.',
    code_snippet: `1 class CheckNumber {
2 public static void main(String[] args) {
3 int num = 8;
4 if (num % 2 == 0)
5 System.out.println("Odd");
6 else
7 System.out.println("Even");
8 }
9 }`,
    buggy_line: 5,
    bug_type: 'Logical Error',
    explanation: 'Line 5 prints "Odd" when num % 2 == 0 is true. For even numbers, it should print "Even", making line 5 a logical error.'
  },
  {
    challenge_code: 'JAVA-002',
    difficulty: 'Easy',
    title: 'Maximum of Two Numbers',
    description: 'Identify the buggy line and the bug type in this maximum calculation.',
    code_snippet: `1 class Maximum {
2 public static void main(String[] args) {
3 int a = 20;
4 int b = 30;
5 if (a < b)
6 System.out.println("Maximum = " + a);
7 else
8 System.out.println("Maximum = " + b);
9 }
10 }`,
    buggy_line: 6,
    bug_type: 'Logical Error',
    explanation: 'When a < b (20 < 30) is true, the maximum number is b. Line 6 incorrectly prints variable a instead of b, which is a logical error.'
  },
  {
    challenge_code: 'JAVA-003',
    difficulty: 'Easy',
    title: 'Array Access',
    description: 'Identify the buggy line and the bug type in this array traversal loop.',
    code_snippet: `1 class ArrayTest {
2 public static void main(String[] args) {
3 int[] arr = {10, 20, 30};
4 for (int i = 0; i <= arr.length; i++) {
5 System.out.println(arr[i]);
6 }
7 }
8 }`,
    buggy_line: 4,
    bug_type: 'Runtime Error',
    explanation: 'Line 4 loops with condition i <= arr.length instead of i < arr.length. When i reaches 3 (arr.length), line 5 accesses arr[3], throwing an ArrayIndexOutOfBoundsException at runtime.'
  },
  {
    challenge_code: 'JAVA-004',
    difficulty: 'Moderate',
    title: 'Student Grade',
    description: 'Identify the buggy line and the bug type in this student grade evaluation.',
    code_snippet: `1 class Grade {
2 public static void main(String[] args) {
3 int marks = 85;
4 if (marks >= 90)
5 System.out.println("A");
6 else if (marks >= 75)
7 System.out.println("C");
8 else
9 System.out.println("B");
10 }
11 }`,
    buggy_line: 7,
    bug_type: 'Logical Error',
    explanation: 'Line 7 prints "C" for marks >= 75, while the else branch prints "B", reversing the grading hierarchy and producing an incorrect grade for marks = 85.'
  },
  {
    challenge_code: 'JAVA-005',
    difficulty: 'Moderate',
    title: 'Division',
    description: 'Identify the buggy line and the bug type in this arithmetic division.',
    code_snippet: `1 class Division {
2 public static void main(String[] args) {
3 int a = 100;
4 int b = 0;
5 int result = a / b;
6 System.out.println(result);
7 }
8 }`,
    buggy_line: 5,
    bug_type: 'Exception',
    explanation: 'Line 5 performs integer division by zero (a / b with b = 0), which throws an unhandled java.lang.ArithmeticException: / by zero.'
  },
  {
    challenge_code: 'JAVA-006',
    difficulty: 'Moderate',
    title: 'String Comparison',
    description: 'Identify the buggy line and the bug type in this string credentials verification.',
    code_snippet: `1 class Login {
2 public static void main(String[] args) {
3 String username = new String("admin");
4 String input = new String("admin");
5 if (username == input)
6 System.out.println("Login Successful");
7 else
8 System.out.println("Login Failed");
9 }
10 }`,
    buggy_line: 5,
    bug_type: 'Logical Error',
    explanation: 'Line 5 uses the == operator to compare two distinct String objects created with "new", comparing memory references rather than values. It evaluates to false, causing "Login Failed".'
  },
  {
    challenge_code: 'JAVA-007',
    difficulty: 'Hard',
    title: 'Object Initialization',
    description: 'Identify the buggy line and the bug type in this object declaration and method call.',
    code_snippet: `1 class Student {
2 String name;
3
4 void display() {
5 System.out.println(name);
6 }
7
8 public static void main(String[] args) {
9 Student s;
10 s.name = "Rahul";
11 s.display();
12 }
13 }`,
    buggy_line: 10,
    bug_type: 'Runtime Error',
    explanation: 'Line 10 attempts to dereference local variable s without initializing it (s is not instantiated with new Student()). (Organizer Answer Key: Line 10, Runtime Error).'
  },
  {
    challenge_code: 'JAVA-008',
    difficulty: 'Hard',
    title: 'Factorial',
    description: 'Identify the buggy line and the bug type in this factorial calculation routine.',
    code_snippet: `1 class Factorial {
2 public static void main(String[] args) {
3 int n = 5;
4 int fact = 1;
5 for (int i = 1; i <= n; i++) {
6 fact = fact + i;
7 }
8 System.out.println(fact);
9 }
10 }`,
    buggy_line: 6,
    bug_type: 'Logical Error',
    explanation: 'Line 6 uses addition (fact = fact + i) instead of multiplication (fact = fact * i). This computes the sum of numbers from 1 to n rather than the factorial.'
  },
  {
    challenge_code: 'JAVA-009',
    difficulty: 'Hard',
    title: 'Nested Conditions',
    description: 'Identify the buggy line and the bug type in this nested discount calculator.',
    code_snippet: `1 class Discount {
2 public static void main(String[] args) {
3 int amount = 1500;
4 if (amount > 1000) {
5 if (amount > 2000) {
6 System.out.println("20% Discount");
7 } else {
8 System.out.println("10% Discount");
9 }
10 }
11 System.out.println("Bill Generated");
12 }
13 }`,
    buggy_line: 4,
    bug_type: 'Logical Error',
    explanation: 'Line 4 contains the condition boundary bug per Organizer Answer Key (Buggy Line 4, Logical Error).'
  },
  {
    challenge_code: 'JAVA-010',
    difficulty: 'Hard',
    title: 'Method Return',
    description: 'Identify the buggy line and the bug type in this integer addition method.',
    code_snippet: `1 class Calculator {
2 static int add(int a, int b) {
3 int sum = a + b;
4 System.out.println(sum);
5 }
6
7 public static void main(String[] args) {
8 add(10, 20);
9 }
10 }`,
    buggy_line: 5,
    bug_type: 'Compilation Error',
    explanation: 'Method add declares a return type of int, but line 5 closes the method block without returning an int value (missing return statement), causing a compilation error.'
  }
];
