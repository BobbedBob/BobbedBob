// Snake
(() => {
    "use strict";
    const bob = window.bob;
    const sh = bob.sh;
    const {suggest, command, touchy} = sh;
    const {arcade, finishScore} = sh;

    const KEYS = {
        arrowup: [0, -1], w: [0, -1],
        arrowdown: [0, 1], s: [0, 1],
        arrowleft: [-1, 0], a: [-1, 0],
        arrowright: [1, 0], d: [1, 0],
    };

    function snake() {
        const W = 22;
        const H = 12;
        const best = parseInt(sh.store.get("bob.snake.best", "0"), 10) || 0;
        const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
        const body = [{x: 6, y: 6}, {x: 5, y: 6}, {x: 4, y: 6}];
        let dir = {x: 1, y: 0};
        const queue = [];
        let food;
        let score = 0;
        let delay = 140;
        let timer = null;
        let started = false;

        function placeFood() {
            do food = {x: r(0, W - 1), y: r(0, H - 1)};
            while (body.some((s) => s.x === food.x && s.y === food.y));
        }

        function draw() {
            const edge = "+" + "-".repeat(W) + "+";
            const rows = [edge];
            for (let y = 0; y < H; y++) {
                let row = "|";
                for (let x = 0; x < W; x++) {
                    if (body[0].x === x && body[0].y === y) row += "@";
                    else if (body.some((s) => s.x === x && s.y === y)) row += "o";
                    else if (food.x === x && food.y === y) row += "*";
                    else row += " ";
                }
                rows.push(row + "|");
            }
            rows.push(edge);
            rows.push(`score ${score}   best ${Math.max(best, score)}`);
            if (!started) rows.push(touchy ? "swipe to start" : "press an arrow key to start");
            game.draw(rows.join("\n"));
        }

        function turn([x, y]) {
            const last = queue.length ? queue[queue.length - 1] : dir;
            if ((last.x === -x && last.y === -y) || (last.x === x && last.y === y)) return;
            if (queue.length < 3) queue.push({x, y});
            if (!started) {
                started = true;
                loop();
            }
        }

        function step() {
            if (queue.length) dir = queue.shift();
            const head = {x: body[0].x + dir.x, y: body[0].y + dir.y};
            const hitWall = head.x < 0 || head.x >= W || head.y < 0 || head.y >= H;
            const hitSelf = body.slice(0, -1).some((s) => s.x === head.x && s.y === head.y);
            if (hitWall || hitSelf) return game.end(hitWall ? "bonk! you hit the wall." : "oops, you ate yourself.");
            body.unshift(head);
            if (head.x === food.x && head.y === food.y) {
                score++;
                delay = Math.max(70, delay - 4);
                placeFood();
            } else {
                body.pop();
            }
            draw();
        }

        function loop() {
            if (game.over) return;
            step();
            if (!game.over) timer = setTimeout(loop, delay);
        }

        const game = arcade({
            hint: touchy ? "swipe to change direction." : "arrow keys or wasd to steer, esc to quit.",
            onKey(key) {
                if (!KEYS[key]) return false;
                turn(KEYS[key]);
                return true;
            },
            touchEnd(dx, dy) {
                if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
                if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? [1, 0] : [-1, 0]);
                else turn(dy > 0 ? [0, 1] : [0, -1]);
            },
            onEnd() {
                clearTimeout(timer);
            },
            finish() {
                finishScore("bob.snake.best", score, 3, "for playing snake");
                suggest("again? ", ["snake"]);
            },
        });

        placeFood();
        draw();
    }

    command("snake", {
        group: "games",
        help: "classic snake (arrow keys, wasd or swipe)",
        run: snake,
    });
})();
