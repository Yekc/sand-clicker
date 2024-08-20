const clamp = (num, min, max) => Math.min(Math.max(num, min), max)

updateStats = function(player) {
    
}

Game.on("playerJoin", (player) => {
    player.on("Loaded", async () => {
        console.log(`DEBUG >>> Player ${player.username} (${player.userId}) loaded!`)

        if (player.data.firstJoin) {
            player.message("\\c5Welcome new player!")
            player.message("\\c5Click the \\c8yellow brick \\c5 to begin earning sand.")

            player.data.firstJoin = false
        } else {
            player.message("\\c5Welcome back!")
        }

        updateStats(player)
    })
})