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
            make_line([old_x, old_y], [spaceship["x"], spaceship["y"]])
        }
    } else if (c[0] == "back") {
        var old_x = spaceship["x"]
        var old_y = spaceship["y"]
        spaceship["x"] -= c[1] * Math.cos(spaceship["rotation"])
        spaceship["y"] -= c[1] * Math.sin(spaceship["rotation"])
        if (spaceship["pd"]) {
            make_line([old_x, old_y], [spaceship["x"], spaceship["y"]])
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

function make_line(start, end) {
    if (start[0] < 0) {
        make_line([start[0] + WIDTH, start[1]], [end[0] + WIDTH, end[1]])
    } else if (start[0] > WIDTH) {
        make_line([start[0] - WIDTH, start[1]], [end[0] - WIDTH, end[1]])
    } else if (start[1] < 0) {
        make_line([start[0], start[1] + HEIGHT], [end[0], end[1] + HEIGHT])
    } else if (start[1] > HEIGHT) {
        make_line([start[0], start[1] - HEIGHT], [end[0], end[1] - HEIGHT])
    } else if (end[0] < 0) {
        var y = start[1] - start[0] * (end[1] - start[1]) / (end[0] - start[0])
        make_line(start, [0, y])
        make_line([WIDTH, y], [end[0] + WIDTH, end[1]])
    } else if (end[0] > WIDTH) {
        var y = start[1] + (WIDTH - start[0]) * (end[1] - start[1]) / (end[0] - start[0])
        make_line(start, [WIDTH, y])
        make_line([0, y], [end[0] - WIDTH, end[1]])
    } else if (end[1] < 0) {
        var x = start[0] - start[1] * (end[0] - start[0]) / (end[1] - start[1])
        make_line(start, [x, 0])
        make_line([x, HEIGHT], [end[0], end[1] + HEIGHT])
    } else if (end[1] > HEIGHT) {
        var x = start[0] + (HEIGHT - start[1]) * (end[0] - start[0]) / (end[1] - start[1])
        make_line(start, [x, HEIGHT])
        make_line([x, 0], [end[0], end[1] - HEIGHT])
    } else {
        drawnlines.push([start[0], start[1], end[0], end[1], 500])
    }
}

function add_lines(ctx, points) {
    for (var x = -1; x <= 1; x++) {
        for (var y = -1; y <= 1; y++) {
            ctx.moveTo(x*WIDTH + points[0][0], y*HEIGHT + points[0][1])
            for (var i = 1; i < points.length; i++) {
                ctx.lineTo(x*WIDTH + points[i][0], y*HEIGHT + points[i][1])
            }
        }
    }
}

function draw_game() {
    var canvas = document.getElementById("asteroids");
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,WIDTH,HEIGHT);

    for (var i = 0; i < drawnlines.length; i++) {
        var line = drawnlines[i]
        var c = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"][Math.min(14, Math.floor(15 * (drawnlines[i][4] / 50)))]
        ctx.strokeStyle = "#" + c + c + c + c + c + c
        ctx.lineWidth = 2;
        ctx.beginPath()
        ctx.moveTo(line[0], line[1])
        ctx.lineTo(line[2], line[3])
        ctx.stroke();
    }

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
    spaceship = {"x": WIDTH/2, "y": HEIGHT/2, "rotation": 0, "pd": true}
    asteroids = make_new_asteroids(asterN)
    drawnlines = []
}

function tick() {
    move_asteroids()
    update_lines()
    draw_game()
}

function update_lines() {
    var new_lines = Array()
    for (var i = 0; i < drawnlines.length; i++) {
        drawnlines[i][4] -= 1
        if (drawnlines[i][4] > 0){
            new_lines.push(drawnlines[i])
        }
    }
    drawnlines = new_lines
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
        var new_pos = addsteroid(asteroids[i]["x"], asteroids[i]["y"], asteroids[i]["direction"], asteroids[i]["speed"])
        asteroids[i]["x"] = new_pos["x"]
        asteroids[i]["y"] = new_pos["y"]
        asteroids[i]["direction"] = new_pos["direction"]
    }
}
function addsteroid(x, y, d, s) {
    var new_x = x + s * Math.cos(d)
    var new_y = y + s * Math.sin(d)
    var new_d = d

    var candidate = [2, {}]
    for (var i = 0; i < drawnlines.length; i++) {
        var line = drawnlines[i]
        var b = ((line[0] - x) * (line[3] - line[1]) + (y - line[1]) * (line[2] - line[0])) / ((new_x - x) * (line[3] - line[1]) - (new_y - y) * (line[2] - line[0]))
        var a = -1
        if (Math.abs(line[3] - line[1]) > Math.abs(line[2] - line[0])) {
            a = (y + b * (new_y - y) - line[1]) / (line[3] - line[1])
        } else {
            a = (x + b * (new_x - x) - line[0]) / (line[2] - line[0])
        }
        if (a > 0 && a < 1 && b > 0 && b < 1) {
            if (b < candidate[0]) {
                candidate = [b, {"x": x + b * (new_x - x), "y": y + b * (new_y - y), "direction": d + Math.PI}]
            }
        }
    }
    if (candidate[0] < 1) {
        // TODO: direction here
        return addsteroid(candidate[1]["x"], candidate[1]["y"], candidate[1]["direction"], s * (1 - candidate[0]))
    }

    while (new_x > WIDTH) {
        new_x -= WIDTH
    }
    while (new_x < 0) {
        new_x += WIDTH
    }
    while (new_y > HEIGHT) {
        new_y -= HEIGHT
    }
    while (new_y < 0) {
        new_y += HEIGHT
    }
    return {"x": new_x, "y": new_y, "direction": new_d}
}

function too_close(a, b) {
    var dx = Math.min(Math.abs(a["x"] - b["x"]), Math.abs(a["x"] - b["x"] + WIDTH), Math.abs(a["x"] - b["x"] - WIDTH))
    var dy = Math.min(Math.abs(a["y"] - b["y"]), Math.abs(a["y"] - b["y"] + HEIGHT), Math.abs(a["y"] - b["y"] - HEIGHT))
    return dx * dx + dy * dy < 40000
}
