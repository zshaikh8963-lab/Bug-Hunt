/**
 * Round 2: Identify the Bug (Java) Question Bank
 * Total: 30+ Java Debugging Challenges
 * Each challenge: 5 Marks (Correct Line = 3 Marks, Correct Bug Type = 2 Marks)
 * Bug Types: 'Syntax Error', 'Compilation Error', 'Logical Error', 'Runtime Error', 'Exception', 'OOP Error'
 */

export const r2JavaChallenges = [
  {
    challenge_code: 'JAVA-001',
    title: 'Zero Denominator Division',
    description: 'Examine this Java arithmetic method. Identify the buggy line and its bug type.',
    code_snippet: `1  public class Calculator {
2      public static void main(String[] args) {
3          int a = 10;
4          int b = 0;
5          int result = a / b;
6          System.out.println("Result: " + result);
7      }
8  }`,
    buggy_line: 5,
    bug_type: 'ArithmeticException (Runtime Error)',
    explanation: 'Line 5 performs integer division by zero (a / b where b = 0), which throws an ArithmeticException at runtime.'
  },
  {
    challenge_code: 'JAVA-002',
    title: 'Null Object Dereference',
    description: 'Examine this string processor. Identify the buggy line and its bug type.',
    code_snippet: `1  public class TextProcessor {
2      public static void main(String[] args) {
3          String title = null;
4          int length = title.length();
5          System.out.println("Length: " + length);
6      }
7  }`,
    buggy_line: 4,
    bug_type: 'Exception',
    explanation: 'Line 4 calls method .length() on title, which is null, throwing a NullPointerException at runtime.'
  },
  {
    challenge_code: 'JAVA-003',
    title: 'Array Index Bounds Violation',
    description: 'Examine this array iteration loop. Identify the buggy line and its bug type.',
    code_snippet: `1  public class ArrayScanner {
2      public static void main(String[] args) {
3          int[] numbers = {10, 20, 30, 40};
4          for (int i = 0; i <= numbers.length; i++) {
5              System.out.println(numbers[i]);
6          }
7      }
8  }`,
    buggy_line: 4,
    bug_type: 'Runtime Error',
    explanation: 'Line 4 uses condition i <= numbers.length. When i reaches 4, numbers[4] is accessed on an array of length 4, throwing ArrayIndexOutOfBoundsException.'
  },
  {
    challenge_code: 'JAVA-004',
    title: 'String Reference Comparison',
    description: 'Examine this credential validation logic. Identify the buggy line and its bug type.',
    code_snippet: `1  public class AuthValidator {
2      public static boolean checkKey(String input) {
3          String secret = new String("SECRET2026");
4          if (input == secret) {
5              return true;
6          }
7          return false;
8      }
9  }`,
    buggy_line: 4,
    bug_type: 'Logical Error',
    explanation: 'Line 4 uses == to compare strings. In Java, == compares memory references instead of string contents. It should use input.equals(secret).'
  },
  {
    challenge_code: 'JAVA-005',
    title: 'Static Method Accessing Instance Variable',
    description: 'Examine this scoreboard tracker. Identify the buggy line and its bug type.',
    code_snippet: `1  public class ScoreManager {
2      private int topScore = 100;
3      public static void showScore() {
4          System.out.println("Top: " + topScore);
5      }
6      public static void main(String[] args) {
7          showScore();
8      }
9  }`,
    buggy_line: 4,
    bug_type: 'Compilation Error',
    explanation: 'Line 4 attempts to directly reference non-static field topScore from inside a static method showScore(), which violates Java access rules.'
  },
  {
    challenge_code: 'JAVA-006',
    title: 'Infinite Loop Due to Unmodified Counter',
    description: 'Examine this loop logic. Identify the buggy line and its bug type.',
    code_snippet: `1  public class LoopDemo {
2      public static void main(String[] args) {
3          int count = 1;
4          while (count <= 10) {
5              System.out.println("Processing: " + count);
6          }
7      }
8  }`,
    buggy_line: 4,
    bug_type: 'Logical Error',
    explanation: 'Line 4 defines a while loop condition on count, but count is never modified inside the loop body, causing an infinite loop.'
  },
  {
    challenge_code: 'JAVA-007',
    title: 'Missing Return Statement in Non-Void Method',
    description: 'Examine this computation method. Identify the buggy line and its bug type.',
    code_snippet: `1  public class MathHelper {
2      public static int computeMax(int a, int b) {
3          if (a > b) {
4              return a;
5          }
6      }
7      public static void main(String[] args) {
8          System.out.println(computeMax(10, 20));
9      }
10 }`,
    buggy_line: 2,
    bug_type: 'Compilation Error',
    explanation: 'Line 2 declares method computeMax with return type int, but if a <= b, execution falls through without returning any value (missing return statement).'
  },
  {
    challenge_code: 'JAVA-008',
    title: 'Parent Class Method Call Missing super',
    description: 'Examine this inheritance class. Identify the buggy line and its bug type.',
    code_snippet: `1  class Animal {
2      public void speak() { System.out.println("Sound"); }
3  }
4  class Dog extends Animal {
5      @Override
6      public void speak() {
7          speak();
8          System.out.println("Bark");
9      }
10 }`,
    buggy_line: 7,
    bug_type: 'Exception',
    explanation: 'Line 7 calls speak() without super., causing infinite recursive self-invocation and resulting in a StackOverflowError at runtime.'
  },
  {
    challenge_code: 'JAVA-009',
    title: 'Type Incompatibility in Primitive Narrowing',
    description: 'Examine this type assignment. Identify the buggy line and its bug type.',
    code_snippet: `1  public class Converter {
2      public static void main(String[] args) {
3          long bigNumber = 9876543210L;
4          int smallNumber = bigNumber;
5          System.out.println(smallNumber);
6      }
7  }`,
    buggy_line: 4,
    bug_type: 'Compilation Error',
    explanation: 'Line 4 assigns a 64-bit long to a 32-bit int without an explicit type cast (int), causing a compile-time "incompatible types: possible lossy conversion" error.'
  },
  {
    challenge_code: 'JAVA-010',
    title: 'Abstract Class Direct Instantiation',
    description: 'Examine this object instantiation. Identify the buggy line and its bug type.',
    code_snippet: `1  abstract class Shape {
2      abstract void draw();
3  }
4  public class App {
5      public static void main(String[] args) {
6          Shape s = new Shape();
7          s.draw();
8      }
9  }`,
    buggy_line: 6,
    bug_type: 'OOP Error',
    explanation: 'Line 6 attempts to instantiate an abstract class Shape with new Shape(). In Java, abstract classes cannot be directly instantiated.'
  },
  {
    challenge_code: 'JAVA-011',
    title: 'Unchecked Cast Exception',
    description: 'Examine this type casting code. Identify the buggy line and its bug type.',
    code_snippet: `1  public class CastDemo {
2      public static void main(String[] args) {
3          Object item = "Competition 2026";
4          Integer score = (Integer) item;
5          System.out.println(score);
6      }
7  }`,
    buggy_line: 4,
    bug_type: 'Exception',
    explanation: 'Line 4 attempts to cast a String instance to an Integer, which throws a java.lang.ClassCastException at runtime.'
  },
  {
    challenge_code: 'JAVA-012',
    title: 'String Immutability Assumption',
    description: 'Examine this string modification snippet. Identify the buggy line and its bug type.',
    code_snippet: `1  public class StringModifier {
2      public static void main(String[] args) {
3          String username = "  admin  ";
4          username.trim();
5          System.out.println("[" + username + "]");
6      }
7  }`,
    buggy_line: 4,
    bug_type: 'Logical Error',
    explanation: 'Line 4 calls username.trim() but ignores the return value. Because Java strings are immutable, username remains untrimmed.'
  },
  {
    challenge_code: 'JAVA-013',
    title: 'Missing Constructor Parameter',
    description: 'Examine this object creation. Identify the buggy line and its bug type.',
    code_snippet: `1  class Participant {
2      String name;
3      Participant(String name) { this.name = name; }
4  }
5  public class Registry {
6      public static void main(String[] args) {
7          Participant p = new Participant();
8          System.out.println(p.name);
9      }
10 }`,
    buggy_line: 7,
    bug_type: 'Compilation Error',
    explanation: 'Line 7 calls default no-arg constructor new Participant(), which does not exist because a parameterized constructor was explicitly defined on line 3.'
  },
  {
    challenge_code: 'JAVA-014',
    title: 'Fall-Through Switch Statement',
    description: 'Examine this grade evaluator. Identify the buggy line and its bug type.',
    code_snippet: `1  public class GradeEvaluator {
2      public static void evaluate(char grade) {
3          switch (grade) {
4              case 'A': System.out.print("Excellent ");
5              case 'B': System.out.print("Good ");
6              case 'C': System.out.print("Fair ");
7          }
8      }
9  }`,
    buggy_line: 4,
    bug_type: 'Logical Error',
    explanation: 'Line 4 lacks a break statement, causing execution for case \'A\' to fall through and print subsequent cases as well.'
  },
  {
    challenge_code: 'JAVA-015',
    title: 'Modifying Collection During Iteration',
    description: 'Examine this list filtering routine. Identify the buggy line and its bug type.',
    code_snippet: `1  import java.util.*;
2  public class FilterDemo {
3      public static void main(String[] args) {
4          List<Integer> list = new ArrayList<>(Arrays.asList(1, 2, 3));
5          for (Integer num : list) {
6              if (num == 2) list.remove(num);
7          }
8      }
9  }`,
    buggy_line: 6,
    bug_type: 'Exception',
    explanation: 'Line 6 calls list.remove(num) inside an enhanced for-loop, modifying collection structure while an active iterator is traversing, throwing ConcurrentModificationException.'
  },
  {
    challenge_code: 'JAVA-016',
    title: 'Final Variable Reassignment',
    description: 'Examine this constant declaration. Identify the buggy line and its bug type.',
    code_snippet: `1  public class Constants {
2      public static void main(String[] args) {
3          final double TAX_RATE = 0.18;
4          TAX_RATE = 0.20;
5          System.out.println("Rate: " + TAX_RATE);
6      }
7  }`,
    buggy_line: 4,
    bug_type: 'Compilation Error',
    explanation: 'Line 4 attempts to reassign TAX_RATE, which is declared as final on line 3, causing a compile-time "cannot assign a value to final variable" error.'
  },
  {
    challenge_code: 'JAVA-017',
    title: 'Recursive Function Missing Base Case',
    description: 'Examine this recursive countdown. Identify the buggy line and its bug type.',
    code_snippet: `1  public class Countdown {
2      public static void count(int n) {
3          System.out.println(n);
4          count(n - 1);
5      }
6      public static void main(String[] args) {
7          count(5);
8      }
9  }`,
    buggy_line: 4,
    bug_type: 'Runtime Error',
    explanation: 'Line 4 unconditionally calls count(n - 1) without checking any termination base case (e.g., if (n <= 0) return;), leading to StackOverflowError.'
  },
  {
    challenge_code: 'JAVA-018',
    title: 'Method Overriding Access Privilege Reduction',
    description: 'Examine this subclass method declaration. Identify the buggy line and its bug type.',
    code_snippet: `1  class Vehicle {
2      public void start() { System.out.println("Starting"); }
3  }
4  class Bike extends Vehicle {
5      @Override
6      void start() { System.out.println("Bike start"); }
7  }`,
    buggy_line: 6,
    bug_type: 'OOP Error',
    explanation: 'Line 6 overrides a public method start() with package-private (default) access. Java forbids reducing visibility of overridden methods in subclasses.'
  },
  {
    challenge_code: 'JAVA-019',
    title: 'Integer Division Truncation in Percentage Calculation',
    description: 'Examine this percentage computation. Identify the buggy line and its bug type.',
    code_snippet: `1  public class ExamScore {
2      public static void main(String[] args) {
3          int marksObtained = 45;
4          int totalMarks = 50;
5          double percentage = (marksObtained / totalMarks) * 100;
6          System.out.println("Percentage: " + percentage);
7      }
8  }`,
    buggy_line: 5,
    bug_type: 'Logical Error',
    explanation: 'Line 5 divides two integers (marksObtained / totalMarks -> 45 / 50 = 0) before multiplying by 100, resulting in 0.0 instead of 90.0.'
  },
  {
    challenge_code: 'JAVA-020',
    title: 'Unchecked Scanner Resource Leak',
    description: 'Examine this input reader. Identify the buggy line and its bug type.',
    code_snippet: `1  import java.util.Scanner;
2  public class InputTest {
3      public static void main(String[] args) {
4          Scanner scanner = new Scanner(System.in);
5          int code = Integer.parseInt("XYZ");
6          scanner.close();
7      }
8  }`,
    buggy_line: 5,
    bug_type: 'Exception',
    explanation: 'Line 5 calls Integer.parseInt("XYZ"), which throws a java.lang.NumberFormatException because "XYZ" cannot be parsed into an integer.'
  },
  {
    challenge_code: 'JAVA-021',
    title: 'Array Instantiation Negative Size',
    description: 'Examine this buffer allocation. Identify the buggy line and its bug type.',
    code_snippet: `1  public class BufferAlloc {
2      public static void main(String[] args) {
3          int capacity = -5;
4          int[] buffer = new int[capacity];
5          System.out.println(buffer.length);
6      }
7  }`,
    buggy_line: 4,
    bug_type: 'Exception',
    explanation: 'Line 4 creates an array with negative capacity (-5), throwing a java.lang.NegativeArraySizeException at runtime.'
  },
  {
    challenge_code: 'JAVA-022',
    title: 'Improper Interface Method Implementation',
    description: 'Examine this interface implementation. Identify the buggy line and its bug type.',
    code_snippet: `1  interface Flyable {
2      void fly();
3  }
4  class Drone implements Flyable {
5      void fly() { System.out.println("Flying"); }
6  }`,
    buggy_line: 5,
    bug_type: 'OOP Error',
    explanation: 'Line 5 implements fly() with package-private access. All interface methods are implicitly public, so implementing methods must be declared public.'
  },
  {
    challenge_code: 'JAVA-023',
    title: 'Equals Method Parameter Type Mismatch',
    description: 'Examine this equals method implementation. Identify the buggy line and its bug type.',
    code_snippet: `1  public class Member {
2      private String id;
3      public boolean equals(Member other) {
4          return this.id.equals(other.id);
5      }
6  }`,
    buggy_line: 3,
    bug_type: 'OOP Error',
    explanation: 'Line 3 overloads instead of overrides Object.equals because the parameter is Member other instead of Object obj, failing when used in standard Java collections.'
  },
  {
    challenge_code: 'JAVA-024',
    title: 'Unreachable Statement After Return',
    description: 'Examine this helper method. Identify the buggy line and its bug type.',
    code_snippet: `1  public class CleanUp {
2      public static int compute() {
3          return 100;
4          System.out.println("Done");
5      }
6  }`,
    buggy_line: 4,
    bug_type: 'Compilation Error',
    explanation: 'Line 4 is an unreachable statement placed immediately after an unconditional return statement, resulting in a compilation error.'
  },
  {
    challenge_code: 'JAVA-025',
    title: 'Static Field Shadowing in Instance',
    description: 'Examine this user counter. Identify the buggy line and its bug type.',
    code_snippet: `1  public class UserAccount {
2      public static int count = 0;
3      public UserAccount() {
4          int count = count + 1;
5      }
6  }`,
    buggy_line: 4,
    bug_type: 'Logical Error',
    explanation: 'Line 4 declares a local variable int count that shadows the static class field count. The static counter is never incremented.'
  },
  {
    challenge_code: 'JAVA-026',
    title: 'Auto-Unboxing Null Pointer Exception',
    description: 'Examine this wrapper unboxing. Identify the buggy line and its bug type.',
    code_snippet: `1  public class Unboxer {
2      public static void main(String[] args) {
3          Integer boxed = null;
4          int unboxed = boxed;
5          System.out.println(unboxed);
6      }
7  }`,
    buggy_line: 4,
    bug_type: 'Exception',
    explanation: 'Line 4 implicitly invokes boxed.intValue() to convert Integer to primitive int. Since boxed is null, this throws a NullPointerException.'
  },
  {
    challenge_code: 'JAVA-027',
    title: 'String Substring Index Exceeded',
    description: 'Examine this string clipping logic. Identify the buggy line and its bug type.',
    code_snippet: `1  public class StringSlicer {
2      public static void main(String[] args) {
3          String code = "BUG";
4          String sub = code.substring(0, 5);
5          System.out.println(sub);
6      }
7  }`,
    buggy_line: 4,
    bug_type: 'Runtime Error',
    explanation: 'Line 4 specifies an endIndex of 5 for a string of length 3, throwing a StringIndexOutOfBoundsException at runtime.'
  },
  {
    challenge_code: 'JAVA-028',
    title: 'Invalid Semicolon on If Statement',
    description: 'Examine this conditional logic. Identify the buggy line and its bug type.',
    code_snippet: `1  public class Gatekeeper {
2      public static void main(String[] args) {
3          int score = 30;
4          if (score >= 50);
5          {
6              System.out.println("You Qualified!");
7          }
8      }
9  }`,
    buggy_line: 4,
    bug_type: 'Logical Error',
    explanation: 'Line 4 terminates the if statement with a semicolon (;), creating an empty statement. The block on line 5-7 executes unconditionally.'
  },
  {
    challenge_code: 'JAVA-029',
    title: 'Subclass Calling Super After Field Access',
    description: 'Examine this constructor chaining. Identify the buggy line and its bug type.',
    code_snippet: `1  class Person {
2      String name;
3      Person(String name) { this.name = name; }
4  }
5  class Student extends Person {
6      int id;
7      Student(String name, int id) {
8          this.id = id;
9          super(name);
10     }
11 }`,
    buggy_line: 9,
    bug_type: 'Compilation Error',
    explanation: 'Line 9 calls super(name) after this.id = id. In Java, a call to super() or this() must be the very first statement in a constructor.'
  },
  {
    challenge_code: 'JAVA-030',
    title: 'Loss of Precision with Compound Assignment Operator',
    description: 'Examine this short arithmetic operator. Identify the buggy line and its bug type.',
    code_snippet: `1  public class ShortMath {
2      public static void main(String[] args) {
3          short a = 32000;
4          short b = 1000;
5          short result = a + b;
6          System.out.println(result);
7      }
8  }`,
    buggy_line: 5,
    bug_type: 'Compilation Error',
    explanation: 'Line 5 adds two shorts. In Java, binary operations on short promote operands to int, returning an int that cannot be implicitly assigned to short without a cast.'
  },
  {
    challenge_code: 'JAVA-031',
    title: 'Catching Specific Exception After General Exception',
    description: 'Examine this exception handling structure. Identify the buggy line and its bug type.',
    code_snippet: `1  public class CatchOrder {
2      public static void main(String[] args) {
3          try {
4              int x = 10 / 0;
5          } catch (Exception e) {
6              System.out.println("General error");
7          } catch (ArithmeticException ae) {
8              System.out.println("Math error");
9          }
10     }
11 }`,
    buggy_line: 7,
    bug_type: 'Compilation Error',
    explanation: 'Line 7 defines catch (ArithmeticException ae) below catch (Exception e). Because Exception catches all exceptions, line 7 is unreachable code.'
  }
];
