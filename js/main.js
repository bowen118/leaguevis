/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches
let scatterPlotVis, lineChartVis, innovativeVis;

let promises = [
    d3.csv("data/players.csv"),
    d3.csv("data/teams.csv"),
    d3.csv("data/normalized_teams.csv"),
    d3.csv("data/coords.csv")
]

Promise.all(promises).then(data => initMainPage(data)).catch(err => console.log(err))

function initMainPage(dataArray) {
    const [playersData, teamsData, normalizedTeamsData, coords] = dataArray
    innovativeVis = new Innovative("start", teamsData, normalizedTeamsData, coords)
    lineChartVis = new LineChart("page4", teamsData)
    scatterPlotVis = new ScatterPlot("explore", playersData, teamsData)
}

function dataChange(isPlayer, isFilter = false) {
    scatterPlotVis.wrangleData(isPlayer, isFilter)
}