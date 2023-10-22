import {useContext, useRef} from 'react';
import {store} from "../../components/b98/store";
import styles from '../../styles/b98.module.css';

export default function Controls({ fungeInst }) {
  const {state, dispatch} = useContext(store);
  const hiddenFileInput = useRef(null);

  const handleChange = e => {
    const fileReader = new FileReader();
    const fileUploaded = e.target.files[0];

    fileReader.onload = ev => {
      fungeInst.current.fs.loadFileContents(ev.target.result);
      dispatch({type: 'loadFile', inst: fungeInst.current});
    };

    fileReader.readAsText(fileUploaded);
  }

  return <div className={`${styles.b98} ${styles.bf_controls}`}>
    <button className={`${styles.b98}`} onClick={() => hiddenFileInput.current.click()}>Load</button>
    <input type="file" onChange={handleChange} ref={hiddenFileInput} style={{display: 'none'}}/>
    <button className={`${styles.b98}`} onClick={() => {
      fungeInst.current.clear();
      dispatch({type: 'clear', inst: fungeInst.current});
    }}>Clear</button>
    <button className={`${styles.b98}`} onClick={() => {
      dispatch({type: state.running ? 'stop' : 'run'})
    }}>{state.running ? "Stop" : "Run"}</button>
    <hr className={styles.hr}/>
    <label className={styles.b98}>r: {state.cursor[0]}</label>
    <label className={styles.b98}>c: {state.cursor[1]}</label>
  </div>
}
