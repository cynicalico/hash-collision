import { useContext, useEffect } from 'react';
import * as fs from "../../components/b98/fungespace";
import { StateProvider, store } from "../../components/b98/store";
import Layout from "../../components/layout";
import styles from './b98.module.css';

function randint(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function B98Layout() {
  const { state, dispatch } = useContext(store);

  useEffect(() => {
    if (!state.counting)
      return;
    const id = setTimeout(() => {
      dispatch({ type: 'incrementCounter' });
      dispatch({ type: 'setCell', r: randint(0, state.rows), c: randint(0, state.cols), v: randint(0, 10) });
    });
    return () => clearTimeout(id);
  }, [state]);

  return <div>
    <div className={`${styles.b98} ${styles.top_level}`}>
      <div className={`${styles.b98} ${styles.container}`}>
        <fs.Fungespace />
      </div>
    </div>
    <button onClick={() => dispatch({ type: 'setCursor', v: [randint(0, state.rows), randint(0, state.cols)] })}>Move cursor</button>
    <button onClick={() => dispatch({ type: 'setCell', r: randint(0, state.rows), c: randint(0, state.cols), v: randint(0, 10) })}>Random cell</button>
    <br />
    <br />

    {state.counter}
    <br />
    <button onClick={() => {
      dispatch({ type: 'startCounting' });
    }}>Start</button>
    <button onClick={() => {
      dispatch({ type: 'stopCounting' });
    }}>Stop</button>
    <br />
    <br />
  </div>;
}

export default function App() {
  return (
    <Layout>
      <StateProvider>
        <B98Layout />
      </StateProvider>
    </Layout>
  );
}
