/**
 * BUG HUNT 2K26 — Official Round 1: Basic MCQ Question Bank
 * Total: 25 Official Organizer Questions
 * Topics: C, C++, Java, Python, HTML
 * Each team receives 10 random questions from this 25-question bank (1 mark each = 10 marks total).
 */

export const r1Questions = [
  // Q1
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Memory Address Operator',
    question_text: 'In C, which operator is used to get the memory address of a variable?',
    code_snippet: '',
    options: ['*', '&', '%', '#'],
    correct_option_index: 1, // B (&)
    explanation: 'The address-of operator (&) returns the memory address of its operand.'
  },
  // Q2
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'Function Definition Keyword',
    question_text: 'Which keyword is used to define a function in Python?',
    code_snippet: '',
    options: ['function', 'define', 'def', 'func'],
    correct_option_index: 2, // C (def)
    explanation: 'def is the keyword used to define user-created functions in Python.'
  },
  // Q3
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'Object Instantiation Keyword',
    question_text: 'Which keyword is used to create an object in Java?',
    code_snippet: '',
    options: ['class', 'object', 'new', 'create'],
    correct_option_index: 2, // C (new)
    explanation: 'The new operator dynamically allocates memory for an object and calls its constructor.'
  },
  // Q4
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Largest Heading Tag',
    question_text: 'Which HTML tag is used for the largest heading?',
    code_snippet: '',
    options: ['<head>', '<h6>', '<heading>', '<h1>'],
    correct_option_index: 3, // D (<h1>)
    explanation: '<h1> defines the highest-level and visually largest heading in HTML.'
  },
  // Q5
  {
    language: 'C++',
    difficulty: 'Moderate',
    title: 'Inheritance Concept',
    question_text: 'Which feature allows a C++ class to acquire properties of another class?',
    code_snippet: '',
    options: ['Encapsulation', 'Inheritance', 'Abstraction', 'Compilation'],
    correct_option_index: 1, // B (Inheritance)
    explanation: 'Inheritance allows a derived class to acquire the data members and member functions of a base class.'
  },
  // Q6
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'Key-Value Data Structure',
    question_text: 'Which Python data type stores key-value pairs?',
    code_snippet: '',
    options: ['List', 'Tuple', 'Dictionary', 'Set'],
    correct_option_index: 2, // C (Dictionary)
    explanation: 'Dictionaries (dict) store data values in key:value pairs.'
  },
  // Q7
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Hyperlink Tag',
    question_text: 'Which HTML tag creates a hyperlink?',
    code_snippet: '',
    options: ['<link>', '<a>', '<href>', '<url>'],
    correct_option_index: 1, // B (<a>)
    explanation: 'The <a> (anchor) tag defines a hyperlink linking one page to another.'
  },
  // Q8
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'Primitive Data Type',
    question_text: 'Which of the following is a primitive data type in Java?',
    code_snippet: '',
    options: ['String', 'Integer', 'int', 'Array'],
    correct_option_index: 2, // C (int)
    explanation: 'int is one of the 8 built-in primitive data types in Java. String, Integer, and Array are reference/wrapper types.'
  },
  // Q9
  {
    language: 'C',
    difficulty: 'Moderate',
    title: 'Integer Division Output',
    question_text: 'What is the output of 5 / 2 in C when both operands are integers?',
    code_snippet: '',
    options: ['2', '2.5', '3', '1'],
    correct_option_index: 0, // A (2)
    explanation: 'In C, integer division truncates the decimal part, resulting in integer 2.'
  },
  // Q10
  {
    language: 'Python',
    difficulty: 'Moderate',
    title: 'Negative Indexing',
    question_text: 'What is the output of Python code: a=[10,20,30]; print(a[-1])?',
    code_snippet: 'a = [10, 20, 30]\nprint(a[-1])',
    options: ['10', '20', '30', 'Error'],
    correct_option_index: 2, // C (30)
    explanation: 'Negative indexing in Python accesses elements from the end: a[-1] is the last item (30).'
  },
  // Q11
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'Decision-Making Statement',
    question_text: 'Which statement is used for decision-making in Java?',
    code_snippet: '',
    options: ['if', 'check', 'decide', 'when'],
    correct_option_index: 0, // A (if)
    explanation: 'The if statement (along with switch) is used for conditional branching and decision-making in Java.'
  },
  // Q12
  {
    language: 'C++',
    difficulty: 'Moderate',
    title: 'Post-Increment Output',
    question_text: 'What is the output of: int x=5; cout << x++; in C++?',
    code_snippet: 'int x = 5;\ncout << x++;',
    options: ['4', '5', '6', 'Error'],
    correct_option_index: 1, // B (5)
    explanation: 'Post-increment (x++) passes the current value (5) to the output stream before incrementing x to 6.'
  },
  // Q13
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Image Alternative Text',
    question_text: 'Which HTML attribute provides alternative text for an image?',
    code_snippet: '',
    options: ['title', 'src', 'alt', 'href'],
    correct_option_index: 2, // C (alt)
    explanation: 'The alt attribute specifies an alternate text to be displayed if the image cannot be loaded.'
  },
  // Q14
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Standard I/O Header',
    question_text: 'Which C header file is commonly used for printf()?',
    code_snippet: '',
    options: ['stdlib.h', 'string.h', 'math.h', 'stdio.h'],
    correct_option_index: 3, // D (stdio.h)
    explanation: 'stdio.h (Standard Input/Output) contains the function prototype for printf().'
  },
  // Q15
  {
    language: 'Java',
    difficulty: 'Moderate',
    title: 'Class Inheritance Keyword',
    question_text: 'Which Java keyword is used to inherit a class?',
    code_snippet: '',
    options: ['implements', 'inherits', 'extends', 'super'],
    correct_option_index: 2, // C (extends)
    explanation: 'The extends keyword is used to inherit attributes and methods from one class to another.'
  },
  // Q16
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'Floor Division Operator',
    question_text: 'What does // perform in Python?',
    code_snippet: '',
    options: ['Normal division', 'Floor division', 'Modulus', 'Exponentiation'],
    correct_option_index: 1, // B (Floor division)
    explanation: '// is the floor division operator which divides two numbers and rounds down to the nearest integer.'
  },
  // Q17
  {
    language: 'C++',
    difficulty: 'Easy',
    title: 'Member Access Operator',
    question_text: 'Which operator is used to access a member through a C++ object?',
    code_snippet: '',
    options: ['->', '::', '.', '&'],
    correct_option_index: 2, // C (.)
    explanation: 'The dot operator (.) is used to access methods and properties through a direct class object instance.'
  },
  // Q18
  {
    language: 'Java',
    difficulty: 'Hard',
    title: 'String Reference Comparison',
    question_text: 'What is the result of two separately created Java String objects containing "Hello" when compared using ==?',
    code_snippet: 'String s1 = new String("Hello");\nString s2 = new String("Hello");\nSystem.out.println(s1 == s2);',
    options: ['true', 'false', 'Hello', 'Compilation error'],
    correct_option_index: 1, // B (false)
    explanation: 'In Java, == compares memory references, not contents. Separately allocated String objects have different heap addresses, so s1 == s2 yields false.'
  },
  // Q19
  {
    language: 'Python',
    difficulty: 'Hard',
    title: 'List Reference Mutation',
    question_text: 'What is the output of: a=[1,2]; b=a; b.append(3); print(a)?',
    code_snippet: 'a = [1, 2]\nb = a\nb.append(3)\nprint(a)',
    options: ['[1,2]', '[3]', '[1,2,3]', 'Error'],
    correct_option_index: 2, // C ([1,2,3])
    explanation: 'b = a creates a reference to the same list object in memory. Mutating b also mutates a, so print(a) outputs [1, 2, 3].'
  },
  // Q20
  {
    language: 'C',
    difficulty: 'Moderate',
    title: 'Integer Size in C',
    question_text: 'If int x=10; in a typical C implementation, what is sizeof(x)?',
    code_snippet: 'int x = 10;\nprintf("%zu", sizeof(x));',
    options: ['1 byte', '2 bytes', '4 bytes', '8 bytes'],
    correct_option_index: 2, // C (4 bytes)
    explanation: 'In typical 32-bit and 64-bit systems, a standard C integer occupies 4 bytes (32 bits).'
  },
  // Q21
  {
    language: 'C',
    difficulty: 'Hard',
    title: 'Pointer Dereferencing',
    question_text: 'What is the output of: int x=10; int *p=&x; *p=20; printf("%d",x);?',
    code_snippet: 'int x = 10;\nint *p = &x;\n*p = 20;\nprintf("%d", x);',
    options: ['10', '20', 'Address of x', 'Error'],
    correct_option_index: 1, // B (20)
    explanation: '*p dereferences pointer p (which points to x) and assigns 20 to the memory location of x, modifying x to 20.'
  },
  // Q22
  {
    language: 'Java',
    difficulty: 'Moderate',
    title: 'Invalid Array Index Exception',
    question_text: 'What exception occurs when accessing an invalid index of a Java array?',
    code_snippet: '',
    options: ['NullPointerException', 'ArrayIndexOutOfBoundsException', 'IOException', 'ArithmeticException'],
    correct_option_index: 1, // B (ArrayIndexOutOfBoundsException)
    explanation: 'Attempting to access an array with an index that is either negative or greater than or equal to the array length throws ArrayIndexOutOfBoundsException.'
  },
  // Q23
  {
    language: 'Python',
    difficulty: 'Moderate',
    title: 'List Slicing',
    question_text: 'What is the result of Python expression [1,2,3,4][1:3]?',
    code_snippet: 'res = [1, 2, 3, 4][1:3]',
    options: ['[1,2]', '[2,3]', '[2,3,4]', '[1,2,3]'],
    correct_option_index: 1, // B ([2,3])
    explanation: 'Slice [1:3] extracts elements from index 1 up to (excluding) index 3: index 1 is 2, index 2 is 3, yielding [2, 3].'
  },
  // Q24
  {
    language: 'Java',
    difficulty: 'Moderate',
    title: 'Nested If Condition Flow',
    question_text: 'In Java, if an outer if is false in a nested if-else statement, what happens?',
    code_snippet: '',
    options: ['Inner statement runs', 'Else always runs', 'No output', 'Compilation error'],
    correct_option_index: 2, // C (No output)
    explanation: 'If the outer if condition evaluates to false and there is no outer else block, control skips the nested block entirely and nothing executes (No output).'
  },
  // Q25
  {
    language: 'C++',
    difficulty: 'Moderate',
    title: 'Ternary Conditional Operator',
    question_text: 'What is the value of: int x=(5>3) ? 10 : 20; in C++?',
    code_snippet: 'int x = (5 > 3) ? 10 : 20;',
    options: ['5', '10', '20', 'Error'],
    correct_option_index: 1, // B (10)
    explanation: '(5 > 3) evaluates to true, so the ternary operator evaluates the first expression (10) and assigns 10 to x.'
  }
];
