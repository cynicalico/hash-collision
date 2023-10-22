import {useContext, useEffect, useRef} from 'react';
import {cousine} from "../../styles/fonts";
import Fungespace from "../../components/b98/fungespace";
import Controls from "../../components/b98/controls";
import StackStack from "../../components/b98/stackstack";
import Output from "../../components/b98/output"
import {StateProvider, store, Funge98} from "../../components/b98/store";
import Layout from "../../components/layout";
import styles from '../../styles/b98.module.css';

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
      }, 0);
      return () => clearTimeout(timer);
    }
  }, [state.running, state.tick]);

  return <div className={`${styles.b98} ${styles.top_level} ${cousine.variable}`}>
    <div className={`${styles.b98} ${styles.container}`}>
      <Controls fungeInst={fungeInst}/>
      <hr className={styles.hr}/>
      <Fungespace/>
      <hr className={styles.hr}/>
      <label className={`${styles.b98} ${styles.bf_header}`}>Stack</label>
      <hr className={styles.hr}/>
      <StackStack/>
      <hr className={styles.hr}/>
      <label className={`${styles.b98} ${styles.bf_header}`}>Output</label>
      <hr className={styles.hr}/>
      <Output />
      <hr className={styles.hr}/>
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
