/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches
let scatterPlotVis;

let promises = [
    d3.csv("data/players.csv"),
    d3.csv("data/teams.csv")
]

Promise.all(promises).then(data => initMainPage(data)).catch(err => console.log(err))

function initMainPage(dataArray) {
    const [playersData, teamsData] = dataArray
    scatterPlotVis = new ScatterPlot("explore", playersData, teamsData)
}

function dataChange(isPlayer) {
    scatterPlotVis.wrangleData(isPlayer)
}