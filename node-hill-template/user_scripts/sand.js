const click_brick = world.bricks.find(brick => brick.name === "click")

click_brick.clicked((player, secure) => {
    if (!secure) return
    player.centerPrint(`\\c8+${player.data.spc}`)
    player.data.sand += player.data.spc
})

setInterval(() => {
    Game.players.forEach((player) => {
        player.bottomPrint(`\\c8Sand: ${player.data.sand}  \\c2|  \\c7Sand per click: ${player.data.spc}  \\c2|  \\c7Sand per second: ${player.data.sps}`)
        player.setScore(player.data.sand)

        if (player.interact == 0) player.open = 0 //Close UI if player walks away

        switch (player.open) {
            case 1:
                player.topPrint(`Press \\c7F\\c0 to close the Shop`)
                break;
        }
    })
}, 100)

Game.on("playerJoin", (player) => {
    player.on("Loaded", () => {
        player.keypress(async(key) => {
            switch (key) {
                case "f":
                    if (player.open == 0) {
                        player.message("test1")
                        player.open = player.interact //player.interact: Make sure player is close enough
                        player.setSpeed(0)
                    } else {
                        player.message("test2")
                        player.open = 0
                        player.setSpeed(4)
                    }
                    break;
            }
        })
    })
})