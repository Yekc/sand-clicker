let npcs = require("../game_data/npcs.json")
let outfits = require("../game_data/outfits.json")
let dialogues = require("../game_data/dialogues.json")

//List of physical NPC bodies
let characters = []

//How close can you interact with NPCs
const interact_distance = 10

//Functions executed when purchasing something
const item_functions = {
    increase_spc: function(player) {
        player.data.spc++
    }
}

getPrice = function(player, item) {
    return Math.round(item.base_price * Math.max(1, (player.data.items[item.action] * item.price_mult)))
}

purchaseItem = function(player, i) {
    if (player.interact) {
        let character = characters.find(npc => Game.pointDistance3D(npc.position, player.position) < interact_distance)
        let item = getDialogue(getNpc(character.id).dialogue).items[i - 1]
        let price = getPrice(player, item)

        if (player.data.sand >= price) {
            getSand(player, -price)
            item_functions[item.action](player) //Run the action caused by the purchase
            player.data.items[item.action]++ //Increase the amount of times the player has purchased this
            player.message(`\\c5You bought \\c0${item.item} \\c5for \\c8${getPrice(player, item)} sand\\c5!`)
        } else {
            player.message("\\c6You can not afford this!")
        }
    }
}

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
            //Look at closest player
            let player = character.findClosestPlayer(20)
            if (player) character.lookAtPlayer(player)

            //Look for close players
            nearPlayers = Game.players.filter(player => Game.pointDistance3D(character.position, player.position) < interact_distance)
            nearPlayers.forEach(player => {
                if (!player.interact) player.topPrint(`Press \\c7F\\c0 to interact with ${npc.display.name}`)
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
                    let key = 1
                    dialogue.items.forEach(item => {
                        if (item.req == 0 || item.req <= player.data.total_sand) {
                            draw += `#\\c1[\\c7${key}\\c1]   \\c0${item.item}   \\c8Price: ${getPrice(player, item)}`
                            key++
                        }
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
                        let character = characters.find(npc => Game.pointDistance3D(npc.position, player.position) < interact_distance)
                        if (character) {
                            player.interact = true
                            player.dialogue = getNpc(character.id).dialogue
                            player.setSpeed(0)
                        }
                    } else {
                        player.interact = false
                        player.dialogue = ""
                        player.topPrint("")
                        player.centerPrint("")
                        player.setSpeed(4)
                    }
                    break;
                
                //Number selection
                case "1":
                    purchaseItem(player, 1)
                    break;
                case "2":
                    purchaseItem(player, 2)
                    break;
                case "3":
                    purchaseItem(player, 3)
                    break;
                case "4":
                    purchaseItem(player, 4)
                    break;
                case "5":
                    purchaseItem(player, 5)
                    break;
                case "6":
                    purchaseItem(player, 6)
                    break;
                case "7":
                    purchaseItem(player, 7)
                    break;
                case "8":
                    purchaseItem(player, 8)
                    break;
                case "9":
                    purchaseItem(player, 9)
                    break;
            }
        })
    })
})