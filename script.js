/*
VARIABLES & OTHER SET UP
*/

// preact and htm
const {h, render} = preact;
const html = htm.bind(h);

// element refrences
const layerButton = document.getElementsByClassName("layer_button");
const soloButton = document.getElementsByClassName("solo_button");
const pauseButton = document.getElementById("pause_button");
const playAllButton = document.getElementById("play_button");
const startButton = document.getElementById("start_button");
const recordButton = document.getElementById("record_button");
const saveButton = document.getElementById("save_button");
const deleteButton = document.getElementById("delete_button");
const selectButton = document.getElementById("select_button");
const exitButton = document.getElementById("exit_button");
const mainPage = document.getElementById("main_page");
const loadingScreen = document.getElementById("loading_screen");
const selectionScreen = document.getElementById("selection_screen");
const regionTitle = document.getElementById("region_name");
const layerButtonContainer = document.getElementById("layer_button_container");
const regionSelector = document.getElementById("region_selector");

// grabbing the audio context and creating an oscillator with it
let audioContext = new (window.AudioContext || window.webkitAudioContext);
const oscillator = audioContext.createOscillator();
oscillator.type = "sine";
oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
const oscillatorDestination = audioContext.createMediaStreamDestination();
oscillator.connect(oscillatorDestination);

// creating the recorder
const recorder = new MediaRecorder(oscillatorDestination.stream);

// saving what the recorder picks up
recorder.ondataavailable = (noise) => {
   recordedData.push(noise.data)
}

// turning tha recorder's data into a file
recorder.onstop = () => {
    if (eraseRecording) {
        recordedData = [];
        eraseRecording = false;
    }

    else {
        // creating the file
        var audioFile = new Blob(recordedData, {"type": "audio/mp3; codecs=opus"});
        var fileUrl = URL.createObjectURL(audioFile);

        // sending the file to the user's computer
        var link = document.createElement("a");
        link.href = fileUrl;
        fileName = prompt("Please enter a name for this recording:")
        link.download = fileName + ".mp3";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(fileUrl);

        // clearing the recorded data
        recordedData = [];
    }
}

// declaring our global variables
let layerSoloed, songStarted, eraseRecording, loadedLayers, 
layersPlaying, startingLayers, recordedData, regionThreatLayers;
let regionsAddedToSelector = false;
const mute = 0;
const unmute = 1;
const dimmed = "brightness(40%)"
const brightened = "brightness(100%)"

/*
MAIN PROGRAM
*/

runProgram();

