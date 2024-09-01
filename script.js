/*
VARIABLES & OTHER SET UP
*/

// preact and htm
const {h, render} = preact,
    html = htm.bind(h);

// element refrences
const layerButtons = document.getElementsByClassName("layer_button"),
    soloButton = document.getElementsByClassName("solo_button"),
    pauseButton = document.getElementById("pause_button"),
    playAllButton = document.getElementById("play_button"),
    startButton = document.getElementById("start_button"),
    recordButton = document.getElementById("record_button"),
    saveButton = document.getElementById("save_button"),
    deleteButton = document.getElementById("delete_button"),
    selectButton = document.getElementById("select_button"),
    exitButton = document.getElementById("exit_button"),
    mainPage = document.getElementById("main_page"),
    loadingScreen = document.getElementById("loading_screen"),
    selectionScreen = document.getElementById("selection_screen"),
    regionTitle = document.getElementById("region_name"),
    layerButtonContainer = document.getElementById("layer_button_container"),
    regionSelector = document.getElementById("region_selector"),
    progressBar = document.getElementById("progress_bar"),
    buttons = document.querySelectorAll("button");

    // hiding these screens initially for cleaner page loading
loadingScreen.style.display = "none";
mainPage.style.display= "none";

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
        var audioFile = new Blob(recordedData, {"type": "audio/mp3; codecs=opus"}),
            fileUrl = URL.createObjectURL(audioFile);
            

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
    layersPlaying, startingLayers, recordedData, regionThreatLayers,
    songDuration, barUpdateInterval
    regionsAddedToSelector = false,
    recorderQueued = false;

