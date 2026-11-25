(() => {
    "use strict";
    const bob = (window.bob = window.bob || {});

    const store = {
        get(key, fallback = null) {
            try {
                const v = localStorage.getItem(key);
                return v === null ? fallback : v;
            } catch {
                return fallback;
            }
        },
        set(key, value) {
            try {
                localStorage.setItem(key, String(value));
            } catch {
                // private mode or storage disabled
            }
        },
    };
    bob.store = store;

    const LEVELS = [0, 50, 150, 300, 500, 800, 1200, 1700, 2300, 3000];
    const AFTER_STEP = 800;
    const TITLES = [
        "newcomer",
        "hey, it's you again",
        "a regular",
        "oh my god, it's you",
        "my friend",
        "my awesome friend",
        "my beloved",
        "part-time goober",
        "maths enjoyer",
        "certified bobbedbob fan",
        "legend of the interwebs",
    ];

    function threshold(level) {
        if (level <= LEVELS.length) return LEVELS[level - 1];
        return LEVELS[LEVELS.length - 1] + (level - LEVELS.length) * AFTER_STEP;
    }

    function levelFor(xp) {
        let level = 1;
        while (xp >= threshold(level + 1)) level++;
        return level;
    }

    function titleFor(level) {
        return TITLES[Math.min(level, TITLES.length) - 1];
    }

    let xp = parseInt(store.get("bob.xp"), 10);
    if (isNaN(xp)) {
        // returning visitors from before xp existed get credit for their visits
        const prior = typeof rawVisitsNum === "number" ? rawVisitsNum : 0;
        xp = prior * 20;
        store.set("bob.xp", xp);
    }

    let onceDone;
    try {
        onceDone = new Set(JSON.parse(store.get("bob.once", "[]")));
    } catch {
        onceDone = new Set();
    }

    // ---------- toasts ----------
    let toastBox = null;

    function toast(text, big = false) {
        if (!toastBox) {
            toastBox = document.createElement("div");
            toastBox.className = "toasts";
            toastBox.setAttribute("aria-live", "polite");
            document.body.append(toastBox);
        }
        const t = document.createElement("div");
        t.className = big ? "toast big" : "toast";
        t.textContent = text;
        toastBox.append(t);
        while (toastBox.children.length > 3) toastBox.firstElementChild.remove();
        setTimeout(() => t.remove(), 3100);
        return t;
    }

    let recent = null;

    function xpToast(amount, reason) {
        const now = Date.now();
        if (recent && now - recent.time < 2000 && recent.el.isConnected) {
            recent.amount += amount;
            recent.count++;
            recent.el.remove();
        } else {
            recent = {amount, count: 1};
        }
        recent.time = now;
        const text = recent.count === 1
            ? (reason ? `+${amount}xp ${reason}` : `+${amount}xp`)
            : `+${recent.amount}xp for exploring`;
        recent.el = toast(text);
    }
    bob.toast = toast;

    // ---------- api ----------
    function status() {
        const level = levelFor(xp);
        const floor = threshold(level);
        const next = threshold(level + 1);
        return {xp, level, title: titleFor(level), floor, next, progress: (xp - floor) / (next - floor)};
    }

    function bar(width = 10) {
        const filled = Math.round(status().progress * width);
        return "[" + "#".repeat(filled) + "-".repeat(width - filled) + "]";
    }

    function render() {
        const el = document.getElementById("xp-bar");
        if (!el) return;
        const s = status();
        el.textContent = `lvl ${s.level} "${s.title}" ${bar(10)} ${s.xp}/${s.next}xp`;
    }

    function gain(amount, reason) {
        if (amount <= 0) return;
        const before = levelFor(xp);
        xp += amount;
        store.set("bob.xp", xp);
        render();
        xpToast(amount, reason);
        const after = levelFor(xp);
        if (after > before) toast(`level up! you're now lvl ${after} ("${titleFor(after)}")`, true);
    }

    // xp that can only be earned once per visitor (first time running a command, etc.)
    function once(id, amount, reason) {
        if (onceDone.has(id)) return false;
        onceDone.add(id);
        store.set("bob.once", JSON.stringify([...onceDone]));
        gain(amount, reason);
        return true;
    }

    bob.xp = {status, bar, gain, once, render};

    render();

    const xpButton = document.getElementById("xp-bar");
    if (xpButton) {
        xpButton.addEventListener("click", () => bob.term && bob.term.run("xp"));
    }

    let visitedThisSession = false;
    try {
        visitedThisSession = sessionStorage.getItem("bob.visited") === "1";
        sessionStorage.setItem("bob.visited", "1");
    } catch {
        visitedThisSession = true;
    }
    if (!visitedThisSession) {
        setTimeout(() => gain(20, "for dropping by"), 3600);
    }
})();
