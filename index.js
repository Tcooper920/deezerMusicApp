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
let searchButton = document.getElementById("searchButton");
let currentSongContainer = document.getElementsByClassName("songContainer");
const playButton = document.getElementById("playButton");
const pauseButton = document.getElementById("pauseButton");
const nextButton = document.getElementById("nextButton");
const previousButton = document.getElementById("previousButton");

function removeActiveSongContainerStyling() {
	currentSongContainerArray = [...currentSongContainer];
	currentSongContainerArray.forEach((song) => {
		song.classList.remove("activeSongContainer");
	});
}

// Search for an artist with a button click event
searchButton.addEventListener("click", async () => {
	currentSongNumber = 0;
	let artistName = document.getElementById("artistName").value;
	settings.url = "https://deezerdevs-deezer.p.rapidapi.com/search?q=" + encodeURIComponent(artistName);

	// Display album cover, album name, and song
	const searchResultsContainer = document.getElementById("searchResultsContainer");
	const dataResponse = await fetch(settings.url, settings);
	const response = await dataResponse.json();

	if (artistName !== "") {
		searchResultsContainer.innerText = ""; // clear previous search results

		for (let i = 0; i < response.data.length; i++) {
			const songContainer = document.createElement("DIV");
			songContainer.setAttribute("tabindex", 0);
			songContainer.classList.add("songContainer");
			const albumImage = "<img class='albumCover' src='" + response.data[i].album.cover_big + "'/>";

			songContainer.innerHTML = `
				${albumImage}
		    	<strong>Track: ${i + 1}</strong><br>
				<strong class='songTitle'>${response.data[i].title}</strong>
				Album: ${response.data[i].album.title}<br>
				By: ${response.data[i].artist.name}`;
			searchResultsContainer.append(songContainer);
		}
		myAudio.src = response.data[currentSongNumber].preview; // set audio src to first track
		$("#currentSongField").val("Track " + (currentSongNumber + 1) + ": " + response.data[currentSongNumber].title); // show current song
		$("#pauseButton").addClass("activeButton");
		$("#playButton").removeClass("activeButton");
	}
});

// Play a song with a button click event
playButton.addEventListener("click", () => {
	if (currentSongContainer.length !== 0) {
		myAudio.play();
		$("#pauseButton").removeClass("activeButton"); // reset button colors and make play button dark
		$("#playButton").addClass("activeButton");
		removeActiveSongContainerStyling();
		currentSongContainer[currentSongNumber].classList.add("activeSongContainer");
	}
});

// Go to next song with a button click event
nextButton.addEventListener("click", async () => {
	const dataResponse = await fetch(settings.url, settings);
	const response = await dataResponse.json();

	if (currentSongContainer.length !== 0) {
		if (currentSongNumber !== response.data.length - 1) {
			// If not at last song...
			currentSongNumber += 1;
		} else {
			// If at last song, start from beginning...
			currentSongNumber = 0;
		}
		myAudio.src = response.data[currentSongNumber].preview;
		myAudio.play();
		$("#currentSongField").val("Track " + (currentSongNumber + 1) + ": " + response.data[currentSongNumber].title);
		$("#pauseButton").removeClass("activeButton");
		$("#playButton").addClass("activeButton");
		removeActiveSongContainerStyling();
		currentSongContainer[currentSongNumber].classList.add("activeSongContainer");
	}
});

// Go back to previous song with a button click event
previousButton.addEventListener("click", async () => {
	const dataResponse = await fetch(settings.url, settings);
	const response = await dataResponse.json();

	if (currentSongContainer.length !== 0) {
		if (currentSongNumber > 0) {
			currentSongNumber -= 1;
		} else {
			currentSongNumber = response.data.length - 1;
		}
		myAudio.src = response.data[currentSongNumber].preview;
		myAudio.play();
		$("#currentSongField").val("Track " + (currentSongNumber + 1) + ": " + response.data[currentSongNumber].title);
		$("#pauseButton").removeClass("activeButton");
		$("#playButton").addClass("activeButton");
		removeActiveSongContainerStyling();
		currentSongContainer[currentSongNumber].classList.add("activeSongContainer");
	}
});

// Pause song with a button click event
pauseButton.addEventListener("click", () => {
	if (currentSongContainer.length !== 0) {
		myAudio.pause();
		$("#playButton").removeClass("activeButton");
		$("#pauseButton").addClass("activeButton");
	}
});

// Automatically go to the next song when current song ends
myAudio.onended = async () => {
	const dataResponse = await fetch(settings.url, settings);
	const response = await dataResponse.json();

	if (currentSongNumber !== response.data.length - 1) {
		currentSongNumber += 1;
	} else {
		currentSongNumber = 0;
	}
	myAudio.src = response.data[currentSongNumber].preview;
	myAudio.play();
	$("#currentSongField").val("Track " + (currentSongNumber + 1) + ": " + response.data[currentSongNumber].title);
	$("#pauseButton").removeClass("activeButton");
	$("#playButton").addClass("activeButton");
	removeActiveSongContainerStyling();
	currentSongContainer[currentSongNumber].classList.add("activeSongContainer");
};

// Play song when user clicks an album song thumbnail
document.addEventListener("click", selectAndPlayClickedSong);
document.addEventListener("keydown", selectAndPlayClickedSong);

async function selectAndPlayClickedSong(event) {
	if (
		event.target.closest(".songContainer") &&
		(event.type === "click" || (event.type === "keydown" && event.key === "Enter"))
	) {
		arrayOfAllDisplayedSongs = [...document.getElementsByClassName("songContainer")];
		indexOfClickedSong = arrayOfAllDisplayedSongs.indexOf(event.target.closest(".songContainer"));
		const dataResponse = await fetch(settings.url, settings);
		const response = await dataResponse.json();

		currentSongNumber = indexOfClickedSong;
		myAudio.src = response.data[currentSongNumber].preview; // set audio src to first track
		$("#currentSongField").val("Track " + (currentSongNumber + 1) + ": " + response.data[currentSongNumber].title); // show current song
		myAudio.play();
		$("#pauseButton").removeClass("activeButton"); // reset button colors and make play button dark
		$("#playButton").addClass("activeButton");
		removeActiveSongContainerStyling();
		arrayOfAllDisplayedSongs[indexOfClickedSong].classList.add("activeSongContainer");
	}
}
