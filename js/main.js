/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches
let scatterPlotVis, innovativeVis;

let promises = [
    d3.csv("data/players.csv"),
    d3.csv("data/teams.csv"),
    d3.csv("data/normalized_team.csv")
]

Promise.all(promises).then(data => initMainPage(data)).catch(err => console.log(err))

function initMainPage(dataArray) {
    const [playersData, teamsData, normalizedTeamsData] = dataArray
    scatterPlotVis = new ScatterPlot("explore", playersData, teamsData)
    innovativeVis = new Innovative("start", normalizedTeamsData)
}

function dataChange(isPlayer, isFilter = false) {
    scatterPlotVis.wrangleData(isPlayer, isFilter)
}