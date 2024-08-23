const fs = getModule("fs")

const saveInterval = 600000

//Create player data folder if it does not exist
if (fs.existsSync(`./player_data/`) === false) fs.mkdirSync("./player_data/")

//Default save data
const currentTemplateVersion = 1
const template = {
    firstJoin: true,
    saveDataVersion: currentTemplateVersion,

    sand: 0,
    total_sand: 0,

    spc: 1, //Sand per second
    sps: 0, //Sand per click

    office_tip: false,

    items: {},

    pet_equipped: false,
    pet_active: "",
    pets: {}
}

//Update save data to new format
const updates = {
    from0: function(player) {}
}

updateSpc = function(player) {
    player.data.spc = 1

    player.data.spc += player.data.items.increase_spc

    if (player.data.pet_equipped) {
        let pet = getPet(player.data.pet_active)
        console.log(pet.perks.spc)
        console.log(pet.perks.spc_mult)
        console.log(player.data.spc)
        if (pet.perks.spc != 0) player.data.spc += pet.perks.spc
        if (pet.perks.spc_mult != 0) player.data.spc = Math.round(player.data.spc * pet.perks.spc_mult)
    }

    if (player.data.spc < 0) player.data.spc = 0
}

updateSps = function(player) {
    player.data.sps = 0

    if (player.data.items.tiny_tim_buy > 0) player.data.sps += 1 + player.data.items.tiny_tim
    if (player.data.items.mr_crabs_buy > 0) player.data.sps += 5 + (player.data.items.mr_crabs * 2)
    if (player.data.items.tims_father_buy > 0) player.data.sps += 10 + (player.data.items.tims_father * 5)
    if (player.data.items.sand_eater_buy > 0) player.data.sps += 20 + (player.data.items.sand_eater * 10)
    
    if (player.data.items.manager > 0) player.data.sps = Math.round(player.data.sps * (1 + (0.05 * player.data.items.manager)))
    
    if (player.data.pet_equipped) {
        let pet = getPet(player.data.pet_active)
        if (pet.perks.sps != 0) player.data.sps += pet.perks.sps
        if (pet.perks.sps_mult != 0) player.data.sps = Math.round(player.data.sps * pet.perks.sps_mult)
    }

    if (player.data.sps < 0) player.data.sps = 0
}

save = async function(player) {
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
                let pv = player.data.saveDataVersion
                let f = updates["from" + String(currentTemplateVersion - 1)]
                f(player)
                console.log(`Updated user data for ${player.username} (${player.userId}) from ${pv} to ${currentTemplateVersion}!`)
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