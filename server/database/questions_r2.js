/**
 * BUG HUNT — Official Round 2: Identify the Bug (Java) Question Bank
 * 10 Official Questions | 5 Marks Each (Buggy Line = 2 Marks, Bug Type = 3 Marks)
 * Pool: 10 Questions. For competition: 3 randomly selected questions per team (15 Marks total).
 * Time: 3 minutes per question.
 */

export const r2JavaChallenges = [
  {
    challenge_code: 'JAVA-001',
    title: 'Sum Greater-Than Comparison',
    description: 'Examine this Java arithmetic method. Identify which line contains the bug and what type of bug it is.',
    code_snippet: `1  public class Main {
2      public static void main(String[] args) {
3          int a = 10;
4          int b = 20;
5          int result = a + b;
6          if (result > 40) {
7              System.out.println("Correct");
8          } else {
9              System.out.println("Incorrect");
10         }
11     }
12 }`,
    buggy_line: 6,
    bug_type: 'Logical Error',
    explanation: 'The sum of a (10) and b (20) is 30. Line 6 checks if (result > 40), which is a logical error causing the program to output "Incorrect" unexpectedly.'
  },
  {
    challenge_code: 'JAVA-002',
    title: 'Variable Declaration Semicolon',
    description: 'Examine this variable declaration. Identify which line contains the bug and what type of bug it is.',
    code_snippet: `1  public class Main {
2      public static void main(String[] args) {
3          int number = 25
4          System.out.println(number);
5      }
6  }`,
    buggy_line: 3,
    bug_type: 'Syntax Error',
    explanation: 'Line 3 is missing a terminating semicolon (;) after "25", causing a syntax error.'
  },
  {
    challenge_code: 'JAVA-003',
    title: 'Arithmetic Division by Zero',
    description: 'Examine this division calculation. Identify which line contains the bug and what type of bug it is.',
    code_snippet: `1  public class Main {
2      public static void main(String[] args) {
3          int a = 10;
4          int b = 0;
5          int result = a / b;
6          System.out.println(result);
7      }
8  }`,
    buggy_line: 5,
    bug_type: 'Exception',
    explanation: 'Line 5 attempts integer division by zero (a / b with b = 0), throwing an ArithmeticException at runtime.'
  },
  {
    challenge_code: 'JAVA-004',
    title: 'Grade Threshold Evaluation',
    description: 'Examine this grading condition logic. Identify which line contains the bug and what type of bug it is.',
    code_snippet: `1  public class Main {
2      public static void main(String[] args) {
3          int marks = 75;
4          if (marks > 90) {
5              System.out.println("Excellent");
6          } else if (marks > 60) {
7              System.out.println("Pass");
8          } else {
9              System.out.println("Fail");
10         }
11     }
12 }`,
    buggy_line: 4,
    bug_type: 'Logical Error',
    explanation: 'Line 4 contains a logical error in the condition checking structure for the intended grading range.'
  },
  {
    challenge_code: 'JAVA-005',
    title: 'Null String Length Dereference',
    description: 'Examine this string property access. Identify which line contains the bug and what type of bug it is.',
    code_snippet: `1  public class Main {
2      public static void main(String[] args) {
3          String name = null;
4          System.out.println(name.length());
5      }
6  }`,
    buggy_line: 4,
    bug_type: 'Exception',
    explanation: 'Line 4 calls method .length() on name, which is null, triggering a NullPointerException at runtime.'
  },
  {
    challenge_code: 'JAVA-006',
    title: 'Missing Default Constructor',
    description: 'Examine this class instantiation. Identify which line contains the bug and what type of bug it is.',
    code_snippet: `1  class Student {
2      String name;
3
4      Student(String name) {
5          this.name = name;
6      }
7  }
8
9  public class Main {
10     public static void main(String[] args) {
11         Student s = new Student();
12         System.out.println(s.name);
13     }
14 }`,
    buggy_line: 11,
    bug_type: 'Compilation Error',
    explanation: 'Line 11 attempts to call new Student(), but class Student only defines a parameterized constructor Student(String name). The compiler fails to find a default no-arg constructor.'
  },
  {
    challenge_code: 'JAVA-007',
    title: 'Array Index Beyond Bounds',
    description: 'Examine this array element retrieval. Identify which line contains the bug and what type of bug it is.',
    code_snippet: `1  public class Main {
2      public static void main(String[] args) {
3          int[] arr = {10, 20, 30};
4          System.out.println(arr[3]);
5      }
6  }`,
    buggy_line: 4,
    bug_type: 'Runtime Error',
    explanation: 'Line 4 accesses arr[3] on an array of size 3 (valid indices are 0, 1, 2), throwing an ArrayIndexOutOfBoundsException at runtime.'
  },
  {
    challenge_code: 'JAVA-008',
    title: 'Precedence in Average Formula',
    description: 'Examine this mathematical formula. Identify which line contains the bug and what type of bug it is.',
    code_snippet: `1  public class Main {
2      public static void main(String[] args) {
3          int x = 10;
4          int y = 20;
5          int average = x + y / 2;
6          System.out.println(average);
7      }
8  }`,
    buggy_line: 5,
    bug_type: 'Logical Error',
    explanation: 'Due to division having higher operator precedence than addition, y / 2 evaluates first (yielding 10 + 10 = 20 instead of (10 + 20) / 2 = 15). This is a logical error.'
  },
  {
    challenge_code: 'JAVA-009',
    title: 'Private Field Encapsulation Violation',
    description: 'Examine this field access. Identify which line contains the bug and what type of bug it is.',
    code_snippet: `1  class Person {
2      private String name;
3
4      public void setName(String name) {
5          this.name = name;
6      }
7  }
8
9  public class Main {
10     public static void main(String[] args) {
11         Person p = new Person();
12         p.name = "Rahul";
13     }
14 }`,
    buggy_line: 12,
    bug_type: 'Compilation Error',
    explanation: 'Line 12 attempts to access p.name directly, but "name" has private access in class Person. It fails at compile time; p.setName("Rahul") must be used instead.'
  },
  {
    challenge_code: 'JAVA-010',
    title: 'While Loop Missing Decrement',
    description: 'Examine this while loop. Identify which line contains the bug and what type of bug it is.',
    code_snippet: `1  public class Main {
2      public static void main(String[] args) {
3          int count = 10;
4          while (count > 0) {
5              System.out.println(count);
6          }
7      }
8  }`,
    buggy_line: 6,
    bug_type: 'Logical Error',
    explanation: 'Line 6 does not decrement "count" (missing count--), resulting in an infinite loop where count remains 10 forever. This is a logical error.'
  }
];
