/* * * * * * * * * * * * * *
*    class dotplot    *
* * * * * * * * * * * * * */

// references and adapts code from: https://www.d3-graph-gallery.com/graph/lollipop_cleveland.html

class DotPlot {
    constructor(parentElement, parentElement2, parentElement3, parentElement4, teamsData) {
        this.parentElement = parentElement
        this.parentElement2 = parentElement2
        this.parentElement3 = parentElement3
        this.parentElement4 = parentElement4
        this.data = teamsData
        this.keys = ["win10", "win15", "loss10", "loss15"]
        this.goldData = []
        this.farmData = []
        this.xpData = []
        this.killsData = []

        this.initVis()
    }

    initVis() {
        let vis = this

        vis.margin = {top: 25, right: 20, bottom: 50, left: 20}
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`)
        vis.svg2 = d3.select("#" + vis.parentElement2).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`)
        vis.svg3 = d3.select("#" + vis.parentElement3).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`)
        vis.svg4 = d3.select("#" + vis.parentElement4).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`)

        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text("Gold")
            .attr("font-weight", "lighter")
            .attr("font-size", "16px")
            .attr('transform', `translate(${vis.width / 2}, -10)`)
            .attr('text-anchor', 'middle');
        vis.svg2.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text("Farm")
            .attr("font-weight", "lighter")
            .attr("font-size", "16px")
            .attr('transform', `translate(${vis.width / 2}, -10)`)
            .attr('text-anchor', 'middle');
        vis.svg3.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text("Experience points (XP)")
            .attr("font-weight", "lighter")
            .attr("font-size", "16px")
            .attr('transform', `translate(${vis.width / 2}, -10)`)
            .attr('text-anchor', 'middle');
        vis.svg4.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text("Kills")
            .attr("font-weight", "lighter")
            .attr("font-size", "16px")
            .attr('transform', `translate(${vis.width / 2}, -10)`)
            .attr('text-anchor', 'middle');

        // Scales and axes
        vis.x = d3.scaleLinear().range([0, vis.width])
        vis.y = d3.scaleBand().range([vis.height, 0])
        vis.xAxis = d3.axisBottom()
            .scale(vis.x);
        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + (vis.height) + ")")

        vis.x2 = d3.scaleLinear().range([0, vis.width])
        vis.y2 = d3.scaleBand().range([vis.height, 0])
        vis.xAxis2 = d3.axisBottom()
            .scale(vis.x2);
        vis.svg2.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + (vis.height) + ")")

        vis.x3 = d3.scaleLinear().range([0, vis.width])
        vis.y3 = d3.scaleBand().range([vis.height, 0])
        vis.xAxis3 = d3.axisBottom()
            .scale(vis.x3);
        vis.svg3.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + (vis.height) + ")")

        vis.x4 = d3.scaleLinear().range([0, vis.width])
        vis.y4 = d3.scaleBand().range([vis.height, 0])
        vis.xAxis4 = d3.axisBottom()
            .scale(vis.x4);
        vis.svg4.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + (vis.height) + ")")

        vis.colorScale = d3.scaleOrdinal()
            .range(["#A1E8AF", "#EEFFDB", "#FF6863", "#FFDCD1"]);

        vis.legend = vis.svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 8)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(vis.keys)
            .enter().append("g")
            .attr("transform", function(d, i) { return `translate(-30, ${vis.height - i * 20 - 30})`; });
        vis.legend2 = vis.svg2.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 8)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(vis.keys)
            .enter().append("g")
            .attr("transform", function(d, i) { return `translate(-30, ${vis.height - i * 20 - 30})`; });
        vis.legend3 = vis.svg3.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 8)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(vis.keys)
            .enter().append("g")
            .attr("transform", function(d, i) { return `translate(-30, ${vis.height - i * 20 - 30})`; });
        vis.legend4 = vis.svg4.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 8)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(vis.keys)
            .enter().append("g")
            .attr("transform", function(d, i) { return `translate(-30, ${vis.height - i * 20 - 30})`; });

        this.wrangleData()
    }

    wrangleData() {
        let vis = this;

        let worldsGames = this.data.filter(d => d.league === "WCS");
        worldsGames.forEach((d, i) => {
            vis.goldData.push({
                golddiffat10: +d.golddiffat10,
                golddiffat15: +d.golddiffat15,
                result: d.result,
                gameid: d.gameid,
                id: i,
            });
            vis.farmData.push({
                farmdiffat10: +d.csdiffat10,
                farmdiffat15: +d.csdiffat15,
                result: d.result,
                gameid: d.gameid,
                id: i,
            });
            vis.xpData.push({
                xpdiffat10: +d.xpdiffat10,
                xpdiffat15: +d.xpdiffat15,
                result: d.result,
                gameid: d.gameid,
                id: i,
            });
            vis.killsData.push({
                killsdiffat10: +d.killsat10 - +d.opp_killsat10,
                killsdiffat15: +d.killsat15 - +d.opp_killsat15,
                result: d.result,
                gameid: d.gameid,
                id: i,
            });
        });
        vis.goldData = vis.goldData.sort((a, b) => a.golddiffat10 - b.golddiffat10);
        vis.farmData = vis.farmData.sort((a, b) => a.farmdiffat10 - b.farmdiffat10);
        vis.xpData = vis.xpData.sort((a, b) => a.xpdiffat10 - b.xpdiffat10);
        vis.killsData = vis.killsData.sort((a, b) => a.killsdiffat10 - b.killsdiffat10);

        this.updateVis()
    }

    updateVis() {
        let vis = this

        function appendLegend(legend, variable) {
            legend.append("rect")
                .attr("x", vis.width - 19)
                .attr("width", 28)
                .attr("height", 19)
                .attr("fill", vis.colorScale);
            legend.append("text")
                .attr("fill", "#c89b3c")
                .attr("x", vis.width - 25)
                .attr("y", 10)
                .attr("dy", "0.32em")
                .text(function(d) {
                    let labels = {
                        win10: `Winner's ${variable} at 10`,
                        win15: `Winner's ${variable} at 15`,
                        loss10: `Loser's ${variable} at 10`,
                        loss15: `Loser's ${variable} at 15`
                    }
                    return labels[d]
                });
        }

        appendLegend(vis.legend, "gold");
        appendLegend(vis.legend2, "farm");
        appendLegend(vis.legend3, "XP");
        appendLegend(vis.legend4, "kills");

        vis.x.domain([d3.min(vis.goldData, d => Math.min(d.golddiffat10, d.golddiffat15)), d3.max(vis.goldData, d => Math.max(d.golddiffat10, d.golddiffat15))]);
        vis.x2.domain([d3.min(vis.farmData, d => Math.min(d.farmdiffat10, d.farmdiffat15)), d3.max(vis.farmData, d => Math.max(d.farmdiffat10, d.farmdiffat15))]);
        vis.x3.domain([d3.min(vis.xpData, d => Math.min(d.xpdiffat10, d.xpdiffat15)), d3.max(vis.xpData, d => Math.max(d.xpdiffat10, d.xpdiffat15))]);
        vis.x4.domain([d3.min(vis.killsData, d => Math.min(d.killsdiffat10, d.killsdiffat15)), d3.max(vis.killsData, d => Math.max(d.killsdiffat10, d.killsdiffat15))]);
        vis.y.domain(vis.goldData.map(d => d.id));
        vis.y2.domain(vis.farmData.map(d => d.id));
        vis.y3.domain(vis.xpData.map(d => d.id));
        vis.y4.domain(vis.killsData.map(d => d.id));


        vis.xAxis.scale(vis.x);
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.xAxis2.scale(vis.x2);
        vis.svg2.select(".x-axis").call(vis.xAxis2);
        vis.xAxis3.scale(vis.x3);
        vis.svg3.select(".x-axis").call(vis.xAxis3);
        vis.xAxis4.scale(vis.x4);
        vis.svg4.select(".x-axis").call(vis.xAxis4);

        function drawDotPlot(svg, data, x, y, x1, x2) {
            // Lines
            svg.selectAll("line")
                .data(data)
                .enter()
                .append("line")
                .attr("x1", function(d) { return x(d[x1]); })
                .attr("x2", function(d) { return x(d[x2]); })
                .attr("y1", function(d) { return y(d.id); })
                .attr("y2", function(d) { return y(d.id); })
                .attr("stroke", "grey")
                .attr("stroke-width", "1px");

            // first set of circles
            svg.selectAll("circles")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) { return x(d[x1]); })
                .attr("cy", function(d) { return y(d.id); })
                .attr("r", "1")
                .style("fill", (d) => {
                    if (d.result === "0") {
                        return "#FF6863";
                    } else {
                        return "#A1E8AF";
                    }
                });

            // second set of circles
            svg.selectAll("circles")
                .data(data)
                .enter()
                .append("circle")
                .attr("cx", function(d) { return x(d[x2]); })
                .attr("cy", function(d) { return y(d.id); })
                .attr("r", "1")
                .style("fill", (d) => {
                    if (d.result === "0") {
                        return "#FFDCD1";
                    } else {
                        return "#EEFFDB";
                    }
                });
        }

        drawDotPlot(vis.svg, vis.goldData, vis.x, vis.y, "golddiffat10", "golddiffat15");
        drawDotPlot(vis.svg2, vis.farmData, vis.x2, vis.y2,"farmdiffat10", "farmdiffat15");
        drawDotPlot(vis.svg3, vis.xpData, vis.x3, vis.y3,"xpdiffat10", "xpdiffat15");
        drawDotPlot(vis.svg4, vis.killsData, vis.x4, vis.y4,"killsdiffat10", "killsdiffat15");
    }
}