// TMDB urls for different usecases
const TMDB_API_KEY = "api_key=b41a95063e74360cfa9318b5a8a8cf61";

const TMDB_HOME_URL = `https://api.themoviedb.org/3/discover/movie?${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=1&with_watch_monetization_types=flatrate`;

const TMDB_BASE_URL = "https://api.themoviedb.org/3";

const TMDB_BEST_R_RATED =
  "/discover/movie/?certification_country=US&certification=R&sort_by=popularity.desc&";

const TMDB_POPULAR_KIDS_MOVIES =
  "/discover/movie?certification_country=US&certification.lte=G&sort_by=popularity.desc&";

const TMDB_IMAGE_BASE_URL = "https://image.tmdb.org/t/p/w500";

// fetching all the dom elements
var movieContainer = document.getElementById("movie-container");
// var rRatedMoviesBtn = document.getElementById('top-r-rated');
var kidsMoviesBtn = document.getElementById("top-kids-rated");
var webLogo = document.getElementById("logo");
var bestMoviesOfYearDropDownMenu = document.getElementById("best-of-year");
var pageHeading = document.getElementById("page-heading");
var myListBtn = document.getElementById("my-list");

var prevBtn = document.getElementById("prev-page");
var nextBtn = document.getElementById("next-page");
let pageNo = 1;

var searchInput = document.getElementById("searchMovie");
var wrapperDiv = document.querySelector(".wrapper");
var resultsDiv = document.querySelector(".results");

// populating best movies accoring to year dropdown using javascript
for (let year = 2022; year >= 2000; year--) {
  var option = document.createElement("option");
  option.text = year;
  option.value = year;
  bestMoviesOfYearDropDownMenu.add(option);
}

// calling function to populate home page
apiRequestCall(TMDB_HOME_URL);
// pageHeading.innerHTML = 'Best Popular Movies';

// function to make api request
function apiRequestCall(url) {
  const xhr = new XMLHttpRequest();
  xhr.open("get", url);
  xhr.send();
  xhr.onload = function () {
    // clearing movie-container before populating the div
    movieContainer.innerHTML = "";
    var res = xhr.response;
    //converting response to json
    var conJson = JSON.parse(res);
    //this array will contain 20 movie objects
    var moviesObjArray = conJson.results;
    //we pass this array to createMovieElement function to create and populate our home page
    moviesObjArray.forEach((movie) => createMovieElement(movie));
    addMovieToListButtonArray =
      document.getElementsByClassName(".add-movie-to-list");
    console.log(addMovieToListButtonArray);
  };
}

// function to create and populate our home page
function createMovieElement(movie) {
  // create the movie element and add proper class and HTML content to it
  var movieElement = document.createElement("div");
  movieElement.classList.add("movie-element");
  movieElement.innerHTML = `
        <div class="movie-poster">
            <a href="moviePage.html?id=${movie.id}"><img src= ${
    TMDB_IMAGE_BASE_URL + movie.poster_path
  } alt="Movie Poster"></a>
        </div>
        <div class="movie-title">${movie.title}</div>
        <div class="movie-element-tags">
            <div class="movie-rating">
                ${movie.vote_average} <i class="fas fa-star"></i>
            </div>
            <div class="add-movie-to-list"  id="${
              movie.id
            }" onclick="addingMovieToList(${movie.id})">
                <i class="fas fa-plus"></i>
            </div>
        </div>
    `;
  // append this newly created child div to the parent movie-container div
  movieContainer.appendChild(movieElement);
}

kidsMoviesBtn.addEventListener("click", function () {
  pageHeading.innerHTML = "Popular In Kids";
  apiRequestCall(TMDB_BASE_URL + TMDB_POPULAR_KIDS_MOVIES + TMDB_API_KEY);
});

webLogo.addEventListener("click", function () {
  pageHeading.innerHTML = "Best Popular Movies";
  apiRequestCall(TMDB_HOME_URL);
});

// array containing id's of all movies which are added to My List
// we will use this array to display content of My List Page
var myMovieList = [];
var oldArray = [];

// adding functionality to Add Movie to list button
function addingMovieToList(buttonID) {
  document.getElementById(buttonID).innerHTML = '<i class="fas fa-check"></i>';
  // to add the movie only once into list
  if (!myMovieList.includes(buttonID.toString())) {
    myMovieList.push(buttonID.toString());
  }
  console.log(myMovieList);
  console.log("-------------------------------");

  // display toast to confirm user that movie has been added to list
  displayToast();

  //first we need to check if local storafe is empty, if yes then push data directly; if not, then first reterive that data, modify it and then append modified data to localstorage;
  oldArray = JSON.parse(localStorage.getItem("MovieArray"));
  if (oldArray == null) {
    localStorage.setItem("MovieArray", JSON.stringify(myMovieList));
  } else {
    // appending only new entries in old array
    myMovieList.forEach((item) => {
      if (!oldArray.includes(item)) {
        oldArray.push(item);
      }
    });
    localStorage.setItem("MovieArray", JSON.stringify(oldArray));
  }
  console.log(oldArray);
}

// toast will be displayed for 2sec
function displayToast() {
  document.getElementById("toasts").style.display = "block";
  setTimeout(() => {
    document.getElementById("toasts").style.display = "none";
  }, 2000);
}

//to display movies of selected year, following function will be called where we fetch the selected year and then pass the url with selectedYear
bestMoviesOfYearDropDownMenu.onchange = displaySelectedYearMovies;

function displaySelectedYearMovies() {
  var selectedYear =
    bestMoviesOfYearDropDownMenu[bestMoviesOfYearDropDownMenu.selectedIndex]
      .text;

  console.log(selectedYear);
  var BEST_MOVIES_OF_YEAR = `/discover/movie?primary_release_year=${selectedYear}&sort_by=popularity.desc&`;
  apiRequestCall(TMDB_BASE_URL + BEST_MOVIES_OF_YEAR + TMDB_API_KEY);

  pageHeading.innerHTML = `Best Movies of ${selectedYear}`;
}

// working faster than above method
searchInput.addEventListener("keyup", function () {
  //get the input string
  var searchedInput = searchInput.value;
  // make api call with this url which wil return result array of matched titles and later we pass this json to create dom elements
  var urlForThisInput = `https://api.themoviedb.org/3/search/movie?query=${searchedInput}&${TMDB_API_KEY}`;
  if (searchedInput.length != 0) {
    apiRequestCall(urlForThisInput);
  } else {
    window.location.reload();
  }
});

//disable prevrious page button initially and then based upon page no
prevBtn.disabled = true;
function disablePvreBtn() {
  if (pageNo == 1) {
    prevBtn.disabled = true;
  } else {
    prevBtn.disabled = false;
  }
}

// navigate between pages
nextBtn.addEventListener("click", () => {
  pageNo++;
  let tempURL = `https://api.themoviedb.org/3/discover/movie?${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${pageNo}&with_watch_monetization_types=flatrate`;
  apiRequestCall(tempURL);
  disablePvreBtn();
});

prevBtn.addEventListener("click", () => {
  if (pageNo == 1) {
    return;
  }
  pageNo--;
  let tempURL = `https://api.themoviedb.org/3/discover/movie?${TMDB_API_KEY}&language=en-US&sort_by=popularity.desc&include_adult=false&include_video=false&page=${pageNo}&with_watch_monetization_types=flatrate`;
  apiRequestCall(tempURL);
  disablePvreBtn();
});
