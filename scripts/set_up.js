/*
In this file, all of our global variables are declared and certain processes,
like the visualizer and the recorder, are set up. 
*/

// first figuring out if the user is using a mobile device
let deviceName = navigator.userAgent,
    mobileNames = /android|iphone|kindle|ipad/i,
    isMobileDevice = mobileNames.test(deviceName);

// element refrences
const layerButtons = document.getElementsByClassName("layer_button"),
    soloButton = document.getElementsByClassName("solo_button"),
    otherButtons = document.getElementsByClassName("other_buttons"),
    pauseButton = document.getElementById("pause_button"),
    pauseIcon = pauseButton.querySelector("img"),
    playAllButton = document.getElementById("play_button"),
    playAllIcon = playAllButton.querySelector("img"),
    startButton = document.getElementById("start_button"),
    aboutButton = document.getElementById("about_button"),
    helpButton = document.getElementById("help_button"),
    creditsButton = document.getElementById("credits_button"),
    feedbackButton = document.getElementById("feedback_button"),
    recordButton = document.getElementById("record_button"),
    recordIcon = recordButton.querySelector("img"),
    saveButton = document.getElementById("save_button"),
    deleteButton = document.getElementById("delete_button"),
    beginButton = document.getElementById("begin_button"),
    exitButton = document.getElementById("exit_button"),
    visButton = document.getElementById("visualizer_toggle"),
    fadeToggleButton = document.getElementById("fade_toggle"),
    fadeToggleIcon = document.getElementById("fade_toggle_icon"),
    visIcon = visButton.querySelector("img"),
    musicScreen = document.getElementById("music_screen"),
    loadingScreen = document.getElementById("loading_screen"),
    homeScreen = document.getElementById("home_screen"),
    screenCover = document.getElementById("screen_cover"),
    regionButton = document.getElementsByClassName("region_button"),
    selectionScreen = document.getElementById("selection_screen"),
    selectionHeader = document.getElementById("selection_header"),
    baseButton = document.getElementById("base_button"),
    moddedButton = document.getElementById("modded_button"),
    mscButton = document.getElementById("downpour_button"),
    watchButton = document.getElementById("watcher_button"),
    customButton = document.getElementById("custom_button"),
    baseCarousel = document.getElementById("base_carousel"),
    modCarousel = document.getElementById("mod_carousel"),
    mscCarousel = document.getElementById("downpour_carousel"),
    watchCarousel = document.getElementById("watcher_carousel"),
    customCarousel = document.getElementById("custom_carousel"),
    carrotButtons = document.getElementsByClassName("carrot_buttons"),
    regionButtonContainer = document.getElementsByClassName("region_button_container"),
    slideNum = document.getElementById("slide_number"),
    selectionBackButton = document.getElementById("selection_back_button"),
    previewToggleButton = document.getElementById("preview_toggle_button"),
    previewToggleIcon = document.getElementById("preview_toggle_icon"),
    regionTitle = document.getElementById("region_name"),
    layerButtonContainer = document.getElementById("layer_button_container"),
    progressBar = document.getElementById("progress_bar"),
    timer = document.getElementById("timer"),
    canvas = document.getElementById("canvas"),
    name2 = document.getElementById("name2"),
    bird = document.getElementById("bird"),
    menuMusicToggleButton = document.getElementById("menu_music_toggle_button"),
    menuMusicToggleIcon = document.getElementById("menu_music_toggle_icon"),
    discordButton = document.getElementById("discord_button"),
    githubButton = document.getElementById("github_button"),
    loadingText = document.getElementById("loading_text"),
    loadingDetails = document.getElementById("loading_details"),
    loadingErrorResponse = document.getElementById("loading_error_response");

// hiding these screens initially for cleaner page startup
loadingScreen.style.display = "none";
musicScreen.style.display = "none";
selectionScreen.display = "none";

