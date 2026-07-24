// "Learn with Kai" — 5th-grade-level analogies for core programming concepts,
// organized by technology track. Each concept has a short reading (analogy +
// explainer + code) and a 1-2 question quiz, graded locally (no AI call) so
// Kai can react instantly. kaiClaim is used for the "Teach Kai" moment where
// Kai makes a claim (sometimes right, sometimes deliberately wrong) and the
// user corrects it.

const JAVA_CONCEPTS = [
  {
    id: 'classes-vs-objects',
    order: 1,
    title: 'Classes vs Objects',
    tagline: 'The blueprint and the thing you build from it',
    expandReaction: "Good starting point — get this one solid and everything else clicks faster.",
    analogy: {
      emoji: '🍪',
      text: "A class is like a cookie cutter — it's the shape. An object is the actual cookie you get when you press the cutter into dough. You can make many cookies (objects) from one cutter (class), and each cookie can have its own sprinkles (data).",
    },
    explainer: "In Java, a class is a template that describes what an object will look like and what it can do — its fields (data) and methods (actions). An object is a real instance created from that class using the `new` keyword. You can create as many objects as you want from a single class, and each one holds its own separate copy of the data.",
    codeExample: {
      label: 'In real code',
      code: `class Cookie {\n  String flavor;\n}\n\nCookie choc = new Cookie();\nchoc.flavor = "chocolate chip";\n\nCookie sugar = new Cookie();\nsugar.flavor = "sugar";\n// choc and sugar are two separate objects from the same class`,
      output: [
        'choc.flavor → "chocolate chip"',
        'sugar.flavor → "sugar"',
        '✓ Two separate Cookie objects made from one class',
      ],
    },
    kaiClaim: {
      text: "Wait, so the class is the actual cookie, and the object is the cutter, right?",
      isCorrect: false,
      whyRight: "Actually it's the other way around — the class is the cutter (the shape/template), the object is the cookie you actually get.",
    },
    quiz: [
      {
        id: 'classes-vs-objects-q1',
        question: 'If Cookie is a class, what is choc in the code above?',
        options: ['An object made from the Cookie class', 'A method inside the class', 'A brand new class'],
        correctIndex: 0,
        explainCorrect: "Right — choc is a real cookie made using the Cookie cutter (class).",
        explainIncorrect: "Not quite — choc was created with `new Cookie()`, which makes an object, not a class or a method.",
        hint: "Look at the keyword right before Cookie() in that line — it's the same keyword used any time something new gets created.",
      },
    ],
  },
  {
    id: 'encapsulation',
    order: 2,
    title: 'Encapsulation',
    tagline: 'Hiding the messy stuff behind a clean label',
    expandReaction: "Great choice — this one confuses almost everyone at first.",
    analogy: {
      emoji: '💊',
      text: "Encapsulation is like a fever capsule your mother gives you: you don't see what's inside, but taking it reduces your fever. You don't need to know the exact chemicals — you just need to know 'take one, fever goes down.' The capsule hides the complicated part and only shows you the simple result.",
    },
    explainer: "In Java, a class hides its internal data (fields) by marking them `private`, and only exposes safe, controlled ways to use that data through public methods. Other code doesn't need to know or touch the internal details — it just calls the method and gets the result, the same way you don't need to know the capsule's ingredients to feel better.",
    codeExample: {
      label: 'In real code',
      code: `public class Capsule {\n  private int feverLevel = 10; // hidden inside\n\n  public void takeMedicine() {\n    feverLevel -= 2; // logic stays inside the class\n  }\n\n  public int getFeverLevel() {\n    return feverLevel; // controlled peek, not direct access\n  }\n}`,
      output: [
        'capsule.feverLevel → 🔒 (private, no direct access)',
        'capsule.takeMedicine()',
        'capsule.getFeverLevel() → 8',
        '✓ Fever reduced without ever exposing the raw data',
      ],
    },
    kaiClaim: {
      text: "So private just means other classes can't touch the data directly, they have to go through a method?",
      isCorrect: true,
      whyRight: "Exactly right — that's the whole idea of encapsulation.",
    },
    quiz: [
      {
        id: 'encapsulation-q1',
        question: 'Why do we mark a class field as private instead of public?',
        options: ['So other classes cannot change it directly without going through a method', 'So the code runs faster', 'So Java lets us compile the file'],
        correctIndex: 0,
        explainCorrect: "Exactly — private hides the 'medicine', the public method is the only door in.",
        explainIncorrect: "Not quite — private isn't about speed or compiling, it's about controlling access.",
        hint: "Think about the capsule again — why doesn't your mother let you touch the powder inside directly?",
      },
    ],
  },
  {
    id: 'inheritance',
    order: 3,
    title: 'Inheritance',
    tagline: 'Children get their parents\' traits — plus a few of their own',
    expandReaction: "Classic interview topic — this one shows up constantly.",
    analogy: {
      emoji: '👨‍👩‍👧',
      text: "Inheritance is like a child inheriting eye color and height from their parent — they get those traits automatically, without learning them from scratch. But the child can also have their own hobbies the parent never had. In the same way, a new class can 'inherit' everything from an existing class, and then add its own extra abilities.",
    },
    explainer: "In Java, a class can `extend` another class to automatically get all of its fields and methods, without rewriting them. The new class (the 'child' or subclass) can also add new methods or override existing ones to behave differently — it inherits, but isn't limited to exactly the same behavior as the parent.",
    codeExample: {
      label: 'In real code',
      code: `class Animal {\n  void eat() { System.out.println("eating"); }\n}\n\nclass Dog extends Animal {\n  void bark() { System.out.println("woof!"); }\n}\n\nDog d = new Dog();\nd.eat();  // inherited from Animal\nd.bark(); // Dog's own extra ability`,
      output: [
        'd.eat()',
        'eating',
        'd.bark()',
        'woof!',
        '✓ Dog inherited eat() from Animal, and added its own bark()',
      ],
    },
    kaiClaim: {
      text: "So if Dog extends Animal, that means Animal can now use Dog's bark() method too, right?",
      isCorrect: false,
      whyRight: "Not quite — inheritance only flows one direction. The child (Dog) gets the parent's stuff, not the other way around.",
    },
    quiz: [
      {
        id: 'inheritance-q1',
        question: 'In the code above, why can a Dog object call eat() even though eat() is only written inside the Animal class?',
        options: ['Because Dog extends Animal, so it inherits Animal\'s methods', 'Because eat() is a special Java keyword', 'Because Dog and Animal are the exact same class'],
        correctIndex: 0,
        explainCorrect: "Exactly — extending Animal means Dog automatically gets everything Animal has.",
        explainIncorrect: "Not quite — `eat()` isn't a keyword, and Dog and Animal are two different classes. The `extends` keyword is what connects them.",
        hint: "Look at the word right after 'class Dog' — it connects Dog to Animal.",
      },
    ],
  },
  {
    id: 'polymorphism',
    order: 4,
    title: 'Polymorphism',
    tagline: 'One button, different results depending on what it\'s pointed at',
    expandReaction: "That's a common interview trap — most people can define it but trip up explaining why.",
    analogy: {
      emoji: '📺',
      text: "Polymorphism is like a universal remote's power button — pressing the same button turns on a TV, an AC, or a fan, but each device reacts in its own way. The action ('press power') looks the same from the outside, but what actually happens depends on which device is receiving it.",
    },
    explainer: "In Java, polymorphism lets you call the same method name on different objects, and each object responds in its own way. This usually happens through method overriding — a subclass provides its own version of a method that a parent class also defines — so code that just calls `.makeSound()` gets different behavior depending on the actual object underneath, without needing to know which exact type it is.",
    codeExample: {
      label: 'In real code',
      code: `class Animal {\n  void makeSound() { System.out.println("some sound"); }\n}\nclass Dog extends Animal {\n  void makeSound() { System.out.println("Woof!"); }\n}\nclass Cat extends Animal {\n  void makeSound() { System.out.println("Meow!"); }\n}\n\nAnimal a1 = new Dog();\nAnimal a2 = new Cat();\na1.makeSound(); // Woof!\na2.makeSound(); // Meow!`,
      output: [
        'a1.makeSound()',
        'Woof!',
        'a2.makeSound()',
        'Meow!',
        '✓ Same method call, different behavior per real object',
      ],
    },
    kaiClaim: {
      text: "So the same method name can behave completely differently depending on which actual object is calling it?",
      isCorrect: true,
      whyRight: "Yes! That's polymorphism in a nutshell.",
    },
    quiz: [
      {
        id: 'polymorphism-q1',
        question: 'Why do a1.makeSound() and a2.makeSound() print different things even though both variables are typed as Animal?',
        options: ['Because the actual object underneath (Dog or Cat) decides which version of makeSound() runs', 'Because Animal has two different makeSound() methods', 'Because Java picks randomly each time'],
        correctIndex: 0,
        explainCorrect: "Right — like the remote's power button, the same call does something different depending on the real device (object) underneath.",
        explainIncorrect: "Not quite — Animal only has one makeSound() method. It's the real object type (Dog vs Cat) that decides which overridden version actually runs.",
        hint: "Think about the remote control again — the button never changes, but what's it pointed at?",
      },
    ],
  },
  {
    id: 'abstraction',
    order: 5,
    title: 'Abstraction',
    tagline: 'Using something without needing to know how it works inside',
    expandReaction: "People often mix this one up with encapsulation — good to nail the difference early.",
    analogy: {
      emoji: '🚗',
      text: "Abstraction is like driving a car — you press the accelerator and the car moves. You don't need to understand the engine, the fuel injection, or the transmission to drive. The car exposes a simple set of controls (pedal, wheel) and hides all the complicated machinery behind them.",
    },
    explainer: "In Java, abstraction means exposing only the essential, simple actions to the outside world (often through an abstract class or interface), while hiding the complicated implementation details behind them. The person using the class only needs to know what a method does, not exactly how it does it internally.",
    codeExample: {
      label: 'In real code',
      code: `abstract class Car {\n  abstract void accelerate(); // just the pedal, no engine detail\n}\n\nclass ElectricCar extends Car {\n  void accelerate() {\n    // complicated battery/motor logic hidden here\n    System.out.println("silently speeding up");\n  }\n}`,
      output: [
        'car.accelerate()',
        'silently speeding up',
        '✓ You just called accelerate() — no engine details needed',
      ],
    },
    kaiClaim: {
      text: "So abstraction means there's no code at all behind the button, right?",
      isCorrect: false,
      whyRight: "Not true — there's plenty of code in there, it's just hidden from whoever is using it.",
    },
    quiz: [
      {
        id: 'abstraction-q1',
        question: 'What does abstraction let a driver (or a programmer using a class) avoid?',
        options: ['Needing to understand the complicated internal details to use it', 'Ever needing to write any code at all', 'Having more than one class in a program'],
        correctIndex: 0,
        explainCorrect: "Exactly — you just use the simple controls, the complexity stays hidden inside.",
        explainIncorrect: "Not quite — abstraction doesn't mean no code is written, it means the complicated code is hidden behind a simple interface.",
        hint: "Think about the car analogy again — is the goal 'no engine exists' or 'you don't need to see the engine'?",
      },
    ],
  },
  {
    id: 'interfaces',
    order: 6,
    title: 'Interfaces',
    tagline: 'A standard shape that anything can plug into',
    expandReaction: "This one connects nicely to abstraction — good sequencing.",
    analogy: {
      emoji: '🔌',
      text: "An interface is like a power socket standard — any device with the right plug shape can be used, whether it's a lamp, a charger, or a fan. The socket doesn't care what the device does internally, only that it fits the agreed-upon shape.",
    },
    explainer: "In Java, an interface defines a set of methods that any class implementing it must provide, without saying how those methods actually work. Different classes can implement the same interface in completely different ways, just like different devices fitting the same plug shape but doing very different jobs.",
    codeExample: {
      label: 'In real code',
      code: `interface Chargeable {\n  void charge();\n}\n\nclass Phone implements Chargeable {\n  public void charge() { System.out.println("phone charging"); }\n}\n\nclass Laptop implements Chargeable {\n  public void charge() { System.out.println("laptop charging"); }\n}`,
      output: [
        'phone.charge()',
        'phone charging',
        'laptop.charge()',
        'laptop charging',
        '✓ Both fit the same Chargeable "socket", different internals',
      ],
    },
    kaiClaim: {
      text: "So an interface just says 'you must have this method', but doesn't care how you write it inside?",
      isCorrect: true,
      whyRight: "Exactly — that's the whole point of an interface.",
    },
    quiz: [
      {
        id: 'interfaces-q1',
        question: 'Why can both Phone and Laptop implement Chargeable even though they charge very differently?',
        options: ['An interface only requires the method to exist, not how it works inside', 'Phone and Laptop are secretly the same class', 'Chargeable writes the charging logic for both of them'],
        correctIndex: 0,
        explainCorrect: "Right — like a power socket, the interface only cares that the plug (method) exists, not what's on the other end.",
        explainIncorrect: "Not quite — Phone and Laptop are separate classes, and Chargeable doesn't write any logic itself, it just requires that charge() exists.",
        hint: "Think about the power socket again — does the socket care what brand of charger you plug in?",
      },
    ],
  },
  {
    id: 'constructors',
    order: 7,
    title: 'Constructors',
    tagline: 'Filled in the moment something is created',
    expandReaction: "Last one — finish this and you've got the full OOP foundation down.",
    analogy: {
      emoji: '📜',
      text: "A constructor is like a birth certificate — it gets filled out the exact moment a baby is born, recording the name and birth date right away. In the same way, a constructor runs the instant an object is created, setting up its starting information before you use it for anything else.",
    },
    explainer: "In Java, a constructor is a special method with the same name as the class, called automatically when you use `new`. It's used to set up an object's initial state — for example, giving it a starting name or value — so the object is never left in an incomplete or undefined state.",
    codeExample: {
      label: 'In real code',
      code: `class Person {\n  String name;\n\n  Person(String givenName) { // constructor\n    name = givenName;\n  }\n}\n\nPerson p = new Person("Amit"); // constructor runs right here\nSystem.out.println(p.name); // "Amit"`,
      output: [
        'new Person("Amit")',
        '(constructor runs automatically right here)',
        'p.name → "Amit"',
        '✓ Object was ready to use the instant it was created',
      ],
    },
    kaiClaim: {
      text: "So a constructor can be called anytime later, whenever we feel like it, right?",
      isCorrect: false,
      whyRight: "Nope — a constructor only runs once, automatically, the moment the object is created with `new`.",
    },
    quiz: [
      {
        id: 'constructors-q1',
        question: 'When does the Person constructor actually run?',
        options: ['The instant `new Person("Amit")` is called', 'Only if you call it manually later', 'Only when the program finishes running'],
        correctIndex: 0,
        explainCorrect: "Exactly — just like a birth certificate, it's filled in right at the moment of creation.",
        explainIncorrect: "Not quite — constructors run automatically with `new`, you never call them manually like a regular method.",
        hint: "Think about the birth certificate again — is it filled out years later, or the moment the baby arrives?",
      },
    ],
  },
];

