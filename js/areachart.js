/* * * * * * * * * * * * * *
*    class areachart     *
* * * * * * * * * * * * * */


class AreaChart {
    constructor(parentElement, teamData) {
        this.parentElement = parentElement
        this.data = teamData
        this.displayData = []

        this.bans = this.data.map(function(d) {
            return {
                month: d3.timeFormat("%b")(d3.timeParse("%Y-%m-%d %H:%M:%S")(d.date)),
                // bans: [d.ban1, d.ban2, d.ban3, d.ban4, d.ban5]
                bans: [d.ban1, d.ban2, d.ban3, d.ban4, d.ban5, d.champ1, d.champ2, d.champ3, d.champ4, d.champ5]
            }
        })
        this.bans = Array.from(d3.group(this.bans, d => d.month), ([key, value]) => ({key, value}))
        this.bans = this.bans.map(function(d) {
            return {
                month: d.key,
                bans: d.value.map(d => d.bans).reduce((a, b) => a.concat(b))
            }
        })

        this.initVis()
    }


    initVis() {
        let vis = this

        vis.margin = {top: 50, right: 50, bottom: 50, left: 50}
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`)

        // Scales and axes
        vis.x = d3.scaleTime()
            .range([0, vis.width]);

        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.xAxis = d3.axisBottom()
            .scale(vis.x);

        vis.yAxis = d3.axisLeft()
            .scale(vis.y);

        vis.svg.append("g")
            .attr("class", "x-axis axis")
            .attr("transform", "translate(0," + vis.height + ")");

        vis.svg.append("g")
            .attr("class", "y-axis axis");

        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'areaTooltip')

        this.wrangleData()

    }


    wrangleData() {
        let vis = this

        vis.keys = []
        vis.champs = {}
        vis.displayData = vis.bans.map(m => {
            let counts = {};
            let totals_per_month = m.bans.length;
            m.bans.forEach(d => {
                counts[d] = counts[d] ? counts[d] + 1 : 1;
                vis.champs[d] = 1;
            })
            for (let champ of Object.keys(counts)) {
                counts[champ] /= totals_per_month;
                vis.keys.push(champ)
            }
            counts["month"] = d3.timeParse("%b")(m.month);
            return counts;
        })
        vis.keys = d3.set(vis.keys).values()

        vis.displayData.forEach(m => {
            vis.keys.forEach(k => {
                if (!m[k]) {
                    m[k] = 0;
                }
            })
        })

        vis.keysForPlot = []
        vis.displayData.forEach(m => {
            for (let champ of vis.keys) {
                if (m[champ] > 1 / 157 * 6) {
                    vis.champs[champ] *= 0;
                    vis.keysForPlot.push(champ)
                }
            }
        })
        vis.keysForPlot = d3.set(vis.keysForPlot).values()

        this.updateVis()
    }

    updateVis() {
        let vis = this;

        vis.x.domain(d3.extent(vis.displayData, d => d.month));
        vis.y.domain([0, 0.5]);

        vis.xAxis.tickFormat(d3.timeFormat("%b"));

        vis.color = d3.scaleOrdinal()
            .domain(vis.keysForPlot)
            .range(d3.schemeTableau10);

        vis.stackedData = d3.stack()
            .keys(vis.keysForPlot)
            (vis.displayData);

        vis.areaChart = vis.svg.append('g')
            .attr("clip-path", "url(#clip)")

        // Area generator
        let area = d3.area()
            .curve(d3.curveMonotoneX)
            .x(function(d) { return vis.x(d.data.month); })
            .y0(function(d) { return vis.y(d[0]); })
            .y1(function(d) { return vis.y(d[1]); })

        // Show the areas
        vis.areaChart
            .selectAll("layers")
            .data(vis.stackedData)
            .enter()
            .append("path")
            .attr("class", function(d) { return "area" + d.key })
            .style("fill", function(d) { return vis.color(d.key); })
            .attr("d", area)
            .on("mouseover", function(event, d) {
                let thisChampRates = d.map(m => m[1] - m[0])
                let maxRate = d3.max(thisChampRates)
                let maxMonth = d3.maxIndex(thisChampRates)
                let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
                vis.tooltip.style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                         <h3>${d.key}</h3>
                         <p>Highest ban rate of ${d3.format(".2%")(maxRate)} in ${months[maxMonth]}</p>
                     </div>`);
                d3.select(this).attr("opacity", "0.8").attr("stroke", "black").attr("stroke-width", 2)
            })
            .on('mouseout', function(event, d){
                vis.tooltip.style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
                d3.select(this).attr("opacity", "1").attr("stroke-width", 0)
            })

        vis.svg.append('g')
            .attr('class', 'title area-chart-title')
            .append('text')
            .text(`In 2021, ${vis.keysForPlot.length} of the 157 champs were picked/banned unusually often`)
            .attr('transform', `translate(${vis.width / 2}, -20)`)
            .attr('text-anchor', 'middle')

        // Call axis functions with the new domain
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);
    }



}

