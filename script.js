// element refernces
const layerButton = document.getElementsByClassName("layer_button");
const soloButton = document.getElementsByClassName("solo_button")
const pauseButton = document.getElementById("pause_button");
const playAllButton = document.getElementById("play_button");

// variables to keep track of the song state
let songPlaying = false;
let hasBeenSoloed = false;
let layerPlaying = [];

// this array is hardcoded to just store the threat layers for outskirts, but will 
// be updated to be adaptable for the rest of the threat themes later in development
const SUThreatLayer = [
    new Audio("threat_music/SU/TH_SU - KICK.mp3"),
    new Audio("threat_music/SU/TH_SU - SHAKER.mp3"),
    new Audio("threat_music/SU/TH_SU - PERC1.mp3"),
    new Audio("threat_music/SU/TH_SU - BASS.mp3"),
    new Audio("threat_music/SU/TH_SU - HITS.mp3"),
    new Audio("threat_music/SU/TH_SU - ARPS.mp3"),
    new Audio("threat_music/SU/TH_SU - LEAD.mp3"),
    new Audio("threat_music/SU/TH_SU - NOISE.mp3"),
]

// connecting our audio files to the web API
const typeOfContext = new (window.AudioContext || window.webkitAudioContext);
SUThreatLayer.forEach((audio) => {
    var layer = typeOfContext.createMediaElementSource(audio)
    layer.connect(typeOfContext.destination);
});

// this function stores the methods for how we will sync the layers together
function prepLayers() {
    SUThreatLayer.forEach((audio) => {
        
        // this if exists for the play all button
        if (!songPlaying) {audio.muted = true;}
        else {audio.muted = false;}
        audio.volume = 0.5;
        audio.play();

        // setting the playback time for each of the audio files to ensure that they're all synced
        audio.currentTime = 0;
        playAllButton.innerText = "End All"
    });
}

// using a for loop to check each button for inputs
for (let i = 0; i < layerButton.length; i++) {
    // listening for if a layer button has been clicked
    layerButton[i].addEventListener("click", () => {
        if (!songPlaying) {
            prepLayers();
            songPlaying = true;
        }

        // muting and unmuting audio
        if (!hasBeenSoloed) {
            if (SUThreatLayer[i].muted) {
                SUThreatLayer[i].muted = false;
                layerPlaying.push(SUThreatLayer[i]);
            }
            else {
                SUThreatLayer[i].muted = true;
                var indexOfLayer = layerPlaying.indexOf(SUThreatLayer[i])
                layerPlaying.splice(indexOfLayer, 1);
            }
        }
    })

    // listening for if a solo button has been clicked
    soloButton[i].addEventListener("click", () => {
        if (!hasBeenSoloed) {
            for (let j = 0; j < layerPlaying.length; j++) {
                if (layerPlaying[j] != SUThreatLayer[i]) {
                    layerPlaying[j].muted = true;
                }
                else {
                    if (layerPlaying[j].muted = true) {
                        layerPlaying[j].muted = false;
                    }
                }
            }
            hasBeenSoloed = true;
        }
        else {
            for (let j = 0; j < layerPlaying.length; j++) {
                if (layerPlaying[j] != SUThreatLayer[i]) {
                    layerPlaying[j].muted = false;
                }
            }
            hasBeenSoloed = false;
        }
    })
}

// pause button functionality
pauseButton.addEventListener("click", () => {
    SUThreatLayer.forEach((audio) => {
        if (songPlaying) {
            if (!audio.paused) {
                audio.pause();
                pauseButton.innerText = "Unpause";
            }
            else {
                audio.play();
                pauseButton.innerText = "Pause";
            }
        }
    });
});

// play all button functionality
playAllButton.addEventListener("click", () => {
    if (!songPlaying) {
            songPlaying = true;
            prepLayers();
            for (let i = 0; i < SUThreatLayer.length; i++) {
                layerPlaying.push(SUThreatLayer[i])
            }
            playAllButton.innerText = "End All"
        }
    
    else { 
        SUThreatLayer.forEach(audio => {
            audio.pause();
            audio.currentTime = 0;
            playAllButton.innerText = "Play All"
            pauseButton.innerText = "Pause"
            songPlaying = false;
        });
        layerPlaying = [];
    }
});

// looping the song (still working on seamlessy looping it)
// we check the last audio file in the array, since that would most likely be one the finish last
SUThreatLayer[SUThreatLayer.length - 1].addEventListener("ended", () => {
    console.log("Song ended")
    prepLayers();
})