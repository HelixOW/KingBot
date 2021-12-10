const {ALL_RACES, ALL_TYPES, ALL_GRADES, ALL_EVENT, ALL_AFFECTIONS, UNIT_LIST, Race} = require("./units_helper")
const {ALL_BANNER_LIST} = require("./banners_helper")
const {getRandomInt, removeItem} = require("./general_helper")

module.exports = {
    getUnitsMatching: (races = null, types = null, grades = null, events = null, affections = null, names = null, banners = null) => {
        if(races === null) races = [...ALL_RACES]
        if(types === null) types = [...ALL_TYPES]
        if(grades === null) grades = [...ALL_GRADES]
        if(events === null) events = [...ALL_EVENT]
        if(affections === null) affections = [...ALL_AFFECTIONS]
        if(names === null) names = UNIT_LIST.map(u => u.name.toLowerCase().replace(" ", ""))
        if(banners === null) banners = ALL_BANNER_LIST.map(b => b.unique_name.toLowerCase())
    
        function test(unit) {
            return races.includes(unit.race) &&
             types.includes(unit.type) &&
              grades.includes(unit.grade) &&
               events.includes(unit.event) &&
                affections.includes(unit.affection) &&
                 names.includes(unit.name.toLowerCase().replace(" ", "")) &&
                  banners.some(b => unit.home_banners.includes(b))
        }
    
        return UNIT_LIST.filter(test)
    },

    getRandomUnit: (races, types, grades, events, affections, names, banners) => {
        let possibleUnits = module.exports.getUnitsMatching(races, types, grades, events, affections, names, banners)

        if(possibleUnits.length === 0) return null

        return possibleUnits[getRandomInt(0, possibleUnits.length - 1)]
    },

    replaceDuplicates: (races, types, grades, events, affections, names, banners, teamToCheck) =>  {
        const teamSimpleNames = Array(4).fill("")

        const checkNames = i => {
            if(!teamSimpleNames.includes(teamToCheck[i].simple_name)) {
                teamSimpleNames[i] = teamToCheck[i].simple_name
                return true
            }

            teamToCheck[i] = module.exports.getUnitsMatching(races, types, grades, events, affections, names, banners)
            return false
        }

        for(let unit = 0; unit < teamToCheck.length; unit++) {
            for(let i = 0; i < 500; i++) {
                if(checkNames(unit))
                    break

                if(teamSimpleNames[i] === "")
                    throw new RangeError("Not enough Units available")
            }
        }

        return teamToCheck
    },

    getRandomTeam: (races, types, grades, events, affections, names, banners, amount) => {
        const proposedTeam = Array(4).fill(module.exports.getUnitsMatching(races, types, grades, events, affections, names, banners))

        try {
            module.exports.replaceDuplicates(races, types, grades, events, affections, names, banners, maxRaces, proposedTeam)
        } catch(e) {
            throw e
        }

        return proposedTeam
    }
}