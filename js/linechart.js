/* * * * * * * * * * * * * *
*    class linechart     *
* * * * * * * * * * * * * */

class LineChart {
    constructor(parentElement, teamData) {
        this.parentElement = parentElement
        this.data = teamData
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

        // // add title
        // vis.svg.append('g')
        //     .attr('class', 'title line-chart-title')
        //     .append('text')
        //     .text("Game Length vs. Winning Team's Gold Earned")
        //     .attr('transform', `translate(${vis.width / 2}, 10)`)
        //     .attr('text-anchor', 'middle')

        // Scales and axes
        vis.x = d3.scaleBand().range([0, vis.width])
        vis.y = d3.scaleLinear().range([vis.height, 0])

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + (vis.height ) + ")")

        vis.svg.append("g")
            .attr("class", "y-axis axis")

        vis.goldPath = vis.svg.append("path")
            .attr("class", "area-line");

        this.wrangleData()
    }

    wrangleData() {
        let vis = this

        vis.filterData = [];
        vis.ranges = ["0-5", "5-10", "10-15", "15-20", "20-25", "25-30", "30-35", "35-40", "40-45", "45-50", "50-55", "55-60", "60-65", "65-70"]

        for (let i = 0; i < vis.data.length; i++) {
            let curr = vis.data[i]
            if (parseInt(curr.gamelength)/60 >= 0 && parseInt(curr.gamelength)/60 < 5 && parseInt(curr.result) === 1) {
                vis.filterData.push({"0-5": parseInt(curr.earnedgold)})
            } else if (parseInt(curr.gamelength)/60 >= 5 && parseInt(curr.gamelength)/60 < 10 && parseInt(curr.result) === 1) {
                vis.filterData.push({"5-10": parseInt(curr.earnedgold)})
            } else if (parseInt(curr.gamelength)/60 >= 10 && parseInt(curr.gamelength)/60 < 15 && parseInt(curr.result) === 1) {
                vis.filterData.push({"10-15": parseInt(curr.earnedgold)})
            } else if (parseInt(curr.gamelength)/60 >= 15 && parseInt(curr.gamelength)/60 < 20 && parseInt(curr.result) === 1) {
                vis.filterData.push({"15-20": parseInt(curr.earnedgold)})
            } else if (parseInt(curr.gamelength)/60 >= 20 && parseInt(curr.gamelength)/60 < 25 && parseInt(curr.result) === 1) {
                vis.filterData.push({"20-25": parseInt(curr.earnedgold)})
            } else if (parseInt(curr.gamelength)/60 >= 25 && parseInt(curr.gamelength)/60 < 30 && parseInt(curr.result) === 1) {
                vis.filterData.push({"25-30": parseInt(curr.earnedgold)})
            } else if (parseInt(curr.gamelength)/60 >= 30 && parseInt(curr.gamelength)/60 < 35 && parseInt(curr.result) === 1) {
                vis.filterData.push({"30-35": parseInt(curr.earnedgold)})
            } else if (parseInt(curr.gamelength)/60 >= 35 && parseInt(curr.gamelength)/60 < 40 && parseInt(curr.result) === 1) {
                vis.filterData.push({"35-40": parseInt(curr.earnedgold)})
            } else if (parseInt(curr.gamelength)/60 >= 40 && parseInt(curr.gamelength)/60 < 45 && parseInt(curr.result) === 1) {
                vis.filterData.push({"40-45": parseInt(curr.earnedgold)})
            } else if (parseInt(curr.gamelength)/60 >= 45 && parseInt(curr.gamelength)/60 < 50 && parseInt(curr.result) === 1) {
                vis.filterData.push({"45-50": parseInt(curr.earnedgold)})
            } else if (parseInt(curr.gamelength)/60 >= 50 && parseInt(curr.gamelength)/60 < 55 && parseInt(curr.result) === 1) {
                vis.filterData.push({"50-55": parseInt(curr.earnedgold)})
            } else if (parseInt(curr.gamelength)/60 >= 55 && parseInt(curr.gamelength)/60 < 60 && parseInt(curr.result) === 1) {
                vis.filterData.push({"55-60": parseInt(curr.earnedgold)})
            } else if (parseInt(curr.gamelength)/60 >= 60 && parseInt(curr.gamelength)/60 < 65 && parseInt(curr.result) === 1) {
                vis.filterData.push({"60-65": parseInt(curr.earnedgold)})
            } else if (parseInt(curr.gamelength)/60 >= 65 && parseInt(curr.gamelength)/60 < 71 && parseInt(curr.result) === 1) {
                vis.filterData.push({"65-70": parseInt(curr.earnedgold)})
            }
        }

        // console.log(vis.filterData)

        for (let i = 0; i < vis.ranges.length; i++) {
            let mean = d3.mean(vis.filterData, function (d) {
                return d[vis.ranges[i]]
            }) || 0
            vis.displayData.push({'gold':  Math.floor(mean), 'range': vis.ranges[i]})
        }

        vis.max = 0;

        for (let i = 0; i < vis.displayData.length; i++) {
            if (vis.displayData[i]['gold'] > vis.max) {
                vis.max = vis.displayData[i]['gold']
            }
        }

        // console.log('max', vis.max)

        this.updateVis()
    }

    updateVis() {
        let vis = this

        vis.x.domain(vis.ranges)
        vis.y.domain([0, vis.max])

        vis.xAxis.scale(vis.x)
        vis.yAxis.scale(vis.y)

        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);

        vis.goldPath
            .datum(vis.displayData)
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-width", 1.5)
            .attr("d", d3.line()
                .x(function(d) {
                    return vis.x(d.range)
                })
                .y(function(d) {
                    if (typeof(d.gold) === 'number') {
                        // console.log(d.gold)
                        return vis.y(d.gold)
                    } else {
                        return 0
                    }
                })
            )
    }
}