// also setting carousel visibility
modCarousel.style.display = "none";
mscCarousel.style.display = "none";
watchCarousel.style.display = "none";
customCarousel.style.display = "none";

// grabbing the audio context and creating an oscillator with it
let audioContext = new (window.AudioContext || window.webkitAudioContext);
const oscillator = audioContext.createOscillator();
oscillator.type = "sine";
oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
const oscillatorDestination = audioContext.createMediaStreamDestination();
oscillator.connect(oscillatorDestination);

// creating the recorder
let mime;
if (MediaRecorder.isTypeSupported('audio/ogg;codecs=opus')) {
    mime = {mimeType: 'audio/ogg; odecs=opus'};
}
else if (MediaRecorder.isTypeSupported("audio/webm; codecs=opus")) {
    mime = {mimeType: "audio/webm; codecs=opus"}
} 
else {
    mime = {mimeType: ''};
}

const recorder = new MediaRecorder(oscillatorDestination.stream, mime);

// saving what the recorder picks up
recorder.ondataavailable = (noise) => {recordedData.push(noise.data);}

// turning the recorder's data into a file
recorder.onstop = () => {
    if (eraseRecording) {
        recordedData = [];
        eraseRecording = false;
    }

    else {
        // pausing the timer and the song
        songTimer.pause()
        pauseButton.click()

        // creating the file
        var audioFile = new Blob(recordedData, {"type": recorder.mimeType}),// "audio/mp3; codecs=opus"}),
            fileUrl = URL.createObjectURL(audioFile);
            
        // sending the file to the user's computer
        var link = document.createElement("a");
        link.href = fileUrl;
        fileName = prompt(`Please enter a name for this recording: 
(NOTE: If you are using a web browser that isn't Firefox, then the resulting file may not have any metadata. See the HELP section on the home screen for more info.)`);
        link.download = fileName + ".ogg";
        link.style.display = "none";
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(fileUrl);

        // clearing the recorded data
        recordedData = [];

        // resuming the timer and the song
        songTimer.pause()
        pauseButton.click()
    }
}

// creating the visualizer
const visualizer = audioContext.createAnalyser();
visualizer.fftSize = 512;
const bufferLength = visualizer.frequencyBinCount;
const dataArray = new Uint8Array(bufferLength);

/* 
Thank you Haizlbliek for the code to improve
how the visualizer looked. I would have just merged
your changes to main but github wasn't letting me
for some reason, so this'll have to do lol
*/
const barWidth = 3;
canvas.width = barWidth * bufferLength;
const canvasContext = canvas.getContext("2d");

// making sure the canvas isn't blurry
canvasContext.imageSmoothingEnabled = false;

// declaring our global variables
let layerSoloed, songStarted, eraseRecording, loadedLayers, 
    layersPlaying, startingLayers, recordedData, regionThreatLayers,
    songDuration, barUpdateInterval, hoverCheck, animation, 
    currentPreviewPlaying, fadeCheck, instanceSongLength,
    menuMusicTimeout,
    farShoreSelected = false,
    ETTWallDaySelected = false,
    ETTWallNightSelected = false,
    menuMusicPlaying = false,
    clickOnTimeout = false,
    regionsAddedToSelector = false,
    recorderQueued = false,
    visActive = false,
    programStarted = false,
    regionButtonClicked = false,
    isFadingOut = false,
    canPlay = false,
    loadingRegion = false,
    previewsOn = true,
    canBounce = true,
    layersCanFade = false,
    timerExists = false,
    preparingTip = false,
    menuMusicEnabled = false,
    divIndex = -1,
    baseSlideNum = 1,
    baseSlideNumMax = 0,
    storedBaseSlide = 0, 
    modSlideNum = 1,
    modSlideNumMax = 0,
    storedModSlide = 0,
    mscSlideNum = 1,
    mscSlideNumMax = 0,
    storedMscSlide = 0,
    watchSlideNum = 1,
    watchSlideNumMax = 0,
    storedWatchSlide = 0,
    customSlideNum = 1,
    customSlideNumMax = 0,
    storedCustomSlide = 0,
    houseCount = 0,
    globalDuration = 9999999,
    selectionState = "base",
    pendingFadeIns = [],
    pendingFadeOuts = [],
    layerNameArray = [];

