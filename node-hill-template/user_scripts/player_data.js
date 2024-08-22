const fs = getModule("fs")

const saveInterval = 600000

//Create player data folder if it does not exist
if (fs.existsSync(`./player_data/`) === false) fs.mkdirSync("./player_data/")

//Default save data
const currentTemplateVersion = 7
template = {
    firstJoin: true,
    saveDataVersion: currentTemplateVersion,

    sand: 0,
    total_sand: 0,

    spc: 1, //Sand per second
    sps: 0, //Sand per click

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
        manager: 0
    }
}

//Update save data to new format
const updates = {
    from6: function(player) {
        player.data.items.manager = 0

        player.data.saveDataVersion = 7
    }
}

updateSps = function(player) {
    player.data.sps = 0

    if (player.data.items.tiny_tim_buy > 0) player.data.sps += 1 + player.data.items.tiny_tim
    if (player.data.items.mr_crabs_buy > 0) player.data.sps += 5 + (player.data.items.mr_crabs * 2)
    if (player.data.items.tims_father_buy > 0) player.data.sps += 10 + (player.data.items.tims_father * 5)
    if (player.data.items.sand_eater_buy > 0) player.data.sps += 20 + (player.data.items.sand_eater * 10)
    
    if (player.data.items.manager > 0) player.data.sps = Math.round(player.data.sps * player.data.items.manager * 1.1)
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
            player.data = template
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
        player.interact = false
        player.dialogue = ""

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