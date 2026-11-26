// Latest blog posts from the feed
(() => {
    "use strict";
    const bob = (window.bob = window.bob || {});

    const BLOG = "https://blog.bobbedbob.io/";
    const FEED = BLOG + "feed.xml";
    const NEW_DAYS = 30;
    const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

    const FALLBACK = [
        {
            title: "Chinese Education: A Factory of Superhumans",
            url: "https://blog.bobbedbob.io/opinions/2026/11/05/chinese-education.html",
            date: "2026-11-05",
            category: "opinions",
            summary: "As I wrap up my first year of university in Australia, I reflect on the privileges I have, being able to escape the tormenting grasp of the Gaokao apparatus.",
        },
        {
            title: "A Programmer’s Dignity in the AI Age",
            url: "https://blog.bobbedbob.io/opinions/2026/08/03/ai-coding.html",
            date: "2026-08-03",
            category: "opinions",
            summary: "It is (unfortunately) undeniable that artificial intelligence is a unique and powerful tool in computer science and software engineering.",
        },
        {
            title: "Why AI will never be able to create art",
            url: "https://blog.bobbedbob.io/opinions/2025/11/21/ai-art.html",
            date: "2025-11-21",
            category: "opinions",
            summary: "A long-standing argument and debate about artificial intelligence is its ability, along with, the inability thereof, to create art.",
        },
        {
            title: "DownUnder CTF 2025 Write-ups",
            url: "https://blog.bobbedbob.io/cybersecurity/2025/07/20/ductf-25.html",
            date: "2025-07-20",
            category: "cybersecurity",
            summary: "OSINT: Zer0C00l. You used to call me on my cellphone.",
        },
        {
            title: "UCLA CTF 2024 Write-ups",
            url: "https://blog.bobbedbob.io/cybersecurity/2024/02/19/uclactf-24.html",
            date: "2024-02-19",
            category: "cybersecurity",
            summary: "CRYPTO: Selamat Pagi. My best friend’s first name is Frequency, and his last name is Analysis.",
        },
        {
            title: "IrisCTF 2024 Write-ups",
            url: "https://blog.bobbedbob.io/cybersecurity/2024/01/08/irisctf-24.html",
            date: "2024-01-08",
            category: "cybersecurity",
            summary: "These solutions are not the best, this is the first time I’ve participated in a CTF challenge, so I’m trying my best.",
        },
    ];

    function el(tag, cls, text) {
        const node = document.createElement(tag);
        if (cls) node.className = cls;
        if (text !== undefined) node.textContent = text;
        return node;
    }

    function postLink(post, cls) {
        const a = el("a", cls);
        a.href = post.url;
        a.target = "_blank";
        a.rel = "noopener";
        a.addEventListener("click", () => {
            if (typeof playExplosionSound === "function") playExplosionSound();
        });
        return a;
    }

    function formatDate(iso) {
        const [y, m, d] = iso.split("-").map(Number);
        return `${d} ${MONTHS[m - 1]} ${y}`;
    }

    function isNew(post) {
        const age = (Date.now() - new Date(post.date + "T00:00:00").getTime()) / 86400000;
        return age >= 0 && age < NEW_DAYS;
    }

    function shorten(text, max) {
        if (text.length <= max) return text;
        const cut = text.slice(0, max);
        return cut.slice(0, cut.lastIndexOf(" ")).replace(/[,.;:]$/, "") + "...";
    }

    function renderMarquee(posts) {
        const marquee = document.getElementById("blog-marquee");
        if (!marquee) return;
        const items = [];
        posts.forEach((post, i) => {
            if (i) items.push(el("span", "blog-marquee-sep", "  *  "));
            const a = postLink(post, "blog-marquee-link");
            if (i === 0 && isNew(post)) a.append(el("span", "new-tag", "NEW"), " ");
            a.append(post.title);
            items.push(a);
        });
        marquee.replaceChildren(el("span", "blog-marquee-label", "from my blog: "), ...items);
    }

    function renderNewNote(posts) {
        const note = document.getElementById("blog-new");
        if (!note || !posts.length) return;
        const latest = posts[0];
        const a = postLink(latest, "blog-new-link");
        const label = el("span", "blog-new-label");
        if (isNew(latest)) label.append(el("span", "new-tag", "NEW"), " on the blog:");
        else label.append("latest on the blog:");
        const title = el("span", "blog-new-title", latest.title);
        title.append(el("span", "nowrap", "\u00a0->"));
        a.append(label, title);
        note.replaceChildren(a);
        note.hidden = false;
    }

    function renderCards(posts) {
        const box = document.getElementById("blog-posts");
        if (!box) return;
        const cards = posts.slice(0, 4).map((post) => {
            const card = postLink(post, "alink card blog-card");
            const text = el("span", "card-text");
            const name = el("span", "card-name", post.title);
            if (isNew(post)) name.prepend(el("span", "new-tag", "NEW"), " ");
            text.append(
                name,
                el("span", "card-blurb", shorten(post.summary, 120)),
                el("span", "card-years", `${formatDate(post.date)}  #${post.category}`),
            );
            card.append(text);
            return card;
        });
        box.replaceChildren(...cards);
    }

    function render(posts) {
        bob.blog.posts = posts;
        renderMarquee(posts);
        renderNewNote(posts);
        renderCards(posts);
    }

    function parseFeed(xmlText) {
        const doc = new DOMParser().parseFromString(xmlText, "application/xml");
        if (doc.querySelector("parsererror")) throw new Error("feed didn't parse");
        const posts = [...doc.querySelectorAll("entry")].map((entry) => {
            const link = entry.querySelector("link[rel='alternate'], link");
            const summaryHtml = (entry.querySelector("summary") || entry.querySelector("content") || {}).textContent || "";

            const summary = new DOMParser().parseFromString(summaryHtml, "text/html").body.textContent.replace(/\s+/g, " ").trim();
            const category = entry.querySelector("category");
            return {
                title: (entry.querySelector("title") || {}).textContent || "untitled",
                url: link ? link.getAttribute("href") : "",
                date: ((entry.querySelector("published") || entry.querySelector("updated") || {}).textContent || "").slice(0, 10),
                category: category ? category.getAttribute("term") : "posts",
                summary,
            };
        });

        return posts
            .filter((p) => p.url.startsWith(BLOG) && /^\d{4}-\d{2}-\d{2}$/.test(p.date))
            .sort((a, b) => b.date.localeCompare(a.date));
    }

    async function loadFeed() {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), 6000);
        try {
            const res = await fetch(FEED, {signal: controller.signal});
            if (!res.ok) throw new Error("feed returned " + res.status);
            const posts = parseFeed(await res.text());
            if (posts.length) {
                bob.blog.live = true;
                render(posts);
            }
        } catch {
            // feed unreachable
        } finally {
            clearTimeout(timeout);
        }
    }

    bob.blog = {posts: FALLBACK, live: false, home: BLOG, formatDate, isNew};

    render(FALLBACK);
    loadFeed();

    const marquee = document.getElementById("blog-marquee");
    if (marquee && typeof marquee.stop === "function") {
        marquee.addEventListener("mouseenter", () => marquee.stop());
        marquee.addEventListener("mouseleave", () => marquee.start());
        marquee.addEventListener("focusin", () => marquee.stop());
        marquee.addEventListener("focusout", () => marquee.start());
    }
})();
