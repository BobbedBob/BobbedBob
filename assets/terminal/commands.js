// Everyday terminal commands
(() => {
    "use strict";
    const bob = window.bob;
    const sh = bob.sh;
    const {
        el,
        print,
        printParts,
        link,
        cmdButton,
        suggest,
        openLink,
        clear,
        command,
        store,
        visitorName,
        user,
        updateName
    } = sh;
    const {PROJECTS, LINKS, FILES, BLOG, allEntries} = bob.termData;
    const PROGRAMS = ["projects", "friends", "socials"];

    command("help", {
        group: "the basics",
        help: "show this list",
        run() {
            print("here's everything you can do. click a command or type it in.");
            const groups = {};
            for (const [name, c] of Object.entries(sh.commands)) {
                if (c.hidden) continue;
                (groups[c.group] = groups[c.group] || []).push([name, c.help]);
            }

            for (const group of ["the basics", "games", "for the nerds"]) {
                const list = groups[group];
                if (!list) continue;
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
    });
    command("name", {
        complete: () => ["reset"],
        group: "the basics",
        help: "tell me your name (try: name sam)",
        run(args, rest) {
            const current = visitorName();
            const wanted = rest.replace(/[\u0000-\u001f\u007f]/g, "").trim();
            if (!wanted) {
                if (current) {
                    print(`you're ${current}. your prompt says ${sh.prompt}`);
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
            print(`your prompt is now ${sh.prompt} (it's saved in your browser, nobody else sees it).`, "dim");
            if (bob.xp) bob.xp.once("name", 10, "for introducing yourself");
        },
    });
    command("projects", {
        complete: () => PROJECTS.map((p) => p.id),
        group: "the basics",
        help: "things i've built (try: projects classani)",
        run(args, rest) {
            if (rest) {
                const query = rest.toLowerCase();
                const p = PROJECTS.find((x) => x.id === query || x.name === query) ||
                    PROJECTS.find((x) => x.id.startsWith(query) || x.name.startsWith(query));
                if (p) return showProject(p);
                print(`projects: no project called '${rest}'.`, "err");
                return suggest("try one of these: ", PROJECTS.map((x) => "projects " + x.id));
            }
            print("things i've built. click a name to visit it, or 'more' for the details.");
            const show = (p) => {
                printParts([link(p.name, p.href), "  ", cmdButton("more", "projects " + p.id)]);
                print("  " + p.blurb, "dim");
            };
            print("");
            print("the main ones", "head");
            PROJECTS.filter((p) => !p.small).forEach(show);
            print("");
            print("smaller ones", "head");
            PROJECTS.filter((p) => p.small).forEach(show);
        },
    });
    command("about", {
        group: "the basics",
        help: "a bit about me",
        run() {
            FILES["about.txt"].forEach((l) => print(l));
        },
    });
    command("friends", {
        group: "the basics",
        help: "my friends' websites",
        run() {
            listLinks("friends");
        },
    });
    command("socials", {
        group: "the basics",
        help: "where to find me",
        run() {
            listLinks("socials");
        },
    });
    command("blog", {
        complete: () => ["home", "1", "2", "3"],
        group: "the basics",
        help: "my latest blog posts",
        run(args) {
            blogCommand(args);
        },
    });
    command("xp", {
        group: "the basics",
        help: "check your visitor level",
        run() {
            showXp();
        },
    });
    command("ls", {
        complete: () => [...Object.keys(FILES), ...PROGRAMS],
        group: "for the nerds",
        help: "list files and programs",
        run(args) {
            const target = (args[0] || "").replace(/^~\/?/, "").replace(/^\.\//, "");
            if (!target || target === ".") {
                return printParts([
                    cmdButton("about.txt", "cat about.txt"), "   ",
                    cmdButton("secret.txt", "cat secret.txt"), "   ",
                    ...PROGRAMS.flatMap((name, i) => [cmdButton(name + "*", name), i < PROGRAMS.length - 1 ? "   " : ""]),
                ]);
            }
            const name = target.replace(/\/$/, "");
            if (FILES[target]) return print(target);
            if (PROGRAMS.includes(name)) {
                if (target.endsWith("/")) return print(`ls: cannot access '${target}': not a directory`, "err");
                return printParts([cmdButton(name + "*", name)]);
            }
            print(`ls: cannot access '${target}': no such file or directory`, "err");
        },
    });
    command("cat", {
        complete: () => Object.keys(FILES),
        group: "for the nerds",
        help: "read a file (try: cat about.txt)",
        run(args, rest) {
            const target = rest.replace(/^~\//, "").replace(/^\.\//, "");
            if (!target) return print("usage: cat <file>   (try: cat about.txt)");
            if (FILES[target]) return FILES[target].forEach((l) => print(l));
            const name = target.split("/")[0];
            if (PROGRAMS.includes(name)) {
                print(`cat: ${target}: that's a program, not a text file`, "err");
                return suggest("run it instead: ", [name]);
            }
            print(`cat: ${target}: no such file or directory`, "err");
        },
    });
    command("open", {
        complete: () => [...allEntries().map((e) => e.name), ...PROJECTS.map((p) => p.id)],
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
    });
    command("whoami", {
        group: "for the nerds",
        help: "who are you?",
        run() {
            const name = visitorName();
            print(user());
            if (name) print(`(you're ${name}. i'm bobby, an average programmer, student, and STEM fan.)`, "dim");
            else print("(and i'm bobby. tell me your name with 'name <your name>'.)", "dim");
        },
    });
    command("clear", {
        group: "for the nerds",
        help: "clear the screen",
        noXp: true,
        run() {
            clear();
        },
    });
    command("history", {
        group: "for the nerds",
        help: "commands you've run",
        run() {
            sh.history.forEach((h, i) => print(String(i + 1).padStart(4) + "  " + h));
        },
    });
    command("exit", {
        group: "for the nerds",
        help: "close the terminal",
        noXp: true,
        run() {
            print("logout");
            setTimeout(sh.close, 250);
        },
    });
    command("echo", {hidden: true, run: (args, rest) => print(rest)});
    command("date", {hidden: true, run: () => print(new Date().toString())});
    command("pwd", {hidden: true, run: () => print("/home/" + user())});
    command("cd", {
        hidden: true,
        run(args) {
            const target = (args[0] || "").replace(/^\.\//, "").replace(/\/$/, "");
            if (!target || target === "~" || target === ".") return;
            if (PROGRAMS.includes(target)) {
                print(`cd: ${target}: not a directory`, "err");
                return suggest("it's a program, so run it: ", [target]);
            }
            print(`cd: ${target}: no such file or directory`, "err");
        },
    });
    command("man", {hidden: true, run: () => print("no manual entry. bobby doesn't read manuals either.")});
    command("hi", {hidden: true, run: () => print("hi!! :D")});
    command("hello", {hidden: true, run: () => print("hello!! :D")});
    command("g'day", {hidden: true, run: () => print("g'day mate!! how ya going?")});

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

    function listLinks(name) {
        LINKS[name].forEach((e) => printParts([link(e.name, e.href)]));
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

    function showXp() {
        if (!bob.xp) return print("xp isn't working right now, sorry!", "err");
        const s = bob.xp.status();
        print(`you're lvl ${s.level}: "${s.title}"`, "head");
        print(`${bob.xp.bar(20)} ${s.xp}/${s.next}xp`);
        print("");
        print("how it works: you earn xp for visiting, trying new commands, playing the games,", "dim");
        print("and finding the odd secret. it's saved in your browser, so it's just for you.", "dim");
    }
})();
