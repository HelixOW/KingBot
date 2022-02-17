import { ALL_RACES, ALL_TYPES, ALL_GRADES, ALL_EVENT, ALL_AFFECTIONS, unitList, Race, Type, Grade, Event, Affection, Unit } from './units';
import { allBannerList, Banner } from './banners';
import { getRandomInt, getRandomArrayValue } from "./general"
import { Collection } from 'discord.js';

export function getUnitsMatching(
    races: Race[] = null,
    types: Type[] = null, 
    grades: Grade[] = null, 
    events: Event[] = null, 
    affections: Affection[] = null, 
    names: string[] = null, 
    banners: string[] = null, 
    excepting: Unit[] = null): Collection<number, Unit> {
        if(races === null) races = [...ALL_RACES]
        if(types === null) types = [...ALL_TYPES]
        if(grades === null) grades = [...ALL_GRADES]
        if(events === null) events = [...ALL_EVENT]
        if(affections === null) affections = [...ALL_AFFECTIONS]
        if(names === null) names = unitList.map(u => u.simpleName.toLowerCase().replace(" ", ""))
        if(banners === null) banners = allBannerList.map(b => b.uniqueName.toLowerCase())
        if(excepting === null) excepting = []

        names = names.map(name => name.toLowerCase().replace(" ", ""))
    
        function test(unit: Unit) {
            return races.includes(unit.race) &&
             types.includes(unit.type) &&
              grades.includes(unit.grade) &&
               events.includes(unit.event) &&
                affections.includes(unit.affection) &&
                 names.includes(unit.simpleName.toLowerCase().replace(" ", "")) &&
                  banners.some(b => unit.homeBanners.includes(b)) &&
                    !excepting.includes(unit)
        }
    
        return unitList.filter(u => test(u))
    }

export function getRandomUnit(
    races: Race[], 
    types: Type[], 
    grades: Grade[], 
    events: Event[], 
    affections: Affection[], 
    names: string[], 
    banners: string[], 
    excepting: Unit[]) {
        let possibleUnits = getUnitsMatching(races, types, grades, events, affections, names, banners, excepting)

        if(possibleUnits.size === 0) 
            return null

        return possibleUnits.random()
    }

export function replaceDuplicates(
    races: Race[], 
    types: Type[], 
    grades: Grade[], 
    events: Event[], 
    affections: Affection[], 
    names: string[], 
    banners: string[], 
    teamToCheck: Unit[], 
    excepting: Unit[]): Unit[] {
        const teamSimpleNames = Array(4).fill("")

        const checkNames = i => {
            if(!teamSimpleNames.includes(teamToCheck[i].simpleName)) {
                teamSimpleNames[i] = teamToCheck[i].simpleName
                return true
            }

            teamToCheck[i] = getRandomUnit(races, types, grades, events, affections, names, banners, excepting)
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
    }

export function getRandomTeam(
    races: Race[], 
    types: Type[], 
    grades: Grade[], 
    events: Event[], 
    affections: Affection[], 
    names: string[], 
    banners: string[], 
    excepting: Unit[]) : Unit[] {
        const matchingUnits = getUnitsMatching(races, types, grades, events, affections, names, banners)
        const proposedTeam = Array.from({length: 4}, () => matchingUnits.random())

        try {
            replaceDuplicates(races, types, grades, events, affections, names, banners, proposedTeam, excepting)
        } catch(e) {
            throw e
        }

        return proposedTeam
    }