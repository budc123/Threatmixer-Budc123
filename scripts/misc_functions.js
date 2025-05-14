/*
Here, miscellaneous functions which are used throughout the program can be found.
*/

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
function startUpdatingBar(globalDuration, songTimer) {
    // storing the time at which the audio started
    var startTime = audioContext.currentTime;

    barUpdateInterval = setInterval(() => {
        // storing the amount of time that has passed since starting
        // this is a way of getting the current time of the audioBuffers since you can't just use .currentTime
        var ellapsedTime = audioContext.currentTime - startTime;
        var duration = globalDuration;
        var progressPercent = (ellapsedTime / duration) * 100;

        progressBar.value = progressPercent;

        // resetting the progress bar if it gets full
        if (progressBar.value == 100) {
            progressBar.value = 0;
            startTime = audioContext.currentTime

            // also reseting the timer
            //songTimer.reset()
            songTimer.stop()
            songTimer.start()
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
    mscCarousel.innerHTML = "";
    watchCarousel.innerHTML = "";
    document.title = "Threatmixer";
    regionButtonClicked = false;
    divIndex = -1;
    baseSlideNumMax = 0;
    modSlideNumMax = 0;
    mscSlideNumMax = 0;
    watchSlideNumMax = 0;
}

function startLayerFadeIn(layer) {
    if (audioContext.state == "suspended" && songPaused) {
        pendingFadeIns.push(layer)
        return 0;
    }

    layer.isFadingIn = true;
    layer.volume.gain.value = mute;

    if (layersPlaying.includes(layer)) {
        var fadeIn = setInterval(() => {
            if (layer.volume.gain.value < 1 && !layer.isFadingOut) {
                // only continuing the fade in if the song isn't paused 
                if (audioContext.state != "suspended") {layer.volume.gain.value += 0.01;}
            }
            else {
                clearInterval(fadeIn);
                layer.isFadingIn = false;
                layer.volume.gain.value = unmute;
            }
        }, 30);
    }
    else {layer.isFadingIn = false;}
}

function startLayerFadeOut(layer, shouldEndLayer) {
    if (audioContext.state == "suspended" && songPaused) {
        pendingFadeOuts.push(layer)
        return 0;
    }
    
    layer.isFadingOut = true;
    
    var fadeOut = setInterval(() => {
        if (layer.volume.gain.value > 0 && !layer.isFadingIn) {
            // only continuing the fade out if the song isn't paused 
            if (audioContext.state != "suspended") {layer.volume.gain.value -= 0.01;}
        }
        else {
            clearInterval(fadeOut);
            layer.isFadingOut = false;
            if (shouldEndLayer) {
                layer.bufferSource.stop();
                layer.bufferSource.disconnect();
            }
            else {
                layer.volume.gain.value = mute;
            }
        }
    }, 30);
}

// tippys
function createTippy(element, theme, content) {
    tippy(element, {
        theme: theme,
        content: content,
        trigger: "mouseenter",
        arrow: false,
        followCursor: true,
        hideOnClick: false,
        delay: [1300, 0]
    });
}

function updateTippyContent(element, content, isLayerButton) {
    var buttonTip = element._tippy
    if (isLayerButton) {buttonTip.setContent(content + element.dataset.title)}
    else {buttonTip.setContent(content)}
}