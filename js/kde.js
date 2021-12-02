class KDE {
    constructor(parentElement, data) {
        this.parentElement = parentElement;
        this.data = data;
        this.side = "both";
        this.initVis();
    }

    initVis() {
        let vis = this;

        vis.margin = {top: 50, right: 100, bottom: 100, left: 50};
        vis.width = document.getElementById(vis.parentElement).getBoundingClientRect().width - vis.margin.left - vis.margin.right;
        vis.height = document.getElementById(vis.parentElement).getBoundingClientRect().height - vis.margin.top - vis.margin.bottom;
        vis.dim = Math.min(vis.width, vis.height);

        vis.data.forEach(d => d.time = +d.time);

        vis.svg = d3.select("#" + vis.parentElement).append("svg")
            .attr("width", vis.width + vis.margin.left + vis.margin.right)
            .attr("height", vis.height + vis.margin.top + vis.margin.bottom)
            .append('g')
            .attr('transform', `translate (${vis.margin.left}, ${vis.margin.top})`);

        vis.svg.append("svg:image")
            .attr("x", 0)
            .attr("y", 0)
            .attr("width", vis.dim)
            .attr("height", vis.dim)
            .attr("xlink:href", "img/minimap.png");

        vis.x = d3.scaleLinear()
            .domain([0, 512])
            .range([0, vis.dim]);
        vis.y = d3.scaleLinear()
            .domain([0, 512])
            .range([0, vis.dim]);

        let slider = document.getElementById('slider');
        let sliderMin = 0;
        let sliderMax = 1;
        noUiSlider.create(slider, {
            start: [sliderMin, sliderMax],
            connect: true,
            range: {
                "min": sliderMin,
                "max": sliderMax
            },
            step: 0.01,
            behaviour: "tap-drag",
            // tooltips: true,
            // format: {
            //     to: d => d,
            //     from: d => parseInt(d)
            // },
            pips: {
                mode: "range",
                density: 5
            }
        });
        slider.style.height = "18px";
        slider.style.width = `${vis.dim}px`;
        vis.start = sliderMin;
        vis.end = sliderMax;
        slider.noUiSlider.on('update', function(values) {
            vis.start = values[0];
            vis.end = values[1];
            vis.wrangleData(vis.side);
        });

        vis.legend = vis.svg.select("rect")
            .enter()
            .append("rect")
            .attr("width", 300)
            .attr("height", 20)

        vis.wrangleData(vis.side);
    }

    wrangleData(side) {
        let vis = this;

        vis.side = side;
        if (vis.side === "red") {
            vis.useData = vis.data.filter(d => d.red_side === "True");
        } else if (vis.side === "blue") {
            vis.useData = vis.data.filter(d => d.red_side === "False");
        } else {
            vis.useData = vis.data;
        }

        vis.filteredData = vis.useData.filter(d => d.time >= vis.start && d.time <= vis.end)

        vis.displayData = d3.contourDensity()
            .x(d => vis.x(d.left))
            .y(d => vis.y(d.top))
            .size([vis.width, vis.height])
            .bandwidth(15)
            (vis.filteredData);

        vis.updateVis();
    }

    updateVis() {
        let vis = this;

        vis.color = d3.scaleLinear()
            .domain([0, d3.max(vis.displayData, d => d.value)]);
        vis.opacity = d3.scaleLinear()
            .domain([0, d3.max(vis.displayData, d => d.value)])
            .range([0.05, 0.3]);

        if (vis.side === "red") {
            vis.color.range(["white", "red"]);
        } else if (vis.side === "blue") {
            vis.color.range(["white", "blue"]);
        } else {
            vis.color.range(["white", "#DA70D6"]);
        }

        vis.kde = vis.svg
            .selectAll("path")
            .data(vis.displayData);

        vis.kde.enter().append("path")
            .attr("class", "red-path")
            .merge(vis.kde)
            // .transition().duration(800)
            .attr("d", d3.geoPath())
            .attr("fill", d => vis.color(d.value))
            .attr("opacity", d => vis.opacity(d.value));

        vis.kde.exit().remove();
    }
}