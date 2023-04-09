/**********************************************/
/*                                            */
/*               LOGO Asteroids               */
/*                                            */
/**********************************************/
/*  This code was written by Matthew Scroggs  */
/*                                            */
/*       mscroggs.co.uk/logo-asteroids        */
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
var explosions = []
var fires = []
var score = 0
var lives = 0
var running = false
var cmd_history = []
var history_n = 0
var history_overwritten = {}

function parse_command(sc) {
    if (sc.length == 0) { return [] }
    var args = []
    var cmd = sc.shift()

    if (cmd == "fd" || cmd == "forward") {
        args = ["NUMBER"]
        cmd = "fd"
    } else if (cmd == "bk" || cmd == "back" || cmd == "backward") {
        args = ["NUMBER"]
        cmd = "bk"
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
    } else if (cmd == "start") {
        args = []
        cmd = "start"
    } else if (cmd == "repeat") {
        args = ["INT", "[]"]
    } else {
        return [["ERROR", "UNKNOWN COMMAND: `" + cmd + "`"]]
    }

    if (args.length > sc.length) {
        return [["ERROR", "WRONG NUMBER OF INPUTS FOR COMMAND `" + cmd + "`"]]
    }
    var c = [cmd]
    for (var i = 0; i < args.length; i++) {
        value = sc.shift()
        if (args[i] == "NUMBER") {
            if(isNaN(value)) {
                return [["ERROR", "COULD NOT PARSE NUMBER `" + value + "`"]]
            }
            c.push(value / 1)
        } else if (args[i] == "INT") {
            if(isNaN(value)) {
                return [["ERROR", "COULD NOT PARSE INTEGER `" + value + "`"]]
            }
            if (value * 1 != Math.floor(value*1)) {
                return [["ERROR", "COULD NOT PARSE INTEGER `" + value + "`"]]
            }
            c.push(value * 1)
        } else if (args[i] == "[]") {
            if (value[0] != "["){
                alert(value)
                return [["ERROR", "INPUT TO COMMAND `" + cmd + "` NEEDS SQUARE BRACKETS"]]
            }
            var bracketed = value.substr(1)
            while (sc.length >= 0) {
                if (bracketed[bracketed.length - 1] == "]" && (bracketed.match(/\[/g) || []).length + 1 == (bracketed.match(/\]/g) || []).length) {
                    bracketed = bracketed.substr(0, bracketed.length - 1)
                    break
                }
                if (sc.length == 0) {break}
                bracketed += " " + sc.shift()
            }
            if ((bracketed.match(/\[/g) || []).length != (bracketed.match(/\]/g) || []).length) {
                alert(bracketed)
                return [["ERROR", "INPUT TO COMMAND `" + cmd + "` NEEDS SQUARE BRACKETS"]]
            }
            c.push(parse_command(bracketed.split(" ")))
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
    cmd_history.push(command)
    history_n = 0
    history_overwritten = {}
    infobox.innerHTML += command
    inputbox.value = ""
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
    if (!running) {
        if (c[0] == "start" && !running) {
            start_game()
        } else if (c[0] == "help" && !running) {
            show_logohelp()
        } else if (lives == 0) {
            infobox.innerHTML += "\n  CANNOT RUN COMMAND WHEN GAME NOT RUNNING. RUN `start` TO BEGIN"
        }
    } else if (!error) {
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
            } else if (c[0] == "start") {
                if (running) {
                    infobox.innerHTML += "\n  GAME ALREADY RUNNING"
                } else {
                    start_game()
                }
            } else if (c[0] == "repeat") {
                for (var i = 0; i < c[1]; i++) {
                    cmds = c[2].concat(cmds)
                }
            } else {
                infobox.innerHTML += "\n  CURRENTLY UNSUPPORTED COMMAND `" + c[0] + "`"
            }
        }
    }

    infobox.scrollTop = infobox.scrollHeight
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
    if (lives > 0 && spaceship["st"]) {
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
        var r = radius(a["sides"])
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
        var c = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"][Math.min(14, Math.floor(15 * (f["age"] / 15)))]
        ctx.beginPath()
        ctx.strokeStyle = "#" + c + c + c + c + c + c
        add_lines(ctx, [[f["x"], f["y"]], [f["x"]+10*Math.cos(f["rotation"]), f["y"]+10*Math.sin(f["rotation"])]])
        ctx.stroke();
    }

    for (var i = 0; i < explosions.length; i++) {
        var e = explosions[i]
        var c = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"][Math.min(14, Math.floor(15 * (e["age"] / 15)))]
        ctx.beginPath()
        ctx.strokeStyle = "#" + c + c + c + c + c + c
        add_lines(ctx, [[e["x"], e["y"]], [e["x"]+5/e["speed"]*Math.cos(e["rotation"]), e["y"]+5/e["speed"]*Math.sin(e["rotation"])]])
        ctx.stroke();
    }

    ctx.font = "15px monospace"
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "right"
    ctx.fillText("SCORE: " + score, WIDTH-5, 20)
    ctx.fillText("LIVES: " + lives, WIDTH-5, 38)
}

