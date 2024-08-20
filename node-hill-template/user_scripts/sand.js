//Yellow brick clicking
const click_brick = world.bricks.find(brick => brick.name === "click")
click_brick.clicked((player, secure) => {
    if (!secure) return //Make sure player is close enough
    player.centerPrint(`\\c8+${player.data.spc}`)
    player.data.sand += player.data.spc
})