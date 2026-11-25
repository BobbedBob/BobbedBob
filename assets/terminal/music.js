// Music command
(() => {
    "use strict";
    const bob = window.bob;
    const sh = bob.sh;
    const {print, printParts, cmdButton, suggest, command} = sh;

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

    command("music", {
        group: "the basics",
        help: "play, pause or change the music",
        complete: () => ["play", "pause", "next", "list", "vol"],
        run: music,
    });
})();
