"use strict";

function randint(start, end) {
    return Math.floor(Math.random() * (end - start) + start);
}

let display = {
    ROWS: 25,
    COLS: 80,
    UNKNOWN: 191,

    cells: [],

    div: document.getElementById("bf-fungespace"),
    pre: null,

    i_row: document.getElementById("bf-i-row"),
    i_col: document.getElementById("bf-i-col"),

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

    set_cursor: function (r, c) {
        this.cells[r][c].classList.add('cursor');
    },

    unset_cursor: function (r, c) {
        this.cells[r][c].classList.remove('cursor');
    },

    put_region_from_fungespace: function (fs_r, fs_c, w, h) {
        this.clear();

        for (let r = 0; r < h; r++)
            for (let c = 0; c < w; c++) {
                let codepoint = fungespace.get(fs_r + r, fs_c + c);
                if (codepoint < 32 || codepoint > 127)
                    codepoint = 191;
                this.put(r, c, String.fromCodePoint(codepoint));
            }

        this.i_row.innerHTML = fs_r;
        this.i_col.innerHTML = fs_c;
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
    min_coord: [0, 0],
    max_coord: [0, 0],

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

    in_bounds: function (r, c) {
        return r >= this.min_coord[0] && c >= this.min_coord[1] &&
            r < this.max_coord[0] && c < this.max_coord[1];
    },

    get: function (r, c) {
        if (!this.in_bounds(r, c))
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

        this.min_coord = [Math.min(this.min_coord[0], r), Math.min(this.min_coord[1], c)];
        this.max_coord = [Math.max(this.max_coord[0], r + 1), Math.max(this.max_coord[1], c + 1)];
    },

    clear: function () {
        this.prpc = [];
        this.nrpc = [];
        this.nrnc = [];
        this.prnc = [];
        this.min_coord = [0, 0];
        this.max_coord = [0, 0];
    },

    stringify: function () {
        let s = "";
        for (let r = this.min_coord[0]; r < this.max_coord[0]; r++) {
            for (let c = this.min_coord[1]; c < this.max_coord[1]; c++) {
                let v = this.get(r, c);
                s += String.fromCodePoint(v);
            }

            if (r < this.max_coord[0] - 1)
                s += "\n";
        }

        return s;
    },

    load_file_contents: function () {
        this.clear();

        let r = 0, c = 0;
        for (const codepoint of state.file_contents) {
            if (codepoint === "\n") {
                r++;
                c = 0;
                continue;

            } else if (codepoint === "\r" || codepoint === "\x0c")
                continue;

            this.put(r, c, codepoint.codePointAt(0));
            c++;
        }

        const region_w = Math.min(this.max_coord[1], display.COLS);
        const region_h = Math.min(this.max_coord[0], display.ROWS);
        display.put_region_from_fungespace(0, 0, region_w, region_h);
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

let state = {
    selected_file: null,
    file_contents: null,
}

document.getElementById("bf-i-file").addEventListener("change", (e) => {
    state.selected_file = e.target.files[0];

    if (state.selected_file === null) {
        console.log("Select a file first");
        return;
    }

    const rdr = new FileReader();
    rdr.addEventListener("load", (e) => {
        state.file_contents = e.target.result;
    });
    rdr.addEventListener("loadend", (e) => {
        fungespace.load_file_contents();
    });
    rdr.readAsText(state.selected_file);
});

document.getElementById("bf-b-load").addEventListener("click", (e) => {
    document.getElementById("bf-i-file").click();
});

/********
 * MAIN *
 ********/

stack.initialize();
display.initialize();
