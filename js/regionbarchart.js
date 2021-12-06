class RegionBarChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement
        this.data = data
        this.data.forEach(d => {
            d.first = +d.first;
            d.second = +d.second;
            d.third_fourth = +d.third_fourth;
            d.total = +d.total;
        })
        this.displayData = []
        this.keys = ["first", "second", "third_fourth"];

        this.initVis()
    }

    initVis() {
        let vis = this
        // console.log(vis.data)

        // Define SVG parameters
        vis.margin = {top: 60, right: 40, bottom: 155, left: 40};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        // add title
        vis.svg.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text("The LCK region consistently does better in world tournaments")
            .attr("font-size", "20px")
            .attr("font-weight", "lighter")
            .attr('transform', `translate(${vis.width / 2}, -30)`)
            .attr('text-anchor', 'middle');

        // Scales and axes
        vis.ordinalScale = d3.scaleBand()
            .rangeRound([0, vis.width])
            .padding(0.1);

        vis.numericScale = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.colorScale = d3.scaleOrdinal()
            .range(["#98abc5", "#7b6888","#a05d56"]);

        vis.ordinalAxis = d3.axisBottom()
            .scale(vis.ordinalScale);

        vis.numericAxis = d3.axisLeft()
            .scale(vis.numericScale);

        vis.handleXAxisUpdate = vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", `translate(0, ${vis.height})`);

        vis.handleYAxisUpdate = vis.svg.append("g")
            .attr("class", "y-axis axis");

        let legend = vis.svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(vis.keys)
            .enter().append("g")
            .attr("transform", function(d, i) { return `translate(0, ${i * 20 - 20})`; });

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
                    first: "Champion",
                    second: "Runner-up",
                    third_fourth: "3rd or 4th"
                }
                return labels[d]
            });

        vis.regionTickLabels = {
            LCK: "LOL Champions Korea (LCK)",
            LPL: "LOL Pro League (LPL)",
            LEC: "LOL European Championship (LEC)",
            PCS: "Pacific Championship Series (PCS)",
            LCS: "LOL Championship Series (LCS)"
        }

        vis.wrangleData("total");
    }

    wrangleData(category) {
        let vis = this;

        // Filter and sort
        vis.displayData = vis.data.filter(d => d.tournament === category);
        vis.displayData = vis.displayData.sort((a, b) => b.total - a.total);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        // Get stacked barchart
        let stack = d3.stack().keys(vis.keys)(vis.displayData);

        // Define domains for scales
        vis.ordinalScale.domain(vis.displayData.map(d => d.region));
        vis.ordinalAxis.tickFormat(d => vis.regionTickLabels[d]);
        vis.numericScale.domain([0, d3.max(vis.displayData, d => d.total)]);

        // Draw axes
        let transitionDuration = 800;
        vis.handleXAxisUpdate.transition().duration(transitionDuration)
            .call(vis.ordinalAxis)
            .selectAll("text")
            .style("text-anchor", "end")
            .attr("transform", "rotate(-50)");
        vis.numericAxis.ticks(vis.numericScale.domain()[1]).tickFormat(d3.format(",d"));
        vis.handleYAxisUpdate.transition().duration(transitionDuration)
            .call(vis.numericAxis);

        // Draw bar chart
        vis.keys.forEach((key, index) => {
            let bar = vis.svg.selectAll(".bar-" + key)
                .data(stack[index], d => d.data.region + "-" + key);
            bar.transition().duration(transitionDuration)
                .attr("x", function(d) { return vis.ordinalScale(d.data.region); })
                .attr("y", function(d) { return vis.numericScale(d[1]); })
                .attr("height", function(d) { return vis.numericScale(d[0]) - vis.numericScale(d[1]); })
            bar.enter().append("rect")
                .attr("class", function(d) { return `bar bar-${key} bar-${d.data.region}`; })
                .attr("x", function(d) { return vis.ordinalScale(d.data.region); })
                .attr("y", function(d) { return vis.numericScale(d[1]); })
                .attr("height", function(d) { return vis.numericScale(d[0]) - vis.numericScale(d[1]); })
                .attr("width", vis.ordinalScale.bandwidth())
                .attr("fill", vis.colorScale(key))
                .on("mouseover", function(event, d) {
                    d3.selectAll(`.bar-${d.data.region}`).attr("stroke", "black").attr("stroke-width", 2).attr("opacity", 0.6);
                    d3.selectAll(`#wins-${d.data.region}`).attr("stroke", "black").attr("stroke-width", 2).attr("opacity", 0.6);
                    d3.selectAll(`#losses-${d.data.region}`).attr("stroke", "black").attr("stroke-width", 2).attr("opacity", 0.6);
                })
                .on("mouseout", function(event, d) {
                    d3.selectAll(`.bar-${d.data.region}`).attr("stroke-width", 0).attr("opacity", 1);
                    d3.selectAll(`#wins-${d.data.region}`).attr("stroke-width", 0).attr("opacity", 1);
                    d3.selectAll(`#losses-${d.data.region}`).attr("stroke-width", 0).attr("opacity", 1);
                });
        })
    }
}