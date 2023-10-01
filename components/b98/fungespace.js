import { Cousine } from 'next/font/google';
import { useContext } from 'react';
import { store } from "../../components/b98/store";
import styles from './fungespace.module.css';

const cousine = Cousine({ weight: '700', subsets: ['latin'] });

export function Fungespace() {
  const { state, dispatch } = useContext(store);

  return <div className={`${styles.b98} ${styles.base} ${cousine.className}`}>
    <pre className={styles.base2}>
      {Array(state.rows).fill(0).map((_, r) => (
        <>
          <div className={styles.row} key={`row${r}`}>
            {Array(state.cols).fill(0).map((_, c) => (
              <div className={styles.cell} key={`col${r}${c}`}>
                <span className={`${state.cursor[0] == r && state.cursor[1] == c ? styles.cursor : ''} ${styles.b98}`}>
                  {state.cells[r][c]}
                </span>
              </div>
            ))}
          </div>
          <hr className={styles.hr} key={`hr${r}`} />
        </>
      ))}
    </pre>
  </div>
}
