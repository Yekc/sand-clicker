let pets = require("../game_data/pets.json")

global.max_pet_inv_page = 3
global.max_pet_level = 100

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
    }
}

getUpgradeCost = function(rarity, current_level) {
    current_level--
    switch (rarity) {
        default:
            return Math.round(100 * Math.max(1, current_level * 1.4));
        case 1:
            return Math.round(1000 * Math.max(1, current_level * 1.45));
        case 2:
            return Math.round(5000 * Math.max(1, current_level * 1.5));
        case 3:
            return Math.round(25000 * Math.max(1, current_level * 1.65));
        case 4:
            return Math.round(50000 * Math.max(1, current_level * 1.9));
        case 5:
            return Math.round(150000 * Math.max(1, current_level * 2.1));
    }
}

getPerkStrength = function(perk, level) {
    return Math.round(((perk * level) / global.max_pet_level) * 1000) / 1000
}

getPerkStrengthMult = function(perk, level) {
    return 1 + (Math.round(((perk * 1000) / global.max_pet_level) * level * 1000) / 1000 / 10000)
}

earnPet = function(player, id) {
    if (player.data.pets[id] > 0) {
        //player.message("\\c6You already have that pet!")
        return false
    } else {
        player.data.pets[id] = 1
        player.message("\\c5A pet has been added to your inventory! Press \\c7E \\c5to see it in your pet inventory.")
        return true
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

                    draw += `##\\c0Page ${player.pet_inv_page == 1 ? "\\c1" : ""}< \\c0${player.pet_inv_page}/${global.max_pet_inv_page} ${player.pet_inv_page == global.max_pet_inv_page ? "\\c1" : ""}>    \\c1Use \\c7X \\c1and \\c7C \\c1to scroll through the pages`
                } else {
                    let current_pet = getPet(Object.keys(player.data.pets)[(player.pet_inv_view - 1) + (9 * (player.pet_inv_page - 1))])

                    if (player.data.pet_active === current_pet.id) draw += "#\\c5You have this pet equipped!#"

                    draw += `#\\c0Viewing: ${getRarityColor(current_pet.display.rarity)}${getRarityName(current_pet.display.rarity)} ${current_pet.display.name}`
                    draw += `#\\c0Current level: \\c7${player.data.pets[current_pet.id]} ${player.data.pets[current_pet.id] >= global.max_pet_level ? "\\c6MAX!" : ""}`
                    draw += `#\\c1${current_pet.display.description}#`
                    draw += "#\\c0Perks:"
                    if (current_pet.perks.spc != 0) draw += `#    \\c7${current_pet.perks.spc > 0 ? "+" : "-"}${number(getPerkStrength(current_pet.perks.spc, player.data.pets[current_pet.id]))} sand per click`
                    if (current_pet.perks.sps != 0) draw += `#    \\c9${current_pet.perks.sps > 0 ? "+" : "-"}${number(getPerkStrength(current_pet.perks.sps, player.data.pets[current_pet.id]))} sand per second`
                    if (current_pet.perks.spc_mult != 0) draw += `#    \\c7x${number(getPerkStrengthMult(current_pet.perks.spc_mult, player.data.pets[current_pet.id]))} sand per click`
                    if (current_pet.perks.sps_mult != 0) draw += `#    \\c9x${number(getPerkStrengthMult(current_pet.perks.sps_mult, player.data.pets[current_pet.id]))} sand per second`
                    if (current_pet.perks.bonus !== "") draw += `#    \\c5BONUS!${current_pet.perks.bonus_fancy}`

                    draw += `##\\c1[\\c7Q\\c1] ${player.data.pet_active === current_pet.id ? "\\c6Unequip" : "\\c0Equip"}`
                    if (player.data.pets[current_pet.id] < global.max_pet_level) draw += `#\\c1[\\c7P\\c1] \\c0Upgrade for \\c8${number(getUpgradeCost(current_pet.display.rarity, player.data.pets[current_pet.id]))} sand`
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