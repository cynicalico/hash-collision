import { createContext, useReducer } from "react";

const initialRows = 25;
const initialCols = 25;

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

  // stringify: function () {
  //     let s = "";
  //     for (let r = this.minCoord[0]; r < this.maxCoord[0]; r++) {
  //         for (let c = this.minCoord[1]; c < this.maxCoord[1]; c++) {
  //             let v = this.get(r, c);
  //             s += String.fromCodePoint(v);
  //         }

  //         if (r < this.maxCoord[0] - 1)
  //             s += "\n";
  //     }

  //     return s;
  // },

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

const initialState = {
  // Fungespace display
  cursor: [0, 0],
  rows: initialRows,
  cols: initialCols,
  cells: new Array(initialRows).fill(' ').map(() => new Array(initialCols).fill(' ')),

  counter: 0,
  counting: false
};

const store = createContext(initialState);
const { Provider } = store;

const StateProvider = ({ children }) => {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'reset':
        return {
          ...state,
          cells: new Array(state.rows).fill(' ').map(() => new Array(state.cols).fill(' '))
        }
  
      case 'setCursor':
        return {
          ...state,
          cursor: action.v,
        };
  
      case 'setCounter':
        return {
          ...state,
          counter: action.v
        };
  
      case 'startCounting':
        return {
          ...state,
          counter: 0,
          counting: true
        };
  
      case 'stopCounting':
        return {
          ...state,
          counting: false
        };
  
      case 'incrementCounter':
        return {
          ...state,
          counter: state.counter + 1,
        };
  
      case 'setCell':
        fungespace.put(action.r, action.c, action.v);

        return {
          ...state,
          cells: state.cells.map((row, r) => {
            return row.map((e, c) => {
              return String.fromCodePoint(fungespace.get(r, c));
            })
          }),
        }
  
      default:
        throw new Error();
    }
  }, initialState);

  return <Provider value={{ state, dispatch }}>{children}</Provider>;
};

export { store, StateProvider };
