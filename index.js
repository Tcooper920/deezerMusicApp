const myAudio = new Audio();
let currentSongNumber = 0;
let arrayOfAllDisplayedSongs = [];
let cachedSongs = [];
let customPlayList = [];
let artistName = "";
const formBackgroundImage = document.getElementsByClassName("formsWrapper")[0];
const searchButton = document.getElementById("searchButton");
const currentSongField = document.getElementById("currentSongField");
const currentSongContainer = document.getElementsByClassName("songContainer");
const playButton = document.getElementById("playButton");
const pauseButton = document.getElementById("pauseButton");
const nextButton = document.getElementById("nextButton");
const previousButton = document.getElementById("previousButton");
const searchPlayListButton = document.getElementById("viewSearchPlayListBtn");
const customPlayListButton = document.getElementById("viewCustomPlayListBtn");
let isUserViewingCustomPlayList = false;

// Search for an artist with a button click event and print song list to page
searchButton.addEventListener("click", async () => {
	isUserViewingCustomPlayList = false;
	currentSongNumber = 0;
	artistName = document.getElementById("artistName").value.trim(); // Trim user input
	document.getElementById("artistName").value = artistName; // Show trimmed artist name in text field
	const result = await fetch(`getData.php?q=${encodeURIComponent(artistName)}`);
	const apiDataReturned = await result.json();
	const searchResultsContainer = document.getElementById("searchResultsContainer");
	cachedSongs = apiDataReturned.data; // store locally

	changeFormBackgroundToAlbumCover(cachedSongs[0].album.cover_big);

	// Display album cover, album name, and song
	printSongListToPage(cachedSongs);
	removeActiveSongContainerStyling();
	setPlaylistButtonState(true);
});

// Print list of songs to page
function printSongListToPage(arrayOfSongs) {
	if (artistName !== "") {
		searchResultsContainer.innerText = "";

		for (let i = 0; i < arrayOfSongs.length; i++) {
			const songContainer = document.createElement("DIV");
			songContainer.setAttribute("tabindex", 0);
			songContainer.classList.add("songContainer");
			const albumImage = `<img class="albumCover" src="${arrayOfSongs[i].album.cover_big}"/>`;

			songContainer.innerHTML = `
				${albumImage}
				<p>
					<strong class='trackNumber'>Track: ${i + 1}</strong><br>
					<strong class='songTitle'>${arrayOfSongs[i].title}</strong><br>
					<span>Album: ${arrayOfSongs[i].album.title}</span><br>
					<span>By: ${arrayOfSongs[i].artist.name}</span>
				</p>`;
			if (isUserViewingCustomPlayList === false) {
				// If song is already added to playlist, show the checkmark. Otherwise, show the standard button.
				if (!customPlayList.includes(arrayOfSongs[i])) {
					songContainer.innerHTML += `<button class='addToPlayListBtn'>+ Add to playlist</button>`;
				} else {
					songContainer.innerHTML += `<button class="addToPlayListBtn activeButton">Added<span><i class="fa fa-check"></i></span></button>`;
				}
			}
			searchResultsContainer.append(songContainer);
		}

		currentSongField.value = `Track ${currentSongNumber + 1}: ${arrayOfSongs[currentSongNumber].title}`; // show current song
		removeActiveSongContainerStyling(); // Remove active song styling
		currentSongContainer[currentSongNumber].classList.add("activeSongContainer"); // Highlight active song
		myAudio.src = arrayOfSongs[currentSongNumber].preview; // set audio src to first track
		myAudio.pause(); // Pause audio
		setPlayingState(false); // Highlight pause button
	}
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
nextButton.addEventListener("click", () => {
	playNextSong();
});

// Automatically go to the next song when current song ends
myAudio.onended = () => {
	playNextSong();
};

// Go back to previous song with a button click event
previousButton.addEventListener("click", () => {
	playPreviousSong();
});

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
	const playlistType = isUserViewingCustomPlayList ? customPlayList : cachedSongs;
	currentSongNumber = currentSongNumber < playlistType.length - 1 ? currentSongNumber + 1 : 0;
	playSongAtIndex(currentSongNumber);
	setPlayingState(true);
}

// Play previous song
function playPreviousSong() {
	if (!currentSongContainer.length) {
		return;
	}
	const playlistType = isUserViewingCustomPlayList ? customPlayList : cachedSongs;
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
	if (
		event.target.closest(".songContainer") &&
		(event.type === "click" || (event.type === "keydown" && event.key === "Enter"))
	) {
		arrayOfAllDisplayedSongs = [...document.getElementsByClassName("songContainer")];
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

// Remove active song styling
function removeActiveSongContainerStyling() {
	let currentSongContainerArray = [...currentSongContainer];
	currentSongContainerArray.forEach((song) => {
		song.classList.remove("activeSongContainer");
	});
}

// Helper function to select song, display song name, and play song
function playSongAtIndex(currentSongNumber) {
	const playlist = isUserViewingCustomPlayList ? customPlayList : cachedSongs;
	if (!playlist[currentSongNumber]) {
		return;
	}

	currentSongField.value = `Track ${currentSongNumber + 1}: ${playlist[currentSongNumber].title}`; // show current song
	removeActiveSongContainerStyling(); // Remove active song styling
	currentSongContainer[currentSongNumber].classList.add("activeSongContainer"); // Highlight active song
	myAudio.src = playlist[currentSongNumber].preview; // set audio src to first track
	myAudio.play(); // Play audio
	changeFormBackgroundToAlbumCover(playlist[currentSongNumber].album.cover_big);
}

// Change form background to album cover for current song that is playing
function changeFormBackgroundToAlbumCover(thisAlbumCover) {
	formBackgroundImage.style.backgroundImage = `url("${thisAlbumCover}")`;
	formBackgroundImage.style.backgroundColor = "#6b6b6b";
}

// Adding songs to a custom playlist
document.addEventListener("click", (event) => {
	if (event.target.classList.contains("addToPlayListBtn")) {
		const allButtonsOnPage = document.querySelectorAll(".addToPlayListBtn");
		const indexOfButtonClicked = [...allButtonsOnPage].indexOf(event.target);

		// Push selected song to custom playlist array if song hasn't been added already
		if (!customPlayList.includes(cachedSongs[indexOfButtonClicked])) {
			customPlayList.push(cachedSongs[indexOfButtonClicked]);
		}
		event.target.innerText = `Added`;
		event.target.classList.add("activeButton");
		const checkMarkIcon = document.createElement("span");
		checkMarkIcon.innerHTML = `<i class="fa fa-check"></i>`;
		event.target.append(checkMarkIcon);
	}
});

// Show search songs
searchPlayListButton.addEventListener("click", () => {
	if (cachedSongs.length > 0) {
		isUserViewingCustomPlayList = false;
		currentSongNumber = 0;
		changeFormBackgroundToAlbumCover(cachedSongs[0].album.cover_big);
		printSongListToPage(cachedSongs);
		setPlaylistButtonState(true);
	}
	removeActiveSongContainerStyling();
});

// Show custom playlist songs
customPlayListButton.addEventListener("click", () => {
	if (customPlayList.length > 0) {
		isUserViewingCustomPlayList = true;
		currentSongNumber = 0;
		changeFormBackgroundToAlbumCover(customPlayList[0].album.cover_big);
		printSongListToPage(customPlayList);
		setPlaylistButtonState(false);
	}
	removeActiveSongContainerStyling();
});
