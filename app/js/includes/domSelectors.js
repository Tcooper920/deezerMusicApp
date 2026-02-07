export function getDomSelectors() {
    return {
        formBackgroundImage: document.getElementsByClassName("formsWrapper")[0],
        searchButton: document.getElementById("searchButton"),
        currentSongField: document.getElementById("currentSongField"),
        playButton: document.getElementById("playButton"),
        pauseButton: document.getElementById("pauseButton"),
        nextButton: document.getElementById("nextButton"),
        previousButton: document.getElementById("previousButton"),
        searchPlayListButton: document.getElementById("viewSearchPlayListBtn"),
        customPlayListButton: document.getElementById("viewCustomPlayListBtn"),
        searchResultsContainer: document.getElementById("searchResultsContainer"),
        errorMessages: document.getElementsByClassName("errorMessages")[0],
        hideAlbumCoversButton: document.getElementById("hideAlbumCoversBtn"),
    };
}
