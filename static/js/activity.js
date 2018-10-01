var movies = [];
var imdb_scores = [];
var rotten_scores = [];
var meta_scores = [];
var popularity = [];

var titles = [];

var currentUser = window.sessionStorage.getItem("currentUser");
var customUser = window.sessionStorage.getItem("customUser");
console.log(customUser);
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
        if(customUser){
            d3.json("/ratingsUserData&userId=" + currentUser).then(response => {
                console.log(response);
                response.forEach(function(res){
                });
            });
        }
    });
    
}

/*
 * Calling initialize function
 */
initialize();

/*
 * Rating Function Defination
 */
var rating = function(){
    var movieId = 1;
    var userRating = 4;

    // Insert into table
    d3.json("/insertRatings&userId=" + currentUser + "&movieId=" + movieId + "&movieRating=" + userRating).then(response => {
        console.log(typeof(response));
        console.log(response);
        response.forEach(function(res){
        });
    });
    // 
}
/*
 * popularMovies Function Defination
 */
var popularMoviesRatings = function(){
    
    url = "https://www.omdbapi.com/?apikey=e6767b7c&t=";
    // Use the list of sample names to populate the select options
    titles.forEach((title) => {
        var movie = {};
        d3.json(url + title)
                .then(function(data) {
                    movie.title = data.Title;
                    movie.ratings = data.Ratings;
                    movies.push(movie); 
                    try{
                        for (i = 0; i < movies.length; i++) {
                            if (movies[i].ratings[0].Value && movies[i].ratings[1] && movies[i]   .ratings[2]){
                                imdb_scores.push(parseFloat(movies[i].ratings[0].Value));
                                rotten_scores.push(parseFloat(movies[i].ratings[1].Value));
                                meta_scores.push(parseFloat(movies[i].ratings[2].Value));
                                trending();
                            }else if (movies[i].ratings.length < 3) { 
                                    imdb_scores.push(0);
                                    rotten_scores.push(0);
                                    meta_scores.push(0);
                                    console.log("UNDEFINED");
                            }
                        }
                    }                   
                    catch(TypeError){
                        console.log("Movie Data Not Found!")
                    }  
                });
    });
}

/*
 * PLOTTING
 *
*/
function trending() {
    // plot setup
    var trace_imdb = {
        x: titles,
        y: imdb_scores.map(function (x) {return x*10}),
        name: 'IMDB',
        type: 'bar',
    };   
    var trace_rotten = {
        x: titles,
        y: rotten_scores,
        name: 'Rotten Tomatoes',
        type: 'bar'
    };
    var trace_meta = {
        x: titles,
        y: meta_scores,
        name: 'Metacritic',
        type: 'bar'
    };
    var data = [trace_imdb, trace_rotten, trace_meta];
    var layout = {
        barmode: 'group',
        title: 'Top Popular Movies',
        height: 500,
        width: 500,
        xaxis: {
        tickangle: -25
        },
        yaxis: {
            title: "Viewer Rating"
        },
        showlegend: false
    };
    // plot
    Plotly.newPlot('trending-graph', data, layout);
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

var current_star_statusses = [];

star_elements = $('.fa-star').parent();

star_elements.find(".fa-star").each(function(i, elem)
{
   current_star_statusses.push($(elem).hasClass('yellow'));
});

star_elements.find(".fa-star").mouseenter(changeRatingStars);
star_elements.find(".fa-star").mouseleave(resetRatingStars);

/**
* Changes the rating star colors when hovering over it.
*/
function changeRatingStars()
{
    // Current star hovered
    var star = $(this);

    // Removes all colors first from all stars
    $('.fa-star').removeClass('gray').removeClass('yellow');

    // Makes the current hovered star yellow
    star.addClass('yellow');

    // Makes the previous stars yellow and the next stars gray
    star.parent().prevAll().children('.fa-star').addClass('yellow');
    star.parent().nextAll().children('.fa-star').addClass('gray');
    }

/**
* Resets the rating star colors when not hovered anymore.
*/
function resetRatingStars()
{
    star_elements.each(function(i, elem)
                    {
    $(elem).removeClass('yellow').removeClass('gray').addClass(current_star_statusses[i] ? 'yellow' : 'gray');
    });
}