const fs = getModule("fs")

const saveInterval = 600000

if (fs.existsSync(`./player_data/`) === false) fs.mkdirSync("./player_data/")

const currentTemplateVersion = 2
template = {
    firstJoin: true,
    saveDataVersion: currentTemplateVersion,

    sand: 0,

    spc: 1,
    sps: 0
}

const updates = {
    from1: function(player) {
        player.data.spc = 1
        player.data.sps = 0
    }
}

save = async function(player) {
    /*
    db.set(player.userId.toString(), player.data)
    console.log(`DEBUG >>> Saved user data for ${player.username} (${player.userId})!`)
    */
    let data = JSON.stringify(player.data)
    fs.writeFileSync(`./player_data/${player.userId}.txt`, data)
    console.log(`Saved user data for ${player.username} (${player.userId})!`)
}

load = async function(player) {
    //player.sand = baseStats.sand

    /*
    if (await db.has(player.userId.toString())) {
        player.data = await db.get(player.userId.toString())
        console.log(`DEBUG >>> Loaded user data for ${player.username} (${player.userId})!`)

        if (player.data.saveDataVersion < currentTemplateVersion) {
            let pv = player.data.saveDataVersion
            let f = updates["from" + String(currentTemplateVersion)]
            f(player)
            console.log(`DEBUG >>> Updated user data for ${player.username} (${player.userId}) from ${pv} to ${currentTemplateVersion}!`)
        }
    } else {
        await db.set(player.userId.toString(), JSON.parse(JSON.stringify(template)))
        player.data = await db.get(player.userId.toString())
        console.log(`DEBUG >>> Created user data for ${player.username} (${player.userId})!`)
    }
    */

    try {
        if (fs.existsSync(`./player_data/${player.userId}.txt`)) {
            player.data = JSON.parse(fs.readFileSync(`./player_data/${player.userId}.txt`).toString())
            console.log(`Loaded user data for ${player.username} (${player.userId})!`)

            if (player.data.saveDataVersion < currentTemplateVersion) {
                let pv = player.data.saveDataVersion
                let f = updates["from" + String(currentTemplateVersion - 1)]
                f(player)
                console.log(`Updated user data for ${player.username} (${player.userId}) from ${pv} to ${currentTemplateVersion}!`)
            }
        } else {
            player.data = template
            console.log(`Created user data for ${player.username} (${player.userId})!`)
        }
    } catch (error) {
        console.error(error)
        player.kick(error.name)
    }
    
    player.emit("Loaded")
}

Game.on("playerJoin", (player) => {
    player.on("Loaded", async () => {
        player.interact = 0

        console.log(`Player ${player.username} (${player.userId}) loaded!`)

        if (player.data.firstJoin) {
            player.message("\\c5Welcome new player!")
            player.message("\\c5Click the \\c8yellow brick \\c5 to begin earning sand.")

            player.data.firstJoin = false
        } else {
            player.message("\\c5Welcome back!")
        }
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

//Game crash
Game.bindToClose(() => {
    Game.players.forEach((player) => {
        save(player)
    })
})