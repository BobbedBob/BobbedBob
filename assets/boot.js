(() => {
    "use strict";
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let seen = false;
    try {
        seen = localStorage.getItem("bob.booted") === "1";
        localStorage.setItem("bob.booted", "1");
    } catch {
        // new visitor
    }

    const boot = document.createElement("div");
    boot.id = "boot";
    boot.setAttribute("aria-hidden", "true");
    const screen = document.createElement("pre");
    const skip = document.createElement("div");
    skip.className = "boot-skip";
    skip.textContent = "press any key to skip";
    boot.append(screen, skip);
    document.body.prepend(boot);
    document.documentElement.classList.add("booting");

    const timers = [];
    let done = false;

    function finish(fast) {
        if (done) return;
        done = true;
        timers.forEach(clearTimeout);
        document.removeEventListener("keydown", onKey, true);
        boot.classList.add("boot-done");
        setTimeout(() => {
            boot.remove();
            document.documentElement.classList.remove("booting");
        }, fast ? 150 : 400);
    }

    function onKey(e) {
        if (e.key === "Tab" || e.key === "Shift") return;
        finish(true);
    }

    document.addEventListener("keydown", onKey, true);
    boot.addEventListener("click", (e) => {
        e.stopPropagation();
        finish(true);
    });

    const later = (fn, ms) => timers.push(setTimeout(fn, ms));

    function row(label, status) {
        return status ? label + " " + ".".repeat(Math.max(3, 26 - label.length)) + " " : label;
    }

    function start() {
        if (done) return;
        const projects = document.querySelectorAll("#projects a.alink").length;
        const lines = [
            ["BobBIOS v20.26 (c) bobby, all rights reserved-ish", ""],
            ["", ""],
            ["memory check", "640K, plenty"],
            ["detecting caffeine", "LOW"],
            ["loading friends.dll", "OK"],
            ["loading projects/", `${projects} found`],
            ["loading blog/", `${window.bob && window.bob.blog ? window.bob.blog.posts.length : "some"} posts`],
            ["mounting /dev/brain", "FAILED (maths overflow)"],
            ["retrying /dev/brain", "OK"],
            ["starting bobbedbob.io", ""],
        ];
        if (seen) {
            const s = window.bob && window.bob.xp ? window.bob.xp.status() : null;
            const name = window.bob && window.bob.visitor ? window.bob.visitor.name() : "";
            lines.push(["", ""], [`welcome back${name ? ` ${name}` : ""}${s ? `, lvl ${s.level} "${s.title}"` : ""}!`, ""]);
        }

        let t = 0;
        for (const [label, status] of lines) {
            later(() => {
                screen.textContent += row(label, status);
            }, t);
            t += status ? 140 : 90;
            if (status) {
                later(() => {
                    screen.textContent += status;
                }, t);
                t += 110;
            }
            later(() => {
                screen.textContent += "\n";
            }, t);
        }
        later(() => finish(false), t + (seen ? 650 : 450));
    }

    if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", start);
    else start();
})();
