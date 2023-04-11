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
var turtle = {"x": WIDTH/2, "y": HEIGHT/2, "rotation": 0, "pd": true, "st": true}
var gameoptions = {"bg": "#000000", "pc": "#FFFFFF", "pensize": 2}
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
var custom_commands = {}
var global_variables = {}

var builtindesc = "0=BLACK,1=BLUE,2=GREEN,3=CYAN,4=RED,5=MAGENTA,6=YELLOW,7=WHITE"
var builtin = [[0, 0, 0], [0, 0, 255], [0, 255, 0], [0, 255, 255], [255, 0, 0], [255, 0, 255], [255, 255, 0], [255, 255, 255]]

var commands = [
    // FORMAT: [ [command(s)], "description", [example(s)], [arg(s)]]

    // turtle commands
    [["bk", "back", "backward"], "move backward", ["bk 100"], ["NUMBER"], false],
    [["cs", "clearscreen", "clean"], "erase all the lines", [], [], false],
    [["distance"], "get the distance from the turtle to a point", ["print distance 100 50"], ["NUMBER", "NUMBER"], true],
    [["end"], "ends a procedure", ["to square repeat 4 [fd 100 rt 90] end"], [], true],
    [["er", "erase"], "erase a (custom) prodecure", ["er square"], ["STRING"], false],
    [["erall", "eraseall"], "erase all (custom) procedures", [], [], false],
    [["fd", "forward"], "move forward", ["fd 100"], ["NUMBER"], false],
    [["heading"], "the current heading (angle with horizontal) of the turtle", ["print heading"], [], true],
    [["home"], "move the turtle back to the centre", [], [], false],
    [["ht", "hideturtle"], "hide the turtle", [], [], false],
    [["lt", "left"], "turn left", ["lt 60"], ["NUMBER"], false],
    [["make"], "set a variable", ["make :a 10"], [":", "NUMBER"], false],
    [["pd", "pendown"], "put the pen down: after this is done, lines will be drawn", [], [], false],
    [["pos", "position"], "the turtle's current position", ["print pos"], [], true],
    [["posx", "positionx"], "the turtle's current x-position", ["print posx"], [], true],
    [["posy", "positiony"], "the turtle's current y-positioon", ["print posy"], [], true],
    [["pots", "printouttitles"], "print out names of (custom) procedures", [], [], false],
    [["print", "pr"], "print out a value", ["print random 100"], ["QUOTE OR NUMBER"], false],
    [["pu", "penup"], "lift the pen up: after this is done, lines will not be drawn", [], [], false],
    [["random"], "pick a random integer", ["fd random 100"], ["INT"], true],
    [["repcount"], "the current iteration number in a repeat loop", ["repeat 4 [fd 10 * repcount rt 90]"], [], true],
    [["repeat"], "repeat a set of commands", ["repeat 4 [fd 100 rt 90]"], ["INT", "[]"], false],
    [["reset", "cleargraphics", "cg"], "erase all the lines are move back to the centre", [], [], false],
    [["rt", "right"], "turn right", ["rt 90"], ["NUMBER"], false],
    [["setbg", "setbackground"], "set the background color to a built-in color (" + builtindesc + ") OR AN RGB COLOR", ["setbg 3", "setbg [255 163 0]"], ["COLOR"], false],
    [["setpc", "setpencolor"], "set the pen color to a built-in color (" + builtindesc + ") OR AN RGB COLOR", ["setbg 3", "setbg [255 163 0]"], ["COLOR"], false],
    [["setpensize"], "set the pen size (from 0 to 255)", ["setpensize 20"], ["INT"], false],
    [["seth", "setheading"], "set the turtle's heading (angle with horizontal)", [], ["NUMBER"], false],
    [["setx"], "set the turtle's x position", [], ["NUMBER"], false],
    [["setxy"], "set the turtle's x and y positions", [], ["NUMBER", "NUMBER"], false],
    [["sety"], "set the turtle's y position", [], ["NUMBER"], false],
    [["st", "showturtle"], "show the turtle", [], [], false],
    [["to"], "define a (custom) procedure", ["to square repeat 4 [fd 100 rt 90] end", "to square :size repeat 4 [fd :size rt 90] end"], ["STRING", "?: ... END"], false],
    [["towards"], "point the turtle towards a point", ["towards 100 50"], ["NUMBER", "NUMBER"], false],

    // maths commands
    [["arccos", "acos"], "compute the inverse cosine of a number", ["print arccos 0.5"], ["NUMBER"], true],
    [["arcsin", "asin"], "compute the inverse sine of a number", ["print arcsin 0.5"], ["NUMBER"], true],
    [["arctan", "atan"], "compute the inverse tangent of a number", ["print arctan 0.5"], ["NUMBER"], true],
    [["abs"], "compute the absolute value of a number", ["print abs -100"], ["NUMBER"], true],
    [["cos", "cosine"], "compute the cosine of a number", ["print cos 30"], ["NUMBER"], true],
    [["exp"], "compute e to the power of a number", ["print exp 2"], ["NUMBER"], true],
    [["ln", "log"], "compute the log (base e) of a number", ["print ln 2"], ["NUMBER"], true],
    [["quotient"], "compute the integer division of two numbers", ["print quotient 10 3"], ["INT", "INT"], true],
    [["remainder"], "compute the remainder when a value is divided by another number", ["print remainder 10 3"], ["INT", "INT"], true],
    [["sin", "sine"], "compute the sine of a number", ["print sin 30"], ["NUMBER"], true],
    [["sum"], "compute the sum of two values", ["print sum 30 50"], ["NUMBER", "NUMBER"], true],
    [["sqrt"], "compute the square root of a number", ["print sin 30"], ["NUMBER"], true],
    [["tan", "tangent"], "compute the tangent of a number", ["print tan 30"], ["NUMBER"], true],

    // special commands
    [["fire"], "fire at the asteroids", [], [], false],
    [["help"], "show command help", [], [], false],
    [["start"], "start the game", [], [], false],
]

