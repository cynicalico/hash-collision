"use strict";

function randInt(start, end) {
    return Math.floor(Math.random() * (end - start) + start);
}

let display = {
    ROWS: 25,
    COLS: 80,
    UNKNOWN: 191,

    cells: [],

    div: document.getElementById("bf-fungespace"),
    pre: null,

    iRow: document.getElementById("bf-i-row"),
    iCol: document.getElementById("bf-i-col"),
    iTickDelay: document.getElementById("bf-i-tick-delay"),
    iInstPerTick: document.getElementById("bf-i-inst-tick"),

    initialize: function () {
        this.pre = document.createElement("pre");
        this.div.append(this.pre);

        for (let r = 0; r < this.ROWS; r++) {
            this.pre.append(document.createElement("div"));
            this.cells.push([]);

            for (let c = 0; c < this.COLS; c++) {
                this.cells[r].push(document.createElement("span"));
                this.cells[r][c].classList.add('b98');
                this.put(r, c, String.fromCodePoint(fungespace.EMPTY));

                const d = document.createElement("div");
                d.append(this.cells[r][c]);

                this.pre.lastChild.append(d);
            }

            this.pre.append(document.createElement("hr"));
        }

        this.setCursor(state.ip.r, state.ip.c);

        this.iTickDelay.innerHTML = state.tickDelay;
        this.iInstPerTick.innerHTML = state.instPerTick;
    },

    get: function (r, c) {
        return this.cells[r][c].innerHTML;
    },

    put: function (r, c, v) {
        this.cells[r][c].innerHTML = v;
    },

    clear: function () {
        for (let r = 0; r < this.ROWS; r++)
            for (let c = 0; c < this.COLS; c++)
                this.put(r, c, String.fromCodePoint(fungespace.EMPTY));
    },

    setCursor: function (r, c) {
        this.cells[r][c].classList.add('cursor');
    },

    unsetCursor: function (r, c) {
        this.cells[r][c].classList.remove('cursor');
    },

    putRegionFromFungespace: function (fs_r, fs_c, w = null, h = null) {
        if (w === null)
            w = Math.min(fungespace.maxCoord[1], this.COLS);
        if (h === null)
            h = Math.min(fungespace.maxCoord[0], this.ROWS);

        this.clear();

        for (let r = 0; r < h; r++)
            for (let c = 0; c < w; c++) {
                let codepoint = fungespace.get(fs_r + r, fs_c + c);
                if (codepoint < 32 || codepoint > 127)
                    codepoint = 191;
                this.put(r, c, String.fromCodePoint(codepoint));
            }

        this.iRow.innerHTML = fs_r;
        this.iCol.innerHTML = fs_c;
    },

    stack: {
        div: document.getElementById("bf-stack"),
        stacks: [],

        new: function () {
            this.stacks.push(document.createElement("div"));
            const tl = document.createElement("div");
            tl.append(this.stacks[this.stacks.length - 1]);
            this.div.append(tl);
            this.div.append(document.createElement("hr"));
            this.push('&nbsp;', this.stacks.length - 1);
        },

        push: function (v, stack_idx = 0) {
            const s = document.createElement("span");
            s.innerHTML = v;
            this.stacks[stack_idx].append(s);
        },

        pop: function (stack_idx = 0) {
            if (this.stacks[stack_idx].childElementCount > 1)
                this.stacks[stack_idx].removeChild(this.stacks[stack_idx].lastChild);
        },

        clear: function (stack_idx = 0) {
            const node = this.stacks[stack_idx];
            while (node.firstChild)
                node.removeChild(node.lastChild);
        }
    }
}

