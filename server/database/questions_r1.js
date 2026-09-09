/**
 * BUG HUNT — Official Round 1: 10 MCQ Question Bank
 * Exactly 10 Questions | 2 C, 2 C++, 2 Java, 2 Python, 2 HTML | 1 Mark Each
 * Derived directly from the Official Tournament Question Paper.
 */

export const r1Questions = [
  // ==========================================
  // C PROGRAMMING (2 Questions)
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
    correct_option_index: 1, // B (5)
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
    correct_option_index: 2, // C (stdio.h)
    explanation: 'stdio.h (Standard Input/Output) defines printf(), scanf(), and basic stream I/O functions in C.'
  },

  // ==========================================
  // C++ PROGRAMMING (2 Questions)
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
    correct_option_index: 1, // B (cout)
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
    correct_option_index: 1, // B (<<)
    explanation: 'The insertion operator (<<) is used to send data to the cout output stream.'
  },

  // ==========================================
  // JAVA (2 Questions)
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
    correct_option_index: 2, // C (new)
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
    correct_option_index: 2, // C (main())
    explanation: 'public static void main(String[] args) is the required entry point method invoked by the JVM.'
  },

  // ==========================================
  // PYTHON (2 Questions)
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
    correct_option_index: 1, // B (#)
    explanation: 'Python uses the hash (#) symbol for single-line comments.'
  },
  {
    language: 'Python',
    difficulty: 'Easy',
    title: 'Output Display Function',
    question_text: 'Which function is used to display output in Python?',
    code_snippet: '',
    options: [
      'display()',
      'echo()',
      'print()',
      'printf()'
    ],
    correct_option_index: 2, // C (print())
    explanation: 'The built-in print() function outputs strings and formatted representations to the standard output.'
  },

  // ==========================================
  // HTML (2 Questions)
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
    correct_option_index: 0, // A (Hyper Text Markup Language)
    explanation: 'HTML stands for HyperText Markup Language, the standard formatting language of the web.'
  },
  {
    language: 'HTML',
    difficulty: 'Easy',
    title: 'Largest Heading Tag',
    question_text: 'Which tag is used for the largest heading in HTML?',
    code_snippet: '',
    options: [
      '<heading>',
      '<h6>',
      '<h1>',
      '<head>'
    ],
    correct_option_index: 2, // C (<h1>)
    explanation: '<h1> specifies the highest-level and visually largest heading in HTML typography.'
  }
];
