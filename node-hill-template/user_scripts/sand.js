let pets = require("../game_data/pets.json")

getSand = function(player, amount) {
    if (player.data.pet_equipped) if (getPet(player.data.pet_active).perks.bonus === "mr_rich_bonus") amount *= 2
    player.data.sand += amount
    player.data.total_sand += amount
}

giveRandom = function(player, s) {
    if (s) {
        Game.messageAll(`${player.username} \\c5has looted the \\c7SUPER \\c4RANDOM BRICK!!!`)
        let amount = 10000 + player.data.sps * 900
        if (player.data.pet_equipped) { if (getPet(player.data.pet_active).perks.bonus === "cookie_monster_bonus") { amount *= 10 } }
        player.message(`\\c5You earned \\c8${amount} sand\\c5!`)
        getSand(player, amount)
    } else {
        Game.messageAll(`${player.username} \\c5has looted the \\c4RANDOM BRICK!`)
        let amount = 1000 + player.data.sps * 300
        if (player.data.pet_equipped) { if (getPet(player.data.pet_active).perks.bonus === "cookie_monster_bonus") { amount *= 10 } }
        player.message(`\\c5You earned \\c8${amount} sand\\c5!`)
        getSand(player, amount)
    }

    //Chance to get the cookie monster
    let pet_roll = Math.round(Math.random() * (s ? 10 : 100)) //1/10 if super, 1/100 if not super
    if (pet_roll < 2) {
        if (earnPet(player, "cookie_monster")) {
            player.message(`\\c5You found a \\c6Mythic Cookie Monster\\c5!`)
            player.centerPrint(`\\c5You found a \\c6Mythic Cookie Monster\\c5!`, 5)
        }
    }
}

randomBrick = function(s) {
    //Find random bricks
    let selection = Math.floor(Math.random() * 12)
    let brick = Game.world.bricks.filter(brick => brick.name === "random")[selection]
    let super_brick

    if (s) {
        Game.messageAll(`\\c5A \\c7SUPER \\c4RANDOM BRICK \\c5has spawned somewhere!`)
        Game.messageAll(`\\c5Be the first to loot it to earn a super duper reward!`)

        random_health = 50

        super_brick = Game.world.bricks.filter(brick => brick.name === "random_super")[11 - selection] //The super random bricks are backwards for some reason, so the selection must be subtracted from 11 (amount of random bricks - 1)
        
        brick.setVisibility(1)
        brick.setCollision(true)
        super_brick.setVisibility(0.4)
        brick.clicked(debouncePlayer((player, secure) => {
            if (!secure || !is_random) return //Make sure player is close enough and that random brick should exist
            random_health--
            player.centerPrint(`\\c7${random_health}/50`, 3)
            if (random_health == 0) {
                giveRandom(player, true)
                brick.setVisibility(0)
                brick.setCollision(false)
                super_brick.setVisibility(0)
                is_random = false
                is_super = false
            }
        }, 100))

    } else {
        Game.messageAll(`\\c5A \\c4RANDOM BRICK \\c5has spawned somewhere!`)
        Game.messageAll(`\\c5Be the first to loot it to earn a reward!`)

        random_health = 10

        brick.setVisibility(1)
        brick.setCollision(true)
        brick.clicked(debouncePlayer((player, secure) => {
            if (!secure || !is_random) return //Make sure player is close enough and that random brick should exist
            random_health--
            player.centerPrint(`\\c7${random_health}/10`)
            if (random_health == 0) {
                giveRandom(player, false)
                brick.setVisibility(0)
                brick.setCollision(false)
                is_random = false
            }
        }, 100))
    }
}

//Yellow brick clicking
let is_random = false
let is_super = false
let random_health = 0
const click_brick = Game.world.bricks.find(brick => brick.name === "click")
click_brick.clicked(debouncePlayer((player, secure) => {
    if (!secure) return //Make sure player is close enough
    player.should_say = true
    getSand(player, player.data.spc)

    //Chance for random and super random brick
    if (!(is_random || is_super)) {
        let random = Math.round(Math.random() * 3000)
        if (player.data.pet_equipped) { if (getPet(player.data.pet_active).perks.bonus === "cookie_monster_bonus") { random = Math.floor(random / 2) } }
        if (random < 10) {
            is_random = true
            is_super = random < 2
            randomBrick(is_super)
            player.centerPrint(`\\c5You spawned a ${is_super ? "\\c7SUPER \\c4" : "\\c4"}RANDOM BRICK\\c5! Go get it!`, 2)
            player.should_say = false
        }
    }

    //Chance to earn a pet
    let pet_roll = Math.round(Math.random() * 40000)
    let rarity = -1
    if (pet_roll < 2) {
        rarity = 6
    } else if (pet_roll < 4) {
        rarity = 5
    } else if (pet_roll < 8) {
        rarity = 4
    } else if (pet_roll < 16) {
        rarity = 3
    } else if (pet_roll < 26) {
        rarity = 2
    } else if (pet_roll < 56) {
        rarity = 1
    } else if (pet_roll < 201) {
        rarity = 0
    }
    if (rarity != -1) {
        //Choose a random pet of that rarity
        let choose = []
        pets.forEach(pet => {
            if (pet.display.rarity == rarity && pet.in_the_sand) {
                choose.push(pet)
            }
        })

        //Give the pet to the player
        if (choose.length > 0) {
            let n = Math.floor(Math.random() * choose.length)
            if (getPet(choose[n].id).req == 0 || getPet(choose[n].id).req <= player.data.total_sand) {
                if (earnPet(player, choose[n].id)) {
                    player.message(`\\c5You found a${(rarity == 1 || rarity == 4) ? "n" : ""} ${getRarityColor(rarity)}${getRarityName(rarity)} ${getPet(choose[n].id).display.name}\\c5!`)
                    player.centerPrint(`\\c5You found a${(rarity == 1 || rarity == 4) ? "n" : ""} ${getRarityColor(rarity)}${getRarityName(rarity)} ${getPet(choose[n].id).display.name}\\c5!`, 5)
                    player.should_say = false
                }
            }
        }
    }

    //Sand per click indicator
    if (player.should_say) {
        player.centerPrint(`+${player.data.spc}`)
        setTimeout(() => {player.centerPrint(`\\c8+${player.data.spc}`)}, 100)
    }
}, 175))

//Sand per second
setInterval(() => {
    Game.players.forEach((player) => {
        updateSps(player)
        getSand(player, player.data.sps)
    })
}, 1000)