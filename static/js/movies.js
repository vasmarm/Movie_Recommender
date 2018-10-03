const users = [];
var currentUser;
/*
 * Initialize Function Defination
 */
var initialize = function(){
    
    // Use the list of sample names to populate the select options
    d3.json("/data").then(response => {
        var respLength = response.length;
        var users = [];
        console.log(respLength);
        response.forEach((response) => {
          users.push(response.userId);
        });
        console.log(users);
        var div = document.getElementById("user-dropdown");
        for(var i = 0; i < users.length; i++) {
            var opt = users[i];
            var el = document.createElement("option");
            el.textContent = opt;
            el.value = opt;
            el.className = "dropdown-item";
            div.appendChild(el);
        }
        $("#existingSubmit").click(function() {
            var userId = document.getElementById("user-dropdown");
            currentUser = userId.options[userId.selectedIndex].value;
            if(currentUser !== 'SELECT'){
                console.log(currentUser);
                window.sessionStorage.setItem("currentUser", currentUser)
                // window.sessionStorage.setItem("newUser", false)
                window.location = "/activity";
            }else{
                document.getElementById("dropDownAlert").style.visibility = "visible";
            }
        });
        
        $("#newSubmit").click(function(e) {
            e.preventDefault();
            currentUser = document.getElementById("newUserId").value;
            var userFound = users.includes(currentUser);
            if(currentUser && userFound === false){
                console.log(currentUser);
                window.sessionStorage.setItem("currentUser", currentUser);
                // window.sessionStorage.setItem("newUser", true)
                window.location = "/activity";
            }else{
                document.getElementById("textboxAlert").style.visibility = "visible";
            }
        });
    });
}

/*
 * Calling initialize function
 */
initialize();
