Game.origNewPlayer = Game._newPlayer

const whitelist = [1]

Game._newPlayer = (player) => {
    if (whitelist.includes(player.userId)) {
        Game.origNewPlayer(player)
    } else {
        player.kick("this game is whitelisted... for now")
    }
}