function parse_arg(cmds, format, variables) {
    if (cmds.length == 0) {
        return ["ERROR", "NUMBER IS MISSING"]
    }
    var value = cmds.shift()
    if (format == "QUOTE OR NUMBER") {
        if (value[0] == "\"") {
            value = value.substr(1)
            while (cmds.length > 0) {
                value += " " + cmds.shift()
            }
            return ["QUOTE", value]
        } else if (value == "pos") {
            return ["QUOTE", turtle["x"] + " " + turtle["y"]]
        } else {
            format = "NUMBER"
        }
    }
    if (format == "NUMBER" || format == "INT") {
        var out = ["ERROR", "ERROR PARSING NUMBER"]
        var trig_functions = {
            "cos": Math.cos,
            "sin": Math.sin,
            "tan": Math.tan,
        }
        var atrig_functions = {
            "arccos": Math.acos,
            "arcsin": Math.asin,
            "arctan": Math.atan,
        }
        var functions = {
            "abs": Math.abs,
            "sqrt": Math.sqrt,
            "exp": Math.exp,
            "ln": Math.log,
        }
        for (var i = 0; i < commands.length; i++) {
            for (var j = 0; j < commands[i][0].length; j++) {
                if (value == commands[i][0][j]) {
                    value = commands[i][0][0]
                }
            }
        }
        if (value == "random") {
            var next = parse_arg(cmds, "INT", variables)
            if (next[0] == "ERROR") {
                return next
            }
            out = [format, Math.floor(Math.random() * next[1])]
        } else if (value == "heading") {
            out = [format, turtle["rotation"] * 180 / Math.PI]
            if (format == "INT") {
                out[1] = Math.floor(out[1])
            }
        } else if (value == "posx") {
            out = [format, turtle["x"]]
            if (format == "INT") {
                out[1] = Math.floor(out[1])
            }
        } else if (value == "posy") {
            out = [format, turtle["y"]]
            if (format == "INT") {
                out[1] = Math.floor(out[1])
            }
        } else if (value == "distance") {
            var next1 = parse_arg(cmds, "NUMBER", variables)
            var next2 = parse_arg(cmds, "NUMBER", variables)
            if (next1[0] == "ERROR") {
                return next1
            }
            if (next2[0] == "ERROR") {
                return next2
            }
            if (next1[1] < 0 || next1[1] > WIDTH) {
                return ["ERROR", "FIRST INPUT TO `distance` MUST BE BETWEEN 0 AND " + WIDTH]
            }
            if (next2[1] < 0 || next2[1] > HEIGHT) {
                return ["ERROR", "SECOND INPUT TO `distance` MUST BE BETWEEN 0 AND " + HEIGHT]
            }
            out = ["NUMBER", Math.sqrt(Math.pow(next1[1] - turtle["x"], 2) + Math.pow(next2[1] - turtle["y"], 2))]
        } else if (value == "quotient") {
            var next1 = parse_arg(cmds, "INT", variables)
            var next2 = parse_arg(cmds, "INT", variables)
            if (next1[0] == "ERROR") {
                return next1
            }
            if (next2[0] == "ERROR") {
                return next2
            }
            out = ["INT", Math.floor(next1[1] / next2[1])]
        } else if (value == "remainder") {
            var next1 = parse_arg(cmds, "INT", variables)
            var next2 = parse_arg(cmds, "INT", variables)
            if (next1[0] == "ERROR") {
                return next1
            }
            if (next2[0] == "ERROR") {
                return next2
            }
            out = ["INT", next1[1] % next2[1]]
        } else if (value == "sum") {
            var next1 = parse_arg(cmds, "NUMBER", variables)
            var next2 = parse_arg(cmds, "NUMBER", variables)
            if (next1[0] == "ERROR") {
                return next1
            }
            if (next2[0] == "ERROR") {
                return next2
            }
            out = ["NUMBER", next1[1] + next2[1]]
        } else if (value in trig_functions) {
            var next = parse_arg(cmds, "NUMBER", variables)
            if (next[0] == "ERROR") {
                return next
            }
            if (value == "tan" && (next[1] - 90) % 180 == 0) {
                return ["ERROR", "MATH DOMAIN ERROR"]
            }
            out = [format, trig_functions[value](next[1] * Math.PI / 180)]
        } else if (value in atrig_functions) {
            var next = parse_arg(cmds, "NUMBER", variables)
            if (next[0] == "ERROR") {
                return next
            }
            if ((value == "arccos" || value == "arcsin") && (next[1] > 1 || next[1] < -1)) {
                return ["ERROR", "MATH DOMAIN ERROR"]
            }
            out = [format, atrig_functions[value](next[1]) * 180 / Math.PI]
        } else if (value in functions) {
            var next = parse_arg(cmds, "NUMBER", variables)
            if (next[0] == "ERROR") {
                return next
            }
            out = [format, functions[value](next[1])]
        } else if (value == "repcount") {
            if ("!repcount" in variables) {
                out = [format, variables["!repcount"]]
            } else {
                return ["ERROR", "`repcount` MUST BE USED INSIDE A REPEAT LOOP"]
            }
        } else if (value[0] == ":") {
            var v = value.substr(1)
            if (v in variables) {
                out = [format, variables[v]]
            } else {
                return ["ERROR", "VARIABLE `:" + v + "` HAS NO VALUE"]
            }
        } else if (format == "NUMBER") {
            if(isNaN(value)) {
                return ["ERROR", "COULD NOT PARSE NUMBER `" + value + "`"]
            }
            out =  [format, value / 1]
        } else { // format == "INT"
            if(isNaN(value)) {
                return ["ERROR", "COULD NOT PARSE INTEGER `" + value + "`"]
            }
            if (value * 1 != Math.floor(value*1)) {
                return ["ERROR", "COULD NOT PARSE INTEGER `" + value + "`"]
            }
            out = [format, value * 1]
        }
        if (cmds.length > 0 && (cmds[0] == "+" || cmds[0] == "*" || cmds[0] == "/" || cmds[0] == "-")) {
            var op = cmds.shift()
            var next = parse_arg(cmds, format, variables)
            if (next[0] == "ERROR") {
                return next
            }
            if (op == "+") {
                return [format, out[1] + next[1]]
            }
            if (op == "-") {
                return [format, out[1] - next[1]]
            }
            if (op == "*") {
                return [format, out[1] * next[1]]
            }
            if (op == "/") {
                return [format, out[1] / next[1]]
            }
        }
        return out
    }
    if (format == "STRING") {
        value = value.toLowerCase()
        if(!value.match(/^[a-z_][a-z0-9_]*$/)) {
            return ["ERROR", "`" + value + "` IS AN INVALID NAME"]
        }
        return [format, value]
    } else if (format == "COLOR") {
        var col = [0, 0, 0]
        if (value[0] == "[") {
            var bracketed = value.substr(1)
            while (cmds.length >= 0) {
                if (bracketed[bracketed.length - 1] == "]" && (bracketed.match(/\[/g) || []).length + 1 == (bracketed.match(/\]/g) || []).length) {
                    bracketed = bracketed.substr(0, bracketed.length - 1)
                    break
                }
                if (cmds.length == 0) {break}
                bracketed += " " + cmds.shift()
            }
            if ((bracketed.match(/\[/g) || []).length != (bracketed.match(/\]/g) || []).length) {
                return ["ERROR", "INVALID SQUARE BRACKETS"]
            }
            bracketed = bracketed.substr(0, bracketed.length - 1).split(" ")
            var n0 = parse_arg(bracketed, "INT", variables)
            if (n0[0] == "ERROR") { return n0 }
            var n1 = parse_arg(bracketed, "INT", variables)
            if (n1[0] == "ERROR") { return n1 }
            var n2 = parse_arg(bracketed, "INT", variables)
            if (n2[0] == "ERROR") { return n2 }
            if (bracketed.length > 0) { return ["ERROR", "TOO MANY NUMBERS"] }
            col = [n0[1], n1[1], n2[1]]
        } else {
            cmds.unshift(value)
            var col_n = parse_arg(cmds, "INT", variables)
            if (col_n[0] == "ERROR") { return col_n }
            col_n = col_n[1]
            if (col_n >= 0 && col_n < builtin.length && col_n == Math.floor(col_n)) {
                col = builtin[col_n]
            } else { return ["ERROR", "INVALID COLOR `" + col_n + "`"] }
        }
        if (col[0] < 0 || col[0] > 255 || col[1] < 0 || col[1] > 255 || col[2] < 0 || col[2] > 255) {
            return ["ERROR", "RGB VALUES MUST BE BETWEEN 0 and 255"]
        }
        return ["COLOR", "#" + to_hex(col[0]) + to_hex(col[1]) + to_hex(col[2])]
    } else if (format == ":") {
        value = value.toLowerCase()
        if(!value.match(/^:[a-z_][a-z0-9_]*$/)) {
            return ["ERROR", "`" + value + "` IS AN INVALID NAME"]
        }
        return [format, value]
    } else if (format == "[]") {
        if (value[0] != "["){
            return ["ERROR", "INPUT TO COMMAND `" + cmd + "` NEEDS SQUARE BRACKETS"]
        }
        var bracketed = value.substr(1)
        while (cmds.length >= 0) {
            if (bracketed[bracketed.length - 1] == "]" && (bracketed.match(/\[/g) || []).length + 1 == (bracketed.match(/\]/g) || []).length) {
                bracketed = bracketed.substr(0, bracketed.length - 1)
                break
            }
            if (cmds.length == 0) {break}
            bracketed += " " + cmds.shift()
        }
        if ((bracketed.match(/\[/g) || []).length != (bracketed.match(/\]/g) || []).length) {
            return ["ERROR", "INPUT TO COMMAND `" + cmd + "` NEEDS SQUARE BRACKETS"]
        }
        return [format, bracketed.split(" ")]
    } else if (format == "?: ... END") {
        inputs = []
        while (value[0] == ":") {
            if(!value.match(/^:[a-z_][a-z0-9_]*$/)) {
                return ["ERROR", "`" + value + "` IS AN INVALID NAME"]
            }
            inputs.push(value.substr(1))
            value = cmds.shift()
        }
        var body = value
        while (value != "end" && cmds.length > 0) {
            value = cmds.shift()
            body += " " + value
        }
        if (value != "end") {
            return ["ERROR", "BODY OF SUBROUTINE MUST CONCLUDE WITH `end`"]
        }
        body = body.substr(0, body.length - 4)
        return [format, [inputs, body.split(" ")]]
    } else {
        return ["ERROR", "PARSING OF INPUT OF TYPE `" + format + "` NOT SUPPORTED"]
    }
}

