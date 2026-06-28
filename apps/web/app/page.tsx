import styles from "./page.module.css";

type HealthResponse = {
  status: string;
  database: string;
};

async function fetchHealth(): Promise<
  { ok: true; data: HealthResponse } | { ok: false; error: string }
> {
  const apiUrl = process.env.API_URL ?? "http://localhost:4000";

  try {
    const response = await fetch(`${apiUrl}/health`, { cache: "no-store" });

    if (!response.ok) {
      return { ok: false, error: `HTTP ${response.status}` };
    }

    const data = (await response.json()) as HealthResponse;
    return { ok: true, data };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return { ok: false, error: message };
  }
}

export default async function Home() {
  const health = await fetchHealth();

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <h1 className={styles.title}>Resume Builder</h1>
        <p className={styles.subtitle}>Stage 0 — infrastructure smoke test</p>

        <section className={styles.statusCard}>
          <h2 className={styles.statusTitle}>API health</h2>
          {health.ok ? (
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
