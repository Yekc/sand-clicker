const fs = getModule("fs")

const saveInterval = 600000

//Create player data folder if it does not exist
if (fs.existsSync(`./player_data/`) === false) fs.mkdirSync("./player_data/")

//Default save data
const currentTemplateVersion = 4
const template = {
    firstJoin: true,
    lastOnline: 0,
    saveDataVersion: currentTemplateVersion,

    sand: 0,
    total_sand: 0,

    spc: 1, //Sand per second
    sps: 0, //Sand per click

    office_tip: false,

    items: {
        increase_spc: 0,
        tiny_tim_buy: 0,
        tiny_tim: 0,
        mr_crabs_buy: 0,
        mr_crabs: 0,
        tims_father_buy: 0,
        tims_father: 0,
        sand_eater_buy: 0,
        sand_eater: 0,
        manager: 0,
        mr_rich_buy: 0,
        offline_earnings_buy: 0,
        super_duper_random_brick_buy: 0
    },

    pet_equipped: false,
    pet_active: "",
    pets: {
        mole_crab: 0,
        roly_poly: 0,
        scallop: 0,
        starfish: 0,
        rat: 0,
        seagull: 0,
        sand_dollar: 0,
        hermit_crab: 0,
        jellyfish: 0,
        pelican: 0,
        flamingo: 0,
        iguana: 0,
        penguin: 0,
        seal: 0,
        turtle: 0,
        walrus: 0,
        family_dog: 0,
        fred: 0,
        squid: 0,
        mr_rich: 0,
        sandworm: 0,
        cookie_monster: 0,
        grimace: 0
    }
}

//Update save data to new format
const updates = {
    from1: function(player) {
        player.data.items.mr_rich_buy = 0
        player.data.pet_equipped = false
        player.data.pet_active = ""
        player.data.pets = {
            mole_crab: 0,
            roly_poly: 0,
            scallop: 0,
            starfish: 0,
            rat: 0,
            seagull: 0,
            sand_dollar: 0,
            hermit_crab: 0,
            jellyfish: 0,
            pelican: 0,
            flamingo: 0,
            iguana: 0,
            penguin: 0,
            seal: 0,
            turtle: 0,
            walrus: 0,
            family_dog: 0,
            fred: 0,
            squid: 0,
            mr_rich: 0,
            sandworm: 0,
            cookie_monster: 0
        }

        player.data.saveDataVersion = 2
    },
    from2: function(player) {
        player.data.lastOnline = 0
        player.data.items.offline_earnings_buy = 0
        player.data.items.super_duper_random_brick_buy = 0

        player.data.saveDataVersion = 3
    },
    from3: function(player) {
        player.data.items.offline_earnings_buy = 0
        player.data.items.super_duper_random_brick_buy = 0

        player.data.saveDataVersion = 4
    },
    from4: function(player) {
        player.data.pets.grimace = 0

        player.data.saveDataVersion = 5
    }
}

updateSpc = function(player) {
    player.data.spc = 1

    player.data.spc += player.data.items.increase_spc

    if (player.data.pet_equipped) {
        let pet = getPet(player.data.pet_active)
        if (pet.perks.spc != 0) player.data.spc += getPerkStrength(pet.perks.spc, player.data.pets[player.data.pet_active])
        if (pet.perks.spc_mult != 0) player.data.spc = Math.round(player.data.spc * getPerkStrengthMult(pet.perks.spc_mult, player.data.pets[player.data.pet_active]))
    }

    if (player.data.spc < 0) player.data.spc = 0
}

updateSps = function(player) {
    player.data.sps = 0

    if (player.data.items.tiny_tim_buy > 0) player.data.sps += 1 + (player.data.items.tiny_tim * (player.data.pet_equipped ? (getPet(player.data.pet_active).perks.bonus === "fred_bonus" ? 10 : 1) : 1))
    if (player.data.items.mr_crabs_buy > 0) player.data.sps += 5 + ((player.data.items.mr_crabs * 2) * (player.data.pet_equipped ? (getPet(player.data.pet_active).perks.bonus === "squid_bonus" ? 5 : 1) : 1))
    if (player.data.items.tims_father_buy > 0) player.data.sps += 10 + (player.data.items.tims_father * 5)
    if (player.data.items.sand_eater_buy > 0) player.data.sps += 20 + ((player.data.items.sand_eater * 10) * (player.data.pet_equipped ? (getPet(player.data.pet_active).perks.bonus === "sandworm_bonus" ? 2 : 1) : 1))
    
    if (player.data.items.manager > 0) player.data.sps = Math.round(player.data.sps * (1 + (0.05 * player.data.items.manager)))
    
    if (player.data.pet_equipped) {
        let pet = getPet(player.data.pet_active)
        if (pet.perks.sps != 0) player.data.sps += getPerkStrength(pet.perks.sps, player.data.pets[player.data.pet_active])
        if (pet.perks.sps_mult != 0) player.data.sps = Math.round(player.data.sps * getPerkStrengthMult(pet.perks.sps_mult, player.data.pets[player.data.pet_active]))
        if (pet.perks.bonus === "family_dog_bonus") {
            let total_pets = 0
            for (let i = 0; i < 22; i++) {
                if (player.data.pets[Object.keys(player.data.pets)[i]] > 0) total_pets++
            }
            player.data.sps = Math.round(player.data.sps * (1 + (0.1 * total_pets)))
        }
    }

    if (player.data.sps < 0) player.data.sps = 0
}