let fungespace = {
    EMPTY: 32,

    /* Arrays to hold each quadrant of fungespace, which is a conceptually
     * infinite plane in all directions r in (-inf, inf), c in (-inf, inf)
     *
     *         ^
     *    nrnc | nrpc
     *   <-----+------>
     *    prnc | prpc
     *         v
     */
    prpc: [],
    nrpc: [],
    nrnc: [],
    prnc: [],

    // Updated as items are added into the space to avoid searching
    minCoord: [0, 0],
    maxCoord: [0, 0],

    _get: function (arr, r, c) {
        if (arr.length > r && arr[r].length > c)
            return arr[r][c];
        return this.EMPTY;
    },

    _put: function (arr, r, c, v) {
        while (arr.length <= r)
            arr.push([]);
        while (arr[r].length <= c)
            arr[r].push(this.EMPTY);
        arr[r][c] = v;
    },

    inBounds: function (r, c) {
        return r >= this.minCoord[0] && c >= this.minCoord[1] &&
            r < this.maxCoord[0] && c < this.maxCoord[1];
    },

    get: function (r, c) {
        if (!this.inBounds(r, c))
            return this.EMPTY;

        if (r >= 0) {
            if (c >= 0)
                return this._get(this.prpc, r, c);
            return this._get(this.prnc, r, Math.abs(c) - 1);
        } else {
            if (c >= 0)
                return this._get(this.nrpc, Math.abs(r) - 1, c);
            return this._get(this.nrnc, Math.abs(r) - 1, Math.abs(c) - 1);
        }
    },

    put: function (r, c, v) {
        if (r >= 0) {
            if (c >= 0)
                this._put(this.prpc, r, c, v);
            else
                this._put(this.prnc, Math.abs(c) - 1, v);
        } else {
            if (c >= 0)
                this._put(this.nrpc, Math.abs(r) - 1, c, v);
            else
                this._put(this.nrnc, Math.abs(r) - 1, Math.abs(c) - 1, v);
        }

        this.minCoord = [Math.min(this.minCoord[0], r), Math.min(this.minCoord[1], c)];
        this.maxCoord = [Math.max(this.maxCoord[0], r + 1), Math.max(this.maxCoord[1], c + 1)];
    },

    clear: function () {
        this.prpc = [];
        this.nrpc = [];
        this.nrnc = [];
        this.prnc = [];
        this.minCoord = [0, 0];
        this.maxCoord = [0, 0];
    },

    stringify: function () {
        let s = "";
        for (let r = this.minCoord[0]; r < this.maxCoord[0]; r++) {
            for (let c = this.minCoord[1]; c < this.maxCoord[1]; c++) {
                let v = this.get(r, c);
                s += String.fromCodePoint(v);
            }

            if (r < this.maxCoord[0] - 1)
                s += "\n";
        }

        return s;
    },

    loadFileContents: function () {
        this.clear();

        let r = 0, c = 0;
        for (const codepoint of state.fileContents) {
            if (codepoint === "\n") {
                r++;
                c = 0;
                continue;

            } else if (codepoint === "\r" || codepoint === "\x0c")
                continue;

            this.put(r, c, codepoint.codePointAt(0));
            c++;
        }

        display.putRegionFromFungespace(0, 0);
        state.ip.moveTo(0, 0);
    }
}

let stack = {
    stacks: [],

    initialize: function () {
        this.new();
    },

    new: function () {
        this.stacks.push([]);
        display.stack.new();
    },

    push: function (v, stack_idx = 0) {
        this.stacks[stack_idx].push(v);
        display.stack.push(v, stack_idx);
    },

    pop: function (stack_idx = 0) {
        const v = this.stacks[stack_idx].length > 0 ? this.stacks[stack_idx].pop() : 0;
        display.stack.pop(stack_idx);
        return v;
    },

    peek: function (stack_idx = 0) {
        return (this.stacks[stack_idx].length > 0) ? this.stacks[stack_idx][this.stacks[stack_idx].length - 1] : 0;
    },

    clear: function (stack_idx = 0) {
        this.stacks[stack_idx].length = 0;
        display.stack.clear(stack_idx);
    },

    duplicate: function (stack_idx = 0) {
        this.push(this.peek(stack_idx), stack_idx);
    },

    swap: function (stack_idx = 0) {
        let b = this.pop(stack_idx);
        let a = this.pop(stack_idx);
        this.push(b, stack_idx);
        this.push(a, stack_idx);
    }
}

