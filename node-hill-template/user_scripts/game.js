//Just for convenience
console.error("----------------------------------------")
Game.MOTD = ""

//Restart after 2 hours
setTimeout(() => {
    Game.messageAll("\\c6!!! Server restarting in 1 minute !!!")

    Game.players.forEach(player => {
        save(player)
        player.kick("SERVER AUTO-RESTARTING!#Please rejoin the game.")
    })

    setTimeout(() => {Game.shutdown()}, 60000)
}, 7200000)

//Random bricks
Game.world.bricks.forEach(brick => {
    if (brick.name === "random" || brick.name === "random_super") brick.setVisibility(0)
})