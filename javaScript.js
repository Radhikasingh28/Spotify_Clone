console.log("Let's start JS");

// ===============================
// Global State
// ===============================
let songs = [];
let currentSong = new Audio();
let currFolder = "arijit_singh";
let currentSongIndex = 0;

// ===============================
// Cached DOM Elements (IMPORTANT)
// ===============================
const playBtn = document.getElementById("play");
const songInfo = document.querySelector(".songinfo");
const songTime = document.querySelector(".songtime");
const circle = document.querySelector(".circle");
const seekbar = document.querySelector(".seekbar");


// ===============================
// Fetch Songs from Folder
// ===============================
async function getSongs(folder) {

    let response = await fetch(`http://127.0.0.1:5500/songs/${folder}/`);
    let html = await response.text();

    let div = document.createElement("div");
    div.innerHTML = html;

    let links = div.getElementsByTagName("a");

    let songList = [];

    for (let i = 0; i < links.length; i++) {

        let href = links[i].href;

        if (href.endsWith(".mp3")) {
            songList.push(href.split("/songs/")[1]);
        }
    }

    return songList;
}


// ===============================
// Play Music
// ===============================
function playMusic(track, index, pause = false) {

    currentSong.src = `songs/${track}`;
    currentSongIndex = index;

    if (!pause) {
        currentSong.play();
        playBtn.src = "img/pause.svg";
    }

    songInfo.textContent =
        decodeURIComponent(track.split("/").pop().replace(".mp3", ""));

    songTime.textContent = "00:00 / 00:00";
}


// ===============================
// Format Seconds → MM:SS
// ===============================
function formatTime(seconds) {

    if (isNaN(seconds) || seconds === Infinity) return "00:00";

    let mins = Math.floor(seconds / 60);
    let secs = Math.floor(seconds % 60);

    mins = String(mins).padStart(2, "0");
    secs = String(secs).padStart(2, "0");

    return `${mins}:${secs}`;
}


// ===============================
// Time Update + Seekbar Move
// ===============================
currentSong.addEventListener("timeupdate", () => {

    songTime.textContent =
        `${formatTime(currentSong.currentTime)} / ${formatTime(currentSong.duration)}`;

    if (!isNaN(currentSong.duration)) {

        let percent =
            (currentSong.currentTime / currentSong.duration) * 100;

        circle.style.left = percent + "%";
    }
});


// ===============================
// Seekbar Click → Jump to Time
// ===============================
seekbar.addEventListener("click", (e) => {

    let width = seekbar.getBoundingClientRect().width;

    let percent = (e.offsetX / width) * 100;

    circle.style.left = percent + "%";

    currentSong.currentTime =
        (currentSong.duration * percent) / 100;
});
// ===============================
// display all albums 
// ===============================
  // ===============================
// Display All Albums
// ===============================
async function displayAlbums() {

    // Fetch songs folder
    let response = await fetch("http://127.0.0.1:5500/songs/");
    let html = await response.text();

    // Convert HTML string into DOM
    let div = document.createElement("div");
    div.innerHTML = html;

    // Get all links
    let anchors = div.getElementsByTagName("a");

    // Card container
    let cardContainer = document.querySelector(".cardContainer");
    cardContainer.innerHTML = "";

    // Loop through all links
   for (const e of anchors) {

        if (e.href.includes("/songs/") &&
    !e.href.endsWith("album.json")) {

           let folder = e.href.split("/").pop();

           // Read album information
let album = await fetch(`http://127.0.0.1:5500/songs/${folder}/info.json`);
let data = await album.json();
cardContainer.innerHTML += `
    <div data-folder="${folder}" class="card">

        <div class="play">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640" width="40" height="40">
                <circle cx="320" cy="320" r="256" fill="#1DB954" />
                <path fill="black"
                    d="M252.3 211.1C244.7 215.3 240 223.4 240 232V408C240 416.7 244.7 424.7 252.3 428.9C259.9 433.1 269.1 433 276.6 428.4L420.6 340.4C427.7 336 432.1 328.3 432.1 319.9C432.1 311.5 427.7 303.8 420.6 299.4L276.6 211.4C269.2 206.9 259.9 206.7 252.3 210.9Z" />
            </svg>
        </div>

        <img src="songs/${folder}/cover.jpg" alt="">

        <h2>${data.title}</h2>

        <p>${data.description}</p>

    </div>
`;

        }

 }
 // Load album on card click
Array.from(document.getElementsByClassName("card")).forEach((card) => {

    card.addEventListener("click", async () => {

        currFolder = card.dataset.folder;

        songs = await getSongs(currFolder);

        let songUl = document.querySelector(".songList ul");
        songUl.innerHTML = "";

        songs.forEach((song, index) => {

            let songName = decodeURIComponent(song.split("/").pop());

            songUl.innerHTML += `
            <li>
                <img class="invert" src="img/music.svg" alt="">

                <div class="info">
                    <div>${songName}</div>
                    <div>Radhika</div>
                </div>

                <div class="playnow">
                    <span>Play Now</span>
                    <img class="invert" src="img/play.svg" alt="">
                </div>
            </li>`;
        });

        // Reattach click events
        document.querySelectorAll(".songList li").forEach((li, index) => {

            li.addEventListener("click", () => {
                playMusic(songs[index], index);
            });

        });

        // Play first song
        playMusic(songs[0], 0);

    });

});

}

