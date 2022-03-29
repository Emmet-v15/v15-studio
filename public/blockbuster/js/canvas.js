import { HexGroup, Hex } from "./hex.js";
import { Rendering } from "./rendering.js";

class BlockBuster extends Rendering {
    start() {
        const a = (2 * Math.PI) / 6;
        const r = window.innerHeight / 8;
        const startx = window.innerWidth / 2 - r * 4.5;
        const starty = window.innerHeight / 2 - 30;

        this.hexes = new HexGroup();

        let x = startx;
        let y = starty;
        for (let i = 1; i <= 4; i++) {
            for (let j = 1; j <= 4; j++) {
                this.hexes.add(new Hex(x, y, r));
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
    }
    update() {
        requestAnimFrame(this.update);
        this.ctx.fillStyle = "#000";
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);

        this.hexes.update();
        console.log("test1");
    }
}

window.addEventListener("load", (event) => {
    const game = new BlockBuster(document.getElementById("canvas"));
});