function expand_commands(cmds, depth, variables) {
    if (cmds.length == 0) { return [] }
    if (depth > 50) { return [["ERROR", "MAXIMUM RECURSION DEPTH REACHED"]] }
    var args = []
    var cmd = cmds.shift()

    if (cmd in custom_commands) {
        for (var i = 0; i < custom_commands[cmd][0].length; i++) {
            args.push("NUMBER")
        }
    } else {
        for (var i = 0; i < commands.length; i++){
            for (var j = 0; j < commands[i][0].length; j++) {
                if (cmd == commands[i][0][j]) {
                    if (commands[i][4]) {
                        return [["ERROR", "COMMAND `" + cmd + "` MUST BE USED INSIDE ANOTHER COMMAND"]]
                    } else {
                        args = commands[i][3]
                        cmd = commands[i][0][0]
                    }
                }
            }
        }
    }

    if (args.length > cmds.length) {
        return [["ERROR", "WRONG NUMBER OF INPUTS FOR COMMAND `" + cmd + "`"]]
    }
    var c = [cmd]
    for (var i = 0; i < args.length; i++) {
        arg = parse_arg(cmds, args[i], variables)
        if (arg[0] == "ERROR") {
            return [arg]
        }
        c.push(arg[1])
    }

    var out = []
    if (c[0] == "repeat") {
        var new_variables = {}
        for (var v in global_variables) {
            new_variables[v] = global_variables[v]
        }
        for (var v in variables) {
            new_variables[v] = variables[v]
        }
        for (var j = 0; j < c[1]; j++) {
            new_variables["!repcount"] = j
            var repeat_me = [].concat(c[2])
            out = out.concat(expand_commands(repeat_me, depth + 1, new_variables))
        }
    } else if (c[0] in custom_commands) {
        var new_variables = {}
        for (var v in global_variables) {
            new_variables[v] = global_variables[v]
        }
        for (var v in variables) {
            new_variables[v] = variables[v]
        }
        for (var j = 0; j < custom_commands[c[0]][0].length; j++) {
            new_variables[custom_commands[c[0]][0][j]] = c[j+1]
        }
        var cc = []
        for (var i = 0; i < custom_commands[c[0]][1].length; i++) {
            cc.push(custom_commands[c[0]][1][i])
        }
        out = expand_commands(cc, depth + 1, new_variables)
    } else if (c[0] == "to") {
        if (is_command(c[1])) {
            return [["ERROR", "CANNOT OVERWRITE BUILT IN COMMAND `" + c[1] + "`"]]
        }
        custom_commands[c[1]] = c[2]
    } else {
        out.push(c)
    }
    return out.concat(expand_commands(cmds, depth, variables))
}

