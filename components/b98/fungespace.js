import {Fragment, useContext} from 'react';
import {store} from "../../components/b98/store";
import styles from '../../styles/b98.module.css';

export default function Fungespace() {
  const {state} = useContext(store);

  return <div className={`${styles.b98} ${styles.base}`}>
    <pre className={styles.base2}>
      {state.viewport.map((_, r) => (<Fragment key={`fragment${r}`}>
        <div className={styles.row} key={`row${r}`}>
          {state.viewport[r].map((_, c) => (<div className={styles.cell} key={`col${r}${c}`}>
            <span
              className={`${state.cursor[0] === r && state.cursor[1] === c ? styles.cursor : ''} ${styles.b98}`}
              key={`span${r}${c}`}>
              {state.viewport[r][c]}
            </span>
          </div>))}
        </div>
        <hr className={styles.hr} key={`hr${r}`}/>
      </Fragment>))}
    </pre>
  </div>
}
