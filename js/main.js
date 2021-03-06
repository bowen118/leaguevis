/* * * * * * * * * * * * * *
*           MAIN           *
* * * * * * * * * * * * * */

// init global variables & switches
let regionBar, regionCount, scatterPlotVis, areaChartVis, dotPlotVis, lineChartVis, kdeVis, innovativeVis;

let promises = [
    d3.csv("data/players.csv"),
    d3.csv("data/teams.csv"),
    d3.csv("data/overall_worlds_msi.csv"),
    d3.csv("data/normalized_teams.csv"),
    d3.csv("data/coords.csv"),
    d3.csv("data/kill_coords.csv")
]

Promise.all(promises).then(data => initMainPage(data)).catch(err => console.log(err))

function initMainPage(dataArray) {
    const [playersData, teamsData, tournament_data, normalizedTeamsData, coords, killCoords] = dataArray
    regionBar = new RegionBarChart("region-bar", tournament_data)
    regionCount = new RegionCountChart("region-count")
    innovativeVis = new Innovative("start", teamsData, normalizedTeamsData, coords)
    areaChartVis = new AreaChart("area-banrates", "area-histogram", teamsData)
    dotPlotVis = new DotPlot("gold-dotplot", "farm-dotplot", "xp-dotplot", "kills-dotplot", teamsData)
    kdeVis = new KDE("kde", killCoords)
    scatterPlotVis = new ScatterPlot("explore", playersData, teamsData)
}

function dataChange(isPlayer, isFilter = false, isSpecificFilter = false, shouldChangeDataState = false) {
    scatterPlotVis.wrangleData(isPlayer, isFilter, isSpecificFilter)
    if (shouldChangeDataState) {
        scatterPlotVis.alterDataState(isPlayer)
    }
}

function categoryChange() {
    let selectedCategory = $('#categorySelector').val();
    regionBar.wrangleData(selectedCategory);
}

function sideChange() {
    let selectedSide = $('#sideSelector').val();
    kdeVis.wrangleData(selectedSide);
}