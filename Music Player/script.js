console.log('hellloooo');
let currentSong = new Audio;
let songs;
let currFolder;

function secondsToMinutesSeconds(seconds) {
  if (isNaN(seconds) || seconds < 0) {
    return "00:00";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  const formattedMinutes = String(minutes).padStart(2, '0');
  const formattedSeconds = String(remainingSeconds).padStart(2, '0');

  return `${formattedMinutes}:${formattedSeconds}`;
}

// function secondsToMinutes(seconds) {
//     // Round seconds to the nearest whole number
//     seconds = Math.round(seconds);

//     // Calculate minutes and remaining seconds
//     var minutes = Math.floor(seconds / 60);
//     var remainingSeconds = seconds % 60;

//     // Format minutes and seconds with leading zeros if necessary
//     var formattedMinutes = minutes < 10 ? "0" + minutes : minutes;
//     var formattedSeconds = remainingSeconds < 10 ? "0" + remainingSeconds : remainingSeconds;

//     // Return the formatted time as a string
//     return formattedMinutes + ":" + formattedSeconds;
// }

async function getsongs(folder) {
  currFolder = folder;
  let a = await fetch(`http://127.0.0.1:3000/${folder}/`);
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let as = div.getElementsByTagName('a');
  // console.log(as)
  songs = [];

  for (let index = 0; index < as.length; index++) {
    const element = as[index];
    if (element.href.endsWith(".mp3")) {
      songs.push(element.href.split(`/${folder}/`)[1])
    }

  }
  //Show all the songs in playlist

  let songUL = document.querySelector(".songlist").getElementsByTagName('ul')[0]
  songUL.innerHTML = " "
  for (const song of songs) {
    songUL.innerHTML = songUL.innerHTML + `<li><img src="Images/music.svg" alt="">
       <div class="info">
           <div>
               ${song.replaceAll("%20", " ")}
           </div>

           <div>
               Song Artist
           </div>
       </div>
         <div class="playnow">
           <span>Play Now</span>
           <img class="invert" src="Images/play.svg" alt="">
         </div> </li>`;
  }

  //Attach an event listener to each song

  Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
    e.addEventListener("click", element => {
      console.log(e.querySelector(".info").firstElementChild.innerHTML);
      playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim());
    })


  })
  return songs;


}



const playMusic = (track, pause = false) => {
  currentSong.src = `/${currFolder}/` + track;
  if (!pause) {
    currentSong.play();
    play.src = "Images/pause.svg"
  }
  document.querySelector(".songinfo").innerHTML = track.replaceAll("%20", " ");
  document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

async function DisplayAlbums() {
  let a = await fetch(`http://127.0.0.1:3000/songs/`);
  let response = await a.text();
  let div = document.createElement("div")
  div.innerHTML = response;
  let anchors = div.getElementsByTagName('a')
  let array = Array.from(anchors)
  for (let index = 0; index < array.length; index++) {
    const e = array[index];
    if (e.href.includes("/songs")) {
      let folder = (e.href.split("/").slice(-2)[0]);

      //Get the metadata of the folder
      let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/info.json`);
      let response = await a.json();
      console.log(response);
      let cardContainer = document.querySelector(".cardContainer")

      cardContainer.innerHTML = cardContainer.innerHTML + `<div data-folder="${folder}" class="card">
    <div class="play">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
            xmlns="http://www.w3.org/2000/svg">
            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                stroke-linejoin="round" />
        </svg>
    </div>
    <img src="/Songs/${folder}/cover.jpeg" alt="">
    <h3>${response.title}</h3>
    <p>${response.description}</p>
</div>`


    }
  }

  //Load the playlist whenever the card is clicked
  Array.from(document.getElementsByClassName("card")).forEach(e => {
    e.addEventListener("click", async item => {
      songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
      playMusic(songs[0])
    })
  })


}

async function main() {


  //Getting the list of all songs
  // await getsongs("songs/")

  // playMusic(songs[0], true)


  //Display All albums on the page
  DisplayAlbums()



  //Attach an event listener to previous, next and play

  play.addEventListener("click", () => {
    if (currentSong.paused) {
      currentSong.play();
      play.src = "Images/pause.svg"

    }
    else {
      currentSong.pause();
      play.src = "Images/play.svg"
    }
  })

  currentSong.addEventListener("timeupdate", () => {
    //    console.log(currentSong.currentTime,currentSong.duration);
    document.querySelector(".songtime").innerHTML = `${secondsToMinutesSeconds(currentSong.currentTime)}/${secondsToMinutesSeconds(currentSong.duration)}`
    document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
  })


  //Add an event listener to seekbar

  document.querySelector(".seekbar").addEventListener("click", e => {

    let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;


    document.querySelector(".circle").style.left = percent + "%";
    currentSong.currentTime = ((currentSong.duration) * percent) / 100;
  })


  //Add an event listener to hamburger

  document.querySelector(".hamburger").addEventListener("click", () => {
    document.querySelector(".left").style.left = "0"
  })

  //Add an event listener for close


  document.querySelector(".close").addEventListener("click", () => {
    document.querySelector(".left").style.left = "-110%"
  })


  //Add event listener to previous
  previous.addEventListener("click", () => {
    console.log('previous');
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index - 1) >= 0) {
      playMusic(songs[index - 1])
    }

  })



  //Add event listener to next

  next.addEventListener("click", () => {
    console.log('next');
    currentSong.pause();
    let index = songs.indexOf(currentSong.src.split("/").slice(-1)[0])
    if ((index + 1) < songs.length) {
      playMusic(songs[index + 1])
    }


  })

  //Add event listener to volume

  document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
    //  console.log(e,e.target,e.target.value);
    currentSong.volume = (e.target.value) / 100
  })

  //Add event listener to mute the track 
  document.querySelector(".volume>img").addEventListener("click", e => {
    console.log(e.target);
    if(e.target.src.includes("volume.svg")){
      e.target.src = e.target.src.replace("Images/volume.svg", "Images/mute.svg") 
      currentSong.volume = 0;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 0
    }
    else{
      e.target.src = e.target.src.replace("Images/mute.svg", "Images/volume.svg") 
      currentSong.volume = .10;
      document.querySelector(".range").getElementsByTagName("input")[0].value = 10
     
    }
  

  })


}

main()



