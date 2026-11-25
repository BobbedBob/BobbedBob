// Shared plumbing for the terminal games
(() => {
    "use strict";
    const bob = window.bob;
    const sh = bob.sh;
    const {print, store} = sh;

    function arcade(opts) {
        const screen = print("", "pre game");
        print(opts.hint || "", "dim");
        print("");
        sh.hideInput();
        let over = false;
        let touch = null;

        function onTouchStart(e) {
            const t = e.touches[0];
            touch = {x: t.clientX, y: t.clientY, lastX: t.clientX, lastY: t.clientY, time: Date.now()};
            if (opts.touchStart) opts.touchStart(t, screen);
        }

        function onTouchMove(e) {
            if (!touch) return;
            const t = e.touches[0];
            e.preventDefault();
            if (opts.touchMove) opts.touchMove(t, touch, screen);
        }

        function onTouchEnd(e) {
            if (!touch) return;
            const t = e.changedTouches[0];
            if (opts.touchEnd) opts.touchEnd(t.clientX - touch.x, t.clientY - touch.y, Date.now() - touch.time, touch);
            touch = null;
        }

        sh.term.addEventListener("touchstart", onTouchStart, {passive: true});
        sh.term.addEventListener("touchmove", onTouchMove, {passive: false});
        sh.term.addEventListener("touchend", onTouchEnd);

        const api = {
            screen,
            get over() {
                return over;
            },
            draw(text) {
                screen.textContent = text;
                sh.scrollDown();
            },
            end(msg) {
                if (over) return;
                over = true;
                if (opts.onEnd) opts.onEnd();
                sh.setGame(null);
                sh.term.removeEventListener("touchstart", onTouchStart);
                sh.term.removeEventListener("touchmove", onTouchMove);
                sh.term.removeEventListener("touchend", onTouchEnd);
                print(msg);
                if (opts.finish) opts.finish();
                sh.showInput();
            },
        };

        sh.setGame({
            onKey(e) {
                const key = e.key.toLowerCase();
                if (key === "escape" || key === "q") {
                    e.preventDefault();
                    api.end("thanks for playing!");
                } else if (opts.onKey && opts.onKey(key, e)) {
                    e.preventDefault();
                }
                return true;
            },
            onKeyUp(e) {
                if (opts.onKeyUp) opts.onKeyUp(e.key.toLowerCase(), e);
            },
            stop() {
                api.end("thanks for playing!");
            },
        });
        return api;
    }

    function finishScore(bestKey, score, xpEach, label) {
        const best = parseInt(store.get(bestKey, "0"), 10) || 0;
        const newBest = score > best;
        if (newBest) store.set(bestKey, score);
        print(`you scored ${score}.${newBest ? " that's a new personal best!" : ` your best is ${best}.`}`, "head");
        if (score > 0 && bob.xp) bob.xp.gain(Math.max(1, Math.round(score * xpEach)), label);
    }

    sh.arcade = arcade;
    sh.finishScore = finishScore;
})();