let output = {
    div: document.getElementById("bf-output"),

    initialize: function () {
    },

    outputInteger: function () {
        let v = stack.pop();
        this._append(v);
        this._append(' ');
    },

    outputCharacter: function () {
        let v = stack.pop();
        this._append(String.fromCodePoint(v));
    },

    clear: function () {
        this.div.innerHTML = '';
    },

    _append: function (v) {
        this.div.innerHTML += v;
    },
}

function InstructionPointer(sr = 0, sc = 0) {
    this.r = sr;
    this.c = sc;
    this.dr = 0;
    this.dc = 1;

    this._wrap = function () {
        if (fungespace.inBounds(this.r, this.c))
            return;

        this.reflect();
        while (!fungespace.inBounds(this.r, this.c))
            this._step();

        while (fungespace.inBounds(this.r, this.c))
            this._step();

        this.reflect();
        this._step();
    }

    this._step = function (r, c) {
        this.r += this.dr;
        this.c += this.dc;
    }

    this.step = function () {
        this._step();
        this._wrap();
    }

    this.move = function () {
        this.step();
    }

    this.moveTo = function (r, c) {
        this.r = r;
        this.c = c;
    }

    this.goNorth = function () {
        this.dr = -1;
        this.dc = 0;
    }

    this.goEast = function () {
        this.dr = 0;
        this.dc = 1;
    }

    this.goSouth = function () {
        this.dr = 1;
        this.dc = 0;
    }

    this.goWest = function () {
        this.dr = 0;
        this.dc = -1;
    }

    this.turnRight = function () {
        let dr = this.dr;
        let dc = this.dc;
        this.dr = -dc;
        this.dc = dr;
    }

    this.turnLeft = function () {
        let dr = this.dr;
        let dc = this.dc;
        this.dr = dc;
        this.dc = -dr;
    }

    this.reflect = function () {
        this.dr *= -1;
        this.dc *= -1;
    }
}