update = function(player) {
    let pv = player.data.saveDataVersion
    let f = updates["from" + String(currentTemplateVersion - 1)]
    f(player)
    console.log(`Updated user data for ${player.username} (${player.userId}) from ${pv} to ${currentTemplateVersion}!`)

    if (player.data.saveDataVersion < currentTemplateVersion) update(player)
}

save = async function(player) {
    player.data.lastOnline = Date.now()

    let data = JSON.stringify(player.data)
    fs.writeFileSync(`./player_data/${player.userId}.txt`, data)
    console.log(`Saved user data for ${player.username} (${player.userId})!`)
}

load = async function(player) {
    try {
        if (fs.existsSync(`./player_data/${player.userId}.txt`)) { //Player has save data already
            player.data = JSON.parse(fs.readFileSync(`./player_data/${player.userId}.txt`).toString())
            console.log(`Loaded user data for ${player.username} (${player.userId})!`)

            //Check if save data format needs to be updated
            if (player.data.saveDataVersion < currentTemplateVersion) {
                update(player)
            }
        } else { //Player has no save data
            player.data = JSON.parse(JSON.stringify(template)) //Need to reparse like that to deep copy player data
            console.log(`Created user data for ${player.username} (${player.userId})!`)
        }
    } catch (error) {
        console.error(error)
        player.kick(`There was an issue loading your save data: ${error.name}`)
    }
    
    player.emit("Loaded")
}

Game.on("playerJoin", (player) => {
    player.on("Loaded", async () => {
        //Create variables
        player.should_say = true
        player.interact = false
        player.dialogue = ""
        player.pet_inv = false
        player.pet_inv_page = 1
        player.pet_inv_view = 0

        //Join messages and first time joining
        if (player.data.firstJoin) {
            player.message("\\c5Welcome new player!")
            player.message("\\c5Click the \\c8yellow brick \\c5 to begin earning sand.")
            player.data.firstJoin = false
        } else {
            player.message("\\c5Welcome back!")

            //Update sand per second
            updateSps(player)

            //Offline earnings
            if (player.data.items.offline_earnings_buy > 0) {
                let now = Date.now()
                let seconds = (now / 1000) - (player.data.lastOnline / 1000)
                if (seconds >= 120) { //Player has been offline for longer than 2 minutes
                    let hours = Math.round(seconds / 36) / 100
                    let amount

                    if (hours >= player.data.items.offline_earnings_buy) { //Player has been offline longer than their max offline earnings time
                        amount = Math.round((player.data.items.offline_earnings_buy * 3600 * player.data.sps) / 50)
                    } else { //Player has been offline shorter than their max offline earnings time
                        amount = Math.round((seconds * player.data.sps) / 50)
                    }

                    //Player owns 50% more offline earnings gamepass
                    if (player.ownsAsset(696)) {
                        amount = Math.round(amount * 1.5)
                    }

                    getSand(player, amount)
                    player.message(`\\c9Offline Earnings! \\c5You earned \\c8${number(amount)} sand while you were offline for ${hours} hour${hours != 1 ? "s" : ""}.`)
                    player.message(`\\c1(Max offline earning time: ${player.data.items.offline_earnings_buy} hour${player.data.items.offline_earnings_buy != 1 ? "s" : ""})`)
                    player.message(`${player.ownsAsset(696) ? "\\c9You earned 50% more offline because you own the gamepass. Thank you for purchasing!" : ""}`)
                }
            }
        }

        console.log(`Player ${player.username} (${player.userId}) loaded!`)
    })
})

Game.on("initialSpawn", (player) => {
    load(player)
})

setInterval(() => {
    Game.players.forEach((player) => {
        save(player)
    })
}, saveInterval)

Game.on("playerLeave", (player) => {
    save(player)
})

//Save if server suddenly stops
Game.bindToClose(() => {
    Game.players.forEach((player) => {
        save(player)
    })
})