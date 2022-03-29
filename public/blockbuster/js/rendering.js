/** @type {CanvasRenderingContext2D} */
let canvas;
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
    canvas = document.getElementById("canvas");
    canvas.width = innerWidth;
    canvas.height = innerHeight;

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

    start();
    update();
});

export class Rendering {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext("2d", { alpha: false });
        requestAnimFrame(this.update);
    }
    start = () => {};
    update = () => {
        requestAnimFrame(this.update);
    };
}
