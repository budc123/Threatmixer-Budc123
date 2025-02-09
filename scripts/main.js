/*
This is the main sequencing of the program. Once the begin button has been clicked on the home screen,
we bring the user to the selection screen and wait for a region to be chosen before taking the user
to the music screen.
*/

// we utelize recursion to go back and forth between the selection screen and the music screen
function runProgram() {
    // fetching the json and getting the data we need
    fetch("regions.json").then((data) => {
        return data.json();
    })
    .then(async (regionData) => {
        // once that data has been obtained,
        await setUpSelectionScreen(regionData);
    })
    .then(() => {
        // once the user has selected a region, 
        setUpMusicScreen();
    });
}