
var movies = [];
var actorArr = [];
var genreDisplay = ['Crime', 'Action', 'Adventure', 'Thriller', 'Fantasy', 'Family', 'Science                           Fiction', 'Horror', 'Drama', 'Romance', 'Comedy', 'Animation', 'Mystery',                         'Music', 'Western', 'War', 'Foreign', 'History', 'Documentary'];
var monthDisplay = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',                                            'Sep', 'Oct', 'Nov', 'Dec'];
var selectedYear, selectedMonth, selectedGenre, selectedDirector, selectedActor;

var movies_filtered = [];

var actors = []
var awards = []
var budgets = []
var directors = []
var genres = []
var months = []
var ratings = []
var releaseDates = []
var revenues = []
var rois = []
var titles = []
var years = []

var imdb_scores = []
var rotten_scores = []
var meta_scores = []

var number_awards = []

/*
 * Initialize Function Defination
 */
var initialize = function(){
    
    url = "https://www.omdbapi.com/?apikey=e6767b7c&t="
    // Use the list of sample names to populate the select options
    d3.json("/data").then(response => {
        var respLength = response.length;
        response.forEach((response) => {
            var movie = {};
            movie.title = response.title;
            movie.revenue = response.revenue;
            movie.budget = response.budget;
            movie.releaseDate = response.release_date;
            var currentROI = (response.revenue - response.budget) / (response.budget);
            movie.roi = currentROI;
            var currentTitle = response.title;
            try{
                d3.json(url + currentTitle)
                .then(function(data) {
                    movie.director = data.Director;
                    movie.actor = data.Actors;
                    movie.year = data.Year;
                    movie.ratings = data.Ratings;
                    movie.awards = data.Awards;
                    movie.genre = data.Genre;
                    movie.director = data.Director;
                    movie.month = data.Released.slice(3,6);
                    movies.push(movie);
                })
                .finally(function() { 
                    try{
                        if (movies.map(d => d.director).length === respLength) {
                            getActorList();
                            fillYearDropdown();
                            fillMonthDropdown();
                            fillGenreDropdown();
                            fillDirectorDropdown();
                            fillActorDropdown();
                            
                           
                        }
                        // printData(); 
                    }
                    catch(TypeError){
                        console.log("Type Error Caught!");
                    }
                });
            }
            catch(TypeError){
                console.log("Movie Data Not Found!")
            }  
        });
    });
}
/*
 * Calling initialize function
 */
initialize();

/*
 * Filling Up Several Dropdowns
 */
