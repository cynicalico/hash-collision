import {Cousine} from 'next/font/google';
import {useContext, useRef} from 'react';
import {store} from "../../components/b98/store";
import styles from './b98.module.css';

const cousine = Cousine({weight: '700', subsets: ['latin']});

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

  return <div className={`${styles.b98} ${styles.base} ${cousine.className}`}>
    <button className={cousine.className} onClick={() => hiddenFileInput.current.click()}>Load</button>
    <input type="file" onChange={handleChange} ref={hiddenFileInput} style={{display: 'none'}}/>
    <button className={cousine.className} onClick={() => dispatch({type: 'clear'})}>Clear</button>
    <button className={cousine.className} onClick={() => {
      dispatch({type: state.running ? 'stop' : 'run'})
    }}>{state.running ? "Stop" : "Run"}</button>
  </div>
}