const brightened = "brightness(100%)",
    dimmed = "brightness(50%)",
    unmute = 1,
    mute = 0,
    soloIcon1 = "assets/images/button_icons/solo_icon_1.png",
    soloIcon2 = "assets/images/button_icons/solo_icon_2.png";

// markdown file handling
let MDArray = ["README.md", "TUTORIAL.md", "LICENSE.md"];
let MDArrayIndex = 0;

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

// initializing layer constructor
class Layer {
    constructor(bufferSource, gainNode, index, isFadingIn, isFadingOut, name) {
        this.bufferSource = bufferSource;
        this.volume = gainNode;
        this.index = index,
        this.isFadingIn = isFadingIn;
        this.isFadingOut = isFadingOut;
        this.name = name;
    }
}

/*
NON-DYNAMIC ONCLICKS
*/

// changing displayed information based on which region gorup was clicked
baseButton.onclick = () => {
    selectionState = "base";
    selectionHeader.innerText = "Vanilla Regions";
    baseSlideNum = 1;
    slideNum.innerText = `${baseSlideNum}.`
    switchToDark(carrotButtons[0]);
    switchToBright(carrotButtons[1]);
    baseButton.classList.add("extend_button")
    moddedButton.classList.remove("extend_button")
    mscButton.classList.remove("extend_button")
    watchButton.classList.remove("extend_button")
    customButton.classList.remove("extend_button")
    modCarousel.style.display = "none";
    mscCarousel.style.display = "none";
    watchCarousel.style.display = "none";
    customCarousel.style.display = "none";
    baseCarousel.style.display = "flex";
    baseCarousel.scrollLeft = 0;
}

moddedButton.onclick = () => {
    selectionState = "mods";
    selectionHeader.innerText = "Modded Regions";
    modSlideNum = 1;
    slideNum.innerText = `${modSlideNum}.`
    switchToDark(carrotButtons[0]);
    switchToBright(carrotButtons[1]);
    moddedButton.classList.add("extend_button")
    mscButton.classList.remove("extend_button")
    baseButton.classList.remove("extend_button")
    watchButton.classList.remove("extend_button")
    customButton.classList.remove("extend_button")
    baseCarousel.style.display = "none";
    mscCarousel.style.display = "none";
    watchCarousel.style.display = "none";
    customCarousel.style.display = "none";
    modCarousel.style.display = "flex";
    modCarousel.scrollLeft = 0;
}

mscButton.onclick = () => {
    selectionState = "msc";
    selectionHeader.innerText = "Downpour Regions";
    mscSlideNum = 1;
    slideNum.innerText = `${mscSlideNum}.`
    switchToDark(carrotButtons[0]);
    switchToDark(carrotButtons[1]);
    mscButton.classList.add("extend_button")
    moddedButton.classList.remove("extend_button")
    baseButton.classList.remove("extend_button")
    watchButton.classList.remove("extend_button")
    customButton.classList.remove("extend_button")
    baseCarousel.style.display = "none";
    modCarousel.style.display = "none";
    watchCarousel.style.display = "none";
    customCarousel.style.display = "none";
    mscCarousel.style.display = "flex";
    mscCarousel.scrollLeft = 0;
}

watchButton.onclick = () => {
    selectionState = "watch";
    selectionHeader.innerText = "Watcher Regions";
    watchSlideNum = 1;
    slideNum.innerText = `${watchSlideNum}.`
    switchToDark(carrotButtons[0]);
    switchToBright(carrotButtons[1]);
    watchButton.classList.add("extend_button")
    mscButton.classList.remove("extend_button")
    baseButton.classList.remove("extend_button")
    moddedButton.classList.remove("extend_button")
    customButton.classList.remove("extend_button")
    baseCarousel.style.display = "none";
    mscCarousel.style.display = "none";
    modCarousel.style.display = "none";
    customCarousel.style.display = "none";
    watchCarousel.style.display = "flex";
    watchCarousel.scrollLeft = 0;
}

