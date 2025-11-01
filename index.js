/* https://rapidapi.com/deezerdevs/api/deezer-1?endpoint=53aa5085e4b07e1f4ebeb429 */
var settings = {
	async: true,
	crossDomain: true,
	url: "https://deezerdevs-deezer.p.rapidapi.com/search?q=",
	method: "GET",
	headers: {
		"x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
		"x-rapidapi-key": myKey,
	},
};

let myAudio = new Audio();
let currentSongNumber = 0;
let arrayOfAllDisplayedSongs = [];
let cachedSongs = [];
const searchButton = document.getElementById("searchButton");
const currentSongField = document.getElementById("currentSongField");
const currentSongContainer = document.getElementsByClassName("songContainer");
const playButton = document.getElementById("playButton");
const pauseButton = document.getElementById("pauseButton");
const nextButton = document.getElementById("nextButton");
const previousButton = document.getElementById("previousButton");

function removeActiveSongContainerStyling() {
	let currentSongContainerArray = [...currentSongContainer];
	currentSongContainerArray.forEach((song) => {
		song.classList.remove("activeSongContainer");
	});
}

// Search for an artist with a button click event
searchButton.addEventListener("click", async () => {
	currentSongNumber = 0;
	let artistName = document.getElementById("artistName").value.trim(); // Trim user input

	document.getElementById("artistName").value = artistName; // Show trimmed artist name in text field
	settings.url = "https://deezerdevs-deezer.p.rapidapi.com/search?q=" + encodeURIComponent(artistName);

	// Display album cover, album name, and song
	const searchResultsContainer = document.getElementById("searchResultsContainer");
	const dataResponse = await fetch(settings.url, settings);
	const response = await dataResponse.json();
	cachedSongs = response.data; // store locally

	if (artistName !== "") {
		searchResultsContainer.innerText = ""; // clear previous search results

		for (let i = 0; i < cachedSongs.length; i++) {
			const songContainer = document.createElement("DIV");
			songContainer.setAttribute("tabindex", 0);
			songContainer.classList.add("songContainer");
			const albumImage = `<img class="albumCover" src="${cachedSongs[i].album.cover_big}"/>`;

			songContainer.innerHTML = `
				${albumImage}
		    	<strong>Track: ${i + 1}</strong><br>
				<strong class='songTitle'>${cachedSongs[i].title}</strong>
				Album: ${cachedSongs[i].album.title}<br>
				By: ${cachedSongs[i].artist.name}`;
			searchResultsContainer.append(songContainer);
		}
		myAudio.src = cachedSongs[currentSongNumber].preview; // set audio src to first track
		currentSongField.value = `Track ${currentSongNumber + 1}: ${cachedSongs[currentSongNumber].title}`; // show current song
		setPlayingState(false);
	}
});

// Play a song with a button click event
playButton.addEventListener("click", () => {
	// If songs haven't been fetched, do not continue...
	if (!cachedSongs.length) {
		return;
	}
	myAudio.play();
	setPlayingState(true);
	removeActiveSongContainerStyling();
	currentSongContainer[currentSongNumber].classList.add("activeSongContainer");
});

// Go to next song with a button click event
nextButton.addEventListener("click", () => {
	// If songs haven't been fetched, do not continue...
	if (!cachedSongs.length) {
		return;
	}
	if (currentSongNumber !== cachedSongs.length - 1) {
		// If not at last song...
		currentSongNumber += 1;
	} else {
		// If at last song, start from beginning...
		currentSongNumber = 0;
	}
	myAudio.src = cachedSongs[currentSongNumber].preview;
	myAudio.play();
	currentSongField.value = `Track ${currentSongNumber + 1}: ${cachedSongs[currentSongNumber].title}`;
	setPlayingState(true);
	removeActiveSongContainerStyling();
	currentSongContainer[currentSongNumber].classList.add("activeSongContainer");
});

// Go back to previous song with a button click event
previousButton.addEventListener("click", () => {
	// If songs haven't been fetched, do not continue...
	if (!cachedSongs.length) {
		return;
	}
	if (currentSongNumber > 0) {
		currentSongNumber -= 1;
	} else {
		currentSongNumber = cachedSongs.length - 1;
	}
	myAudio.src = cachedSongs[currentSongNumber].preview;
	myAudio.play();
	currentSongField.value = `Track ${currentSongNumber + 1}: ${cachedSongs[currentSongNumber].title}`;
	setPlayingState(true);
	removeActiveSongContainerStyling();
	currentSongContainer[currentSongNumber].classList.add("activeSongContainer");
});

// Pause song with a button click event
pauseButton.addEventListener("click", () => {
	if (currentSongContainer.length !== 0) {
		myAudio.pause();
		setPlayingState(false);
	}
});

// Automatically go to the next song when current song ends
myAudio.onended = () => {
	// If songs haven't been fetched, do not continue...
	if (!cachedSongs.length) {
		return;
	}
	if (currentSongNumber !== cachedSongs.length - 1) {
		currentSongNumber += 1;
	} else {
		currentSongNumber = 0;
	}
	myAudio.src = cachedSongs[currentSongNumber].preview;
	myAudio.play();
	currentSongField.value = `Track ${currentSongNumber + 1}: ${cachedSongs[currentSongNumber].title}`;
	setPlayingState(true);
	removeActiveSongContainerStyling();
	currentSongContainer[currentSongNumber].classList.add("activeSongContainer");
};

// Play song when user clicks an album song thumbnail
document.addEventListener("click", selectAndPlayClickedSong);
document.addEventListener("keydown", selectAndPlayClickedSong);

function selectAndPlayClickedSong(event) {
	// If songs haven't been fetched, do not continue...
	if (!cachedSongs.length) {
		return;
	}
	if (
		event.target.closest(".songContainer") &&
		(event.type === "click" || (event.type === "keydown" && event.key === "Enter"))
	) {
		arrayOfAllDisplayedSongs = [...document.getElementsByClassName("songContainer")];
		const indexOfClickedSong = arrayOfAllDisplayedSongs.indexOf(event.target.closest(".songContainer"));
		currentSongNumber = indexOfClickedSong;

		myAudio.src = cachedSongs[currentSongNumber].preview; // set audio src to first track
		currentSongField.value = `Track ${currentSongNumber + 1}: ${cachedSongs[currentSongNumber].title}`; // show current song
		myAudio.play();
		setPlayingState(true);
		removeActiveSongContainerStyling();
		arrayOfAllDisplayedSongs[indexOfClickedSong].classList.add("activeSongContainer");
	}
}

// Helper function to set play/pause button styling
function setPlayingState(isPlaying) {
	playButton.classList.toggle("activeButton", isPlaying);
	pauseButton.classList.toggle("activeButton", !isPlaying);
}