function to_hex(n) {
    var digits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9", "A", "B", "C", "D", "E", "F"]
    return digits[Math.floor(n / 16)] + digits[n % 16]
}

function run_command() {
    var infobox = document.getElementById("infobox")
    var inputbox = document.getElementById("inputbox")
    var command = inputbox.value
    command = command.split(";")[0]
    while (command[0] == " ") {
        command = command.substr(1)
    }
    while (command[command.length - 1] == " ") {
        command = command.substr(0, command.length - 1)
    }
    while (command.includes("  ")) {
        command = command.replaceAll("  ", " ")
    }
    if (command == "") {
        return
    }
    if (cmd_history[cmd_history.length - 1] != command) {
        cmd_history.push(command)
    }
    history_n = 0
    history_overwritten = {}
    if (infobox.innerHTML != "") {
        infobox.innerHTML += "\n"
    }
    infobox.innerHTML += command
    inputbox.value = ""
    var error = false
    var distance = 0
    var firecount = 0

    var cmds = expand_commands(command.toLowerCase().split(" "), 0, global_variables)

    for (var i = 0; i < cmds.length; i++) {
        var c = cmds[i]
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
        if (!running) {
            while (cmds.length > 0) {
                var c = cmds.shift()
                if (c[0] == "start" && !running) {
                    start_game()
                } else if (c[0] == "help" && !running) {
                    show_logohelp()
                } else if (lives == 0) {
                    infobox.innerHTML += "\n  CANNOT RUN COMMAND WHEN GAME NOT RUNNING. RUN `start` TO BEGIN"
                }
            }
        } else {
            while (cmds.length > 0) {
                var c = cmds.shift()
                if (c[0] == "fd") {
                    var old_x = turtle["x"]
                    var old_y = turtle["y"]
                    turtle["x"] += c[1] * Math.cos(turtle["rotation"])
                    turtle["y"] += c[1] * Math.sin(turtle["rotation"])
                    if (turtle["pd"]) {
                        make_line([old_x, old_y], [turtle["x"], turtle["y"]])
                    }
                    turtle_wrap()
                } else if (c[0] == "bk") {
                    var old_x = turtle["x"]
                    var old_y = turtle["y"]
                    turtle["x"] -= c[1] * Math.cos(turtle["rotation"])
                    turtle["y"] -= c[1] * Math.sin(turtle["rotation"])
                    if (turtle["pd"]) {
                        make_line([old_x, old_y], [turtle["x"], turtle["y"]])
                    }
                    turtle_wrap()
                } else if (c[0] == "home") {
                    if (turtle["pd"]) {
                        make_line([turtle["x"], turtle["y"]], [WIDTH/2, HEIGHT/2])
                    }
                    turtle["x"] = WIDTH/2
                    turtle["y"] = HEIGHT/2
                    turtle_wrap()
                } else if (c[0] == "rt") {
                    turtle["rotation"] += c[1] * Math.PI / 180
                    while (turtle["rotation"] > 2 * Math.PI) { turtle["rotation"] -= 2 * Math.PI}
                    while (turtle["rotation"] < 0) { turtle["rotation"] += 2 * Math.PI}
                } else if (c[0] == "lt") {
                    turtle["rotation"] -= c[1] * Math.PI / 180
                    while (turtle["rotation"] > 2 * Math.PI) { turtle["rotation"] -= 2 * Math.PI}
                    while (turtle["rotation"] < 0) { turtle["rotation"] += 2 * Math.PI}
                } else if (c[0] == "seth") {
                    if (c[1] >= 0 && c[1] <= 360) {
                        turtle["rotation"] = c[1] * Math.PI / 180
                    } else {
                        infobox.innerHTML += "\n  HEADING MUST BE SET TO A VALUE BETWEEN 0 AND 360"
                    }
                } else if (c[0] == "setbg") {
                    gameoptions["bg"] = c[1]
                } else if (c[0] == "setpc") {
                    gameoptions["pc"] = c[1]
                } else if (c[0] == "setpensize") {
                    if (c[1] < 0 || c[1] > 255) {
                        infobox.innerHTML += "\n  PENSIZE MUST BE BETWEEN 0 AND 255"
                    } else {
                        gameoptions["pensize"] = 0.2 + c[1] / 20
                    }
                } else if (c[0] == "towards") {
                    if (c[1] >= 0 && c[1] <= WIDTH && c[2] >= 0 && c[2] <= HEIGHT) {
                        turtle["rotation"] = Math.atan2(c[2] - turtle["y"], c[1] - turtle["x"])
                    }
                    if (c[1] < 0 || c[1] > WIDTH) {
                        infobox.innerHTML += "\n  X MUST BE A VALUE BETWEEN 0 AND " + WIDTH
                    }
                    if (c[2] < 0 || c[2] > HEIGHT) {
                        infobox.innerHTML += "\n  Y MUST BE A VALUE BETWEEN 0 AND " + HEIGHT
                    }
                } else if (c[0] == "setx") {
                    if (c[1] >= 0 && c[1] <= WIDTH) {
                        if (turtle["pd"]) {
                            make_line([turtle["x"], turtle["y"]], [c[1], turtle["y"]])
                        }
                        turtle["x"] = c[1]
                    } else {
                        infobox.innerHTML += "\n  X MUST BE SET TO A VALUE BETWEEN 0 AND " + WIDTH
                    }
                } else if (c[0] == "sety") {
                    if (c[1] >= 0 && c[1] <= HEIGHT) {
                        if (turtle["pd"]) {
                            make_line([turtle["x"], turtle["y"]], [turtle["x"], c[1]])
                        }
                        turtle["y"] = c[1]
                    } else {
                        infobox.innerHTML += "\n  Y MUST BE SET TO A VALUE BETWEEN 0 AND " + HEIGHT
                    }
                } else if (c[0] == "setxy") {
                    if (c[1] >= 0 && c[1] <= WIDTH && c[2] >= 0 && c[2] <= HEIGHT) {
                        if (turtle["pd"]) {
                            make_line([turtle["x"], turtle["y"]], [c[1], c[2]])
                        }
                        turtle["x"] = c[1]
                        turtle["y"] = c[2]
                    }
                    if (c[1] < 0 || c[1] > WIDTH) {
                        infobox.innerHTML += "\n  X MUST BE SET TO A VALUE BETWEEN 0 AND " + WIDTH
                    }
                    if (c[2] < 0 || c[2] > HEIGHT) {
                        infobox.innerHTML += "\n  Y MUST BE SET TO A VALUE BETWEEN 0 AND " + HEIGHT
                    }
                } else if (c[0] == "pu") {
                    turtle["pd"] = false
                } else if (c[0] == "pd") {
                    turtle["pd"] = true
                } else if (c[0] == "ht") {
                    turtle["st"] = false
                } else if (c[0] == "st") {
                    turtle["st"] = true
                } else if (c[0] == "cs") {
                    drawnlines = []
                } else if (c[0] == "print") {
                    infobox.innerHTML += "\n  " + c[1]
                } else if (c[0] == "pots") {
                    var list = ""
                    for (var f in custom_commands) {
                        if (list != "") { list += ", " }
                        list += f
                    }
                    infobox.innerHTML += "\n  " + list
                } else if (c[0] == "reset") {
                    drawnlines = []
                    turtle = {"x": WIDTH/2, "y": HEIGHT/2, "rotation": 0, "pd": true, "st": true}
                } else if (c[0] == "er") {
                    if (c[1] in custom_commands) {
                        delete custom_commands[c[1]]
                    } else {
                        infobox.innerHTML += "\n  CANNOT ERASE `" + c[1] + "` (DOES NOT EXIST)"
                    }
                } else if (c[0] == "make") {
                    global_variables[c[1].substr(1)] = c[2]
                } else if (c[0] == "erall") {
                    custom_commands = {}
                } else if (c[0] == "help") {
                    show_logohelp()
                } else if (c[0] == "fire") {
                    fires.push({"age": 40,"x": turtle["x"]+15*Math.cos(turtle["rotation"]),"y": turtle["y"]+15*Math.sin(turtle["rotation"]),"rotation": turtle["rotation"]})
                } else if (c[0] == "start") {
                    infobox.innerHTML += "\n  GAME ALREADY RUNNING"
                } else {
                    infobox.innerHTML += "\n  UNKNOWN COMMAND `" + c[0] + "`"
                }
            }
        }
    }

    infobox.scrollTop = infobox.scrollHeight
}

