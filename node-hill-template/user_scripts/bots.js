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
        updateSpc(player)
        player.message("\\c5Your \\c7sand per click \\c5was increased by 1!")
    },
    tiny_tim_buy: function(player) {
        updateSps(player)
        player.message("\\c5Upgrade \\c0Tiny Tim \\c5at the office building!")
    },
    tiny_tim: function(player) {
        updateSps(player)
        player.message("\\c0Tiny Tim \\c5has been promoted! \\c9+1 sand per second")
    },
    mr_crabs_buy: function(player) {
        updateSps(player)
        player.message("\\c5Upgrade \\c0Mr. Crabs \\c5at the office building!")
    },
    mr_crabs: function(player) {
        updateSps(player)
        player.message("\\c0Mr. Crabs \\c5has been promoted! \\c9+2 sand per second")
    },
    tims_father_buy: function(player) {
        updateSps(player)
        player.message("\\c5Upgrade \\c0Tim's Father \\c5at the office building!")
    },
    tims_father: function(player) {
        updateSps(player)
        player.message("\\c0Tim's Father \\c5has been promoted! \\c9+5 sand per second")
    },
    sand_eater_buy: function(player) {
        updateSps(player)
        player.message("\\c5Upgrade \\c0Sand Eater \\c5at the office building!")
    },
    sand_eater: function(player) {
        updateSps(player)
        player.message("\\c0Sand Eater \\c5has been promoted! \\c9+10 sand per second")
    },
    manager: function(player) {
        updateSps(player)
        player.message(`\\c5Your manager has been promoted! \\c9x${1 + Math.round((0.05 * player.data.items.manager) * 100) / 100} sand per second`)
    }
}

getNpc = function(id) {
    return npcs.find(npc => npc.id == id)
}

getDialogue = function(id) {
    return dialogues.find(dialogue => dialogue.id == id)
}

getPrice = function(player, item) {
    return Math.round(item.base_price * Math.max(1, (player.data.items[item.action] * item.price_mult)))
}

