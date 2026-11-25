// fastfetch and neofetch
(() => {
    "use strict";
    const bob = window.bob;
    const sh = bob.sh;
    const {el, charWidth, command} = sh;

    function fastfetch() {
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

        const infoLines = [
            [el("span", {class: "ff-key"}, "bobby"), "@", el("span", {class: "ff-key"}, "bobstation")],
            ["----------------"],
            ...info.map(([k, v]) => [el("span", {class: "ff-key"}, k), ": " + v]),
        ];
        const longestInfo = Math.max(...info.map(([k, v]) => k.length + 2 + v.length));
        const cw = charWidth();
        const cols = Math.floor(sh.out.clientWidth / cw) - 4;

        const row = el("div", {class: "term-row pre ff"});

        const logoLine = (i) => {
            const line = logo[i] || " ".repeat(LOGO_WIDTH);
            return line.split(/(\{[^}]*\})/).filter(Boolean).map((part) =>
                part.startsWith("{")
                    ? el("span", {class: "ff-f"}, part.slice(1, -1))
                    : el("span", {class: "ff-logo"}, part));
        };

        if (cols >= LOGO_WIDTH + 4 + longestInfo) {
            const rows = Math.max(logo.length, infoLines.length);
            for (let i = 0; i < rows; i++) {
                row.append(...logoLine(i), "    ", ...(infoLines[i] || []), "\n");
            }
        } else {
            if (cols >= LOGO_WIDTH) logo.forEach((_, i) => row.append(...logoLine(i), "\n"));
            row.append("\n");
            infoLines.forEach((parts) => row.append(...parts, "\n"));
            row.classList.add("ff-wrap");
        }
        sh.out.append(row);
        sh.scrollDown();
    }

    command("fastfetch", {
            group: "for the nerds",
            help: "the specs of my actual computer",
            run: fastfetch,
        });
    command("neofetch", {hidden: true, run: fastfetch});
})();