function fillYearDropdown(){
    var div = document.getElementById("year-dropdown");
    yearList = movies.map(d => d.year)
    for(var i = 0; i < yearList.length; i++) {
        var opt = yearList[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        el.className = "dropdown-item";
        div.appendChild(el);
    }
}

function fillMonthDropdown(){
    var div = document.getElementById("month-dropdown");
    for(var i = 0; i < monthDisplay.length; i++) {
        var opt = monthDisplay[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        el.className = "dropdown-item";
        div.appendChild(el);
    }
}

function fillGenreDropdown(){
    var div = document.getElementById("genre-dropdown");
    for(var i = 0; i < genreDisplay.length; i++) {
        var opt = genreDisplay[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        el.className = "dropdown-item";
        div.appendChild(el);
    }
}

function fillDirectorDropdown(){
    var div = document.getElementById("director-dropdown");
    dirList = movies.map(d => d.director)
    for(var i = 0; i < dirList.length; i++) {
        var opt = dirList[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        el.className = "dropdown-item";
        div.appendChild(el);
    }
}

function fillActorDropdown(){

    var div = document.getElementById("actor-dropdown");
    for(var i = 0; i < actorArr.length; i++) {
        var opt = actorArr[i];
        var el = document.createElement("option");
        el.textContent = opt;
        el.value = opt;
        el.className = "dropdown-item";
        div.appendChild(el);
    }
}

function printData(){
    console.log(director);
    console.log(year);
    console.log(actor);
    console.log(ratings);
    console.log(production);
    console.log(awards);
    console.log(rated);
    console.log(roi);
    console.log("--------------"); 
}

/*
 * Putting All the Actors in a single list
 *
*/
function getActorList(){
    var slicedActor;
    var tempActorArray = [];
    var tempActorNames = [];
    movies.forEach((result) => {
        var tempActorString = result.actor;
        slicedActor = tempActorString.split(",");
        tempActorArray.push(slicedActor);
    });
    tempActorNames = tempActorArray.reduce((acc, val) => acc.concat(val), []);
    $.each(tempActorNames, function(i, el){
        if($.inArray(el, actorArr) === -1) actorArr.push(el);
});
}

/*
 * Code To Navigate Between The Tabs
 *
*/
$(document).ready(function(){

    $("#trending-graph").show();
    $("#ratings-graph").hide();
    $("#genre-graph").hide();
    $("#financial-graph").hide();

    $("#trending").css("font-weight", "bold");
    $("#trending").css("color", "red");
    $("#ratings").css("color", "blue");
    $("#financial").css("color", "blue");
    $("#genre").css("color", "blue");
    
    $("#trending").css({"font-size": "20px"});

    $(".modal").show();

    

    $("#financial").click(function() {
        $("#trending-graph").hide();
        $("#ratings-graph").hide();
        $("#genre-graph").hide();
        $("#financial-graph").show();
        $("#financial").css("font-weight", "bold");
        $("#trending").css("font-weight", "normal");
        $("#ratings").css("font-weight", "normal");
        $("#genre").css("font-weight", "normal");
        $("#financial").css("color", "red");
        $("#trending").css("color", "blue");
        $("#ratings").css("color", "blue");
        $("#genre").css("color", "blue");

        $("#financial").css({"font-size": "20px"});
        $("#trending").css({"font-size": "16px"});
        $("#genre").css({"font-size": "16px"});
        $("#ratings").css({"font-size": "16px"});
    });

    $("#ratings").click(function() {
        $("#trending-graph").hide();
        $("#financial-graph").hide();
        $("#genre-graph").hide();
        $("#ratings-graph").show();

        $("#ratings").css("font-weight", "bold");
        $("#trending").css("font-weight", "normal");
        $("#financial").css("font-weight", "normal");
        $("#genre").css("font-weight", "normal");

        $("#ratings").css("color", "red");
        $("#trending").css("color", "blue");
        $("#financial").css("color", "blue");
        $("#genre").css("color", "blue");

        $("#ratings").css({"font-size": "20px"});
        $("#trending").css({"font-size": "16px"});
        $("#genre").css({"font-size": "16px"});
        $("#financial").css({"font-size": "16px"});
    });

    $("#trending").click(function() {
        $("#genre-graph").hide();
        $("#financial-graph").hide();
        $("#ratings-graph").hide();
        $("#trending-graph").show();

        $("#trending").css("font-weight", "bold");
        $("#genre").css("font-weight", "normal");
        $("#financial").css("font-weight", "normal");
        $("#ratings").css("font-weight", "normal");

        $("#trending").css("color", "red");
        $("#genre").css("color", "blue");
        $("#financial").css("color", "blue");
        $("#ratings").css("color", "blue");

        $("#trending").css({"font-size": "20px"});
        $("#financial").css({"font-size": "16px"});
        $("#genre").css({"font-size": "16px"});
        $("#ratings").css({"font-size": "16px"});
    });

    $("#genre").click(function() {
        $("#trending-graph").hide();
        $("#financial-graph").hide();
        $("#ratings-graph").hide();
        $("#genre-graph").show();

        $("#genre").css("font-weight", "bold");
        $("#trending").css("font-weight", "normal");
        $("#financial").css("font-weight", "normal");
        $("#ratings").css("font-weight", "normal");

        $("#genre").css("color", "red");
        $("#trending").css("color", "blue");
        $("#financial").css("color", "blue");
        $("#ratings").css("color", "blue");

        $("#genre").css({"font-size": "20px"});
        $("#trending").css({"font-size": "16px"});
        $("#financial").css({"font-size": "16px"});
        $("#ratings").css({"font-size": "16px"});
    });

    $("#submit").click(function() {
        var year = document.getElementById("year-dropdown");
        selectedYear = year.options[year.selectedIndex].value;

        var month = document.getElementById("month-dropdown");
        selectedMonth = month.options[month.selectedIndex].value;

        var genre = document.getElementById("genre-dropdown");
        selectedGenre = genre.options[genre.selectedIndex].value;

        var director = document.getElementById("director-dropdown");
        selectedDirector = director.options[director.selectedIndex].value;

        var actor = document.getElementById("actor-dropdown");
        selectedActor = actor.options[actor.selectedIndex].value;

        // console.log(selectedYear);
        // console.log(selectedMonth);
        // console.log(selectedGenre);
        // console.log(selectedDirector);
        // console.log(selectedActor);
    

        if (selectedYear === "SELECT YEAR") {
            selectedYear = ""
        }
        if (selectedMonth === "SELECT MONTH") {
            selectedMonth= ""
        }
        if (selectedGenre === "SELECT GENRE") {
            selectedGenre = ""
        }
        if (selectedDirector === "SELECT DIRECTOR") {
            selectedDirector = ""
        }
        if (selectedActor === "SELECT ACTOR") {
            selectedActor = ""
        }

        console.log(selectedYear);
        console.log(selectedMonth);
        console.log(selectedGenre);
        console.log(selectedDirector);
        console.log(selectedActor);

        
        empty();
        filter();
        format();
        separate_ratings();
        extract_awards();
        trending();
        threed_scatter();
        bubble();
        
        
    });
});

/*
 * DATA MUNGING
 *
*/

function filter() {
    movies_filtered = [];
    movies_filtered.push(movies.filter(movies => movies.year.includes(selectedYear) && movies.actor.includes(selectedActor) && movies.month.includes(selectedMonth) && movies.genre.includes(selectedGenre) && movies.director.includes(selectedDirector)))
}

function format() {
    for (let i = 0; i < movies_filtered[0].length; i++) {
        actors.push(movies_filtered[0][i].actor)
        awards.push(movies_filtered[0][i].awards)
        budgets.push(movies_filtered[0][i].budget)
        directors.push(movies_filtered[0][i].director)
        genres.push(movies_filtered[0][i].genre)
        months.push(movies_filtered[0][i].month)
        ratings.push(movies_filtered[0][i].ratings)
        releaseDates.push(movies_filtered[0][i].releaseDate)
        revenues.push(movies_filtered[0][i].revenue)
        rois.push(movies_filtered[0][i].roi)
        titles.push(movies_filtered[0][i].title)
        years.push(movies_filtered[0][i].year)
    };
}

function separate_ratings() {
    
    for (i = 0; i < ratings.length; i++) {
        if (ratings[i][0].Value && ratings[i][1] && ratings[i][2]){
            imdb_scores.push(parseFloat(ratings[i][0].Value))
            rotten_scores.push(parseFloat(ratings[i][1].Value))
            meta_scores.push(parseFloat(ratings[i][2].Value))
        }
        else if (ratings[i].length < 3) { 
            imdb_scores.push(0)
            rotten_scores.push(0)
            meta_scores.push(0)
            console.log("UNDEFINED")
        }
    
        
    }
}


function extract_awards() {
    for (var i = 0; i < awards.length; i++) {
        var numbers = []
        var numbers = awards[i].match(/\d+/g).map(Number)
        var sum = 0
        for (var j = 0; j <numbers.length; j++) {
        sum += numbers[j]
        } 
            number_awards.push(sum)
        };
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
            title: 'Ratings by Website',
            height: 800,
            width: 1000,
            xaxis: {
            tickangle: -25
            },
            yaxis: {
                title: "Viewer Rating"
            },
            
        };
    
        // plot
        Plotly.newPlot('trending-graph', data, layout);
    
    }

function threed_scatter() {
    var average_scores = []

    for (i = 0; i < ratings.length; i++) {
        average_scores.push(((imdb_scores[i] * 10) + rotten_scores[i] + meta_scores[i])/3)        
        }
    
    var trace1 = {
        x: average_scores, y: rois, z: number_awards,
        mode: 'markers',
        text: titles,
        marker: {
            size: 12,
            line: {
            color: 'black',
            width: 0.5
        },
        opacity: 0.8},
        type: 'scatter3d',
    };
    

    var layout = {
        scene:{
            xaxis: {
             backgroundcolor: "rgb(200, 200, 230)",
             gridcolor: "rgb(255, 255, 255)",
             showbackground: true,
             zerolinecolor: "rgb(255, 255, 255)",
             title: 'Viewer Rating'
            }, 
            yaxis: {
             backgroundcolor: "rgb(230, 200,230)",
             gridcolor: "rgb(255, 255, 255)",
             showbackground: true,
             zerolinecolor: "rgb(255, 255, 255)",
             title: 'Return on Investment',
             
            }, 
            zaxis: {
             backgroundcolor: "rgb(230, 230,200)",
             gridcolor: "rgb(255, 255, 255)",
             showbackground: true,
             zerolinecolor: "rgb(255, 255, 255)",
             title: 'Number of Awards and Nominations'
            }},
        height: 800,
        width: 1000,
        autosize: true,
        tickangle: -95,
        margin: {
            l: 0,
            r: 0,
            b: 50,
            t: 50,
            pad: 4
        },
    };

    Plotly.newPlot('ratings-graph', [trace1], layout);
}

function bubble() {
    var average_scores = []

    for (i = 0; i < ratings.length; i++) {
        average_scores.push(((imdb_scores[i] * 10) + rotten_scores[i] + meta_scores[i])/3)        
        }
    

    var trace1 = {
        x: budgets,
        y: revenues,
        text: titles,
        mode: 'markers',
        marker: {
          size: average_scores.map(function (x) {return x*0.4})
        }
      };
      
      var data = [trace1];
      
      var layout = {
        title: 'Revenue vs Budget \n Bubble Size = Average Viewer Rating',
        showlegend: false,
        height: 800,
        width: 1000,
        yaxis: {
            title: "Viewer Rating"
        },
        xaxis: {title: "Budget"},
        yaxis: {title: "Revenue"},
        backgroundcolor: "black"
      };
      
      Plotly.newPlot('financial-graph', data, layout);
}

function empty() {
    
movies_filtered.length = 0;

actors.length = 0;
awards.length = 0;

budgets.length = 0;
directors.length = 0;
 genres.length = 0
 months.length = 0
 ratings.length = 0
 releaseDates.length = 0
 revenues.length = 0
 rois.length = 0
 titles.length = 0
 years.length = 0

 imdb_scores.length = 0
 rotten_scores.length = 0
 meta_scores.length = 0

 number_awards.length = 0

};