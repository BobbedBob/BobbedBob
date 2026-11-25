// terminal larp
(() => {
    "use strict";
    const bob = (window.bob = window.bob || {});
    const store = bob.store || {get: (k, d = null) => d, set: () => {}};

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
    const BLOG = "https://blog.bobbedbob.io/";

    // ---------- tiny dom helper ----------
    function el(tag, attrs = {}, text) {
        const node = document.createElement(tag);
        for (const [k, v] of Object.entries(attrs)) {
            if (k === "class") node.className = v;
            else node.setAttribute(k, v);
        }
        if (text !== undefined) node.textContent = text;
        return node;
    }

    // ---------- data ----------
    const PROJECTS = [
        {
            id: "classani",
            name: "classani",
            href: "https://classani.org/",
            years: "2024 to now",
            blurb: "the all-in-one education suite for independent educators. classes, files, schedules, " +
                "assessments, quizzes, billing and recruiting in one clean workspace.",
            stack: "django, htmx, bootstrap, postgresql, google cloud",
        },
        {
            id: "barn",
            name: "bob's bytes barn",
            href: "https://barn.bobbedbob.io/",
            years: "2025 to now",
            blurb: "my little web dev business in melbourne. i build websites and web apps, keep them healthy, " +
                "and take over projects other developers left behind. in english or chinese.",
            stack: "plain html, css and js (es modules), no build step, three languages, a price estimator",
        },
        {
            id: "donkeyvote",
            name: "donkeyvote",
            small: true,
            href: "https://donkey.bobbedbob.io/",
            years: "2026",
            blurb: "voting for dummies. helps people who don't follow politics vote in the victorian state election: " +
                "find your seat, answer 16 agree/disagree questions, and get a suggested order for every box on your ballot.",
            stack: "plain js, python pipeline over official vec data, nothing leaves your browser",
        },
        {
            id: "timer",
            name: "timer",
            small: true,
            href: "https://timer.bobbedbob.io/",
            years: "2026",
            blurb: "a countdown, count-to-time alarm and stopwatch. millisecond display, alarms, laps, " +
                "an always-on-top mini window and burn-in protection.",
            stack: "plain js, web audio api, document picture-in-picture",
        },
        {
            id: "atar",
            name: "atar countdown",
            href: "https://atar.bobbedbob.io/",
            years: "2026",
            blurb: "a countdown to every vce 2026 exam. all roads lead to rome.",
            stack: "plain html and js",
        },
        {
            id: "roblox",
            name: "roblox stuff",
            href: "https://create.roblox.com/talent/creators/574283844",
            years: "ages ago to now",
            blurb: "games and scripting on roblox. it's where i started.",
            stack: "lua / luau, roblox studio",
        },
    ];

    function scrape(selector) {
        return [...document.querySelectorAll(selector + " a.alink")].map((a) => {
            const img = a.querySelector("img");
            return {name: ((img && img.alt) || a.textContent).trim().toLowerCase(), href: a.href};
        });
    }

    const DIRS = {
        projects: PROJECTS,
        friends: scrape("#friends"),
        socials: scrape("#links"),
    };

    const FILES = {
        "about.txt": [
            "hi, im bobby. (aka gnomedevs, bobbedbobby and bobbedbob)",
            "average programmer, student, and STEM fan.",
            "",
            "- full-stack dev (python, django and htmx, mostly)",
            "- native chinese speaker",
            "- programming since grade 4 (forced by mum)",
            "- maths enjoyer",
            "- part-time goober",
        ],
        "secret.txt": [
            "there are no secrets here.",
            "",
            "...",
            "",
            "alright, fine. close the terminal and type this on the main page:",
            "up up down down left right left right b a",
            "(on a phone? type 'chaos' in here instead.)",
        ],
    };

    // ---------- build the terminal ----------
    const term = el("div", {id: "term", class: "term", role: "dialog", "aria-label": "terminal"});
    const bar = el("div", {class: "term-bar", title: "drag to resize, double-click for full screen"});
    const titleEl = el("span", {class: "term-title"}, `bobsh: ${user()}@bobbedbob.io`);
    const fullBtn = el("button", {class: "term-btn", type: "button", "aria-label": "toggle full screen"}, "[ ] full screen");
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

    const fab = el("button", {type: "button", class: "term-fab", title: "open the terminal", "aria-label": "open the terminal"}, ">_");
    if (store.get("bob.term.used") !== "1") fab.classList.add("pulse");
    document.body.append(strip, fab);
    document.body.classList.add("has-strip");

    // ---------- resizing + full screen ----------
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

    // ---------- output ----------
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

    // clickable command
    function cmdButton(label, command = label) {
        const b = el("button", {type: "button", class: "term-cmd", title: `run "${command}"`}, label);
        b.addEventListener("click", (e) => {
            e.stopPropagation();
            if (mode || game || busy) return;
            run(command);
        });
        return b;
    }

    // parts: strings, nodes, or arrays of either
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

    // ---------- modes (games, vim) ----------
    let mode = null; // {prompt(): string, onLine(line), onEscape()}
    let game = null; // {onKey(e): bool, stop()}
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

    // ---------- history + completion ----------
    const history = [];
    let historyIndex = 0;

    function allEntries() {
        return [...DIRS.projects, ...DIRS.friends, ...DIRS.socials, {name: "blog", href: BLOG}];
    }

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
            const cmd = value.slice(0, space).toLowerCase();
            if (cmd === "cat") pool = [...Object.keys(FILES), ...PROJECTS.map((p) => "projects/" + p.id)];
            else if (cmd === "ls") pool = [...Object.keys(DIRS), ...Object.keys(FILES)];
            else if (cmd === "open") pool = [...allEntries().map((e) => e.name), ...PROJECTS.map((p) => p.id)];
            else if (cmd === "music") pool = ["play", "pause", "next", "list", "vol"];
            else if (cmd === "maths") pool = ["easy", "normal", "hard"];
            else if (cmd === "name") pool = ["reset"];
            else if (cmd === "blog") pool = ["home", "1", "2", "3"];
            else pool = [];
        }
        const matches = [...new Set(pool)].filter((p) => p.startsWith(partial.toLowerCase()));
        if (matches.length === 1) {
            input.value = head + matches[0] + (space === -1 ? " " : "");
        } else if (matches.length > 1) {
            print(PROMPT + " " + input.value, "echo");
            print(matches.join("   "), "dim");
        }
    }

    // ---------- running commands ----------
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
        const name = rawName.toLowerCase();
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

    // ---------- commands ----------
    const commands = {
        help: {
            group: "the basics",
            help: "show this list",
            run() {
                print("here's everything you can do. click a command or type it in.");
                const groups = {};
                for (const [name, c] of Object.entries(commands)) {
                    if (c.hidden) continue;
                    (groups[c.group] = groups[c.group] || []).push([name, c.help]);
                }
                for (const [group, list] of Object.entries(groups)) {
                    print("");
                    print(group, "head");
                    for (const [name, text] of list) {
                        printParts([cmdButton(name.padEnd(10)), "  ", text]);
                    }
                }
                print("");
                print("tips: tab finishes words for you, up/down brings back old commands, esc closes this.", "dim");
                print("there might be a few commands that aren't on this list, too.", "dim");
            },
        },
        name: {
            group: "the basics",
            help: "tell me your name (try: name sam)",
            run(args, rest) {
                const current = visitorName();
                const wanted = rest.replace(/[\u0000-\u001f\u007f]/g, "").trim();
                if (!wanted) {
                    if (current) {
                        print(`you're ${current}. your prompt says ${PROMPT}`);
                        suggest("change it with 'name <new name>', or go back to guest: ", ["name reset"]);
                    } else {
                        print("you haven't told me your name yet.");
                        print("type name and then your name, like: name sam", "dim");
                    }
                    return;
                }
                if (wanted.toLowerCase() === "reset" || wanted.toLowerCase() === "clear") {
                    store.set("bob.name", "");
                    updateName();
                    return print("done, you're back to being guest.");
                }
                const name = wanted.slice(0, 24);
                store.set("bob.name", name);
                updateName();
                print(`nice to meet you, ${name}!`, "head");
                print(`your prompt is now ${PROMPT} (it's saved in your browser, nobody else sees it).`, "dim");
                if (bob.xp) bob.xp.once("name", 10, "for introducing yourself");
            },
        },
        projects: {
            group: "the basics",
            help: "things i've built",
            run() {
                print("things i've built. click a name to visit it, or 'more' for the details.");
                const show = (p) => {
                    printParts([link(p.name, p.href), "  ", cmdButton("more", "cat projects/" + p.id)]);
                    print("  " + p.blurb, "dim");
                };
                print("");
                print("the main ones", "head");
                PROJECTS.filter((p) => !p.small).forEach(show);
                print("");
                print("smaller ones", "head");
                PROJECTS.filter((p) => p.small).forEach(show);
            },
        },
        about: {
            group: "the basics",
            help: "a bit about me",
            run() {
                FILES["about.txt"].forEach((l) => print(l));
            },
        },
        friends: {
            group: "the basics",
            help: "my friends' websites",
            run() {
                listDir("friends");
            },
        },
        socials: {
            group: "the basics",
            help: "where to find me",
            run() {
                listDir("socials");
            },
        },
        blog: {
            group: "the basics",
            help: "my latest blog posts",
            run(args) {
                blogCommand(args);
            },
        },
        music: {
            group: "the basics",
            help: "play, pause or change the music",
            run(args) {
                music(args);
            },
        },
        xp: {
            group: "the basics",
            help: "check your visitor level",
            run() {
                showXp();
            },
        },
        maths: {
            group: "games",
            help: "mental maths challenge (try: maths hard)",
            run(args) {
                maths(args);
            },
        },
        stack: {
            group: "games",
            help: "falling blocks: clear lines, don't hit the top",
            run() {
                stack();
            },
        },
        rally: {
            group: "games",
            help: "paddle and ball against the computer, first to 5",
            run() {
                rally();
            },
        },
        snake: {
            group: "games",
            help: "classic snake (arrow keys, wasd or swipe)",
            run() {
                snake();
            },
        },
        ls: {
            group: "for the nerds",
            help: "list files (try: ls projects)",
            run(args) {
                const target = (args[0] || "").replace(/^~\/?/, "").replace(/\/$/, "");
                if (!target || target === ".") {
                    printParts([
                        cmdButton("about.txt", "cat about.txt"), "   ",
                        cmdButton("secret.txt", "cat secret.txt"), "   ",
                        cmdButton("projects/", "ls projects"), "   ",
                        cmdButton("friends/", "ls friends"), "   ",
                        cmdButton("socials/", "ls socials"),
                    ]);
                } else if (DIRS[target]) {
                    listDir(target);
                } else if (FILES[target]) {
                    print(target);
                } else {
                    print(`ls: cannot access '${target}': no such file or directory`, "err");
                }
            },
        },
        cat: {
            group: "for the nerds",
            help: "read a file (try: cat about.txt)",
            run(args, rest) {
                const target = rest.replace(/^~\//, "").replace(/^\.\//, "");
                if (!target) return print("usage: cat <file>   (try: cat about.txt)");
                if (FILES[target]) return FILES[target].forEach((l) => print(l));
                const projectMatch = target.match(/^projects\/(.+)$/);
                if (projectMatch) {
                    const p = PROJECTS.find((x) => x.id === projectMatch[1].toLowerCase());
                    if (p) return showProject(p);
                }
                if (DIRS[target.replace(/\/$/, "")]) return print(`cat: ${target}: is a directory (try ls ${target})`, "err");
                print(`cat: ${target}: no such file or directory`, "err");
            },
        },
        open: {
            group: "for the nerds",
            help: "open a project, friend or social (try: open timer)",
            run(args, rest) {
                const query = rest.toLowerCase();
                if (!query) return print("usage: open <name>   (try: open donkeyvote)");
                const entries = [...allEntries(), ...PROJECTS.map((p) => ({name: p.id, href: p.href}))];
                const hit = entries.find((e) => e.name === query) || entries.find((e) => e.name.startsWith(query));
                if (hit) openLink(hit.href, hit.name);
                else print(`open: couldn't find '${rest}'. try 'projects', 'friends' or 'socials' to see what's there.`, "err");
            },
        },
        whoami: {
            group: "for the nerds",
            help: "who are you?",
            run() {
                const name = visitorName();
                print(user());
                if (name) print(`(you're ${name}. i'm bobby, an average programmer, student, and STEM fan.)`, "dim");
                else print("(and i'm bobby. tell me your name with 'name <your name>'.)", "dim");
            },
        },
        fastfetch: {
            group: "for the nerds",
            help: "the specs of my actual computer",
            run() {
                fastfetch();
            },
        },
        clear: {
            group: "for the nerds",
            help: "clear the screen",
            noXp: true,
            run() {
                out.replaceChildren();
            },
        },
        history: {
            group: "for the nerds",
            help: "commands you've run",
            run() {
                history.forEach((h, i) => print(String(i + 1).padStart(4) + "  " + h));
            },
        },
        exit: {
            group: "for the nerds",
            help: "close the terminal",
            noXp: true,
            run() {
                print("logout");
                setTimeout(close, 250);
            },
        },

        // the hidden ones
        echo: {hidden: true, run: (args, rest) => print(rest)},
        date: {hidden: true, run: () => print(new Date().toString())},
        pwd: {hidden: true, run: () => print("/home/" + user())},
        cd: {hidden: true, run: () => print("cd: this website is a one-room house. try 'ls' instead.")},
        man: {hidden: true, run: () => print("no manual entry. bobby doesn't read manuals either.")},
        hi: {hidden: true, run: () => print("hi!! :D")},
        hello: {hidden: true, run: () => print("hello!! :D")},
        "g'day": {hidden: true, run: () => print("g'day mate!! how ya going?")},
        rm: {hidden: true, run: () => print("rm: permission denied. nice try though.", "err")},
        sudo: {
            hidden: true,
            run(args, rest) {
                if (/^rm\s+(-rf|-fr|-r\s+-f|-f\s+-r)\s+(\/\*?|~|\*)(\s+--no-preserve-root)?$/.test(rest) ||
                    rest === "rm -rf --no-preserve-root /") {
                    return nuke();
                }
                if (!rest) return print("usage: sudo <command>");
                print(`[sudo] password for ${user()}: `);
                print(`${user()} is not in the sudoers file. this incident will be reported.`, "err");
            },
        },
        vim: {hidden: true, run: () => vim()},
        neofetch: {hidden: true, run: () => fastfetch()},
        vi: {hidden: true, run: () => vim()},
        nano: {hidden: true, run: () => print("nano? in this economy? try vim.")},
        chaos: {
            hidden: true,
            run() {
                if (bob.chaos) {
                    bob.chaos();
                    print(document.body.classList.contains("chaos") ? "chaos mode: on. close the terminal to enjoy it." : "chaos mode: off. phew.");
                }
            },
        },
    };

    function blogCommand(args) {
        const blog = bob.blog;
        const sub = (args[0] || "").toLowerCase();
        if (!blog || sub === "home") return openLink(BLOG, "my blog");
        const posts = blog.posts;
        const n = parseInt(sub, 10);
        if (n >= 1 && n <= posts.length) return openLink(posts[n - 1].url, `"${posts[n - 1].title}"`);
        if (sub) return print(`blog: pick a number from 1 to ${posts.length}, or 'blog home'.`, "err");

        print("latest posts. click one to read it.", "head");
        posts.forEach((post, i) => {
            const parts = [String(i + 1).padStart(2) + ". ", link(post.title, post.url), "  "];
            if (blog.isNew(post)) parts.push(el("span", {class: "new-tag"}, "NEW"), " ");
            parts.push(el("span", {class: "term-dim"}, `${blog.formatDate(post.date)} #${post.category}`));
            printParts(parts);
        });
        print("");
        printParts(["or open the whole thing: ", link("blog.bobbedbob.io", BLOG)], "dim");
    }

    function listDir(name) {
        const entries = DIRS[name];
        if (name === "projects") return commands.projects.run();
        entries.forEach((e) => printParts([link(e.name, e.href)]));
        print("click one to open it, or type open <name>.", "dim");
    }

    function showProject(p) {
        print(p.name, "head");
        print(p.blurb);
        print("");
        print("when:  " + p.years, "dim");
        print("stack: " + p.stack, "dim");
        printParts(["link:  ", link(p.href.replace(/^https?:\/\//, "").replace(/\/$/, ""), p.href)], "dim");
    }


    // ---------- fastfetch: my real machine ----------
    // bobstation, minus anything that changes day to day (uptime, usage, versions) and the local ip.
    // neofetch is an alias for this.
    function fastfetch() {
        // {...} marks the white "f", everything else is fedora blue
        const logo = [
            "             .',;::::;,'.             ",
            "         .';:cccccccccccc:;,.         ",
            "      .;cccccccccccccccccccccc;.      ",
            "    .:cccccccccccccccccccccccccc:.    ",
            "  .;ccccccccccccc;{.:dddl:.};ccccccc;.  ",
            " .:ccccccccccccc;{OWMKOOXMWd};ccccccc:. ",
            ".:ccccccccccccc;{KMMc};cc;{xMMc};ccccccc:.",
            ",cccccccccccccc;{MMM.};cc;{;WW:};cccccccc,",
            ":cccccccccccccc;{MMM.};cccccccccccccccc:",
            ":ccccccc;{oxOOOo};{MMM000k.};cccccccccccc:",
            "cccccc;{0MMKxdd:};{MMMkddc.};cccccccccccc;",
            "ccccc;{XMO'};cccc;{MMM.};cccccccccccccccc'",
            "ccccc;{MMo};ccccc;{MMW.};ccccccccccccccc; ",
            "ccccc;{0MNc.}ccc{.xMMd};ccccccccccccccc;  ",
            "cccccc;{dNMWXXXWM0:};cccccccccccccc:,   ",
            "cccccccc;{.:odl:.};cccccccccccccc:,.    ",
            "ccccccccccccccccccccccccccccc:'.      ",
            ":ccccccccccccccccccccccc:;,..         ",
            " ':cccccccccccccccc::;,.              ",
        ];
        const LOGO_WIDTH = 38;
        const info = [
            ["OS", "Fedora Linux (Workstation Edition) x86_64"],
            ["Host", "B650I AX"],
            ["Shell", "bobsh 1.0"],
            ["Terminal", "bobsh"],
            ["Desktop Environment", "GNOME (Wayland)"],
            ["Display (BOE 17\")", "1920x1080, 144 Hz"],
            ["Display (LG Electronics 24\")", "1920x1080, 144 Hz"],
            ["CPU", "AMD Ryzen 5 7600 (6 cores, 12 threads)"],
            ["GPU 1", "AMD Radeon RX 9060 XT [Discrete]"],
            ["GPU 2", "AMD Radeon 610M [Integrated]"],
            ["Memory", "32 GB"],
            ["Disk", "2 TB (btrfs)"],
        ];

        // build the info column: title, underline, then "Key: value" with the key highlighted
        const infoLines = [
            [el("span", {class: "ff-key"}, "bobby"), "@", el("span", {class: "ff-key"}, "bobstation")],
            ["----------------"],
            ...info.map(([k, v]) => [el("span", {class: "ff-key"}, k), ": " + v]),
        ];
        const longestInfo = Math.max(...info.map(([k, v]) => k.length + 2 + v.length));
        const cw = charWidth();
        const cols = Math.floor(out.clientWidth / cw) - 4;

        const row = el("div", {class: "term-row pre ff"});
        // one logo line: blue spans with the {white} bits of the f in between
        const logoLine = (i) => {
            const line = logo[i] || " ".repeat(LOGO_WIDTH);
            return line.split(/(\{[^}]*\})/).filter(Boolean).map((part) =>
                part.startsWith("{")
                    ? el("span", {class: "ff-f"}, part.slice(1, -1))
                    : el("span", {class: "ff-logo"}, part));
        };

        if (cols >= LOGO_WIDTH + 4 + longestInfo) {
            // wide: logo on the left, info on the right, like the real thing
            const rows = Math.max(logo.length, infoLines.length);
            for (let i = 0; i < rows; i++) {
                row.append(...logoLine(i), "    ", ...(infoLines[i] || []), "\n");
            }
        } else {
            // narrower: logo on top if it fits, then the info (which can wrap)
            if (cols >= LOGO_WIDTH) logo.forEach((_, i) => row.append(...logoLine(i), "\n"));
            row.append("\n");
            infoLines.forEach((parts) => row.append(...parts, "\n"));
            row.classList.add("ff-wrap");
        }
        out.append(row);
        scrollDown();
    }

    // ---------- music ----------
    // the undertale menu tracks unlock one per visit (see main.js), so "next" only cycles what you've unlocked
    const TRACKS = ["mus_menu0", "mus_menu1", "mus_menu2", "mus_menu3", "mus_menu4", "mus_menu5", "mus_menu6"];

    function unlockedTracks() {
        const visits = typeof visitsNum === "number" ? visitsNum : 0;
        return Math.min(visits, TRACKS.length - 1) + 1;
    }

    function currentTrack() {
        const audio = document.getElementById("music-audio");
        const m = audio && (audio.currentSrc || audio.src).match(/mus_menu(\d)/);
        return m ? parseInt(m[1], 10) : 0;
    }

    function music(args) {
        const audio = document.getElementById("music-audio");
        if (!audio) return print("music: can't find the music player :(", "err");
        const sub = (args[0] || "").toLowerCase();
        const unlocked = unlockedTracks();

        const play = (msg) => {
            audio.style.display = "";
            audio.play()
                .then(() => print(msg))
                .catch(() => print("music: your browser blocked it. click play on the player at the bottom of the page instead.", "err"));
        };

        if (!sub) {
            print(`the undertale menu music. you're on track ${currentTrack() + 1} of ${TRACKS.length} ` +
                `(${audio.paused ? "paused" : "playing"}, volume ${Math.round(audio.volume * 100)}).`);
            print(unlocked < TRACKS.length
                ? `you've unlocked ${unlocked} so far. come back again to unlock the next one.`
                : "you've unlocked every track. legend.", "dim");
            suggest("try: ", ["music play", "music pause", "music next", "music list"]);
            return;
        }
        if (sub === "play") return play(`playing track ${currentTrack() + 1}.`);
        if (sub === "pause" || sub === "stop") {
            audio.pause();
            return print("paused.");
        }
        if (sub === "next" || sub === "skip") {
            if (unlocked === 1) return print("you've only unlocked one track so far. visit again to unlock more!");
            const next = (currentTrack() + 1) % unlocked;
            audio.src = `assets/audio/${TRACKS[next]}.ogg`;
            return play(`now playing track ${next + 1} of ${unlocked} unlocked.`);
        }
        if (sub === "list") {
            TRACKS.forEach((t, i) => {
                const label = `track ${i + 1}`;
                if (i < unlocked) printParts([cmdButton(label, "music track " + (i + 1)), i === currentTrack() ? "  <- current" : ""]);
                else print(`${label}  ??? (visit ${i - unlocked + 1} more time${i - unlocked ? "s" : ""} to unlock)`, "dim");
            });
            return;
        }
        if (sub === "track") {
            const n = parseInt(args[1], 10);
            if (!(n >= 1 && n <= TRACKS.length)) return print(`usage: music track <1-${TRACKS.length}>`);
            if (n > unlocked) return print(`track ${n} is still locked. keep visiting!`);
            audio.src = `assets/audio/${TRACKS[n - 1]}.ogg`;
            return play(`now playing track ${n}.`);
        }
        if (sub === "vol" || sub === "volume") {
            const v = parseInt(args[1], 10);
            if (isNaN(v)) return print(`volume is ${Math.round(audio.volume * 100)}. usage: music vol <0-100>`);
            audio.volume = Math.min(100, Math.max(0, v)) / 100;
            return print(`volume set to ${Math.round(audio.volume * 100)}.`);
        }
        print(`music: don't know '${sub}'. try play, pause, next, list or vol.`, "err");
    }

    // ---------- xp ----------
    function showXp() {
        if (!bob.xp) return print("xp isn't working right now, sorry!", "err");
        const s = bob.xp.status();
        print(`you're lvl ${s.level}: "${s.title}"`, "head");
        print(`${bob.xp.bar(20)} ${s.xp}/${s.next}xp`);
        print("");
        print("how it works: you earn xp for visiting, trying new commands, playing the games,", "dim");
        print("and finding the odd secret. it's saved in your browser, so it's just for you.", "dim");
    }

    // ---------- maths ----------
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
            // 0: warm up
            [
                () => { const a = r(10, 99), b = r(10, 99); return q(`${a} + ${b}`, a + b); },
                () => { const a = r(20, 99), b = r(10, a); return q(`${a} - ${b}`, a - b); },
                () => { const a = r(2, 12), b = r(2, 12); return q(`${a} × ${b}`, a * b); },
            ],
            // 1: bigger numbers
            [
                () => { const a = r(100, 999), b = r(100, 999); return q(`${a} + ${b}`, a + b); },
                () => { const a = r(300, 999), b = r(100, a); return q(`${a} - ${b}`, a - b); },
                () => { const a = r(13, 99), b = r(3, 9); return q(`${a} × ${b}`, a * b); },
                () => { const b = r(3, 12), ans = r(11, 25); return q(`${b * ans} ÷ ${b}`, ans); },
                () => { const a = r(11, 20); return q(`${a}²`, a * a); },
            ],
            // 2: proper maths
            [
                () => { const a = r(12, 45), b = r(11, 29); return q(`${a} × ${b}`, a * b); },
                () => { const a = r(3, 15), b = r(3, 15), c = r(10, 99); return q(`${a} × ${b} + ${c}`, a * b + c); },
                () => { const a = r(10, 60), b = r(3, 12), c = r(3, 12); return q(`${a} - ${b} × ${c}`, a - b * c); },
                () => {
                    const p = pick([5, 10, 15, 20, 25, 30, 40, 60, 75]);
                    const n = (100 / gcd(p, 100)) * r(1, 12);
                    return q(`${p}% of ${n}`, (p * n) / 100);
                },
                () => { const a = r(15, 30); return q(`${a}²`, a * a); },
                () => { const a = r(3, 15), b = r(3, 15); return q(`-${a} × ${b}`, -a * b); },
            ],
            // 3: maths enjoyer
            [
                () => { const a = r(120, 999), b = r(3, 9); return q(`${a} × ${b}`, a * b); },
                () => { const a = r(31, 99), b = r(31, 99); return q(`${a} × ${b}`, a * b); },
                () => { const a = r(5, 40), b = r(5, 40), c = r(3, 12); return q(`(${a} + ${b}) × ${c}`, (a + b) * c); },
                () => { const a = r(2, 12); return q(`${a}³`, a * a * a); },
                () => { const a = r(12, 30); return q(`√${a * a}`, a); },
                () => { const a = r(11, 30), b = r(2, a - 1); return q(`${a}² - ${b}²`, a * a - b * b); },
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

    // ---------- snake ----------
    function snake() {
        const W = 22;
        const H = 12;
        const best = parseInt(store.get("bob.snake.best", "0"), 10) || 0;
        const r = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
        let body = [{x: 6, y: 6}, {x: 5, y: 6}, {x: 4, y: 6}];
        let dir = {x: 1, y: 0};
        const queue = [];
        let food;
        let score = 0;
        let delay = 140;
        let timer = null;
        let over = false;
        let started = false;

        const screen = print("", "pre game");
        print("");
        form.hidden = true;
        input.blur();

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
            rows.push(started ? "esc or q to quit" : "arrow key or swipe to start");
            screen.textContent = rows.join("\n");
            scrollDown();
        }

        function turn([x, y]) {
            const last = queue.length ? queue[queue.length - 1] : dir;
            if (last.x === -x && last.y === -y) return;
            if (last.x === x && last.y === y) return;
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
            if (hitWall || hitSelf) return end(hitWall ? "bonk! you hit the wall." : "oops, you ate yourself.");
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
            if (over) return;
            step();
            if (!over) timer = setTimeout(loop, delay);
        }

        function end(msg) {
            if (over) return;
            over = true;
            clearTimeout(timer);
            game = null;
            term.removeEventListener("touchstart", onTouchStart);
            term.removeEventListener("touchend", onTouchEnd);
            form.hidden = false;
            print(msg);
            const newBest = score > best;
            if (newBest) store.set("bob.snake.best", score);
            print(`you scored ${score}.${newBest ? " that's a new personal best!" : ` your best is ${best}.`}`, "head");
            if (score > 0 && bob.xp) bob.xp.gain(score * 3, "for playing snake");
            suggest("again? ", ["snake"]);
            if (!term.hidden) input.focus({preventScroll: true});
        }

        const KEYS = {
            arrowup: [0, -1], w: [0, -1],
            arrowdown: [0, 1], s: [0, 1],
            arrowleft: [-1, 0], a: [-1, 0],
            arrowright: [1, 0], d: [1, 0],
        };

        let touch = null;
        function onTouchStart(e) {
            touch = {x: e.touches[0].clientX, y: e.touches[0].clientY};
        }
        function onTouchEnd(e) {
            if (!touch) return;
            const dx = e.changedTouches[0].clientX - touch.x;
            const dy = e.changedTouches[0].clientY - touch.y;
            touch = null;
            if (Math.max(Math.abs(dx), Math.abs(dy)) < 20) return;
            if (Math.abs(dx) > Math.abs(dy)) turn(dx > 0 ? [1, 0] : [-1, 0]);
            else turn(dy > 0 ? [0, 1] : [0, -1]);
        }
        term.addEventListener("touchstart", onTouchStart, {passive: true});
        term.addEventListener("touchend", onTouchEnd);

        game = {
            onKey(e) {
                const key = e.key.toLowerCase();
                if (key === "escape" || key === "q") {
                    e.preventDefault();
                    end("thanks for playing!");
                } else if (KEYS[key]) {
                    e.preventDefault();
                    turn(KEYS[key]);
                }
                return true;
            },
            stop() {
                end("thanks for playing!");
            },
        };

        placeFood();
        draw();
    }

    // ---------- shared bits for the arcade games ----------
    // measures how wide one character is in the terminal, so games can fit narrow screens
    function charWidth() {
        const probe = el("span", {class: "term-row pre"}, "MMMMMMMMMM");
        probe.style.position = "absolute";
        probe.style.visibility = "hidden";
        out.append(probe);
        const w = probe.getBoundingClientRect().width / 10;
        probe.remove();
        return w || 9.6;
    }

    // hides the input, owns the keyboard + touch while the game runs, and tidies up afterwards
    function arcade(opts) {
        const screen = print("", "pre game");
        print(opts.hint || "", "dim"); // controls go in a normal row so they wrap on small phones
        print("");
        form.hidden = true;
        input.blur();
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

        term.addEventListener("touchstart", onTouchStart, {passive: true});
        term.addEventListener("touchmove", onTouchMove, {passive: false});
        term.addEventListener("touchend", onTouchEnd);

        const api = {
            screen,
            get over() {
                return over;
            },
            draw(text) {
                screen.textContent = text;
                scrollDown();
            },
            end(msg) {
                if (over) return;
                over = true;
                if (opts.onEnd) opts.onEnd();
                game = null;
                term.removeEventListener("touchstart", onTouchStart);
                term.removeEventListener("touchmove", onTouchMove);
                term.removeEventListener("touchend", onTouchEnd);
                form.hidden = false;
                print(msg);
                if (opts.finish) opts.finish();
                if (!term.hidden) input.focus({preventScroll: true});
            },
        };

        game = {
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
        };
        return api;
    }

    function finishScore(bestKey, score, xpEach, label) {
        const best = parseInt(store.get(bestKey, "0"), 10) || 0;
        const newBest = score > best;
        if (newBest) store.set(bestKey, score);
        print(`you scored ${score}.${newBest ? " that's a new personal best!" : ` your best is ${best}.`}`, "head");
        if (score > 0 && bob.xp) bob.xp.gain(Math.max(1, Math.round(score * xpEach)), label);
    }

    // ---------- stack (falling blocks) ----------
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
        const narrow = out.clientWidth < charWidth() * 38;
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
                // drag sideways to slide the piece one column at a time
                const step = charWidth() * 2;
                const columns = Math.trunc((t.clientX - start.x) / step);
                while (moved < columns) { move(1); moved++; }
                while (moved > columns) { move(-1); moved--; }
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

    // ---------- rally (paddle and ball) ----------
    function rally() {
        const fit = Math.floor(out.clientWidth / charWidth()) - 4; // room for the walls and padding
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

            // the computer follows the ball, a bit slowly, so it can be beaten
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
            if (ball.y < 0) { ball.y = -ball.y; ball.vy = -ball.vy; }
            if (ball.y > H - 1) { ball.y = 2 * (H - 1) - ball.y; ball.vy = -ball.vy; }

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

        // touch: the paddle follows your finger (mapped onto the 14 rows of the court)
        function aimAt(t, screen) {
            const r = screen.getBoundingClientRect();
            const rowHeight = r.height / (H + 4);
            target = (t.clientY - r.top) / rowHeight - 2;
        }

        serve(Math.random() < 0.5 ? -1 : 1);
        draw();
        loop();
    }

    // ---------- vim ----------
    function vim() {
        print("you're in vim now. good luck.");
        print("(hint: there is no hint)", "dim");
        let tries = 0;
        setMode({
            prompt: () => "~",
            onLine(line) {
                const t = line.trim();
                if ([":q", ":q!", ":wq", ":wq!", ":x", ":qa", ":qa!"].includes(t)) {
                    endMode();
                    print("you escaped vim. most people never do.", "ok");
                    if (bob.xp) bob.xp.once("vim", 30, "for escaping vim");
                    return;
                }
                tries++;
                if (tries >= 3) print("E37: no write since last change (psst: type :q and hit enter)", "err");
                else print(`E492: not an editor command: ${t}`, "err");
            },
            onEscape() {
                print("esc won't save you here. that's vim, baby.", "dim");
            },
        });
    }

    // ---------- sudo rm -rf / ----------
    function nuke() {
        busy = true;
        input.disabled = true;
        const steps = [
            [`[sudo] password for ${user()}: ********`, ""],
            ["removing /home/bobby/homework", "done"],
            ["removing /home/bobby/maths", "noooo"],
            ["removing /usr/bin/python3", "done"],
            ["removing /usr/lib/django", "done"],
            ["removing /home/bobby/friends", "error: friendship is permanent"],
            ["removing /boot/bobbedbob.io", "done"],
        ];
        steps.forEach(([label, status], i) => {
            setTimeout(() => print(status ? label + " " + ".".repeat(Math.max(3, 34 - label.length)) + " " + status : label), i * 320);
        });
        setTimeout(() => {
            if (typeof playExplosionSound === "function") playExplosionSound();
            document.body.classList.add("shake");
            print("KERNEL PANIC: bobby not found", "err");
            setTimeout(() => document.body.classList.remove("shake"), 900);
        }, steps.length * 320 + 200);
        setTimeout(() => {
            print("...just kidding. everything's fine.", "ok");
            print("please never run that on a real computer though.", "dim");
            busy = false;
            input.disabled = false;
            input.focus({preventScroll: true});
            if (bob.xp) bob.xp.once("nuke", 25, "for living dangerously");
        }, steps.length * 320 + 1600);
    }

    // ---------- open / close ----------
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
            void term.offsetHeight; // let the slide-in transition run
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

    bob.term = {open, close, isOpen, run};
    if (visitorName()) updateName();

    // ---------- events ----------
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
            out.replaceChildren();
        }
    });

    closeBtn.addEventListener("click", close);

    // clicking anywhere in the terminal focuses the input (unless you're selecting text or clicking a link)
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
