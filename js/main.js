/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches
let regionBar, regionCount;
let scatterPlotVis;

let promises = [
    d3.csv("data/players.csv"),
    d3.csv("data/teams.csv"),
    d3.csv("data/overall_worlds_msi.csv")
]

Promise.all(promises).then(data => initMainPage(data)).catch(err => console.log(err))

function initMainPage(dataArray) {
    const [playersData, teamsData, tournament_data] = dataArray
    regionBar = new RegionBarChart("region-bar", tournament_data)
    regionCount = new RegionCountChart("region-count")
    // scatterPlotVis = new ScatterPlot("explore", playersData, teamsData)
}

function categoryChange() {
    let selectedCategory = $('#categorySelector').val();
    regionBar.wrangleData(selectedCategory);
}

function dataChange(isPlayer) {
    // scatterPlotVis.wrangleData(isPlayer)
}