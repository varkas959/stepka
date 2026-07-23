// "Java Concepts Explained Simply" — 5th-grade-level analogies for core OOP ideas.
// Each concept has a short reading (analogy + explainer + code) and a 1-2 question
// quiz, graded locally (no AI call) so the mascot can react instantly.

export const JAVA_CONCEPTS = [
  {
    id: 'classes-vs-objects',
    order: 1,
    title: 'Classes vs Objects',
    tagline: 'The blueprint and the thing you build from it',
    analogy: {
      emoji: '🍪',
      text: "A class is like a cookie cutter — it's the shape. An object is the actual cookie you get when you press the cutter into dough. You can make many cookies (objects) from one cutter (class), and each cookie can have its own sprinkles (data).",
    },
    explainer: "In Java, a class is a template that describes what an object will look like and what it can do — its fields (data) and methods (actions). An object is a real instance created from that class using the `new` keyword. You can create as many objects as you want from a single class, and each one holds its own separate copy of the data.",
    codeExample: {
      label: 'In real code',
      code: `class Cookie {\n  String flavor;\n}\n\nCookie choc = new Cookie();\nchoc.flavor = "chocolate chip";\n\nCookie sugar = new Cookie();\nsugar.flavor = "sugar";\n// choc and sugar are two separate objects from the same class`,
    },
    quiz: [
      {
        id: 'classes-vs-objects-q1',
        question: 'If Cookie is a class, what is choc in the code above?',
        options: ['An object made from the Cookie class', 'A method inside the class', 'A brand new class'],
        correctIndex: 0,
        explainCorrect: "Right — choc is a real cookie made using the Cookie cutter (class).",
        explainIncorrect: "Not quite — choc was created with `new Cookie()`, which makes an object, not a class or a method.",
      },
    ],
  },
  {
    id: 'encapsulation',
    order: 2,
    title: 'Encapsulation',
    tagline: 'Hiding the messy stuff behind a clean label',
    analogy: {
      emoji: '💊',
      text: "Encapsulation is like a fever capsule your mother gives you: you don't see what's inside, but taking it reduces your fever. You don't need to know the exact chemicals — you just need to know 'take one, fever goes down.' The capsule hides the complicated part and only shows you the simple result.",
    },
    explainer: "In Java, a class hides its internal data (fields) by marking them `private`, and only exposes safe, controlled ways to use that data through public methods. Other code doesn't need to know or touch the internal details — it just calls the method and gets the result, the same way you don't need to know the capsule's ingredients to feel better.",
    codeExample: {
      label: 'In real code',
      code: `public class Capsule {\n  private int feverLevel = 10; // hidden inside\n\n  public void takeMedicine() {\n    feverLevel -= 2; // logic stays inside the class\n  }\n\n  public int getFeverLevel() {\n    return feverLevel; // controlled peek, not direct access\n  }\n}`,
    },
    quiz: [
      {
        id: 'encapsulation-q1',
        question: 'Why do we mark a class field as private instead of public?',
        options: ['So other classes cannot change it directly without going through a method', 'So the code runs faster', 'So Java lets us compile the file'],
        correctIndex: 0,
        explainCorrect: "Exactly — private hides the 'medicine', the public method is the only door in.",
        explainIncorrect: "Not quite — private isn't about speed or compiling, it's about controlling access.",
      },
    ],
  },
  {
    id: 'inheritance',
    order: 3,
    title: 'Inheritance',
    tagline: 'Children get their parents\' traits — plus a few of their own',
    analogy: {
      emoji: '👨‍👩‍👧',
      text: "Inheritance is like a child inheriting eye color and height from their parent — they get those traits automatically, without learning them from scratch. But the child can also have their own hobbies the parent never had. In the same way, a new class can 'inherit' everything from an existing class, and then add its own extra abilities.",
    },
    explainer: "In Java, a class can `extend` another class to automatically get all of its fields and methods, without rewriting them. The new class (the 'child' or subclass) can also add new methods or override existing ones to behave differently — it inherits, but isn't limited to exactly the same behavior as the parent.",
    codeExample: {
      label: 'In real code',
      code: `class Animal {\n  void eat() { System.out.println("eating"); }\n}\n\nclass Dog extends Animal {\n  void bark() { System.out.println("woof!"); }\n}\n\nDog d = new Dog();\nd.eat();  // inherited from Animal\nd.bark(); // Dog's own extra ability`,
    },
    quiz: [
      {
        id: 'inheritance-q1',
        question: 'In the code above, why can a Dog object call eat() even though eat() is only written inside the Animal class?',
        options: ['Because Dog extends Animal, so it inherits Animal\'s methods', 'Because eat() is a special Java keyword', 'Because Dog and Animal are the exact same class'],
        correctIndex: 0,
        explainCorrect: "Exactly — extending Animal means Dog automatically gets everything Animal has.",
        explainIncorrect: "Not quite — `eat()` isn't a keyword, and Dog and Animal are two different classes. The `extends` keyword is what connects them.",
      },
    ],
  },
  {
    id: 'polymorphism',
    order: 4,
    title: 'Polymorphism',
    tagline: 'One button, different results depending on what it\'s pointed at',
    analogy: {
      emoji: '📺',
      text: "Polymorphism is like a universal remote's power button — pressing the same button turns on a TV, an AC, or a fan, but each device reacts in its own way. The action ('press power') looks the same from the outside, but what actually happens depends on which device is receiving it.",
    },
    explainer: "In Java, polymorphism lets you call the same method name on different objects, and each object responds in its own way. This usually happens through method overriding — a subclass provides its own version of a method that a parent class also defines — so code that just calls `.makeSound()` gets different behavior depending on the actual object underneath, without needing to know which exact type it is.",
    codeExample: {
      label: 'In real code',
      code: `class Animal {\n  void makeSound() { System.out.println("some sound"); }\n}\nclass Dog extends Animal {\n  void makeSound() { System.out.println("Woof!"); }\n}\nclass Cat extends Animal {\n  void makeSound() { System.out.println("Meow!"); }\n}\n\nAnimal a1 = new Dog();\nAnimal a2 = new Cat();\na1.makeSound(); // Woof!\na2.makeSound(); // Meow!`,
    },
    quiz: [
      {
        id: 'polymorphism-q1',
        question: 'Why do a1.makeSound() and a2.makeSound() print different things even though both variables are typed as Animal?',
        options: ['Because the actual object underneath (Dog or Cat) decides which version of makeSound() runs', 'Because Animal has two different makeSound() methods', 'Because Java picks randomly each time'],
        correctIndex: 0,
        explainCorrect: "Right — like the remote's power button, the same call does something different depending on the real device (object) underneath.",
        explainIncorrect: "Not quite — Animal only has one makeSound() method. It's the real object type (Dog vs Cat) that decides which overridden version actually runs.",
      },
    ],
  },
  {
    id: 'abstraction',
    order: 5,
    title: 'Abstraction',
    tagline: 'Using something without needing to know how it works inside',
    analogy: {
      emoji: '🚗',
      text: "Abstraction is like driving a car — you press the accelerator and the car moves. You don't need to understand the engine, the fuel injection, or the transmission to drive. The car exposes a simple set of controls (pedal, wheel) and hides all the complicated machinery behind them.",
    },
    explainer: "In Java, abstraction means exposing only the essential, simple actions to the outside world (often through an abstract class or interface), while hiding the complicated implementation details behind them. The person using the class only needs to know what a method does, not exactly how it does it internally.",
    codeExample: {
      label: 'In real code',
      code: `abstract class Car {\n  abstract void accelerate(); // just the pedal, no engine detail\n}\n\nclass ElectricCar extends Car {\n  void accelerate() {\n    // complicated battery/motor logic hidden here\n    System.out.println("silently speeding up");\n  }\n}`,
    },
    quiz: [
      {
        id: 'abstraction-q1',
        question: 'What does abstraction let a driver (or a programmer using a class) avoid?',
        options: ['Needing to understand the complicated internal details to use it', 'Ever needing to write any code at all', 'Having more than one class in a program'],
        correctIndex: 0,
        explainCorrect: "Exactly — you just use the simple controls, the complexity stays hidden inside.",
        explainIncorrect: "Not quite — abstraction doesn't mean no code is written, it means the complicated code is hidden behind a simple interface.",
      },
    ],
  },
  {
    id: 'interfaces',
    order: 6,
    title: 'Interfaces',
    tagline: 'A standard shape that anything can plug into',
    analogy: {
      emoji: '🔌',
      text: "An interface is like a power socket standard — any device with the right plug shape can be used, whether it's a lamp, a charger, or a fan. The socket doesn't care what the device does internally, only that it fits the agreed-upon shape.",
    },
    explainer: "In Java, an interface defines a set of methods that any class implementing it must provide, without saying how those methods actually work. Different classes can implement the same interface in completely different ways, just like different devices fitting the same plug shape but doing very different jobs.",
    codeExample: {
      label: 'In real code',
      code: `interface Chargeable {\n  void charge();\n}\n\nclass Phone implements Chargeable {\n  public void charge() { System.out.println("phone charging"); }\n}\n\nclass Laptop implements Chargeable {\n  public void charge() { System.out.println("laptop charging"); }\n}`,
    },
    quiz: [
      {
        id: 'interfaces-q1',
        question: 'Why can both Phone and Laptop implement Chargeable even though they charge very differently?',
        options: ['An interface only requires the method to exist, not how it works inside', 'Phone and Laptop are secretly the same class', 'Chargeable writes the charging logic for both of them'],
        correctIndex: 0,
        explainCorrect: "Right — like a power socket, the interface only cares that the plug (method) exists, not what's on the other end.",
        explainIncorrect: "Not quite — Phone and Laptop are separate classes, and Chargeable doesn't write any logic itself, it just requires that charge() exists.",
      },
    ],
  },
  {
    id: 'constructors',
    order: 7,
    title: 'Constructors',
    tagline: 'Filled in the moment something is created',
    analogy: {
      emoji: '📜',
      text: "A constructor is like a birth certificate — it gets filled out the exact moment a baby is born, recording the name and birth date right away. In the same way, a constructor runs the instant an object is created, setting up its starting information before you use it for anything else.",
    },
    explainer: "In Java, a constructor is a special method with the same name as the class, called automatically when you use `new`. It's used to set up an object's initial state — for example, giving it a starting name or value — so the object is never left in an incomplete or undefined state.",
    codeExample: {
      label: 'In real code',
      code: `class Person {\n  String name;\n\n  Person(String givenName) { // constructor\n    name = givenName;\n  }\n}\n\nPerson p = new Person("Amit"); // constructor runs right here\nSystem.out.println(p.name); // "Amit"`,
    },
    quiz: [
      {
        id: 'constructors-q1',
        question: 'When does the Person constructor actually run?',
        options: ['The instant `new Person("Amit")` is called', 'Only if you call it manually later', 'Only when the program finishes running'],
        correctIndex: 0,
        explainCorrect: "Exactly — just like a birth certificate, it's filled in right at the moment of creation.",
        explainIncorrect: "Not quite — constructors run automatically with `new`, you never call them manually like a regular method.",
      },
    ],
  },
];

export const getConceptById = (id) => JAVA_CONCEPTS.find(c => c.id === id);
export const getNextConcept = (currentId) => {
  const idx = JAVA_CONCEPTS.findIndex(c => c.id === currentId);
  return idx >= 0 && idx < JAVA_CONCEPTS.length - 1 ? JAVA_CONCEPTS[idx + 1] : null;
};
