// TMDB urls for different usecases
const TMDB_API_KEY = "api_key=b41a95063e74360cfa9318b5a8a8cf61";

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

//fetching the query string passed to this page from homepage which contains movie id
let id = "";
const urlParams = new URLSearchParams(location.search);
for (const [key, value] of urlParams) {
  id = value;
}

let id_query = `/movie/${id}?language=en-US&append_to_response=videos&`;
let final_url = TMDB_BASE_URL + id_query + TMDB_API_KEY;

// function call to create, send request and receive response
apiRequestCall(final_url);

// function to make api request
function apiRequestCall(url) {
  const xhr = new XMLHttpRequest();
  xhr.open("get", url);
  xhr.send();
  xhr.onload = function () {
    document.getElementById("movie-display").innerHTML = "";
    var res = xhr.response;
    //converting response to json
    var convertedJson = JSON.parse(res);
    populateMoviePage(convertedJson);
  };
  xhr.onerror = function () {
    window.alert("Cannot get");
  };
}

// this function will receive json of the movie as parameter and this will be used to populate the html elements dynamically for different movies
function populateMoviePage(myJson) {
  // filer out movie videos array to get trailer link
  var finalMovieTrailerArray = myJson.videos.results.filter(filterCriteria);
  //console.log(finalMovieTrailerArray);

  // applying background to body as per movie
  document.body.style.backgroundImage = `url(${
    TMDB_IMAGE_BASE_URL + myJson.backdrop_path
  }), linear-gradient(rgba(0,0,0,1), rgba(0,0,0,0) 250%)`;
  var eachMovieDiv = document.createElement("div");
  eachMovieDiv.classList.add("each-movie-page");

  // defining youtube url based on filtered results
  var ytURL;
  if (finalMovieTrailerArray.length == 0) {
    if (myJson.videos.results.length == 0) {
      ytURL = "";
    } else {
      ytURL = `https://www.youtube.com/embed/${myJson.videos.results[0].key}`;
    }
  } else {
    ytURL = `https://www.youtube.com/embed/${finalMovieTrailerArray[0].key}`;
  }

  // setting up html of whole page
  eachMovieDiv.innerHTML = `
        <div class="movie-poster">
            <img src=${TMDB_IMAGE_BASE_URL + myJson.poster_path} alt="Poster">
        </div>
        <div class="movie-details">
            <div class="title">
                ${myJson.title}
            </div>

            <div class="tagline">${myJson.tagline}</div>

            <div style="display: flex;"> 
                <div class="movie-duration">
                    <b><i class="fas fa-clock"></i></b> ${myJson.runtime}
                </div>
                <div class="release-date">
                    <b>Raleased</b>: ${myJson.release_date}
                </div>
            </div>

            <div class="rating">
                <b>IMDb Rating</b>: ${myJson.vote_average}
            </div>

            <div class="trailer-div" id="trailer-div-btn">
                <i class="fab fa-youtube"></i>
            </div>

            <div id="trailer-video-div">
                <button id="remove-video-player"><i class="fas fa-times"></i></button>
                <br>
                <span><iframe width="560" height="315" src=${ytURL} title="YouTube video player" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></span>
                
            </div>
    
            <h2>Plot</h2>
            <div class="plot">
                ${myJson.overview}
            </div>
        </div>
    `;
  // appending above created clild to movie display div
  document.getElementById("movie-display").appendChild(eachMovieDiv);

  // on clicck of #trailer-div-btn, we will change the display property of mini player to make it visible
  var trailerVideoDiv = document.getElementById("trailer-video-div");
  document
    .getElementById("trailer-div-btn")
    .addEventListener("click", function () {
      trailerVideoDiv.style.display = "block";
    });

  // this function will stop playing video
  function stopThis() {
    var iframe = document.getElementsByTagName("iframe")[0];
    var url = iframe.getAttribute("src");
    iframe.setAttribute("src", "");
    iframe.setAttribute("src", url);
  }
}

// on clicking x, we will change display back to none to hide it
document
  .getElementById("remove-video-player")
  .addEventListener("click", function () {
    // make the div invisible but stop video before
    stopThis();
    trailerVideoDiv.style.display = "none";
  });

//function to filter the array
function filterCriteria(obj) {
  var eachVideoTitle = obj.name;
  var regex = /Official Trailer/i;
  if (eachVideoTitle.match(regex)) {
    return obj;
  }
}
