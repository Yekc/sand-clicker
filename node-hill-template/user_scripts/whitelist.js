/*
Game.origNewPlayer = Game._newPlayer

const whitelist = [2]

Game._newPlayer = (player) => {
    if (whitelist.includes(player.userId)) {
        Game.origNewPlayer(player)
    } else {
        player.kick("You are not on the whitelist!")
    }
}
*/