function turtle_wrap() {
    while (turtle["x"] > WIDTH) {
        turtle["x"] -= WIDTH
    }
    while (turtle["x"] < 0) {
        turtle["x"] += WIDTH
    }
    while (turtle["y"] > HEIGHT) {
        turtle["y"] -= HEIGHT
    }
    while (turtle["y"] < 0) {
        turtle["y"] += HEIGHT
    }
    while (turtle["rotation"] > 2*Math.PI) {
        turtle["rotation"] -= 2*Math.PI
    }
    while (turtle["rotation"] < 0) {
        turtle["rotation"] += 2*Math.PI
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
        drawnlines.push([start[0], start[1], end[0], end[1], 500, gameoptions["pc"], gameoptions["pensize"]])
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
    var canvas = document.getElementById("asteroids")
    var ctx = canvas.getContext("2d")
    ctx.fillStyle = gameoptions["bg"]
    ctx.fillRect(0,0,WIDTH,HEIGHT)

    for (var i = 0; i < drawnlines.length; i++) {
        var line = drawnlines[i]
        ctx.globalAlpha = Math.min(1, drawnlines[i][4] / 50)
        ctx.strokeStyle = drawnlines[i][5]
        ctx.lineWidth = drawnlines[i][6]
        ctx.beginPath()
        ctx.moveTo(line[0], line[1])
        ctx.lineTo(line[2], line[3])
        ctx.stroke()
    }

    ctx.globalAlpha = 1
    ctx.strokeStyle = "#FFFFFF"
    ctx.lineWidth = 2
    ctx.beginPath()
    if (lives > 0 && turtle["st"]) {
        add_lines(ctx, [
            [turtle["x"], turtle["y"]],
            [turtle["x"]+10*Math.cos(3*Math.PI/4+turtle["rotation"]),
             turtle["y"]+10*Math.sin(3*Math.PI/4+turtle["rotation"])],
            [turtle["x"]+15*Math.cos(turtle["rotation"]),
             turtle["y"]+15*Math.sin(turtle["rotation"])],
            [turtle["x"]+10*Math.cos(-3*Math.PI/4+turtle["rotation"]),
             turtle["y"]+10*Math.sin(-3*Math.PI/4+turtle["rotation"])],
            [turtle["x"], turtle["y"]]
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

    ctx.stroke()

    for (var i = 0; i < fires.length; i++) {
        var f = fires[i]
        ctx.strokeStyle = "#FFFFFF"
        ctx.globalAlpha = Math.min(1, f["age"] / 15)
        ctx.beginPath()
        add_lines(ctx, [[f["x"], f["y"]], [f["x"]+10*Math.cos(f["rotation"]), f["y"]+10*Math.sin(f["rotation"])]])
        ctx.stroke()
    }

    for (var i = 0; i < explosions.length; i++) {
        var e = explosions[i]
        ctx.strokeStyle = "#FFFFFF"
        ctx.globalAlpha = Math.min(1, e["age"] / 15)
        ctx.beginPath()
        add_lines(ctx, [[e["x"], e["y"]], [e["x"]+5/e["speed"]*Math.cos(e["rotation"]), e["y"]+5/e["speed"]*Math.sin(e["rotation"])]])
        ctx.stroke()
    }

    ctx.globalAlpha = 1
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
    interval = setInterval(tick,1000/60)
}

function gameover() {
    setTimeout(show_gameover, 1000)
}
function show_gameover() {
    end_game()
    var canvas = document.getElementById("asteroids")
    var ctx = canvas.getContext("2d")
    ctx.fillStyle = "#000000"
    ctx.fillRect(200,200,WIDTH-400,HEIGHT-350)

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
    turtle = {"x": WIDTH/2, "y": HEIGHT/2, "rotation": 0, "pd": true, "st": true}
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
        [turtle["x"], turtle["y"]],
        [turtle["x"]+10*Math.cos(3*Math.PI/4+turtle["rotation"]),
         turtle["y"]+10*Math.sin(3*Math.PI/4+turtle["rotation"])],
        [turtle["x"]+15*Math.cos(turtle["rotation"]),
         turtle["y"]+15*Math.sin(turtle["rotation"])],
        [turtle["x"]+10*Math.cos(-3*Math.PI/4+turtle["rotation"]),
         turtle["y"]+10*Math.sin(-3*Math.PI/4+turtle["rotation"])],
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
                    lives--
                    for (var k = 0; k < 20; k++) {
                        explosions.push({"x": turtle["x"], "y": turtle["y"], "rotation": Math.random()*Math.PI*2, "speed": 0.5 + 2 * Math.random(), "age": 50})
                    }
                    if (lives == 0) {
                        gameover()
                    } else {
                        var x = turtle["x"]
                        var y = turtle["y"]
                        var attempts = 0
                        while (too_close_any(x, y) && attempts < 50) {
                            x = 20 + Math.random() * (WIDTH - 40)
                            y = 20 + Math.random() * (HEIGHT - 40)
                            attempts++
                        }
                        turtle["x"] = x
                        turtle["y"] = y
                        turtle["speed"] = 0
                        turtle["rotation"] = Math.random() * 2 * Math.PI
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
        new_a = {"x": turtle["x"], "y": turtle["y"], "sides": 6,
                 "speed": 0.5+Math.random()*0.5, "rotation": Math.random()*Math.PI*2,
                 "direction": Math.random()*Math.PI*2}
        var attempts = 0
        while (too_close(new_a, turtle) && attempts < 50) {
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
    while (x < 0) {
        x += WIDTH
    }
    while (x > WIDTH) {
        x -= WIDTH
    }
    while (y < 0) {
        y += HEIGHT
    }
    while (y > HEIGHT) {
        y -= HEIGHT
    }
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
        var eps = more / 100
        return addsteroid(candidate[1]["x"] + eps*Math.cos(candidate[1]["direction"]), candidate[1]["y"] + eps*Math.sin(candidate[1]["direction"]), candidate[1]["direction"], more - eps)
    }
    if (new_x > WIDTH) {
        var edge_y = y + (WIDTH - x) * (new_y - y) / (new_x - x)
        if (edge_y >= 0 && edge_y <= HEIGHT) {
            var more = Math.sqrt(Math.pow(new_x-WIDTH, 2) + Math.pow(new_y-edge_y, 2))
            var eps = more / 100
            return addsteroid(eps*Math.cos(new_d), edge_y + eps*Math.sin(new_d), new_d, more - eps)
        }
    }
    if (new_x < 0) {
        var edge_y = y + - x * (new_y - y) / (new_x - x)
        if (edge_y >= 0 && edge_y <= HEIGHT) {
            var more = Math.sqrt(Math.pow(new_x, 2) + Math.pow(new_y-edge_y, 2))
            var eps = more / 100
            return addsteroid(WIDTH + eps*Math.cos(new_d), edge_y + eps*Math.sin(new_d), new_d, more - eps)
        }
    }
    if (new_y > HEIGHT) {
        var edge_x = x + (HEIGHT - y) * (new_x - x) / (new_y - y)
        if (edge_x >= 0 && edge_x <= WIDTH) {
            var more = Math.sqrt(Math.pow(new_x-edge_x, 2) + Math.pow(new_y-HEIGHT, 2))
            var eps = more / 100
            return addsteroid(edge_x + eps*Math.cos(new_d), eps*Math.sin(new_d), new_d, more - eps)
        }
    }
    if (new_y < 0) {
        var edge_x = x - y * (new_x - x) / (new_y - y)
        if (edge_x >= 0 && edge_x <= WIDTH) {
            var more = Math.sqrt(Math.pow(new_x-edge_x, 2) + Math.pow(new_y, 2))
            var eps = more / 100
            return addsteroid(edge_x + eps*Math.cos(new_d), HEIGHT + eps*Math.sin(new_d), new_d, more - eps)
        }
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

function is_command(c) {
    for (var i = 0; i < commands.length; i++) {
        for (var j = 0; j < commands[i][0]; j++) {
            if (c == commands[i][0][j]) {
                return true
            }
        }
    }
    return false
}

function show_logohelp() {
    var info = "<a href='javascript:hide_logohelp()'>Hide command help</a><br />"
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
    document.getElementById("logohelp").innerHTML = "<a href='javascript:show_logohelp()'>Show command help</a><br />"
}

function show_titlescreen() {
    document.getElementById("infobox").innerHTML = "Logo Asteroids. Created by Matthew Scroggs (mscroggs.co.uk)"
    var canvas = document.getElementById("asteroids")
    var ctx = canvas.getContext("2d")
    ctx.fillStyle = "#000000"
    ctx.fillRect(0,0,WIDTH,HEIGHT)

    ctx.font = "35px monospace"
    ctx.fillStyle = "#FFFFFF"
    ctx.textAlign = "center"
    ctx.fillText("LOGO ASTEROIDS", WIDTH/2, 100)
    ctx.font = "15px monospace"
    ctx.fillText("RUN COMMAND `start` TO BEGIN", WIDTH/2, 130)

    ctx.strokeStyle = "#FFFFFF"
    ctx.lineWidth = 2
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

    ctx.stroke()

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
    ctx.stroke()

    ctx.moveTo(x, y)
    for (var i = 1; i <= 360; i++) {
        var a = i * Math.PI/180
        rotated_lineTo(ctx, x, y, scale * 17 * Math.pow(Math.sin(2*a), 2) * Math.cos(a), scale * 17 * Math.pow(Math.sin(2*a), 2) * Math.sin(a), rot)
    }
    ctx.fill()
    ctx.stroke()

    ctx.beginPath()
    ctx.fillStyle="#A4442D"
    rotated_moveTo(ctx, x, y, scale * 15, 0, rot)
    for (var i = 1; i <= 360; i++) {
        rotated_lineTo(ctx, x, y, scale * 15 * Math.cos(i*Math.PI/180), scale * 10 * Math.sin(i*Math.PI/180), rot)
    }
    ctx.fill()
    ctx.stroke()

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
    ctx.stroke()
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
