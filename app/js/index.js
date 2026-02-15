import { getDomSelectors } from "./includes/domSelectors.js";
// Imported DOM selectors
const {
    formBackgroundImage,
    searchButton,
    currentSongField,
    playButton,
    pauseButton,
    nextButton,
    previousButton,
    searchPlayListButton,
    customPlayListButton,
    searchResultsContainer,
    errorMessages,
    hideAlbumCoversButton,
} = getDomSelectors();

const myAudio = new Audio();
let cachedSongs = [];
let customPlayList = [];
let currentSongNumber = 0;
let isUserViewingCustomPlayList = false;
let lastPlayedSongIndex = null;
let showAlbumCovers = true;

// Search for an artist with a button click event and print song list to page
searchButton.addEventListener("click", async () => {
    const artistNameInput = document.getElementById("artistName").value.trim(); // Trim user input
    
    if (artistNameInput === "") {
        return;
    }

    isUserViewingCustomPlayList = false;
    currentSongNumber = 0;
    document.getElementById("artistName").value = artistNameInput; // Show trimmed artist name in text field
    const result = await fetch(`php/getData.php?q=${encodeURIComponent(artistNameInput)}`);
    const apiDataReturned = await result.json();

    // If error code 400...
    if (!result.ok) {
        errorMessages.innerText = apiDataReturned.error ?? "Unknown error. Please try again.";

        return;
    }

    cachedSongs = apiDataReturned.data ?? []; 

    if (cachedSongs.length === 0) {
        return;
    }

    changeFormBackgroundToAlbumCover(cachedSongs[0].album.cover_big);

    hideAlbumCoversButton.classList.remove("hide");

    // Display album cover, album name, and song
    printSongListToPage(cachedSongs);
    highlightCurrentSong();
    setPlaylistTabState(true);
    setSearchResultsAndCustomPlayListButtonsToActive();
});

function setSearchResultsAndCustomPlayListButtonsToActive() {
    const numberOfDisabledButtons = document.getElementsByClassName("disable-tab");
    [...numberOfDisabledButtons].forEach(disabledButton => {
        disabledButton.classList.remove("disable-tab");
    });
}

// Print list of songs to page
function printSongListToPage(arrayOfSongs) {
    searchResultsContainer.innerText = "";
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < arrayOfSongs.length; i++) {
        const song = arrayOfSongs[i];
        const songContainer = document.createElement("div");
        songContainer.setAttribute("tabindex", 0);
        songContainer.classList.add("songContainer");
        let thisSongDescription;
        let thisButton;

        if (isUserViewingCustomPlayList === false) {
            // If song is already added to playlist, show the "Added" button. Otherwise, show the "Add" button.
            if (!customPlayList.some((playListSong) => playListSong.id === song.id)) {
                thisButton = constructButton("addButton", song.id);
            } else {
                thisButton = constructButton("addedButton", song.id);
            }
        } else {
            thisButton = constructButton("removeButton", song.id);
        }

        thisSongDescription = constructAlbumDescription(song.album.cover_big, i + 1, song.title, song.album.title, song.artist.name);

        songContainer.append(thisSongDescription, thisButton); // Append "Add", "Added", or "Remove" buttons to song containers
        
        fragment.append(songContainer);
    }
    searchResultsContainer.append(fragment);

    currentSongField.value = `Track ${currentSongNumber + 1}: ${arrayOfSongs[currentSongNumber].title}`; 
    highlightCurrentSong();
    myAudio.src = arrayOfSongs[currentSongNumber].preview; // set audio src to first track
    myAudio.pause(); 
    setPlayingState(false);
}

// Helper function to add album descriptions to each album block/card on the page
function constructAlbumDescription(albumImage, trackNumber, songTitle, albumTitle, artistName) {
    const descriptionContainer = document.createElement("p");
    // Album image...
    const thisAlbumImage = document.createElement("img");
    thisAlbumImage.setAttribute("src", albumImage);
    thisAlbumImage.setAttribute("alt", albumTitle);
    thisAlbumImage.classList.add("albumCover");
    // Track number...
    const thisTrackNumber = document.createElement("strong");
    thisTrackNumber.classList.add("trackNumber");
    thisTrackNumber.append(`Track: ${trackNumber}`);
    // Song title...
    const thisSongTitle = document.createElement("strong");
    thisSongTitle.classList.add("songTitle");
    thisSongTitle.append(songTitle);
    // Album title...
    const thisAlbumTitle = document.createElement("span");
    thisAlbumTitle.append(`Album: ${albumTitle}`);
    // Artist name...
    const thisArtistName = document.createElement("span");
    thisArtistName.append(`By: ${artistName}`);
    // Append all song info to parent container...
    descriptionContainer.append(thisAlbumImage, thisTrackNumber, thisSongTitle, thisAlbumTitle, thisArtistName);

    return descriptionContainer;
}

