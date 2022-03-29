export class Hex {
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

    update() {
        this.onClick();
        this.draw();
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

    onClick() {
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
        this.color = c ? "rgba(12, 12, 12, 100)" : "#121212";
        return c;
    }
}

export class HexGroup {
    constructor() {
        this.group = [];
    }
    add = (/** @type {Hex}*/ hex) => {
        this.group.push(hex);
    };
    getId = (/** @type {Hex}*/ hex) => {
        return this.group.indexOf(hex);
    };
    draw = () => {
        for (let i = 0; i < this.group.length; i++) {
            this.group[i].draw();
        }
    };
    updateClicks = () => {
        for (let i = 0; i < this.group.length; i++) {
            console.log(this.group[i].isClicked());
        }
    };
}
