import { Event, Grade, Race, Type, Unit, unitExists, unitList, Affection } from './units';
import puppeteer = require("puppeteer");
import { latestUnitId, readUnitsFromDatabase, registerNewUnit } from './database_helper';
import request = require("request")
import fs = require("fs")

async function scrapeUnitDetail(path: string): Promise<{ name: string; grade: Grade; type: Type; race: Race; imgPath: string}> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto('https://gcdatabase.com/' + path)
    const title = await page.$("div.pt-3 h5")
    const name = await page.$("div.pt-3 h4")
    const imgTag = await page.$(".row .mt-3 img")
    const basicInfos = await page.$("div.mb-3 div.list-group-item div.table-responsive table tbody")
    const info = {
        "Rarity": "",
        "Attribute": "",
        "Race": ""
    }
    
    for(const basicInfo of await basicInfos.$$("tr")) {
        const bITds = await basicInfo.$$("td")
        const imgTag = await bITds[1].$("img")

        const a = await page.evaluate(async (e, imgTag) => {
            return [e.textContent, imgTag.getAttribute("src")]
        }, bITds[0], imgTag)

        let b = null

        switch (a[1].split("/").slice(-1).pop().replace(".webp", "")) {
            case "rarity_r":
                b = Grade.R
                break
            case "rarity_sr":
                b = Grade.SR
                break
            case "rarity_ssr":
                b = Grade.SSR
                break
            case "attribute_vitality":
                b = Type.GREEN
                break
            case "attribute_speed":
                b = Type.BLUE
                break
            case "attribute_strength":
                b = Type.RED
                break
            case "attribute_dark":
                b = Type.DARK
                break
            case "attribute_light":
                b = Type.LIGHT
                break
            case "race_demon":
                b = Race.DEMON
                break
            case "race_giant":
                b = Race.GIANT
                break
            case "race_human":
                b = Race.HUMAN
                break
            case "race_fairy":
                b = Race.FAIRY
                break
            case "race_goddess":
                b = Race.GODDESS
                break
            case "race_unknown":
                b = Race.UNKNOWN
                break
        }

        info[a[0]] = b
    } 
    const full = await page.evaluate(async (a, b, c, d) => {
        return {
            name: a.textContent.replace("<", "[").replace(">", "]") + " " + b.textContent,
            grade: c["Rarity"],
            type: c["Attribute"],
            race: c["Race"],
            imgPath: d.src
        }
    }, title, name, info, imgTag)
    browser.close()

    return full
}

export async function* scanForNewUnits(): AsyncGenerator<Unit, any, Unit> {
    const browser = await puppeteer.launch()
    const page = await browser.newPage()

    await page.goto('https://gcdatabase.com/characters')
    const unitTableTag = await page.$("table tbody")

    for(const rowTag of await unitTableTag.$$("tr")) {
        const columnTags = await rowTag.$$("td")
        const linkTag = await columnTags[0].$("a")

        const unitType = Type.fromString((await page.evaluate(e => e.textContent.toLowerCase(), columnTags[1])))
        const unitGrade = Grade.fromString((await page.evaluate(e => e.textContent.toLowerCase(), columnTags[2])))
        
        if(unitExists(await page.evaluate(e => e.textContent.toLowerCase(), linkTag), unitGrade, unitType)) continue

        console.log("New Unit found! => ", await page.evaluate(e => e.textContent, linkTag))
        const details = await scrapeUnitDetail(await page.evaluate(async e => await e.getAttribute("href"), linkTag))
        
        const id = latestUnitId() + 1
        
        let u = new Unit(
            id,
            details.name,
            await page.evaluate(e => e.textContent, linkTag),
            await page.evaluate(e => e.textContent, linkTag),
            [],
            unitType,
            unitGrade,
            details.race,
            Event.BASE_GAME,
            Affection.NONE,
            ""
        )

        const page2 = await browser.newPage()
        await page2.goto(details.imgPath)
        const imgTag = await page2.$("img")

        await imgTag.screenshot({path: `./data/gc/icons/${id}.png`})
        u = await u.updateIcon()

        yield u
    }

    browser.close()
}
