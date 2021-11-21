/* * * * * * * * * * * * * *
*    class innovative      *
* * * * * * * * * * * * * */
let normalizedColumns = ["team kpm", "dragons", "heralds", "barons", "towers", "inhibitors", "dpm", "vspm", "earned gpm", "cspm", "xpdiffat15"]
let colors = ['#3cb44b', '#ffe119', '#4363d8', '#46f0f0', '#bcf60c', '#fabebe', '#008080', '#e6beff', '#aaffc3', '#ffd8b1', '#ffffff']

class Innovative {
    constructor(parentElement, normalizedTeamData) {
        this.parentElement = parentElement
        this.teamData = normalizedTeamData
        this.displayData = []

        this.initVis()
    }

    initVis() {
        let vis = this

        //scales
        vis.color = d3.scaleOrdinal().domain(normalizedColumns).range(colors)

        this.wrangleData()
    }

    wrangleData() {
        let vis = this
        this.updateVis()
    }

    updateVis() {
        return
    }
}