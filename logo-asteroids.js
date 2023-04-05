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
var spaceship = {"x": WIDTH/2, "y": HEIGHT/2, "rotation": 0, "pd": true, "st": true}
var drawnlines = []
var asterN = 2
var asteroids = []
var fires = []

function parse_command(sc) {
    if (sc.length == 0) { return [] }
    var args = []
    var cmd = sc.shift()

    if (cmd == "fd" || cmd == "forward") {
        args = ["NUMBER"]
        cmd = "fd"
    } else if (cmd == "bk" || cmd == "back" || cmd == "backward") {
        args = ["NUMBER"]
        cmg = "bk"
    } else if (cmd == "rt" || cmd == "right") {
        args = ["NUMBER"]
        cmd = "rt"
    } else if (cmd == "lt" || cmd == "left") {
        args = ["NUMBER"]
        cmd = "lt"
    } else if (cmd == "pu" || cmd == "penup") {
        args = []
        cmd = "pu"
    } else if (cmd == "pd" || cmd == "pendown") {
        args = []
        cmd = "pd"
    } else if (cmd == "st" || cmd == "showturtle") {
        args = []
        cmd = "st"
    } else if (cmd == "ht" || cmd == "hideturtle") {
        args = []
        cmd = "ht"
    } else if (cmd == "cs" || cmd == "clearscreen") {
        args = []
        cmd = "cs"
    } else if (cmd == "reset") {
        args = []
        cmd = "reset"
    } else if (cmd == "help") {
        args = []
        cmd = "help"
    } else if (cmd == "fire") {
        args = []
        cmd = "fire"
    } else {
        return [["ERROR", "UNKNOWN COMMAND: `" + cmd + "`"]]
    }

    if (args.length > sc.length) {
        return [["ERROR", "WRONG NUMBER OF INPUTS FOR COMMAND `" + cmd + "`"]]
    }
    var c = [cmd]
    for (var i = 0; i < args.length; i++) {
        value = sc.shift()
        if (args[i] == "NUMBER"){
            if(isNaN(value)){
                return [["ERROR", "COULD NOT PARSE NUMBER `" + value + "`"]]
            }
            c.push(value / 1)
        }
    }
    return [c].concat(parse_command(sc))
}

function run_command() {
    var infobox = document.getElementById("infobox")
    var inputbox = document.getElementById("inputbox")
    if (infobox.innerHTML != "") {
        infobox.innerHTML += "\n"
    }
    var command = inputbox.value
    infobox.innerHTML += command
    var cmds = parse_command(command.toLowerCase().split(" "))
    var error = false
    var distance = 0
    var firecount = 0
    for (var i = 0; i < cmds.length; i++) {
        c = cmds[i]
        if (c[0] == "ERROR") {
            infobox.innerHTML += "\n  " + c[1]
            error = true
        }
        if (c[0] == "fd" || c[0] == "bk") {
            distance += Math.abs(c[1])
        }
        if (c[0] == "fire") {
            firecount++
        }
    }
    if (distance > 1000) {
        error = true
        infobox.innerHTML += "\n  CANNOT TRAVEL MORE THAN 1000 UNITS IN ONE COMMAND"
    }
    if (firecount > 10) {
        error = true
        infobox.innerHTML += "\n  CANNOT FIRE MORE THAN 10 TIMES IN ONE COMMAND"
    }
    if (!error) {
        while (cmds.length > 0) {
            c = cmds.shift()
            if (c[0] == "fd") {
                var old_x = spaceship["x"]
                var old_y = spaceship["y"]
                spaceship["x"] += c[1] * Math.cos(spaceship["rotation"])
                spaceship["y"] += c[1] * Math.sin(spaceship["rotation"])
                if (spaceship["pd"]) {
                    make_line([old_x, old_y], [spaceship["x"], spaceship["y"]])
                }
                spaceship_wrap()
            } else if (c[0] == "bk") {
                var old_x = spaceship["x"]
                var old_y = spaceship["y"]
                spaceship["x"] -= c[1] * Math.cos(spaceship["rotation"])
                spaceship["y"] -= c[1] * Math.sin(spaceship["rotation"])
                if (spaceship["pd"]) {
                    make_line([old_x, old_y], [spaceship["x"], spaceship["y"]])
                }
                spaceship_wrap()
            } else if (c[0] == "rt") {
                spaceship["rotation"] += c[1] * Math.PI / 180
            } else if (c[0] == "lt") {
                spaceship["rotation"] -= c[1] * Math.PI / 180
            } else if (c[0] == "pu") {
                spaceship["pd"] = false
            } else if (c[0] == "pd") {
                spaceship["pd"] = true
            } else if (c[0] == "ht") {
                spaceship["st"] = false
            } else if (c[0] == "st") {
                spaceship["st"] = true
            } else if (c[0] == "cs") {
                drawnlines = []
            } else if (c[0] == "reset") {
                drawnlines = []
                spaceship = {"x": WIDTH/2, "y": HEIGHT/2, "rotation": 0, "pd": true, "st": true}
            } else if (c[0] == "help") {
                show_logohelp()
            } else if (c[0] == "fire") {
                fires.push({"age": 40,"x": spaceship["x"]+15*Math.cos(spaceship["rotation"]),"y": spaceship["y"]+15*Math.sin(spaceship["rotation"]),"rotation": spaceship["rotation"]})
            } else {
                infobox.innerHTML += "\n  CURRENTLY UNSUPPORTED COMMAND `" + c[0] + "`"
            }
        }
    }

    infobox.scrollTop = infobox.scrollHeight
    inputbox.value = ""
}

