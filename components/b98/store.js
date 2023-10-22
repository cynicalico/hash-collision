import {createContext, useReducer} from "react";

const initialRows = 25;
const initialCols = 80;

function Output() {
  this.buffer = "";

  this.outputInteger = function (ss) {
    let v = ss.pop();
    this._append(v);
    this._append(' ');
  }

  this.outputCharacter = function (ss) {
    let v = ss.pop();
    this._append(String.fromCodePoint(v));
  }

  this.clear = function () {
    this.buffer = "";
  }

  this._append = function (v) {
    this.buffer += v;
  }
}

function InstructionPointer(sr = 0, sc = 0) {
  this.r = sr;
  this.c = sc;
  this.dr = 0;
  this.dc = 1;

  this._wrap = function (fs) {
    if (fs.inBounds(this.r, this.c))
      return;

    this.reflect();
    while (!fs.inBounds(this.r, this.c))
      this._step();

    while (fs.inBounds(this.r, this.c))
      this._step();

    this.reflect();
    this._step();
  }

  this.reset = function() {
    this.r = 0;
    this.c = 0;
    this.dr = 0;
    this.dc = 1;
  }

  this._step = function (r, c) {
    this.r += this.dr;
    this.c += this.dc;
  }

  this.step = function (fs) {
    this._step();
    this._wrap(fs);
  }

  this.move = function (fs) {
    this.step(fs);
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
    this.dr = this.dc;
    this.dc = -dr;
  }

  this.turnLeft = function () {
    let dc = this.dc;
    this.dc = this.dr;
    this.dr = -dc;
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

  this.output = new Output();

  this.randint = function(min, max) {
    return Math.floor(Math.random() * (max - min) + min);
  }

  this.clear = function() {
    this.fs.clear();
    this.ss.clear();
    this.stringmode = false;
    this.ip.reset();
    this.output.clear();
  }

  this.tick = function() {
    return this.step();
  }

  this.step = function() {
    const inst = this.fs.get(this.ip.r, this.ip.c);

    if (this.stringmode) {
      if (inst === 34)
        this.stringmode = false;
      else
        this.ss.push(inst);

    } else if (!this.doInst(inst))
      return true;

    this.ip.move(this.fs);

    return false;
  }

  this.doInst = function(inst) {
    let shouldContinue = true;

    switch (inst) {
      case 32:        //   Space
        break;

      case 33:        // ! Logical Not
        this.ss.push((this.ss.pop() === 0) ? 1 : 0);
        break;

      case 34:        // " Toggle Stringmode
        this.stringmode = true;
        break;

      case 35:        // # Trampoline
        this.ip.step(this.fs);
        break;

      case 36:        // $ Pop
        this.ss.pop();
        break;

      case 37: {     // % Remainder
        let b = this.ss.pop();
        let a = this.ss.pop();
        this.ss.push((b === 0) ? 0 : a % b);
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
        let b = this.ss.pop();
        let a = this.ss.pop();
        this.ss.push(a * b);
      }
        break;

      case 43: {      // + Add
        let b = this.ss.pop();
        let a = this.ss.pop();
        this.ss.push(a + b);
      }
        break;

      case 44:        // , Output Character
        this.output.outputCharacter(this.ss);
        break;

      case 45: {      // - Subtract
        let b = this.ss.pop();
        let a = this.ss.pop();
        this.ss.push(a - b);
      }
        break;

      case 46:        // . Output Integer
        this.output.outputInteger(this.ss);
        break;

      case 47: {      // / Divide
        let b = this.ss.pop();
        let a = this.ss.pop();
        this.ss.push((b === 0) ? 0 : a / b);
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
        this.ss.push(inst - 48);
        break;

      case 58:        // : Duplicate
        this.ss.duplicate();
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
        switch (this.randint(0, 4)) {
          case 0: this.ip.goNorth(); break;
          case 1: this.ip.goEast(); break;
          case 2: this.ip.goSouth(); break;
          case 3: this.ip.goWest(); break;
        }
        break;

      case 64:        // @ Stop
        // this.running = false;
        // display.unsetCursor(this.ip.r, this.ip.c);
        shouldContinue = false;
        // this.finished = true;
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
        this.ss.swap();
        break;

      case 93:        // ] Turn Right/98/2D
        this.ip.turnRight();
        break;

      case 94:        // ^ Go North/2D
        this.ip.goNorth();
        break;

      case 95:        // _ East-West If/2D
        if (this.ss.pop() === 0) this.ip.goEast(); else this.ip.goWest();
        break;

      case 96: {      // ` Greater
        let b = this.ss.pop();
        let a = this.ss.pop();
        this.ss.push((a > b) ? 1 : 0);
      }
        break;

      case 97:        // a Push Ten/98
      case 98:        // b Push Eleven/98
      case 99:        // c Push Twelve/98
      case 100:       // d Push Thirteen/98
      case 101:       // e Push Fourteen/98
      case 102:       // f Push Fifteen/98
        this.ss.push(inst - 87);
        break;

      case 103: {     // g Get
        let y = this.ss.pop();
        let x = this.ss.pop();
        this.ss.push(this.fs.get(y, x));
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
        this.ss.clear();
        break;

      case 111:       // TODO: o Output File/98/f
        this.ip.reflect();
        break;

      case 112: {     // TODO: p Put
        let y = this.ss.pop();
        let x = this.ss.pop();
        let v = this.ss.pop();
        this.fs.put(y, x, v);
        // display.putRegionFromFungespace(0, 0);
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
        if (this.ss.pop() === 0) this.ip.goSouth(); else this.ip.goNorth();
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

const initialState = {
  // Fungespace display
  rows: initialRows,
  cols: initialCols,
  viewport: new Array(initialRows).fill(' ').map(() => new Array(initialCols).fill(' ')),

  cursor: [0, 0],

  tick: 0,
  running: false,

  stackstack: [[]],

  output: ''
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
          cursor: [action.inst.ip.r, action.inst.ip.c],
          viewport: new Array(state.rows).fill(' ').map(() => new Array(state.cols).fill(' ')),
          stackstack: action.inst.ss.stacks,
          output: action.inst.output.buffer
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
          stackstack: action.inst.ss.stacks,
          output: action.inst.output.buffer
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
