// Mental maths challenge
(() => {
    "use strict";
    const bob = window.bob;
    const sh = bob.sh;
    const {print, suggest, command, setMode, endMode, refreshPrompt, store} = sh;

    const MATHS_LEVELS = {
        easy: {seconds: 30, xp: 3, tier: (score) => (score < 6 ? 0 : 1)},
        normal: {seconds: 45, xp: 5, tier: (score) => (score < 4 ? 1 : score < 9 ? 2 : 3)},
        hard: {seconds: 45, xp: 8, tier: (score) => (score < 3 ? 2 : 3)},
    };

    function mathsQuestion(tier) {
        const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
        const pick = (list) => list[r(0, list.length - 1)];
        const q = (text, ans) => ({text: text + " =", ans});

        const tiers = [

            [
                () => {
                    const a = r(10, 99), b = r(10, 99);
                    return q(`${a} + ${b}`, a + b);
                },
                () => {
                    const a = r(20, 99), b = r(10, a);
                    return q(`${a} - ${b}`, a - b);
                },
                () => {
                    const a = r(2, 12), b = r(2, 12);
                    return q(`${a} × ${b}`, a * b);
                },
            ],

            [
                () => {
                    const a = r(100, 999), b = r(100, 999);
                    return q(`${a} + ${b}`, a + b);
                },
                () => {
                    const a = r(300, 999), b = r(100, a);
                    return q(`${a} - ${b}`, a - b);
                },
                () => {
                    const a = r(13, 99), b = r(3, 9);
                    return q(`${a} × ${b}`, a * b);
                },
                () => {
                    const b = r(3, 12), ans = r(11, 25);
                    return q(`${b * ans} ÷ ${b}`, ans);
                },
                () => {
                    const a = r(11, 20);
                    return q(`${a}²`, a * a);
                },
            ],

            [
                () => {
                    const a = r(12, 45), b = r(11, 29);
                    return q(`${a} × ${b}`, a * b);
                },
                () => {
                    const a = r(3, 15), b = r(3, 15), c = r(10, 99);
                    return q(`${a} × ${b} + ${c}`, a * b + c);
                },
                () => {
                    const a = r(10, 60), b = r(3, 12), c = r(3, 12);
                    return q(`${a} - ${b} × ${c}`, a - b * c);
                },
                () => {
                    const p = pick([5, 10, 15, 20, 25, 30, 40, 60, 75]);
                    const n = (100 / gcd(p, 100)) * r(1, 12);
                    return q(`${p}% of ${n}`, (p * n) / 100);
                },
                () => {
                    const a = r(15, 30);
                    return q(`${a}²`, a * a);
                },
                () => {
                    const a = r(3, 15), b = r(3, 15);
                    return q(`-${a} × ${b}`, -a * b);
                },
            ],

            [
                () => {
                    const a = r(120, 999), b = r(3, 9);
                    return q(`${a} × ${b}`, a * b);
                },
                () => {
                    const a = r(31, 99), b = r(31, 99);
                    return q(`${a} × ${b}`, a * b);
                },
                () => {
                    const a = r(5, 40), b = r(5, 40), c = r(3, 12);
                    return q(`(${a} + ${b}) × ${c}`, (a + b) * c);
                },
                () => {
                    const a = r(2, 12);
                    return q(`${a}³`, a * a * a);
                },
                () => {
                    const a = r(12, 30);
                    return q(`√${a * a}`, a);
                },
                () => {
                    const a = r(11, 30), b = r(2, a - 1);
                    return q(`${a}² - ${b}²`, a * a - b * b);
                },
            ],
        ];
        return pick(tiers[tier])();
    }

    function gcd(a, b) {
        return b ? gcd(b, a % b) : a;
    }

    function maths(args) {
        const level = (args[0] || "normal").toLowerCase();
        const cfg = MATHS_LEVELS[level];
        if (!cfg) return print("usage: maths [easy | normal | hard]");
        const bestKey = "bob.maths.best." + level;
        const best = parseInt(store.get(bestKey, "0"), 10) || 0;
        let score = 0;
        let ended = false;
        let q;
        const deadline = Date.now() + cfg.seconds * 1000;

        function finish(msg) {
            if (ended) return;
            ended = true;
            clearTimeout(timer);
            endMode();
            print(msg);
            const newBest = score > best;
            if (newBest) store.set(bestKey, score);
            print(`you got ${score} right on ${level}.${newBest ? " that's a new personal best!" : ` your best is ${best}.`}`, "head");
            if (score > 0 && bob.xp) bob.xp.gain(score * cfg.xp, "for doing maths");
            suggest("again? ", level === "hard" ? ["maths hard", "maths"] : ["maths", "maths hard"]);
        }

        print(`maths challenge (${level}): answer as many as you can in ${cfg.seconds} seconds.`, "head");
        print("it gets harder as you go. type your answer and hit enter, or q to give up.", "dim");
        if (level === "normal") print("too easy? try 'maths hard'. too much? 'maths easy'.", "dim");
        q = mathsQuestion(cfg.tier(score));
        const timer = setTimeout(() => finish("time's up!"), cfg.seconds * 1000);
        setMode({
            prompt: () => q.text,
            onLine(line) {
                const t = line.trim().toLowerCase().replace(/^−/, "-");
                if (t === "q" || t === "quit") return finish("you gave up. no worries.");
                if (Date.now() > deadline) return finish("time's up!");
                if (/^-?\d+$/.test(t) && parseInt(t, 10) === q.ans) {
                    score++;
                    print("correct!", "ok");
                } else {
                    print(`not quite, it was ${q.ans}.`, "err");
                }
                q = mathsQuestion(cfg.tier(score));
                refreshPrompt();
            },
            onEscape() {
                finish("you gave up. no worries.");
            },
        });
    }

    command("maths", {
        group: "games",
        help: "mental maths challenge (try: maths hard)",
        complete: () => ["easy", "normal", "hard"],
        run: maths,
    });
})();
