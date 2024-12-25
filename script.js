/*
SET UP
*/

// element refrences
const layerButtons = document.getElementsByClassName("layer_button"),
    soloButton = document.getElementsByClassName("solo_button"),
    pauseButton = document.getElementById("pause_button"),
    pauseIcon = pauseButton.querySelector("img"),
    playAllButton = document.getElementById("play_button"),
    playAllIcon = playAllButton.querySelector("img"),
    startButton = document.getElementById("start_button"),
    aboutButton = document.getElementById("about_button"),
    helpButton = document.getElementById("help_button"),
    creditsButton = document.getElementById("credits_button"),
    recordButton = document.getElementById("record_button"),
    recordIcon = recordButton.querySelector("img"),
    saveButton = document.getElementById("save_button"),
    deleteButton = document.getElementById("delete_button"),
    beginButton = document.getElementById("begin_button"),
    exitButton = document.getElementById("exit_button"),
    visButton = document.getElementById("visualizer_toggle"),
    visIcon = visButton.querySelector("img"),
    musicScreen = document.getElementById("music_screen"),
    loadingScreen = document.getElementById("loading_screen"),
    homeScreen = document.getElementById("home_screen"),
    regionButton = document.getElementsByClassName("region_button"),
    selectionScreen = document.getElementById("selection_screen"),
    selectionHeader = document.getElementById("selection_header"),
    moddedButton = document.getElementById("modded_button"),
    baseButton = document.getElementById("base_button"),
    baseCarousel = document.getElementById("base_carousel"),
    modCarousel = document.getElementById("mod_carousel"),
    carrotButtons = document.getElementsByClassName("carrot_buttons"),
    regionButtonContainer = document.getElementsByClassName("region_button_container"),
    slideNum = document.getElementById("slide_number"),
    selectionBackButton = document.getElementById("selection_back_button"),
    regionTitle = document.getElementById("region_name"),
    layerButtonContainer = document.getElementById("layer_button_container"),
    progressBar = document.getElementById("progress_bar"),
    canvas = document.getElementById("canvas");

// hiding these screens initially for cleaner page startup
loadingScreen.style.display = "none";
musicScreen.style.display = "none";
selectionScreen.display = "none";

// also setting carousel visibility
modCarousel.style.display = "none";

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
recorder.ondataavailable = (noise) => {recordedData.push(noise.data);}

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
        fileName = prompt("Please enter a name for this recording:");
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

// creating the visualizer
const visualizer = audioContext.createAnalyser();
visualizer.fftSize = 512;
const bufferLength = visualizer.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);
const barWidth = canvas.width / bufferLength * 3;
const canvasContext = canvas.getContext("2d");

// making sure the canvas isn't blurry
canvasContext.imageSmoothingEnabled = false;

// declaring our global variables
let layerSoloed, songStarted, eraseRecording, loadedLayers, 
    layersPlaying, startingLayers, recordedData, regionThreatLayers,
    songDuration, barUpdateInterval, altColorNeeded, hoverCheck,
    animation, 
    clickOnTimeout = false,
    regionsAddedToSelector = false,
    recorderQueued = false,
    visActive = false,
    programStarted = false,
    regionButtonClicked = false,
    isFadingOut = false,
    divIndex = -1,
    baseSlideNum = 1,
    modSlideNum = 1,
    baseSlideNumMax = 0,
    modSlideNumMax = 0,
    storedBaseSlide = 0, 
    storedModSlide = 0,
    selectionState = "base";

const brightened = "brightness(100%)",
    dimmed = "brightness(50%)",
    unmute = 1,
    mute = 0,
    soloIcon1 = "assets/images/button_icons/solo_icon_1.png",
    soloIcon2 = "assets/images/button_icons/solo_icon_2.png";

// markdown file handling
let MDArray = ["README.md", "TUTORIAL.md", "LICENSE.md"]
let MDArrayIndex = 0

