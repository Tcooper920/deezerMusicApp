import { getDomSelectors } from "./includes/domSelectors.js";
// Imported DOM selectors
const {
    formBackgroundImage,
    searchButton,
    currentSongField,
    currentSongContainer,
    playButton,
    pauseButton,
    nextButton,
    previousButton,
    searchPlayListButton,
    customPlayListButton,
    searchResultsContainer,
} = getDomSelectors();

const myAudio = new Audio();
let cachedSongs = [];
let customPlayList = [];
let currentSongNumber = 0;
let isUserViewingCustomPlayList = false;

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
    cachedSongs = apiDataReturned.data ?? []; // store locally

    if (cachedSongs.length === 0) {
        return;
    }
	
    changeFormBackgroundToAlbumCover(cachedSongs[0].album.cover_big);

    // Display album cover, album name, and song
    printSongListToPage(cachedSongs);
    highlightCurrentSong();
    setPlaylistButtonState(true);
});

// Print list of songs to page
function printSongListToPage(arrayOfSongs) {
    searchResultsContainer.innerText = "";

    for (let i = 0; i < arrayOfSongs.length; i++) {
        const song = arrayOfSongs[i];
        const songContainer = document.createElement("DIV");
        songContainer.setAttribute("tabindex", 0);
        songContainer.classList.add("songContainer");
        const albumImage = `<img class="albumCover" src="${song.album.cover_big}"/>`;
        let addOrAddedToPlayListButton = "";

        if (isUserViewingCustomPlayList === false) {
            // If song is already added to playlist, show the checkmark. Otherwise, show the standard button.
            if (!customPlayList.some((playListSong) => playListSong.id === song.id)) {
                addOrAddedToPlayListButton = `
				<button class="addToPlayListBtn standardButton" data-song-id="${song.id}">+ Add to playlist</button>`;
            } else {
                addOrAddedToPlayListButton = `
				<button class="addToPlayListBtn standardButton activeButton added">Added<span><i class="fa fa-check"></i></span></button>`;
            }
        } else {
			  addOrAddedToPlayListButton = `
			  <button class="removeFromCustomPlayList standardButton" data-song-id="${song.id}">Remove</button>`;
        }

        songContainer.innerHTML = `
			${albumImage}
			<p>
				<strong class='trackNumber'>Track: ${i + 1}</strong><br>
				<strong class='songTitle'>${song.title}</strong><br>
				<span>Album: ${song.album.title}</span><br>
				<span>By: ${song.artist.name}</span>
			</p>
			${addOrAddedToPlayListButton}`;

        searchResultsContainer.append(songContainer);
    }

    currentSongField.value = `Track ${currentSongNumber + 1}: ${arrayOfSongs[currentSongNumber].title}`; // show current song
    highlightCurrentSong();
    myAudio.src = arrayOfSongs[currentSongNumber].preview; // set audio src to first track
    myAudio.pause(); // Pause audio
    setPlayingState(false); // Highlight pause button
}

// Play a song with a button click event
playButton.addEventListener("click", () => {
    // If songs haven't been fetched, do not continue...
    if (currentSongContainer.length !== 0) {
        playSongAtIndex(currentSongNumber);
        setPlayingState(true);
    }
});

// Go to next song with a button click event
nextButton.addEventListener("click", playNextSong);

// Go back to previous song with a button click event
previousButton.addEventListener("click", playPreviousSong);

// Automatically go to the next song when current song ends
myAudio.onended = playNextSong;

// Pause song with a button click event
pauseButton.addEventListener("click", () => {
    if (currentSongContainer.length !== 0) {
        myAudio.pause();
        setPlayingState(false);
    }
});

// Play next song
function playNextSong() {
    if (!currentSongContainer.length) {
        return;
    }

    const playlistType = getCurrentPlaylist();
    currentSongNumber = currentSongNumber < playlistType.length - 1 ? currentSongNumber + 1 : 0;
    playSongAtIndex(currentSongNumber);
    setPlayingState(true);
}

// Play previous song
function playPreviousSong() {
    if (!currentSongContainer.length) {
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

    // If user is clicking "Add to playlist" button, don't play the song...
    if (event.target.classList.contains("addToPlayListBtn")) {
        return;
    }

    // If user is clicking "Remove from playlist" button, don't play the song...
    if (event.target.classList.contains("removeFromCustomPlayList")) {
        return;
    }

    if (
        event.target.closest(".songContainer") &&
		(event.type === "click" || (event.type === "keydown" && event.key === "Enter"))
    ) {
        const arrayOfAllDisplayedSongs = [...document.getElementsByClassName("songContainer")];
        const indexOfClickedSong = arrayOfAllDisplayedSongs.indexOf(event.target.closest(".songContainer"));
        currentSongNumber = indexOfClickedSong;
        playSongAtIndex(currentSongNumber);
        setPlayingState(true);
        arrayOfAllDisplayedSongs[indexOfClickedSong].classList.add("activeSongContainer");
    }
}

// Helper function to set play/pause button styling
function setPlayingState(isPlaying) {
    playButton.classList.toggle("activeButton", isPlaying);
    pauseButton.classList.toggle("activeButton", !isPlaying);
}

// Helper function to set "Search results" and "Custom playlist" button styling
function setPlaylistButtonState(isActive) {
    searchPlayListButton.classList.toggle("activeButton", isActive);
    customPlayListButton.classList.toggle("activeButton", !isActive);
}

// Helper function to select song, display song name, and play song
async function playSongAtIndex(currentSongNumber) {
    const playlist = getCurrentPlaylist();

    if (!playlist[currentSongNumber]) {
        return;
    }

    currentSongField.value = `Track ${currentSongNumber + 1}: ${playlist[currentSongNumber].title}`; // show current song
    highlightCurrentSong();
    // If song isn't set, pause and load the next one before using the asynchronous play() function
    if (myAudio.src !== playlist[currentSongNumber].preview) {
        myAudio.pause();
        myAudio.src = playlist[currentSongNumber].preview; // set audio src
        myAudio.load();
    }
    await myAudio.play(); // Play audio
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
        const checkMarkIcon = document.createElement("span");
        checkMarkIcon.innerHTML = `<i class="fa fa-check"></i>`;
        event.target.append(checkMarkIcon);
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
        setPlaylistButtonState(true);
        isUserViewingCustomPlayList = false;
    } else {
        setPlaylistButtonState(false);
        isUserViewingCustomPlayList = true;
    }

    currentSongNumber = 0;
    myAudio.pause();
    setPlayingState(false);
    printSongListToPage(songs);
    changeFormBackgroundToAlbumCover(songs[0].album.cover_big);
    highlightCurrentSong();
}

// Function to highlight current song
function highlightCurrentSong() {
    let currentSongContainerArray = [...currentSongContainer];

    currentSongContainerArray.forEach((song) => {
        song.classList.remove("activeSongContainer");
    });
	
    currentSongContainer[currentSongNumber].classList.add("activeSongContainer");
}
