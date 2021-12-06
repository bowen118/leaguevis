/* * * * * * * * * * * * * *
*    class innovative      *
* * * * * * * * * * * * * */
let normalizedColumns = ["team kpm", "dragons", "heralds", "barons", "towers", "inhibitors", "dpm", "vspm", "earned gpm", "cspm", "xpdiffat15"]
let colors = ['#3ef5f4', '#fffabd', '#19df5c', '#2063de', '#9c25ea', '#c91d1d', '#ffffff', '#6d7a93', '#d35151', '#d39edb', '#ff00a9']

class Innovative {
    constructor(parentElement, teamsData, normalizedTeamData, coords) {
        this.parentElement = parentElement
        this.teamsData = teamsData
        this.teamData = normalizedTeamData
        this.coords = coords
        this.displayData = []

        this.initVis()
    }

    initVis() {
        let vis = this

        vis.margin = {top: 40, right: 175, bottom: 100, left: 175}
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom

        // init drawing area
        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`)

        //scales
        vis.color = d3.scaleOrdinal().domain(normalizedColumns).range(colors)

        // Scales and axes
        vis.dims = Math.min(vis.width, vis.height) * 3 / 4
        vis.x = d3.scaleLinear().range([0, vis.dims])
        vis.y = d3.scaleLinear().range([vis.dims, 0])

        // tooltip
        vis.tooltip = d3.select("body").append('div')
            .attr('class', "tooltip")
            .attr('id', 'circlesTooltip')

        // legend
        vis.legend = vis.svg.append("g")
            .attr("font-family", "sans-serif")
            .attr("font-size", 8)
            .attr("text-anchor", "end")
            .selectAll("g")
            .data(normalizedColumns)
            .enter().append("g")
            .attr("transform", function(d, i) { return `translate(-30, ${vis.height - i * 20 - 30})`; })

        vis.legend.append("rect")
            .attr("x", vis.width - 19)
            .attr("width", 28)
            .attr("height", 19)
            .attr("fill", vis.color);
        vis.legend.append("text")
            .attr("fill", "#c89b3c")
            .attr("x", vis.width - 25)
            .attr("y", 10)
            .attr("dy", "0.32em")
            .text(function(d) {
                return d
            });

        this.wrangleData()
    }

    wrangleData() {
        let vis = this

        // filter games data to include data from the "most competitive" leagues
        vis.leagues = ["WCS", "MSI", "LCK", "LEC", "LCS", "PCS", "LCL", "LJL", "VCS", "TCL"]
        vis.teamData = vis.teamData.filter(d => this.leagues.includes(d.league)).slice(0, vis.coords.length)
        vis.teamsData = vis.teamsData.filter(d => this.leagues.includes(d.league)).slice(0, vis.coords.length)
        vis.displayData = vis.teamData.map(d => normalizedColumns[d3.maxIndex(normalizedColumns.map(m => +d[m]))])

        this.updateVis()
    }

    updateVis() {
        let vis = this

        vis.x.domain([0, 512])
        vis.y.domain([0, 512])

        // append circles in the shape of League of Legends logo
        let circles = vis.svg.selectAll(".shape-circles")
            .data(vis.coords)
            .enter()
            .append("circle")
            .attr("class", "shape-circles")
            .attr("cx", d => vis.x(d.y) + vis.width / 2 - vis.dims / 2)
            .attr("cy", d => vis.y(512 - d.x))
            .attr("r", 3.5)
            .attr("fill", (d, i) => vis.color(vis.displayData[i]))
            .on("mouseover", function(event, d) {
                let index = circles.nodes().indexOf(this)
                vis.tooltip
                    .style("opacity", 1)
                    .style("left", event.pageX + 20 + "px")
                    .style("top", event.pageY + "px")
                    .html(`
                 <div style="border: thin solid grey; border-radius: 5px; background: lightgrey; padding: 20px">
                     <h3>Team: ${vis.teamsData[index]["team"]}</h3>      
                     <p>Date: ${vis.teamsData[index]["date"]}</p>
                     <p>Game Length: ${(vis.teamsData[index]["gamelength"]/60).toFixed(0)} mins</p>      
                     <p>Bans: ${vis.teamsData[index]["ban1"]}, ${vis.teamsData[index]["ban2"]}, ${vis.teamsData[index]["ban3"]}, ${vis.teamsData[index]["ban4"]}, ${vis.teamsData[index]["ban5"]}</p>      
                     <p>Kills: ${vis.teamsData[index]["teamkills"]}</p>            
                     <h4>Neutral Objectives</h4>
                     <p>Dragons: ${vis.teamsData[index]["dragons"]}</p>
                     <p>Heralds: ${vis.teamsData[index]["heralds"]}</p>
                     <p>Barons: ${vis.teamsData[index]["barons"]}</p>       
                     <h4>Structures</h4>
                     <p>Towers: ${vis.teamsData[index]["towers"]}</p>
                     <p>Inhibs: ${vis.teamsData[index]["inhibitors"]}</p>
                 </div>`);
            })
            .on('mouseout', function(event, d){
                vis.tooltip
                    .style("opacity", 0)
                    .style("left", 0)
                    .style("top", 0)
                    .html(``);
            });
    }
}