function spaceship_wrap() {
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
    if (spaceship["st"]) {
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
    }

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

    for (var i = 0; i < fires.length; i++) {
        var f = fires[i]
        var c = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"][Math.min(14, Math.floor(15 * (fires[i]["age"] / 15)))]
        ctx.beginPath()
        ctx.strokeStyle = "#" + c + c + c + c + c + c
        add_lines(ctx, [[f["x"], f["y"]], [f["x"]+10*Math.cos(f["rotation"]), f["y"]+10*Math.sin(f["rotation"])]])
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
    spaceship = {"x": WIDTH/2, "y": HEIGHT/2, "rotation": 0, "pd": true, "st": true}
    asteroids = make_new_asteroids(asterN)
    drawnlines = []
    infobox = document.getElementById("infobox").innerHTML = "Logo Asteroids. Created by Matthew Scroggs (mscroggs.co.uk)"
    fires = []
}

function tick() {
    move_asteroids()
    move_fires()
    update_lines()
    draw_game()
}

function update_lines() {
    var new_lines = []
    for (var i = 0; i < drawnlines.length; i++) {
        drawnlines[i][4] -= 1
        if (drawnlines[i][4] > 0){
            new_lines.push(drawnlines[i])
        }
    }
    drawnlines = new_lines
}

function make_new_asteroids(n) {
    var out = []

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

function move_fires() {
    var new_fires = []
    for (var i = 0; i < fires.length; i++) {
        fires[i]["age"]--
        fires[i]["x"] += 2*Math.cos(fires[i]["rotation"])
        fires[i]["y"] += 2*Math.sin(fires[i]["rotation"])
        if (fires[i]["age"] > 0) {
            new_fires.push(fires[i])
        }
    }
    fires = new_fires
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
                candidate = [b, {"x": x + b * (new_x - x), "y": y + b * (new_y - y),
                                 "direction": Math.PI + 2 * Math.atan2(line[0] - line[2], line[3] - line[1]) - d}]
            }
        }
    }
    if (candidate[0] < 1) {
        var more = s * (1 - candidate[0])
        var eps = more / 10
        return addsteroid(candidate[1]["x"] + eps*Math.cos(candidate[1]["direction"]), candidate[1]["y"] + eps*Math.sin(candidate[1]["direction"]), candidate[1]["direction"], more - eps)
    }
    // TODO: proper wrapping
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

function show_logohelp() {
    var join = "; "
    var info = "<a href='javascript:hide_logohelp()'>Hide help</a><br />"
    info += "Supported commands: "
    info += "fd, forward" + join
    info += "bk, back, backward" + join
    info += "rt, right" + join
    info += "lt, left" + join
    info += "cs, clearscreen" + join
    info += "pu, penup" + join
    info += "pd, pendown" + join
    info += "ht, hideturtle" + join
    info += "st, showturtle" + join
    info += "reset" + join
    info += "fire"
    document.getElementById("logohelp").innerHTML = info
}
function hide_logohelp() {
    document.getElementById("logohelp").innerHTML = "<a href='javascript:show_logohelp()'>Show help</a><br />"
}
