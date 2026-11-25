// Paddle and ball game
(() => {
    "use strict";
    const bob = window.bob;
    const sh = bob.sh;
    const {print, suggest, command, store, touchy, charWidth} = sh;
    const {arcade, finishScore} = sh;

    function rally() {
        const fit = Math.floor(sh.out.clientWidth / charWidth()) - 4;
        const W = Math.max(20, Math.min(32, fit - (fit % 2)));
        const H = 14;
        const PADDLE = 4;
        const WIN = 5;
        let you = 0;
        let cpu = 0;
        let py = (H - PADDLE) / 2;
        let cy = py;
        let held = 0;
        let target = null;
        let ball;
        let pause = 0;
        let timer = null;

        function serve(dir) {
            ball = {x: W / 2, y: 2 + Math.random() * (H - 4), vx: 0.42 * dir, vy: Math.random() * 0.5 - 0.25};
            pause = 18;
        }

        function bounce(paddleTop, dir) {
            const offset = (ball.y - (paddleTop + PADDLE / 2 - 0.5)) / (PADDLE / 2);
            ball.vx = Math.min(1.1, Math.abs(ball.vx) * 1.07) * dir;
            ball.vy = Math.max(-0.75, Math.min(0.75, offset * 0.55));
        }

        function step() {
            if (held) py += held * 0.65;
            if (target !== null) py += Math.max(-0.9, Math.min(0.9, target - PADDLE / 2 - py));
            py = Math.max(0, Math.min(H - PADDLE, py));

            const aim = ball.vx > 0 ? ball.y - PADDLE / 2 + 0.5 : (H - PADDLE) / 2;
            const speed = 0.3 + Math.min(you, 4) * 0.03;
            cy += Math.max(-speed, Math.min(speed, aim - cy));
            cy = Math.max(0, Math.min(H - PADDLE, cy));

            if (pause > 0) {
                pause--;
                return;
            }

            ball.x += ball.vx;
            ball.y += ball.vy;
            if (ball.y < 0) {
                ball.y = -ball.y;
                ball.vy = -ball.vy;
            }
            if (ball.y > H - 1) {
                ball.y = 2 * (H - 1) - ball.y;
                ball.vy = -ball.vy;
            }

            const hits = (top) => ball.y >= top - 0.6 && ball.y <= top + PADDLE - 0.4;
            if (ball.vx < 0 && ball.x <= 1.5 && ball.x > 0.3 && hits(py)) {
                ball.x = 1.5;
                bounce(py, 1);
            } else if (ball.vx > 0 && ball.x >= W - 2.5 && ball.x < W - 1.3 && hits(cy)) {
                ball.x = W - 2.5;
                bounce(cy, -1);
            }

            if (ball.x < 0) {
                cpu++;
                if (cpu >= WIN) return game_.end(`the computer wins ${cpu}-${you}. so close!`);
                serve(-1);
            } else if (ball.x > W - 1) {
                you++;
                if (you >= WIN) return game_.end(`you win ${you}-${cpu}!`);
                serve(1);
            }
        }

        function draw() {
            const edge = "+" + "-".repeat(W) + "+";
            const rows = [`you ${you} : ${cpu} cpu   first to ${WIN}`, edge];
            const bx = Math.round(ball.x);
            const by = Math.round(ball.y);
            const pTop = Math.round(py);
            const cTop = Math.round(cy);
            for (let y = 0; y < H; y++) {
                let row = "";
                for (let x = 0; x < W; x++) {
                    if (x === 1 && y >= pTop && y < pTop + PADDLE) row += "#";
                    else if (x === W - 2 && y >= cTop && y < cTop + PADDLE) row += "#";
                    else if (x === bx && y === by && (pause === 0 || pause % 6 < 3)) row += "o";
                    else if (x === W / 2 && y % 2 === 0) row += ":";
                    else row += " ";
                }
                rows.push("|" + row + "|");
            }
            rows.push(edge);
            game_.draw(rows.join("\n"));
        }

        function loop() {
            if (game_.over) return;
            step();
            if (!game_.over) {
                draw();
                timer = setTimeout(loop, 40);
            }
        }

        const game_ = arcade({
            hint: touchy ? "drag up and down to move your paddle (the left one)." : "up/down or w/s to move your paddle (the left one), esc to quit.",
            onKey(key) {
                if (key === "arrowup" || key === "w") held = -1;
                else if (key === "arrowdown" || key === "s") held = 1;
                else return false;
                return true;
            },
            onKeyUp(key) {
                if ((key === "arrowup" || key === "w") && held === -1) held = 0;
                if ((key === "arrowdown" || key === "s") && held === 1) held = 0;
            },
            touchStart(t, screen) {
                aimAt(t, screen);
            },
            touchMove(t, start, screen) {
                aimAt(t, screen);
            },
            touchEnd() {
                target = null;
            },
            onEnd() {
                clearTimeout(timer);
            },
            finish() {
                const won = you >= WIN;
                if (won) {
                    const wins = (parseInt(store.get("bob.rally.wins", "0"), 10) || 0) + 1;
                    store.set("bob.rally.wins", wins);
                    print(`that's ${wins} win${wins === 1 ? "" : "s"} against the computer so far.`, "head");
                }
                const xp = you * 5 + (won ? 25 : 0);
                if (xp && bob.xp) bob.xp.gain(xp, won ? "for winning a rally" : "for playing rally");
                suggest("again? ", ["rally"]);
            },
        });

        function aimAt(t, screen) {
            const r = screen.getBoundingClientRect();
            const rowHeight = r.height / (H + 4);
            target = (t.clientY - r.top) / rowHeight - 2;
        }

        serve(Math.random() < 0.5 ? -1 : 1);
        draw();
        loop();
    }

    command("rally", {
        group: "games",
        help: "paddle and ball against the computer, first to 5",
        run: rally,
    });
})();
