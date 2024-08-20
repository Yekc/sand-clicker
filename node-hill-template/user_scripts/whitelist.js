Game.authHandler = async(player) => {
    if (player.username !== "Yek") {
        return player.kick("this game is whitelisted for now")
    }
    return true
}