// Helper function to construct buttons ("Add to playlist", "Added", and "Removed")
function constructButton(buttonType, songId) {
    const newButton = document.createElement("button");
    if (buttonType === "addButton") {
        newButton.classList.add("addToPlayListBtn", "standardButton");
        newButton.dataset.songId = songId;
        newButton.innerText = "+ Add to playlist";
    }
    if (buttonType === "addedButton") {
        newButton.classList.add("addToPlayListBtn", "standardButton", "activeButton", "added");
        newButton.innerText = "Added";
        newButton.append(constructCheckmarkIcon());
    }
    if (buttonType === "removeButton") {
        newButton.classList.add("removeFromCustomPlayList", "standardButton");
        newButton.dataset.songId = songId;
        newButton.innerText = "Remove";
    }

    return newButton;
}

// Helper function to create checkmark icon in buttons
function constructCheckmarkIcon() {
    const spanTag = document.createElement("span");
    const checkMarkIcon = document.createElement("i");
    checkMarkIcon.classList.add("fa", "fa-check");
    spanTag.append(checkMarkIcon);

    return spanTag;
}

// Get number of songs printed to page
function numberOfSongsDisplayedOnPage() {
    const numberOfSongsDisplayed = document.getElementsByClassName("songContainer");
    
    return numberOfSongsDisplayed;
}

// Buttons for play, pause, previous, and next song...
playButton.addEventListener("click", playSong);
pauseButton.addEventListener("click", pauseSong);
nextButton.addEventListener("click", playNextSong);
previousButton.addEventListener("click", playPreviousSong);

// Automatically go to the next song when current song ends
myAudio.onended = playNextSong;

// Play song
function playSong() {
    if (!myAudio.paused) {
        return;
    }
    let numberOfSongs = numberOfSongsDisplayedOnPage();
    if (numberOfSongs.length !== 0) {
        playSongAtIndex(currentSongNumber);
        setPlayingState(true);
    }
}

// Pause song
function pauseSong() {
    let numberOfSongs = numberOfSongsDisplayedOnPage();
    if (numberOfSongs.length !== 0) {
        myAudio.pause();
        setPlayingState(false);
    }
}

// Play next song
function playNextSong() {
    let numberOfSongs = numberOfSongsDisplayedOnPage();
    if (!numberOfSongs.length) {
        return;
    }

    const playlistType = getCurrentPlaylist();
    currentSongNumber = currentSongNumber < playlistType.length - 1 ? currentSongNumber + 1 : 0;
    playSongAtIndex(currentSongNumber);
    setPlayingState(true);
}

// Play previous song
function playPreviousSong() {
    let numberOfSongs = numberOfSongsDisplayedOnPage();

    if (!numberOfSongs.length) {
        return;
    }

    const playlistType = getCurrentPlaylist();
    currentSongNumber = currentSongNumber > 0 ? currentSongNumber - 1 : playlistType.length - 1;
    playSongAtIndex(currentSongNumber);
    setPlayingState(true);
}

// Play song when user clicks an album song thumbnail
document.addEventListener("click", selectAndPlayClickedSong);
document.addEventListener("keydown", selectAndPlayClickedSong);

function selectAndPlayClickedSong(event) {
    // If songs haven't been fetched, do not continue...
    if (!cachedSongs.length && !customPlayList.length) {
        return;
    }

    // Ignore anything that isn't a song container selection
    if (!event.target.closest(".songContainer")) {
        return;
    }

    // Prevent "ghost playbacks" from firing if wrong key is pressed
    if (event.type === "keydown" && event.key !== "Enter") {
        return;
    }

    // If user is clicking "Add to playlist" or "Remove from playlist" button, don't play the song
    if (
        event.target.closest(".addToPlayListBtn") ||
        event.target.closest(".removeFromCustomPlayList")
    ) {
        return;
    }

    if (
        event.target.closest(".songContainer") &&
		(event.type === "click" || (event.type === "keydown" && event.key === "Enter"))
    ) {
        const allDisplayedSongs = document.getElementsByClassName("songContainer");
        const indexOfClickedSong = [...allDisplayedSongs].indexOf(event.target.closest(".songContainer"));
        currentSongNumber = indexOfClickedSong;
        playSongAtIndex(currentSongNumber);
        setPlayingState(true);
    }
}

