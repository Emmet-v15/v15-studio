/** @type {CanvasRenderingContext2D} */
let mouse = { down: [false, false, false], x: 0, y: 0 };

window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };

window.addEventListener("load", (event) => {
    document.oncontextmenu = (e) => {
        e.preventDefault();
    };
    document.addEventListener("mousemove", (event) => {
        (mouse.x = event.clientX), (mouse.y = event.clientY);
    });
    document.addEventListener("mousedown", (event) => {
        mouse.down[event.button] = true;
        event.preventDefault();
    });
    document.addEventListener("mouseup", (event) => {
        mouse.down[event.button] = false;
        event.preventDefault();
    });

    // document.onkeydown = (event) => {
    //     switch (event.key) {
    //         case "c":
    //             console.log("pressed c");
    //             break;
    //     }
    // };
});

export class Rendering {
    constructor(canvas) {
        this.canvas = canvas;
        this.canvas.width = innerWidth;
        this.canvas.height = innerHeight;

        this.ctx = canvas.getContext("2d", { alpha: false });

        this.start();

        while (true) {
            requestAnimFrame(this.update);
        }
    }
    start = () => {};
    update = () => {
        console.log("parent update");
    };
}
