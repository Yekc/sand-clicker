const nh = require('node-hill-s')

nh.startServer({
    //hostKey: "ZbqFHImC73riat2FphDPwKp0CwJlbyepiQoKY8G3S64fSiZT6idG5S6TTyQTDJJC", //MAIN
    hostKey: "Whuapq6U2i6YwIiNk5UEUlLdkozWgZAkSiSQUUuvbrZVZH4w34QI3PWlhhMUHQtE", //TESTING

    //gameId: 9, //MAIN
    gameId: 10, //TESTING

    port: 42481,

    local: false,

    mapDirectory: './maps/',

    map: 'sand.brk',

    scripts: './user_scripts',

    modules: [
        "fs"
    ]
})

// For more help: https://brickhill.gitlab.io/open-source/node-hill/interfaces/gamesettings.html
