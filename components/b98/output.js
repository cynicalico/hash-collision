import {Fragment, useContext} from 'react';
import {store} from "../../components/b98/store";
import styles from '../../styles/b98.module.css';

export default function Output() {
  const {state} = useContext(store);

  return <div className={`${styles.b98} ${styles.bf_output_container}`}>
    <div className={`${styles.b98} ${styles.bf_output}`} contentEditable={true}>{state.output}</div>
  </div>
}