const PYTHON_CONCEPTS = [
  {
    id: 'variables-dynamic-typing',
    order: 1,
    title: 'Variables & Dynamic Typing',
    tagline: 'A sticky note, not a labeled box',
    expandReaction: "Good starting point — this is the first thing that surprises people coming from Java or C#.",
    analogy: {
      emoji: '📝',
      text: "A Python variable is like a sticky note with a name on it, stuck onto whatever value you want right now. You can peel it off an apple and stick it onto a car — same note (variable name), completely different thing underneath.",
    },
    explainer: "In Python, a variable doesn't have a fixed type — it's just a name pointing at a value. You can reassign that same name to a completely different type of value later, and Python won't complain, because the name was never locked to one type in the first place.",
    codeExample: {
      label: 'In real code',
      code: `x = 5\nprint(x)\n\nx = "hello"\nprint(x)\n\nx = [1, 2, 3]\nprint(x)`,
      output: [
        'x → 5',
        'x → "hello"',
        'x → [1, 2, 3]',
        '✓ Same variable name, three different types, no errors',
      ],
    },
    kaiClaim: {
      text: "So once I make x a number, it's stuck being a number forever, right?",
      isCorrect: false,
      whyRight: "Nope — in Python you can reassign a variable to any type, anytime. The name was never locked to one type.",
    },
    quiz: [
      {
        id: 'variables-dynamic-typing-q1',
        question: "Why doesn't Python complain when x changes from a number to a string?",
        options: ["Python variables aren't locked to one type — they just point to whatever value you assign", 'Python secretly converts the string to a number', 'x actually becomes two separate variables'],
        correctIndex: 0,
        explainCorrect: "Right — a Python variable is just a label, not a typed container.",
        explainIncorrect: "Not quite — Python doesn't convert anything or split the variable, it just lets the name point at a new value.",
        hint: "Think about the sticky note again — does the note care what it's stuck onto?",
      },
    ],
  },
  {
    id: 'lists-vs-tuples',
    order: 2,
    title: 'Lists vs Tuples',
    tagline: 'A whiteboard vs an engraved plaque',
    expandReaction: "Comes up constantly — this distinction trips up a lot of people in interviews.",
    analogy: {
      emoji: '🪧',
      text: "A list is like a whiteboard — you can erase and rewrite items anytime. A tuple is like an engraved plaque — once it's made, nobody can change what's carved into it.",
    },
    explainer: "Lists (written with square brackets []) are mutable — you can add, remove, or change items after creation. Tuples (written with round brackets ()) are immutable — once created, their contents can never change. Tuples are often used for fixed data that shouldn't accidentally be modified, like coordinates.",
    codeExample: {
      label: 'In real code',
      code: `my_list = [1, 2, 3]\nmy_list.append(4)\nprint(my_list)\n\nmy_tuple = (1, 2, 3)\n# my_tuple.append(4)  # this would crash`,
      output: [
        'my_list → [1, 2, 3, 4]',
        '✓ Lists can grow and change after creation',
        '✓ Tuples cannot be changed once created',
      ],
    },
    kaiClaim: {
      text: "So a tuple is basically just a list with round brackets instead of square ones — functionally identical?",
      isCorrect: false,
      whyRight: "Not quite — the brackets are a hint, but the real difference is tuples can't be modified after creation, and lists can.",
    },
    quiz: [
      {
        id: 'lists-vs-tuples-q1',
        question: 'Why would you choose a tuple over a list for storing a GPS coordinate (latitude, longitude)?',
        options: ["Because coordinates shouldn't accidentally change after being set", 'Because tuples are faster to type', 'Because Python requires coordinates to be tuples'],
        correctIndex: 0,
        explainCorrect: "Exactly — immutability protects fixed data like coordinates from accidental changes.",
        explainIncorrect: "Not quite — Python doesn't require this, and typing speed isn't the reason. It's about protecting data that shouldn't change.",
        hint: "Think about the engraved plaque again — why would you want something un-editable?",
      },
    ],
  },
  {
    id: 'dictionaries',
    order: 3,
    title: 'Dictionaries',
    tagline: 'Look up a word, get its meaning',
    expandReaction: "One of the most-used data structures in real Python code — worth knowing cold.",
    analogy: {
      emoji: '📖',
      text: "A Python dictionary works just like a real word dictionary — you look up a word (the key) and get its meaning (the value). You don't flip through page by page; you jump straight to the word you want.",
    },
    explainer: "A dictionary stores data as key-value pairs. Instead of accessing items by position (like a list), you access them by their key — direct lookup, not scanning from the start. Since Python 3.7, dictionaries also remember the order items were inserted in.",
    codeExample: {
      label: 'In real code',
      code: `student = {"name": "Amit", "age": 23}\nprint(student["name"])\n\nstudent["age"] = 24\nprint(student["age"])`,
      output: [
        'student["name"] → "Amit"',
        'student["age"] → 24',
        '✓ Looked up and updated directly by key, not position',
      ],
    },
    kaiClaim: {
      text: "So dictionaries keep things in the order I typed them, just like a list?",
      isCorrect: true,
      whyRight: "Actually yes, since Python 3.7 — dictionaries do remember insertion order. Good catch.",
    },
    quiz: [
      {
        id: 'dictionaries-q1',
        question: 'How do you retrieve a value from a dictionary?',
        options: ['By its key, not its position', 'By counting from the start like a list', "By its value"],
        correctIndex: 0,
        explainCorrect: "Right — dictionaries are looked up by key, direct access, no scanning needed.",
        explainIncorrect: "Not quite — dictionaries aren't accessed by counting position like a list, they're looked up directly by key.",
        hint: "Think about the real dictionary again — do you flip to page 47, or look up the word directly?",
      },
    ],
  },
  {
    id: 'list-comprehension',
    order: 4,
    title: 'List Comprehension',
    tagline: 'A factory line, not a loop you build by hand',
    expandReaction: "This is the concept that makes Python code suddenly look 'Pythonic' — worth mastering.",
    analogy: {
      emoji: '🏭',
      text: "Writing a for-loop to build a list is like assembling something by hand, one bolt at a time. A list comprehension is like a factory line — you describe what should happen to each item, and Python builds the whole list in one motion.",
    },
    explainer: "A list comprehension is a compact way to build a new list by applying an expression to every item in an existing sequence, all on one line. Under the hood it does exactly what an equivalent for-loop would do — it's just a shorter way to write it.",
    codeExample: {
      label: 'In real code',
      code: `nums = [1, 2, 3, 4]\nsquares = [n * n for n in nums]\nprint(squares)`,
      output: [
        'squares → [1, 4, 9, 16]',
        '✓ Same result as a for-loop, written in one line',
      ],
    },
    kaiClaim: {
      text: "So list comprehensions are a totally different language feature than for-loops, not related at all?",
      isCorrect: false,
      whyRight: "Not really — a list comprehension is just a shorter way to write a for-loop that builds a list. Under the hood it's doing the same thing.",
    },
    quiz: [
      {
        id: 'list-comprehension-q1',
        question: 'What does [n * n for n in nums] actually build?',
        options: ['A new list with each number squared', 'It modifies nums in place', 'It only keeps even numbers'],
        correctIndex: 0,
        explainCorrect: "Right — it builds a brand new list, leaving the original nums untouched.",
        explainIncorrect: "Not quite — nums itself isn't modified, and there's no filtering for even numbers here. A new squared list is created.",
        hint: "Look at what's on the left of the word 'for' — that's the expression applied to every item.",
      },
    ],
  },
  {
    id: 'functions-default-args',
    order: 5,
    title: 'Default Arguments',
    tagline: 'A pre-filled order form',
    expandReaction: "Small feature, but it comes up in almost every real codebase.",
    analogy: {
      emoji: '📋',
      text: "A function with a default argument is like an order form with a pre-filled default choice — you can accept the default, or cross it out and write your own answer instead.",
    },
    explainer: "A default argument gives a function parameter a fallback value that's used only when the caller doesn't provide their own. This lets you call the function with fewer arguments in the common case, while still allowing full customization when needed.",
    codeExample: {
      label: 'In real code',
      code: `def greet(name="friend"):\n    print(f"Hello, {name}!")\n\ngreet()\ngreet("Amit")`,
      output: [
        'greet() → "Hello, friend!"',
        'greet("Amit") → "Hello, Amit!"',
        '✓ Same function, default used only when no argument is given',
      ],
    },
    kaiClaim: {
      text: 'So once I set name="friend" as the default, I can never call greet with a different name?',
      isCorrect: false,
      whyRight: "You definitely can — the default is only used when you don't provide your own value. Pass any name you want and it overrides the default.",
    },
    quiz: [
      {
        id: 'functions-default-args-q1',
        question: 'What happens if you call greet() with no arguments?',
        options: ['It uses the default value "friend"', 'It crashes because name has no value', 'It waits for user input'],
        correctIndex: 0,
        explainCorrect: "Exactly — the default value fills in automatically when nothing is passed.",
        explainIncorrect: "Not quite — Python doesn't crash or wait for input here, it just falls back to the default value.",
        hint: "Think about the order form again — what happens if you leave that field blank?",
      },
    ],
  },
  {
    id: 'decorators',
    order: 6,
    title: 'Decorators',
    tagline: 'Gift wrap around a function',
    expandReaction: "This one takes people a couple of tries to click — worth reading twice.",
    analogy: {
      emoji: '🎁',
      text: "A decorator is like gift wrap around a present — the present (the function) inside is unchanged, but the wrapping adds something extra around it before anyone opens it.",
    },
    explainer: "A decorator is a function that wraps another function, adding extra behavior before or after it runs, without modifying the original function's own code. The @ syntax is just a convenient way to apply that wrapping.",
    codeExample: {
      label: 'In real code',
      code: `def shout(fn):\n    def wrapper():\n        return fn().upper()\n    return wrapper\n\n@shout\ndef greet():\n    return "hello"\n\nprint(greet())`,
      output: [
        'greet() → "HELLO"',
        '✓ Original greet() still just returns "hello" — @shout wraps extra behavior around it',
      ],
    },
    kaiClaim: {
      text: "So @shout rewrites the inside of greet() to add .upper() directly into its code?",
      isCorrect: false,
      whyRight: "No — greet() itself never changes. The decorator wraps a new layer around it instead of editing its insides.",
    },
    quiz: [
      {
        id: 'decorators-q1',
        question: 'What does @shout actually do to the greet function?',
        options: ["Wraps it so its output gets uppercased, without changing greet's own code", 'Deletes the original greet function', 'Renames greet to shout'],
        correctIndex: 0,
        explainCorrect: "Right — the original function is untouched, just wrapped with extra behavior.",
        explainIncorrect: "Not quite — greet isn't deleted or renamed, it's wrapped by another function that adds behavior around it.",
        hint: "Think about the gift wrap again — does wrapping a present change what's inside it?",
      },
    ],
  },
  {
    id: 'exception-handling',
    order: 7,
    title: 'Exception Handling',
    tagline: 'A safety net under a tightrope',
    expandReaction: "Last one — get this solid and your code stops crashing on the first unexpected input.",
    analogy: {
      emoji: '🪢',
      text: "Code that might fail is like walking a tightrope — a try/except block is the safety net underneath. If you fall (an error happens), the net catches you instead of the whole show stopping.",
    },
    explainer: "A try block runs code that might raise an error. If it does, the matching except block catches that specific error and runs recovery code instead of letting the whole program crash. Without a matching except, an error still crashes the program.",
    codeExample: {
      label: 'In real code',
      code: `try:\n    result = 10 / 0\nexcept ZeroDivisionError:\n    print("Can't divide by zero!")`,
      output: [
        'result = 10 / 0 → 💥 error happens here',
        'except ZeroDivisionError catches it',
        '"Can\'t divide by zero!"',
        '✓ Program keeps running instead of crashing',
      ],
    },
    kaiClaim: {
      text: "So if I don't write an except block at all, Python just silently ignores any error?",
      isCorrect: false,
      whyRight: "No — with no except block, an error crashes the program. try/except only helps if you actually catch it.",
    },
    quiz: [
      {
        id: 'exception-handling-q1',
        question: "What happens to the program if the code inside try fails and there's a matching except block?",
        options: ['The except block runs and the program keeps going', 'The whole program crashes anyway', 'Python ignores the error silently with no message'],
        correctIndex: 0,
        explainCorrect: "Exactly — the except block catches the error, and the program continues.",
        explainIncorrect: "Not quite — with a matching except block, the program does NOT crash, and it's not silently ignored either. The except code runs.",
        hint: "Think about the safety net again — does the tightrope walker's show stop the moment they slip?",
      },
    ],
  },
];

