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

const visitCountElement = document.getElementById("visit-count")
if (visitsNum === 0) {
    visitCountElement.innerText = `Thanks for coming to my little corner on the interwebs!!`
} else if (visitsNum <= 10) {
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

const audioElement = document.getElementById("music-audio")

function playAudio() {
    if (navigator.userActivation.hasBeenActive || navigator.userActivation.isActive) {
        audioElement.play()
    } else {
        window.setTimeout(playAudio, 69)
    }
}

console.log(musicElement.src)

document.addEventListener("DOMContentLoaded", async (e) => {
    if (visitsNum <= 6) {
        musicElement.src = `assets/audio/mus_menu${visits}.ogg?v=${getRandomInt(69420)}`
    } else {
        musicElement.src = `assets/audio/mus_menu6.ogg?v=${getRandomInt(69420)}`
    }

    await new Promise(r => setTimeout(r, 1000));
    console.log(audioElement.readyState)
    if (audioElement.readyState >= HTMLMediaElement.HAVE_CURRENT_DATA) {
        audioElement.style.display = ""
        playAudio()
        setCookie("visits", visitsNum + 1, 69)
    } else {
        const audioElement = document.getElementById("music-audio")
        audioElement.remove()
    }
});