MDArray.forEach((file) => {
    fetch(file).then((rawMD) => {    
        return rawMD.text();
    }).then((MDText) => {
        // adding the containers
        var MDAndButtonContainer = document.createElement("div");
        MDAndButtonContainer.classList.add("markdown_and_back_container")
        document.body.appendChild(MDAndButtonContainer);
        MDAndButtonContainer.style.visibility = "hidden";
        MDAndButtonContainer.style.opacity = "0";

        var MDContainer = document.createElement("div");
        MDContainer.classList.add("markdown_container")
        MDAndButtonContainer.appendChild(MDContainer);

        // putting the md text into the MDContainer
        MDContainerContent = marked.parse(MDText);
        MDContainer.innerHTML = MDContainerContent

        // adding a back button
        var backButton = document.createElement("button");
        backButton.classList.add("back_button")
        backButton.innerText = "X";
        backButton.onclick = () => {
            MDAndButtonContainer.style.visibility = "hidden";
            MDAndButtonContainer.style.opacity = "0";
        };
        MDAndButtonContainer.appendChild(backButton);

        // applying classes and other changes to elements within the markdown
        MDContainer.querySelectorAll("img").forEach((element) => {
            element.classList.add("markdown_img")
            
            if (element.alt == "Button Icon") {
                element.classList.add("markdown_button_img");
                element.parentElement.classList.add("markdown_button_img_container")
            }
        })

        // taking the links and applying attributes to them
        MDContainer.querySelectorAll("a").forEach((element) => {
            element.classList.add("markdown_link");
            element.target = "_blank";
        });

        // giving each file their respective class and button
        switch (file) {
            case ("README.md"):
                aboutButton.onclick = () => {
                    MDAndButtonContainer.style.visibility = "visible";
                    MDAndButtonContainer.style.opacity = "1";
                    MDContainer.scrollTop = 0
                };
                break;

            case ("TUTORIAL.md"):
                helpButton.onclick = () => {
                    MDAndButtonContainer.style.visibility = "visible"
                    MDAndButtonContainer.style.opacity = "1";
                    MDContainer.scrollTop = 0
                };
                break;

            case ("LICENSE.md"):
                creditsButton.onclick = () => {
                    MDAndButtonContainer.style.visibility = "visible"
                    MDAndButtonContainer.style.opacity = "1";
                    MDContainer.scrollTop = 0
                };
                break;
        }

        MDArrayIndex++;
    })
})

/*
NON-DYNAMIC ONCLICKS
*/

// changing displayed information based on which region gorup was clicked
baseButton.onclick = () => {
    selectionState = "base";
    selectionHeader.innerText = "Vanilla / Downpour";
    modCarousel.scrollLeft = 0;
    baseSlideNum = 1;
    slideNum.innerText = `${baseSlideNum}.`
    switchToDark(carrotButtons[0]);
    switchToBright(carrotButtons[1]);
    modCarousel.style.display = "none";
    baseCarousel.style.display = "flex";
}

moddedButton.onclick = () => {
    selectionState = "mods";
    selectionHeader.innerText = "Modded Regions";
    baseCarousel.scrollLeft = 0;
    modSlideNum = 1;
    slideNum.innerText = `${modSlideNum}.`
    switchToDark(carrotButtons[0]);
    switchToBright(carrotButtons[1]);
    baseCarousel.style.display = "none";
    modCarousel.style.display = "flex";
}

selectionBackButton.onclick = () => {
    showScreen(homeScreen)
    hideScreen(selectionScreen)
    clearSelectionScreen()
    baseCarousel.scrollLeft = 0;
    modCarousel.scrollLeft = 0;
    baseSlideNum = 1;
    modSlideNum = 1;
    slideNum.innerText = 1;
    switchToBright(carrotButtons[1])
    switchToDark(carrotButtons[0])
}

beginButton.onclick = () => {
    hideScreen(homeScreen, selectionScreen);
    showScreen(loadingScreen);
    storedBaseSlide = 0;
    storedModSlide = 0;
    runProgram();
}

// hiding all other screens and showing the home screen first
hideScreen(selectionScreen, musicScreen, loadingScreen);
showScreen(homeScreen);

/*
MAIN PROGRAM
*/

