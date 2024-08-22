let pets = require("../game_data/pets.json")
let outfits = require("../game_data/outfits.json")

const pet_functions = {}

global.max_pet_inv_page = 5

getPet = function(id) {
    return pets.find(pet => pet.id == id)
}

Game.on("playerJoin", (player) => {
    player.on("Loaded", () => {
        let gave_perks = false

        setInterval(() => {
            if (player.pet_inv) {
                let draw

                player.topPrint("Press \\c7E \\c0to close your pet inventory")

                //draw += "\\c1|\\c2===\\c1| \\c9Pet Inventory \\c1|\\c2====================\\c1|"
                draw += "#\\c1Press the number next to the pet to equip/dequip it"
                draw += "#\\c1Use \\c7Z \\c1and \\c7X \\c1to scroll through the pages"
                draw += "#\\c1Press \\c7I \\c1to view info about a pet#"

                for (i = 0; i < 9; i++) {
                    let current = player.data.pets[i * player.pet_inv_page]
                    if (current > 0) {
                        draw += `#\\c1[\\c7${i + 1}\\c1] \\c0` + Object.keys(player.data.pets[i])[0]
                    } else {
                        draw += `#\\c1[${i + 1}] \\c6Not unlocked!`
                    }
                }

                draw += `##\\c0Page ${player.pet_inv_page == 0 ? "\\c2" : ""}< \\c0${player.pet_inv_page}/${global.max_pet_inv_page} ${player.pet_inv_page == global.max_pet_inv_page ? "\\c2" : ""}>`

                player.centerPrint(draw)
            }

            if (player.data.pet_equipped) {
                let pet = getPet(player.data.pet_active)

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