function radius(sides) {
    return (sides * sides - sides + 30) / 6
}

function pass() {}
var interval = setInterval(pass, 10000)

function start_game() {
    running = true
    reset()
    tick()
    clearInterval(interval)
    interval = setInterval(tick,1000/60);
}

function gameover() {
    setTimeout(show_gameover, 1000)
}
function show_gameover() {
    end_game()
    var canvas = document.getElementById("asteroids");
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(200,200,WIDTH-400,HEIGHT-350);

    ctx.font = "25px monospace"
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "center"
    ctx.fillText("GAME OVER", WIDTH/2, HEIGHT/2)
    ctx.font = "15px monospace"
    ctx.fillText("SCORE: " + score, WIDTH/2, HEIGHT/2 + 30)
    ctx.fillText("RUN COMMAND `start` TO PLAY AGAIN", WIDTH/2, HEIGHT/2 + 60)

}

function end_game() {
    clearInterval(interval)
    interval = setInterval(pass, 10000)
    running = false
}

function reset() {
    spaceship = {"x": WIDTH/2, "y": HEIGHT/2, "rotation": 0, "pd": true, "st": true}
    asteroids = make_new_asteroids(asterN)
    drawnlines = []
    fires = []
    explosions = []
    score = 0
    lives = 3
}

