/* * * * * * * * * * * * * *
*    class areachart     *
* * * * * * * * * * * * * */


class AreaChart {
    constructor(parentElement, parentElement2, teamData) {
        this.parentElement = parentElement
        this.parentElement2 = parentElement2
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
        this.allBans = this.bans.map(d => d.bans).reduce((a, b) => a.concat(b))
        this.allRates = {}
        for (let champ of this.allBans) {
            this.allRates[champ] = this.allRates[champ] ? this.allRates[champ] + 1 : 1;
        }
        this.histData = Object.keys(this.allRates).map(champ => {
            return {
                champ: champ.replaceAll("'", "").replaceAll(" ", "").replaceAll("&", ""),
                count: this.allRates[champ]
            }
        })

        this.initVis()
    }


    initVis() {
        let vis = this

        vis.margin = {top: 50, right: 50, bottom: 50, left: 50}
        vis.margin2 = {top: 10, right: 50, bottom: 50, left: 50}
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom
        vis.width2 = document.getElementById(vis.parentElement2).getBoundingClientRect().width - vis.margin2.left - vis.margin2.right
        vis.height2 = document.getElementById(vis.parentElement2).getBoundingClientRect().height - vis.margin2.top - vis.margin2.bottom

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.svg2 = d3.select("#" + vis.parentElement2).append("svg")
            .attr("width", vis.width2 + vis.margin2.left + vis.margin2.right)
            .attr("height", vis.height2 + vis.margin2.top + vis.margin2.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin2.left}, ${vis.margin2.top})`);

        vis.svg2.append('g')
            .attr('class', 'title bar-title')
            .append('text')
            .text("Distribution of champion pick/bans in 2021")
            .attr("font-size", "16px")
            .attr("font-weight", "lighter")
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle');

        // Scales and axes
        vis.x = d3.scaleTime()
            .range([0, vis.width]);
        vis.y = d3.scaleLinear()
            .range([vis.height, 0]);

        vis.histX = d3.scaleLinear()
            .domain([0, d3.max(vis.histData, d => d.count) + 300])
            .range([0, vis.width2]);
        vis.svg2.append("g")
            .attr("transform", "translate(0," + vis.height2 + ")")
            .call(d3.axisBottom(vis.histX));

        vis.histY = d3.scaleSqrt()
            .range([vis.height2, 0]);

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
            .attr('id', 'areaTooltip');

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

        vis.histogram = d3.histogram()
            .value(d => d.count)
            .domain(vis.histX.domain())
            .thresholds(vis.histX.ticks(30));

        // Get bins for histogram
        vis.bins = vis.histogram(vis.histData);

        this.updateVis()
    }

    updateVis() {
        let vis = this;

        vis.x.domain(d3.extent(vis.displayData, d => d.month));
        vis.y.domain([0, 0.4]);
        vis.histY.domain([0, d3.max(vis.bins, d => d.length)]);
        vis.svg2.append("g")
            .call(d3.axisLeft(vis.histY));

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
            .attr("class", function(d) { return "area" + d.key.replaceAll("'", "").replaceAll(" ", "") })
            .style("fill", function(d) { return vis.color(d.key); })
            .attr("opacity", "0.5")
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
                d3.select(this).attr("opacity", "1").attr("stroke", "black").attr("stroke-width", 2);
                let histClass = `.rect-${d.key.replaceAll("'", "").replaceAll(" ", "")}`;
                d3.select(histClass).attr("opacity", "1").attr("stroke", "black").attr("stroke-width", 2);
            })
            .on('mouseout', function(event, d){
                vis.tooltip.style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
                d3.select(this).attr("opacity", "0.5").attr("stroke-width", 0);
                let histClass = `.rect-${d.key.replaceAll("'", "").replaceAll(" ", "")}`;
                d3.select(histClass).attr("opacity", "0.5").attr("stroke-width", 0);
            })

        vis.svg.append('g')
            .attr('class', 'title area-chart-title')
            .append('text')
            .attr("font-weight", "lighter")
            .text(`In 2021, ${vis.keysForPlot.length} of the 157 champs were picked/banned unusually often`)
            .attr('transform', `translate(${vis.width / 2}, -20)`)
            .attr('text-anchor', 'middle')

        // Call axis functions with the new domain
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);

        // Draw rectangles for histogram
        vis.svg2.selectAll("rect")
            .data(vis.bins)
            .enter()
            .append("rect")
            .attr("class", d => {
                let className = "";
                d.forEach(champ => className += `rect-${champ.champ} `);
                return className;
            })
            .attr("x", 1)
            .attr("transform", function(d) { return "translate(" + vis.histX(d.x0) + "," + d3.format(".2f")(vis.histY(d.length)) + ")"; })
            .attr("width", function(d) { return vis.histX(d.x1) - vis.histX(d.x0) -1 ; })
            .attr("height", function(d) { return vis.height2 - vis.histY(d.length); })
            .attr("opacity", "0.5")
            .style("fill", "#69b3a2")
            .on("mouseover", function(event, d) {
                let champs = "";
                d.forEach((bar, index) => {
                    if (index % 2 === 1) {
                        champs += `${bar.champ}: ${bar.count},</br>`
                    } else {
                        champs += `${bar.champ}: ${bar.count}, `
                    }
                    d3.select(`.area${bar.champ}`).attr("opacity", "1").attr("stroke", "black").attr("stroke-width", 4);
                })
                vis.tooltip.style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                     <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 10px">
                         ${champs}
                     </div>`);
                d3.select(this).attr("opacity", "1").attr("stroke", "black").attr("stroke-width", 2);
            })
            .on("mouseout", function(event, d) {
                d.forEach(bar => d3.select(`.area${bar.champ}`).attr("opacity", "0.5").attr("stroke-width", 0))
                vis.tooltip.style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
                d3.select(this).attr("opacity", "0.5").attr("stroke-width", 0);
            });
    }



}

