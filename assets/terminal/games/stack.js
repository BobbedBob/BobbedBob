// Falling blocks game
(() => {
    "use strict";
    const bob = window.bob;
    const sh = bob.sh;
    const {print, suggest, command, store, touchy, charWidth} = sh;
    const {arcade, finishScore} = sh;

    function stack() {
        const W = 10;
        const H = 18;
        const SHAPES = {
            I: [[1, 1, 1, 1]],
            O: [[1, 1], [1, 1]],
            T: [[0, 1, 0], [1, 1, 1]],
            S: [[0, 1, 1], [1, 1, 0]],
            Z: [[1, 1, 0], [0, 1, 1]],
            J: [[1, 0, 0], [1, 1, 1]],
            L: [[0, 0, 1], [1, 1, 1]],
        };
        const best = parseInt(store.get("bob.stack.best", "0"), 10) || 0;
        const board = Array.from({length: H}, () => Array(W).fill(0));
        const narrow = sh.out.clientWidth < charWidth() * 38;
        let bag = [];
        let piece = null;
        let next = null;
        let score = 0;
        let lines = 0;
        let level = 1;
        let timer = null;

        const shuffle = (list) => {
            for (let i = list.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [list[i], list[j]] = [list[j], list[i]];
            }
            return list;
        };
        const fromBag = () => {
            if (!bag.length) bag = shuffle(Object.keys(SHAPES));
            return bag.pop();
        };
        const rotate = (shape) => shape[0].map((_, i) => shape.map((row) => row[i]).reverse());

        function collides(shape, px, py) {
            for (let y = 0; y < shape.length; y++) {
                for (let x = 0; x < shape[y].length; x++) {
                    if (!shape[y][x]) continue;
                    const bx = px + x;
                    const by = py + y;
                    if (bx < 0 || bx >= W || by >= H) return true;
                    if (by >= 0 && board[by][bx]) return true;
                }
            }
            return false;
        }

        function spawn() {
            const type = next || fromBag();
            next = fromBag();
            const shape = SHAPES[type].map((row) => row.slice());
            piece = {shape, x: Math.floor((W - shape[0].length) / 2), y: 0};
            if (collides(piece.shape, piece.x, piece.y)) game_.end("the stack hit the top. game over!");
        }

        function clearLines() {
            let cleared = 0;
            for (let y = H - 1; y >= 0; y--) {
                if (board[y].every(Boolean)) {
                    board.splice(y, 1);
                    board.unshift(Array(W).fill(0));
                    cleared++;
                    y++;
                }
            }
            if (cleared) {
                lines += cleared;
                score += [0, 10, 30, 50, 80][cleared] * level;
                level = 1 + Math.floor(lines / 8);
            }
        }

        function lock() {
            piece.shape.forEach((row, y) => row.forEach((v, x) => {
                if (v && piece.y + y >= 0) board[piece.y + y][piece.x + x] = 1;
            }));
            clearLines();
            spawn();
            if (!game_.over) draw();
        }

        function move(dx) {
            if (!collides(piece.shape, piece.x + dx, piece.y)) {
                piece.x += dx;
                draw();
            }
        }

        function turn() {
            const r = rotate(piece.shape);
            for (const dx of [0, -1, 1, -2, 2]) {
                if (!collides(r, piece.x + dx, piece.y)) {
                    piece.shape = r;
                    piece.x += dx;
                    draw();
                    return;
                }
            }
        }

        function down() {
            if (!collides(piece.shape, piece.x, piece.y + 1)) {
                piece.y++;
                draw();
            } else {
                lock();
            }
        }

        function slam() {
            while (!collides(piece.shape, piece.x, piece.y + 1)) piece.y++;
            lock();
        }

        function draw() {
            const grid = board.map((row) => row.map((v) => (v ? "##" : " .")));
            let ghostY = piece.y;
            while (!collides(piece.shape, piece.x, ghostY + 1)) ghostY++;
            const paint = (py, cell) => piece.shape.forEach((row, y) => row.forEach((v, x) => {
                if (v && py + y >= 0) grid[py + y][piece.x + x] = cell;
            }));
            paint(ghostY, "::");
            paint(piece.y, "[]");

            const preview = SHAPES[next].map((row) => row.map((v) => (v ? "[]" : "  ")).join(""));
            const side = ["next", ...preview, "", `score ${score}`, `lines ${lines}`, `level ${level}`, `best  ${Math.max(best, score)}`];
            const rows = grid.map((row, y) => "|" + row.join("") + "|" + (!narrow && side[y] !== undefined ? "   " + side[y] : ""));
            rows.push("+" + "-".repeat(W * 2) + "+");
            if (narrow) rows.push(`score ${score}  lines ${lines}`, `level ${level}  best ${Math.max(best, score)}`);
            game_.draw(rows.join("\n"));
        }

        function tick() {
            if (game_.over) return;
            down();
            if (!game_.over) timer = setTimeout(tick, Math.max(90, 650 - (level - 1) * 60));
        }

        let moved = 0;
        const game_ = arcade({
            hint: touchy
                ? "drag to move, tap to turn, flick down to drop."
                : "left/right to move, up to turn, down to go faster, space to drop, esc to quit.",
            onKey(key) {
                if (key === "arrowleft" || key === "a") move(-1);
                else if (key === "arrowright" || key === "d") move(1);
                else if (key === "arrowup" || key === "w" || key === "x") turn();
                else if (key === "arrowdown" || key === "s") down();
                else if (key === " ") slam();
                else return false;
                return true;
            },
            touchStart() {
                moved = 0;
            },
            touchMove(t, start) {
                const step = charWidth() * 2;
                const columns = Math.trunc((t.clientX - start.x) / step);
                while (moved < columns) {
                    move(1);
                    moved++;
                }
                while (moved > columns) {
                    move(-1);
                    moved--;
                }
            },
            touchEnd(dx, dy, dt) {
                if (dy > 60 && Math.abs(dy) > Math.abs(dx)) slam();
                else if (Math.abs(dx) < 12 && Math.abs(dy) < 12 && dt < 300) turn();
            },
            onEnd() {
                clearTimeout(timer);
            },
            finish() {
                print(`you cleared ${lines} line${lines === 1 ? "" : "s"}.`);
                finishScore("bob.stack.best", score, 0.5, "for stacking");
                suggest("again? ", ["stack"]);
            },
        });

        spawn();
        draw();
        timer = setTimeout(tick, 650);
    }

    command("stack", {
        group: "games",
        help: "falling blocks: clear lines, don't hit the top",
        run: stack,
    });
})();