let state = {
    selectedFile: null,
    fileContents: null,

    running: false,
    finished: false,
    tickDelay: 100,
    instPerTick: 1,

    ip: new InstructionPointer(),
    stringmode: false,

    tick: function () {
        if (this.finished)
            return;

        display.unsetCursor(this.ip.r, this.ip.c);

        for (let i = 0; i < this.instPerTick; i++) {
            this._step();
            if (this.finished)
                return;
        }

        display.setCursor(this.ip.r, this.ip.c);

        if (this.running)
            setTimeout(() => this.tick(), this.tickDelay);
    },

    _step: function () {
        const inst = fungespace.get(this.ip.r, this.ip.c);

        if (this.stringmode) {
            if (inst === 34)
                this.stringmode = false;
            else
                stack.push(inst);

        } else if (!this._doInst(inst))
            return false;

        this.ip.move();

        return true;
    },

    _doInst: function (inst) {
        let shouldContinue = true;

        switch (inst) {
            case 32:        //   Space
                break;

            case 33:        // ! Logical Not
                stack.push((stack.pop() === 0) ? 1 : 0);
                break;

            case 34:        // " Toggle Stringmode
                this.stringmode = true;
                break;

            case 35:        // # Trampoline
                this.ip.step(true);
                break;

            case 36:        // $ Pop
                stack.pop();
                break;

            case 37: {     // % Remainder
                let b = stack.pop();
                let a = stack.pop();
                stack.push((b === 0) ? 0 : a % b);
            }
                break;

            case 38:        // TODO: & Input Integer
                this.ip.reflect();
                break;

            case 39:        // TODO: ' Fetch Character/98
                this.ip.reflect();
                break;

            case 40:        // TODO: ( Load Semantics/98
                this.ip.reflect();
                break;

            case 41:        // TODO: ) Unload Semantics/98
                this.ip.reflect();
                break;

            case 42: {      // * Multiply
                let b = stack.pop();
                let a = stack.pop();
                stack.push(a * b);
            }
                break;

            case 43: {      // + Add
                let b = stack.pop();
                let a = stack.pop();
                stack.push(a + b);
            }
                break;

            case 44:        // , Output Character
                output.outputCharacter();
                break;

            case 45: {      // - Subtract
                let b = stack.pop();
                let a = stack.pop();
                stack.push(a - b);
            }
                break;

            case 46:        // . Output Integer
                output.outputInteger();
                break;

            case 47: {      // / Divide
                let b = stack.pop();
                let a = stack.pop();
                stack.push((b === 0) ? 0 : a / b);
            }
                break;

            case 48:        // 0 Push Zero
            case 49:        // 1 Push One
            case 50:        // 2 Push Two
            case 51:        // 3 Push Three
            case 52:        // 4 Push Four
            case 53:        // 5 Push Five
            case 54:        // 6 Push Six
            case 55:        // 7 Push Seven
            case 56:        // 8 Push Eight
            case 57:        // 9 Push Nine
                stack.push(inst - 48);
                break;

            case 58:        // : Duplicate
                stack.duplicate();
                break;

            case 59:        // TODO: ; Jump Over/98
                this.ip.reflect();
                break;

            case 60:        // < Go West
                this.ip.goWest();
                break;

            case 61:        // TODO: = Execute/98/f
                this.ip.reflect();
                break;

            case 62:        // > Go East
                this.ip.goEast();
                break;

            case 63:        // ? Go Away
                switch (randInt(0, 4)) {
                    case 0: this.ip.goNorth(); break;
                    case 1: this.ip.goEast(); break;
                    case 2: this.ip.goSouth(); break;
                    case 3: this.ip.goWest(); break;
                }
                break;

            case 64:        // @ Stop
                this.running = false;
                display.unsetCursor(this.ip.r, this.ip.c);
                shouldContinue = false;
                this.finished = true;
                break;

            case 65:        // TODO: A Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 66:        // TODO: B Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 67:        // TODO: C Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 68:        // TODO: D Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 69:        // TODO: E Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 70:        // TODO: F Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 71:        // TODO: G Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 72:        // TODO: H Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 73:        // TODO: I Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 74:        // TODO: J Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 75:        // TODO: K Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 76:        // TODO: L Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 77:        // TODO: M Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 78:        // TODO: N Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 79:        // TODO: O Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 80:        // TODO: P Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 81:        // TODO: Q Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 82:        // TODO: R Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 83:        // TODO: S Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 84:        // TODO: T Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 85:        // TODO: U Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 86:        // TODO: V Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 87:        // TODO: W Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 88:        // TODO: X Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 89:        // TODO: Y Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 90:        // TODO: Z Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 91:        // [ Turn Left/98/2D
                this.ip.turnLeft();
                break;

            case 92:        // \ Swap
                stack.swap();
                break;

            case 93:        // ] Turn Right/98/2D
                this.ip.turnRight();
                break;

            case 94:        // ^ Go North/2D
                this.ip.goNorth();
                break;

            case 95:        // _ East-West If/2D
                if (stack.pop() === 0) this.ip.goEast(); else this.ip.goWest();
                break;

            case 96: {      // ` Greater
                let b = stack.pop();
                let a = stack.pop();
                stack.push((a > b) ? 1 : 0);
            }
                break;

            case 97:        // a Push Ten/98
            case 98:        // b Push Eleven/98
            case 99:        // c Push Twelve/98
            case 100:       // d Push Thirteen/98
            case 101:       // e Push Fourteen/98
            case 102:       // f Push Fifteen/98
                stack.push(inst - 87);
                break;

            case 103: {     // g Get
                let y = stack.pop();
                let x = stack.pop();
                stack.push(fungespace.get(y, x));
            }
                break;

            case 104:       // TODO: h Go High/98/3D
                this.ip.reflect();
                break;

            case 105:       // TODO: i Input File/98/f
                this.ip.reflect();
                break;

            case 106:       // TODO: j Jump Forward/98
                this.ip.reflect();
                break;

            case 107:       // TODO: k Iterate/98
                this.ip.reflect();
                break;

            case 108:       // TODO: l Go Low/98/3D
                this.ip.reflect();
                break;

            case 109:       // TODO: m High-Low If/98/3D
                this.ip.reflect();
                break;

            case 110:       // n Clear Stack/98
                stack.clear();
                break;

            case 111:       // TODO: o Output File/98/f
                this.ip.reflect();
                break;

            case 112: {     // TODO: p Put
                let y = stack.pop();
                let x = stack.pop();
                let v = stack.pop();
                fungespace.put(y, x, v);
                display.putRegionFromFungespace(0, 0);
            }
                break;

            case 113:       // TODO: q Quit/98
                this.ip.reflect();
                break;

            case 114:       // r Reflect/98
                this.ip.reflect();
                break;

            case 115:       // TODO: s Store Character/98
                this.ip.reflect();
                break;

            case 116:       // TODO: t Split/98/c
                this.ip.reflect();
                break;

            case 117:       // TODO: u Stack Under Stack/98
                this.ip.reflect();
                break;

            case 118:       // v Go South
                this.ip.goSouth();
                break;

            case 119:       // TODO: w Compare/98/2D
                this.ip.reflect();
                break;

            case 120:       // TODO: x Absolute Delta/98
                this.ip.reflect();
                break;

            case 121:       // TODO: y Get SysInfo/98
                this.ip.reflect();
                break;

            case 122:       // z No Operation/98
                break;

            case 123:       // TODO: { Begin Block/98
                this.ip.reflect();
                break;

            case 124:       // | North-South If/2D
                if (stack.pop() === 0) this.ip.goSouth(); else this.ip.goNorth();
                break;

            case 125:       // TODO: } End Block/98
                this.ip.reflect();
                break;

            case 126:       // TODO: ~ Input Character
                this.ip.reflect();
                break;

            default:
                this.ip.reflect();
        }

        return shouldContinue;
    }
}

