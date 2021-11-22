/* * * * * * * * * * * * * *
*    class areachart     *
* * * * * * * * * * * * * */


class AreaChart {
    constructor(parentElement, teamData) {
        this.parentElement = parentElement
        this.data = teamData
        this.displayData = []

        
        this.championArray = Array.from(d3.rollup(this.data, v => v.length, d => d.ban1), ([key, value]) => ({key, value}))

        // sort champion array
        this.championArray.sort(function(a,b) {
            return d3.ascending(a.value, b.value)
        });

        console.log(this.championArray)


        // this.champions = ["Thresh", 'Seraphine', 'Galio', 'Gnar', 'Rell', 'Sett', 'Aphelios', 'Lulu', 'Nidalee',
        //     'Taliyah', 'Varus', "Kai'Sa", 'Karma', 'Pantheon', 'Zoe', 'Hecarim', 'Kalista', 'Tristana', 'Lillia', 'Ziggs',
        //     'Twisted Fate', 'Akali', 'LeBlanc', 'Senna', 'Lee Sin', 'Irelia', 'Viego', 'Lucian', 'Olaf', 'Nocturne',
        //     'Camille', 'Udyr', 'Gwen', 'Xin Zhao', 'Renekton']
        //
        //
        // console.log(this.champions)

        //for final vis - filter to only keep counts of champions with at least 1% ban rate (190 bans)


        let colors = ['#a6cee3','#1f78b4','#b2df8a','#33a02c','#fb9a99','#e31a1c','#fdbf6f','#ff7f00','#cab2d6','#6a3d9a'];

        // prepare colors for range
        let colorArray = this.championArray.map( (d,i) => {
            return colors[i%10]
        })
        // Set ordinal color scale
        this.colorScale = d3.scaleOrdinal()
            .domain(this.championArray)
            .range(colorArray);

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
            .attr('class', 'title area-chart-title')
            .append('text')
            .text("Champion Ban Rates in 2021")
            .attr('transform', `translate(${vis.width / 2}, 10)`)
            .attr('text-anchor', 'middle')


        // Scales and axes
        vis.x = d3.scaleTime()
            .range([0, vis.width])
            .domain(d3.extent(vis.data, d=> d.date));

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


        // Initialize stack layout

        let stack = d3.stack()
            .keys(["key"]);

        //Stack data

        vis.stackedData = stack(vis.championArray);

        console.log(this.stackedData);

        // TO-DO (Activity II) Stacked area layout
        vis.area = d3.area()
            .curve(d3.curveCardinal)
            .x(d=> vis.x(d.data.date))
            .y0(d=> vis.y(d[0]))
            .y1(d=> vis.y(d[1]));


        vis.tooltip = vis.svg.append("g")
            .append("text")
            .attr("class", "champions")
            .attr("x", 10)
            .attr("y", 10)
            .text("  ");

        this.wrangleData()

    }


    wrangleData() {
        let vis = this

        vis.displayData = vis.stackedData;

        this.updateVis()
    }

    updateVis() {
        let vis = this;

        // Update domain
        vis.y.domain([0, d3.max(vis.displayData, function(d) {
            return d3.max(d, function(e) {
                return e[1];
            });
        })
        ]);

        // Draw the layers
        let champions = vis.svg.selectAll(".area")
            .data(vis.displayData);

        champions.enter().append("path")
            .attr("class", "area")
            .merge(champions)
            .style("fill", d => {
                return vis.colorScale(d)
            })
            .attr("d", d => vis.area(d))
            .on("mouseover", function(event,d){
                vis.svg.selectAll(".champions").text(d.key) })
            .on("mouseout", function(d) {
                vis.tooltip.text(null);
            });


       champions.exit().remove();

        // Call axis functions with the new domain
        vis.svg.select(".x-axis").call(vis.xAxis);
        vis.svg.select(".y-axis").call(vis.yAxis);
    }



}