const brightened = "brightness(100%)",
    dimmed = "brightness(50%)",
    unmute = 1,
    mute = 0;

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

        // only showing the selection screen until a region is chosen
        hideScreen(loadingScreen);
        hideScreen(mainPage);
        showScreen(selectionScreen);

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
                    hideScreen(selectionScreen);
                    showScreen(loadingScreen);

                    // defining variables
                    layerSoloed = false;
                    songStarted = false;
                    eraseRecording = false;
                    loadedLayers = [];
                    layersPlaying = [];
                    startingLayers = [];
                    recordedData = [];
                    regionThreatLayers = [];

                    // storing the index of the region that was selected, as well as the region itself
                    var regionIndex = regionSelector.selectedIndex
                    var regionChosen = regionData[regionIndex]
                    
                    // setting the header to the region's name
                    regionTitle.innerText = regionData[regionIndex].name

                    // this variable stores the method of creating new buttons for each of the layers
                    var addLayerButtons = (layer) => html`
                        <button class="layer_button layer_button_darkened">${layer[0]}</button>
                        <button class="solo_button darken_button">Solo</button>
                    `;

                    // here, we dynamically create as many buttons and sounds as we need based on what's in the json
                    regionChosen.layers.forEach((layer) => {

                        // buttons
                        var newButton = document.createElement("div"); // creating a div to hold the buttons
                        newButton.classList.add("layer_options"); 
                        render(addLayerButtons(layer), newButton); // creating those buttons
                        layerButtonContainer.appendChild(newButton); // adding those buttons to the page

                        // sounds
                        regionThreatLayers.push(new Audio(layer[1]));
                    });

                    // managing layerButtonContainer width based on how many layers there are
                    switch (regionIndex) {
                        case 0: // chimney canopy
                            layerButtonContainer.style.width = "800px"
                            break;
                        
                        case 6: // metroplis
                            layerButtonContainer.style.width = "1225px"
                            break;

                        default: // if none of these things were selected
                            layerButtonContainer.style.width = "100%"
                            break;
                    }

                // adding color changes based on the chosen region
                var pageStyle = regionChosen.color
                var styleChanges = document.createElement("style");
                styleChanges.textContent = `
                #exit_button, #region_name, .layer_button, .solo_button, .other_buttons {
                    color: ${pageStyle};
                }

                #exit_button, .layer_button, .solo_button, .other_buttons {
                    border: 3px solid ${pageStyle};
                }

                .layer_button_brightened {
                    box-shadow: 0px 0px 20px 3px ${pageStyle}99;
                }

                progress::-moz-progress-bar, progress::-webkit-progress-bar {
                    background-color: ${pageStyle};
                }
                `;
                
                // adding these changes
                document.head.appendChild(styleChanges);

                // changing the background image depending on the region
                mainPage.style.backgroundImage = `url(${regionChosen.background})`

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
        Promise.all(loadSounds).then((arrayBuffer) => {
            hideScreen(loadingScreen);
            showScreen(mainPage);
            
            // if we paused the audioContext, resume it
            if (audioContext.state == "suspended") {audioContext.resume();}

/*
BUTTON FUNCTIONALITY
*/

            // using a for loop to check each button for inputs
            for (let i = 0; i < layerButtons.length; i++) {
                // listening for if a layer button has been clicked
                layerButtons[i].onclick = () => {
                    if (!songStarted) {
                        // these if statements handle pre-selecting layers
                        // we keep track of what layers have been chosen by simply storing the value of i
                        if (!startingLayers.includes(i)) {
                            startingLayers.push(i);
                            switchToBright(layerButtons[i]);
                        }

                        else {
                            var startingLayerIndex = startingLayers.indexOf(i)
                            startingLayers.splice(startingLayerIndex, 1);
                            switchToDark(layerButtons[i]);
                        }
                    }

                    // muting and unmuting audio
                    else if (!layerSoloed) {
                        if (loadedLayers[i][1].gain.value == mute) {
                            loadedLayers[i][1].gain.value = unmute;
                            layersPlaying.push(loadedLayers[i]);
                            switchToBright(layerButtons[i]);
                        }

                        else {
                            loadedLayers[i][1].gain.value = mute
                            var indexOfLayer = layersPlaying.indexOf(loadedLayers[i])
                            layersPlaying.splice(indexOfLayer, 1);
                            switchToDark(layerButtons[i])
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
                            switchToBright(layerButtons[loadedLayers[i][2]]);
                        }

                        for (let j = 0; j < layersPlaying.length; j++) {
                            if (layersPlaying[j] != loadedLayers[i]) { // if this layer doesn't match the layer we're trying to mute,
                                layersPlaying[j][1].gain.value = mute; // mute it
                                switchToDark(layerButtons[layersPlaying[j][2]]);
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
                            switchToBright(layerButtons[layersPlaying[j][2]]);
                            soloButton[layersPlaying[j][2]].style.filter = dimmed
                        }
                        layerSoloed = false;
                    }
                };
            };

            // start button functionality
            startButton.onclick = () => {
                if (!songStarted && startingLayers.length > 0) {
                    prepSong(arrayBuffer);
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

                    // checking if the audio context is paused and resuming it if it was
                    // the layers won't be paused when starting the song over again
                    if (audioContext.state == "suspended") {audioContext.resume();}
                    songStarted = true;
                    prepSong(arrayBuffer);

                    // brightening all of the buttons
                    Array.from(layerButtons).forEach((element) => {
                        switchToBright(element);
                    });

                    // darking the start button
                    switchToDark(startButton);

                    playAllButton.innerText = "Reset Song";
                }
                
                else { // if we're trying to end all of them,

                    // clearing AudioBufferSourceNodes
                    loadedLayers.forEach((audio, index) => {
                        audio[0].stop();
                        audio[0].disconnect();
                        switchToDark(layerButtons[index]);
                    }) 

                    // darkening the solo buttons
                    Array.from(soloButton).forEach((element) => {
                        element.removeAttribute("style");
                        switchToDark(element);
                    });

                    // darking the pause button
                    switchToDark(pauseButton);

                    // stopping recording if is has started
                    if (recorder.state != "inactive") {
                        recorder.stop();
                        eraseRecording = true;
                        recordButton.innerText = "Start Recording";

                        switchToDark(saveButton);
                        switchToDark(deleteButton);
                    }

                    // reseting variables and button text
                    songStarted = false;
                    loadedLayers = [];
                    layersPlaying = [];
                    startingLayers = [];
                    playAllButton.innerText = "Play All"
                    pauseButton.innerText = "Pause"

                    stopUpdatingBar();
                }
            };

            // record button functionality
            recordButton.onclick = () => {
                if (recorder.state == "inactive") {
                    if (!songStarted) {
                        recorderQueued = true;
                        recordButton.innerText = "Recording Queued";
                        deleteButton.innerText = "Cancle Queue";

                        switchToBright(deleteButton);
                    }

                    else {
                        recorder.start();
                        recordButton.innerText = "Recording..."

                        // switching the other buttons on
                        switchToBright(saveButton);
                        switchToBright(deleteButton);
                    }
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
                if (recorder.state != "innactive" && !recorderQueued) {
                    eraseRecording = true;
                    recorder.stop();
                    recordButton.innerText = "Start Recording";

                    // switching the other buttons off
                    switchToDark(saveButton);
                    switchToDark(deleteButton);
                }

                else if (recorderQueued && !songStarted) {
                    recorderQueued = false;
                    recordButton.innerText = "Start Recording";
                    deleteButton.innerText = "Delete Recording";

                    switchToDark(deleteButton);
                }
            };

            // exit button functionality
            exitButton.onclick = () => {
                // stoping all audio and any recordings
                songStarted = false;
                audioContext.suspend();
                if (recorder.state != "inactive") {
                    recorder.stop();
                    eraseRecording = true;
                }

                // stopping the progress bar
                stopUpdatingBar();

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

/* 
FUNCTIONS
*/

// this function stores the methods for how the layers will be set up
function prepSong(arrayBuffer) {

    // creating an AudioBufferSourceNode each time this function is called
    arrayBuffer.forEach((audioBuffer, index) => {
        // creating the bufferSource
        var bufferSource = audioContext.createBufferSource();
        bufferSource.buffer = audioBuffer;
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

    // brightening the pause button
    switchToBright(pauseButton);

    // starting the recorder if it was queued
    if (recorderQueued) {
        recorder.start();
        recordButton.innerText = "Recording..."
        deleteButton.innerText = "Delete Recording"
        recorderQueued = false;

        // switching the other buttons on
        switchToBright(saveButton);
        switchToBright(deleteButton);
    }

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

    playAllButton.innerText = "Reset Song"

    startUpdatingBar(arrayBuffer);
}

// functions for swapping button brightness
function switchToBright(element) {

    // if we're switching a layer button on or off, change that element to a unique class
    if (Array.from(layerButtons).includes(element)) {
        element.classList.remove("layer_button_darkened");
        element.classList.add("layer_button_brightened");
    }

    // otherwise, set the element to the normal class
    else {
        element.classList.remove("darken_button");
        element.classList.add("brighten_button");
    }
}

function switchToDark(element) {
    if (Array.from(layerButtons).includes(element)) {
        element.classList.remove("layer_button_brightened");
        element.classList.add("layer_button_darkened");
    }

    else {
        element.classList.remove("brighten_button");
        element.classList.add("darken_button");
    }
}

// functions for changing screen visibility
function hideScreen(screen) {
    screen.style.height = "0%";

    // grabbing all of the items in the screen and hiding them
    var screenContent = screen.querySelectorAll("*");
    screenContent.forEach((element) => {
        element.style.visibility = "hidden";
    })
}

function showScreen(screen) {
    screen.style.height = "100%";

    // grabbing all of the items in the screen and showing them
    var screenContent = screen.querySelectorAll("*");
    screenContent.forEach((element) => {
        element.style.visibility = "visible";
    })
}

// these next functions handles the song progress bar
function startUpdatingBar(arrayBuffer) {
    // storing the time at which the audio started
    var startTime = audioContext.currentTime;

    barUpdateInterval = setInterval(() => {
        // storing the amount of time that has passed since starting
        // this is a way of getting the current time of the audioBuffers since you can't just use .currentTime
        var ellapsedTime = audioContext.currentTime - startTime;
        var duration = arrayBuffer[0].duration;
        var progressPercent = (ellapsedTime / duration) * 100;

        progressBar.value = progressPercent;

        // resetting the progress bar if it gets full
        if (progressBar.value == 100) {
            progressBar.value = 0;
            startTime = audioContext.currentTime
        }
    }, 10)
}

function stopUpdatingBar() {
    clearInterval(barUpdateInterval);

    // if the song wasn't paused or has been stopped, clear the bar
    if (audioContext.state != "suspended" || !songStarted) {progressBar.value = 0;}
    // otherwise, the bar will stay in place and resume once unpaused
}

// unhiding the other screens once they've been flattened
setTimeout(() => {
    loadingScreen.style.display = "flex";
    mainPage.style.display = "flex";
}, 300);