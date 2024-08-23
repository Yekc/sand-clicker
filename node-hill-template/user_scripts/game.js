//Just for convenience
console.error("----------------------------------------")
Game.MOTD = ""

//Restart after 2 hours
setTimeout(() => {
    Game.messageAll.message("\\c6!!! Server restarting in 1 minute !!!")

    Game.players.forEach(player => {
        save(player)
    })

    setTimeout(() => {Game.messageAll.message("\\c6!!! Server restarting in 10 seconds !!!")}, 10000)
    setTimeout(() => {Game.shutdown()}, 60000)
//}, 7200000)
}, 120000)

//Random bricks
Game.world.bricks.forEach(brick => {
    if (brick.name === "random" || brick.name === "random_super") brick.setVisibility(0)
})