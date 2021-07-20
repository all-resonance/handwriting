class Stats {
    constructor(compliation) {
        this.entries = compliation.entries
        this.modules = compliation.modules
    }

    toJson() {
        return this
    }
}

module.exports = Stats