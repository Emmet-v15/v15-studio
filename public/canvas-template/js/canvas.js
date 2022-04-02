import { Rendering } from "./rendering.js";

class Game extends Rendering {
    constructor(params) {
        super(params);
        console.log("Game constructor");
    }

    start() {
        super.start();
        console.log("Game start");
    }

    update() {
        super.update();
        console.log("Game update");
    }
}

new Game();
