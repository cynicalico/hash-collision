import {createContext, useReducer} from "react";

const initialRows = 25;
const initialCols = 80;

function InstructionPointer(sr = 0, sc = 0) {
  this.r = sr;
  this.c = sc;
  this.dr = 0;
  this.dc = 1;

  this._wrap = function () {
    if (fungespace.inBounds(this.r, this.c))
      return;

    console.log("in wrap");

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
    // this._wrap();
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

function Fungespace() {
  this.EMPTY = 32;

  /* Arrays to hold each quadrant of fungespace, which is a conceptually
   * infinite plane in all directions r in (-inf, inf), c in (-inf, inf)
   *
   *         ^
   *    nrnc | nrpc
   *   <-----+------>
   *    prnc | prpc
   *         v
   */
  this.prpc = [];
  this.nrpc = [];
  this.nrnc = [];
  this.prnc = [];

  // Updated as items are added into the space to avoid searching
  this.minCoord = [0, 0];
  this.maxCoord = [0, 0];

  this._get = function (arr, r, c) {
    if (arr.length > r && arr[r].length > c) return arr[r][c];
    return this.EMPTY;
  }

  this._put = function (arr, r, c, v) {
    while (arr.length <= r) arr.push([]);
    while (arr[r].length <= c) arr[r].push(this.EMPTY);
    arr[r][c] = v;
  }

  this.inBounds = function (r, c) {
    return r >= this.minCoord[0] && c >= this.minCoord[1] && r < this.maxCoord[0] && c < this.maxCoord[1];
  }

  this.get = function (r, c) {
    if (!this.inBounds(r, c)) return this.EMPTY;

    if (r >= 0) {
      if (c >= 0) return this._get(this.prpc, r, c);
      return this._get(this.prnc, r, Math.abs(c) - 1);
    } else {
      if (c >= 0) return this._get(this.nrpc, Math.abs(r) - 1, c);
      return this._get(this.nrnc, Math.abs(r) - 1, Math.abs(c) - 1);
    }
  }

  this.put = function (r, c, v) {
    if (r >= 0) {
      if (c >= 0) this._put(this.prpc, r, c, v); else this._put(this.prnc, Math.abs(c) - 1, v);
    } else {
      if (c >= 0) this._put(this.nrpc, Math.abs(r) - 1, c, v); else this._put(this.nrnc, Math.abs(r) - 1, Math.abs(c) - 1, v);
    }

    this.minCoord = [Math.min(this.minCoord[0], r), Math.min(this.minCoord[1], c)];
    this.maxCoord = [Math.max(this.maxCoord[0], r + 1), Math.max(this.maxCoord[1], c + 1)];
  }

  this.clear = function () {
    this.prpc = [];
    this.nrpc = [];
    this.nrnc = [];
    this.prnc = [];
    this.minCoord = [0, 0];
    this.maxCoord = [0, 0];
  }

  this.loadFileContents = function (fileContents) {
    this.clear();

    let r = 0, c = 0;
    for (const codepoint of fileContents) {
      if (codepoint === "\n") {
        r++;
        c = 0;
        continue;

      } else if (codepoint === "\r" || codepoint === "\x0c") continue;

      this.put(r, c, codepoint.codePointAt(0));
      c++;
    }
  }

  this.updateViewport = function (viewport, sr, sc) {
    return viewport.map((row, r) => {
      return row.map((_, c) => {
        return String.fromCodePoint(this.get(sr + r, sc + c));
      })
    });
  }
}

function StackStack() {
  this.stacks = [[]];

  this.new = function () {
    this.stacks.push([]);
  }

  this.push = function (v, stack_idx = 0) {
    this.stacks[stack_idx].push(v);
  }

  this.pop = function (stack_idx = 0) {
    return this.stacks[stack_idx].length > 0 ? this.stacks[stack_idx].pop() : 0;
  }

  this.peek = function (stack_idx = 0) {
    return (this.stacks[stack_idx].length > 0) ? this.stacks[stack_idx][this.stacks[stack_idx].length - 1] : 0;
  }

  this.clear = function (stack_idx = 0) {
    this.stacks[stack_idx].length = 0;
  }

  this.duplicate = function (stack_idx = 0) {
    this.push(this.peek(stack_idx), stack_idx);
  }

  this.swap = function (stack_idx = 0) {
    let b = this.pop(stack_idx);
    let a = this.pop(stack_idx);
    this.push(b, stack_idx);
    this.push(a, stack_idx);
  }
}

function Funge98() {
  this.fs = new Fungespace();
  this.ss = new StackStack();

  this.stringmode = false;
  this.ip = new InstructionPointer();

  this.tick = function() {
    return this.step();
  }

  this.step = function() {
    const inst = this.fs.get(this.ip.r, this.ip.c);
    // console.log(`instruction: ${String.fromCodePoint(inst)}`);
    this.ip.move();

    return false;
  }

  this.doInst = function(inst) {

  }
}

const initialState = {
  // Fungespace display
  rows: initialRows,
  cols: initialCols,
  viewport: new Array(initialRows).fill(' ').map(() => new Array(initialCols).fill(' ')),

  cursor: [0, 0],

  tick: 0,
  running: false
};

const store = createContext(initialState);
const {Provider} = store;

const StateProvider = ({children}) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'clear':
        return {
          ...state,
          tick: 0,
          running: false,
          cursor: [0, 0],
          viewport: new Array(state.rows).fill(' ').map(() => new Array(state.cols).fill(' ')),
        }

      case 'setCursor':
        return {
          ...state, cursor: action.v,
        };

      case 'run':
        return {
          ...state, tick: 0, running: true
        };

      case 'stop':
        return {
          ...state, running: false
        };

      case 'tick':
        return {
          ...state,
          tick: state.tick + 1,
          running: !action.shouldStop,
          cursor: [action.inst.ip.r, action.inst.ip.c],
          viewport: action.inst.fs.updateViewport(state.viewport, 0, 0),
        }

      case 'loadFile':
        return {
          ...state,
          cursor: [0, 0], viewport: action.inst.fs.updateViewport(state.viewport, 0, 0),
        }

      default:
        throw new Error();
    }
  }, initialState);

  return <Provider value={{state, dispatch}}>{children}</Provider>;
};

export {store, StateProvider, Funge98};
