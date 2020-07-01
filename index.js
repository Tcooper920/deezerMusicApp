
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

	// search for an artist with a button click event
	let searchButton = document.getElementById("searchButton");

	searchButton.addEventListener("click", function () {

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

			// albumcover/song container CSS styling
			$(".albumCover").css({
				width: "100%",
				borderRadius: "5px",
				marginBottom: "1rem"
			});

			$(".songContainer").css({
				textAlign: "left",
				fontFamily: "Helvetica",
				color: "#616161",
				fontSize: ".8rem",
				margin: "1rem",
				width: "15rem",
				display: "inline-flex",
				flexDirection: "column"
			});

			$(".songTitle").css ({
				fontSize: "1.2rem",
				marginBottom: ".3rem"
			});
		});
	});

	// play a song with a button click event
	let playButton = document.getElementById("playButton");
	let myAudio = new Audio();
	let currentSongNumber = 0;

	playButton.addEventListener("click", function () {
		$.ajax(settings).done(function (response) {
			myAudio.src = response.data[currentSongNumber].preview;
			myAudio.play();
		});
	});

	// go to next song with a button click event
	let nextButton = document.getElementById("nextButton");

	nextButton.addEventListener("click", function () {
		$.ajax(settings).done(function (response) {
			if (currentSongNumber !== response.data.length - 1) {
				currentSongNumber += 1;
				myAudio.src = response.data[currentSongNumber].preview;
				myAudio.play();
			} else {
				currentSongNumber = 0;
				myAudio.src = response.data[currentSongNumber].preview;
				myAudio.play();
			}
		});
	});

	// go back to previous song with a button click event
	let previousButton = document.getElementById("previousButton");

	previousButton.addEventListener("click", function () {
		$.ajax(settings).done(function (response) {
			if (currentSongNumber > 0) {
				currentSongNumber -= 1;
				myAudio.src = response.data[currentSongNumber].preview;
				myAudio.play();
			} else {
				currentSongNumber = response.data.length - 1;
			}
		});
	});


});

