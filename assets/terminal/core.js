// The bobsh terminal
(() => {
    "use strict";
    const bob = (window.bob = window.bob || {});
    const store = bob.store || {
        get: (k, d = null) => d, set: () => {
        } /* no storage */
    };

    function visitorName() {
        return (store.get("bob.name", "") || "").trim();
    }

    function userFor(name) {
        const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9_-]/g, "").slice(0, 16);
        return slug || "guest";
    }

    const user = () => userFor(visitorName());
    const makePrompt = () => `${user()}@bobbedbob.io:~$`;
    let PROMPT = makePrompt();
    bob.visitor = {name: visitorName, user};

    function el(tag, attrs = {}, text) {
        const node = document.createElement(tag);
        for (const [k, v] of Object.entries(attrs)) {
            if (k === "class") node.className = v;
            else node.setAttribute(k, v);
        }
        if (text !== undefined) node.textContent = text;
        return node;
    }

    const term = el("div", {id: "term", class: "term", role: "dialog", "aria-label": "terminal"});
    const bar = el("div", {class: "term-bar", title: "drag to resize, double-click for full screen"});
    const titleEl = el("span", {class: "term-title"}, `bobsh: ${user()}@bobbedbob.io`);
    const fullBtn = el("button", {
        class: "term-btn",
        type: "button",
        "aria-label": "toggle full screen"
    }, "[ ] full screen");
    const closeBtn = el("button", {class: "term-btn", type: "button", "aria-label": "close terminal"}, "[x] close");
    const barButtons = el("span", {class: "term-btns"});
    barButtons.append(fullBtn, closeBtn);
    bar.append(el("span", {class: "term-grip", "aria-hidden": "true"}, "="), titleEl, barButtons);

    const out = el("div", {class: "term-out", "aria-live": "polite"});
    const form = el("form", {class: "term-line", autocomplete: "off"});
    const promptEl = el("label", {class: "term-prompt", for: "term-in"}, PROMPT);
    const input = el("input", {
        id: "term-in",
        class: "term-in",
        type: "text",
        autocomplete: "off",
        autocapitalize: "off",
        autocorrect: "off",
        spellcheck: "false",
        enterkeyhint: "send",
        placeholder: "type a command, e.g. help",
    });
    form.append(promptEl, input);
    term.append(bar, out, form);
    term.hidden = true;
    document.body.append(term);

    const touchy = window.matchMedia("(hover: none)").matches;
    const strip = el("button", {type: "button", class: "term-strip", "aria-label": "open the terminal"});
    const stripPrompt = el("span", {class: "term-prompt"}, PROMPT);
    strip.append(
        stripPrompt,
        el("span", {class: "term-strip-text"}, touchy ? " tap here to open the terminal" : " click here (or press /) to open the terminal"),
        el("span", {class: "blink"}, "_"),
        el("span", {class: "term-strip-open", "aria-hidden": "true"}, "[^]"),
    );

    const fab = el("button", {
        type: "button",
        class: "term-fab",
        title: "open the terminal",
        "aria-label": "open the terminal"
    }, ">_");
    if (store.get("bob.term.used") !== "1") fab.classList.add("pulse");
    document.body.append(strip, fab);
    document.body.classList.add("has-strip");

    const root = document.documentElement;
    const MIN_HEIGHT = 140;

    function clampHeight(h) {
        return Math.round(Math.min(window.innerHeight - 40, Math.max(MIN_HEIGHT, h)));
    }

    function setHeight(h, save = true) {
        const px = clampHeight(h);
        root.style.setProperty("--term-h", px + "px");
        if (save) store.set("bob.term.height", px);
    }

    const savedHeight = parseInt(store.get("bob.term.height"), 10);
    if (savedHeight) setHeight(savedHeight, false);

    window.addEventListener("resize", () => {
        const h = parseInt(root.style.getPropertyValue("--term-h"), 10);
        if (h) setHeight(h, false);
    });

    function setFull(on) {
        term.classList.toggle("full", on);
        fullBtn.textContent = on ? "[-] exit full screen" : "[ ] full screen";
        scrollDown();
    }

    fullBtn.addEventListener("click", () => setFull(!term.classList.contains("full")));
    bar.addEventListener("dblclick", (e) => {
        if (!e.target.closest("button")) setFull(!term.classList.contains("full"));
    });

    let dragging = false;
    bar.addEventListener("pointerdown", (e) => {
        if (e.target.closest("button") || term.classList.contains("full") || e.button !== 0) return;
        dragging = true;
        bar.setPointerCapture(e.pointerId);
        term.classList.add("resizing");
        e.preventDefault();
    });
    bar.addEventListener("pointermove", (e) => {
        if (dragging) setHeight(window.innerHeight - e.clientY);
    });
    const stopDrag = () => {
        dragging = false;
        term.classList.remove("resizing");
        scrollDown();
    };
    bar.addEventListener("pointerup", stopDrag);
    bar.addEventListener("pointercancel", stopDrag);

    function scrollDown() {
        out.scrollTop = out.scrollHeight;
    }

    function print(text = "", cls = "") {
        const row = el("div", {class: cls ? "term-row " + cls : "term-row"}, text);
        out.append(row);
        scrollDown();
        return row;
    }

    function link(text, href) {
        return el("a", {href, target: "_blank", rel: "noopener", class: "term-link"}, text);
    }

    function cmdButton(label, command = label) {
        const b = el("button", {type: "button", class: "term-cmd", title: `run "${command}"`}, label);
        b.addEventListener("click", (e) => {
            e.stopPropagation();
            if (mode || game || busy) return;
            run(command);
        });
        return b;
    }

    function printParts(parts, cls = "") {
        const row = el("div", {class: cls ? "term-row " + cls : "term-row"});
        for (const p of parts.flat()) row.append(p);
        out.append(row);
        scrollDown();
        return row;
    }

    function suggest(prefix, commands) {
        const parts = [prefix];
        commands.forEach((c, i) => {
            if (i) parts.push(" ");
            parts.push(cmdButton(c));
        });
        printParts(parts, "dim");
    }

    let mode = null;
    let game = null;
    let busy = false;

    function setMode(m) {
        mode = m;
        refreshPrompt();
    }

    function endMode() {
        mode = null;
        refreshPrompt();
    }

    function updateName() {
        PROMPT = makePrompt();
        titleEl.textContent = `bobsh: ${user()}@bobbedbob.io`;
        stripPrompt.textContent = PROMPT;
        document.querySelectorAll(".cmd-prompt").forEach((p) => (p.textContent = PROMPT));
        refreshPrompt();
    }

    function refreshPrompt() {
        promptEl.textContent = mode ? mode.prompt() : PROMPT;
        input.placeholder = mode ? "" : "type a command, e.g. help";
    }

    const history = [];
    let historyIndex = 0;

    function complete() {
        const value = input.value.replace(/^\s+/, "");
        const space = value.indexOf(" ");
        let pool;
        let head = "";
        let partial = value;
        if (space === -1) {
            pool = Object.keys(commands).filter((c) => !commands[c].hidden);
        } else {
            head = value.slice(0, space + 1);
            partial = value.slice(space + 1);
            const def = commands[value.slice(0, space).toLowerCase()];
            pool = def && def.complete ? def.complete() : [];
        }
        const matches = [...new Set(pool)].filter((p) => p.startsWith(partial.toLowerCase()));
        if (matches.length === 1) {
            input.value = head + matches[0] + (space === -1 ? " " : "");
        } else if (matches.length > 1) {
            print(PROMPT + " " + input.value, "echo");
            print(matches.join("   "), "dim");
        }
    }

    const commands = {};

    function command(name, def) {
        commands[name] = def;
    }

    function run(line) {
        if (busy) return;
        if (term.hidden) open();

        if (mode) {
            print(mode.prompt() + " " + line, "echo");
            mode.onLine(line);
            return;
        }

        print(PROMPT + " " + line, "echo");
        const trimmed = line.trim();
        if (!trimmed) return;

        history.push(trimmed);
        historyIndex = history.length;

        const [rawName, ...args] = trimmed.split(/\s+/);
        const name = rawName.toLowerCase().replace(/^\.\//, "");
        const cmd = commands[name];
        if (!cmd) {
            print(`bobsh: ${rawName}: command not found`, "err");
            suggest("not sure what to type? try ", ["help"]);
            return;
        }
        cmd.run(args, trimmed.slice(rawName.length).trim());
        if (!cmd.noXp && bob.xp) bob.xp.once("cmd:" + name, 5, `for trying ${name}`);
    }

    function openLink(href, label) {
        print(`opening ${label} in a new tab...`);
        window.open(href, "_blank", "noopener");
        if (typeof playExplosionSound === "function") playExplosionSound();
    }

    function charWidth() {
        const probe = el("span", {class: "term-row pre"}, "MMMMMMMMMM");
        probe.style.position = "absolute";
        probe.style.visibility = "hidden";
        out.append(probe);
        const w = probe.getBoundingClientRect().width / 10;
        probe.remove();
        return w || 9.6;
    }

    let greeted = false;

    function banner() {
        const name = visitorName();
        print(name
            ? `g'day ${name}! welcome back to bobsh, a little terminal for poking around my site.`
            : "g'day! this is bobsh, a little terminal for poking around my site.", "head");
        print("no tech skills needed: click any of the commands below, or type one and press enter.", "dim");
        print("");
        suggest("start here: ", name ? ["help", "projects", "about", "music"] : ["help", "projects", "about", "name"]);
        suggest("games:      ", ["maths", "snake", "stack", "rally"]);
        suggest("for nerds:  ", ["fastfetch", "ls", "xp"]);
        print("");
        const latest = bob.blog && bob.blog.posts[0];
        if (latest) {
            const parts = ["fresh on the blog: "];
            if (bob.blog.isNew(latest)) parts.push(el("span", {class: "new-tag"}, "NEW"), " ");
            parts.push(link(latest.title, latest.url));
            printParts(parts);
            print("");
        }
    }

    function open() {
        if (term.hidden) {
            term.hidden = false;
            void term.offsetHeight;
            term.classList.add("open");
            document.body.classList.add("term-open");
        }
        if (fab.classList.contains("pulse")) {
            fab.classList.remove("pulse");
            store.set("bob.term.used", "1");
        }
        if (!greeted) {
            greeted = true;
            banner();
            if (bob.xp) bob.xp.once("terminal", 25, "for opening the terminal");
        }
        if (!game) input.focus({preventScroll: true});
    }

    function close() {
        if (game) game.stop();
        term.classList.remove("open");
        document.body.classList.remove("term-open");
        setFull(false);
        input.blur();
        setTimeout(() => {
            if (!term.classList.contains("open")) term.hidden = true;
        }, 200);
    }

    function isOpen() {
        return !term.hidden;
    }

    function setGame(g) {
        game = g;
    }

    function setBusy(on) {
        busy = on;
        input.disabled = on;
        if (!on) input.focus({preventScroll: true});
    }

    function hideInput() {
        form.hidden = true;
        input.blur();
    }

    function showInput() {
        form.hidden = false;
        if (!term.hidden) input.focus({preventScroll: true});
    }

    function clear() {
        out.replaceChildren();
    }

    bob.term = {open, close, isOpen, run};
    bob.sh = {
        el, print, printParts, link, cmdButton, suggest, scrollDown, openLink, clear, charWidth,

        command, commands, run, setMode, endMode, refreshPrompt, setGame, setBusy, hideInput, showInput, history,

        term, out, open, close, isOpen, touchy, store,

        visitorName, user, updateName,
        get prompt() {
            return PROMPT;
        },
    };
    if (visitorName()) updateName();

    form.addEventListener("submit", (e) => {
        e.preventDefault();
        const line = input.value;
        input.value = "";
        run(line);
    });

    input.addEventListener("keydown", (e) => {
        if (e.key === "ArrowUp" && !mode) {
            if (historyIndex > 0) input.value = history[--historyIndex];
            e.preventDefault();
        } else if (e.key === "ArrowDown" && !mode) {
            historyIndex = Math.min(history.length, historyIndex + 1);
            input.value = history[historyIndex] || "";
            e.preventDefault();
        } else if (e.key === "Tab" && !mode) {
            e.preventDefault();
            complete();
        } else if (e.key === "l" && e.ctrlKey) {
            e.preventDefault();
            clear();
        }
    });

    closeBtn.addEventListener("click", close);

    term.addEventListener("click", (e) => {
        if (e.target.closest("a, button") || String(window.getSelection())) return;
        if (!game && !input.disabled) input.focus({preventScroll: true});
    });

    document.addEventListener("keyup", (e) => {
        if (game && game.onKeyUp) game.onKeyUp(e);
    });

    document.addEventListener("keydown", (e) => {
        if (game && game.onKey(e)) return;
        const target = e.target;
        const typing = target instanceof HTMLElement &&
            (target.matches("input, textarea, select") || target.isContentEditable);

        if (term.hidden) {
            if ((e.key === "/" || e.key === "`") && !typing && !e.ctrlKey && !e.metaKey && !e.altKey) {
                e.preventDefault();
                open();
            }
            return;
        }
        if (e.key === "Escape") {
            e.preventDefault();
            if (mode && mode.onEscape) mode.onEscape();
            else close();
        } else if (e.key === "`" && target === input && input.value === "") {
            e.preventDefault();
            close();
        }
    });

    const hint = document.getElementById("term-hint");
    if (hint) {
        if (touchy) {
            const kbd = hint.querySelector("kbd");
            if (kbd) kbd.remove();
        }
        hint.addEventListener("click", open);
    }
    strip.addEventListener("click", open);
    fab.addEventListener("click", open);
})();
