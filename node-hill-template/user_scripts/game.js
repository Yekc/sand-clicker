//Just for convenience
console.error("----------------------------------------")
Game.MOTD = ""

//Restart after 3 hours
setTimeout(() => {
    Game.messageAll("\\c6!!! Server restarting in 1 minute !!!")

    Game.players.forEach(player => {
        save(player)
        player.kick("SERVER AUTO-RESTARTING!#Please rejoin the game.")
    })

    setTimeout(() => {Game.shutdown()}, 60000)
}, 12000000)

//Random bricks
Game.world.bricks.forEach(brick => {
    if (brick.name === "random" || brick.name === "random_super" || brick.name.startsWith("duper") || brick.name.startsWith("random_duper") || brick.name.startsWith("random_super_duper")) {
        brick.setVisibility(0)
        brick.setCollision(false)
    }
})