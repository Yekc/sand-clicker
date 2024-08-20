const { QuickDB } = getModule("quick.db")
/*db = new QuickDB()

const saveInterval = 600000

baseStats = {
    sand: 0
}

const currentTemplateVersion = 1
template = {
    firstJoin: true,
    saveDataVersion: currentTemplateVersion,

    sand: 0
}

const updates = {
    from0: function(player) {}
}

save = async function(player) {
    db.set(player.userId.toString(), player.data)
    console.log(`DEBUG >>> Saved user data for ${player.username} (${player.userId})!`)
}

load = async function(player) {
    player.sand = baseStats.sand

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

    player.emit("Loaded")
}

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
*/