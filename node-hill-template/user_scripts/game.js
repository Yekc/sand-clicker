//Just for convenience
console.error("----------------------------------------")
Game.MOTD = ""

//Random bricks
Game.world.bricks.forEach(brick => {
    if (brick.name === "random" || brick.name === "random_super") brick.setVisibility(0)
})