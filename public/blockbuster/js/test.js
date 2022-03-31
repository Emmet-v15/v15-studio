class A {
    speak() {
        console.log("I'm A");
    }
}

class B extends A {
    speak() {
        super.speak();

        console.log("I'm B");
    }
}

var a = new A();
a.speak();

var b = new B();
b.speak();
