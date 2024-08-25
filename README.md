## What is Threatmixer?

Threatmixer is a webpage which will allow the user to play with and mix the various threat themes from the game Rain World. I was heavily inspired by Incredibox, a game where you take various sound elements and mash them together to make your own music. Thinking about how fun it was to expiriment with different sound combinations in Incredibox, I thought about how cool it'd be if you could mix and match the layers of a threat theme at will, sparking the idea for this project.

## Progress

Every vanilla and and downpour threat theme has now been added! Along with that, most of the program has been put into a recursive function which (hopefully) shouldn't eat a lot of memory. Because of this change, all .addEventListener() functions have been changed into onclick() functions due to strange behavior while inside of a recursive loop. For the newly added threat themes, I tried my best to sync together all of the layers as best as I could. There are some very, very minor cases of desync in some regions, but those cases might just annoy me more than it does anyone else lol. But yeah, the MVP for this website is practically finished, and it's time to move on to some decoration with the next push!

## TODO:

Descending in priority:

1. Styling and detailing
    - Audio visualizer / Song progress bar
    - General ui improvements and decoration
2. Misc. and not totally necessary stuff
    - Modded/Custom threat themes?
    - Secret combinations?
    - Auto play feature?
    - Responsive design?
    - Speed up/slow down functionality?
