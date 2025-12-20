export function getDomSelectors() {
	return {
		formBackgroundImage: document.getElementsByClassName("formsWrapper")[0],
		searchButton: document.getElementById("searchButton"),
		currentSongField: document.getElementById("currentSongField"),
		currentSongContainer: document.getElementsByClassName("songContainer"),
		playButton: document.getElementById("playButton"),
		pauseButton: document.getElementById("pauseButton"),
		nextButton: document.getElementById("nextButton"),
		previousButton: document.getElementById("previousButton"),
		searchPlayListButton: document.getElementById("viewSearchPlayListBtn"),
		customPlayListButton: document.getElementById("viewCustomPlayListBtn"),
	};
}
