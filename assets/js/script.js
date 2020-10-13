/*-----------------------------------NAVIGATION---------------------------------*/
// Add class "nav-active" to <body> when #menu-btn is clicked
document.getElementById("menu-btn").addEventListener("click", function (event) {
    event.preventDefault(); // stops the element from doing it's usual stuff
    document.getElementById("body-id").classList.add("nav-active");
});

// remove class "nav-active" from <body> when #menu-btn-close is clicked
document.getElementById("menu-btn-close").addEventListener("click", function (event) {
    event.preventDefault(); // stops the element from doing it's usual stuff
    document.getElementById("body-id").classList.remove("nav-active");
});



/*-----------------------------------WORDPRESS---------------------------------*/

// these variables' values depend on the WordPress instance - independent from the (web)app's execution
const apiUrl = 'http://tamdem2.dreamhosters.com/wp-json/wp/v2/';
const apiKey = '34mfydZbxr50a8fE1LKT9TL2oKaygXLm';
const catStageId = 7;
const catPerformanceId = 6;


// these variables hold information depending on the app's execution
let performanceData; // all posts with category 'performance' from WP
let stagePosts; // all posts with category 'stage' from WP


// these variables refer to DOM elements; 'static' containers - invariable between executions of the app

const stages = document.querySelector('#stages-wrap');
const performances = document.querySelector('#performances-wrap');
const stageSelector = document.querySelector('#stage-selector-ddl');
const performanceDetails = document.querySelector('#band-details');
const modalPanel = document.querySelector('#modal-panel');

// *** END global variables ***


// *** BEGIN execution ***
initPage();
// *** END execution ***



// initPage() - initialises the page
function initPage() {
    console.log('initPage()');

    // get all stages from WP
    getStagesFromWP();

    //get all stage options for stage selector
    getStageOptionsFromWP();

    // get all stages from WP
    getPerformancesFromWP();

    modalPanel.addEventListener('click', () => {
        modalPanel.classList.remove('active');
    });

}

// getStagesFromWP() - gets all stage-category posts from WP and displays it on stages page
function getStagesFromWP() {
    console.log('getStagesFromWP()');
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            try {
                let stageData = JSON.parse(this.responseText);
                stageData.forEach(stage => {
                    let newStage = document.createElement('article');
                    newStage.classList.add('stage-molecule');
                    newStage.innerHTML = `
                  <div class="stage-pic" style='background-image: url(${stage.acf.stage_picture.url})'>
                        <div class="box red">audience<br>capacity<br>${stage.acf.stage_capacity}</div>
                    </div>
                    <div>
                        <h2><mark class="green">${stage.acf.stage_name}</mark></h2>
                        <p><mark class='blue'>${stage.acf.stage_description}</mark></p>
                    </div>
                    `;
                    stages.appendChild(newStage);
                });
            } catch (error) {
                errorMessage(`Error parsing JSON: ${error}`);
            }
        }
        if (this.readyState == 4 && this.status > 400) {
            errorMessage('An error has occured while getting the data. Please try again later!');
        }
    }
    xhttp.open('GET', `${apiUrl}posts?categories=${catStageId}`, true);
    xhttp.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhttp.send();
}


