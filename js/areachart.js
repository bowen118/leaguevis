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
                bans: [d.ban1, d.ban2, d.ban3, d.ban4, d.ban5]
            }
        })
        this.bans = Array.from(d3.group(this.bans, d => d.month), ([key, value]) => ({key, value}))
        this.bans = this.bans.map(function(d) {
            return {
                month: d.key,
                bans: d.value.map(d => d.bans).reduce((a, b) => a.concat(b))
            }
        })
        
        // this.championArray = Array.from(d3.rollup(this.data, v => v.length, d => d.ban1), ([key, value]) => ({key, value}))
        //
        // // sort champion array
        // this.championArray.sort(function(a,b) {
        //     return d3.ascending(a.value, b.value)
        // });
        //
        // console.log(this.championArray)


        // this.champions = ["Thresh", 'Seraphine', 'Galio', 'Gnar', 'Rell', 'Sett', 'Aphelios', 'Lulu', 'Nidalee',
        //     'Taliyah', 'Varus', "Kai'Sa", 'Karma', 'Pantheon', 'Zoe', 'Hecarim', 'Kalista', 'Tristana', 'Lillia', 'Ziggs',
        //     'Twisted Fate', 'Akali', 'LeBlanc', 'Senna', 'Lee Sin', 'Irelia', 'Viego', 'Lucian', 'Olaf', 'Nocturne',
        //     'Camille', 'Udyr', 'Gwen', 'Xin Zhao', 'Renekton']
        //
        //
        // console.log(this.champions)

        //for final vis - filter to only keep counts of champions with at least 1% ban rate (190 bans)


        // let colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a'];

        // // prepare colors for range
        // let colorArray = this.championArray.map( (d,i) => {
        //     return colors[i%10]
        // })
        // // Set ordinal color scale
        // this.colorScale = d3.scaleOrdinal()
        //     .domain(this.championArray)
        //     .range(colorArray);

        this.initVis()
    }


    initVis() {
        let vis = this

        vis.margin = {top: 50, right: 100, bottom: 100, left: 50}
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
            .attr('class', 'title area-chart-title')
            .append('text')
            .text("Champion Ban Rates in 2021")
            .attr('transform', `translate(${vis.width / 2}, -20)`)
            .attr('text-anchor', 'middle')

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

        // vis.color = d3.scaleOrdinal().range(['#e41a1c','#377eb8','#4daf4a','#984ea3','#ff7f00','#ffff33','#a65628','#f781bf','#999999'])

        // // Initialize stack layout
        //
        // let stack = d3.stack()
        //     .keys(["value"]);
        //
        // //Stack data
        //
        // vis.stackedData = stack(vis.championArray);
        //
        // console.log(this.stackedData);
        //
        // // TO-DO (Activity II) Stacked area layout
        // // vis.area = d3.area()
        // //     .curve(d3.curveCardinal)
        // //     .x(d=> vis.x(d.data.date))
        // //     .y0(d=> vis.y(d[0]))
        // //     .y1(d=> vis.y(d[1]));
        // //
        // //
        // // vis.tooltip = vis.svg.append("g")
        // //     .append("text")
        // //     .attr("class", "champions")
        // //     .attr("x", 10)
        // //     .attr("y", 10)
        // //     .text("  ");

        this.wrangleData()

    }


    wrangleData() {
        let vis = this

        vis.keys = []
        vis.displayData = vis.bans.map(m => {
            let counts = {};
            let totals_per_month = m.bans.length;
            m.bans.forEach(d => {
                counts[d] = counts[d] ? counts[d] + 1 : 1;
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

        this.updateVis()
    }

    updateVis() {
        let vis = this;

        vis.x.domain(d3.extent(vis.displayData, d => d.month));
        vis.y.domain([0, 1]);

        vis.xAxis.tickFormat(d3.timeFormat("%b"));

        vis.color = d3.scaleOrdinal()
            .domain(vis.keys)
            .range(d3.schemeSet2);

        vis.stackedData = d3.stack()
            .keys(vis.keys)
            (vis.displayData);

        vis.areaChart = vis.svg.append('g')
            .attr("clip-path", "url(#clip)")

        // Area generator
        let area = d3.area()
            .x(function(d) { return vis.x(d.data.month); })
            .y0(function(d) { return vis.y(d[0]); })
            .y1(function(d) { return vis.y(d[1]); })

        // Show the areas
        vis.areaChart
            .selectAll("mylayers")
            .data(vis.stackedData)
            .enter()
            .append("path")
            .attr("class", function(d) { return "area" + d.key })
            .style("fill", function(d) { return vis.color(d.key); })
            .attr("d", area)
            .on("mouseover", function(event,d) {
                console.log(d.key)
            })

        // let byChamp = d3.nest()
        //     .key(function(d) { return d.champ;})
        //     .entries(vis.displayData);
        //
        // vis.color.domain(byChamp.map(function(d){ return d.key }));
        //
        // vis.svg.selectAll(".line")
        //     .data(byChamp)
        //     .enter()
        //     .append("path")
        //     .attr("fill", "none")
        //     .attr("stroke", function(d){ return vis.color(d.key) })
        //     .attr("stroke-width", 1.5)
        //     .attr("d", function(d){
        //         return d3.line()
        //             .x(function(d) { return vis.x(d.month); })
        //             .y(function(d) { return vis.y(+d.banrate); })
        //             (d.values)
        //     })

        // Update domain
       //  vis.y.domain([0, d3.max(vis.displayData, function(d) {
       //      return d3.max(d, function(e) {
       //          return e[1];
       //      });
       //  })
       //  ]);
       //
       //  // Draw the layers
       //  let champions = vis.svg.selectAll(".area")
       //      .data(vis.displayData);
       //
       //  champions.enter().append("path")
       //      .attr("class", "area")
       //      .merge(champions)
       //      .style("fill", d => {
       //          return vis.colorScale(d)
       //      })
       //      .attr("d", d => vis.area(d))
       //      .on("mouseover", function(event,d){
       //          vis.svg.selectAll(".champions").text(d.key) })
       //      .on("mouseout", function(d) {
       //          vis.tooltip.text(null);
       //      });
       //
       //
       // champions.exit().remove();

        // Call axis functions with the new domain
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);
    }



}

