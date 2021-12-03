class RegionCountChart {
    constructor(parentElement, data) {
        this.parentElement = parentElement
        this.data = [
            {
                region: "LCK",
                wins: 44,
                totals: 66
            },
            {
                region: "LPL",
                wins: 29,
                totals: 51
            },
            {
                region: "LEC",
                wins: 8,
                totals: 25
            },
            {
                region: "LCS",
                wins: 15,
                totals: 31
            },
            {
                region: "PCS",
                wins: 3,
                totals: 6
            }
        ]
        this.displayData = []
        this.keys = ["winrate", "lossrate"]
        this.initVis()
    }

    initVis() {
        let vis = this
        // console.log(vis.data)

        // Define SVG parameters
        vis.margin = {top: 60, right: 40, bottom: 100, left: 40};
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
            .text("2021 World Championship win rates by region")
            .attr('transform', `translate(${vis.width / 2}, -30)`)
            .attr('text-anchor', 'middle');

        // Scales and axes
        vis.ordinalScale = d3.scaleBand()
            .rangeRound([0, vis.height])
            .padding(0.5);

        vis.numericScale = d3.scaleLinear()
            .range([0, vis.width / 4]);

        vis.colorScale = d3.scaleOrdinal()
            .range(["#A1E8AF", "#EEFFDB"]);

        vis.ordinalAxis = d3.axisRight()
            .scale(vis.ordinalScale);

        vis.handleAxisUpdate = vis.svg.append("g")
            .attr("class", "y-axis axis")
            .attr("transform", `translate(${vis.width / 4}, 0)`);

        let legend = vis.svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 10)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(vis.keys)
            .enter().append("g")
            .attr("transform", function(d, i) { return `translate(-50, ${vis.height - i * 20 - 50})`; });

        legend.append("rect")
            .attr("x", vis.width - 19)
            .attr("width", 28)
            .attr("height", 19)
            .attr("fill", vis.colorScale);

        legend.append("text")
            .attr("fill", "white")
            .attr("x", vis.width - 25)
            .attr("y", 10)
            .attr("dy", "0.32em")
            .text(function(d) {
                let labels = {
                    winrate: "Wins",
                    lossrate: "Losses",
                }
                return labels[d]
            });

        vis.wrangleData()
    }

    wrangleData() {
        let vis = this;

        vis.displayData = vis.data;
        vis.displayData.forEach(d => {
            d["winrate"] = d.wins / d.totals;
            d["losses"] = d.totals - d.wins;
            d["lossrate"] = d.losses / d.totals;
            d["wingames"] = Array(d.wins).fill(1);
            d["lossgames"] = Array(d.losses).fill(0);
        });
        // console.log(vis.displayData)

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        let stack = d3.stack().keys(vis.keys)(vis.displayData);
        // console.log(stack)

        vis.ordinalScale.domain(vis.displayData.map(d => d.region))
        vis.numericScale.domain([0, 1]);

        vis.handleAxisUpdate.call(vis.ordinalAxis)
            .selectAll("text")
            .style("text-anchor", "middle")
            .attr("transform", "translate(10, 0)");

        vis.keys.forEach((key, index) => {
            let bar = vis.svg.selectAll(".bar-" + key)
                .data(stack[index], d => d.data.region + "-" + key);
            bar.enter().append("rect")
                .attr("class", function(d) { return `bar bar-${key} bar-${d.data.region}`; })
                .attr("y", function(d) { return vis.ordinalScale(d.data.region); })
                .attr("x", function(d) { return vis.numericScale(d[0]); })
                .attr("width", function(d) { return vis.numericScale(d[1]) - vis.numericScale(d[0]); })
                .attr("height", vis.ordinalScale.bandwidth())
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

        vis.svg.selectAll(".winrate-labels")
            .data(vis.displayData)
            .enter().append("text")
            .attr("class", "winrate-labels")
            .attr("y", d => vis.ordinalScale(d.region) + vis.ordinalScale.bandwidth() / 2)
            .attr("x", "0.3rem")
            .attr("dy", "0.3rem")
            .attr("fill", "black")
            .style("font-size", 11)
            .text(d => d3.format(".0%")(d.winrate));

        vis.svg.selectAll(".lossrate-labels")
            .data(vis.displayData)
            .enter().append("text")
            .attr("class", "lossrate-labels")
            .attr("text-anchor", "end")
            .attr("y", d => vis.ordinalScale(d.region) + vis.ordinalScale.bandwidth() / 2)
            .attr("x", vis.width / 4)
            .attr("dx", "-0.3rem")
            .attr("dy", "0.3rem")
            .attr("fill", "black")
            .style("font-size", 11)
            .text(d => d3.format(".0%")(d.lossrate));

        vis.svg.selectAll(".windots")
            .data(vis.displayData)
            .enter().append("g")
            .attr("id", d => `wins-${d.region}`)
            .attr("transform", d => `translate(${vis.width / 4 + 50}, ${vis.ordinalScale(d.region)})`)
            .on("mouseover", function(event, d) {
                d3.selectAll(`.bar-${d.region}`).attr("stroke", "black").attr("stroke-width", 2).attr("opacity", 0.6);
                d3.selectAll(`#wins-${d.region}`).attr("stroke", "black").attr("stroke-width", 2).attr("opacity", 0.6);
                d3.selectAll(`#losses-${d.region}`).attr("stroke", "black").attr("stroke-width", 2).attr("opacity", 0.6);
            })
            .on("mouseout", function(event, d) {
                d3.selectAll(`.bar-${d.region}`).attr("stroke-width", 0).attr("opacity", 1);
                d3.selectAll(`#wins-${d.region}`).attr("stroke-width", 0).attr("opacity", 1);
                d3.selectAll(`#losses-${d.region}`).attr("stroke-width", 0).attr("opacity", 1);
            });

        vis.svg.selectAll(".lossdots")
            .data(vis.displayData)
            .enter().append("g")
            .attr("id", d => `losses-${d.region}`)
            .attr("transform", d => `translate(${vis.width / 4 + 50}, ${vis.ordinalScale(d.region)})`)
            .on("mouseover", function(event, d) {
                d3.selectAll(`.bar-${d.region}`).attr("stroke", "black").attr("stroke-width", 2).attr("opacity", 0.6);
                d3.selectAll(`#wins-${d.region}`).attr("stroke", "black").attr("stroke-width", 2).attr("opacity", 0.6);
                d3.selectAll(`#losses-${d.region}`).attr("stroke", "black").attr("stroke-width", 2).attr("opacity", 0.6);
            })
            .on("mouseout", function(event, d) {
                d3.selectAll(`.bar-${d.region}`).attr("stroke-width", 0).attr("opacity", 1);
                d3.selectAll(`#wins-${d.region}`).attr("stroke-width", 0).attr("opacity", 1);
                d3.selectAll(`#losses-${d.region}`).attr("stroke-width", 0).attr("opacity", 1);
            });

        vis.displayData.forEach(d => {
            let radius = vis.width * 2 / 3 / 60;
            let circleOffset = 2 * radius + 2
            vis.svg.select(`#wins-${d.region}`)
                .selectAll(".win-circle")
                .data(d.wingames)
                .enter()
                .append("circle")
                .attr("class", "win-circle")
                .attr("cx", (d, i) => (i % 20) * circleOffset + Math.floor((i % 20) / 5) * 5)
                .attr("cy", (d, i) =>  Math.floor(i / 20) * -circleOffset + vis.ordinalScale.bandwidth() / 2 - 8)
                .attr("r", radius)
                .attr("fill", vis.colorScale.range()[0]);
            vis.svg.select(`#losses-${d.region}`)
                .selectAll(".loss-circle")
                .data(d.lossgames)
                .enter()
                .append("circle")
                .attr("class", "loss-circle")
                .attr("cx", (d, i) => (i % 20) * circleOffset + Math.floor((i % 20) / 5) * 5)
                .attr("cy", (d, i) =>  Math.floor(i / 20) * circleOffset + vis.ordinalScale.bandwidth() / 2 + 8)
                .attr("r", radius)
                .attr("fill", vis.colorScale.range()[1]);
        })
    }
}