// getPerformancesFromWP() - gets all performance-category posts and displays it on program page
function getPerformancesFromWP() {
    console.log('getPerformancesFromWP()');
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            try {
                performanceData = JSON.parse(this.responseText);
                performanceData.forEach(performance => {
                    let newPerformance = document.createElement('article');
                    newPerformance.classList.add('band-teaser');
                    newPerformance.dataset.id = performance.id;
                    newPerformance.addEventListener('click', function () {
                        renderPerformance(this.dataset.id);
                        modalPanel.classList.add('active');
                    });
                    newPerformance.innerHTML = `
                    <div class="band-pic" style='background-image: url(${performance.acf.band.picture.url})'>
                        <div class="box red">${performance.acf.organization.day}<br>${performance.acf.organization.time}</div>
                    </div>
                    <div class="band-teaser-text">
                        <label class="club"><mark class="blue">${performance.acf.band.youth_club}<br>${performance.acf.band.city}, ${performance.acf.band.country}</mark></label>
                        <label><mark class="green">${performance.acf.organization.stage.post_title}</mark></label>
                        <h2><mark class="yellow">${performance.acf.band.name}</mark></h2>
                    </div>
                    `;
                    performances.appendChild(newPerformance);
                });
            } catch (error) {
                errorMessage(`Error parsing JSON: ${error}`);
            }
        }
        if (this.readyState == 4 && this.status > 400) {
            errorMessage('An error has occured while getting the data. Please try again later!');
        }
    }
    xhttp.open('GET', `${apiUrl}posts?categories=${catPerformanceId}`, true);
    xhttp.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhttp.send();
}

// getStageOptionsFromWP() - gets all stage-category posts from WP and populates the stageSelector drop-down list with the info
function getStageOptionsFromWP() {
    console.log('getStageOptionsFromWP()');
    const xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState == 4 && this.status == 200) {
            try {
                let stageOptions = JSON.parse(this.responseText);
                stageOptions.forEach(stageop => {
                    let newOption = document.createElement('option');
                    newOption.value = stageop.id;
                    newOption.text = stageop.acf.stage_name;
                    stageSelector.appendChild(newOption);
                });
            } catch (error) {
                errorMessage(`Error parsing JSON: ${error}`);
            }
        }
        if (this.readyState == 4 && this.status > 400) {
            errorMessage('An error has occured while getting stage options data. Please try again later!');
        }
    }
    xhttp.open('GET', `${apiUrl}posts?categories=${catStageId}`, true);
    xhttp.setRequestHeader('Authorization', `Bearer ${apiKey}`);
    xhttp.send();
}

// renderEvent(id) - finds the event its id in the eventPosts array and renders the event in the eventDetails article;
//                   NB! does something only if the id is different from the current data-id of eventDetails
function renderPerformance(id) {
    console.log(`renderPerformance(${id})`);
    if (id != performanceDetails.dataset.id) {
        performanceDetails.innerHTML = '';
        performanceData.forEach(performance => {
            if (id == performance.id) {
                performanceDetails.dataset.id = id;
                performanceDetails.innerHTML = `
                
                <div class="flex-wrap">
                <div class="teaser-container">
                    <div class="band-pic" style="background-image: url(${performance.acf.band.picture.url})">
                        <div class="box red">${performance.acf.organization.day}<br>${performance.acf.organization.time}</div>
                    </div>
                    <div class="band-teaser-text">
                    <label class="club"><mark class="blue">${performance.acf.band.youth_club}<br>${performance.acf.band.city}, ${performance.acf.band.country}</mark></label>
                    <label><mark class="green">${performance.acf.organization.stage.post_title}</mark></label>
                    <h2><mark class="yellow">${performance.acf.band.name}</mark></h2>
                    </div>
                </div>
                <div class="description-container">
                <p class="band-description">${performance.acf.band.description}</p>
                <div class="band-parameters">
                <h3>Genre:</h3>
                <p>${performance.acf.band.genre}</p>
                <h3>Age range:</h3>
                <p>${performance.acf.band.min_age} - ${performance.acf.band.max_age}</p>
                <h3>Experience level:</h3>
                <p>${performance.acf.band.experience_level}</p>
            </div>
                <div class="some">
                    <a href="${performance.acf.band.facebook}"><i class="fab fa-facebook-f"></i></a>
                    <a href="${performance.acf.band.instagram}"><i class="fab fa-instagram"></i></a>
                    <a href="${performance.acf.band.youtube}"><i class="fab fa-youtube-square"></i></a>
                </div>
            </div>
        </div>
                `;
            }
        });
    }
}



function errorMessage(msg) {
    console.log(msg);
}