// Helper function to set play/pause button styling
function setPlayingState(isPlaying) {
    playButton.classList.toggle("activeButton", isPlaying);
    pauseButton.classList.toggle("activeButton", !isPlaying);
}

// Function to set "Search results" and "Custom playlist" tab (button) styling and accessibility attributes
function setPlaylistTabState(isActive) {
    setTabAttributes(searchPlayListButton, isActive);
    setTabAttributes(customPlayListButton, !isActive);
    searchResultsContainer.setAttribute("aria-labelledby", isActive ? "viewSearchPlayListBtn" : "viewCustomPlayListBtn");
}

// Helper function for setPlaylistTabState() to specify the tab being edited
function setTabAttributes(tabName, isActive) {
    tabName.classList.toggle("activeButton", isActive);
    tabName.setAttribute("aria-selected", isActive);
    tabName.setAttribute("tabindex", isActive ? "0" : "-1");
} 

// Function to add arrow key accessibility to tabs (buttons)
function handleArrowKeys(event) {
    const leftArrowKey = "ArrowLeft";
    const rightArrowKey = "ArrowRight";

    if (event.key !== leftArrowKey && event.key !== rightArrowKey) {
        return;
    }

    event.preventDefault();

    if (event.target === searchPlayListButton && customPlayList.length > 0) {
        setPlaylistTabState(false);
        customPlayListButton.focus();
        loadPlaylist(customPlayList, "customPlaylist");
    } else if (event.target === customPlayListButton) {
        setPlaylistTabState(true);
        searchPlayListButton.focus();
        loadPlaylist(cachedSongs, "searchPlaylist");
    }
}

// Listen for arrow key presses
searchPlayListButton.addEventListener("keydown", handleArrowKeys);
customPlayListButton.addEventListener("keydown", handleArrowKeys);

// Helper function to select song, display song name, and play song
async function playSongAtIndex(currentSongNumber) {
    const playlist = getCurrentPlaylist();

    if (!playlist[currentSongNumber]) {
        return;
    }

    const isSameSong = lastPlayedSongIndex === currentSongNumber; // Returns true or false

    currentSongField.value = `Track ${currentSongNumber + 1}: ${playlist[currentSongNumber].title}`; // Show current song
    highlightCurrentSong();

    // If same song is clicked...
    if (isSameSong) {
        if (myAudio.paused) {
            try {
                await myAudio.play();
                setPlayingState(true);
                lastPlayedSongIndex = currentSongNumber;
            } catch (err) {
                if (err.name !== "AbortError") {
                    errorMessages.innerText = `An unexpected error occurred while playing the song. Please try again.`;
                }
            }
        } else {
            await myAudio.pause();
            setPlayingState(false);
        }

        return;
    }

    // If song isn't set, pause and load the next one before using the asynchronous play() function
    if (myAudio.src !== playlist[currentSongNumber].preview) {
        myAudio.pause();
        myAudio.src = playlist[currentSongNumber].preview; // Set audio src
        myAudio.load();
    }

    try {
        await myAudio.play();
        setPlayingState(true);
        lastPlayedSongIndex = currentSongNumber;
    } catch (err) {
        if (err.name !== "AbortError") {
            errorMessages.innerText = `An unexpected error occurred while playing the song. Please try again.`;
        }
    }
    
    changeFormBackgroundToAlbumCover(playlist[currentSongNumber].album.cover_big);
}

// Helper function to check current playlist
function getCurrentPlaylist() {
    return isUserViewingCustomPlayList ? customPlayList : cachedSongs;
}

// Change form background to album cover for current song that is playing
function changeFormBackgroundToAlbumCover(thisAlbumCover) {
    formBackgroundImage.style.backgroundImage = `url("${thisAlbumCover}")`;
    formBackgroundImage.style.backgroundColor = "#6b6b6b";
}

