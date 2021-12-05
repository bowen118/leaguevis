/* * * * * * * * * * * * * *
*    class dotplot    *
* * * * * * * * * * * * * */

// references and adapts code from: https://www.d3-graph-gallery.com/graph/lollipop_cleveland.html

class DotPlot {
    constructor(parentElement, teamsData) {
        this.parentElement = parentElement
        this.data = teamsData
        this.keys = ["win10", "win15", "loss10", "loss15"]
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

        // Scales and axes
        vis.x = d3.scaleLinear().range([0, vis.width])
        vis.y = d3.scaleBand().range([vis.height, 0])

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + (vis.height ) + ")")

        vis.colorScale = d3.scaleOrdinal()
            .range(["#A1E8AF", "#EEFFDB", "#FF6863", "#FFDCD1"]);

        vis.legend = vis.svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(vis.keys)
            .enter().append("g")
            .attr("transform", function(d, i) { return `translate(-50, ${vis.height - i * 20 - 50})`; });

        this.wrangleData()
    }

    wrangleData() {
        let vis = this;

        let worldsGames = this.data.filter(d => d.league === "WCS");
        vis.displayData = worldsGames.map((d, i) => {
            return {
                golddiffat10: +d.golddiffat10,
                golddiffat15: +d.golddiffat15,
                result: d.result,
                gameid: d.gameid,
                id: i,
            }
        });
        vis.displayData = vis.displayData.sort((a, b) => a.golddiffat10 - b.golddiffat10);
        console.log(vis.displayData)

        this.updateVis()
    }

    updateVis() {
        let vis = this

        vis.legend.append("rect")
            .attr("x", vis.width - 19)
            .attr("width", 28)
            .attr("height", 19)
            .attr("fill", vis.colorScale);

        vis.legend.append("text")
            .attr("fill", "white")
            .attr("x", vis.width - 25)
            .attr("y", 10)
            .attr("dy", "0.32em")
            .text(function(d) {
                let labels = {
                    win10: "Winner's Gold at 10",
                    win15: "Winner's Gold at 15",
                    loss10: "Loser's Gold at 10",
                    loss15: "Loser's Gold at 15"
                }
                return labels[d]
            });

        vis.x.domain([d3.min(vis.displayData, d => Math.min(d.golddiffat10, d.golddiffat15)), d3.max(vis.displayData, d => Math.max(d.golddiffat10, d.golddiffat15))]);
        vis.y.domain(vis.displayData.map(d => d.id));

        vis.xAxis.scale(vis.x);
        vis.svg.select(".x-axis").call(vis.xAxis);

        // Lines
        vis.svg.selectAll("line")
            .data(vis.displayData)
            .enter()
            .append("line")
            .attr("x1", function(d) { return vis.x(d.golddiffat10); })
            .attr("x2", function(d) { return vis.x(d.golddiffat15); })
            .attr("y1", function(d) { return vis.y(d.id); })
            .attr("y2", function(d) { return vis.y(d.id); })
            .attr("stroke", "grey")
            .attr("stroke-width", "1px");

        // Circles of variable 1
        vis.svg.selectAll("circles")
            .data(vis.displayData)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return vis.x(d.golddiffat10); })
            .attr("cy", function(d) { return vis.y(d.id); })
            .attr("r", "2")
            .style("fill", (d) => {
                if (d.result === "0") {
                    return "#FF6863";
                } else {
                    return "#A1E8AF";
                }
            });

        // Circles of variable 2
        vis.svg.selectAll("circles")
            .data(vis.displayData)
            .enter()
            .append("circle")
            .attr("cx", function(d) { return vis.x(d.golddiffat15); })
            .attr("cy", function(d) { return vis.y(d.id); })
            .attr("r", "2")
            .style("fill", (d) => {
                if (d.result === "0") {
                    return "#FFDCD1";
                } else {
                    return "#EEFFDB";
                }
            });

    }
}