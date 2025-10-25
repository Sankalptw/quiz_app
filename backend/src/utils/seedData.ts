import { query } from '../config/database';

/**
 * SEED DATA
 * Initial topics and questions for the quiz platform
 * This runs once to populate the database with sample data
 */

export const seedDatabase = async () => {
  try {
    console.log('🌱 Seeding database...');

    // Check if data already exists
    const topicsCheck = await query('SELECT COUNT(*) FROM topics');
    if (parseInt(topicsCheck.rows[0].count) > 0) {
      console.log('✅ Database already seeded, skipping...');
      return;
    }

    // SEED TOPICS
    const topics = [
      {
        name: 'JavaScript',
        slug: 'javascript',
        description: 'Test your JavaScript fundamentals and ES6+ features',
        icon: '💻',
        difficulty: 'intermediate',
      },
      {
        name: 'Aptitude',
        slug: 'aptitude',
        description: 'Logical reasoning and quantitative aptitude questions',
        icon: '🧠',
        difficulty: 'beginner',
      },
      {
        name: 'General Knowledge',
        slug: 'general-knowledge',
        description: 'World affairs, history, and current events',
        icon: '🌍',
        difficulty: 'beginner',
      },
      {
        name: 'Data Structures',
        slug: 'data-structures',
        description: 'Arrays, Trees, Graphs, and algorithmic thinking',
        icon: '🔢',
        difficulty: 'advanced',
      },
    ];

    for (const topic of topics) {
      await query(
        `INSERT INTO topics (name, slug, description, icon, difficulty) 
         VALUES ($1, $2, $3, $4, $5)`,
        [topic.name, topic.slug, topic.description, topic.icon, topic.difficulty]
      );
    }

    console.log('✅ Topics seeded');

    // Get topic IDs
    const jsTopicResult = await query(`SELECT id FROM topics WHERE slug = 'javascript'`);
    const aptTopicResult = await query(`SELECT id FROM topics WHERE slug = 'aptitude'`);
    const gkTopicResult = await query(`SELECT id FROM topics WHERE slug = 'general-knowledge'`);
    const dsTopicResult = await query(`SELECT id FROM topics WHERE slug = 'data-structures'`);

    const jsTopicId = jsTopicResult.rows[0].id;
    const aptTopicId = aptTopicResult.rows[0].id;
    const gkTopicId = gkTopicResult.rows[0].id;
    const dsTopicId = dsTopicResult.rows[0].id;

    // JAVASCRIPT QUESTIONS
    const jsQuestions = [
      {
        question: 'What is the output of: console.log(typeof null)?',
        options: ['null', 'undefined', 'object', 'number'],
        correct_answer: 2,
        difficulty: 'easy',
        explanation: 'typeof null returns "object" due to a historical bug in JavaScript that was never fixed for backward compatibility.',
      },
      {
        question: 'Which method is used to add elements to the end of an array?',
        options: ['shift()', 'push()', 'unshift()', 'pop()'],
        correct_answer: 1,
        difficulty: 'easy',
        explanation: 'push() adds one or more elements to the end of an array and returns the new length.',
      },
      {
        question: 'What does the "this" keyword refer to in JavaScript?',
        options: ['The function itself', 'The global object', 'The object that owns the executing code', 'undefined'],
        correct_answer: 2,
        difficulty: 'medium',
        explanation: '"this" refers to the object that is executing the current function. Its value depends on how the function is called.',
      },
      {
        question: 'What is a closure in JavaScript?',
        options: ['A function with no parameters', 'A function that returns another function', 'A function that has access to variables in its outer scope', 'A built-in JavaScript method'],
        correct_answer: 2,
        difficulty: 'medium',
        explanation: 'A closure is a function that has access to variables in its outer (enclosing) lexical scope, even after the outer function has returned.',
      },
      {
        question: 'What is the difference between "==" and "===" operators?',
        options: ['No difference', '"==" checks type, "===" checks value', '"==" checks value only, "===" checks value and type', 'Both are deprecated'],
        correct_answer: 2,
        difficulty: 'easy',
        explanation: '"==" performs type coercion before comparison, while "===" (strict equality) checks both value and type without coercion.',
      },
      {
        question: 'What will be the output: [1, 2, 3] + [4, 5, 6]?',
        options: ['[1,2,3,4,5,6]', '"1,2,34,5,6"', 'Error', '[7, 7, 9]'],
        correct_answer: 1,
        difficulty: 'hard',
        explanation: 'Array addition converts both arrays to strings and concatenates them, resulting in "1,2,34,5,6".',
      },
      {
        question: 'Which ES6 feature allows you to extract values from arrays or objects?',
        options: ['Spread operator', 'Destructuring', 'Template literals', 'Arrow functions'],
        correct_answer: 1,
        difficulty: 'easy',
        explanation: 'Destructuring assignment allows you to unpack values from arrays or properties from objects into distinct variables.',
      },
      {
        question: 'What is the purpose of async/await in JavaScript?',
        options: ['To make synchronous code', 'To handle asynchronous operations more elegantly', 'To replace callbacks entirely', 'To improve performance'],
        correct_answer: 1,
        difficulty: 'medium',
        explanation: 'async/await provides a cleaner syntax for working with Promises, making asynchronous code look and behave more like synchronous code.',
      },
      {
        question: 'What does event bubbling mean in JavaScript?',
        options: ['Events are lost', 'Events propagate from child to parent elements', 'Events happen twice', 'Events are cancelled'],
        correct_answer: 1,
        difficulty: 'medium',
        explanation: 'Event bubbling is when an event propagates from the target element up through its ancestors in the DOM tree.',
      },
      {
        question: 'What is the temporal dead zone in JavaScript?',
        options: ['A deprecated feature', 'Time between variable creation and initialization', 'A type of memory leak', 'A debugging tool'],
        correct_answer: 1,
        difficulty: 'hard',
        explanation: 'The temporal dead zone is the period between entering scope and variable initialization where accessing the variable throws a ReferenceError.',
      },
    ];

    for (const q of jsQuestions) {
      await query(
        `INSERT INTO questions (topic_id, question, options, correct_answer, difficulty, explanation)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [jsTopicId, q.question, JSON.stringify(q.options), q.correct_answer, q.difficulty, q.explanation]
      );
    }

    // APTITUDE QUESTIONS
    const aptQuestions = [
      {
        question: 'If a train travels 60 km in 45 minutes, what is its speed in km/h?',
        options: ['60 km/h', '70 km/h', '80 km/h', '90 km/h'],
        correct_answer: 2,
        difficulty: 'easy',
        explanation: 'Speed = Distance/Time. 60 km / 0.75 hours = 80 km/h.',
      },
      {
        question: 'What is 15% of 200?',
        options: ['20', '25', '30', '35'],
        correct_answer: 2,
        difficulty: 'easy',
        explanation: '15% of 200 = (15/100) × 200 = 30.',
      },
      {
        question: 'If 5 workers can complete a task in 12 days, how many days will 3 workers take?',
        options: ['15 days', '18 days', '20 days', '24 days'],
        correct_answer: 2,
        difficulty: 'medium',
        explanation: 'This is inverse proportion. 5 × 12 = 60 man-days. 60 / 3 = 20 days.',
      },
      {
        question: 'What comes next in the series: 2, 6, 12, 20, 30, ?',
        options: ['38', '40', '42', '44'],
        correct_answer: 2,
        difficulty: 'medium',
        explanation: 'Differences are 4, 6, 8, 10, 12. Next difference is 12, so 30 + 12 = 42.',
      },
      {
        question: 'A shopkeeper sells an item at 25% profit. If the cost price is ₹400, what is the selling price?',
        options: ['₹450', '₹475', '₹500', '₹525'],
        correct_answer: 2,
        difficulty: 'easy',
        explanation: 'SP = CP + (25% of CP) = 400 + 100 = ₹500.',
      },
      {
        question: 'If A is twice as fast as B, and together they can finish work in 12 days, how long will B take alone?',
        options: ['24 days', '30 days', '36 days', '40 days'],
        correct_answer: 2,
        difficulty: 'hard',
        explanation: 'Let B take x days. A takes x/2 days. 1/x + 2/x = 1/12. Solving: x = 36 days.',
      },
      {
        question: 'What is the average of first 10 natural numbers?',
        options: ['5', '5.5', '6', '10'],
        correct_answer: 1,
        difficulty: 'easy',
        explanation: 'Average = (1+2+...+10)/10 = 55/10 = 5.5.',
      },
      {
        question: 'A bag contains 5 red and 3 blue balls. What is the probability of drawing a red ball?',
        options: ['3/8', '5/8', '1/2', '2/3'],
        correct_answer: 1,
        difficulty: 'medium',
        explanation: 'Probability = Favorable outcomes / Total outcomes = 5 / (5+3) = 5/8.',
      },
      {
        question: 'If the ratio of ages of A and B is 3:4, and the sum of their ages is 35, what is A\'s age?',
        options: ['12', '15', '18', '20'],
        correct_answer: 1,
        difficulty: 'medium',
        explanation: 'Let ages be 3x and 4x. 3x + 4x = 35, so 7x = 35, x = 5. A\'s age = 3×5 = 15.',
      },
      {
        question: 'A number is increased by 20% and then decreased by 20%. What is the net change?',
        options: ['0%', '4% decrease', '4% increase', '2% decrease'],
        correct_answer: 1,
        difficulty: 'hard',
        explanation: 'Let number be 100. After +20%: 120. After -20% of 120: 96. Net change = 4% decrease.',
      },
    ];

    for (const q of aptQuestions) {
      await query(
        `INSERT INTO questions (topic_id, question, options, correct_answer, difficulty, explanation)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [aptTopicId, q.question, JSON.stringify(q.options), q.correct_answer, q.difficulty, q.explanation]
      );
    }

    // GENERAL KNOWLEDGE QUESTIONS
    const gkQuestions = [
      {
        question: 'What is the capital of Australia?',
        options: ['Sydney', 'Melbourne', 'Canberra', 'Perth'],
        correct_answer: 2,
        difficulty: 'easy',
        explanation: 'Canberra is the capital city of Australia, though Sydney is more well-known.',
      },
      {
        question: 'Who painted the Mona Lisa?',
        options: ['Vincent van Gogh', 'Leonardo da Vinci', 'Pablo Picasso', 'Michelangelo'],
        correct_answer: 1,
        difficulty: 'easy',
        explanation: 'The Mona Lisa was painted by Leonardo da Vinci between 1503 and 1519.',
      },
      {
        question: 'What is the largest ocean on Earth?',
        options: ['Atlantic Ocean', 'Indian Ocean', 'Arctic Ocean', 'Pacific Ocean'],
        correct_answer: 3,
        difficulty: 'easy',
        explanation: 'The Pacific Ocean is the largest ocean, covering more than 63 million square miles.',
      },
      {
        question: 'In which year did World War II end?',
        options: ['1943', '1944', '1945', '1946'],
        correct_answer: 2,
        difficulty: 'medium',
        explanation: 'World War II ended in 1945 with the surrender of Japan in September.',
      },
      {
        question: 'What is the smallest country in the world by area?',
        options: ['Monaco', 'Vatican City', 'San Marino', 'Liechtenstein'],
        correct_answer: 1,
        difficulty: 'medium',
        explanation: 'Vatican City is the smallest country, with an area of only 0.17 square miles.',
      },
      {
        question: 'Who wrote "Romeo and Juliet"?',
        options: ['Charles Dickens', 'William Shakespeare', 'Jane Austen', 'Mark Twain'],
        correct_answer: 1,
        difficulty: 'easy',
        explanation: 'Romeo and Juliet was written by William Shakespeare around 1594-1596.',
      },
      {
        question: 'What is the currency of Japan?',
        options: ['Won', 'Yuan', 'Yen', 'Ringgit'],
        correct_answer: 2,
        difficulty: 'easy',
        explanation: 'The Japanese Yen (¥) is the official currency of Japan.',
      },
      {
        question: 'How many continents are there on Earth?',
        options: ['5', '6', '7', '8'],
        correct_answer: 2,
        difficulty: 'easy',
        explanation: 'There are 7 continents: Africa, Antarctica, Asia, Europe, North America, Australia, and South America.',
      },
      {
        question: 'What is the speed of light in vacuum?',
        options: ['299,792 km/s', '199,792 km/s', '399,792 km/s', '99,792 km/s'],
        correct_answer: 0,
        difficulty: 'medium',
        explanation: 'The speed of light in vacuum is approximately 299,792 kilometers per second.',
      },
      {
        question: 'Who is known as the "Father of Computers"?',
        options: ['Alan Turing', 'Charles Babbage', 'Bill Gates', 'Steve Jobs'],
        correct_answer: 1,
        difficulty: 'medium',
        explanation: 'Charles Babbage is known as the Father of Computers for designing the first mechanical computer.',
      },
    ];

    for (const q of gkQuestions) {
      await query(
        `INSERT INTO questions (topic_id, question, options, correct_answer, difficulty, explanation)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [gkTopicId, q.question, JSON.stringify(q.options), q.correct_answer, q.difficulty, q.explanation]
      );
    }

    // DATA STRUCTURES QUESTIONS
    const dsQuestions = [
      {
        question: 'What is the time complexity of binary search?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(1)'],
        correct_answer: 1,
        difficulty: 'medium',
        explanation: 'Binary search has O(log n) time complexity as it divides the search space in half each iteration.',
      },
      {
        question: 'Which data structure uses LIFO (Last In First Out)?',
        options: ['Queue', 'Stack', 'Array', 'Linked List'],
        correct_answer: 1,
        difficulty: 'easy',
        explanation: 'Stack follows LIFO principle where the last element added is the first one to be removed.',
      },
      {
        question: 'What is the worst-case time complexity of Quick Sort?',
        options: ['O(n)', 'O(n log n)', 'O(n²)', 'O(log n)'],
        correct_answer: 2,
        difficulty: 'medium',
        explanation: 'Quick Sort has O(n²) worst-case complexity when the pivot is always the smallest or largest element.',
      },
      {
        question: 'In a binary tree, what is a leaf node?',
        options: ['Root node', 'Node with no children', 'Node with one child', 'Node with two children'],
        correct_answer: 1,
        difficulty: 'easy',
        explanation: 'A leaf node is a node that has no children (both left and right child are null).',
      },
      {
        question: 'Which traversal method visits nodes level by level?',
        options: ['Inorder', 'Preorder', 'Postorder', 'Level-order'],
        correct_answer: 3,
        difficulty: 'medium',
        explanation: 'Level-order traversal (BFS) visits all nodes at each level before moving to the next level.',
      },
      {
        question: 'What is the space complexity of a recursive Fibonacci function?',
        options: ['O(1)', 'O(log n)', 'O(n)', 'O(n²)'],
        correct_answer: 2,
        difficulty: 'hard',
        explanation: 'Recursive Fibonacci has O(n) space complexity due to the maximum depth of the recursion call stack.',
      },
      {
        question: 'Which data structure is best for implementing LRU cache?',
        options: ['Array', 'Linked List', 'Hash Map + Doubly Linked List', 'Binary Tree'],
        correct_answer: 2,
        difficulty: 'hard',
        explanation: 'LRU cache is efficiently implemented using Hash Map for O(1) access and Doubly Linked List for O(1) insertion/deletion.',
      },
      {
        question: 'What is the height of a balanced binary tree with n nodes?',
        options: ['O(n)', 'O(log n)', 'O(n log n)', 'O(√n)'],
        correct_answer: 1,
        difficulty: 'medium',
        explanation: 'A balanced binary tree has height O(log n), which is why operations on balanced trees are efficient.',
      },
      {
        question: 'Which sorting algorithm is stable and has O(n log n) complexity?',
        options: ['Quick Sort', 'Heap Sort', 'Merge Sort', 'Selection Sort'],
        correct_answer: 2,
        difficulty: 'medium',
        explanation: 'Merge Sort is stable (maintains relative order of equal elements) and has guaranteed O(n log n) complexity.',
      },
      {
        question: 'What is a hash collision?',
        options: ['Memory overflow', 'Two keys mapping to same hash value', 'Duplicate data', 'Hash function error'],
        correct_answer: 1,
        difficulty: 'easy',
        explanation: 'A hash collision occurs when two different keys produce the same hash value, requiring collision resolution techniques.',
      },
    ];

    for (const q of dsQuestions) {
      await query(
        `INSERT INTO questions (topic_id, question, options, correct_answer, difficulty, explanation)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [dsTopicId, q.question, JSON.stringify(q.options), q.correct_answer, q.difficulty, q.explanation]
      );
    }

    console.log('✅ Questions seeded');
    console.log('🎉 Database seeding complete!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    throw error;
  }
};
