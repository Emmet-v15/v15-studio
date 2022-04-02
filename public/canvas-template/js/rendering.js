export class Rendering {
    constructor() {
        console.log("Parent constructor");
        this.start();

        setInterval(() => {
            requestAnimationFrame(this.update);
        }, 1000 / 120);
    }

    start() {
        console.log("Parent start");
    }
    update() {
        console.log("Parent update");
    }
}
