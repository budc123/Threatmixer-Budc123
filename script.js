// element refernces
const layerButton = document.getElementsByClassName("layer_button");
const soloButton = document.getElementsByClassName("solo_button")
const pauseButton = document.getElementById("pause_button");
const playAllButton = document.getElementById("play_button");
const pageUI = document.getElementById("page_ui");
const loadingScreen = document.getElementById("loading_screen");

// only showing the loading screen until the page is ready
pageUI.style.display = "none";

// global variables
let loadSounds;
let layerSoloed = false;
let songStarted = false;
let songPaused = false;
let loadedLayers = [];
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

// grabbing the audio context and establishing a GainNode
const audioContext = new (window.AudioContext || window.webkitAudioContext);

// more web API junk
// this is all so that the audio will loop smoothly
try {
    loadSounds = 
        SUThreatLayer.map((audio) => { //personal note: .map is like .forEach except it turns each item into a promise, basically
            return fetch(audio.src)
                .then((result) => {return result.arrayBuffer();}) // turning the audio into a buffer
                .then((arrayBuffer) => {return audioContext.decodeAudioData(arrayBuffer);}) // decoding that buffer
        });
}
catch {
    alert("Failed to load assets. Please refresh the page and try again.")
}

// we wait for all of the sounds to be buffered, then proceed
Promise.all(loadSounds).then((audioBuffer) => {
    loadingScreen.style.display = "none";
    pageUI.style.display = "flex";

    // this function stores the methods for how the layers will be set up
    function prepLayers() {
        // creating an AudioBufferSourceNode each time this function is called
        audioBuffer.forEach((audioBuffer, index) => {
            // creating the bufferSource
            var bufferSource = audioContext.createBufferSource();
            bufferSource.buffer = audioBuffer
            bufferSource.loop = true;
            
            // connecting it to a gainNode
            var gainNode = audioContext.createGain();
            gainNode.connect(audioContext.destination);
            bufferSource.connect(gainNode);

            // returning the buffer and the gain in a pair
            loadedLayers.push([bufferSource, gainNode, index]);
        });

        for (let i = 0; i < loadedLayers.length; i++) {
            if (!songStarted) {loadedLayers[i][1].gain.value = 0;} // if the play all button wasn't clicked, start all of the layers muted
            else {loadedLayers[i][1].gain.value = 0.75;} // otherwise, let them all make sound
            loadedLayers[i][0].start(audioContext.currentTime);
        }
        playAllButton.innerText = "End All"
    }

    // using a for loop to check each button for inputs
    for (let i = 0; i < layerButton.length; i++) {
        // listening for if a layer button has been clicked
        layerButton[i].addEventListener("click", () => {
            if (!songStarted) {
                prepLayers();
                songStarted = true;
            }

            // muting and unmuting audio
            if (!layerSoloed) {
                if (loadedLayers[i][1].gain.value == 0) {
                    loadedLayers[i][1].gain.value = 0.75;
                    layerPlaying.push(loadedLayers[i]);
                    layerButton[i].style.filter = "brightness(100%)"
                }
                else {
                    loadedLayers[i][1].gain.value = 0
                    var indexOfLayer = layerPlaying.indexOf(loadedLayers[i])
                    layerPlaying.splice(indexOfLayer, 1);
                    layerButton[i].style.filter = "brightness(20%)"
                }
           }
        })

        // listening for if a solo button has been clicked
        soloButton[i].addEventListener("click", () => {
            try {
                if (!layerSoloed && loadedLayers[i][1].gain.value != 0) {
                    for (let j = 0; j < layerPlaying.length; j++) {
                        if (layerPlaying[j] != loadedLayers[i]) { // if the layer doesn't match the layer we're trying to mute,
                            layerPlaying[j][1].gain.value = 0; // mute it
                            layerButton[layerPlaying[j][2]].style.filter = "brightness(20%)"
                        }
                        else {
                            soloButton[layerPlaying[j][2]].style.filter = "brightness(100%)"
                        }

                        /*
                        // nullifying this if statement for now, I'll fix it on the next push
                        else if (layerPlaying[j][1].gain.value == 0) { // if the layer we're trying to solo is muted,
                            loadedLayers[j][1].gain.value == 0.75; // unmute it
                            layerButton[loadedLayers[j][2]].style.filter = "brightness(100%)"
                        }
                        */
                    }
                    layerSoloed = true;
                }

                // this if handles un-soloing the song
                else if (loadedLayers[i][1].gain.value != 0) {
                    for (let j = 0; j < layerPlaying.length; j++) {
                        layerPlaying[j][1].gain.value = 0.75;
                        layerButton[layerPlaying[j][2]].style.filter = "brightness(100%)"
                        soloButton[layerPlaying[j][2]].style.filter = "brightness(20%)"
                    }
                    
                    layerSoloed = false;
                }
            }
            catch {
                // note, probably should hide solo buttons before sounds are loaded to prevent errors
                console.error(err)
            }
        })
    }

    // pause button functionality
    pauseButton.addEventListener("click", () => {
        if (songStarted) {
            if (!songPaused) {
                audioContext.suspend();
                songPaused = true;
                pauseButton.innerText = "Unpause";
            }

            else {
                audioContext.resume();
                songPaused = false;
                pauseButton.innerText = "Pause";
            }
        }
    });

    // play all button functionality
    playAllButton.addEventListener("click", () => {
        if (!songStarted) { // if we're trying to start all of them,
            songStarted = true;
            prepLayers();

            // updating the layerPlaying array and brightness of the buttons
            for (let i = 0; i < loadedLayers.length; i++) {
                layerPlaying.push(loadedLayers[i]);
                layerButton[i].style.filter = "brightness(100%)";
            }

            playAllButton.innerText = "End All"
        }
        
        else { // if we're trying to end all of them,
            for (let i = 0; i < loadedLayers.length; i++) { // clearing AudioBufferSourceNodes
                loadedLayers[i][0].stop();
                loadedLayers[i][0].disconnect();
                layerButton[i].style.filter = "brightness(20%)"
            }

            // reseting variables and button text
            songStarted = false;
            loadedLayers = [];
            layerPlaying = [];
            playAllButton.innerText = "Play All"
            pauseButton.innerText = "Pause"
        }
    });
});