// GET OUT!!!

function setCookie(name, value, expiry) {
    const d = new Date();
    d.setTime(d.getTime() + (expiry * 24 * 60 * 60 * 1000));
    let expires = "expires=" + d.toUTCString();
    document.cookie = name + "=" + value + ";" + expires + ";path=/";
}

function getCookie(query) {
    let name = query + "=";
    let decodedCookie = decodeURIComponent(document.cookie);
    let ca = decodedCookie.split(';');
    for (let i = 0; i < ca.length; i++) {
        let c = ca[i];
        while (c.charAt(0) === ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) === 0) {
            return c.substring(name.length, c.length);
        }
    }
    return null;
}

function getRandomInt(max) {
  return Math.floor(Math.random() * max);
}

let visits = getCookie("visits")

if (visits === null) {
    visits = "0"
}

let visitsNum = parseInt(visits)
if (isNaN(visitsNum)) {
    console.log("could not parse visits count as integer!")
    visitsNum = 0
}

const musicElement = document.getElementById("music")
const day = new Date(Date.now()).getDay()

if (visitsNum > 10 && day === 4) {
    const rollingText = document.getElementById("rolling-text")
    rollingText.innerHTML = `
            This website is built in loving memory of my grandparents, Melody, and those who we love but are no longer here with us.
            If you, or your loved ones may be in need of help, please reach out before it is too late. Please do not hesitate. Tragedy and joy may be just one phone call away.
            — Help and support in Australia:
                * Dial Lifeline at 13 11 14 or visit their website at <a href="https://lifeline.org.au/" target="_blank" style="text-decoration: none; color: darkblue">https://lifeline.org.au/</a>.
                * Dial the SCS at 1300 659 467.
                * Dial BeyondBlue at 1300 224 636 or visit website <a href="https://www.beyondblue.org.au/" target="_blank" style="text-decoration: none; color: darkblue">https://beyondblue.org.au/</a>.
            — Find more help and support or for help and support anywhere else in the world:
                * Visit HelpGuide at <a href="https://www.helpguide.org/find-help" target="_blank" style="text-decoration: none; color: darkblue">https://helpguide.org/find-help/</a>.
        
            If you or your loved ones are in danger, dial Triple Zero (000) or your local emergency number immediately.
    `
    musicElement.src = `assets/audio/mus_memory.ogg?v=${getRandomInt(69420)}`
} else {
    if (visitsNum <= 6) {
        musicElement.src = `assets/audio/mus_menu${visits}.ogg?v=${getRandomInt(69420)}`
    } else {
        musicElement.src = `assets/audio/mus_menu6.ogg?v=${getRandomInt(69420)}`
    }
}

const visitCountElement = document.getElementById("visit-count")
if (visitsNum === 0) {
    visitCountElement.innerText = `Thanks for coming to my little corner on the interwebs!!`
} else if (!(day === 4 && visitsNum > 10)) {
    if (visitsNum <= 10) {
        visitCountElement.innerText = `Hey, it's you again! Now you have visited me ${visitsNum + 1} times!!`
    } else if (visitsNum < 20) {
        visitCountElement.innerText = `Woah! A regular, now you have visited me ${visitsNum + 1} times!!`
    } else if (visitsNum < 30) {
        visitCountElement.innerText = `Oh my god, it's you! Now you have visited me ${visitsNum + 1} times!!`
    } else if (visitsNum < 40) {
        visitCountElement.innerText = `How is it going, my friend? Now you have visited me ${visitsNum + 1} times!!`
    } else if (visitsNum < 50) {
        visitCountElement.innerText = `You like me, don't you? Now you have visited me ${visitsNum + 1} times!!`
    } else {
        visitCountElement.innerText = `I love you!! Now you have visited me ${visitsNum + 1} times!!!`
    }

    if (getRandomInt(100) === 69) {
        visitCountElement.innerText = `;)`
    }

} else {
    visitCountElement.innerText = `Now, you have visited me ${visitsNum + 1} times.`
    musicElement.src = `assets/audio/mus_express_myself.ogg?v=${getRandomInt(100)}`
}

function playExplosionSound() {
    let audio = new Audio("assets/audio/mus_explosion.mp3")
    audio.volume = 0.5
    audio.play().then(r => null)
}

function setOnClick(e) {
    e.onclick = playExplosionSound
}

const aLinks = Array.from(document.getElementsByClassName("alink"))
aLinks.forEach(setOnClick)

const skills = Array.from(document.getElementsByClassName("skill"))
skills.forEach(setOnClick)


function playAudio() {
    if (navigator.userActivation.hasBeenActive || navigator.userActivation.isActive) {
        const audioElement = document.getElementById("music-audio")
        audioElement.play()
    } else {
        window.setTimeout(playAudio, 69)
    }
}
playAudio()
setCookie("visits", visitsNum + 1, 69)
