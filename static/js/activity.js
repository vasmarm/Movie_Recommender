/*
 * Class to get star ratings and fire click event
 */
class StarRating extends HTMLElement {
    get value () {
        return this.getAttribute('value') || 0;
    }

    set value (val) {
        this.setAttribute('value', val);
        this.highlight(this.value - 1);
    }

    get number () {
        return this.getAttribute('number') || 10;
    }

    set number (val) {
        this.setAttribute('number', val);

        this.stars = [];

        while (this.firstChild) {
            this.removeChild(this.firstChild);
        }

        for (let i = 0; i < this.number; i++) {
            let s = document.createElement('div');
            s.className = 'star';
            this.appendChild(s);
            this.stars.push(s);
        }

        this.value = this.value;
    }

    highlight (index) {
        this.stars.forEach((star, i) => {
            star.classList.toggle('full', i <= index);
        });
    }
    // Passing MovieId and UserId in constructor
    constructor (movieId, userId) {
        super();
        this.movieId = movieId;
        this.userId = userId;
        this.number = this.number;
        // console.log(this.movieId);
        this.addEventListener('mousemove', e => {
            let box = this.getBoundingClientRect(),
                starIndex = Math.floor((e.pageX - box.left) / box.width * this.stars.length);

            this.highlight(starIndex);
        });

        this.addEventListener('mouseout', () => {
            this.value = this.value;
        });
        var _this = this;
        this.addEventListener('click', function(e) {
            let box = this.getBoundingClientRect(),
                starIndex = Math.floor((e.pageX - box.left) / box.width * this.stars.length);
            this.value = starIndex + 1;
            console.log("MovieId - " + ratedMovieStars.movieId);
            console.log("Rating - " + this.value/2);
            console.log("UserId - " + ratedMovieStars.userId);
            window.sessionStorage.setItem("newUser", "false");
            // Calling rating function with movieId, passing rated stars and userId
            rating(ratedMovieStars.movieId, (this.value)/2, ratedMovieStars.userId);
            let rateEvent = new Event('rate');
            this.dispatchEvent(rateEvent);
        }.bind(_this));
    }
}

customElements.define('x-star-rating', StarRating);

/*
 * Global Variables
 */
var movies = [];
var imdb_scores = [];
var rotten_scores = [];
var meta_scores = [];
var popularity = [];
var movieId = '';
var titles = [];
var ratedMovieStars;
var totalMovies=0;
var baseUrl = 'http://image.tmdb.org/t/p/w185_and_h278_bestv2';
var newUser = '';

var currentUser = window.sessionStorage.getItem("currentUser");

document.getElementById("userId").innerText = currentUser;

/*
 * Initialize Function Defination
 */
var initialize = function(){
    
    // Use the list of sample names to populate the select options
    d3.json("/activityData").then(response => {
        response.forEach(function(res){
            titles.push(res.title);
            popularity.push(res.popularity);
        });
        /*
        * Calling popularMovies function
        */
        //popularMoviesRatings();
        plotPopularMovies();
        // Getting a fresh list of users and checking if the user is new or not
        d3.json("/data").then(users => {
            for(var i=0; i<users.length; i++){
                if(users[i].userId === currentUser){
                    checkUser = true;
                    break;
                }else{
                    checkUser = false;
                }
            }
            /* If part has new user which gets only popular movies shown up.
             * Once a user rates even a single movie modal is trained and recomendations shows 
             * based upon model not popularity.
             */ 
            if(!checkUser){
                movieId = response[0].movieId;
                var title = response[0].title;
                var language = response[0].original_language;
                var poster = baseUrl + response[0].poster_path;
                var releaseDate = response[0].release_date;
                $("#title").text(title);
                $("#language").text(language);
                $("#poster").attr("src", poster);
                $("#releaseDate").text(releaseDate);
                ratedMovieStars = new StarRating(movieId,currentUser);
                d3.select("tbody").selectAll("tr")
                        .data(response)
                        .enter() // creates placeholder for new data
                        .append("tr") // appends a div to placeholder
                        .html(d=> 
                                    `<td><img src = ${baseUrl + d.poster_path}></td>
                                    <td>${d.title}</td>
                                    <td>${d.original_language}</td>
                                    <td>${d.release_date}</td>`)
            }
            else{
                d3.json("/ratingsUserData&userId=" + currentUser).then(response => {
                    console.log(response);
                    totalMovies = response.length;
                    console.log("Total Movies - " + totalMovies);
                    movieId = response[0].movieId;
                    var title = response[0].title;
                    var language = response[0].original_language;
                    var poster = response[0].poster_path_full;
                    var releaseDate = response[0].release_date;
                    $("#title").text(title);
                    $("#language").text(language);
                    $("#poster").attr("src", poster);
                    $("#releaseDate").text(releaseDate);
                    ratedMovieStars = new StarRating(movieId,currentUser);
                    d3.select("tbody").selectAll("tr")
                        .data(response)
                        .enter() // creates placeholder for new data
                        .append("tr") // appends a div to placeholder
                        .html(d=> 
                                    `<td><img src = ${d.poster_path_full}></td>
                                    <td>${d.title}</td>
                                    <td>${d.original_language}</td>
                                    <td>${d.release_date}</td>`)
                                    });
            }
        });
    });
}

/*
 * Calling initialize function
 */
initialize();

/*
 * Rating Function Defination
 */
var rating = function(movieId, userRating, userId){
    var loadingModal = document.getElementById('loadingModal');
    loadingModal.style.display = "block";
    // Insert into table
    d3.json("/insertRatings&userId=" + userId + "&movieId=" + movieId + "&movieRating=" + userRating).then(response => {
        if(response.status){
            loadingModal.style.display = "none";
            window.location.reload();
        }
    });
}

/*
 * PLOTTING
 *
*/
function plotPopularMovies() {
    // plot setup
    var trace_popularity = {
        x: titles,
        y: popularity,
        name: 'popularity',
        type: 'bar',
        marker:{
            color : '#dc3545'
        }
    };   
    
    var data = [trace_popularity];
    var layout = {
        barmode: 'single',
        title: 'Top Loved Movies',
        height: 500,
        width: 500,
        xaxis: {
        tickangle: -25
        },
        yaxis: {
            title: "Popularity"
        },
        showlegend: false
    };
    // plot
    Plotly.newPlot('trending-graph', data, layout);
}

/*
 * Function for searching in the title column
 */ 
function searchByTitle() {
    var input, filter, table, tr, td, i;
    input = document.getElementById("searchTitle");
    filter = input.value.toUpperCase();
    table = document.getElementById("recomendations");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[1];
      if (td) {
        if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }       
    }
}

/*
 * Function for searching in the language column
 */
function searchByLanguage() {
    var input, filter, table, tr, td, i;
    input = document.getElementById("searchLanguage");
    filter = input.value.toUpperCase();
    table = document.getElementById("recomendations");
    tr = table.getElementsByTagName("tr");
    console.log(tr.length);
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[2];
      if (td) {
        if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }       
    }
}

/*
 * Function for searching in the release column
 */
function searchByReleaseDate() {
    var input, filter, table, tr, td, i;
    input = document.getElementById("searchReleaseDate");
    filter = input.value.toUpperCase();
    table = document.getElementById("recomendations");
    tr = table.getElementsByTagName("tr");
    for (i = 0; i < tr.length; i++) {
      td = tr[i].getElementsByTagName("td")[3];
      if (td) {
        if (td.innerHTML.toUpperCase().indexOf(filter) > -1) {
          tr[i].style.display = "";
        } else {
          tr[i].style.display = "none";
        }
      }       
    }
}