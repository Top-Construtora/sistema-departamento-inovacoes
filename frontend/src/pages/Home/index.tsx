import styles from './styles.module.css';

export function Home() {
  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Sistema de Inovacoes</h1>
      <p className={styles.status}>OK</p>
    </div>
  );
}
