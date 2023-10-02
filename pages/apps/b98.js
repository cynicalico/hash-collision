import {useContext, useEffect, useRef} from 'react';
import Fungespace from "../../components/b98/fungespace";
import Controls from "../../components/b98/controls";
import {StateProvider, store, Funge98} from "../../components/b98/store";
import Layout from "../../components/layout";
import styles from '../../components/b98/b98.module.css';

function randint(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

function B98Layout() {
  const {state, dispatch} = useContext(store);
  const fungeInst = useRef(new Funge98());

  useEffect(() => {
    if (state.running) {
      const timer = setTimeout(() => {
        const shouldStop = fungeInst.current.tick();
        dispatch({type: 'tick', inst: fungeInst.current, shouldStop: shouldStop});
      }, 250);
      return () => clearTimeout(timer);
    }
  }, [state.running, state.tick]);

  return <div className={`${styles.b98} ${styles.top_level}`}>
    <div className={`${styles.b98} ${styles.container}`}>
      <Controls fungeInst={fungeInst}/>
      <Fungespace/>
      {state.tick}<br />
      {state.running ? "true" : "false"}
    </div>
  </div>;
}

export default function App() {
  return (<Layout>
    <StateProvider>
      <B98Layout/>
    </StateProvider>
  </Layout>);
}
