/* * * * * * * * * * * * * *
*    class innovative      *
* * * * * * * * * * * * * */
let normalizedColumns = ["team kpm", "dragons", "heralds", "barons", "towers", "inhibitors", "dpm", "vspm", "earned gpm", "cspm", "xpdiffat15"]

class Innovative {
    constructor(parentElement, normalizedTeamData) {
        this.parentElement = parentElement
        this.teamData = normalizedTeamData
        this.displayData = []

        this.initVis()
    }

    initVis() {
        this.wrangleData()
    }

    wrangleData() {
        this.updateVis()
    }

    updateVis() {
        return
    }
}