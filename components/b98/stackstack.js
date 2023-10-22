import {Fragment, useContext} from 'react';
import {store} from "../../components/b98/store";
import styles from '../../styles/b98.module.css';

export default function StackStack() {
  const {state} = useContext(store);

  return <div className={`${styles.b98} ${styles.bf_stack}`}>
    {state.stackstack.map((e, i) => (<Fragment key={`stack${i}`}>
      <div><div>{e.map((v) => (<span>{v}</span>))} &nbsp;</div></div>
      <hr className={styles.hr}/>
    </Fragment>))}
  </div>
}
