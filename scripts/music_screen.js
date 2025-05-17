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

        // ensuring that each layer loops at the exact same time
        if (!farShoreSelected) {
            arrayBuffer.forEach((layer) => {
                if (layer.duration < globalDuration) {
                    globalDuration = layer.duration
                }
            });
        }
        else {
            globalDuration = 63.99999;
            farShoreSelected = false;
        }
        console.log(globalDuration)

        // formatting the timer
        var songLength = () => {
            var roundedDuration = Math.round(globalDuration, 2),
                minutes = Math.floor(roundedDuration / 60),
                seconds = roundedDuration % 60
            
            if (seconds < 10) {seconds = `0${seconds}`}

            return `${minutes}:${seconds}`
        }

        timer.innerText = `00:00 / ${songLength()}`

        instanceSongLength = songLength()

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
                        layerButtons[i].dataset.title = " (Pre-selected)";
                        updateTippyContent(layerButtons[i], layerNameArray[i], true);
                        startingLayers.push(i);
                        switchToBright(layerButtons[i]);
                    }

                    else {
                        layerButtons[i].dataset.title = " (Muted)";
                        updateTippyContent(layerButtons[i], layerNameArray[i], true);
                        var startingLayerIndex = startingLayers.indexOf(i)
                        startingLayers.splice(startingLayerIndex, 1);
                        switchToDark(layerButtons[i]);
                    }
                }

                // muting and unmuting audio
                else if (!layerSoloed) {
                    if (loadedLayers[i].volume.gain.value <= mute) {
                        layerButtons[i].dataset.title = " (Playing)";
                        updateTippyContent(layerButtons[i], layerNameArray[i], true);
                        layersPlaying.push(loadedLayers[i]);
                         
                        if (!layersCanFade) {loadedLayers[i].volume.gain.value = unmute;}
                        else {startLayerFadeIn(loadedLayers[i]);}

                        switchToBright(layerButtons[i]);
                    }

                    else {
                        layerButtons[i].dataset.title = " (Muted)";
                        updateTippyContent(layerButtons[i], layerNameArray[i], true);
                        var indexOfLayer = layersPlaying.indexOf(loadedLayers[i])
                        layersPlaying.splice(indexOfLayer, 1);

                        if (!layersCanFade) {loadedLayers[i].volume.gain.value = mute;}
                        else {startLayerFadeOut(loadedLayers[i], false);}
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
                    updateTippyContent(soloButton[i], "Solo Layer (Unmute All Others)", false);

                    if (loadedLayers[i].volume.gain.value == mute) { // if the layer we're trying to solo is muted,
                        loadedLayers[i].volume.gain.value = unmute; // unmute it,
                        layerButtons[i].dataset.title = " (Playing)";
                        updateTippyContent(layerButtons[i], loadedLayers[i].name, true);
                        layersPlaying.push(loadedLayers[i]); // add it to this array
                        soloButton[loadedLayers[i].index].style.filter = brightened; // and brighten both buttons
                        soloButton[loadedLayers[i].index].querySelector("img").src = soloIcon2;
                        switchToBright(layerButtons[loadedLayers[i].index]);
                    }

                    for (let j = 0; j < layersPlaying.length; j++) {
                        if (layersPlaying[j] != loadedLayers[i]) { // if this layer doesn't match the layer we're trying to mute,
                            layersPlaying[j].volume.gain.value = mute; // mute it
                            switchToDark(layerButtons[layersPlaying[j].index]);
                        }

                        else { // if it does,
                            soloButton[layersPlaying[j].index].style.filter = brightened; // brighten the solo button
                            soloButton[layersPlaying[j].index].querySelector("img").src = soloIcon2;
                        }
                    }
                    layerSoloed = true;
                }

                // this if statement handles un-soloing the song
                else if (loadedLayers[i].volume.gain.value != mute) {
                    updateTippyContent(soloButton[i], "Solo Layer (Mute All Others)", false);

                    for (let j = 0; j < layersPlaying.length; j++) {
                        layersPlaying[j].volume.gain.value = 1;
                        // brightening the other layer buttons that were playing before, making sure to skip over the one that's already bright
                        if (loadedLayers[i].index != layersPlaying[j].index) {
                            switchToBright(layerButtons[layersPlaying[j].index]);
                        }
                        soloButton[layersPlaying[j].index].style.filter = dimmed;
                        soloButton[layersPlaying[j].index].querySelector("img").src = soloIcon1;
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
                updateTippyContent(playAllButton, "End Song", false);
            }
        };

        // pause button functionality
        pauseButton.onclick = () => {
            if (songStarted && !(audioContext.state == "suspended")) {
                updateTippyContent(pauseButton, "Resume Song & Recording", false);
                audioContext.suspend();
                songPaused = true;
                if (recorder.state == "recording") {recorder.pause();}
                songTimer.pause()
                pauseIcon.src = "assets/images/button_icons/resume_icon.png";
            }

            else if (songStarted) {
                updateTippyContent(pauseButton, "Pause Song & Recording", false);
                audioContext.resume();
                songPaused = false;
                if (recorder.state == "paused") {recorder.resume();}
                songTimer.pause();
                pauseIcon.src = "assets/images/button_icons/pause_icon.png";

                // starting any fade outs/ins that may have been initiated when the song was paused
                if (pendingFadeIns.length > 0 || pendingFadeOuts.length > 0) {
                    pendingFadeIns.forEach((layer) => {startLayerFadeIn(layer)});
                    pendingFadeIns = []
                    pendingFadeOuts.forEach((layer) => {startLayerFadeOut(layer, false)});
                    pendingFadeOuts = []
                }
            }
        };

        // play all button functionality
        playAllButton.onclick = () => {
            updateTippyContent(playAllButton, "End Song", false);

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
                updateTippyContent(playAllButton, "Play All Layers", false);

                // clearing AudioBufferSourceNodes and darkening layer buttons
                loadedLayers.forEach((audio, index) => {
                    audio.bufferSource.stop();
                    audio.bufferSource.disconnect();
                    switchToDark(layerButtons[index]);
                    layerButtons[index].dataset.title = " (Muted)"
                    updateTippyContent(layerButtons[index], audio.name, true);
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
                    updateTippyContent(recordButton, "Start Recording", false);
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

                // stopping the timer
                songTimer.stop()
                timer.innerText = `00:00 / ${instanceSongLength}`
            }
        };

        // record button functionality
        recordButton.onclick = () => {
            if (recorder.state == "inactive") {
                if (!songStarted) { // if we're trying to que the recording,
                    updateTippyContent(recordButton, "Recording Queued", false);
                    recorderQueued = true;
                    recordIcon.src = "assets/images/button_icons/rec_pending_icon.png";
                    switchToBright(deleteButton);
                }

                else {
                    updateTippyContent(recordButton, "Recording...", false);
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
                updateTippyContent(recordButton, "Start Recording", false);
                recorder.stop();
                recordIcon.src = "assets/images/button_icons/rec_icon.png";

                // switching the other buttons off
                switchToDark(saveButton, deleteButton);
            }
        };

        // delete button functionality
        deleteButton.onclick = () => {
            updateTippyContent(recordButton, "Start Recording", false);

            if (recorder.state != "inactive" && !recorderQueued) {
                eraseRecording = true;
                recorder.stop();
                updateTippyContent(recordButton, "Start Recording", false);
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

        // exit button functionality
        exitButton.onclick = () => {
            // stoping all audio and any recordings
            songStarted = false;
            layersCanFade = false;
            fadeToggleIcon.src = "assets/images/button_icons/fade_disabled_icon.png";
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
                loadedLayers[i].bufferSource.stop();
                loadedLayers[i].bufferSource.disconnect();
            }

            clearSelectionScreen();

            // reseting button labels and lighting
            playAllIcon.src = "assets/images/button_icons/play_all_icon.png";
            pauseIcon.src = "assets/images/button_icons/pause_icon.png";
            recordIcon.src = "assets/images/button_icons/rec_icon.png";
            switchToDark(saveButton, deleteButton);

            // resetting the value of global variables
            globalDuration = 9999;
            layerNameArray = [];

            // resetting tippy contents
            updateTippyContent(playAllButton, "Play All Layers", false);
            updateTippyContent(pauseButton, "Pause Song & Recording", false);
            updateTippyContent(recordButton, "Start Recording", false);
            updateTippyContent(fadeToggleButton, "Fade Toggle (Off)", false);

            // stopping the timer
            if (timerExists) {songTimer.stop()}
            
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
        bufferSource.loopEnd = globalDuration;
        
        // creating a gainNode and connecting it to the oscillator
        var gainNode = audioContext.createGain();
        gainNode.connect(oscillatorDestination);
        gainNode.connect(audioContext.destination);

        // connecting the audio to the gainNode
        bufferSource.connect(gainNode);

        // connecting the gain to the visualizer
        gainNode.connect(visualizer);

        // returning the buffer, gain, and index of the layer in an array for easy accessibility
        // the second to last two items in the list determine if the layer is fading in or out respectively
        loadedLayers.push(new Layer(bufferSource, gainNode, index, false, false, layerNameArray[index]))
    });
    

    // undarkening the solo buttons
    Array.from(soloButton).forEach((element) => {
        switchToBright(element);
    });

    // brightening the pause button
    switchToBright(pauseButton);

    // starting the recorder if it was queued
    if (recorderQueued) {
        updateTippyContent(recordButton, "Recording...", false);
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
            loadedLayers[i].volume.gain.value = unmute;
            layerButtons[i].dataset.title = " (Playing)";
            updateTippyContent(layerButtons[i], loadedLayers[i].name, true);
            layersPlaying.push(loadedLayers[i]);
        }

        // if neither of these are true, that must mean this layer has to start off muted
        else {loadedLayers[i].volume.gain.value = mute;}

        loadedLayers[i].bufferSource.start(audioContext.currentTime);
        if (layersCanFade) {startLayerFadeIn(loadedLayers[i]);}
    }

    playAllIcon.src = "assets/images/button_icons/stop_icon.png";

    // starting the timer
    timerExists = true;
    songTimer = new Tock({
        callback: () => {
            var currentPlayback = songTimer.msToTime(songTimer.lap()).slice(0, -4)
            timer.innerText = `${currentPlayback} / ${instanceSongLength}`
        }
    })

    songTimer.start()

    // starting the progress bar and visualizer
    if (!visActive) {startVisualizer();}
    startUpdatingBar(globalDuration, songTimer);
}