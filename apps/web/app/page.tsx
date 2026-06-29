'use client';

import { useEffect, useState } from 'react';
import styles from './page.module.css';

type HealthResponse = {
  status: string;
  database: string;
};

type HealthState =
  | { status: 'loading' }
  | { status: 'ok'; data: HealthResponse }
  | { status: 'error'; error: string };

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

export default function Home() {
  const [health, setHealth] = useState<HealthState>({ status: 'loading' });

  useEffect(() => {
    let cancelled = false;

    async function fetchHealth() {
      try {
        const response = await fetch(`${apiUrl}/health`);

        if (!response.ok) {
          if (!cancelled) {
            setHealth({ status: 'error', error: `HTTP ${response.status}` });
          }
          return;
        }

        const data = (await response.json()) as HealthResponse;
        if (!cancelled) {
          setHealth({ status: 'ok', data });
        }
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'Unknown error';
        if (!cancelled) {
          setHealth({ status: 'error', error: message });
        }
      }
    }

    void fetchHealth();

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Resume Builder</h1>
        <p className={styles.subtitle}>Stage 0 — infrastructure smoke test</p>

        <section className={styles.statusCard}>
          <h2 className={styles.statusTitle}>API health</h2>
          {health.status === 'loading' ? (
            <p className={styles.statusError}>Loading…</p>
          ) : health.status === 'ok' ? (
            <ul className={styles.statusList}>
              <li>
                <span
                  className={`${styles.badge} ${styles.badgeOk}`}
                  aria-hidden
                />
                API: {health.data.status}
              </li>
              <li>
                <span
                  className={`${styles.badge} ${styles.badgeOk}`}
                  aria-hidden
                />
                Database: {health.data.database}
              </li>
            </ul>
          ) : (
            <p className={styles.statusError}>
              <span
                className={`${styles.badge} ${styles.badgeError}`}
                aria-hidden
              />
              {health.error}
            </p>
          )}
        </section>
      </main>
    </div>
  );
}
