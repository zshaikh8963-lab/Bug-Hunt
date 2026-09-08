/**
 * Round 1: Basic MCQ Question Bank
 * Total: 50 Questions (10 C, 10 C++, 10 Java, 10 Python, 10 HTML)
 * Scoring: 1 mark per question (+1 correct, 0 wrong/unanswered). No negative marking.
 */

export const r1Questions = [
  // ==========================================
  // C LANGUAGE (10 Questions)
  // ==========================================
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Division by Zero Bug',
    question_text: 'What runtime signal or error occurs when executing the following C code?',
    code_snippet: `#include <stdio.h>
int main() {
    int a = 10, b = 0;
    int c = a / b;
    printf("%d", c);
    return 0;
}`,
    options: [
      'Syntax error at compile time',
      'Floating Point Exception (SIGFPE) / CPU trap',
      'Segmentation Fault (SIGSEGV)',
      'Prints 0 without error'
    ],
    correct_option_index: 1,
    explanation: 'In C, dividing an integer by zero is undefined behavior and immediately triggers a SIGFPE (Floating Point Exception) trap at runtime.'
  },
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Unchecked Pointer Dereference',
    question_text: 'What is the consequence of dereferencing ptr in this snippet?',
    code_snippet: `#include <stdio.h>
int main() {
    int *ptr = NULL;
    *ptr = 42;
    printf("%d", *ptr);
    return 0;
}`,
    options: [
      'Compilation error: NULL cannot be assigned to pointer',
      'Segmentation fault (SIGSEGV) due to dereferencing NULL address',
      'Prints 42 without any issue',
      'Stack overflow exception'
    ],
    correct_option_index: 1,
    explanation: 'Dereferencing a NULL pointer attempts to write to memory address 0x0, which is protected by the operating system, triggering a Segmentation Fault (SIGSEGV).'
  },
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Format Specifier Mismatch',
    question_text: 'What is the bug in the printf function below?',
    code_snippet: `#include <stdio.h>
int main() {
    double pi = 3.14159;
    printf("Pi: %d\\n", pi);
    return 0;
}`,
    options: [
      '%d expects an int, but pi is a double (causing undefined output or corrupted data)',
      'double cannot be passed to printf',
      'Variable pi must be declared as float',
      'Syntax error: missing casting in printf'
    ],
    correct_option_index: 0,
    explanation: 'Using %d for a double is a type format mismatch; printf will interpret double IEEE 754 bit patterns as an integer, producing garbage values.'
  },
  {
    language: 'C',
    difficulty: 'Medium',
    title: 'Off-By-One Array Bound',
    question_text: 'What issue is present in this array loop?',
    code_snippet: `#include <stdio.h>
int main() {
    int arr[5] = {1, 2, 3, 4, 5};
    for (int i = 0; i <= 5; i++) {
        printf("%d ", arr[i]);
    }
    return 0;
}`,
    options: [
      'Array indices must start at 1 in C',
      'Off-by-one buffer over-read accessing arr[5] which is out of bounds',
      'printf syntax error inside for loop',
      'Variable i is not initialized properly'
    ],
    correct_option_index: 1,
    explanation: 'An array of size 5 has valid indices 0 through 4. The condition i <= 5 attempts to read arr[5], which accesses unallocated stack memory (undefined behavior).'
  },
  {
    language: 'C',
    difficulty: 'Medium',
    title: 'Missing String Terminator',
    question_text: 'Why does printing str result in garbage characters or buffer overflow?',
    code_snippet: `#include <stdio.h>
int main() {
    char str[4] = {'H', 'E', 'L', 'P'};
    printf("%s\\n", str);
    return 0;
}`,
    options: [
      'The array lacks the null terminator \\0 required for C strings',
      'printf %s only accepts dynamic pointers',
      'Single quotes cannot be used for characters in C',
      'The array size is too large for the string'
    ],
    correct_option_index: 0,
    explanation: 'C strings are null-terminated. Since str is size 4 with 4 non-null characters, %s continues reading past the array boundary until it finds a random zero byte in memory.'
  },
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Assignment inside If Condition',
    question_text: 'What logical error is occurring in the if statement?',
    code_snippet: `#include <stdio.h>
int main() {
    int role = 0;
    if (role = 1) {
        printf("Access Granted\\n");
    }
    return 0;
}`,
    options: [
      'Assignment operator = is used instead of equality comparison ==',
      'role cannot be compared to an integer',
      'if conditions in C must return a boolean type',
      'Syntax error: missing semicolon'
    ],
    correct_option_index: 0,
    explanation: 'role = 1 assigns 1 to role and evaluates to 1 (true). Thus "Access Granted" is always printed regardless of previous role value.'
  },
  {
    language: 'C',
    difficulty: 'Medium',
    title: 'Returning Address of Local Variable',
    question_text: 'What danger exists in the getNumber() function?',
    code_snippet: `#include <stdio.h>
int* getNumber() {
    int val = 100;
    return &val;
}
int main() {
    int *p = getNumber();
    printf("%d", *p);
    return 0;
}`,
    options: [
      'val cannot be returned as a pointer',
      'Dangling pointer: returns address of a stack-allocated variable that goes out of scope',
      'Compiler will automatically promote val to heap memory',
      'printf cannot print dereferenced pointer'
    ],
    correct_option_index: 1,
    explanation: 'Local variable val is allocated on the stack. When getNumber() returns, that stack frame is invalidated, leaving p pointing to deallocated memory.'
  },
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Scanf Missing Address-of Operator',
    question_text: 'What is the bug when reading an integer with scanf?',
    code_snippet: `#include <stdio.h>
int main() {
    int num;
    printf("Enter number: ");
    scanf("%d", num);
    return 0;
}`,
    options: [
      'scanf must use %i for integers',
      'Missing address-of operator & (should be &num), causing undefined memory write',
      'printf cannot precede scanf',
      'num must be initialized to 0'
    ],
    correct_option_index: 1,
    explanation: 'scanf expects a memory address where it can store the input. Passing uninitialized num passes garbage as an address, causing a segmentation fault.'
  },
  {
    language: 'C',
    difficulty: 'Medium',
    title: 'Memory Leak Detection',
    question_text: 'What resource bug occurs in this dynamic memory allocation code?',
    code_snippet: `#include <stdio.h>
#include <stdlib.h>
void process() {
    int *buf = (int*)malloc(1024 * sizeof(int));
    buf[0] = 1;
}
int main() {
    for (int i = 0; i < 1000; i++) process();
    return 0;
}`,
    options: [
      'Buffer underflow in buf[0]',
      'Memory leak because free(buf) is never called before process() returns',
      'malloc cannot be called in a loop',
      'sizeof(int) is not standard across architectures'
    ],
    correct_option_index: 1,
    explanation: 'Every call to process() allocates memory on the heap with malloc but never deallocates it with free(), leaking 4MB of heap memory.'
  },
  {
    language: 'C',
    difficulty: 'Hard',
    title: 'String Literal Modification',
    question_text: 'What happens when executing line 3 in this code?',
    code_snippet: `#include <stdio.h>
int main() {
    char *str = "BugHunt";
    str[0] = 'b';
    printf("%s", str);
    return 0;
}`,
    options: [
      'Prints "bugHunt" successfully',
      'Bus error / Segmentation fault because string literals are stored in read-only memory',
      'Compilation error at str[0]',
      'str is converted to const char*'
    ],
    correct_option_index: 1,
    explanation: 'In C, string literals like "BugHunt" reside in read-only data segments (.rodata). Attempting to modify str[0] causes a memory protection violation.'
  },

  // ==========================================
  // C++ LANGUAGE (10 Questions)
  // ==========================================
  {
    language: 'C++',
    difficulty: 'Easy',
    title: 'Missing Semicolon After Class Definition',
    question_text: 'What compilation error occurs in this C++ class snippet?',
    code_snippet: `#include <iostream>
class BugHunt {
    public:
        void run() { std::cout << "Hunt!"; }
}
int main() {
    BugHunt b;
    b.run();
    return 0;
}`,
    options: [
      'Missing semicolon ; after the closing curly brace of the class definition',
      'public modifier is invalid in C++',
      'std::cout cannot be called inside a method',
      'BugHunt b requires new keyword'
    ],
    correct_option_index: 0,
    explanation: 'In C++, class and struct definitions must terminate with a semicolon after the closing brace (e.g., class BugHunt { ... };).'
  },
  {
    language: 'C++',
    difficulty: 'Medium',
    title: 'Vector Iterator Invalidation',
    question_text: 'Why does this code cause undefined behavior or crash?',
    code_snippet: `#include <iostream>
#include <vector>
int main() {
    std::vector<int> v = {1, 2, 3, 4};
    for (auto it = v.begin(); it != v.end(); ++it) {
        if (*it == 2) v.push_back(10);
    }
    return 0;
}`,
    options: [
      'Iterator invalidation: modifying vector size while iterating can reallocate memory',
      'push_back cannot be called inside a loop',
      'auto keyword is not allowed for iterators',
      'vector cannot store integer literals'
    ],
    correct_option_index: 0,
    explanation: 'Calling push_back may trigger reallocation of the vector’s internal storage, invalidating existing iterators and causing dangling pointers.'
  },
  {
    language: 'C++',
    difficulty: 'Easy',
    title: 'Deleting Array Pointer with delete',
    question_text: 'What is the correct way to deallocate arr in C++?',
    code_snippet: `#include <iostream>
int main() {
    int *arr = new int[50];
    delete arr;
    return 0;
}`,
    options: [
      'delete[] arr must be used for memory allocated with new[]',
      'free(arr) must be used',
      'delete arr[50]',
      'Array pointers cannot be deallocated in C++'
    ],
    correct_option_index: 0,
    explanation: 'When allocating an array using new[], it must be freed using delete[] arr. Using single delete causes undefined behavior and fails to call destructors.'
  },
  {
    language: 'C++',
    difficulty: 'Medium',
    title: 'Virtual Destructor Omission in Base Class',
    question_text: 'What problem arises when deleting Derived via a Base pointer?',
    code_snippet: `class Base {
public:
    ~Base() {}
};
class Derived : public Base {
public:
    int *data = new int[100];
    ~Derived() { delete[] data; }
};
int main() {
    Base *b = new Derived();
    delete b;
}`,
    options: [
      'Compilation error: cannot cast Derived* to Base*',
      'Resource leak: Base destructor is not virtual, so Derived destructor is never invoked',
      'delete b causes infinite recursion',
      'Derived cannot inherit public members'
    ],
    correct_option_index: 1,
    explanation: 'Without a virtual destructor in Base, calling delete b on a Base pointer executes only ~Base(), leaking memory allocated in Derived.'
  },
  {
    language: 'C++',
    difficulty: 'Easy',
    title: 'Pass-By-Value Modification Pitfall',
    question_text: 'Why does x remain 10 after calling increment(x)?',
    code_snippet: `#include <iostream>
void increment(int val) {
    val++;
}
int main() {
    int x = 10;
    increment(x);
    std::cout << x;
    return 0;
}`,
    options: [
      'val is passed by value (a copy), leaving original x unchanged',
      'val++ is invalid in C++',
      'x must be a global variable',
      'increment function must return void*'
    ],
    correct_option_index: 0,
    explanation: 'The parameter val is passed by value. Modifications apply only to the local copy. To modify x, it must be passed by reference (int &val) or pointer.'
  },
  {
    language: 'C++',
    difficulty: 'Medium',
    title: 'Uninitialized Reference Variable',
    question_text: 'What compile error is generated by this C++ code?',
    code_snippet: `#include <iostream>
int main() {
    int &ref;
    int a = 20;
    ref = a;
    std::cout << ref;
    return 0;
}`,
    options: [
      'error: ‘ref’ declared as reference but not initialized',
      'ref must be declared as a pointer',
      'Cannot assign int to reference',
      'cout cannot display references'
    ],
    correct_option_index: 0,
    explanation: 'In C++, references must be bound to an object upon declaration. Declaring an uninitialized reference (int &ref;) is illegal syntax.'
  },
  {
    language: 'C++',
    difficulty: 'Easy',
    title: 'Namespace Resolution Missing',
    question_text: 'Why does this code fail to compile?',
    code_snippet: `#include <iostream>
int main() {
    cout << "Welcome to Bug Hunt!" << endl;
    return 0;
}`,
    options: [
      'cout and endl are undeclared identifiers (missing std:: prefix or using namespace std;)',
      '#include <iostream> is deprecated',
      'Strings must be in single quotes',
      'main cannot return 0'
    ],
    correct_option_index: 0,
    explanation: 'Standard library components reside in the std namespace. Without std:: or using namespace std;, the compiler does not recognize cout or endl.'
  },
  {
    language: 'C++',
    difficulty: 'Medium',
    title: 'Double Free Error',
    question_text: 'What error occurs when executing this block?',
    code_snippet: `#include <iostream>
int main() {
    int *ptr = new int(10);
    delete ptr;
    delete ptr;
    return 0;
}`,
    options: [
      'Double free corruption at runtime',
      'Compiler warning only; runtime ignores it',
      'ptr becomes NULL automatically after first delete',
      'Prints 0'
    ],
    correct_option_index: 0,
    explanation: 'Calling delete on an already freed pointer causes a "double free or corruption" runtime abort, compromising heap metadata.'
  },
  {
    language: 'C++',
    difficulty: 'Hard',
    title: 'Narrowing Conversion in Uniform Initialization',
    question_text: 'What compilation issue occurs in C++11 uniform initialization?',
    code_snippet: `int main() {
    double d = 3.14;
    int x{d};
    return 0;
}`,
    options: [
      'Error: narrowing conversion of ‘d’ from ‘double’ to ‘int’ inside { }',
      'Uniform initialization only works on arrays',
      'x becomes 0',
      'Code compiles with silent truncation'
    ],
    correct_option_index: 0,
    explanation: 'C++11 brace-initialization {} forbids narrowing conversions (like double to int) that lead to loss of precision, throwing a compile error.'
  },
  {
    language: 'C++',
    difficulty: 'Medium',
    title: 'Map Indexing Auto-Insertion Bug',
    question_text: 'What subtle bug occurs when accessing a missing key with []?',
    code_snippet: `#include <iostream>
#include <map>
int main() {
    std::map<std::string, int> scores;
    std::cout << scores["TeamX"] << "\\n";
    std::cout << scores.size();
    return 0;
}`,
    options: [
      'scores["TeamX"] inserts a default-initialized entry (0), modifying map size to 1',
      'Throws std::out_of_range exception',
      'Segmentation fault because "TeamX" is not present',
      'Prints nothing and size remains 0'
    ],
    correct_option_index: 0,
    explanation: 'std::map::operator[] automatically inserts a default key-value pair if the key does not exist. Use map::find or map::at to avoid unintentional insertion.'
  },

  // ==========================================
  // JAVA LANGUAGE (10 Questions)
  // ==========================================
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'String Comparison with == vs .equals()',
    question_text: 'Why does this Java code print "NOT EQUAL"?',
    code_snippet: `public class Main {
    public static void main(String[] args) {
        String s1 = new String("BugHunt");
        String s2 = new String("BugHunt");
        if (s1 == s2) {
            System.out.println("EQUAL");
        } else {
            System.out.println("NOT EQUAL");
        }
    }
}`,
    options: [
      '== compares memory reference addresses, not the text contents of the strings',
      'String objects cannot be initialized with new in Java',
      'Java strings are case-insensitive',
      's1 and s2 have different hash codes'
    ],
    correct_option_index: 0,
    explanation: 'In Java, == on objects tests reference identity. Both strings were created with new, so they point to distinct heap objects. Use s1.equals(s2) for value comparison.'
  },
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'NullPointerException on Method Invocation',
    question_text: 'What exception is thrown when running this program?',
    code_snippet: `public class Test {
    public static void main(String[] args) {
        String message = null;
        System.out.println(message.length());
    }
}`,
    options: [
      'NullPointerException',
      'StringIndexOutOfBoundsException',
      'IllegalArgumentException',
      'Compilation Error: null cannot have methods'
    ],
    correct_option_index: 0,
    explanation: 'Invoking an instance method on a variable that references null throws a java.lang.NullPointerException at runtime.'
  },
  {
    language: 'Java',
    difficulty: 'Medium',
    title: 'Static Method Cannot Access Non-Static Variable',
    question_text: 'What compilation error is generated by this class?',
    code_snippet: `public class Scoreboard {
    int currentScore = 50;
    public static void printScore() {
        System.out.println(currentScore);
    }
}`,
    options: [
      'non-static variable currentScore cannot be referenced from a static context',
      'printScore method must return int',
      'currentScore must be declared as private',
      'System.out.println cannot print integers in static methods'
    ],
    correct_option_index: 0,
    explanation: 'Static methods belong to the class and exist without an object instance, so they cannot directly access instance fields without creating an object.'
  },
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'Array Index Out of Bounds',
    question_text: 'What exception will be raised by numbers[3]?',
    code_snippet: `public class ArrayTest {
    public static void main(String[] args) {
        int[] numbers = {10, 20, 30};
        int val = numbers[3];
        System.out.println(val);
    }
}`,
    options: [
      'ArrayIndexOutOfBoundsException',
      'NoSuchElementException',
      'IndexOutOfBoundsException: list empty',
      'NullPointerException'
    ],
    correct_option_index: 0,
    explanation: 'The array length is 3, with indices 0, 1, and 2. Accessing index 3 triggers an ArrayIndexOutOfBoundsException.'
  },
  {
    language: 'Java',
    difficulty: 'Medium',
    title: 'Infinite Recursion StackOverflowError',
    question_text: 'What error occurs when factorial(-1) is evaluated?',
    code_snippet: `public class MathUtil {
    public static int factorial(int n) {
        if (n == 0) return 1;
        return n * factorial(n - 1);
    }
}`,
    options: [
      'StackOverflowError due to infinite recursive descent without base case for n < 0',
      'Returns -1',
      'ArithmeticException',
      'IllegalArgumentException'
    ],
    correct_option_index: 0,
    explanation: 'When n < 0, n will never equal 0. The function keeps calling factorial(-2), factorial(-3), etc., consuming stack frames until java.lang.StackOverflowError.'
  },
  {
    language: 'Java',
    difficulty: 'Medium',
    title: 'ConcurrentModificationException in For-Each',
    question_text: 'Why does this code throw ConcurrentModificationException?',
    code_snippet: `import java.util.*;
public class ListTest {
    public static void main(String[] args) {
        List<String> list = new ArrayList<>(Arrays.asList("A", "B", "C"));
        for (String item : list) {
            if (item.equals("B")) list.remove(item);
        }
    }
}`,
    options: [
      'Modifying a collection directly while iterating over it with an enhanced for-loop violates iterator contracts',
      'list.remove() only accepts index integers',
      'ArrayList cannot contain strings in a for loop',
      'item cannot be evaluated with .equals()'
    ],
    correct_option_index: 0,
    explanation: 'The enhanced for loop uses an Iterator internally. Calling list.remove() directly alters the modCount without notifying the iterator, triggering ConcurrentModificationException.'
  },
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'Unreachable Catch Block',
    question_text: 'What compilation error occurs in this try-catch structure?',
    code_snippet: `public class ExceptionDemo {
    public static void main(String[] args) {
        try {
            int x = 10 / 0;
        } catch (Exception e) {
            System.out.println("Exception");
        } catch (ArithmeticException e) {
            System.out.println("Arithmetic");
        }
    }
}`,
    options: [
      'error: exception ArithmeticException has already been caught',
      'try block must contain a finally statement',
      'ArithmeticException cannot be caught',
      '10 / 0 is evaluated at compile time'
    ],
    correct_option_index: 0,
    explanation: 'Subclasses must precede superclasses in catch blocks. Since Exception catches all exceptions, the ArithmeticException block below it is unreachable.'
  },
  {
    language: 'Java',
    difficulty: 'Medium',
    title: 'Integer Caching Trap',
    question_text: 'What does this comparison evaluate to in Java?',
    code_snippet: `public class CacheTest {
    public static void main(String[] args) {
        Integer a = 128;
        Integer b = 128;
        System.out.println(a == b);
    }
}`,
    options: [
      'false (values outside the -128 to 127 Integer cache range create new object instances)',
      'true (Integer auto-interns all numbers)',
      'Compile-time error',
      'NullPointerException'
    ],
    correct_option_index: 0,
    explanation: 'Java caches Integer objects between -128 and 127. Values outside this range (like 128) result in distinct boxed object allocations, making == false.'
  },
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'Missing Break in Switch Statement',
    question_text: 'What output is printed when day = 2?',
    code_snippet: `public class SwitchBug {
    public static void main(String[] args) {
        int day = 2;
        switch (day) {
            case 1: System.out.print("Mon ");
            case 2: System.out.print("Tue ");
            case 3: System.out.print("Wed ");
            default: System.out.print("End");
        }
    }
}`,
    options: [
      'Tue Wed End (fall-through occurs due to missing break statements)',
      'Tue',
      'Mon Tue Wed End',
      'Compilation error: switch requires break'
    ],
    correct_option_index: 0,
    explanation: 'Without break statements, switch execution falls through to all subsequent cases and the default block once a match is found.'
  },
  {
    language: 'Java',
    difficulty: 'Hard',
    title: 'Thread Safety in Non-Synchronized Counter',
    question_text: 'What concurrency bug exists in this Counter class?',
    code_snippet: `public class Counter {
    private int count = 0;
    public void increment() {
        count++;
    }
    public int getCount() { return count; }
}`,
    options: [
      'Race condition: count++ is a non-atomic read-modify-write operation susceptible to lost updates across multiple threads',
      'count cannot be private in multi-threaded programs',
      'increment method must return int',
      'Deadlock will occur on the first call'
    ],
    correct_option_index: 0,
    explanation: 'count++ expands to three bytecode instructions: read, increment, write. Concurrent access without synchronization or AtomicInteger results in lost updates.'
  },

  // ==========================================
  // PYTHON LANGUAGE (10 Questions)
  // ==========================================
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'Mutable Default Argument Trap',
    question_text: 'What unexpected output is produced by the two function calls?',
    code_snippet: `def append_val(x, lst=[]):
    lst.append(x)
    return lst

print(append_val(1))
print(append_val(2))`,
    options: [
      '[1] then [1, 2] because default argument lst is evaluated only once at definition time',
      '[1] then [2]',
      'TypeError: default argument cannot be a list',
      '[[1], [2]]'
    ],
    correct_option_index: 0,
    explanation: 'In Python, default arguments are evaluated once when the function is defined. The same list instance is reused across successive calls.'
  },
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'IndentationError in Block',
    question_text: 'What syntax error occurs when running this code?',
    code_snippet: `def check(val):
if val > 0:
    print("Positive")`,
    options: [
      'IndentationError: expected an indented block after function definition',
      'SyntaxError: missing colon after check(val)',
      'TypeError: val cannot be compared to 0',
      'Prints "Positive"'
    ],
    correct_option_index: 0,
    explanation: 'Python enforces strict whitespace indentation for code blocks. An unindented line immediately following def triggers an IndentationError.'
  },
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'KeyError in Dictionary Access',
    question_text: 'What exception is raised when accessing user["age"]?',
    code_snippet: `user = {"name": "Alice", "role": "Hacker"}
print(user["age"])`,
    options: [
      'KeyError: "age"',
      'IndexError: key not in dictionary',
      'None',
      'AttributeError: dict has no attribute age'
    ],
    correct_option_index: 0,
    explanation: 'Direct indexing on a dictionary (dict[key]) raises a KeyError if the key does not exist. Use dict.get("age", default) for safe access.'
  },
  {
    language: 'Python',
    difficulty: 'Medium',
    title: 'Variable Scope UnboundLocalError',
    question_text: 'Why does this function raise an UnboundLocalError?',
    code_snippet: `x = 10
def modify():
    print(x)
    x = 20

modify()`,
    options: [
      'x is treated as a local variable because it is assigned inside the function, but used before assignment',
      'x cannot be defined globally',
      'print cannot access variables inside a function',
      'modify() requires parameter x'
    ],
    correct_option_index: 0,
    explanation: 'Any variable assigned within a function scope is bound locally. Referencing x before its local assignment triggers UnboundLocalError unless declared global x.'
  },
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'TypeError in String Concatenation',
    question_text: 'What exception is raised by the print statement?',
    code_snippet: `score = 95
print("Your total score is: " + score)`,
    options: [
      'TypeError: can only concatenate str (not "int") to str',
      'ValueError: invalid literal for concatenation',
      'Prints "Your total score is: 95"',
      'SyntaxError: + operator invalid in print'
    ],
    correct_option_index: 0,
    explanation: 'In Python, the + operator cannot concatenate a string and an integer implicitly. It requires str(score) or an f-string.'
  },
  {
    language: 'Python',
    difficulty: 'Medium',
    title: 'Modifying List While Iterating',
    question_text: 'What happens when elements are removed during iteration?',
    code_snippet: `nums = [1, 2, 2, 3]
for n in nums:
    if n == 2:
        nums.remove(n)
print(nums)`,
    options: [
      '[1, 2, 3] because removing shifts indices and causes the second 2 to be skipped',
      '[1, 3]',
      'IndexError: list index out of range',
      '[]'
    ],
    correct_option_index: 0,
    explanation: 'When nums.remove(2) removes the first 2, the remaining items shift left. The loop iterator advances to the next index, skipping the second 2.'
  },
  {
    language: 'Python',
    difficulty: 'Medium',
    title: 'Shallow Copy Mutation Bug',
    question_text: 'Why is list2[0][0] modified when list1[0][0] is changed?',
    code_snippet: `list1 = [[1, 2], [3, 4]]
list2 = list1.copy()
list1[0][0] = 99
print(list2[0][0])`,
    options: [
      'list.copy() creates a shallow copy; inner nested lists still reference the exact same memory',
      'list1 and list2 are completely independent',
      'SyntaxError on list1.copy()',
      'Prints 1'
    ],
    correct_option_index: 0,
    explanation: 'Shallow copies duplicate the outer list container but preserve references to inner mutable objects. Use copy.deepcopy() for full independence.'
  },
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'Tuple Immutability TypeError',
    question_text: 'What exception is thrown when attempting to reassign a tuple element?',
    code_snippet: `coords = (10, 20)
coords[0] = 15`,
    options: [
      'TypeError: "tuple" object does not support item assignment',
      'ValueError: tuple index is locked',
      'AttributeError: tuple has no setter',
      'IndexError: tuple out of range'
    ],
    correct_option_index: 0,
    explanation: 'Tuples in Python are immutable data structures. Once created, elements cannot be modified, added, or removed.'
  },
  {
    language: 'Python',
    difficulty: 'Medium',
    title: 'Late Binding Closures in Loops',
    question_text: 'What does [f() for f in funcs] output?',
    code_snippet: `funcs = [lambda: i for i in range(3)]
print([f() for f in funcs])`,
    options: [
      '[2, 2, 2] due to late binding of the loop variable i in Python closures',
      '[0, 1, 2]',
      '[0, 0, 0]',
      'TypeError: lambda takes no arguments'
    ],
    correct_option_index: 0,
    explanation: 'Python closures look up the variable i when called, not when defined. When the loop completes, i equals 2, so all lambdas return 2.'
  },
  {
    language: 'Python',
    difficulty: 'Hard',
    title: 'Exception Chaining with Bare Raise',
    question_text: 'What happens when raise is called inside an except block without an active exception?',
    code_snippet: `try:
    print("Clean")
except Exception:
    raise
raise`,
    options: [
      'RuntimeError: No active exception to reraise',
      'Passes silently',
      'Throws SystemExit',
      'SyntaxError'
    ],
    correct_option_index: 0,
    explanation: 'A bare raise statement outside of an active except block raises a RuntimeError ("No active exception to reraise").'
  },

  // ==========================================
  // HTML / WEB BASICS (10 Questions)
  // ==========================================
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Duplicate ID Attribute Violation',
    question_text: 'Why is having duplicate id="submit-btn" attributes problematic in HTML?',
    code_snippet: `<button id="submit-btn">Save</button>
<button id="submit-btn">Cancel</button>`,
    options: [
      'HTML specification requires IDs to be unique within a document; duplicate IDs break document.getElementById()',
      'Browsers will refuse to render the second button',
      'Both buttons will automatically be disabled',
      'Causes a CSS syntax error'
    ],
    correct_option_index: 0,
    explanation: 'The id attribute must be document-unique. document.getElementById() returns only the first matching element, leading to unpredictable DOM lookups.'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Unclosed Image Tag Pitfall in XHTML/JSX',
    question_text: 'What is the correct syntax for an image tag in modern HTML5 and JSX?',
    code_snippet: `<!-- Broken in strict XML/JSX -->
<img src="logo.png" alt="Logo">`,
    options: [
      'In strict environments like JSX/XHTML, void elements like <img> must self-close: <img src="logo.png" alt="Logo" />',
      '<img> requires an ending </img> closing tag',
      'alt attribute is forbidden',
      'src must be uppercase'
    ],
    correct_option_index: 0,
    explanation: 'While HTML5 permits unclosed void tags, strict XML, XHTML, and JSX require self-closing syntax (<img ... />) to avoid parser errors.'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Missing Form Input Name Attribute',
    question_text: 'Why is the username field missing from form submissions?',
    code_snippet: `<form action="/login" method="POST">
    <input type="text" id="username" placeholder="Username">
    <button type="submit">Login</button>
</form>`,
    options: [
      'Inputs must have a name attribute (e.g. name="username") to be included in HTTP request payloads',
      'input must have a value attribute',
      'type="text" is not supported in POST forms',
      'button type should be "button"'
    ],
    correct_option_index: 0,
    explanation: 'HTML form submission serializes form controls based on their name attributes. Inputs without a name are ignored during submission.'
  },
  {
    language: 'HTML',
    difficulty: 'Medium',
    title: 'Anchor Tag Void Href Page Reload Trap',
    question_text: 'Why does clicking this JavaScript link cause the page to scroll to top or reload?',
    code_snippet: `<a href="#" onclick="openModal()">Open Details</a>`,
    options: [
      'href="#" jumps to the top of the viewport unless event.preventDefault() is called',
      'onclick cannot call custom functions',
      'a tags cannot contain href and onclick together',
      'openModal() must return false directly in HTML'
    ],
    correct_option_index: 0,
    explanation: 'An anchor tag with href="#" navigates to the empty fragment identifier, jumping to the top of the document. Use type="button" or preventDefault().'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Script Tag Execution Blocking',
    question_text: 'Why does document.getElementById("title") return null in this snippet?',
    code_snippet: `<!DOCTYPE html>
<html>
<head>
    <script>
        document.getElementById("title").innerText = "Bug Hunt";
    </script>
</head>
<body>
    <h1 id="title">Loading...</h1>
</body>
</html>`,
    options: [
      'The script executes in <head> before the <body> has parsed, so the #title element does not yet exist in the DOM',
      'innerText is not supported in modern browsers',
      'h1 elements cannot have IDs',
      'Script tags are forbidden in <head>'
    ],
    correct_option_index: 0,
    explanation: 'Synchronous scripts in the <head> run immediately before the DOM tree below is constructed. Use defer, async, or place scripts before </body>.'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Form Submission Default Reload',
    question_text: 'What default browser behavior must be prevented when handling AJAX forms in JavaScript?',
    code_snippet: `<form id="contest-form">
    <input name="team" value="Alpha">
    <button type="submit">Submit</button>
</form>`,
    options: [
      'Calling event.preventDefault() to prevent the browser from reloading the page with a standard HTTP GET/POST',
      'Forms automatically delete input values',
      'Browsers always block form submission without action attribute',
      'button cannot have type="submit"'
    ],
    correct_option_index: 0,
    explanation: 'By default, submitting an HTML form initiates a browser page navigation. Modern single-page apps use event.preventDefault() to handle submission asynchronously.'
  },
  {
    language: 'HTML',
    difficulty: 'Medium',
    title: 'Cross-Site Scripting (XSS) via innerHTML',
    question_text: 'What security vulnerability is introduced by line 2?',
    code_snippet: `const userComment = "<img src=x onerror=alert(1)>";
document.getElementById("output").innerHTML = userComment;`,
    options: [
      'Cross-Site Scripting (XSS) vulnerability allowing arbitrary JavaScript execution',
      'Syntax error in string assignment',
      'Browser blocks innerHTML automatically',
      'image tags cannot have onerror in HTML'
    ],
    correct_option_index: 0,
    explanation: 'Directly assigning untrusted user input to innerHTML executes embedded scripts and onerror handlers, causing stored or reflected Cross-Site Scripting (XSS).'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Label For Attribute Mismatch',
    question_text: 'What attribute on <input> must match the label\'s for attribute to enable accessibility clicking?',
    code_snippet: `<label for="agree-terms">I accept the competition rules</label>
<input type="checkbox" name="agree-terms">`,
    options: [
      'The <input> must have id="agree-terms"',
      'The <input> must have class="agree-terms"',
      'The <label> must use name="agree-terms"',
      'HTML does not support clickable labels'
    ],
    correct_option_index: 0,
    explanation: 'A label’s for attribute connects to an input element via its unique id attribute, enabling screen readers and click-to-focus functionality.'
  },
  {
    language: 'HTML',
    difficulty: 'Medium',
    title: 'Table Structural Syntax Hierarchy',
    question_text: 'What structural element is missing or misplaced in this HTML table?',
    code_snippet: `<table>
    <td>Team Alpha</td>
    <td>45 Marks</td>
</table>`,
    options: [
      '<td> elements must be enclosed inside a table row <tr>',
      '<table> must have a border attribute',
      '<td> can only contain plain numbers',
      '<table> requires exactly 3 columns'
    ],
    correct_option_index: 0,
    explanation: 'In HTML, table data cells <td> and header cells <th> must be direct children of a table row <tr> (or <thead>/<tbody>/<tfoot> wrapping <tr>).'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Meta Viewport Missing for Responsive Layouts',
    question_text: 'What is the purpose of the following <meta> tag in modern web development?',
    code_snippet: `<meta name="viewport" content="width=device-width, initial-scale=1.0">`,
    options: [
      'Configures the browser viewport to match device width for responsive scaling on mobile and tablets',
      'Enables high-definition 4K monitor graphics',
      'Prevents users from zooming in on the page',
      'Forces the page to load in dark mode'
    ],
    correct_option_index: 0,
    explanation: 'The meta viewport tag instructs mobile browsers to render the page at the physical device width at 1:1 scale, rather than rendering a zoomed-out 980px desktop view.'
  }
];
