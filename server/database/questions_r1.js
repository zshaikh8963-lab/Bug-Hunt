/**
 * BUG HUNT — Official Round 1: Basic MCQ Question Bank
 * 50 Questions | C, C++, Java, Python & HTML | 1 Mark Each
 * Derived directly from the Official Tournament Question Paper & Answer Key.
 */

export const r1Questions = [
  // ==========================================
  // C PROGRAMMING (Q1 - Q10)
  // ==========================================
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Post-Increment Output',
    question_text: 'What is the output of the following C code?',
    code_snippet: 'int x = 5;\nprintf("%d", x++);',
    options: [
      '4',
      '5',
      '6',
      'Error'
    ],
    correct_option_index: 1, // B
    explanation: 'x++ is post-increment: the current value of x (5) is passed to printf first, then x is incremented to 6.'
  },
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Standard I/O Header',
    question_text: 'Which header file is required for printf()?',
    code_snippet: '',
    options: [
      'stdlib.h',
      'string.h',
      'stdio.h',
      'math.h'
    ],
    correct_option_index: 2, // C
    explanation: 'stdio.h (Standard Input/Output) defines printf(), scanf(), and basic stream I/O functions in C.'
  },
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Array Indexing',
    question_text: 'What is the index of the first element of an array in C?',
    code_snippet: '',
    options: [
      '0',
      '1',
      '-1',
      'Depends on the array'
    ],
    correct_option_index: 0, // A
    explanation: 'Arrays in C are strictly 0-indexed, meaning the first element is located at index 0.'
  },
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Logical AND Operator',
    question_text: 'Which operator is used for logical AND?',
    code_snippet: '',
    options: [
      '&',
      '&&',
      '||',
      '!'
    ],
    correct_option_index: 1, // B
    explanation: '&& is the logical AND operator in C/C++, whereas & is the bitwise AND operator.'
  },
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Constant Declaration Keyword',
    question_text: 'Which keyword is used to declare a constant variable?',
    code_snippet: '',
    options: [
      'constant',
      'static',
      'const',
      'fixed'
    ],
    correct_option_index: 2, // C
    explanation: 'The const qualifier in C declares a variable whose value cannot be modified after initialization.'
  },
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Integer Division Output',
    question_text: 'What is the output of printf("%d", 10 / 3);?',
    code_snippet: '',
    options: [
      '3.33',
      '3',
      '4',
      '3.0'
    ],
    correct_option_index: 1, // B
    explanation: 'Integer division (10 / 3) truncates any fractional component and produces integer 3.'
  },
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Guaranteed Loop Execution',
    question_text: 'Which loop is guaranteed to execute at least once?',
    code_snippet: '',
    options: [
      'for',
      'while',
      'do-while',
      'Nested loop'
    ],
    correct_option_index: 2, // C
    explanation: 'The do-while loop evaluates its condition at the bottom of the loop, ensuring the loop body runs at least once.'
  },
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Address-Of Operator',
    question_text: 'Which symbol is used to access the address of a variable?',
    code_snippet: '',
    options: [
      '*',
      '&',
      '%',
      '@'
    ],
    correct_option_index: 1, // B
    explanation: 'The address-of operator & returns the pointer memory address of the given variable.'
  },
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Formatted Input Function',
    question_text: 'Which function is used to read formatted input in C?',
    code_snippet: '',
    options: [
      'scanf()',
      'input()',
      'read()',
      'get()'
    ],
    correct_option_index: 0, // A
    explanation: 'scanf() reads formatted input from the standard input stream (stdin) according to format specifiers.'
  },
  {
    language: 'C',
    difficulty: 'Easy',
    title: 'Equality Comparison Operator',
    question_text: 'What does == represent in C?',
    code_snippet: '',
    options: [
      'Assignment',
      'Equality comparison',
      'Address assignment',
      'Increment'
    ],
    correct_option_index: 1, // B
    explanation: '== is the comparison operator for equality, while = is the assignment operator.'
  },

  // ==========================================
  // C++ PROGRAMMING (Q11 - Q20)
  // ==========================================
  {
    language: 'C++',
    difficulty: 'Easy',
    title: 'Standard Output Stream',
    question_text: 'Which stream is commonly used for output in C++?',
    code_snippet: '',
    options: [
      'cin',
      'cout',
      'print',
      'output'
    ],
    correct_option_index: 1, // B
    explanation: 'std::cout is the standard output stream object in C++ defined in <iostream>.'
  },
  {
    language: 'C++',
    difficulty: 'Easy',
    title: 'Stream Insertion Operator',
    question_text: 'Which operator is used with cout?',
    code_snippet: '',
    options: [
      '>>',
      '<<',
      '<>',
      '&&'
    ],
    correct_option_index: 1, // B
    explanation: 'The insertion operator (<<) is used to send data to the cout output stream.'
  },
  {
    language: 'C++',
    difficulty: 'Easy',
    title: 'Class Definition Keyword',
    question_text: 'Which keyword is used to define a class?',
    code_snippet: '',
    options: [
      'object',
      'class',
      'define',
      'structure'
    ],
    correct_option_index: 1, // B
    explanation: 'The class keyword declares a user-defined type with encapsulated data and member functions.'
  },
  {
    language: 'C++',
    difficulty: 'Easy',
    title: 'Default Class Access Specifier',
    question_text: 'What is the default access specifier of a C++ class?',
    code_snippet: '',
    options: [
      'Public',
      'Protected',
      'Private',
      'Internal'
    ],
    correct_option_index: 2, // C
    explanation: 'In C++, members of a class are private by default, whereas members of a struct are public.'
  },
  {
    language: 'C++',
    difficulty: 'Easy',
    title: 'Function Overloading Concept',
    question_text: 'Which concept allows the same function name to have different parameters?',
    code_snippet: '',
    options: [
      'Inheritance',
      'Function Overloading',
      'Encapsulation',
      'Abstraction'
    ],
    correct_option_index: 1, // B
    explanation: 'Function overloading allows multiple functions to share the same name with different parameter signatures.'
  },
  {
    language: 'C++',
    difficulty: 'Easy',
    title: 'Scope Resolution Operator',
    question_text: 'Which operator is called the scope resolution operator?',
    code_snippet: '',
    options: [
      '->',
      '::',
      '..',
      '=>'
    ],
    correct_option_index: 1, // B
    explanation: 'The double colon (::) is the scope resolution operator used to access namespaces, global variables, and class static members.'
  },
  {
    language: 'C++',
    difficulty: 'Easy',
    title: 'Object Initialization Function',
    question_text: 'Which function is automatically called when an object is created?',
    code_snippet: '',
    options: [
      'Destructor',
      'Constructor',
      'Main function',
      'Finalizer'
    ],
    correct_option_index: 1, // B
    explanation: 'A constructor is a special member function that initializes a new object upon creation.'
  },
  {
    language: 'C++',
    difficulty: 'Easy',
    title: 'Object Pointer Member Access',
    question_text: 'Which operator is used to access members through an object pointer?',
    code_snippet: '',
    options: [
      '.',
      '::',
      '->',
      '*'
    ],
    correct_option_index: 2, // C
    explanation: 'The arrow operator (->) dereferences an object pointer and accesses its members (ptr->member).'
  },
  {
    language: 'C++',
    difficulty: 'Easy',
    title: 'OOP Property Acquisition',
    question_text: 'Which OOP concept allows a class to acquire properties of another class?',
    code_snippet: '',
    options: [
      'Encapsulation',
      'Inheritance',
      'Abstraction',
      'Compilation'
    ],
    correct_option_index: 1, // B
    explanation: 'Inheritance allows a derived class to inherit fields, methods, and behaviors from a parent class.'
  },
  {
    language: 'C++',
    difficulty: 'Easy',
    title: 'C++ Language Origin',
    question_text: 'C++ is primarily an extension of which language?',
    code_snippet: '',
    options: [
      'Java',
      'Python',
      'C',
      'Pascal'
    ],
    correct_option_index: 2, // C
    explanation: 'C++ was developed by Bjarne Stroustrup at Bell Labs as an extension of the C language adding object-oriented features.'
  },

  // ==========================================
  // JAVA (Q21 - Q30)
  // ==========================================
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'Object Instantiation Keyword',
    question_text: 'Which keyword is used to create an object in Java?',
    code_snippet: '',
    options: [
      'create',
      'object',
      'new',
      'malloc'
    ],
    correct_option_index: 2, // C
    explanation: 'The new operator allocates memory on the heap for a new class object and invokes its constructor.'
  },
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'Application Entry Point',
    question_text: 'Which method is the entry point of a standard Java application?',
    code_snippet: '',
    options: [
      'start()',
      'run()',
      'main()',
      'execute()'
    ],
    correct_option_index: 2, // C
    explanation: 'The JVM begins program execution by invoking public static void main(String[] args).'
  },
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'Class Inheritance Keyword',
    question_text: 'Which keyword is used for class inheritance in Java?',
    code_snippet: '',
    options: [
      'inherit',
      'extends',
      'implements',
      'super'
    ],
    correct_option_index: 1, // B
    explanation: 'The extends keyword is used by a class to inherit from a superclass.'
  },
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'Interface Implementation Keyword',
    question_text: 'Which keyword is used when a class implements an interface?',
    code_snippet: '',
    options: [
      'extends',
      'inherits',
      'implements',
      'interface'
    ],
    correct_option_index: 2, // C
    explanation: 'The implements keyword is used by a class to implement the contracts defined in an interface.'
  },
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'Boolean Primitive Type',
    question_text: 'Which data type stores true or false?',
    code_snippet: '',
    options: [
      'bool',
      'boolean',
      'bit',
      'logical'
    ],
    correct_option_index: 1, // B
    explanation: 'In Java, the primitive type boolean can only hold the values true or false.'
  },
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'Java Compilation Target',
    question_text: 'Java source code is generally compiled into:',
    code_snippet: '',
    options: [
      'Machine code',
      'Bytecode',
      'Assembly code',
      'Binary HTML'
    ],
    correct_option_index: 1, // B
    explanation: 'The javac compiler converts .java source files into platform-independent bytecode (.class files).'
  },
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'Bytecode Execution Engine',
    question_text: 'Which component executes Java bytecode?',
    code_snippet: '',
    options: [
      'JDK',
      'JVM',
      'JAR',
      'Javadoc'
    ],
    correct_option_index: 1, // B
    explanation: 'The JVM (Java Virtual Machine) interprets and JIT-compiles Java bytecode into native machine instructions.'
  },
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'Method Override Prevention',
    question_text: 'Which keyword prevents a method from being overridden?',
    code_snippet: '',
    options: [
      'static',
      'private',
      'final',
      'constant'
    ],
    correct_option_index: 2, // C
    explanation: 'Marking a method as final ensures subclasses cannot override its implementation.'
  },
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'Non-Primitive Type Identification',
    question_text: 'Which of the following is NOT a primitive data type in Java?',
    code_snippet: '',
    options: [
      'int',
      'char',
      'boolean',
      'String'
    ],
    correct_option_index: 3, // D
    explanation: 'String is a reference class type in java.lang, not a primitive type like int, char, or boolean.'
  },
  {
    language: 'Java',
    difficulty: 'Easy',
    title: 'String Concatenation Order',
    question_text: 'What is the output of System.out.println(10 + 20 + "Java");?',
    code_snippet: '',
    options: [
      '1020Java',
      '30Java',
      'Java30',
      'Compilation Error'
    ],
    correct_option_index: 1, // B
    explanation: 'Addition evaluates left-to-right: 10 + 20 yields integer 30, followed by string concatenation with "Java" producing "30Java".'
  },

  // ==========================================
  // PYTHON (Q31 - Q40)
  // ==========================================
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'Single-Line Comment Symbol',
    question_text: 'Which symbol is used for a single-line comment in Python?',
    code_snippet: '',
    options: [
      '//',
      '#',
      '/*',
      '--'
    ],
    correct_option_index: 1, // B
    explanation: 'Python uses the hash (#) symbol for single-line comments.'
  },
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'Output Display Function',
    question_text: 'Which function is used to display output?',
    code_snippet: '',
    options: [
      'display()',
      'echo()',
      'print()',
      'printf()'
    ],
    correct_option_index: 2, // C
    explanation: 'The built-in print() function outputs strings and formatted representations to the standard output.'
  },
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'Function Definition Keyword',
    question_text: 'Which keyword is used to define a function?',
    code_snippet: '',
    options: [
      'function',
      'func',
      'def',
      'define'
    ],
    correct_option_index: 2, // C
    explanation: 'The def keyword begins a function definition in Python syntax.'
  },
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'List Creation Syntax',
    question_text: 'Which of the following creates a Python list?',
    code_snippet: '',
    options: [
      '(1, 2, 3)',
      '{1, 2, 3}',
      '[1, 2, 3]',
      '<1, 2, 3>'
    ],
    correct_option_index: 2, // C
    explanation: 'Square brackets [1, 2, 3] create an ordered, mutable list in Python.'
  },
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'Operator Precedence Output',
    question_text: 'What is the output of print(2 + 3 * 2)?',
    code_snippet: '',
    options: [
      '10',
      '12',
      '8',
      '7'
    ],
    correct_option_index: 2, // C
    explanation: 'Multiplication (*) takes precedence over addition (+): 3 * 2 = 6, and 2 + 6 = 8.'
  },
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'List Length Function',
    question_text: 'Which function returns the number of elements in a list?',
    code_snippet: '',
    options: [
      'size()',
      'length()',
      'len()',
      'count()'
    ],
    correct_option_index: 2, // C
    explanation: 'The built-in len() function returns the total count of items in any sequence or collection.'
  },
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'Key-Value Data Structure',
    question_text: 'Which data structure stores key-value pairs?',
    code_snippet: '',
    options: [
      'List',
      'Tuple',
      'Dictionary',
      'String'
    ],
    correct_option_index: 2, // C
    explanation: 'A dictionary (dict) in Python maps hashable keys to associated values.'
  },
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'Module Import Keyword',
    question_text: 'Which keyword is used to import a module?',
    code_snippet: '',
    options: [
      'include',
      'using',
      'import',
      'require'
    ],
    correct_option_index: 2, // C
    explanation: 'The import statement brings code from external modules into the current script.'
  },
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'Code Block Definition',
    question_text: 'Python uses ______ to define blocks of code.',
    code_snippet: '',
    options: [
      'Curly brackets',
      'Parentheses',
      'Indentation',
      'Semicolons'
    ],
    correct_option_index: 2, // C
    explanation: 'Python uses consistent whitespace indentation rather than braces to define code block scope.'
  },
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'List Element Access',
    question_text: 'What is the output of x=[10,20,30]; print(x[1])?',
    code_snippet: '',
    options: [
      '10',
      '20',
      '30',
      'Error'
    ],
    correct_option_index: 1, // B
    explanation: 'Python lists are zero-indexed: x[0] is 10, x[1] is 20, and x[2] is 30.'
  },

  // ==========================================
  // HTML (Q41 - Q50)
  // ==========================================
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'HTML Full Form',
    question_text: 'What does HTML stand for?',
    code_snippet: '',
    options: [
      'Hyper Text Markup Language',
      'High Text Machine Language',
      'Hyperlink Text Management Language',
      'Home Tool Markup Language'
    ],
    correct_option_index: 0, // A
    explanation: 'HTML stands for HyperText Markup Language, the standard formatting language of the web.'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Largest Heading Tag',
    question_text: 'Which tag is used for the largest heading?',
    code_snippet: '',
    options: [
      '<heading>',
      '<h6>',
      '<h1>',
      '<head>'
    ],
    correct_option_index: 2, // C
    explanation: '<h1> specifies the highest-level and visually largest heading in HTML typography.'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Hyperlink Tag',
    question_text: 'Which tag is used to create a hyperlink?',
    code_snippet: '',
    options: [
      '<link>',
      '<a>',
      '<href>',
      '<url>'
    ],
    correct_option_index: 1, // B
    explanation: 'The anchor tag <a> defines hyperlinks to external or internal document targets.'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Image Tag',
    question_text: 'Which tag is used to insert an image?',
    code_snippet: '',
    options: [
      '<image>',
      '<picture>',
      '<img>',
      '<src>'
    ],
    correct_option_index: 2, // C
    explanation: 'The <img> self-closing tag embeds an image in an HTML document using the src attribute.'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Hyperlink Destination Attribute',
    question_text: 'Which attribute specifies the destination of a hyperlink?',
    code_snippet: '',
    options: [
      'src',
      'link',
      'href',
      'url'
    ],
    correct_option_index: 2, // C
    explanation: 'The href (Hypertext Reference) attribute on an <a> tag defines the target URL.'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Unordered List Tag',
    question_text: 'Which tag creates an unordered list?',
    code_snippet: '',
    options: [
      '<ol>',
      '<ul>',
      '<li>',
      '<list>'
    ],
    correct_option_index: 1, // B
    explanation: '<ul> creates an unordered (bulleted) list, containing <li> list item elements.'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Paragraph Tag',
    question_text: 'Which tag is used for a paragraph?',
    code_snippet: '',
    options: [
      '<para>',
      '<text>',
      '<p>',
      '<paragraph>'
    ],
    correct_option_index: 2, // C
    explanation: 'The <p> tag encapsulates a block paragraph of text.'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Line Break Tag',
    question_text: 'Which tag creates a line break?',
    code_snippet: '',
    options: [
      '<break>',
      '<lb>',
      '<br>',
      '<newline>'
    ],
    correct_option_index: 2, // C
    explanation: 'The <br> tag inserts an empty line break without semantic paragraph spacing.'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Visible Page Body',
    question_text: 'Which section contains the visible content of an HTML page?',
    code_snippet: '',
    options: [
      '<head>',
      '<body>',
      '<html>',
      '<title>'
    ],
    correct_option_index: 1, // B
    explanation: 'The <body> element houses all visible rendered markup, styles, scripts, and content.'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Browser Tab Title Tag',
    question_text: 'Which tag defines the title shown in the browser tab?',
    code_snippet: '',
    options: [
      '<head>',
      '<title>',
      '<caption>',
      '<name>'
    ],
    correct_option_index: 1, // B
    explanation: 'The <title> tag placed inside <head> sets the document title shown in the browser tab header.'
  }
];
