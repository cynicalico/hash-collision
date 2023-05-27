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

    putRegionFromFungespace: function (fs_r, fs_c, w, h) {
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

        state.ip.moveTo(0, 0);
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

        const region_w = Math.min(this.maxCoord[1], display.COLS);
        const region_h = Math.min(this.maxCoord[0], display.ROWS);
        display.putRegionFromFungespace(0, 0, region_w, region_h);
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

    clear: function (stack_idx = 0) {
        this.stacks[stack_idx].length = 0;
        display.stack.clear(stack_idx);
    }
}

let output = {
    div: document.getElementById("bf-output"),

    initialize: function () {},

    outputInteger: function () {
        let v = stack.pop();
        this._append(v);
        this._append(' ');
    },

    outputCharacter: function() {
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

    this.move = function () {
        display.unsetCursor(this.r, this.c);
        this.r += this.dr;
        this.c += this.dc;
        display.setCursor(this.r, this.c);
    }

    this.moveTo = function (r, c) {
        display.unsetCursor(this.r, this.c);
        this.r = r;
        this.c = c;
        display.setCursor(this.r, this.c);
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
    runTimeout: 250,

    ip: new InstructionPointer(),

    step: function () {
        const inst = fungespace.get(this.ip.r, this.ip.c);

        switch (inst) {
            case 32:        //   Space
                break;

            case 33:        // ! Logical Not
                this.ip.reflect();
                break;

            case 34:        // " Toggle Stringmode
                this.ip.reflect();
                break;

            case 35:        // # Trampoline
                this.ip.move();
                break;

            case 36:        // $ Pop
                this.ip.reflect();
                break;

            case 37:        // % Remainder
                this.ip.reflect();
                break;

            case 38:        // & Input Integer
                this.ip.reflect();
                break;

            case 39:        // ' Fetch Character/98
                this.ip.reflect();
                break;

            case 40:        // ( Load Semantics/98
                this.ip.reflect();
                break;

            case 41:        // ) Unload Semantics/98
                this.ip.reflect();
                break;

            case 42:        // * Multiply
                this.ip.reflect();
                break;

            case 43:        // + Add
                this.ip.reflect();
                break;

            case 44:        // , Output Character
                output.outputCharacter();
                break;

            case 45:        // - Subtract
                this.ip.reflect();
                break;

            case 46:        // . Output Integer
                output.outputInteger();
                break;

            case 47:        // / Divide
                this.ip.reflect();
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
                this.ip.reflect();
                break;

            case 59:        // ; Jump Over/98
                this.ip.reflect();
                break;

            case 60:        // < Go West
                this.ip.reflect();
                break;

            case 61:        // = Execute/98/f
                this.ip.reflect();
                break;

            case 62:        // > Go East
                this.ip.reflect();
                break;

            case 63:        // ? Go Away
                this.ip.reflect();
                break;

            case 64:        // @ Stop
                this.running = false;
                display.unsetCursor(this.ip.r, this.ip.c);
                return;

            case 65:        // A Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 66:        // B Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 67:        // C Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 68:        // D Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 69:        // E Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 70:        // F Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 71:        // G Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 72:        // H Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 73:        // I Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 74:        // J Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 75:        // K Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 76:        // L Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 77:        // M Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 78:        // N Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 79:        // O Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 80:        // P Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 81:        // Q Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 82:        // R Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 83:        // S Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 84:        // T Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 85:        // U Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 86:        // V Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 87:        // W Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 88:        // X Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 89:        // Y Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 90:        // Z Fingerprint-Defined/98
                this.ip.reflect();
                break;

            case 91:        // [ Turn Left/98/2D
                this.ip.reflect();
                break;

            case 92:        // \ Swap
                this.ip.reflect();
                break;

            case 93:        // ] Turn Right/98/2D
                this.ip.reflect();
                break;

            case 94:        // ^ Go North/2D
                this.ip.reflect();
                break;

            case 95:        // _ East-West If/2D
                this.ip.reflect();
                break;

            case 96:        // ` Greater
                this.ip.reflect();
                break;

            case 97:        // a Push Ten/98
            case 98:        // b Push Eleven/98
            case 99:        // c Push Twelve/98
            case 100:       // d Push Thirteen/98
            case 101:       // e Push Fourteen/98
            case 102:       // f Push Fifteen/98
                stack.push(inst - 87);
                break;

            case 103:       // g Get
                this.ip.reflect();
                break;

            case 104:       // h Go High/98/3D
                this.ip.reflect();
                break;

            case 105:       // i Input File/98/f
                this.ip.reflect();
                break;

            case 106:       // j Jump Forward/98
                this.ip.reflect();
                break;

            case 107:       // k Iterate/98
                this.ip.reflect();
                break;

            case 108:       // l Go Low/98/3D
                this.ip.reflect();
                break;

            case 109:       // m High-Low If/98/3D
                this.ip.reflect();
                break;

            case 110:       // n Clear Stack/98
                this.ip.reflect();
                break;

            case 111:       // o Output File/98/f
                this.ip.reflect();
                break;

            case 112:       // p Put
                this.ip.reflect();
                break;

            case 113:       // q Quit/98
                this.ip.reflect();
                break;

            case 114:       // r Reflect/98
                this.ip.reflect();
                break;

            case 115:       // s Store Character/98
                this.ip.reflect();
                break;

            case 116:       // t Split/98/c
                this.ip.reflect();
                break;

            case 117:       // u Stack Under Stack/98
                this.ip.reflect();
                break;

            case 118:       // v Go South
                this.ip.reflect();
                break;

            case 119:       // w Compare/98/2D
                this.ip.reflect();
                break;

            case 120:       // x Absolute Delta/98
                this.ip.reflect();
                break;

            case 121:       // y Get SysInfo/98
                this.ip.reflect();
                break;

            case 122:       // z No Operation/98
                this.ip.reflect();
                break;

            case 123:       // { Begin Block/98
                this.ip.reflect();
                break;

            case 124:       // | North-South If/2D
                this.ip.reflect();
                break;

            case 125:       // } End Block/98
                this.ip.reflect();
                break;

            case 126:       // ~ Input Character
                this.ip.reflect();
                break;

            default:
                this.ip.reflect();
        }

        this.ip.move();

        if (this.running)
            setTimeout(() => this.step(), this.runTimeout);
    }
}

document.getElementById("bf-i-file").addEventListener("change", (e) => {
    state.selectedFile = e.target.files[0];

    if (state.selectedFile === null) {
        console.log("Select a file first");
        return;
    }

    const rdr = new FileReader();
    rdr.addEventListener("load", (e) => {
        state.fileContents = e.target.result;
    });
    rdr.addEventListener("loadend", (e) => {
        fungespace.loadFileContents();
    });
    rdr.readAsText(state.selectedFile);
});

document.getElementById("bf-b-load").addEventListener("click", (e) => {
    document.getElementById("bf-i-file").click();
});

document.getElementById("bf-b-run-edit").addEventListener("click", (e) => {
    if (!state.running) {
        state.running = true;
        setTimeout(() => state.step());
    } else
        state.running = false;
});

document.getElementById("bf-b-reset").addEventListener("click", (e) => {
    state.reset();
    display.reset();
});

document.getElementById("bf-b-step").addEventListener("click", (e) => {
    setTimeout(() => state.step());
});

/********
 * MAIN *
 ********/

stack.initialize();
display.initialize();