// ===============================
// Main App
// ===============================
async function main() {

    songs = await getSongs(currFolder);

    let songUl = document.querySelector(".songList ul");
    songUl.innerHTML = "";

    songs.forEach((song, index) => {

        let songName = decodeURIComponent(song.split("/").pop());

        songUl.innerHTML += `
        <li>
            <img class="invert" src="img/music.svg" alt="">

            <div class="info">
                <div>${songName}</div>
                <div>Radhika</div>
            </div>

            <div class="playnow">
                <span>Play Now</span>
                <img class="invert" src="img/play.svg" alt="">
            </div>
        </li>`;



      
    });
    displayAlbums();


    // Click on song
    document.querySelectorAll(".songList li").forEach((li, index) => {

        li.addEventListener("click", () => {
            playMusic(songs[index],index);
        });

    });


    // Play / Pause button
    playBtn.addEventListener("click", () => {

        if (currentSong.paused) {
            currentSong.play();
            playBtn.src = "img/pause.svg";
        } else {
            currentSong.pause();
            playBtn.src = "img/play.svg";
        }

    });
    // ===============================
// Hamburger Menu
// ===============================

// Open Sidebar
document.querySelector(".hamburger").addEventListener("click", () => {

    document.querySelector(".left").style.left = "0";

});

// Close Sidebar
document.querySelector(".close").addEventListener("click", () => {

    document.querySelector(".left").style.left = "-120%";

});

// previous 

document.getElementById("previous").addEventListener("click", () => {

    if (currentSongIndex > 0) {

        currentSongIndex--;

        playMusic(songs[currentSongIndex], currentSongIndex);

    }

});

// next
document.getElementById("next").addEventListener("click", () => {

    if (currentSongIndex < songs.length - 1) {

        currentSongIndex++;

        playMusic(songs[currentSongIndex], currentSongIndex);

    }

});

//  volume 
 document
    .querySelector(".range")
    .getElementsByTagName("input")[0]
    .addEventListener("change", (e) => {
      console.log("Setting volume to ", e.target.value, "/ 100");
      currentSong.volume = parseInt(e.target.value) / 100;
      if(currentSong.volume>0){
        document.querySelector(".volume>img").src=document.querySelector(".volume>img").src.replace("img/mute.svg","img/volume.svg");
      }
    });

     // Add EventListener to mute the track
  document.querySelector(".volume>img").addEventListener("click",e=>{
    if(e.target.src.includes("img/volume.svg")){
      e.target.src=e.target.src.replace("img/volume.svg","img/mute.svg");
      currentSong.volume=0;
      document
    .querySelector(".range")
    .getElementsByTagName("input")[0].value=0;
    }else{
      currentSong.volume=0.1;
      e.target.src=e.target.src.replace("img/mute.svg","img/volume.svg");
      document
    .querySelector(".range")
    .getElementsByTagName("input")[0].value=10;
    }
  })


}


// Start App
main();