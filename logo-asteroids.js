/**********************************************/
/*                                            */
/*               LOGO Asteroids               */
/*                                            */
/**********************************************/
/*  This code was written by Matthew Scroggs  */
/*                                            */
/*               mscroggs.co.uk               */
/*     github.com/mscroggs/logo-asteroids     */
/**********************************************/
/* This code is licensed under an MIT license */
/**********************************************/

// constants
var WIDTH = 800
var HEIGHT = 450

// game data
var spaceship = {"x": WIDTH/2, "y": HEIGHT/2, "rotation": 0, "pd": true}
var drawnlines = []
var asterN = 2
var asteroids = []

function parse_command(command) {
    var sc = command.split(" ")
    var args = []
    var cmd = sc[0]

    if (sc[0] == "fd" || sc[0] == "forward") {
        args = ["NUMBER"]
        cmd = "fd"
    } else if (sc[0] == "back") {
        args = ["NUMBER"]
    } else if (sc[0] == "rt" || sc[0] == "right") {
        args = ["NUMBER"]
        cmd = "rt"
    } else if (sc[0] == "lt" || sc[0] == "left") {
        args = ["NUMBER"]
        cmd = "lt"
    } else if (sc[0] == "pu" || sc[0] == "penup") {
        args = []
        cmd = "pu"
    } else if (sc[0] == "pd" || sc[0] == "pendown") {
        args = []
        cmd = "pd"
    } else {
        return ["ERROR", "UNKNOWN COMMAND: `" + sc[0] + "`"]
    }

    if (args.length != sc.length - 1) {
        return ["ERROR", "WRONG NUMBER OF INPUTS FOR COMMAND `" + sc[0] + "`"]
    }
    var c = [cmd]
    for (var i = 0; i < args.length; i++) {
        value = sc[i+1]
        if (args[i] == "NUMBER"){
            if(isNaN(value)){
                return ["ERROR", "COULD NOT PARSE NUMBER `" + value + "`"]
            }
            c.push(value / 1)
        }
    }
    return c
}

function run_command() {
    var infobox = document.getElementById("infobox")
    var inputbox = document.getElementById("inputbox")
    if (infobox.innerHTML != "") {
        infobox.innerHTML += "\n"
    }
    var command = inputbox.value
    infobox.innerHTML += command
    var c = parse_command(command.toLowerCase())
    if (c[0] == "ERROR") {
        infobox.innerHTML += "\n  " + c[1]
    } else if (c[0] == "fd") {
        var old_x = spaceship["x"]
        var old_y = spaceship["y"]
        spaceship["x"] += c[1] * Math.cos(spaceship["rotation"])
        spaceship["y"] += c[1] * Math.sin(spaceship["rotation"])
        if (spaceship["pd"]) {
            drawnlines.push([old_x, old_y, spaceship["x"], spaceship["y"]])
        }
    } else if (c[0] == "back") {
        var old_x = spaceship["x"]
        var old_y = spaceship["y"]
        spaceship["x"] -= c[1] * Math.cos(spaceship["rotation"])
        spaceship["y"] -= c[1] * Math.sin(spaceship["rotation"])
        if (spaceship["pd"]) {
            drawnlines.push([old_x, old_y, spaceship["x"], spaceship["y"]])
        }
    } else if (c[0] == "rt") {
        spaceship["rotation"] += c[1] * Math.PI / 180
    } else if (c[0] == "lt") {
        spaceship["rotation"] -= c[1] * Math.PI / 180
    } else if (c[0] == "pu") {
        spaceship["pd"] = false
    } else if (c[0] == "pd") {
        spaceship["pd"] = true
    } else {
        infobox.innerHTML += "\n  CURRENTLY UNSUPPORTED COMMAND `" + c[0] + "`"
    }

    while (spaceship["x"] > WIDTH) {
        spaceship["x"] -= WIDTH
    }
    while (spaceship["x"] < 0) {
        spaceship["x"] += WIDTH
    }
    while (spaceship["y"] > HEIGHT) {
        spaceship["y"] -= HEIGHT
    }
    while (spaceship["y"] < 0) {
        spaceship["y"] += HEIGHT
    }
    while (spaceship["rotation"] > 2*Math.PI) {
        spaceship["rotation"] -= 2*Math.PI
    }
    while (spaceship["rotation"] < 0) {
        spaceship["rotation"] += 2*Math.PI
    }

    infobox.scrollTop = infobox.scrollHeight
    inputbox.value = ""
}

