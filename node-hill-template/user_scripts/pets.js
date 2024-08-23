let pets = require("../game_data/pets.json")
let outfits = require("../game_data/outfits.json")

global.max_pet_inv_page = 3

getPet = function(id) {
    return pets.find(pet => pet.id == id)
}

getRarityColor = function(rarity) {
    switch (rarity) {
        default:
            return "\\c0";
        case 1:
            return "\\c5";
        case 2:
            return "\\c7";
        case 3:
            return "\\c4";
        case 4:
            return "\\c9";
        case 5:
            return "\\c8";
        case 6:
            return "\\c2";
    }
}

getRarityName = function(rarity) {
    switch (rarity) {
        default:
            return "Common";
        case 1:
            return "Uncommon";
        case 2:
            return "Rare";
        case 3:
            return "Very Rare";
        case 4:
            return "Epic";
        case 5:
            return "Legendary";
        case 6:
            return "Mythic";
    }
}

earnPet = function(player, id) {
    if (player.data.pets[Object.keys(player.data.pets)[i + (9 * (player.pet_inv_page - 1))]] > 0) {
        player.message("\\c6You already have that pet!")
    } else {
        player.data.pets[Object.keys(player.data.pets)[i + (9 * (player.pet_inv_page - 1))]] = 1
        player.message("\\c5A pet has been added to your inventory! Press \\c7E \\c5to see it in your pet inventory.")
    }
}

Game.on("playerJoin", (player) => {
    player.on("Loaded", () => {
        let gave_perks = false

        setInterval(() => {
            if (player.pet_inv) {
                player.topPrint("Press \\c7E \\c0to close your pet inventory")

                let draw = ""
                draw += "\\c1|\\c2===\\c1| \\c9Pet Inventory \\c1|\\c2====================\\c1|"
                if (player.pet_inv_view == 0) {
                    draw += "#\\c1Press the number next to a pet to view more information about it#"
                    if (player.data.pet_active !== "") draw += `\\c5Currently equipped: ${getRarityColor(getPet(player.data.pet_active).display.rarity)}${getRarityName(getPet(player.data.pet_active).display.rarity)} ${getPet(player.data.pet_active).display.name}#`

                    for (i = 0; i < 9; i++) {
                        if (i + (9 * (player.pet_inv_page - 1)) < 22) {
                            let current = player.data.pets[Object.keys(player.data.pets)[i + (9 * (player.pet_inv_page - 1))]]
                            let current_pet = getPet(Object.keys(player.data.pets)[i + (9 * (player.pet_inv_page - 1))])
                            if (current > 0) {
                                draw += `#\\c1[\\c7${i + 1}\\c1] ${getRarityColor(current_pet.display.rarity)}${getRarityName(current_pet.display.rarity)} ${current_pet.display.name}`
                            } else {
                                draw += `#\\c1[${i + 1}] \\c6Not unlocked!`
                            }
                        }
                    }

                    draw += `##\\c0Page ${player.pet_inv_page == 1 ? "\\c1" : ""}< \\c0${player.pet_inv_page}/${global.max_pet_inv_page} ${player.pet_inv_page == global.max_pet_inv_page ? "\\c1" : ""}>    \\c1Use \\c7Z \\c1and \\c7X \\c1to scroll through the pages`
                } else {
                    let current_pet = getPet(Object.keys(player.data.pets)[(player.pet_inv_view - 1) + (9 * (player.pet_inv_page - 1))])

                    if (player.data.pet_active === current_pet.id) draw += "#\\c5You have this pet equipped!#"

                    draw += `#\\c0Viewing: ${getRarityColor(current_pet.display.rarity)}${getRarityName(current_pet.display.rarity)} ${current_pet.display.name}#`
                    draw += "#\\c0Stats:"
                    if (current_pet.perks.spc != 0) draw += `#    \\c7${current_pet.perks.spc > 0 ? "+" : "-"}${current_pet.perks.spc} sand per click`
                    if (current_pet.perks.sps != 0) draw += `#    \\c9${current_pet.perks.sps > 0 ? "+" : "-"}${current_pet.perks.sps} sand per second`
                    if (current_pet.perks.spc_mult != 0) draw += `#    \\c7x${current_pet.perks.spc_mult} sand per click`
                    if (current_pet.perks.sps_mult != 0) draw += `#    \\c9x${current_pet.perks.sps_mult} sand per second`
                    if (current_pet.perks.bonus !== "") draw += `#    \\c5BONUS! \\c0${current_pet.perks.bonus_fancy}`

                    draw += `##\\c1[\\c7Q\\c1] ${player.data.pet_active === current_pet.id ? "\\c6Unequip" : "\\c0Equip"}`
                    draw += `#\\c1[\\c7E\\c1] \\c0Go back to pet inventory`
                }

                player.centerPrint(draw)
            }

            if (player.data.pet_equipped) {
                //Player has not recieved perks from equipping the pet yet
                if (!gave_perks) {
                    updateSpc(player)
                    updateSps(player)
                    gave_perks = true
                }
            } else {
                //Player has not lost the perks of the pet yet
                if (gave_perks) {
                    updateSpc(player)
                    updateSps(player)
                    gave_perks = false
                }
            }
        }, 100)
    })
})