function tick() {
    move_asteroids()
    move_fires()
    move_explosions()
    check_collisions()
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

function check_collisions() {
    var new_asteroids = []
    var fired = []
    for (var j = 0; j < fires.length; j++) {
        fired.push(false)
    }
    var ship_points = [
        [spaceship["x"], spaceship["y"]],
        [spaceship["x"]+10*Math.cos(3*Math.PI/4+spaceship["rotation"]),
         spaceship["y"]+10*Math.sin(3*Math.PI/4+spaceship["rotation"])],
        [spaceship["x"]+15*Math.cos(spaceship["rotation"]),
         spaceship["y"]+15*Math.sin(spaceship["rotation"])],
        [spaceship["x"]+10*Math.cos(-3*Math.PI/4+spaceship["rotation"]),
         spaceship["y"]+10*Math.sin(-3*Math.PI/4+spaceship["rotation"])],
    ]

    for (var i = 0; i < asteroids.length; i++) {
        var a = asteroids[i]
        var hit = false
        for (var j = 0; j < fires.length; j++) {
            var f = fires[j]
            if (Math.pow(f["x"]-a["x"], 2) + Math.pow(f["y"]-a["y"], 2) < Math.pow(radius(a["sides"]), 2)) {
                hit = true
                fired[j] = true
                for (var k = 0; k < 6; k++) {
                    explosions.push({"x": f["x"], "y": f["y"], "rotation": Math.random()*Math.PI*2, "speed": 0.5 + 2 * Math.random(), "age": 50})
                }
                score += 10*(7-a["sides"])
                if (a["sides"] > 3) {
                    for (var k = 0; k < 2; k++) {
                        new_asteroids.push({
                            "x": a["x"], "y": a["y"], "sides": a["sides"] - 1,
                            "speed": 0.5+(8-a["sides"])*Math.random()*0.5, "rotation": Math.random()*Math.PI*2,
                            "direction": Math.random()*Math.PI*2})
                    }
                }
            }
        }
        if (lives > 0) {
            for (var j = 0; j < ship_points.length; j++) {
                var s = ship_points[j]
                if (Math.pow(s[0]-a["x"], 2) + Math.pow(s[1]-a["y"], 2) < Math.pow(radius(a["sides"]), 2)) {
                    lives--;
                    for (var k = 0; k < 20; k++) {
                        explosions.push({"x": spaceship["x"], "y": spaceship["y"], "rotation": Math.random()*Math.PI*2, "speed": 0.5 + 2 * Math.random(), "age": 50})
                    }
                    if (lives == 0) {
                        gameover()
                    } else {
                        var x = spaceship["x"]
                        var y = spaceship["y"]
                        var attempts = 0
                        while (too_close_any(x, y) && attempts < 50) {
                            x = 20 + Math.random() * (WIDTH - 40)
                            y = 20 + Math.random() * (HEIGHT - 40)
                            attempts++
                        }
                        spaceship["x"] = x
                        spaceship["y"] = y
                        spaceship["speed"] = 0
                        spaceship["rotation"] = Math.random() * 2 * Math.PI
                    }
                }
            }
        }
        if (!hit) {
            new_asteroids.push(a)
        }
    }
    asteroids = new_asteroids
    if (asteroids.length == 0) {
        asterN++
        lives++
        asteroids = make_new_asteroids(asterN)
    }
    var new_fires = []
    for (var j = 0; j < fires.length; j++) {
        if (!fired[j]) {
            new_fires.push(fires[j])
        }
    }
    fires = new_fires
}

function make_new_asteroids(n) {
    var out = []

    for (var i = 0; i < n; i++) {
        new_a = {"x": spaceship["x"], "y": spaceship["y"], "sides": 6,
                 "speed": 0.5+Math.random()*0.5, "rotation": Math.random()*Math.PI*2,
                 "direction": Math.random()*Math.PI*2}
        var attempts = 0
        while (too_close(new_a, spaceship) && attempts < 50) {
            new_a["x"] = Math.random() * WIDTH
            new_a["y"] = Math.random() * HEIGHT
            attempts++
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

function move_explosions() {
    var new_explosions = []
    for (var i = 0; i < explosions.length; i++) {
        explosions[i]["age"]--
        explosions[i]["x"] += explosions[i]["speed"]*Math.cos(explosions[i]["rotation"])
        explosions[i]["y"] += explosions[i]["speed"]*Math.sin(explosions[i]["rotation"])
        if (explosions[i]["age"] > 0) {
            new_explosions.push(explosions[i])
        }
    }
    explosions = new_explosions
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

function too_close_any(x, y) {
    for (var i = 0; i < asteroids.length; i++) {
        if (too_close(asteroids[i], {"x": x, "y": y})) {
            return true
        }
    }
    return false
}

function show_logohelp() {
    var commands = [
        // turtle commands
        [["bk", "back", "backward"], "move backward", ["bk 100"]],
        [["cs", "clearscreen"], "erase all the lines", []],
        [["fd", "forward"], "move forward", ["fd 100"]],
        [["ht", "hideturtle"], "hide the turtle", []],
        [["lt", "left"], "turn left", ["lt 60"]],
        [["pd", "pendown"], "put the pen down: after this is done, lines will be drawn", []],
        [["pu", "penup"], "lift the pen up: after this is done, lines will not be drawn", []],
        [["repeat"], "repeat a set of commands", ["repeat 4 [fd 100 rt 90]"]],
        [["reset"], "erase all the lines are move back to the centre", []],
        [["rt", "right"], "turn right", ["rt 90"]],
        [["st", "showturtle"], "show the turtle", []],

        // special commands
        [["fire"], "fire at the asteroids", []],
        [["help"], "show help", []],
        [["start"], "start the game", []],
    ]
    var info = "<a href='javascript:hide_logohelp()'>Hide help</a><br />"
    info += "Supported commands:"
    info += "<ul>"
    for (var i = 0; i < commands.length; i++) {
        info += "<li>"
        for (var j = 0; j < commands[i][0].length; j++) {
            info += "<span class='logocmd'>" + commands[i][0][j] + "</span>"
            if (j + 1 < commands[i][0].length) {
                info += ", "
            }
        }
        if (commands[i][1] != "") {
            info += ": " + commands[i][1]
        }
        if (commands[i][2].length > 0) {
            info += " (eg "
            for (var j = 0; j < commands[i][2].length; j++) {
                info += "<span class='logocmd'>" + commands[i][2][j] + "</span>"
                if (j + 1 < commands[i][2].length) {
                    info += ", "
                }
            }
            info += ")"
        }
        info += "</li>"
    }
    info += "</ul>"
    document.getElementById("logohelp").innerHTML = info
}

function hide_logohelp() {
    document.getElementById("logohelp").innerHTML = "<a href='javascript:show_logohelp()'>Show help</a><br />"
}

function show_titlescreen() {
    document.getElementById("infobox").innerHTML = "Logo Asteroids. Created by Matthew Scroggs (mscroggs.co.uk)"
    var canvas = document.getElementById("asteroids");
    var ctx = canvas.getContext("2d");
    ctx.fillStyle = "#000000";
    ctx.fillRect(0,0,WIDTH,HEIGHT);

    ctx.font = "35px monospace"
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "center"
    ctx.fillText("LOGO ASTEROIDS", WIDTH/2, 100)
    ctx.font = "15px monospace"
    ctx.fillText("RUN COMMAND `start` TO BEGIN", WIDTH/2, 130)

    ctx.strokeStyle = "#FFFFFF"
    ctx.lineWidth = 2;
    ctx.beginPath()
    var x = 575
    var y = 350
    var rot = -11 * Math.PI/12
    var scale = 4
    ctx.moveTo(x, y)
    ctx.lineTo(x + scale * 10 * Math.cos(rot+5*Math.PI/4), y + scale * 10 * Math.sin(rot+5*Math.PI/4))
    ctx.lineTo(x + scale * 15 * Math.cos(rot), y + scale * 15 * Math.sin(rot))
    ctx.lineTo(x + scale * 10 * Math.cos(rot-5*Math.PI/4), y + scale * 10 * Math.sin(rot-5*Math.PI/4))
    ctx.lineTo(x, y)

    ctx.moveTo(x + scale * 25 * Math.cos(rot), y + scale * 25 * Math.sin(rot))
    ctx.lineTo(x + scale * 35 * Math.cos(rot), y + scale * 35 * Math.sin(rot))
    ctx.moveTo(x + scale * 55 * Math.cos(rot), y + scale * 55 * Math.sin(rot))
    ctx.lineTo(x + scale * 65 * Math.cos(rot), y + scale * 65 * Math.sin(rot))

    ctx.stroke();

    ctx.beginPath()

    ctx.strokeStyle = "#FFFFFF"
    ctx.fillStyle="#006600"

    x = 225
    y = 250
    rot = -Math.PI/3

    rotated_moveTo(ctx, x, y, scale * 24, 0, rot)
    for (var i = 1; i <= 360; i++) {
        rotated_lineTo(ctx, x, y, scale * 18 + scale * 6 * Math.cos(i*Math.PI/180), scale * 4 * Math.sin(i*Math.PI/180), rot)
    }
    ctx.stroke();

    ctx.moveTo(x, y)
    for (var i = 1; i <= 360; i++) {
        var a = i * Math.PI/180
        rotated_lineTo(ctx, x, y, scale * 17 * Math.pow(Math.sin(2*a), 2) * Math.cos(a), scale * 17 * Math.pow(Math.sin(2*a), 2) * Math.sin(a), rot)
    }
    ctx.fill();
    ctx.stroke();

    ctx.beginPath()
    ctx.fillStyle="#A4442D"
    rotated_moveTo(ctx, x, y, scale * 15, 0, rot)
    for (var i = 1; i <= 360; i++) {
        rotated_lineTo(ctx, x, y, scale * 15 * Math.cos(i*Math.PI/180), scale * 10 * Math.sin(i*Math.PI/180), rot)
    }
    ctx.fill();
    ctx.stroke();

    ctx.beginPath()
    rotated_moveTo(ctx, x, y, scale * 7, 0, rot)
    rotated_lineTo(ctx, x, y, scale * 3, scale * 4, rot)
    rotated_lineTo(ctx, x, y, -scale * 3, scale * 4, rot)
    rotated_lineTo(ctx, x, y, -scale * 7, 0, rot)
    rotated_lineTo(ctx, x, y, -scale * 3, -scale * 4, rot)
    rotated_lineTo(ctx, x, y, scale * 3, -scale * 4, rot)
    rotated_lineTo(ctx, x, y, scale * 7, 0, rot)

    rotated_moveTo(ctx, x, y, -scale * 5, scale * 9, rot)
    rotated_lineTo(ctx, x, y, -scale * 3, scale * 5, rot)
    rotated_lineTo(ctx, x, y, scale * 3, scale * 5, rot)
    rotated_lineTo(ctx, x, y, scale * 5, scale * 9, rot)

    rotated_moveTo(ctx, x, y, -scale * 5, -scale * 9, rot)
    rotated_lineTo(ctx, x, y, -scale * 3, -scale * 5, rot)
    rotated_lineTo(ctx, x, y, scale * 3, -scale * 5, rot)
    rotated_lineTo(ctx, x, y, scale * 5, -scale * 9, rot)

    rotated_moveTo(ctx, x, y, -scale * 14.35, scale * 0.71, rot)
    rotated_lineTo(ctx, x, y, -scale * 7.71, scale * 0.71, rot)
    rotated_lineTo(ctx, x, y, -scale * 3.71, scale * 4.71, rot)
    rotated_lineTo(ctx, x, y, -scale * 5.75, scale * 8.79, rot)
    rotated_moveTo(ctx, x, y, scale * 14.35, scale * 0.71, rot)
    rotated_lineTo(ctx, x, y, scale * 7.71, scale * 0.71, rot)
    rotated_lineTo(ctx, x, y, scale * 3.71, scale * 4.71, rot)
    rotated_lineTo(ctx, x, y, scale * 5.75, scale * 8.79, rot)
    rotated_moveTo(ctx, x, y, -scale * 14.35, -scale * 0.71, rot)
    rotated_lineTo(ctx, x, y, -scale * 7.71, -scale * 0.71, rot)
    rotated_lineTo(ctx, x, y, -scale * 3.71, -scale * 4.71, rot)
    rotated_lineTo(ctx, x, y, -scale * 5.75, -scale * 8.79, rot)
    rotated_moveTo(ctx, x, y, scale * 14.35, -scale * 0.71, rot)
    rotated_lineTo(ctx, x, y, scale * 7.71, -scale * 0.71, rot)
    rotated_lineTo(ctx, x, y, scale * 3.71, -scale * 4.71, rot)
    rotated_lineTo(ctx, x, y, scale * 5.75, -scale * 8.79, rot)
    ctx.stroke();
}

function rotated_lineTo(ctx, cx, cy, dx, dy, rot) {
    var r = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
    var a = rot + Math.atan2(dy, dx)
    ctx.lineTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
}

function rotated_moveTo(ctx, cx, cy, dx, dy, rot) {
    var r = Math.sqrt(Math.pow(dx, 2) + Math.pow(dy, 2))
    var a = rot + Math.atan2(dy, dx)
    ctx.moveTo(cx + r * Math.cos(a), cy + r * Math.sin(a))
}

show_titlescreen()
document.getElementById("inputbox").addEventListener("keydown", (event) => {
    var new_history_n = history_n
    if(event.key == "ArrowUp") {
        if (history_n < cmd_history.length) {
            new_history_n++
        }
    }
    if(event.key == "ArrowDown") {
        if (history_n > 0) {
            new_history_n--
        }
    }
    if (history_n != new_history_n) {
        var current = document.getElementById("inputbox").value
        if ((history_n == 0 && current != "") || (current != cmd_history[cmd_history.length - history_n])){
            history_overwritten[history_n] = current
        }
        if (new_history_n in history_overwritten) {
            document.getElementById("inputbox").value = history_overwritten[new_history_n]
        } else if (new_history_n == 0){
            document.getElementById("inputbox").value = ""
        } else {
            document.getElementById("inputbox").value = cmd_history[cmd_history.length - new_history_n]
        }
        history_n = new_history_n
    }
});
