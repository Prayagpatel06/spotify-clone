console.log("hi everyon");
let currentSong = new Audio();
let songs;
let currFolder

function secondsToMinutesSeconds(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "Invalid input";
    }

    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    const formattedMinutes = String(minutes).padStart(2, '0');
    const formattedSeconds = String(remainingSeconds).padStart(2, '0');

    return `${formattedMinutes}:${formattedSeconds}`;
}

async function getSongs(folder) {
    currFolder = folder
    let a = await fetch(`http://127.0.0.1:3000/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
    // show all Song in the playlist
    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `<li><img class="invert"src="music.svg" alt="">
                            <div class="info">
                                <div>${song.replaceAll("%20", " ")} </div>
                                <div></div>
                            </div>
                            <div class="playnow">
                                <div>Play Now</div>
                                <img class="invert"src="svgs/playsong.svg" alt="">
                            </div>
                         </li>`
    }

    //Attach an event listener into song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            console.log(e.querySelector(".info").firstElementChild.innerHTML)
            playMusic(e.querySelector(".info").firstElementChild.innerHTML)
        })
    })

    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "svgs/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}

async function displyAlbums() {
    let a = await fetch(`http://127.0.0.1:3000/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    let array = Array.from(anchors);
    
    for (let index = 0; index < array.length; index++) {
        const e = array[index];

        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];

            try {
                // Fetch metadata file
                let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
                let responseText = await a.text();

                if (!responseText.trim()) {
                    console.warn(`Warning: info.json is empty for ${folder}`);
                    continue; // Skip if JSON file is empty
                }

                let response = JSON.parse(responseText); // Convert to JSON manually
                console.log(response);

                // Update UI
                cardContainer.innerHTML += `
                    <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 42 42" width="42" height="42" fill="none">
                                <circle cx="21" cy="21" r="19" fill="#1fdf64" />
                                <polygon points="16,12 30,21 16,30" fill="black" />
                            </svg>
                        </div>
                        <img src="/songs/${folder}/cover.webp" alt="">
                        <h2>${response.title}</h2>
                        <p>${response.description}</p>
                    </div>`;
            } catch (error) {
                console.error(`Error fetching JSON for ${folder}:`, error);
            }
        }
    }

    // Load playlist when a card is clicked
    Array.from(document.getElementsByClassName("card")).forEach(e => {
        e.addEventListener("click", async item => {
            songs = await getSongs(`songs/${item.currentTarget.dataset.folder}`);
            playMusic(songs[0])
        });
    });
}


async function main() {

    // give the list of all .mp3 file in a songs folder
    await getSongs("songs/ncs")
    //for music is already fatch in the seek bar
    playMusic(songs[0], true)

    //disply all the albums on the page
    displyAlbums()


    //attach event listioner in seek bar button
    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "svgs/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "svgs/playsong.svg"
        }
    })

    //time update of song

    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `  
            ${secondsToMinutesSeconds(currentSong.currentTime)} / 
            ${secondsToMinutesSeconds(currentSong.duration)}`
        // for moving seekbar circle.
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%"
    })

    //add event listener to seek bar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let persent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = persent + "%"
        currentSong.currentTime = ((currentSong.duration) * persent) / 100
    })

    //Add listerner for humburger
    document.querySelector(".humburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = "0"
    })
    //Add listerner for cross
    document.querySelector(".cross").addEventListener("click", () => {
        document.querySelector(".left").style.left = "-130%"
    })

    //add an eventlistner in prvevious 
    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1])
        }
    })
    //add an eventlistner in next 
    next.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
        if ((index + 1) < songs.length - 1) {
            playMusic(songs[index + 1])
        }
    })

    //add event to volume range
    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("volume is", e.target.value)
        currentSong.volume = parseInt(e.target.value) / 100
    })

    //add event listner to mute the track
    document.querySelector(".volume>img").addEventListener("click", (e)=>{
        if(e.target.src.includes("svgs/volume.svg")){
            e.target.src = e.target.src.replace( "svgs/volume.svg","svgs/mute.svg") 
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = e.target.src.replace( "svgs/mute.svg","svgs/volume.svg")
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })




}

main()



// for login form js