purchaseItem = function(player, i) {
    if (player.interact) {
        let character = characters.find(npc => Game.pointDistance3D(npc.position, player.position) < interact_distance)
        let item = getDialogue(getNpc(character.id).dialogue).items[i - 1]
        let price = getPrice(player, item)

        if (item.req <= player.data.total_sand) {
            if (player.data.items[item.action] >= item.stock) {
                player.message("\\c6You can not buy more of this!")
            } else if (player.data.sand < price) {
                player.message("\\c6You can not afford this!")
            } else {
                player.data.sand -= price
                player.message(`\\c5You bought \\c0${item.item} \\c5for \\c8${getPrice(player, item)} sand\\c5!`)
                player.data.items[item.action]++ //Increase the amount of times the player has purchased this
                item_functions[item.action](player) //Run the action caused by the purchase
            }
        } else {
            player.message("\\c6You can not buy this yet!")
        }
    }
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
        if (player.data.items.manager > 0) {
            player.bottomPrint(`\\c8Sand: ${player.data.sand}  \\c2|  \\c7Sand per click: ${player.data.spc}  \\c2|  \\c9Sand per second: ${player.data.sps} (x${1 + Math.round((0.05 * player.data.items.manager) * 100) / 100} mult.)`)
        } else {
            player.bottomPrint(`\\c8Sand: ${player.data.sand}  \\c2|  \\c7Sand per click: ${player.data.spc}  \\c2|  \\c9Sand per second: ${player.data.sps}`)
        }
        player.setScore(player.data.total_sand)

        //Office tip
        if (!player.data.office_tip && player.data.items.tiny_tim_buy > 0 && !player.interact) {
            player.centerPrint("\\c5Remember to upgrade your workers at the office building! (To increase their efficiency)", 5)
            player.data.office_tip = true
        }

        //Display UI
        if (player.dialogue !== "") {
            let draw = ""
            let dialogue = getDialogue(player.dialogue)

            switch (dialogue.type) {
                case "shop":
                    player.topPrint(`Press \\c7F\\c0 to close the Shop`)

                    draw += `\\c1|\\c2===\\c1| ${dialogue.name} \\c1|\\c2====================\\c1|`
                    draw += "#\\c1Press the number next to the item to purchase it#"
                    let key = 1
                    dialogue.items.forEach(item => {
                        if (item.req == 0 || item.req <= player.data.total_sand) {
                            if (item.item_req === "" || player.data.items[item.item_req] > 0) {
                                if (player.data.items[item.action] >= item.stock) {
                                    draw += `#\\c1[${key}]   \\c0${item.item}   \\c6Out of stock!`
                                } else {
                                    draw += `#\\c1[\\c7${key}\\c1]   \\c0${item.item}   \\c8Price: ${getPrice(player, item)}`
                                }
                            } else {
                                draw += `#\\c1[${key}]   \\c6Not unlocked! \\c1(0/1 ${item.item_req_fancy})`
                            }
                        } else {
                            draw += `#\\c1[${key}]   \\c6Not unlocked! \\c1(${player.data.total_sand}/${item.req} total sand)`
                        }
                        key++
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
            let character = characters.find(npc => Game.pointDistance3D(npc.position, player.position) < interact_distance)
            switch (key) {
                //Open NPC menu
                case "f":
                    if (!player.pet_inv) {
                        if (!player.interact) {
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
                    }
                    break;
                
                //Open pet inventory
                case "e":
                    if (!player.interact) {
                        if (player.pet_inv_view == 0) {
                            if (!player.pet_inv) {
                                player.pet_inv = true
                                player.setSpeed(0)
                            } else {
                                player.pet_inv = false
                                player.topPrint("")
                                player.centerPrint("")
                                player.setSpeed(4)
                            }
                        } else {
                            player.pet_inv_view = 0
                        }
                    }
                    break;
                
                //Pet inventory scrolling
                case "z":
                    if (player.pet_inv && player.pet_inv_page > 1) player.pet_inv_page--
                    break;
                case "x":
                    if (player.pet_inv && player.pet_inv_page < global.max_pet_inv_page) player.pet_inv_page++
                    break;
                
                //Equip pet
                case "q":
                    if (player.pet_inv && player.pet_inv_view != 0) {
                        if (player.data.pet_active !== Object.keys(player.data.pets)[(player.pet_inv_view - 1) * player.pet_inv_page]) {
                            player.data.pet_active = Object.keys(player.data.pets)[(player.pet_inv_view - 1) * player.pet_inv_page]
                            player.data.pet_equipped = true
                            player.message("\\c5You equipped a pet!")
                        } else {
                            player.data.pet_active = ""
                            player.data.pet_equipped = false
                            player.message("\\c5You unequipped a pet!")
                        }
                    }
                    break;
                
                //Number selection
                case "1":
                    if (character && player.interact) {
                        if (getDialogue(player.dialogue).type === "shop") purchaseItem(player, 1)
                    } else {
                        if (player.pet_inv && player.pet_inv_view == 0 && player.data.pets[Object.keys(player.data.pets)[0]] > 0) player.pet_inv_view = 1
                    }
                    break;
                case "2":
                    if (character && player.interact) {
                        if (getDialogue(player.dialogue).type === "shop") purchaseItem(player, 2)
                    } else {
                        if (player.pet_inv && player.pet_inv_view == 0 && player.data.pets[Object.keys(player.data.pets)[player.pet_inv_page]] > 0) player.pet_inv_view = 2
                    }
                    break;
                case "3":
                    if (character && player.interact) {
                        if (getDialogue(player.dialogue).type === "shop") purchaseItem(player, 3)
                    } else {
                        if (player.pet_inv && player.pet_inv_view == 0 && player.data.pets[Object.keys(player.data.pets)[2 * player.pet_inv_page]] > 0) player.pet_inv_view = 3
                    }
                    break;
                case "4":
                    if (character && player.interact) {
                        if (getDialogue(player.dialogue).type === "shop") purchaseItem(player, 4)
                    } else {
                        if (player.pet_inv && player.pet_inv_view == 0 && player.data.pets[Object.keys(player.data.pets)[3 * player.pet_inv_page]] > 0) player.pet_inv_view = 4
                    }
                    break;
                case "5":
                    if (character && player.interact) {
                        if (getDialogue(player.dialogue).type === "shop") purchaseItem(player, 5)
                    } else {
                        if (player.pet_inv && player.pet_inv_view == 0 && player.data.pets[Object.keys(player.data.pets)[4 * player.pet_inv_page]] > 0) player.pet_inv_view = 5
                    }
                    break;
                case "6":
                    if (character && player.interact) {
                        if (getDialogue(player.dialogue).type === "shop") purchaseItem(player, 6)
                    } else {
                        if (player.pet_inv && player.pet_inv_view == 0 && player.data.pets[Object.keys(player.data.pets)[5 * player.pet_inv_page]] > 0) player.pet_inv_view = 6
                    }
                    break;
                case "7":
                    if (character && player.interact) {
                        if (getDialogue(player.dialogue).type === "shop") purchaseItem(player, 7)
                    } else {
                        if (player.pet_inv && player.pet_inv_view == 0 && player.data.pets[Object.keys(player.data.pets)[6 * player.pet_inv_page]] > 0) player.pet_inv_view = 7
                    }
                    break;
                case "8":
                    if (character && player.interact) {
                        if (getDialogue(player.dialogue).type === "shop") purchaseItem(player, 8)
                    } else {
                        if (player.pet_inv && player.pet_inv_view == 0 && player.data.pets[Object.keys(player.data.pets)[7 * player.pet_inv_page]] > 0) player.pet_inv_view = 8
                    }
                    break;
                case "9":
                    if (character && player.interact) {
                        if (getDialogue(player.dialogue).type === "shop") purchaseItem(player, 9)
                    } else {
                        if (player.pet_inv && player.pet_inv_view == 0 && player.data.pets[Object.keys(player.data.pets)[8 * player.pet_inv_page]] > 0) player.pet_inv_view = 9
                    }
                    break;
            }
        })
    })
})