const REACT_CONCEPTS = [
  {
    id: 'components',
    order: 1,
    title: 'Components',
    tagline: 'LEGO bricks for a webpage',
    expandReaction: "Good starting point — everything else in React builds on this idea.",
    analogy: {
      emoji: '🧱',
      text: "A React component is like a LEGO brick — a small, reusable piece you can snap into different parts of a page, or reuse many times, instead of building the whole wall from scratch every time.",
    },
    explainer: "A component is a reusable, self-contained piece of UI, written as a function that returns what should appear on screen. Once built, the same component can be reused anywhere on the page, as many times as needed, each instance independent of the others.",
    codeExample: {
      label: 'In real code',
      code: `function Greeting() {\n  return <h1>Hello!</h1>;\n}\n\n<Greeting />\n<Greeting />`,
      output: [
        '<Greeting /> → renders "Hello!"',
        '<Greeting /> → renders "Hello!" again',
        '✓ Same component reused twice on the page',
      ],
    },
    kaiClaim: {
      text: "So a component can only ever be used once per page, right?",
      isCorrect: false,
      whyRight: "Not at all — the same component can be reused as many times as you want, like the same LEGO brick in different spots.",
    },
    quiz: [
      {
        id: 'components-q1',
        question: 'Why do developers break a page into components instead of writing one giant block of HTML?',
        options: ['Each component can be reused and tested on its own', 'Components make the page load slower', 'React requires exactly one component per page'],
        correctIndex: 0,
        explainCorrect: "Right — reusable, testable pieces instead of one giant tangled block.",
        explainIncorrect: "Not quite — components don't slow the page down, and React doesn't limit you to one per page.",
        hint: "Think about LEGO bricks again — why build with bricks instead of carving one solid block?",
      },
    ],
  },
  {
    id: 'props-vs-state',
    order: 2,
    title: 'Props vs State',
    tagline: 'A letter you\'re handed vs your own notebook',
    expandReaction: "Classic interview question — this trips up a lot of people who\'ve only used React casually.",
    analogy: {
      emoji: '✉️',
      text: "Props are like a letter someone hands you — you can read it, but you can't rewrite what it says. State is like your own notebook — you can update it yourself whenever you want.",
    },
    explainer: "Props are data passed into a component from its parent — read-only from the component's own perspective. State is data a component owns and manages itself, and can update over time, causing the component to re-render when it changes.",
    codeExample: {
      label: 'In real code',
      code: `function Welcome(props) {\n  return <p>Hi, {props.name}!</p>;\n}\n\n<Welcome name="Amit" />`,
      output: [
        '<Welcome name="Amit" /> → "Hi, Amit!"',
        '✓ Welcome cannot change props.name itself — only the parent that sent it can',
      ],
    },
    kaiClaim: {
      text: "So props and state are basically the same thing, just different names?",
      isCorrect: false,
      whyRight: "Not the same — props come from outside and can't be changed by the component itself; state is owned and changed by the component.",
    },
    quiz: [
      {
        id: 'props-vs-state-q1',
        question: 'Can a component change the value of a prop it receives?',
        options: ['No — props are read-only, only the parent passing them can change them', 'Yes, anytime it wants', 'Only if the prop is a number'],
        correctIndex: 0,
        explainCorrect: "Right — props flow one direction, from parent down, read-only for the child.",
        explainIncorrect: "Not quite — props aren't writable by the component receiving them, regardless of their type.",
        hint: "Think about the letter again — can the person who received it rewrite what it originally said?",
      },
    ],
  },
  {
    id: 'usestate-hook',
    order: 3,
    title: 'The useState Hook',
    tagline: 'A whiteboard the component owns',
    expandReaction: "This is the hook you'll use constantly — worth getting really comfortable with.",
    analogy: {
      emoji: '📋',
      text: "useState gives a component its own personal whiteboard. It can write something down (the initial value), and erase-and-rewrite it anytime (update the state) — and the moment it rewrites, the page redraws to match.",
    },
    explainer: "useState returns a piece of state and a function to update it. Calling the updater function doesn't just change a plain variable — it tells React to re-render the component with the new value, which is what actually makes the screen update.",
    codeExample: {
      label: 'In real code',
      code: `function Counter() {\n  const [count, setCount] = useState(0);\n  return <button onClick={() => setCount(count + 1)}>{count}</button>;\n}`,
      output: [
        'initial render → button shows 0',
        'click → setCount(1) called',
        'button re-renders → shows 1',
        '✓ Calling setCount tells React to redraw with the new value',
      ],
    },
    kaiClaim: {
      text: "So I could just write count = count + 1 directly instead of calling setCount, and the screen would still update?",
      isCorrect: false,
      whyRight: "No — React only knows to redraw the screen when you call the setter function (setCount), not from a plain variable reassignment.",
    },
    quiz: [
      {
        id: 'usestate-hook-q1',
        question: "What triggers the button's displayed number to update after a click?",
        options: ['Calling setCount, which tells React to re-render with the new state', 'The page automatically refreshes every second', 'Directly editing the count variable'],
        correctIndex: 0,
        explainCorrect: "Right — the setter function is what tells React something changed.",
        explainIncorrect: "Not quite — there's no auto-refresh timer, and directly editing a variable wouldn't trigger a re-render.",
        hint: "Think about the whiteboard again — does the room magically know you erased something, or do you have to announce it?",
      },
    ],
  },
  {
    id: 'useeffect-hook',
    order: 4,
    title: 'The useEffect Hook',
    tagline: '"Once the room is set up, do this"',
    expandReaction: "A lot of React bugs come from misunderstanding exactly when this runs — worth being precise about it.",
    analogy: {
      emoji: '🗒️',
      text: "useEffect is like a sticky note that says 'once the room is fully set up, do this task' — for example, fetching data right after the component first appears on screen, rather than trying to do it while the room is still being built.",
    },
    explainer: "useEffect runs code after the component renders, not during. Passing an empty array [] as the second argument means the effect runs exactly once, right after the first render — a common pattern for fetching initial data.",
    codeExample: {
      label: 'In real code',
      code: `useEffect(() => {\n  console.log("Component appeared!");\n}, []);`,
      output: [
        '(component renders)',
        'Component appeared!',
        '✓ The effect ran once, right after the first render, because [] means "no dependencies"',
      ],
    },
    kaiClaim: {
      text: "So useEffect with [] runs before the component even shows up on screen?",
      isCorrect: false,
      whyRight: "Actually the opposite — it runs right after the first render, once the component is already on screen, not before.",
    },
    quiz: [
      {
        id: 'useeffect-hook-q1',
        question: 'What does passing an empty array [] as the second argument to useEffect mean?',
        options: ['Run this effect once, right after the first render', 'Run this effect on every single render forever', 'Never run this effect at all'],
        correctIndex: 0,
        explainCorrect: "Right — an empty dependency array means 'just once, after the first render.'",
        explainIncorrect: "Not quite — [] doesn't mean 'run forever' or 'never run', it means the effect only fires once.",
        hint: "Think about the sticky note again — does it say 'do this once the room is ready' or 'keep doing this forever'?",
      },
    ],
  },
  {
    id: 'virtual-dom',
    order: 5,
    title: 'The Virtual DOM',
    tagline: 'A rough draft before the final copy',
    expandReaction: "This is the concept behind why React feels fast — worth understanding, not just memorizing.",
    analogy: {
      emoji: '📝',
      text: "Instead of rewriting the whole real page every time something changes (slow, like recopying an entire essay for one fixed typo), React first writes a quick rough draft (the virtual DOM), compares it to the last draft, and only updates the exact words that actually changed on the real page.",
    },
    explainer: "The virtual DOM is a lightweight in-memory copy of the page. When state changes, React builds a new virtual DOM, compares (diffs) it against the previous one, and only applies the minimal real changes needed to the actual page — instead of re-rendering everything from scratch.",
    codeExample: {
      label: 'In real code',
      code: `// Before: <p>Count: 3</p>\n// After:  <p>Count: 4</p>\n// React only updates the "3" -> "4" text,\n// not the whole <p> element or the rest of the page`,
      output: [
        'Compares old draft vs new draft',
        'Finds only the number changed',
        '✓ Updates just that one piece of the real page, not everything',
      ],
    },
    kaiClaim: {
      text: "So the virtual DOM completely replaces the real webpage — there's no real DOM anymore?",
      isCorrect: false,
      whyRight: "No — the virtual DOM is just a lightweight comparison draft. The real DOM (the actual page) still exists and gets selectively updated.",
    },
    quiz: [
      {
        id: 'virtual-dom-q1',
        question: 'Why does React use a virtual DOM instead of directly rewriting the whole page on every change?',
        options: ['To figure out the minimal real changes needed, instead of redrawing everything', "Because browsers don't allow direct DOM updates", 'Because it makes the code shorter to write'],
        correctIndex: 0,
        explainCorrect: "Right — the virtual DOM exists purely to compute the smallest necessary update.",
        explainIncorrect: "Not quite — browsers do allow direct DOM updates, and code length isn't the reason for the virtual DOM's existence.",
        hint: "Think about the rough draft again — why compare drafts instead of just recopying the whole essay every time?",
      },
    ],
  },
  {
    id: 'conditional-rendering',
    order: 6,
    title: 'Conditional Rendering',
    tagline: 'A bouncer at the door',
    expandReaction: "Simple idea, shows up in almost every real component you'll ever write.",
    analogy: {
      emoji: '🚪',
      text: "Conditional rendering is like a bouncer checking a condition before letting content onto the page — 'if logged in, show the dashboard; if not, show the login button' — only the right content gets through.",
    },
    explainer: "Conditional rendering means a component decides what to display based on a condition, usually with a ternary or if statement, rather than always showing the same fixed markup. The same component can return different content depending on its props or state.",
    codeExample: {
      label: 'In real code',
      code: `function Greeting({ loggedIn }) {\n  return loggedIn ? <p>Welcome back!</p> : <p>Please log in.</p>;\n}`,
      output: [
        '<Greeting loggedIn={true} /> → "Welcome back!"',
        '<Greeting loggedIn={false} /> → "Please log in."',
        '✓ Same component, different content based on the condition',
      ],
    },
    kaiClaim: {
      text: "So conditional rendering means writing two totally separate components, one for each case?",
      isCorrect: false,
      whyRight: "No — it's one component that decides which content to return, based on a condition, not two separate components.",
    },
    quiz: [
      {
        id: 'conditional-rendering-q1',
        question: 'What decides which message actually gets shown to the user?',
        options: ['The value of the loggedIn prop at render time', 'Whichever message was written first in the code', 'Both messages always show together'],
        correctIndex: 0,
        explainCorrect: "Right — the prop's value at render time decides which branch runs.",
        explainIncorrect: "Not quite — code order and showing both messages aren't how this works. The condition's value decides.",
        hint: "Think about the bouncer again — does the order the rules were written matter, or does the actual condition at the door?",
      },
    ],
  },
  {
    id: 'lists-and-keys',
    order: 7,
    title: 'Lists & Keys',
    tagline: 'Name tags at a reunion',
    expandReaction: "Last one — small detail, but skipping it causes real, hard-to-spot bugs.",
    analogy: {
      emoji: '🏷️',
      text: "When React renders a list of items, keys are like name tags at a family reunion — even if people move around or the order changes, the name tag tells React exactly who's who, so it doesn't get confused about who moved where.",
    },
    explainer: "When rendering a list with .map(), each item needs a unique key prop so React can track which item is which across re-renders — especially important if the list can be reordered, filtered, or have items added/removed.",
    codeExample: {
      label: 'In real code',
      code: `const items = ['Apple', 'Banana', 'Cherry'];\nitems.map((item) => <li key={item}>{item}</li>);`,
      output: [
        'renders 3 <li> elements',
        'each tagged with its own key ("Apple", "Banana", "Cherry")',
        '✓ If the list reorders later, React uses these keys to track which item is which',
      ],
    },
    kaiClaim: {
      text: "So I could just use the array index (0, 1, 2) as the key every time, and it would always work perfectly?",
      isCorrect: false,
      whyRight: "It works for simple static lists, but if items get reordered, added, or removed, using the index as a key can confuse React about which item is which — a stable unique ID is safer.",
    },
    quiz: [
      {
        id: 'lists-and-keys-q1',
        question: 'Why does React ask for a unique key when rendering a list of items?',
        options: ['So it can correctly track which item is which, especially if the list changes order', 'Keys make the list render faster no matter what', 'Keys are just for developer readability, React ignores them'],
        correctIndex: 0,
        explainCorrect: "Right — keys let React correctly track identity across re-renders.",
        explainIncorrect: "Not quite — keys aren't ignored by React, and they're not primarily a speed feature. They're about correctly tracking which item is which.",
        hint: "Think about the name tags again — what goes wrong at the reunion if two people swap tags?",
      },
    ],
  },
];