document.getElementById("bf-i-file").addEventListener("change", e => {
    state.selectedFile = e.target.files[0];

    if (state.selectedFile === null) {
        console.log("Select a file first");
        return;
    }

    const rdr = new FileReader();
    rdr.addEventListener("load", e => {
        state.fileContents = e.target.result;
    });
    rdr.addEventListener("loadend", e => {
        fungespace.loadFileContents();
    });
    rdr.readAsText(state.selectedFile);
});

document.getElementById("bf-b-load").addEventListener("click", e => {
    document.getElementById("bf-i-file").click();
});

document.getElementById("bf-b-run-edit").addEventListener("click", e => {
    if (!state.running) {
        state.running = true;
        setTimeout(() => state.tick());
    } else
        state.running = false;
});

document.getElementById("bf-b-reset").addEventListener("click", e => {
    state.reset();
    display.reset();
});

document.getElementById("bf-b-step").addEventListener("click", e => {
    setTimeout(() => state.tick());
});

document.getElementById("bf-i-tick-delay").addEventListener("input", e => {
    const v = parseInt(e.target.innerText);
    if (!isNaN(v))
        state.tickDelay = v;
});

document.getElementById("bf-i-inst-tick").addEventListener("input", e => {
    const v = parseInt(e.target.innerText);
    if (!isNaN(v))
        state.instPerTick = v;
});

document.querySelectorAll(".bf-inp").forEach(el => {
    el.addEventListener("keydown", function(e) {
        if (e.keyCode === 13) {
            e.preventDefault();
            e.stopPropagation();
        }
    });

    el.addEventListener("paste", function(e) {
        e.preventDefault();
        let text = "";
        if (e.clipboardData && e.clipboardData.getData) {
            text = e.clipboardData.getData("text/plain");
        } else if (window.clipboardData && window.clipboardData.getData) {
            text = window.clipboardData.getData("Text");
        }
        document.execCommand("insertText", false, text);
    });
});

/********
 * MAIN *
 ********/

stack.initialize();
display.initialize();
