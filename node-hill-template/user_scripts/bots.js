const npc_shop = new Bot("Shopkeeper")

const npc_shop_outfit = new Outfit()
    .body("#ccc000")
    .torso("#eb1010")
    .rightLeg("#6b501f")
    .leftLeg("#6b501f")

npc_shop.setOutfit(npc_shop_outfit)

Game.newBot(npc_shop)

npc_shop.position = Game.world.bricks.filter(brick => brick.name === "npc_shop")[0].center


let nearPlayers
setInterval(() => {
    let player = npc_shop.findClosestPlayer(20)
    if (player) npc_shop.lookAtPlayer(player)

    Game.players.forEach(player => player.interact = 0)
    nearPlayers = Game.players.filter(player => Game.pointDistance3D(npc_shop.position, player.position) < 10)
    nearPlayers.forEach(player => {
        player.topPrint(`Press \\c7F\\c0 to open the Shop`, 1)
        player.interact = 1
    })
}, 100)