// we utelize recursion to go back and forth between region selection and layer playing
function runProgram() {
    // fetching the json and getting the data we need
    fetch("regions.json").then((data) => {
        return data.json();
    })
    .then((regionData) => {

        // only showing the loading screen until the page is ready
        loadingScreen.style.display = "none";
        mainPage.style.display = "none";
        selectionScreen.style.display = "flex";

        // we will not move onto the next step until the select button has been clicked
        return new Promise((resolve) => {

            // adding regions to the selector
            if (!regionsAddedToSelector) {
                regionData.forEach((region) => {
                    var newOption = document.createElement("option");
                    newOption.innerText = region.name;
                    regionSelector.appendChild(newOption);
                });
                regionsAddedToSelector = true;
            }

            // begin loading once a layer has been chosen
            selectButton.onclick = () => {
                selectionScreen.style.display = "none";
                loadingScreen.style.display = "flex";

                // defining variables
                layerSoloed = false;
                songStarted = false;
                eraseRecording = false;
                loadedLayers = [];
                layersPlaying = [];
                startingLayers = [];
                recordedData = [];
                regionThreatLayers = [];

                // storing the index of the region that was selected
                var regionIndex = regionSelector.selectedIndex
                
                // setting the header to the region's name
                regionTitle.innerText = regionData[regionIndex].name

                // this variable stores the method of creating new buttons for each of the layers
                var addLayerButtons = (layer) => html`
                    <button class="layer_button">${layer[0]}</button>
                    <button class="solo_button darken_button">Solo</button>
                `;

                // here, we dynamically create as many buttons and sounds as we need based on what's in the json
                regionData[regionIndex].layers.forEach((layer) => {
                    // buttons
                    var newButton = document.createElement("div"); // creating a div to hold the buttons
                    newButton.classList.add("layer_options"); 
                    render(addLayerButtons(layer), newButton); // creating those buttons
                    layerButtonContainer.appendChild(newButton); // adding those buttons to the page

                    // sounds
<<<<<<< Updated upstream
                    regionThreatLayers.push(new Audio(layer[1]));
=======

                    regionThreatLayers.push(new Audio(layer[1]))
                    
>>>>>>> Stashed changes
                });

                // managing layerButtonContainer width based on how many layers there are
                switch (regionIndex) {
                    case 0: // if chimney canopy is selected
                        layerButtonContainer.style.width = "700px"
                        break;
                    
                    case 6: // if metropolis is selected
                        layerButtonContainer.style.width = "1050px"
                        break;
                }

                // once this has all been done, move onto the next step
                resolve();
            };
        });
    })
    .then(() => {

        // more web API junk
        try {
            loadSounds = 
                regionThreatLayers.map((audio) => { //personal note: .map is like .forEach except it turns each item into a promise, basically
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
            mainPage.style.display = "flex";

            // if we paused the audioContext, resume it
            if (audioContext.state == "suspended") {audioContext.resume();}

/* 
OTHER FUNCTIONS
*/

        // this function stores the methods for how the layers will be set up
        function prepLayers() {
            // creating an AudioBufferSourceNode each time this function is called
            audioBuffer.forEach((audioBuffer, index) => {
                // creating the bufferSource
                var bufferSource = audioContext.createBufferSource();
                bufferSource.buffer = audioBuffer
                bufferSource.loop = true;
                
                // creating a gainNode and connecting it to the oscillator
                var gainNode = audioContext.createGain();
                gainNode.connect(oscillatorDestination);
                gainNode.connect(audioContext.destination);

                // connecting the audio to the gainNode
                bufferSource.connect(gainNode);

                // returning the buffer and the gain in a pair
                loadedLayers.push([bufferSource, gainNode, index]);
            });

            // undarkening the solo buttons
            Array.from(soloButton).forEach((element) => {
                switchToBright(element);
            });  

            // setting up the layers
            for (let i = 0; i < loadedLayers.length; i++) {

                // this if statement checks for two scenarios
                // 1. If any layers have been chosen to start first, or
                // 2. If the play all button has been clicked
                if (startingLayers.includes(i) || songStarted) {
                    loadedLayers[i][1].gain.value = unmute;
                    layersPlaying.push(loadedLayers[i]);
                }

                // if neither of these are true, that must means this layer has to start muted
                else {
                    loadedLayers[i][1].gain.value = mute;
                }

                loadedLayers[i][0].start(audioContext.currentTime);
            }
            playAllButton.innerText = "End All"
        }

        // functions for swapping button brightness
        function switchToBright(element) {
            element.classList.remove("darken_button");
            element.classList.add("undarken_button");
        }

        function switchToDark(element) {
            element.classList.remove("undarken_button");
            element.classList.add("darken_button");
        }

/*
BUTTON FUNCTIONALITY
*/

            // using a for loop to check each button for inputs
            for (let i = 0; i < layerButton.length; i++) {
                // listening for if a layer button has been clicked
                layerButton[i].onclick = () => {
                    if (!songStarted) {
                        // these if statements handle pre-selecting layers
                        // we keep track of what layers have been chosen by simply storing the value of i
                        if (!startingLayers.includes(i)) {
                            startingLayers.push(i);
                            layerButton[i].style.filter = brightened;
                        }

                        else {
                            var startingLayerIndex = startingLayers.indexOf(i)
                            startingLayers.splice(startingLayerIndex, 1);
                            layerButton[i].style.filter = dimmed;
                        }
                    }

                    // muting and unmuting audio
                    else if (!layerSoloed) {
                        if (loadedLayers[i][1].gain.value == mute) {
                            loadedLayers[i][1].gain.value = unmute;
                            layersPlaying.push(loadedLayers[i]);
                            layerButton[i].style.filter = brightened;
                        }

                        else {
                            loadedLayers[i][1].gain.value = mute
                            var indexOfLayer = layersPlaying.indexOf(loadedLayers[i])
                            layersPlaying.splice(indexOfLayer, 1);
                            layerButton[i].style.filter = dimmed;
                        }
                    }

                    // controlling start button brightness
                    if (!songStarted) {
                        if (startingLayers.length != 0) {
                            switchToBright(startButton);
                        }
                        
                        else {
                            switchToDark(startButton);
                        }
                    }
                };

                // listening for if a solo button has been clicked
                soloButton[i].onclick = () => {
                    if (!layerSoloed && songStarted) {
                        if (loadedLayers[i][1].gain.value == mute) { // if the layer we're trying to solo is muted,
                            loadedLayers[i][1].gain.value = unmute; // unmute it,
                            layersPlaying.push(loadedLayers[i]); // add it to this array
                            soloButton[loadedLayers[i][2]].style.filter = brightened // and brighten both buttons
                            layerButton[loadedLayers[i][2]].style.filter = brightened
                        }

                        for (let j = 0; j < layersPlaying.length; j++) {
                            if (layersPlaying[j] != loadedLayers[i]) { // if this layer doesn't match the layer we're trying to mute,
                                layersPlaying[j][1].gain.value = mute; // mute it
                                layerButton[layersPlaying[j][2]].style.filter = dimmed
                            }

                            else { // if it does,
                                soloButton[layersPlaying[j][2]].style.filter = brightened // brighten the solo button
                            }
                        }
                        layerSoloed = true;
                    }

                    // this if statement handles un-soloing the song
                    else if (loadedLayers[i][1].gain.value != mute) {
                        for (let j = 0; j < layersPlaying.length; j++) {
                            layersPlaying[j][1].gain.value = 1;
                            layerButton[layersPlaying[j][2]].style.filter = brightened
                            soloButton[layersPlaying[j][2]].style.filter = dimmed
                        }
                        layerSoloed = false;
                    }
                };
            };

            // start button functionality
            startButton.onclick = () => {
                if (!songStarted && startingLayers.length > 0) {
                    prepLayers();
                    songStarted = true;
                    switchToDark(startButton);
                }
            };

            // pause button functionality
            pauseButton.onclick = () => {
                if (songStarted && !(audioContext.state == "suspended")) {
                    audioContext.suspend();
                    if (recorder.state == "recording") {recorder.pause();}
                    pauseButton.innerText = "Unpause";
                }

                else if (songStarted) {
                    audioContext.resume();
                    if (recorder.state == "paused") {recorder.resume();}
                    pauseButton.innerText = "Pause";
                }
            };

            // play all button functionality
            playAllButton.onclick = () => {
                if (!songStarted) { // if we're trying to start all of them,
                    songStarted = true;
                    prepLayers();

                    // brightening all of the buttons
                    Array.from(layerButton).forEach((element) => {
                        element.style.filter = brightened
                    });

                    playAllButton.innerText = "End All";
                }
                
                else { // if we're trying to end all of them,
                    for (let i = 0; i < loadedLayers.length; i++) { // clearing AudioBufferSourceNodes
                        loadedLayers[i][0].stop();
                        loadedLayers[i][0].disconnect();
                        layerButton[i].style.filter = dimmed;
                    }

                    // darkening the solo buttons
                    Array.from(soloButton).forEach((element) => {
                        element.removeAttribute("style");
                        switchToDark(element);
                    });

                    // reseting variables and button text
                    songStarted = false;
                    loadedLayers = [];
                    layersPlaying = [];
                    startingLayers = [];
                    playAllButton.innerText = "Play All"
                    pauseButton.innerText = "Pause"
                }
            };

            // record button functionality
            recordButton.onclick = () => {
                if (recorder.state == "inactive") {
                    recorder.start();
                    recordButton.innerText = "Recording..."

                    // switching the other buttons on
                    switchToBright(saveButton);
                    switchToBright(deleteButton);
                }
            };

            // save button functionality
            saveButton.onclick = () => {
                if (recorder.state == "recording") {
                    recorder.stop();
                    recordButton.innerText = "Start Recording";

                    // switching the other buttons off
                    switchToDark(saveButton);
                    switchToDark(deleteButton);
                }
            };

            // delete button functionality
            deleteButton.onclick = () => {
                if (recorder.state != "innactive" && !eraseRecording) {
                    recorder.stop();
                    eraseRecording = true;
                    recordButton.innerText = "Start Recording";

                    // switching the other buttons off
                    switchToDark(saveButton);
                    switchToDark(deleteButton);
                }
            };

            // exit button functionality
            exitButton.onclick = () => {
                // stoping all audio and any recordings
                audioContext.suspend();
                if (recorder.state != "inactive") {
                    recorder.stop();
                    eraseRecording = true;
                }

                // deleting all audioBufferSourceNodes to prevent memory leaks
                for (let i = 0; i < loadedLayers.length; i++) {
                    loadedLayers[i][0].stop();
                    loadedLayers[i][0].disconnect();
                }

                // emptying the button container
                layerButtonContainer.innerHTML = "";

                // reseting button labels and lighting
                playAllButton.innerText = "Play All";
                pauseButton.innerText = "Pause";
                recordButton.innerText = "Start Recording";
                switchToDark(saveButton);
                switchToDark(deleteButton);

                // recursion point
                runProgram();
            };
        });
    });
}