export const TECH_TRACKS = [
  { id: 'java', name: 'Java', icon: '☕', topic: 'java', concepts: JAVA_CONCEPTS },
  { id: 'python', name: 'Python', icon: '🐍', topic: 'python', concepts: PYTHON_CONCEPTS },
  { id: 'react', name: 'React', icon: '⚛️', topic: 'react', concepts: REACT_CONCEPTS },
];

export const getTrack = (trackId) => TECH_TRACKS.find(t => t.id === trackId);
export const getConceptById = (trackId, conceptId) => getTrack(trackId)?.concepts.find(c => c.id === conceptId);
export const getNextConcept = (trackId, currentId) => {
  const concepts = getTrack(trackId)?.concepts || [];
  const idx = concepts.findIndex(c => c.id === currentId);
  return idx >= 0 && idx < concepts.length - 1 ? concepts[idx + 1] : null;
};

// Keywords used to surface real interview questions related to each concept —
// bridges the simplified analogy back into the actual question bank.
const RELATED_KEYWORDS = {
  java: {
    'classes-vs-objects': ['constructor', 'instantiat'],
    encapsulation: ['encapsulat'],
    inheritance: ['inherit'],
    polymorphism: ['polymorph'],
    abstraction: ['abstract'],
    interfaces: ['interface'],
    constructors: ['constructor'],
  },
  python: {
    'variables-dynamic-typing': ['dynamic typ'],
    'lists-vs-tuples': ['tuple'],
    dictionaries: ['dictionar', 'dict'],
    'list-comprehension': ['comprehension'],
    'functions-default-args': ['default argument', 'keyword argument'],
    decorators: ['decorator'],
    'exception-handling': ['exception', 'try/except', 'try-except'],
  },
  react: {
    components: ['component'],
    'props-vs-state': ['props', 'state'],
    'usestate-hook': ['usestate'],
    'useeffect-hook': ['useeffect'],
    'virtual-dom': ['reconcil'],
    'conditional-rendering': ['conditional render'],
    'lists-and-keys': ['key prop'],
  },
};

export function getRelatedQuestions(trackId, conceptId, allQuestions, limit = 3) {
  const track = getTrack(trackId);
  if (!track) return [];
  const keywords = RELATED_KEYWORDS[trackId]?.[conceptId] || [];
  if (!keywords.length) return [];
  return allQuestions
    .filter(q => q.topic === track.topic && keywords.some(kw => q.body.toLowerCase().includes(kw)))
    .sort((a, b) => (b.upvotes || 0) - (a.upvotes || 0))
    .slice(0, limit);
}
