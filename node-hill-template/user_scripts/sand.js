const click_brick = world.bricks.find(brick => brick.name === "click")

click_brick.clicked((player, secure) => {
    if (!secure) return
    player.bottomPrint(`\\c8+${player.data.spc}`)
    player.data.sand += player.data.spc
})

setInterval(() => {
    Game.players.forEach((player) => {
        player.topPrint(`\\c7Sand: ${player.data.sand}        \\c5Sand per click: ${player.data.spc}        \\c7Sand per second: ${player.data.sps}`)
        player.setScore(player.data.sand)
    })
}, 100)