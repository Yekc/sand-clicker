let npcs = require("../game_data/npcs.json")
let outfits = require("../game_data/outfits.json")
let dialogues = require("../game_data/dialogues.json")

let characters = []

const interact_distance = 10

getNpc = function(id) {
    return npcs.find(npc => npc.id == id)
}

getDialogue = function(id) {
    return dialogues.find(dialogue => dialogue.id == id)
}

let npcBricks = [...Game.world.bricks.filter(brick => brick.name.startsWith("npc_"))]

getOutfit = function(id) {
    current = outfits.find(o => o.id == id)

    return new Outfit()
        .head(current.bodyColors.head)
        .torso(current.bodyColors.torso)
        .leftArm(current.bodyColors.leftArm)
        .rightArm(current.bodyColors.rightArm)
        .leftLeg(current.bodyColors.leftLeg)
        .rightLeg(current.bodyColors.rightLeg)

        .clothing1(current.clothing.shirt)
        .clothing2(current.clothing.pants)
        .clothing3(current.clothing.tshirt)
        
        .face(current.items.face)
        .hat1(current.items.hat1)
        .hat2(current.items.hat2)
        .hat3(current.items.hat3)
}

npcs.forEach(npc => {
    npcBricks.filter(brick => brick.name === "npc_" + npc.id).forEach(brick => {
        //Create NPC
        const character = new Bot(npc.display.name)
        character.id = npc.id
        character.setOutfit(getOutfit(npc.display.outfit))

        //Spawn NPC
        Game.newBot(character)

        //Set position and scale
        character.position = Game.world.bricks.filter(brick => brick.name === `npc_${npc.id}`)[0].center
        if (npc.display.scale != 1) character.scale = new Vector3(npc.display.scale, npc.display.scale, npc.display.scale)

        let nearPlayers
        setInterval(() => {
            //Look for close players
            console.log("looking for near players")
            nearPlayers = Game.players.filter(player => Game.pointDistance3D(character.position, player.position) < interact_distance)
            nearPlayers.forEach(player => {
                if (player.open == 0) player.topPrint(`Press \\c7F\\c0 to interact with ${npc.display.name}`)
            })
        }, 250)

        //Add to list of NPCs
        characters.push(character)
    })
})

//NPC interaction
let nearPlayers
setInterval(() => {
    //NPC UI
    Game.players.forEach((player) => {
        //Info and score
        player.bottomPrint(`\\c8Sand: ${player.data.sand}  \\c2|  \\c7Sand per click: ${player.data.spc}  \\c2|  \\c7Sand per second: ${player.data.sps}`)
        player.setScore(player.data.sand)

        //Display UI
        if (player.dialogue !== "") {
            let draw = ""
            let dialogue = getDialogue(player.dialogue)

            switch (dialogue.type) {
                case "shop":
                    player.topPrint(`Press \\c7F\\c0 to close the Shop`)

                    draw += "\\c1|\\c2===\\c1| \\c5Shop \\c1|\\c2====================\\c1|"
                    draw += "#\\c1Press the number next to the shop item to purchase it#"
                    dialogue.items.forEach(item => {
                        draw += `#\\c1[\\c71\\c1]   \\c0${item.item}   \\c8Price: ${item.base_price * 1/*(0 * item.price_mult)*/}` //look at how tempalte updates are done
                    })

                    player.centerPrint(draw)
                    break;
            }
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
                    if (!player.interact) {
                        let npc = characters.find(npc => Game.pointDistance3D(npc.position, player.position) < interact_distance)
                        if (npc) {
                            console.log("found")
                            player.interact = true
                            player.dialogue = npcs.find(x => x.id == npc.id)[0].dialogue
                            player.setSpeed(0)
                        }
                    } else {
                        player.interact = false
                        player.dialogue = ""
                        player.setSpeed(4)
                    }
                    break;
            }
        })
    })
})