/*-----------------------------------THINGS WE TRIED TO DO BEFORE WE GOT TOO OVERWHELMED---------------------------------*/


/*
// renderResults() - iterates through performancePosts and filters for day and stage (if chosen) and renders the performances in the results
function renderResults() {
    console.log('renderResults()');
    let isStageSelected = true;
    if (stageSelector.value < 0) {
        isStageSelected = false;
    }
    performancePosts.forEach(performance => {
        // NB! for the 'new Date(event.acf.date)' to work, you have to change the date render format
        // for the acf date picker field in WP (and update the event posts)
        // ACF date picker field type: return format should be CUSTOM: Y-m-d 
        let performanceDay = new Date(performance.acf.organization.date);
        if (isStageSelected) {
            if ((performanceDay == day) && (performance.acf.organization.stage.ID == stageSelector.value)) {
            return 'test'
        } else {
            if (performanceDay == day) {
               return 'test again' 
            }
        }
    }});
}

// renderPerformance(id) - finds the performance its id in the performancePosts array and renders the performance in the performanceDetails article;
//                   NB! does something only if the id is different from the current data-id of performanceDetails
function renderPerformance(id) {
    console.log(`renderPerformance(${id})`);
    if (id != performancetDetails.dataset.id) {
        performanceDetails.innerHTML = '';
        performancePosts.forEach(performance => {
            if (id == performance.id) {
                performanceDetails.dataset.id = id;
                performanceDetails.innerHTML = ``;
            }
        });
    }
}

// clears all performances from the results
function clearResults() {
    console.log('clearResults()');
    lineUp.forEach(lineUp => {
        lineUp.innerHTML = '';
    });
}

// errorMessage(msg) - displays error message
function errorMessage(msg) {
    console.log(msg);
}

//-----------------------------------WORDPRESS SEARCH TOOL---------------------------------

initSearchTool();

function initSearchTool(){
   
    document.querySelector('#searchInput').addEventListener('keyup', function(event){
        if (event.keyCode == 13){
            doSearch();
        }
    });
}

function doSearch(){
    const searchTerm = document.querySelector('#searchInput').value.trim();
    document.querySelector('#searchInput').value = searchTerm;
    if (searchTerm != ''){
        resultsClear(); //getting rid of possible previous search results
        getResults(searchTerm);

    }
}

function resultsClear(){
    document.querySelector('#searchResult').innerHTML = '';  
};

function getResults(searchTerm){
        const xhttp = new XMLHttpRequest();
        xhttp.onreadystatechange = function (){
            if (this.readyState == 4 && this.status == 200){
                try {
                    let data = JSON.parse(this.responseText);
                    outpuResult(data);
                } catch(error){
                    errorMessage(`Error parsing JSON: <span class='errorMsg'>${error}`)
                }
            }
            if (this.readyState == 4 && this.status > 400){
                errorMessage('An error has occured while getting the data, please try again later')
            }

        }
        xhttp.open('GET', 
        `${apiUrl}posts?categories=${catPerformanceId}`
        ,true);
        xhttp.send();
};

function errorMessage(message){
    document.querySelector('#searchResult').innerHTML = `<p class='errorMsg'>${message}</p>`
}

function outpuResult(data){
    //console.log(data);
    const result = `
        ${listResults(data.query.search)}
    `;
    document.querySelector('#searchResult').innerHTML = result;
}

function listResults(results){
    let itemList = '';
    for (let i = 0; i < results.length; i++){
        const item = results[i];
        itemList += `
        test!!
		<div class="band-pic">
		<div class="box red">Friday<br>19:00</div>
	</div>
	<div class="band-teaser-text">
	<label class="club"><mark class="blue">Ungdomklub<br>Odense, Denmark</mark></label>
	<label><mark class="green">Royal stage</mark></label>
	<h2><mark class="yellow">Mediocre hair day</mark></h2>
	</div>
        `;
    }
    return itemList;
}

*/