/*
Here you'll find the code which handles the functionality of the "music screen",
which is where the user is sent upon selecting their region.
*/

function setUpMusicScreen() {
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
            // checking if the audio context is paused and resuming it if it was
            if (audioContext.state == "suspended") {audioContext.resume();}

            if (!songStarted) { // if we're trying to start all of them,
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
            if (recorder.state != "inactive") {
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