function add_lines(ctx, points) {
    var prev = points.shift()
    ctx.moveTo(prev[0], prev[1])
    while (points.length > 0) {
        if (points[0][0] < 0) {
            prev = [0, prev[1] - prev[0] * (points[0][1] - prev[1]) / (points[0][0] - prev[0])]
            if (prev[1] >= 0 && prev[1] <= HEIGHT) {
                ctx.lineTo(prev[0], prev[1])
                prev = [prev[0] + WIDTH, prev[1]]
                ctx.moveTo(prev[0], prev[1])
                for (var i = 0; i < points.length; i++) {
                    points[i][0] += WIDTH
                }
                continue
            }
        }
        if (points[0][0] > WIDTH) {
            prev = [WIDTH, prev[1] + (WIDTH - prev[0]) * (points[0][1] - prev[1]) / (points[0][0] - prev[0])]
            if (prev[1] >= 0 && prev[1] <= HEIGHT) {
                ctx.lineTo(prev[0], prev[1])
                prev = [prev[0] - WIDTH, prev[1]]
                ctx.moveTo(prev[0], prev[1])
                for (var i = 0; i < points.length; i++) {
                    points[i][0] -= WIDTH
                }
                continue
            }
        }
        if (points[0][1] < 0) {
            prev = [prev[0] - prev[1] * (points[0][0] - prev[0]) / (points[0][1] - prev[1]), 0]
            if (prev[0] >= 0 && prev[0] <= WIDTH) {
                ctx.lineTo(prev[0], prev[1])
                prev = [prev[0], prev[1] + HEIGHT]
                ctx.moveTo(prev[0], prev[1])
                for (var i = 0; i < points.length; i++) {
                    points[i][1] += HEIGHT
                }
                continue
            }
        }
        if (points[0][1] > HEIGHT) {
            prev = [prev[0] + (HEIGHT - prev[1]) * (points[0][0] - prev[0]) / (points[0][1] - prev[1]), HEIGHT]
            if (prev[0] >= 0 && prev[0] <= WIDTH) {
                ctx.lineTo(prev[0], prev[1])
                prev = [prev[0], prev[1] - HEIGHT]
                ctx.moveTo(prev[0], prev[1])
                for (var i = 0; i < points.length; i++) {
                    points[i][1] -= HEIGHT
                }
                continue
            }
        }
        prev = points.shift()
        ctx.lineTo(prev[0], prev[1])
    }
}

function draw_game() {
    var canvas = document.getElementById("asteroids");
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,WIDTH,HEIGHT);

    ctx.strokeStyle = "#FFFFFF"
    ctx.lineWidth = 2;
    ctx.beginPath()
    add_lines(ctx, [
        [spaceship["x"], spaceship["y"]],
        [spaceship["x"]+10*Math.cos(3*Math.PI/4+spaceship["rotation"]),
         spaceship["y"]+10*Math.sin(3*Math.PI/4+spaceship["rotation"])],
        [spaceship["x"]+15*Math.cos(spaceship["rotation"]),
         spaceship["y"]+15*Math.sin(spaceship["rotation"])],
        [spaceship["x"]+10*Math.cos(-3*Math.PI/4+spaceship["rotation"]),
         spaceship["y"]+10*Math.sin(-3*Math.PI/4+spaceship["rotation"])],
        [spaceship["x"], spaceship["y"]]
    ])

    for (var i = 0; i < asteroids.length; i++) {
        var a = asteroids[i]
        var r = (a["sides"] * a["sides"] - a["sides"] + 30) / 6
        var pts = []
        for (var j = 0; j <= a["sides"]; j++) {
            pts.push([a["x"] + r*Math.cos(a["rotation"] + 2*Math.PI * j / a["sides"]),
                      a["y"] + r*Math.sin(a["rotation"] + 2*Math.PI * j / a["sides"])])
        }
        add_lines(ctx, pts)
    }
    ctx.stroke();

    for (var i = 0; i < drawnlines.length; i++) {
        var line = drawnlines[i]
        ctx.beginPath()
        ctx.moveTo(line[0], line[1])
        ctx.lineTo(line[2], line[3])
        ctx.stroke();
    }
}

function pass() {}
var interval = setInterval(pass, 10000)

function start_game() {
    reset()
    tick()
    clearInterval(interval)
    interval = setInterval(tick,1000/60);
}

function reset() {
    spaceship = {"x": WIDTH, "y": HEIGHT/2, "rotation": 0, "pd": true}
    asteroids = make_new_asteroids(asterN)
    drawnlines = []
}

function tick() {
    move_asteroids()
    draw_game()
}

function make_new_asteroids(n) {
    var out = Array()

    for (var i = 0; i < n; i++) {
        new_a = {"x": spaceship["x"], "y": spaceship["y"], "size": 4, "sides": 6,
                 "speed": 0.5+Math.random()*0.5, "rotation": Math.random()*Math.PI*2,
                 "direction": Math.random()*Math.PI*2}
        while (too_close(new_a, spaceship)) {
            new_a["x"] = Math.random() * WIDTH
            new_a["y"] = Math.random() * HEIGHT
        }

        out[i] = new_a
    }
    return out
}

function move_asteroids() {
    for (var i = 0; i < asteroids.length; i++) {
        asteroids[i]["x"] += asteroids[i]["speed"] * Math.cos(asteroids[i]["direction"])
        asteroids[i]["y"] += asteroids[i]["speed"] * Math.sin(asteroids[i]["direction"])
        while (asteroids[i]["x"] > WIDTH) {
            asteroids[i]["x"] -= WIDTH
        }
        while (asteroids[i]["x"] < 0) {
            asteroids[i]["x"] += WIDTH
        }
        while (asteroids[i]["y"] > HEIGHT) {
            asteroids[i]["y"] -= HEIGHT
        }
        while (asteroids[i]["y"] < 0) {
            asteroids[i]["y"] += HEIGHT
        }
    }
}

function too_close(a, b) {
    var dx = Math.min(Math.abs(a["x"] - b["x"]), Math.abs(a["x"] - b["x"] + WIDTH), Math.abs(a["x"] - b["x"] - WIDTH))
    var dy = Math.min(Math.abs(a["y"] - b["y"]), Math.abs(a["y"] - b["y"] + HEIGHT), Math.abs(a["y"] - b["y"] - HEIGHT))
    return dx * dx + dy * dy < 40000
}