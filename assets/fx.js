// Chaos mode and page effects
(() => {
    "use strict";
    const bob = (window.bob = window.bob || {});
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const CODE = ["ArrowUp", "ArrowUp", "ArrowDown", "ArrowDown", "ArrowLeft", "ArrowRight", "ArrowLeft", "ArrowRight", "b", "a"];
    let progress = 0;

    let dogsong = null;
    let menuWasPlaying = false;

    function chaosMusic(on) {
        const menu = document.getElementById("music-audio");
        if (on) {
            if (!dogsong) {
                dogsong = new Audio("assets/audio/dogsong.mp3");
                dogsong.loop = true;
                dogsong.volume = 0.25;
            }
            menuWasPlaying = !!(menu && !menu.paused);
            if (menuWasPlaying) menu.pause();
            dogsong.currentTime = 0;
            dogsong.play().catch(() => {
                // blocked by the browser
            });
        } else {
            if (dogsong) dogsong.pause();
            if (menuWasPlaying && menu) menu.play().catch(() => {
                // blocked by the browser
            });
            menuWasPlaying = false;
        }
    }

    function toggleChaos() {
        const on = document.body.classList.toggle("chaos");
        chaosMusic(on);
        const marquee = document.getElementById("rolling-text");
        if (marquee) marquee.direction = on ? "right" : "left";
        if (bob.toast) bob.toast(on ? "CHAOS MODE: ON" : "chaos mode: off", on);
        if (on) {
            if (typeof playExplosionSound === "function") playExplosionSound();
            if (bob.xp) bob.xp.once("chaos", 100, "for finding chaos mode");
        }
    }

    bob.chaos = toggleChaos;

    document.addEventListener("keydown", (e) => {
        if (bob.term && bob.term.isOpen()) {
            progress = 0;
            return;
        }
        const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
        if (key === CODE[progress]) {
            progress++;
            if (progress === CODE.length) {
                progress = 0;
                toggleChaos();
            }
        } else {
            progress = key === CODE[0] ? 1 : 0;
        }
    });

    function keepInView(tip) {
        tip.style.removeProperty("--nudge");
        const r = tip.getBoundingClientRect();
        const pad = 8;
        let shift = 0;
        if (r.left < pad) shift = pad - r.left;
        else if (r.right > window.innerWidth - pad) shift = window.innerWidth - pad - r.right;
        if (shift) tip.style.setProperty("--nudge", Math.round(shift) + "px");
    }

    document.addEventListener("pointerover", (e) => {
        const holder = e.target instanceof Element && e.target.closest(".tooltip");
        const tip = holder && holder.querySelector(":scope > .tooltiptext");
        if (tip) keepInView(tip);
    });

    const moreButton = document.getElementById("more-projects");
    if (moreButton) {
        moreButton.addEventListener("click", () => {
            const open = moreButton.getAttribute("aria-expanded") !== "true";
            moreButton.setAttribute("aria-expanded", String(open));
            document.querySelectorAll(".card-small").forEach((card) => (card.hidden = !open));
            moreButton.querySelector(".card-icon-text").textContent = open ? "-" : "+2";
            moreButton.querySelector(".card-blurb").textContent = open ? "click to hide them" : "click to show them";
        });
    }

    const WORDS = ["*boom*", "*kaboom*", "*bang*", "*pow*", "*blam*"];
    const BITS = ["*", "+", ".", "x", "'", "`"];
    const COLOURS = ["#6666ff", "#0099ff", "#00ff00", "#ff3399"];
    const pick = (list) => list[Math.floor(Math.random() * list.length)];

    function spawn(cls, text, x, y, colour) {
        const node = document.createElement("span");
        node.className = cls;
        node.textContent = text;
        node.setAttribute("aria-hidden", "true");
        node.style.left = x + "px";
        node.style.top = y + "px";
        node.style.color = colour;
        node.addEventListener("animationend", () => node.remove());
        document.body.append(node);
        return node;
    }

    function boom(x, y) {
        const colour = pick(COLOURS);
        spawn("boom", pick(WORDS), x, y, colour);
        const count = 8;
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2 + Math.random() * 0.5;
            const dist = 35 + Math.random() * 35;
            const bit = spawn("boom-bit", pick(BITS), x, y, colour);
            bit.style.setProperty("--dx", Math.cos(angle) * dist + "px");
            bit.style.setProperty("--dy", Math.sin(angle) * dist + "px");
        }
    }

    document.addEventListener("click", (e) => {
        if (reducedMotion) return;
        if (e.detail === 0) return;
        if (e.target.closest("#term, #boot, audio")) return;
        boom(e.clientX, e.clientY);
    });
})();
