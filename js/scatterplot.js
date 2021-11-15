/* * * * * * * * * * * * * *
*    class scatterplot     *
* * * * * * * * * * * * * */

class ScatterPlot {
    constructor(parentElement, playerData, teamData) {
        this.parentElement = parentElement
        this.playerData = playerData
        this.teamData = teamData
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

        // add title
        vis.svg.append('g')
            .attr('class', 'title scatter-plot-title')
            .append('text')
            .text("Correlation Between Damage to Champions & Earned Gold")
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle')

        // Scales and axes
        vis.x = d3.scaleLinear().range([0, vis.width])
        vis.y = d3.scaleLinear().range([vis.height, 0])
        vis.xAxis = d3.axisBottom().scale(vis.x)
        vis.yAxis = d3.axisLeft().scale(vis.y)

        vis.svg.append("g").attr("class", "x-axis axis").attr("transform", "translate(0," + (vis.height ) + ")")
        vis.svg.append("g").attr("class", "y-axis axis")

        this.wrangleData()
    }

    wrangleData(isPlayer= true) {
        let vis = this
        vis.displayData = isPlayer ? vis.playerData : vis.teamData

        // TODO: filter data by selected variables and get selected categories
        let [xVar,yVar] = ["damagetochampions", "earnedgold"]
        vis.corrArr = vis.displayData.map(function(entry) {return {"x": +entry[xVar], "y": +entry[yVar]}})

        this.updateVis()
    }

    updateVis() {
        let vis = this

        // set domains for scales
        console.log(d3.max(vis.corrArr, d => d.x), d3.max(vis.corrArr, d => d.y))
        vis.x.domain([0, d3.max(vis.corrArr, d => d.x)])
        vis.y.domain([0, d3.max(vis.corrArr, d => d.y)])

        vis.svg.select(".x-axis").transition().call(vis.xAxis)
        vis.svg.select(".y-axis").transition().call(vis.yAxis)

        let scatterDots = vis.svg.selectAll(".scatter-dots").data(vis.corrArr)

        // enter & update
        scatterDots.enter().append("circle")
            .attr("cx", function (d) {
                console.log(vis.x(d.x))
                return vis.x(d.x); } )
            .attr("cy", function (d) { return vis.y(d.y); } )
            .attr("r", 1)
            .style("fill", "#69b3a2")

        // exit
        scatterDots.exit().remove()
    }
}