// we utelize recursion to go back and forth between the selection screen and the music screen
function runProgram() {
    // fetching the json and getting the data we need
    fetch("regions.json").then((data) => {
        return data.json();
    })
    .then((regionData) => {
        // hiding the music screen for when we leave it to enter the selection screen
        hideScreen(musicScreen);

        // setting the page name
        document.title = "Threatmixer - Selection Screen";

        // we will not move onto the next step until a region button has been clicked
        return new Promise((resolve) => {

            // waiting for all of the buttons to load in before showing the selection screen
            new Promise((selectionResolve) => {
                // adding buttons to the selection page
                regionData.forEach((region) => {

                    // storing the amount of buttons in each container
                    var baseButtonArray = baseCarousel.querySelectorAll("button");
                    var modButtonArray = modCarousel.querySelectorAll("button");

                    // this switch case handles updating the carousel slides based on how many buttons there are
                    switch (region.group) {

                        // if it's a vanilla/msc region,
                        case ("base"):
                            // add a new slide to that carousel if there's already 6 buttons
                            if (baseButtonArray.length % 6 == 0) {
                                divIndex++;
                                baseSlideNumMax++;
                                var newDiv = document.createElement("div");
                                newDiv.classList.add("region_button_container");
                                baseCarousel.appendChild(newDiv);
                            }

                            break;
                        
                        case ("mods"):
                            if (modButtonArray.length % 6 == 0) {
                                divIndex++;
                                modSlideNumMax++;
                                var newDiv = document.createElement("div");
                                newDiv.classList.add("region_button_container");
                                modCarousel.appendChild(newDiv);
                            }

                            break;
                    }

                    // creating a button
                    var newRegionButton = document.createElement("button");
                    newRegionButton.classList.add("region_button");

                    // styling
                    newRegionButton.style.backgroundImage = `url(${region.background})`;
                    newRegionButton.innerText = region.name;
                    newRegionButton.style.color = `${region.color}`;
                    newRegionButton.style.border = `0.3vw solid`;

                    // adding song snippets for when you hover over buttons using howler (if the button has one)
                    if (region.preview != "N/A") {
                        var songPreview =  new Howl({
                            src: [region.preview, "sounds.mp3"],
                            loop: true,
                            onplay: () => {songPreview.fade(0, 1, 1000)}
                        })
                    }

                    regionButtonContainer[divIndex].appendChild(newRegionButton);

                    // giving each button hover events
                    newRegionButton.onmouseover = () => {
                        // making the button glow
                        newRegionButton.style.boxShadow = `0vw 0vw 1.3vw 0.4vw ${region.color}99`;

                        // fading in the song preview
                        if (region.preview != "N/A") {
                            // this setInterval makes it so that if you're hovering over the button while the song is fading out,
                            // it will fade in again as soon as it's done fading out
                            hoverCheck = setInterval(() => { 
                                if (!isFadingOut && !songPreview.playing()) {
                                    songPreview.play()
                                    clearInterval(hoverCheck)
                                }
                            }, 10)
                        }
                    }

                    newRegionButton.onmouseout = () => {
                        // removing the glow
                        newRegionButton.style.boxShadow = "";

                        // fading out the song preview
                        if (region.preview != "N/A") {
                            clearInterval(hoverCheck)
                            isFadingOut = true;

                            songPreview.fade(1, 0, 1000)
                            // waiting for the song to fully fade before stopping it
                            setTimeout(() => {
                                songPreview.stop()
                                isFadingOut = false;
                            }, 1000)
                        }
                    }

                    // this function adds an onclick event to each button that will cause them to begin loading their respective song screen
                    if (region.name != "Coming Soon!") {
                        addOnClick(newRegionButton, regionData, resolve);
                    }
                });
                selectionResolve();
            })
            .then(() => {
                hideScreen(loadingScreen);
                showScreen(selectionScreen);

                // setting the carousel screen
                baseCarousel.scrollLeft = storedBaseSlide
                modCarousel.scrollLeft = storedModSlide

                // setting carrot button status based on what screen we got sent to
                var atMidOfBaseCarousel = storedBaseSlide > 0 && storedBaseSlide < baseCarousel.scrollLeftMax,
                    atMidOfModCarousel = storedModSlide > 0 && storedModSlide < modCarousel.scrollLeftMax,
                    atStartOfBaseCarousel = storedBaseSlide == 0,
                    atStartOfModCarousel = storedModSlide == 0,
                    atEndOfBaseCarousel = storedBaseSlide == baseCarousel.scrollLeftMax,
                    atEndOfModCarousel = storedModSlide == modCarousel.scrollLeftMax;

                switch (selectionState) {
                    case ("base"):
                        
                        // if on the first slide,
                        if (atStartOfBaseCarousel) {
                            switchToBright(carrotButtons[1]);
                            switchToDark(carrotButtons[0]);
                        }
    
                        // if in the middle, 
                        if (atMidOfBaseCarousel) {
                            switchToBright(carrotButtons[0], carrotButtons[1])
                        }

                        // if on the last slide,
                        if (atEndOfBaseCarousel) {
                            switchToBright(carrotButtons[0]);
                            switchToDark(carrotButtons[1]);
                        }

                        break;
                    
                    // likewise logic
                    case ("mod"):
                        if (atStartOfModCarousel) {
                            switchToBright(carrotButtons[1]);
                            switchToDark(carrotButtons[0]);
                        }
    
                        if (atMidOfModCarousel) {
                            switchToBright(carrotButtons[0], carrotButtons[1])
                        }

                        if (atEndOfModCarousel) {
                            switchToBright(carrotButtons[0]);
                            switchToDark(carrotButtons[1]);
                        }

                        break;
                }

                // carousel scrolling functionality
                if (selectionState == "base") {var scrollDistance = baseCarousel.getBoundingClientRect().width;}
                else if (selectionState == "mods") {var scrollDistance = modCarousel.getBoundingClientRect().width;}
                

                carrotButtons[0].onclick = () => { // left carrot button
                    if (!clickOnTimeout) {
                        // this switch checks to see what carousel we're trying to move
                        switch (selectionState) {
                            case ("base"):
                                // switching the right slde button back on if we are moving off of the last page
                                if (baseSlideNum == baseSlideNumMax) {
                                    switchToBright(carrotButtons[1]);
                                }

                                // moving the slide
                                baseCarousel.scrollLeft -= scrollDistance;

                                // decreasing the slide number if its not already at 1
                                if (baseSlideNum > 1) {
                                    baseSlideNum--;
                                    slideNum.innerText = `${baseSlideNum}.`;
                                }

                                // switching the left carrot button off if we're on the first slide
                                if (baseSlideNum == 1) {
                                    switchToDark(carrotButtons[0])
                                };

                                break;
                            
                            // likewise logic for this case and the other button
                            case ("mods"):
                                if (modSlideNum == modSlideNumMax) {
                                    switchToBright(carrotButtons[1]);
                                }

                                modCarousel.scrollLeft -= scrollDistance;

                                if (modSlideNum > 1) {
                                    modSlideNum--;
                                    slideNum.innerText = `${modSlideNum}.`;
                                }

                                if (modSlideNum == 1) {
                                    switchToDark(carrotButtons[0])
                                }
                                
                                break;
                        }
                    }
                    setClickTimout();
                }

                carrotButtons[1].onclick = () => { // right carrot button
                    if (!clickOnTimeout) {
                        switch (selectionState) {
                            case ("base"):
                                if (baseSlideNum == 1) {
                                    switchToBright(carrotButtons[0]);
                                }

                                baseCarousel.scrollLeft += scrollDistance;

                                if (baseSlideNum < baseSlideNumMax) {
                                    baseSlideNum++;
                                    slideNum.innerText = `${baseSlideNum}.`;
                                }
                                
                                if (baseSlideNum == baseSlideNumMax) {
                                    switchToDark(carrotButtons[1]);
                                }
                                
                                break;
                            
                            case ("mods"):
                                if (modSlideNum == 1) {
                                    switchToBright(carrotButtons[0]);
                                }

                                modCarousel.scrollLeft += scrollDistance;

                                if (modSlideNum < modSlideNumMax) {
                                    modSlideNum++;
                                    slideNum.innerText = `${modSlideNum}.`;
                                }
                                
                                if (modSlideNum == modSlideNumMax) {
                                    switchToDark(carrotButtons[1])
                                }

                                break;
                        }
                    }
                    setClickTimout();
                }
            });
        })
    })
    .then(() => {

        // more web API junk
        loadSounds = 
            regionThreatLayers.map((audio) => {
                return fetch(audio.src)
                    .then((result) => {return result.arrayBuffer();}) // turning the audio into an array buffer
                    .then((arrayBuffer) => {return audioContext.decodeAudioData(arrayBuffer);}) // decoding that buffer
            });

        // we wait for all of the sounds to be buffered, then proceed
        Promise.all(loadSounds).then((arrayBuffer) => {
            hideScreen(loadingScreen);
            showScreen(musicScreen);
            
            // if we paused the audioContext, resume it
            if (audioContext.state == "suspended") {audioContext.resume();}

/*
MUSIC SCREEN FUNCTIONALITY
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
                            switchToDark(layerButtons[i]);
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

                // solo button functionality
                soloButton[i].onclick = () => {
                    if (!layerSoloed && songStarted) {
                        if (loadedLayers[i][1].gain.value == mute) { // if the layer we're trying to solo is muted,
                            loadedLayers[i][1].gain.value = unmute; // unmute it,
                            layersPlaying.push(loadedLayers[i]); // add it to this array
                            soloButton[loadedLayers[i][2]].style.filter = brightened; // and brighten both buttons
                            soloButton[loadedLayers[i][2]].querySelector("img").src = soloIcon2;
                            switchToBright(layerButtons[loadedLayers[i][2]]);
                        }

                        for (let j = 0; j < layersPlaying.length; j++) {
                            if (layersPlaying[j] != loadedLayers[i]) { // if this layer doesn't match the layer we're trying to mute,
                                layersPlaying[j][1].gain.value = mute; // mute it
                                switchToDark(layerButtons[layersPlaying[j][2]]);
                            }

                            else { // if it does,
                                soloButton[layersPlaying[j][2]].style.filter = brightened; // brighten the solo button
                                soloButton[layersPlaying[j][2]].querySelector("img").src = soloIcon2;
                            }
                        }
                        layerSoloed = true;
                    }

                    // this if statement handles un-soloing the song
                    else if (loadedLayers[i][1].gain.value != mute) {
                        for (let j = 0; j < layersPlaying.length; j++) {
                            layersPlaying[j][1].gain.value = 1;
                            // brightening the other layer buttons that were playing before, making sure to skip over the one that's already bright
                            if (loadedLayers[i][2] != layersPlaying[j][2]) {
                                switchToBright(layerButtons[layersPlaying[j][2]]);
                            }
                            soloButton[layersPlaying[j][2]].style.filter = dimmed;
                            soloButton[layersPlaying[j][2]].querySelector("img").src = soloIcon1;
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
                    pauseIcon.src = "assets/images/button_icons/resume_icon.png";
                }

                else if (songStarted) {
                    audioContext.resume();
                    if (recorder.state == "paused") {recorder.resume();}
                    pauseIcon.src = "assets/images/button_icons/pause_icon.png";
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

                    playAllIcon.src = "assets/images/button_icons/stop_icon.png";
                }
                
                else { // if we're trying to end all of them,

                    // clearing AudioBufferSourceNodes and darkening layer buttons
                    loadedLayers.forEach((audio, index) => {
                        audio[0].stop();
                        audio[0].disconnect();
                        switchToDark(layerButtons[index]);
                    }) 

                    // darkening the solo buttons
                    Array.from(soloButton).forEach((element) => {
                        element.style.removeProperty("filter");
                        element.querySelector("img").src = soloIcon1;
                        switchToDark(element);
                    });

                    // darkening the pause button
                    switchToDark(pauseButton);

                    // stopping recording if is has started
                    if (recorder.state != "inactive") {
                        recorder.stop();
                        eraseRecording = true;
                        recordIcon.src = "assets/images/button_icons/rec_icon.png";
                        switchToDark(saveButton, deleteButton);
                    }

                    // reseting variables and button text
                    layerSoloed = false;
                    songStarted = false;
                    loadedLayers = [];
                    layersPlaying = [];
                    startingLayers = [];
                    playAllIcon.src = "assets/images/button_icons/play_all_icon.png";
                    pauseIcon.src = "assets/images/button_icons/pause_icon.png"
                    stopUpdatingBar();
                }
            };

            // record button functionality
            recordButton.onclick = () => {
                if (recorder.state == "inactive") {
                    if (!songStarted) { // if we're trying to que the recording,
                        recorderQueued = true;
                        recordIcon.src = "assets/images/button_icons/rec_pending_icon.png";
                        switchToBright(deleteButton);
                    }

                    else {
                        recorder.start();
                        recordIcon.src = "assets/images/button_icons/rec_progress_icon.png"

                        // switching the other buttons on
                        switchToBright(saveButton, deleteButton);
                    }
                }
            };

            // save button functionality
            saveButton.onclick = () => {
                if (recorder.state == "recording") {
                    recorder.stop();
                    recordIcon.src = "assets/images/button_icons/rec_icon.png";

                    // switching the other buttons off
                    switchToDark(saveButton, deleteButton);
                }
            };

            // delete button functionality
            deleteButton.onclick = () => {
                if (recorder.state != "innactive" && !recorderQueued) {
                    eraseRecording = true;
                    recorder.stop();
                    recordIcon.src = "assets/images/button_icons/rec_icon.png";

                    // switching the other buttons off
                    switchToDark(saveButton, deleteButton);
                }

                else if (recorderQueued && !songStarted) {
                    recorderQueued = false;
                    recordIcon.src = "assets/images/button_icons/rec_icon.png";

                    switchToDark(deleteButton);
                }
            };

            // visualizer toggle functionality
            visButton.onclick = () => {
                canvas.classList.toggle("hide_canvas")

                if (canvas.classList.contains("hide_canvas")) {
                    visIcon.src = "assets/images/button_icons/vis_disabled_icon.png";
                }

                else {
                    visIcon.src = "assets/images/button_icons/vis_enabled_icon.png";
                }
            }

            // exit button functionality
            exitButton.onclick = () => {
                // stoping all audio and any recordings
                songStarted = false;
                audioContext.suspend();
                if (recorder.state != "inactive") {
                    recorder.stop();
                    eraseRecording = true;
                }

                // unpausing the audio context if it was paused
                if (audioContext.state == "suspended") {audioContext.resume();}

                // stopping the progress bar
                stopUpdatingBar();

                // deleting all audioBufferSourceNodes to prevent memory leaks
                for (let i = 0; i < loadedLayers.length; i++) {
                    loadedLayers[i][0].stop();
                    loadedLayers[i][0].disconnect();
                }

                clearSelectionScreen();

                // reseting button labels and lighting
                playAllIcon.src = "assets/images/button_icons/play_all_icon.png";
                pauseIcon.src = "assets/images/button_icons/pause_icon.png";
                recordIcon.src = "assets/images/button_icons/rec_icon.png";
                switchToDark(saveButton, deleteButton);

                // recursion point
                runProgram();
            };
        });
    });
}

/* 
FUNCTIONS
*/

// loading song screen on region button click
function addOnClick(element, regionData, resolve) {
    element.onclick = () => {
        // preventing this code from running twice due to a double click
        if (!regionButtonClicked) {
            regionButtonClicked = true;
            
            hideScreen(selectionScreen);
            showScreen(loadingScreen);

            // first storing the current carousel state to reference for later
            storedBaseSlide = baseCarousel.scrollLeft;
            storedModSlide = modCarousel.scrollLeft;

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
            var regionButtonArray = Array.from(regionButton),
                regionIndex = regionButtonArray.indexOf(element),
                regionChosen = regionData[regionIndex];
            
            // changing the title of the page
            document.title = `Threatmixer - ${regionChosen.name}`;
            
            // setting the header to the region's name
            regionTitle.innerText = regionData[regionIndex].name

            // managing layerButtonContainer width based on how many layers there are
            switch (regionIndex) {
                case 0: // chimney canopy
                    layerButtonContainer.style.width = "52vw";
                    altColorNeeded = true;
                    break;
                
                case 6: // metroplis
                    layerButtonContainer.style.width = "58vw";
                    altColorNeeded = true;
                    break;
                
                case 18: // coral caves
                    layerButtonContainer.style.width = "56vw";
                    altColorNeeded = true;
                    break;
                
                case 25: // moss fields
                    layerButtonContainer.style.width = "62vw";
                    altColorNeeded = true;
                    break;
                
                case 34: // stormy coast
                    layerButtonContainer.style.width = "49vw";
                    altColorNeeded = false;
                    break;

                default: // if none of these things were selected
                    layerButtonContainer.style.width = "100%";
                    altColorNeeded = false;
                    break;
            }

            // storing the color changes we'll need based on the chosen region
            if (altColorNeeded) {
                var altColor = regionChosen.altColor
                var altFilter = regionChosen.altFilter
            }
            var pageStyle = regionChosen.color;
            var iconFilter = regionChosen.filter;

            // here, we dynamically create as many buttons and sounds as we need based on what's in the json
            regionChosen.layers.forEach((layer) => {

                // buttons
                // creating a div to hold each of the buttons
                var newDiv = document.createElement("div");
                newDiv.classList.add("layer_options");

                // creating the layer and solo buttons
                var newLayerButton = document.createElement("button"); 
                newLayerButton.classList.add("layer_button", "layer_button_darkened");
                newLayerButton.style.border = `0.16vw solid ${pageStyle}`;

                var newSoloButton = document.createElement("button");
                newSoloButton.classList.add("solo_button", "darken_button");
                newSoloButton.style.border = `0.16vw solid ${pageStyle}`;

                // creating the icons to put in each button
                var newLayerIcon = document.createElement("img");
                newLayerIcon.classList.add("button_icon");
                newLayerIcon.src = `assets/images/button_icons/${layer[0]}`;
                newLayerIcon.style.filter = `${iconFilter}`;

                var newSoloIcon = document.createElement("img");
                newSoloIcon.classList.add("button_icon", "solo_button_icon");
                newSoloIcon.src = soloIcon1;
                newSoloIcon.style.filter = `${iconFilter}`;

                // applying alternate colors to buttons if needed
                if ((altColorNeeded && regionIndex == 0 && layerButtons.length > 7) || // chimney canopy
                    (altColorNeeded && regionIndex == 6 && layerButtons.length > 8) || // metropolis
                    (altColorNeeded && regionIndex == 18 && layerButtons.length > 8) ||  // coral caves
                    (altColorNeeded && regionIndex == 25 && layerButtons.length > 8)) { // moss fields
                    newLayerButton.classList.replace("layer_button_darkened", "alt_layer_button_darkened")
                    newLayerButton.style.border = `0.16vw solid ${altColor}`;
                    newSoloButton.style.border = `0.16vw solid ${altColor}`;
                    newLayerIcon.style.filter = `${altFilter}`;
                    newSoloIcon.style.filter = `${altFilter}`;
                }

                // adding our new elements onto the page
                newLayerButton.appendChild(newLayerIcon);
                newSoloButton.appendChild(newSoloIcon);
                newDiv.appendChild(newLayerButton);
                newDiv.appendChild(newSoloButton);
                layerButtonContainer.appendChild(newDiv);
            
                // sounds
                regionThreatLayers.push(new Audio(layer[1]));
            });

            // creating more style changes for classes
            var styleChanges = document.createElement("style");
            styleChanges.textContent = `
            #exit_button, #region_name, #visualizer_toggle, .other_buttons {
                color: ${pageStyle};
            }

            #exit_button, #visualizer_toggle, .other_buttons {
                border: 0.16vw solid ${pageStyle};
            }

            .layer_button_brightened {
                box-shadow: 0vw 0vw 1.3vw 0.4vw ${pageStyle}99;
            }

            .alt_layer_button_brightened {
                box-shadow: 0vw 0vw 1.3vw 0.4vw ${altColor}99;
            }

            .other_button_icons {
                filter: ${iconFilter}
            }

            progress::-moz-progress-bar {
                background-color: ${pageStyle};
            }

            progress::-webkit-progress-value {
                background-color: ${pageStyle};
            }
            `;
            
            // adding these changes
            document.head.appendChild(styleChanges);

            // changing the background image depending on the region
            musicScreen.style.backgroundImage = `url(${regionChosen.background})`;

            // changing the color of the visualizer
            canvasContext.fillStyle = `${pageStyle}`;
            canvasContext.strokeStyle = `${pageStyle}`;

            // once this has all been done, move onto the next step
            resolve(); 
        }
    }
}

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

        // connecting the gain to the visualizer
        gainNode.connect(visualizer);

        // returning the buffer, gain, and index of the layer in an array for easy accessibility
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
        recordIcon.src = "assets/images/button_icons/rec_progress_icon.png";
        recorderQueued = false;

        // switching the other buttons on
        switchToBright(saveButton, deleteButton);
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

    playAllIcon.src = "assets/images/button_icons/stop_icon.png";

    // starting the progress bar and visualizer
    if (!visActive) {startVisualizer();}
    startUpdatingBar(arrayBuffer);
}

// functions for swapping button brightness
function switchToBright(...elements) {
    elements.forEach((element) => {
        // if we're switching a layer button on or off, change that element to a unique class
        if (Array.from(layerButtons).includes(element)) {
            // if the layer button is of an alternate color,
            if (element.classList.contains("alt_layer_button_darkened")) {
                element.classList.replace("alt_layer_button_darkened", "alt_layer_button_brightened");
            }

            // otherwise,
            else {
                element.classList.replace("layer_button_darkened", "layer_button_brightened");
            }
        }

        // otherwise, set the element to the normal class
        else {
            element.classList.replace("darken_button", "brighten_button");
        }
    })
}

function switchToDark(...elements) {
    elements.forEach((element) => {
        // same sort of logic as in switchToBright()
        if (Array.from(layerButtons).includes(element)) {
            if (element.classList.contains("alt_layer_button_brightened")) {
                element.classList.replace("alt_layer_button_brightened", "alt_layer_button_darkened");
            }

            else {
                element.classList.replace("layer_button_brightened", "layer_button_darkened");
            }
        }

        else {
            element.classList.replace("brighten_button", "darken_button");
        }
    })
}

// functions for changing screen visibility
function hideScreen(...screens) {
    screens.forEach((screen) => {
        screen.style.height = "0%";

        // grabbing all of the items in the screen and hiding them
        var screenContent = screen.querySelectorAll("*");
        screenContent.forEach((element) => {element.style.visibility = "hidden";})
    })
}

function showScreen(...screens) {
    screens.forEach((screen) => {
        screen.style.height = "100%";

        // grabbing all of the items in the screen and showing them
        var screenContent = screen.querySelectorAll("*");
        screenContent.forEach((element) => {element.style.visibility = "visible";})
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
    }, 10);
}

function stopUpdatingBar() {
    clearInterval(barUpdateInterval);

    // if the song wasn't paused and has been reset, clear the bar
    // otherwise, the bar will stay in place and resume once unpaused
    if (audioContext.state != "suspended" || !songStarted) {progressBar.value = 0;}
}

// creating timeout for how fast baseCarousel buttons can be clicked
// this prevents the baseCarousel from getting caught inbetween slides
function setClickTimout() {
    clickOnTimeout = true;
    setTimeout(() => {clickOnTimeout = false;}, 500);
}

// visualizer functions
// drawing the bars
function drawLine() {
    canvasContext.beginPath();
    canvasContext.moveTo(0, canvas.height - 2);
    canvasContext.lineWidth = 3;
    canvasContext.stroke();
}

// visualizer functionality
function startVisualizer() {
    visActive = true;

    // all credit goes towards QuickCodingTuts for this code
    // find out more about them and their channel in the LICENSE.md
    function animate() {
        animation = window.requestAnimationFrame(animate);

        var x = 0;
        canvasContext.clearRect(0, 0, canvas.clientWidth, canvas.height);
        visualizer.getByteFrequencyData(dataArray);

        for (let i = 0; i < bufferLength; i++) {
            drawLine();
            var rawBarHeight = dataArray[i];
            var dynamicBarHeight = (rawBarHeight / 255) * canvas.height;
            canvasContext.fillRect(x, canvas.height - dynamicBarHeight, barWidth, dynamicBarHeight);
            x += barWidth + 2;
        }
    }

    animate()
}

// a simple function to handle clearing out the selection screen when necessary
function clearSelectionScreen() {
    // reseting variables, containers, and button text
    layerButtonContainer.innerHTML = "";
    baseCarousel.innerHTML = "";
    modCarousel.innerHTML = "";
    document.title = "Threatmixer";
    regionButtonClicked = false;
    divIndex = -1;
    baseSlideNumMax = 0;
    modSlideNumMax = 0;
}

// unhiding the other screens once they've been flattened
setTimeout(() => {
    loadingScreen.style.display = "flex";
    musicScreen.style.display = "flex";
    selectionScreen.style.display = "flex";
}, 300);