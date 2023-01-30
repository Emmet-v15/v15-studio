let NUM_BALLS = 300,
    DAMPING = 0.6,
    GRAVITY = 9.8 / 100,
    GRAVITY_ENABLED = true,
    MOUSE_SIZE = 100,
    SPEED = 1;
clayMode = false;

let canvas,
    ctx,
    TWO_PI = Math.PI * 2,
    balls = [],
    mouse = { down: [false, false, false], x: 0, y: 0 };

window.requestAnimFrame =
    window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (callback) {
        window.setTimeout(callback, 1000 / 60);
    };

let Ball = function (x, y, radius) {
    this.x = x;
    this.y = y;

    this.px = x;
    this.py = y;

    this.fx = (Math.random() - 0.5) * 10;
    this.fy = (Math.random() - 0.5) * 10;

    this.radius = radius; // + Math.random() * 10;
    this.volume = (Math.PI * this.radius) ^ 2;
    this.density = 0.1;
    this.mass = this.density * this.volume;

    this.link = undefined;

    this.color = [0, 0, 255, 1];
};

Ball.prototype.apply_force = function (delta) {
    delta *= delta;

    if (!clayMode && GRAVITY_ENABLED) this.fy += GRAVITY * this.mass;

    this.fx = Math.min(this.fx, 1000);
    this.fy = Math.min(this.fy, 1000);

    this.x += this.fx * delta;
    this.y += this.fy * delta;

    this.fx = this.fy = 0;
};

Ball.prototype.verlet = function () {
    let nx = this.x * 2 - this.px;
    let ny = this.y * 2 - this.py;

    this.px = this.x;
    this.py = this.y;

    this.x = nx;
    this.y = ny;
};

Ball.prototype.draw = function (ctx) {
    ctx.fillStyle = this.fillstyle;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, TWO_PI);
    ctx.fill();
};

//---------------------------------------

let resolve_collisions = function (ip, ctx) {
    let i = balls.length;

    while (i--) {
        //balls[i].color = [0, 255, 0, 1];
        let ball_1 = balls[i];

        let speed = 1 + Math.sqrt((ball_1.x - ball_1.px) * (ball_1.x - ball_1.px) + (ball_1.y - ball_1.py) * (ball_1.y - ball_1.py));
        let alpha = Math.max(Math.min(ball_1.color[3] * Math.max(Math.abs(ball_1.fx), Math.abs(ball_1.fy) + 0.2), 1), 0.3);
        let red = Math.min(((ball_1.color[0] + 10) * speed) / 2, 180) + ((innerHeight - ball_1.y) / innerHeight) * 255;

        let diff_x_mouse = ball_1.x - mouse.x;
        let diff_y_mouse = ball_1.y - mouse.y;
        let dist_mouse = Math.sqrt(diff_x_mouse * diff_x_mouse + diff_y_mouse * diff_y_mouse);

        if (mouse.down[0]) {
            let real_dist = dist_mouse - (ball_1.radius + MOUSE_SIZE);

            if (real_dist < 0) {
                let depth_x = diff_x_mouse * (real_dist / dist_mouse);
                let depth_y = diff_y_mouse * (real_dist / dist_mouse);

                ball_1.x -= depth_x * 0.05 * (clayMode * 10 + 1);
                ball_1.y -= depth_y * 0.05 * (clayMode * 10 + 1);
            }
            alpha = 200 / dist_mouse;
        }

        if (ip && mouse.down[2]) {
            let xDist = mouse.x - ball_1.x;
            let yDist = mouse.y - ball_1.y;
            let length = Math.sqrt(xDist * xDist + yDist * yDist);
            let unit_x = xDist / length;
            let unit_y = yDist / length;
            let force = (300 / Math.max(length, 300)) * ball_1.density * ball_1.mass * (clayMode * 10 + 1);

            ball_1.fx += unit_x * force * 2;
            ball_1.fy += unit_y * force * 2;
            alpha = 200 / dist_mouse;
        }

        ball_1.fillstyle = `rgb(
            ${(200 / dist_mouse) * alpha},
            ${(Math.min(((ball_1.color[0] + 10) * speed) / 2, 180) + ((innerHeight - ball_1.y) / innerHeight) * 255) * alpha},
            ${(ball_1.color[2] + 10) * alpha})`;

        let n = balls.length;
        while (n--) {
            if (n == i) continue;

            let ball_2 = balls[n];

            let diff_x = ball_1.x - ball_2.x;
            let diff_y = ball_1.y - ball_2.y;

            let length = diff_x * diff_x + diff_y * diff_y;
            let dist = Math.sqrt(length);
            let real_dist = dist - (ball_1.radius + ball_2.radius);

            if (real_dist < 0) {
                //ball_1.color = [255, 0, 0, 1];
                //ball_2.color = [255, 0, 0, 1];
                let vel_x1 = ball_1.x - ball_1.px;
                let vel_y1 = ball_1.y - ball_1.py;
                let vel_x2 = ball_2.x - ball_2.px;
                let vel_y2 = ball_2.y - ball_2.py;

                let depth_x = diff_x * (real_dist / dist);
                let depth_y = diff_y * (real_dist / dist);

                ball_1.x -= depth_x * 0.5;
                ball_1.y -= depth_y * 0.5;

                ball_2.x += depth_x * 0.5;
                ball_2.y += depth_y * 0.5;

                if (ip) {
                    let pr1 = (DAMPING * (diff_x * vel_x1 + diff_y * vel_y1)) / length,
                        pr2 = (DAMPING * (diff_x * vel_x2 + diff_y * vel_y2)) / length;

                    vel_x1 += pr2 * diff_x - pr1 * diff_x;
                    vel_x2 += pr1 * diff_x - pr2 * diff_x;

                    vel_y1 += pr2 * diff_y - pr1 * diff_y;
                    vel_y2 += pr1 * diff_y - pr2 * diff_y;

                    ball_1.px = ball_1.x - vel_x1;
                    ball_1.py = ball_1.y - vel_y1;

                    ball_2.px = ball_2.x - vel_x2;
                    ball_2.py = ball_2.y - vel_y2;
                }
            }

            if (ip) {
                if (dist < 2 * ball_1.radius + 20 && ball_1.link != ball_2 && ball_2.link != ball_1) {
                    ball_2.fillstyle = ball_1.fillstyle;
                    ball_1.link = ball_2;
                    ball_2.link = ball_1;
                    //let speed = (1+Math.sqrt((ball_1.x - ball_1.px)*(ball_1.x - ball_1.px), (ball_1.x - ball_1.py)*(ball_1.x - ball_1.py)))*3;
                    drawLine(ctx, ball_1.x, ball_1.y, ball_2.x, ball_2.y, ball_1.radius + ball_2.radius, ball_1.fillstyle);
                } else {
                    ball_1.link == undefined;
                    ball_2.link == undefined;
                }
            }
        }
    }
};

