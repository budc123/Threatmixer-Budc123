## What is Threatmixer?

Threatmixer is a webpage which will allow the user to play with and mix the various threat themes from the game Rain World. I was heavily inspired by Incredibox, a game where you take various sound elements and mash them together to make your own music. Thinking about how fun it was to expiriment with different sound combinations in Incredibox, I thought about how cool it'd be if you could mix and match the layers of a threat theme at will, sparking the idea for this project.

## Progress

With this commit, instead of straight up using the audio elements to control the layers, I've converted those audio elements into AudioBufferSourceNodes. This was so that there would be less popping and crackling noises when loading the audio, as well as more advanced controls over the audio's behavior and attributes. I didn't really add anything mechanically for the user to play with, but I did add just a bit of brightness to make up for the lack of ui. Oh yeah and I also changed the name because this is really going to be more of a fan work of Rain World than Incredibox, and I don't want to have "ibox" in the name if nothing from that game is going to be featured in this webpage. This a working title, and will be changed once I can come up with something better.

## TODO:

Descending in priority:

1. Fix up the soloing
2. Individual layer and master volume settings
3. Pre-picking layers to begin with before the song begins
4. Timing feature, to only allow layers to be added on-beat
5. Recording feature
6. Exporting recordings
7. Other region threat themes
8. Styling and detailing
    - Audio visualizer
    - Song progress bar
    - General ui improvements
9. Misc. and not totally necessary stuff
    - Modded region threat themes?
    - Secret combinations?
    - Auto play feature?
    - Responsive design?
    - Speed up/slow down functionality?
