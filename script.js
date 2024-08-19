/*
VARIABLES
*/

// element refrences
const layerButton = document.getElementsByClassName("layer_button");
const soloButton = document.getElementsByClassName("solo_button");
const pauseButton = document.getElementById("pause_button");
const playAllButton = document.getElementById("play_button");
const startButton = document.getElementById("start_button");
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
let layersPlaying = [];
let startingLayers = [];

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

/*
LOADING AUDIO FILES
*/

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

        // undarkening the solo buttons
        Array.from(soloButton).forEach((element) => {
            element.classList.remove("darken_button");
            element.classList.add("undarken_button");
        });

        // setting up the layers
        for (let i = 0; i < loadedLayers.length; i++) {

            // this if statement checks for two scenarios
            // 1. If any layers have been chosen to start first, or
            // 2. If the play all button has been clicked
            if (startingLayers.includes(i) || songStarted) {
                loadedLayers[i][1].gain.value = 0.75;
                layersPlaying.push(loadedLayers[i]);
            }

            // if neither of these are true, that must means this layer has to start muted
            else {
                loadedLayers[i][1].gain.value = 0;
            }

            loadedLayers[i][0].start(audioContext.currentTime);
        }
        playAllButton.innerText = "End All"
    }


/*
BUTTON FUNCTIONALITY
*/

    // using a for loop to check each button for inputs
    for (let i = 0; i < layerButton.length; i++) {
        // listening for if a layer button has been clicked
        layerButton[i].addEventListener("click", () => {
            if (!songStarted) {
                // these if statements handle pre-selecting layers
                // we keep track of what layers have been chosen by simply storing the value of i
                if (!startingLayers.includes(i)) {
                    startingLayers.push(i);
                    layerButton[i].style.filter = "brightness(100%)";
                }

                else {
                    var startingLayerIndex = startingLayers.indexOf(i)
                    startingLayers.splice(startingLayerIndex, 1);
                    layerButton[i].style.filter = "brightness(20%)";
                }
            }

            // muting and unmuting audio
            else if (!layerSoloed) {
                if (loadedLayers[i][1].gain.value == 0) {
                    loadedLayers[i][1].gain.value = 0.75;
                    layersPlaying.push(loadedLayers[i]);
                    layerButton[i].style.filter = "brightness(100%)";
                }

                else {
                    loadedLayers[i][1].gain.value = 0
                    var indexOfLayer = layersPlaying.indexOf(loadedLayers[i])
                    layersPlaying.splice(indexOfLayer, 1);
                    layerButton[i].style.filter = "brightness(20%)";
                }
            }
        });

        // listening for if a solo button has been clicked
        soloButton[i].addEventListener("click", () => {
            if (!layerSoloed && songStarted) {
                if (loadedLayers[i][1].gain.value == 0) { // if the layer we're trying to solo is muted,
                    loadedLayers[i][1].gain.value = 0.75; // unmute it,
                    layersPlaying.push(loadedLayers[i]); // add it to this array
                    soloButton[loadedLayers[i][2]].style.filter = "brightness(100%)" // and brighten both buttons
                    layerButton[loadedLayers[i][2]].style.filter = "brightness(100%)"
                }

                for (let j = 0; j < layersPlaying.length; j++) {
                    if (layersPlaying[j] != loadedLayers[i]) { // if this layer doesn't match the layer we're trying to mute,
                        layersPlaying[j][1].gain.value = 0; // mute it
                        layerButton[layersPlaying[j][2]].style.filter = "brightness(20%)"
                    }

                    else { // if it does,
                        soloButton[layersPlaying[j][2]].style.filter = "brightness(100%)" // brighten the solo button
                    }
                }
                layerSoloed = true;
            }

            // this if statement handles un-soloing the song
            else if (loadedLayers[i][1].gain.value != 0) {
                for (let j = 0; j < layersPlaying.length; j++) {
                    layersPlaying[j][1].gain.value = 0.75;
                    layerButton[layersPlaying[j][2]].style.filter = "brightness(100%)"
                    soloButton[layersPlaying[j][2]].style.filter = "brightness(20%)"
                }
                layerSoloed = false;
            }
        })
    }

    // start button functionality
    startButton.addEventListener("click", () => {
        if (!songStarted && startingLayers.length > 0) {
            prepLayers();
            songStarted = true;
            startButton.classList.add("darken_button");
        }
    })

    // pause button functionality
    pauseButton.addEventListener("click", () => {
        if (songStarted && !songPaused) {
            audioContext.suspend();
            songPaused = true;
            pauseButton.innerText = "Unpause";
        }

        else {
            audioContext.resume();
            songPaused = false;
            pauseButton.innerText = "Pause";
        }
    });

    // play all button functionality
    playAllButton.addEventListener("click", () => {
        if (!songStarted) { // if we're trying to start all of them,
            songStarted = true;
            prepLayers();

            // brightening all of the buttons
            Array.from(layerButton).forEach((element) => {
                element.style.filter = "brightness(100%)"
            });

            playAllButton.innerText = "End All";
        }
        
        else { // if we're trying to end all of them,
            for (let i = 0; i < loadedLayers.length; i++) { // clearing AudioBufferSourceNodes
                loadedLayers[i][0].stop();
                loadedLayers[i][0].disconnect();
                layerButton[i].style.filter = "brightness(20%)"
            }

            // darkening the solo buttons
            Array.from(soloButton).forEach((element) => {
                element.removeAttribute("style");
                element.classList.remove("undarken_button");
                element.classList.add("darken_button");
            });

            // brightening start button
            startButton.classList.remove("darken_button");
            startButton.classList.add("undarken_button");

            // reseting variables and button text
            songStarted = false;
            loadedLayers = [];
            layersPlaying = [];
            startingLayers = [];
            playAllButton.innerText = "Play All"
            pauseButton.innerText = "Pause"
        }
    });
});