// Adding songs to a custom playlist
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("added")) {
        return;
    }; 
	
    if (event.target.classList.contains("addToPlayListBtn")) {
        const idOfSongAdded = Number(event.target.dataset.songId); // Gets id from data attribute

        // Push selected song to custom playlist array if song hasn't been added already
        if (!customPlayList.some((thisSong) => thisSong.id === idOfSongAdded)) {
            const songToAdd = cachedSongs.find((song) => song.id === idOfSongAdded);
            if (songToAdd) {
                customPlayList.push(songToAdd);
            }
        }

        event.target.innerText = `Added`;
        event.target.classList.add("activeButton");
        event.target.append(constructCheckmarkIcon());
    }
});

// Removing songs from a custom playlist
document.addEventListener("click", (event) => {
    if (event.target.classList.contains("removeFromCustomPlayList")) {
        const idOfSongRemoved = Number(event.target.dataset.songId); // Gets id from data attribute

        // Check if song to delete exists in customPlayList
        if (!customPlayList.some((thisSong) => thisSong.id === idOfSongRemoved)) {
            return;
        }
        const songToRemove = customPlayList.find((song) => song.id === idOfSongRemoved);
        customPlayList = customPlayList.filter((song) => song.id !== songToRemove.id);

        customPlayList.length > 0 // If more than one song in custom playlist...
            ? loadPlaylist(customPlayList, "customPlaylist") // Print updated custom playlist array to page
            : loadPlaylist(cachedSongs, "searchPlaylist"); // Else print search playlist array to page
    }
});

// Show search songs
searchPlayListButton.addEventListener("click", (event) => {
    if (event.target.classList.contains("activeButton")) {
        return;
    }

    loadPlaylist(cachedSongs, "searchPlaylist");
});

// Show custom playlist songs
customPlayListButton.addEventListener("click", (event) => {
    if (event.target.classList.contains("activeButton")) {
        return;
    }

    loadPlaylist(customPlayList, "customPlaylist");
});

// Helper function to load the selected playlist (Search result playlist or user's custom playlist)
function loadPlaylist(songs, playlistType) {
    if (!songs.length) {
        return;
    }

    if (playlistType === "searchPlaylist") {
        setPlaylistTabState(true);
        isUserViewingCustomPlayList = false;
    } else {
        setPlaylistTabState(false);
        isUserViewingCustomPlayList = true;
    }

    lastPlayedSongIndex = null;
    currentSongNumber = 0;
    myAudio.pause();
    setPlayingState(false);
    printSongListToPage(songs);
    changeFormBackgroundToAlbumCover(songs[0].album.cover_big);
    highlightCurrentSong();
}

// Function to highlight current song
function highlightCurrentSong() {
    let listOfSongs = numberOfSongsDisplayedOnPage();

    [...listOfSongs].forEach((song) => {
        song.classList.remove("activeSongContainer");
    });
	
    if (listOfSongs[currentSongNumber]) {
        listOfSongs[currentSongNumber].classList.add("activeSongContainer");
    }
}

// Helper function to build "show/hide album covers" buttons for toggle
function buildShowHideAlbumCoversButtons(showOrHideAlbumCovers) {
    const buttonState = {
        buttonIcon: showOrHideAlbumCovers ? "bi-eye-slash-fill" : "bi-eye-fill",
        buttonText: showOrHideAlbumCovers ? "Hide album covers" : "Show album covers",
    };

    const hideAlbumCoversButtonFragment = document.createDocumentFragment();
    const slashEyeIcon = document.createElement("i");
    slashEyeIcon.classList.add("bi", buttonState.buttonIcon, "eye-icon");
    const hideAlbumCoversButtonText = document.createElement("span");
    hideAlbumCoversButtonText.innerText = buttonState.buttonText;
    hideAlbumCoversButtonFragment.append(slashEyeIcon, hideAlbumCoversButtonText);

    return hideAlbumCoversButtonFragment;
}

// Function to toggle show/hide album covers
hideAlbumCoversButton.addEventListener("click", () => {
    showAlbumCovers = !showAlbumCovers
    hideAlbumCoversButton.replaceChildren(buildShowHideAlbumCoversButtons(showAlbumCovers));
    searchResultsContainer.classList.toggle("hide-album-covers");
});