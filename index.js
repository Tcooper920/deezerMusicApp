
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
				songContainer.innerHTML += "<strong class='songTitle'>" + response.data[i].title + "</strong>";
				songContainer.innerHTML += "Album: " + response.data[i].album.title;
				songContainer.innerHTML += "<br>By: " + response.data[i].artist.name;
				songContainer.innerHTML += "<a class='previewLink' href='" + response.data[i].preview + "' target='_blank'>Preview Song</a>";
				searchResultsContainer.append(songContainer);
				searchResultsContainer.style.textAlign = "center";
			}

			// albumcover/song container styling
			let numberOfSongContainers = document.getElementsByClassName("songContainer");
			let numberOfAlbumCovers = document.getElementsByClassName("albumCover");
			let numberOfPreviewLinks = document.getElementsByClassName("previewLink");
			let numberOfSongTitles = document.getElementsByClassName("songTitle");

			for (let i = 0; i < numberOfSongContainers.length; i++) {
				numberOfAlbumCovers[i].style.width = "100%";
				numberOfAlbumCovers[i].style.borderRadius = "5px";
				numberOfAlbumCovers[i].style.marginBottom = "1rem";
				numberOfSongContainers[i].style.textAlign = "left";
				numberOfSongContainers[i].style.fontFamily = "Helvetica";
				numberOfSongContainers[i].style.color = "#616161";
				numberOfSongContainers[i].style.fontSize = ".8rem";
				numberOfSongContainers[i].style.margin = "1.5rem";
				numberOfSongContainers[i].style.width = "15rem";
				numberOfSongContainers[i].style.display = "inline-flex";
				numberOfSongContainers[i].style.flexDirection = "column";
				numberOfSongTitles[i].style.fontSize = "1.2rem";
				numberOfSongTitles[i].style.marginBottom = ".3rem";
				numberOfPreviewLinks[i].style.textDecoration = "none";
				numberOfPreviewLinks[i].style.marginTop = ".5rem";
				numberOfPreviewLinks[i].style.color = "#53a6e8";
				numberOfPreviewLinks[i].style.fontWeight = "bold";
			}
		});
	});

	

});

