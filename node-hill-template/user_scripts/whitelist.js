Game.authHandler = async(player) => {
    if (player.username !== "Yek") {
        console.log(player.username)
        return player.kick("this game is whitelisted for now")
    }
    return true
}