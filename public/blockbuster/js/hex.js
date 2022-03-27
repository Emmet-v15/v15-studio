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
