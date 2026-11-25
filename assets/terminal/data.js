// Projects and files for the terminal
(() => {
    "use strict";
    const bob = window.bob;
    const BLOG = "https://blog.bobbedbob.io/";

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

    function allEntries() {
        return [...DIRS.projects, ...DIRS.friends, ...DIRS.socials, {name: "blog", href: BLOG}];
    }

    bob.termData = {PROJECTS, DIRS, FILES, BLOG, allEntries};
})();
