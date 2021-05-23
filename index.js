
$(document).ready(function (){

	/* https://rapidapi.com/deezerdevs/api/deezer-1?endpoint=53aa5085e4b07e1f4ebeb429 */
	var settings = {
		"async": true,
		"crossDomain": true,
		"url": "https://deezerdevs-deezer.p.rapidapi.com/search?q=",
		"method": "GET",
		"headers": {
			"x-rapidapi-host": "deezerdevs-deezer.p.rapidapi.com",
			"x-rapidapi-key": myKey
		}
	}

	let myAudio = new Audio();
	let currentSongNumber = 0;
	let currentSongContainer = document.getElementsByClassName("songContainer");

	// remove active song container style
	const removeActiveSongContainerStyling = () => {
		for (let i = 0; i < currentSongContainer.length; i++) {
			currentSongContainer[i].classList.remove("activeSongContainer");
		}
	}

	// search for an artist with a button click event
	let searchButton = document.getElementById("searchButton");

	searchButton.addEventListener("click", function () {
		
		currentSongNumber = 0;
		let artistName = document.getElementById("artistName").value;
		settings.url = "https://deezerdevs-deezer.p.rapidapi.com/search?q=" + artistName;
		
		$.ajax(settings).done(function (response) {
			// display album cover, album name, and song
			let searchResultsContainer = document.getElementById("searchResultsContainer");
			searchResultsContainer.innerHTML = ""; // clear previous search results
			
			for (let i = 0; i < response.data.length; i++) {
				let songContainer = document.createElement("DIV");
				songContainer.classList.add("songContainer");
				let albumImage = "<img class='albumCover' src='" + response.data[i].album.cover_big + "'/>";
				songContainer.innerHTML = albumImage;
				songContainer.innerHTML += "<strong>Track: " + (i + 1) + "</strong>";
				songContainer.innerHTML += "<strong class='songTitle'>" + response.data[i].title + "</strong>";
				songContainer.innerHTML += "Album: " + response.data[i].album.title;
				songContainer.innerHTML += "<br>By: " + response.data[i].artist.name;
				searchResultsContainer.append(songContainer);
				searchResultsContainer.style.textAlign = "center";
			}
			myAudio.src = response.data[currentSongNumber].preview; // set audio src to first track
			$("#currentSongField").val("Track " + (currentSongNumber + 1) + ": " + response.data[currentSongNumber].title); // show current song
			$(".button").removeClass("activeButton");
		});
	});

	// play a song with a button click event
	let playButton = document.getElementById("playButton");

	playButton.addEventListener("click", function () {
		myAudio.play();
		$(".button").removeClass("activeButton"); // reset button colors and make play button dark
		$("#playButton").addClass("activeButton");
		removeActiveSongContainerStyling();
		currentSongContainer[currentSongNumber].classList.add("activeSongContainer");
	});

	// go to next song with a button click event
	let nextButton = document.getElementById("nextButton");

	nextButton.addEventListener("click", function () {
		$.ajax(settings).done(function (response) {
			if (currentSongNumber !== response.data.length - 1) { // if not at last song...
				currentSongNumber += 1;
			} else { // if at last song, start from beginning...
				currentSongNumber = 0;
			}
			myAudio.src = response.data[currentSongNumber].preview;
			myAudio.play();
			$("#currentSongField").val("Track " + (currentSongNumber + 1) + ": " + response.data[currentSongNumber].title);
			$(".button").removeClass("activeButton");
			$("#playButton").addClass("activeButton");
			removeActiveSongContainerStyling();
			currentSongContainer[currentSongNumber].classList.add("activeSongContainer");
		});
	});

	// go back to previous song with a button click event
	let previousButton = document.getElementById("previousButton");

	previousButton.addEventListener("click", function () {
		$.ajax(settings).done(function (response) {
			if (currentSongNumber > 0) {
				currentSongNumber -= 1;
			} else {
				currentSongNumber = response.data.length - 1;
			}
			myAudio.src = response.data[currentSongNumber].preview;
			myAudio.play();
			$("#currentSongField").val("Track " + (currentSongNumber + 1) + ": " + response.data[currentSongNumber].title);
			$(".button").removeClass("activeButton");
			$("#playButton").addClass("activeButton");
			removeActiveSongContainerStyling();
			currentSongContainer[currentSongNumber].classList.add("activeSongContainer");
		});
	});

	// pause song with a button click event
	let pauseButton = document.getElementById("pauseButton");

	pauseButton.addEventListener("click", function () {
		myAudio.pause();
		$(".button").removeClass("activeButton");
		$("#pauseButton").addClass("activeButton");
	});

	// automatically go to the next song when current song ends
	myAudio.onended = function () {
		$.ajax(settings).done(function (response) {
			if (currentSongNumber !== response.data.length - 1) { 
				currentSongNumber += 1;
			} else { 
				currentSongNumber = 0;
			}
			myAudio.src = response.data[currentSongNumber].preview;
			myAudio.play();
			$("#currentSongField").val("Track " + (currentSongNumber + 1) + ": " + response.data[currentSongNumber].title);
			$(".button").removeClass("activeButton");
			$("#playButton").addClass("activeButton");
			removeActiveSongContainerStyling();
			currentSongContainer[currentSongNumber].classList.add("activeSongContainer");
		});
	}
});

