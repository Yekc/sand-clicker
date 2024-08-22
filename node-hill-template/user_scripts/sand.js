getSand = function(player, amount) {
    player.data.sand += amount
    player.data.total_sand += amount
}

//Yellow brick clicking
const click_brick = world.bricks.find(brick => brick.name === "click")
click_brick.clicked(debouncePlayer((player, secure) => {
    if (!secure) return //Make sure player is close enough
    player.centerPrint(`\\c8+${player.data.spc}`)
    getSand(player, player.data.spc)
}, 175))

//Sand per second interval
setInterval(() => {
    Game.players.forEach((player) => {
        getSand(player, player.data.sps)
    })
}, 1000)