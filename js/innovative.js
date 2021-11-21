/* * * * * * * * * * * * * *
*    class innovative      *
* * * * * * * * * * * * * */
let normalizedColumns = ["team kpm", "dragons", "heralds", "barons", "towers", "inhibitors", "dpm", "vspm", "earned gpm", "cspm", "xpdiffat15"]
let colors = ['#3cb44b', '#ffe119', '#4363d8', '#46f0f0', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#aaffc3', '#ffd8b1', '#ffffff']

class Innovative {
    constructor(parentElement, normalizedTeamData, coords) {
        this.parentElement = parentElement
        this.teamData = normalizedTeamData
        this.coords = coords
        this.displayData = []

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

        //scales
        vis.color = d3.scaleOrdinal().domain(normalizedColumns).range(colors)

        // Scales and axes
        vis.x = d3.scaleLinear().range([0, 512])
        vis.y = d3.scaleLinear().range([512, 0])

        this.wrangleData()
    }

    wrangleData() {
        let vis = this

        vis.leagues = ["WCS", "MSI", "LCK", "LEC", "LCS", "PCS", "LCL", "LJL", "VCS", "TCL"]
        vis.teamData = vis.teamData.filter(d => this.leagues.includes(d.league)).slice(0, vis.coords.length)
        vis.displayData = vis.teamData.map(d => normalizedColumns[d3.maxIndex(normalizedColumns.map(m => +d[m]))])

        this.updateVis()
    }

    updateVis() {
        let vis = this

        vis.x.domain([0, 512])
        vis.y.domain([0, 512])

        vis.svg.selectAll(".shape-circles")
            .data(vis.coords)
            .enter()
            .append("circle")
            .attr("class", "shape-circles")
            .attr("cx", d => vis.x(d.y) + 512/2)
            .attr("cy", d => vis.y(512 - d.x))
            .attr("r", 3.5)
            .attr("fill", (d, i) => vis.color(vis.displayData[i]))
    }
}