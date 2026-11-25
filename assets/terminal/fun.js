// Hidden joke commands
(() => {
    "use strict";
    const bob = window.bob;
    const sh = bob.sh;
    const {print, command, setMode, endMode, user} = sh;

    command("rm", {hidden: true, run: () => print("rm: permission denied. nice try though.", "err")});
    command("sudo", {
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
    });
    command("vim", {hidden: true, run: () => vim()});
    command("vi", {hidden: true, run: () => vim()});
    command("nano", {hidden: true, run: () => print("nano? in this economy? try vim.")});
    command("chaos", {
        hidden: true,
        run() {
            if (bob.chaos) {
                bob.chaos();
                print(document.body.classList.contains("chaos") ? "chaos mode: on. close the terminal to enjoy it." : "chaos mode: off. phew.");
            }
        },
    });

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

    function nuke() {
        sh.setBusy(true);
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
            sh.setBusy(false);
            if (bob.xp) bob.xp.once("nuke", 25, "for living dangerously");
        }, steps.length * 320 + 1600);
    }
})();