customButton.onclick = () => {
    selectionState = "custom";
    selectionHeader.innerText = "Extra Threat Themes";
    customSlideNum = 1;
    slideNum.innerText = `${customSlideNum}.`
    switchToDark(carrotButtons[0]);
    switchToBright(carrotButtons[1]);
    customButton.classList.add("extend_button")
    mscButton.classList.remove("extend_button")
    baseButton.classList.remove("extend_button")
    moddedButton.classList.remove("extend_button")
    watchButton.classList.remove("extend_button")
    baseCarousel.style.display = "none";
    mscCarousel.style.display = "none";
    modCarousel.style.display = "none";
    watchCarousel.style.display = "none";
    customCarousel.style.display = "flex";
    customCarousel.scrollLeft = 0;
}

selectionBackButton.onclick = () => {
    showScreen(homeScreen)
    hideScreen(selectionScreen)
    clearSelectionScreen()
    baseCarousel.scrollLeft = 0;
    modCarousel.scrollLeft = 0;
    mscCarousel.scrollLeft = 0;
    watchCarousel.scrollLeft = 0;
    customCarousel.scrollLeft = 0;
    baseSlideNum = 1;
    modSlideNum = 1;
    mscSlideNum = 1;
    watchSlideNum = 1;
    customSlideNum = 1;
    slideNum.innerText = 1;
    switchToBright(carrotButtons[1]);
    switchToDark(carrotButtons[0]);

    // restarting the menu music check
    menuMusicCheck = setInterval(() => {
        if (homeScreen.style.height == "100%" && !menuMusicPlaying && menuMusicEnabled) {
            menuMusicPlaying = true;
            menuMusic.volume(0.3);
            menuMusicTimeout = setTimeout(() => {menuMusic.play()}, 2000);
        }
    }, 1000)
}

previewToggleButton.onclick = () => {
    previewsOn = !previewsOn

    if (!previewsOn) {
        previewToggleIcon.src = "assets/images/button_icons/preview_disabled_icon.png";
        updateTippyContent(previewToggleButton, "Preview Toggle (Off)", false);
    }
    else {
        previewToggleIcon.src = "assets/images/button_icons/preview_enabled_icon.png";
        updateTippyContent(previewToggleButton, "Preview Toggle (On)", false);
    }
}

menuMusicToggleButton.onclick = () => {
    menuMusicEnabled = !menuMusicEnabled

    if (!menuMusicEnabled) {
        if (menuMusicPlaying) {menuMusic.stop()}
        clearTimeout(menuMusicTimeout);
        menuMusicToggleIcon.src = "assets/images/button_icons/menu_music_disabled_icon.png";
        updateTippyContent(menuMusicToggleButton, "Menu Music Toggle (Off)", false);
    }
    else {
        menuMusic.play()
        menuMusicToggleIcon.src = "assets/images/button_icons/menu_music_enabled_icon.png";
        updateTippyContent(menuMusicToggleButton, "Menu Music Toggle (On)", false);
    }
}

fadeToggleButton.onclick = () => {
    layersCanFade = !layersCanFade

    if (!layersCanFade) {
        fadeToggleIcon.src = "assets/images/button_icons/fade_disabled_icon.png";
        updateTippyContent(fadeToggleButton, "Fade Toggle (Off)", false);
    }
    else {
        fadeToggleIcon.src = "assets/images/button_icons/fade_enabled_icon.png";
        updateTippyContent(fadeToggleButton, "Fade Toggle (On)", false);
    }
}

