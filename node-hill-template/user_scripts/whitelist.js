Game.origNewPlayer = Game._newPlayer

const whitelist = [1, 2, 9]

Game._newPlayer = (player) => {
    if (whitelist.includes(player.userId)) {
        Game.origNewPlayer(player)
    } else {
        player.kick("You are not on the whitelist!")
    }
}