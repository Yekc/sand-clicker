getSand = function(player, amount) {
    player.data.sand += amount
    player.data.total_sand += amount
}

giveRandom = function(player, s) {
    if (s) {
        Game.messageAll(`${player.name} \\c5has looted the \\c7SUPER \\c4RANDOM BRICK!!!`)
        player.message(`\\c5You earned \\c8${10000 + player.data.sps * 300} sand\\c5!`)
        getSand(player, 10000 + player.data.sps * 300)
    } else {
        Game.messageAll(`${player.name} \\c5has looted the \\c4RANDOM BRICK!`)
        player.message(`\\c5You earned \\c8${1000 + player.data.sps * 60} sand\\c5!`)
        getSand(player, 1000 + player.data.sps * 60)
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
            player.message(`\\c4${random_health}/10`)
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
            player.message(`\\c4${random_health}/10`)
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
    player.centerPrint(`\\c8+${player.data.spc}`)
    getSand(player, player.data.spc)

    //Chance for random and super random brick
    if (!(is_random || is_super)) {
        let random = Math.round(Math.random() * 3000)
        if (random < 10) {
            is_random = true
            is_super = random < 1
            randomBrick(is_super)
        }
    }
}, 175))

//Sand per second
setInterval(() => {
    Game.players.forEach((player) => {
        getSand(player, player.data.sps)
    })
}, 1000)