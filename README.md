# What is Threatmixer?

Threatmixer is a webpage which will allow the user to play with and mix the various threat themes from the game Rain World. I was heavily inspired by Incredibox, a game where you take various sound elements and mash them together to make your own music. Thinking about how fun it was to expiriment with different sound combinations in Incredibox, I thought about how cool it'd be if you could mix and match the layers of a threat theme at will, sparking the idea for this project.

# Tutorial

When you first open the page, you'll be greeted by the home screen, where you can learn more about this project before getting started. When you click the "BEGIN!" button, you'll be brought to the region selection screen, where you can begin choosing which threat theme you want to play with.

![Selection Screen](assets/images/misc/example_1.png)

All regions are organized alphabetically. Navigate between slides using the left and right carrot buttons. To switch between different groups of regions (i.e. vanilla and modded regions), click the buttons to the left side of the large box containing the regions.

## 1. Music screen

Let's say you chose Outskirts. You'll then be brought to this region's "music screen" as I'll be calling it.

![SU Music Screen](assets/images/misc/example_2.png)

In the top left, you'll find the exit button, which will bring you back to the selection screen whenever you're ready. Everything under the title of the region will be what you use to create your mixes. You'll also find that, when you begin playing music, a visualizer will appear at the bottom of the screen and move in the background. Its visibility is toggleable via a button that I will cover later.

## 2. Progress Bar

The progress bar represents the duration of the threat theme. It will automatically begin once you start the song, and reset when the song loops. Use it to get a grasp of when certain layers of the threat theme will begin playing to create stronger mixes!

![Progress Bar](assets/images/misc/example_3.png)

## 3. Layer Buttons

This row of buttons represents each individual layer that goes into your region's threat theme. Each button has an icon to help you understand what sound each button is representing. Beneath each large button (also called a layer button), is a smaller button with an icon representing headphones. These are called solo buttons. 

![Layer Buttons](assets/images/misc/example_4.png)

To simply go over what clicking each button will do: clicking a layer button will either mute or unmute the sound that it is representing (**after the start button has been clicked!**). Hitting a solo button will solo out whichever layer you want to temporarily play by itself. Clicking the solo button again will un-solo the layer that you'd chosen and unmute any other layers that were playing beforehand. 
For instance, if I have the kick (scug drum), bass (guitar), and arps (piano) playing. When I hit the solo button under the arps button, both the kick and bass layers are muted so that only the arps are audible. Clicking that same solo button again will unmute the kick and the bass.

## 4. General Control Buttons

Below the layer buttons, you'll find another row of buttons which provide you with greater control over your mix. From the left to right, the first three buttons control how the song plays, the next three allow you to record your mixes, and the final button is a simple toggle for the visualizer that runs in the background.

![Layer Buttons](assets/images/misc/example_5.png)

Here's how each button is used:

### 1. Start Button (Glass Play Icon)

Before the song begins, you have the option to choose which layers you want to start off with. In order for this button to work, you must have at least 1 layer pre-selected. This is done by clicking on the layer buttons that you want to pre-select, causing them to enlargen to signify that they're active. Once you've chosen all of your layers, you can then click the start button to begin the threat theme. The layers that you've pre-picked will now be audible. Again, **you must click the start button to begin the song before anything can play!**

### 2. Play All Button (Stripped Play Icon)

Alternatively to the start button, you can also click the play all button to begin the song with every layer active at once. If the threat theme is active and is currently playing, this button will change icons and become a stop or "end all" button. When clicked at any point, the song will cease and completely reset. The button will then change back to its "play all" state, and you can then either press it again or pre-select layers and use the start button.

### 3. Pause/Resume Button (Pause/Resume Icon)

Clicking the pause button will halt the song without ending it. The progress bar and visualizer will cease movement as well. This also extends to the recording feature that you may have active, temporarily stopping it without effecting the resulting mp3 file. Although the song is paused, you can still mute, unmute, and solo layer buttons as you please (use this to your advantage to really get creative with your mixes!). After pausing the song, the pause button will become a resume button and, as you could guess, will resume the song once clicked.

### 4. Start Recording Button (Mic Icon)

Pressing this button will activate this webpage's recorder, which allows you to record your mixes and then export them as an mp3 file. The recorder only picks up audio made by the page and no other audio sources; so not your microphone or external tabs/programs making noise.

Here's an example of something you can make with it:
![Audio](assets/recorder_samples/OE_recorder_sample.mp3)

When the recorder is active, this button's icon will gain an ellipsis next to the microphone to show that recording is in progress. If you press this button before the song starts, the button icon will gain a large circle next to the microphone and the recorder will then be queued, meaning it will activate as soon as the song starts.

### 5. Save Recording Button (Mic + Floppy Disk Icon)

Pressing this button will transfer whatever the recorder picked up into an exprotable mp3 file. You'll be prompted to enter the name of your file before its automatically downloaded onto your computer. This file can then be used and shared (hopefully) wherever you please.

### 6. Delete Recording Button (Mic + Trash Bin Icon)

When pressed, the recording that's currently active will be discarded. A new recording can then begin afterwards, given there's no other recordings currently running. This button will also cancle a queued recording if the song hasn't started yet.

### 7. Visualizer Toggle (Canvas w/ Waves Icon)

Lastly, the visualizer toggle can turn the visualizer moving in the background on or off. When on, the button icon will be how it is normally, representing audio waves enclosed in a canvas. When off, the button icon will be crossed out to signify the visualizer not being active.

That wraps up about everything that you need to know to use this webpage to its fullest. You have the tools to mix and match the layers of your favorite threat themes as you please, so I hope you enjoy using Threatmixer!

# Developement progress

Ok so, it's been quite a while since I've last made some serious progress on this page, mainly due to things in my life getting in the way, but also because of how tedious working with the audio files is. One weekend though, I sucked it up, sat down, and got this shit done. Now, the looping isn't as bad as it once was! Still not perfect, but I'll try to make them even better someday, now actually knowing how to. Getting the audio to loop smoothely was certainly one of the largest hurdles of this project, so now that I've gotten over that, we're in the home stretch. There's still a handful of things that need to be done, but I can confidently say that it will all be finished soon! For real this time! Next steps are getting feedback and developing the home screen. I'll aim to get the next push out before the end of the year.

# TODO:

1. Finishing touches
    - Home screen
2. Extra / Post-release stuff
    - Modded/Custom threat themes
    - Icon revamps