visButton.onclick = () => {
    canvas.classList.toggle("hide_canvas")

    if (canvas.classList.contains("hide_canvas")) {
        visIcon.src = "assets/images/button_icons/vis_disabled_icon.png";
        updateTippyContent(visButton, "Visualizer Toggle (Off)", false);
    }
    else {
        visIcon.src = "assets/images/button_icons/vis_enabled_icon.png";
        updateTippyContent(visButton, "Visualizer Toggle (On)", false);
    }
}

beginButton.onclick = () => {
    hideScreen(homeScreen, selectionScreen);
    loadingText.innerText = "Preparing selection screen...";
    showScreen(loadingScreen);
    storedBaseSlide = 0;
    storedModSlide = 0;
    storedMscSlide = 0;
    storedWatchSlide = 0;
    storedCustomSlide = 0;
    if (menuMusicPlaying && menuMusicEnabled) {menuMusic.fade(menuMusic.volume(), 0, 3000);}
    clearInterval(menuMusicCheck);
    clearTimeout(menuMusicTimeout);
    runProgram();
}

feedbackButton.onclick = () => {
    var link = document.createElement("a");
    link.href = "https://forms.gle/R7q3uP9jSBQfEmuF8";
    link.target = "blank_";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

discordButton.onclick = () => {
    var link = document.createElement("a");
    link.href = "https://discord.gg/BCU2UbMRBc";
    link.target = "blank_";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

githubButton.onclick = () => {
    var link = document.createElement("a");
    link.href = "https://github.com/Rotwall72/Threatmixer";
    link.target = "blank_";
    link.style.display = "none";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

screenCover.addEventListener("click", () => {screenCover.style.display = "none";}) 

// button tips
Array.from(otherButtons).forEach((button) => {createTippy(button, button.dataset.title, "#ffffff")});
createTippy(previewToggleButton, previewToggleButton.dataset.title, "#dadbdd");
createTippy(menuMusicToggleButton, menuMusicToggleButton.dataset.title, "#dadbdd");
createTippy(discordButton, discordButton.dataset.title, "#5865f2");
createTippy(githubButton, githubButton.dataset.title, "#f0f6fc");

// menu music handling
let menuMusic = new Howl({
    src: "assets/music/misc/menu_music.mp3",
    loop: true,
    onplay: () => {menuMusicPlaying = true;},
    onstop: () => {menuMusicPlaying = false;}
});

menuMusic.on("volume", () => {if (menuMusic.volume() == 0) {menuMusic.stop()}})

// checking if the menu music can be played
let menuMusicCheck = setInterval(() => {
    if (homeScreen.style.height == "100%" && !menuMusicPlaying && menuMusicEnabled) {
        menuMusicPlaying = true;
        menuMusic.volume(0.3);
        menuMusicTimeout = setTimeout(() => {menuMusic.play()}, 2000);
    }
    }, 1000)

// setting css values
discordButton.style.setProperty("--border-color", "#5865f2");
discordButton.style.setProperty("--glow-color", "#5865f299");
discordButton.style.setProperty("--left-distance", "1.1vw");
githubButton.style.setProperty("--border-color", "#f0f6fc");
githubButton.style.setProperty("--glow-color", "#f0f6fc99");
githubButton.style.setProperty("--left-distance", "6.5vw");

// hiding all other screens and showing the home screen first
hideScreen(selectionScreen, musicScreen, loadingScreen);
showScreen(homeScreen);

// unhiding the other screens once they've been flattened
setTimeout(() => {
    loadingScreen.style.display = "flex";
    musicScreen.style.display = "flex";
    selectionScreen.style.display = "flex";
}, 300);

/* EASTER EGG 3*/
name2.onclick = () => {
    if (canBounce) {
        bird.style.display = "block";
        bird.style.animation = "bounce 1s ease alternate 2";
        var squeak = new Audio("assets/music/music_snippets/squeak.wav")
        squeak.play()
        canBounce = false;

        setTimeout(() => {
            bird.style.display = "none";
            bird.style.animation = "";
            canBounce = true;
        }, 2000)
    }
}