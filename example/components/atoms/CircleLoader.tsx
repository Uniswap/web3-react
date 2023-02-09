import { CSSProperties } from 'react'

import styles from '../../css/animations.module.css'

export default function CircleLoader({ style }: { style?: CSSProperties }) {
  return <div className={styles.spinner} style={style} />
}
