import { HexGroup } from "./hex.js";

let canvas,
    mouse = { down: [false, false, false], x: 0, y: 0 };

/** @type {CanvasRenderingContext2D} */
let ctx;

const a = (2 * Math.PI) / 6;
const r = window.innerHeight / 8;
const startx = window.innerWidth / 2 - r * 4.5;
const starty = window.innerHeight / 2 - 30;

class Hex {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.verts = [];
        this.color = "#121212";

        for (var i = 0; i < 6; i++) {
            let _x = this.x + r * Math.cos(a * i);
            let _y = this.y + r * Math.sin(a * i);
            this.verts.push([_x, _y]);
            console.log(_x, _y);
        }
    }

    draw() {
        ctx.strokeStyle = "#FFFFFF";
        ctx.beginPath();
        ctx.moveTo(this.verts[0][0], this.verts[0][1]);
        for (var i = 1; i < 6; i++) {
            ctx.lineTo(this.verts[i][0], this.verts[i][1]);
        }
        ctx.closePath();
        ctx.stroke();
        if (this.color) {
            ctx.fillStyle = this.color;
            ctx.fill();
        }
    }

    isClicked() {
        let i, j;
        let c = false;
        for (i = 0, j = this.verts.length - 1; i < this.verts.length; j = i++) {
            if (
                this.verts[i][1] > mouse.y != this.verts[j][1] > mouse.y &&
                mouse.x <
                    ((this.verts[j][0] - this.verts[i][0]) * (mouse.y - this.verts[i][1])) /
                        (this.verts[j][1] - this.verts[i][1]) +
                        this.verts[i][0]
            ) {
                c = !c;
            }
        }
        this.color = c ? "rgba(12, 12, 12, 100  )" : "#121212";
        return c;
    }
}

const hexes = new HexGroup();

window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };

window.onload = () => {
    canvas = document.getElementById("canvas");

    ctx = canvas.getContext("2d", { alpha: false });

    // ctx.imageSmoothingEnabled = true;

    canvas.width = innerWidth;
    canvas.height = innerHeight;

    document.addEventListener("mousemove", (event) => {
        (mouse.x = event.clientX), (mouse.y = event.clientY);
    });
    document.addEventListener("mousedown", (event) => {
        hexes.updateClicks();
        mouse.down[event.button] = true;
        event.preventDefault();
    });
    document.addEventListener("mouseup", (event) => {
        mouse.down[event.button] = false;
        event.preventDefault();
    });

    document.onkeydown = (event) => {
        switch (event.key) {
            case "c":
                console.log("pressed c");
                break;
        }
    };

    document.oncontextmenu = (e) => {
        e.preventDefault();
    };

    const generateHexes = () => {
        // hexes.add(new Hex(500, 500));

        let x = startx;
        let y = starty;
        for (let i = 1; i <= 4; i++) {
            for (let j = 1; j <= 4; j++) {
                hexes.add(new Hex(x, y));
                // ctx.font = "15px Comic Sans MS";
                // ctx.fillStyle = "red";
                // ctx.textAlign = "center";
                // ctx.fillText("Hello World", x, y);
                x += r + r * Math.cos(a);
                y -= r * Math.sin(a);
            }
            x = startx;
            y = starty;
            x += (r + r * Math.cos(a)) * i;
            y += r * Math.sin(a) * i;
        }
    };

    document.addEventListener("resize", () => {
        canvas.width = innerWidth;
        canvas.height = innerHeight;
        generateHexes();
    });

    generateHexes();

    update();
};

const update = () => {
    requestAnimFrame(update);

    ctx.fillStyle = "#000";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    hexes.draw();
};
