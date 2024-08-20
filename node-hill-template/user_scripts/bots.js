//Create NPCs
const npc_shop = new Bot("Shopkeeper")

//Create NPC outfits
const npc_shop_outfit = new Outfit()
    .body("#ccc000")
    .torso("#eb1010")
    .rightLeg("#6b501f")
    .leftLeg("#6b501f")

//Set NPC outfits
npc_shop.setOutfit(npc_shop_outfit)

//Spawn NPCs
Game.newBot(npc_shop)

//Set NPC positions
npc_shop.position = Game.world.bricks.filter(brick => brick.name === "npc_shop")[0].center

//NPC interaction
let nearPlayers
setInterval(() => {
    //Look at closest player
    let player = npc_shop.findClosestPlayer(20)
    if (player) npc_shop.lookAtPlayer(player)

    //Reset player.interact
    Game.players.forEach(player => player.interact = 0)

    //Look for close players
    nearPlayers = Game.players.filter(player => Game.pointDistance3D(npc_shop.position, player.position) < 10)
    nearPlayers.forEach(player => {
        if (player.open == 0) player.topPrint(`Press \\c7F\\c0 to open the Shop`)
        player.interact = 1
    })

    //NPC UI
    Game.players.forEach((player) => {
    //Info and score
    player.bottomPrint(`\\c8Sand: ${player.data.sand}  \\c2|  \\c7Sand per click: ${player.data.spc}  \\c2|  \\c7Sand per second: ${player.data.sps}`)
    player.setScore(player.data.sand)

        //Close UI if player walks away
        if (player.interact == 0) player.open = 0

        //Display UI
        let draw = ""
        switch (player.open) {
            case 1:
                player.topPrint(`Press \\c7F\\c0 to close the Shop`)

                draw += "\\c1|\\c2===\\c1| \\c5Shop \\c1|\\c2====================\\c1|"
                draw += "#\\c1Press the number next to the shop item to purchase it#"
                draw += `#\\c0[\\c71\\c0]   +1 Sand per click   \\c7Price: ${0}`

                player.centerPrint(draw)
                break;
        }
    })
}, 100)

//Detect key presses
Game.on("playerJoin", (player) => {
    player.on("Loaded", () => {
        player.keypress(async(key) => {
            switch (key) {
                //Interact with UI
                case "f":
                    if (player.open == 0) { //Open
                        player.open = player.interact //player.interact: Make sure player is close enough
                        player.setSpeed(0)
                    } else { //Close
                        player.open = 0
                        player.setSpeed(4)
                    }
                    break;
            }
        })
    })
})