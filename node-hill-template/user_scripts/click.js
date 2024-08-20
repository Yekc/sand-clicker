const click_brick = world.bricks.find(brick => brick.name === "click")

click_brick.clicked((player, secure) => {
    if (!secure) return
    player.bottomPrint(`\\c8+${player.data.sand}`)
    player.data.sand++
})