/* * * * * * * * * * * * * *
*    class scatterplot     *
* * * * * * * * * * * * * */
let ineligibleOrdinalColumns = ["", "gameid", "league", "champion", "date", "game", "player", "playerid", "playoffs", "position", "result", "side", "year", "ban1", "ban2", "ban3", "ban4", "ban5", "team", "year"]

class ScatterPlot {
    constructor(parentElement, playerData, teamData) {
        this.parentElement = parentElement
        this.playerData = playerData.filter(d => d.league === "WCS")
        this.teamData = teamData.filter(d => d.league === "WCS")
        this.displayData = []
        this.dummyData = []
        this.dataState = true

        this.initVis()
    }

    initVis() {
        let vis = this

        vis.margin = {top: 20, right: 100, bottom: 100, left: 50}
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`)

        // add title
        vis.title = vis.svg.append('g')
            .attr('class', 'title scatter-plot-title')
            .append('text')
            .text("Correlation Between Damage to Champions & Earned Gold")
            .attr("transform", `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle')
            .style("fill", "white")

        // Scales and axes
        vis.x = d3.scaleLinear().range([0, vis.width])
        vis.y = d3.scaleLinear().range([vis.height, 0])
        vis.xAxis = d3.axisBottom().scale(vis.x)
        vis.yAxis = d3.axisLeft().scale(vis.y)

        vis.svg.append("g").attr("class", "x-axis axis").attr("transform", "translate(0," + (vis.height ) + ")")
        vis.svg.append("g").attr("class", "y-axis axis")

        this.wrangleData()
    }

    wrangleData(isPlayer = true, isFilter, isSpecificFilter = false) {
        let vis = this

        let xAxisSelect = document.getElementById("filter-x-axis")
        let yAxisSelect = document.getElementById("filter-y-axis")
        let teamSelect = document.getElementById("filter-by")

        if (!isFilter) {
            vis.displayData = isPlayer ? vis.playerData : vis.teamData
            vis.dummyData = vis.displayData
            let availableAxis = Object.keys(vis.displayData[0]).filter(axis => ineligibleOrdinalColumns.indexOf(axis) < 0)
            availableAxis.forEach(axis => {
                let opt = document.createElement("option")
                opt.value = axis
                opt.innerHTML = axis
                if (axis === "damagetochampions") {
                    opt.selected = true
                }

                let opt2 = document.createElement("option")
                opt2.value = axis
                opt2.innerHTML = axis
                if (axis === "earnedgold") {
                    opt2.selected = true
                }

                xAxisSelect.appendChild(opt)
                yAxisSelect.appendChild(opt2)
            })

            let allTeamsOrPlayers = vis.displayData.map(d => isPlayer ? d.player : d.team)
            allTeamsOrPlayers = new Set(allTeamsOrPlayers)
            allTeamsOrPlayers = Array.from(allTeamsOrPlayers)
            allTeamsOrPlayers.push("all")
            allTeamsOrPlayers.forEach(d => {
                let opt = document.createElement("option")
                opt.value = d
                opt.innerHTML = d
                if (d === "all") {
                    opt.selected = true
                }

                teamSelect.appendChild(opt)
            })
        }

        vis.selectedSpecific = teamSelect.options[teamSelect.selectedIndex].value
        if (isSpecificFilter && vis.selectedSpecific !== "all") {
            vis.displayData = vis.dummyData.filter(d => vis.dataState ? d.player === vis.selectedSpecific : d.team === vis.selectedSpecific)
        }

        vis.selectedValX = xAxisSelect.options[xAxisSelect.selectedIndex].value
        vis.selectedValY = yAxisSelect.options[yAxisSelect.selectedIndex].value

        vis.title.text(`Correlation Between ${vis.selectedValX} & ${vis.selectedValY}`)

        this.updateVis()
    }

    updateVis() {
        let vis = this

        // set domains for scales
        vis.x.domain([0, d3.max(vis.displayData, function(d) { return +d[vis.selectedValX] })])
        vis.y.domain([0, d3.max(vis.displayData, function(d) { return +d[vis.selectedValY] })])

        vis.svg.select(".x-axis").transition().call(vis.xAxis)
        vis.svg.select(".y-axis").transition().call(vis.yAxis)

        let scatterDots = vis.svg.selectAll("dot").data(vis.displayData)

        vis.svg.selectAll("circle").data(vis.displayData).exit().remove()
        vis.svg.selectAll(".scatters").data(vis.displayData).exit().remove()

        // enter & update
        scatterDots.enter().append("circle")
            .attr("class", "scatters")
            .attr("cx", function (d) { return vis.x(+d[vis.selectedValX]); } )
            .attr("cy", function (d) { return vis.y(+d[vis.selectedValY]); } )
            .attr("r", 3)
            .style("fill", "#69b3a2")
    }

    alterDataState(dataState) {
        let vis = this
        vis.dataState = dataState
    }
}