function drawLine(ctx, x1, y1, x2, y2, thickness, strokeStyle) {
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineWidth = thickness;
    ctx.strokeStyle = strokeStyle;
    ctx.stroke();
}

let check_walls = function () {
    let i = balls.length;

    while (i--) {
        let ball = balls[i];

        if (ball.x < ball.radius) {
            let vel_x = ball.px - ball.x;
            ball.x = ball.radius;
            ball.px = ball.x - vel_x * DAMPING;
        } else if (ball.x + ball.radius > canvas.width) {
            let vel_x = ball.px - ball.x;
            ball.x = canvas.width - ball.radius;
            ball.px = ball.x - vel_x * DAMPING;
        }

        if (ball.y < ball.radius) {
            let vel_y = ball.py - ball.y;
            ball.y = ball.radius;
            ball.py = ball.y - vel_y * DAMPING;
        } else if (ball.y + ball.radius > canvas.height) {
            let vel_y = ball.py - ball.y;
            ball.y = canvas.height - ball.radius;
            ball.py = ball.y - vel_y * DAMPING;
        }
    }
};

let update = function () {
    requestAnimFrame(update);

    // ctx.beginPath();
    // ctx.strokeStyle = 'hsl(' + (w + t)*180 + ', 100%, 65%)';
    // ctx.rect(20, 20, 150, 100);
    // ctx.stroke();

    //let time = new Date().getTime();

    let iter = 2;

    let delta = SPEED / iter;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    while (iter--) {
        let i = balls.length;

        while (i--) {
            balls[i].apply_force(delta);
            if (!clayMode) balls[i].verlet();
        }

        resolve_collisions(0);
        check_walls();

        if (!clayMode) {
            i = balls.length;
            while (i--) balls[i].verlet();
        }

        resolve_collisions(1, ctx);
        check_walls();
    }

    let i = balls.length;
    while (i--) balls[i].draw(ctx);

    if (mouse.down) {
        ctx.fillStyle = "rgba(0,0,0,0.1)";
        ctx.strokeStyle = "rgba(0,0,0,0.2)";

        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, MOUSE_SIZE, 0, TWO_PI);
        ctx.fill();
        ctx.stroke();
    }
};

let add_ball = function (x, y, r) {
    var x = x || canvas.height / 2 + Math.random() - 0.5 * 10,
        y = y || canvas.height / 2 + Math.random() - 0.5 * 10,
        r = r || 20;
    balls.push(new Ball(x, y, r));
};

window.onload = function () {
    canvas = document.getElementById("canvas");
    ctx = canvas.getContext("2d");

    //ctx.imageSmoothingEnabled = false;

    canvas.width = innerWidth;
    canvas.height = innerHeight;

    while (NUM_BALLS--) add_ball(undefined, undefined, undefined);

    function registerMouse() {
        document.addEventListener("mousemove", (event) => {
            (mouse.x = event.clientX), (mouse.y = event.clientY);
        });
        document.addEventListener("mousedown", (event) => {
            mouse.down[event.button] = true;
            if (event.button == 1) for (let i = 0; i <= 7; i++) add_ball(mouse.x, mouse.y, undefined);
            event.preventDefault();
        });
        document.addEventListener("mouseup", (event) => {
            mouse.down[event.button] = false;
            event.preventDefault();
        });
    }
    registerMouse();

    document.onkeydown = (event) => {
        switch (event.key) {
            case "g":
                GRAVITY_ENABLED = !GRAVITY_ENABLED;
                break;
            case "c":
                clayMode = !clayMode;
                if (!clayMode) {
                    for (let i = 0; i < balls.length; i++) {
                        balls[i].fy = 0;
                        balls[i].fx = 0;
                    }
                }
                break;
        }
    };

    document.oncontextmenu = function (e) {
        e.preventDefault();
        return false;
    };

    update();
};
