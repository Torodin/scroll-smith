import { useCallback, useEffect, useState } from "react";
import type {
  BackgroundOption,
  Character,
  DashboardData,
  NamedOption,
  SpeciesOption,
} from "./core/types";
import CharacterCreation from "./components/CharacterCreation";
import type { CharacterCreationInput } from "./components/CharacterCreation";
import CharacterDetail from "./components/CharacterDetail";
import Dashboard from "./components/Dashboard";
import "./App.css";

type Page = { name: "dashboard" } | { name: "create" } | { name: "detail"; characterId: number };

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

function fetchDashboardData(): Promise<DashboardData> {
  return Promise.all([
    request<Character[]>("/characters"),
    request<SpeciesOption[]>("/species"),
    request<BackgroundOption[]>("/backgrounds"),
    request<NamedOption[]>("/classes"),
  ]).then(([characters, species, backgrounds, classes]) => ({
    characters,
    species,
    backgrounds,
    classes,
  }));
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const headers = new Headers(init?.headers);
  if (init?.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const response = await fetch(`${apiBaseUrl}${path}`, {
    ...init,
    headers,
  });

  if (!response.ok) {
    const body: unknown = await response.json();
    const message =
      typeof body === "object" && body !== null && "error" in body && typeof body.error === "string"
        ? body.error
        : `Request failed (${response.status})`;
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

function getErrorMessage(error: unknown): string {
  return error instanceof Error ? error.message : "Something went wrong. Please try again.";
}

function App() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [page, setPage] = useState<Page>({ name: "dashboard" });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setData(await fetchDashboardData());
    } catch (error) {
      setLoadError(getErrorMessage(error));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    void fetchDashboardData()
      .then((result) => {
        if (active) setData(result);
      })
      .catch((error: unknown) => {
        if (active) setLoadError(getErrorMessage(error));
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const createCharacter = async (input: CharacterCreationInput) => {
    const character = await request<Character>("/characters", {
      method: "POST",
      body: JSON.stringify(input),
    });

    setData((current) =>
      current ? { ...current, characters: [...current.characters, character] } : current,
    );
    setPage({ name: "detail", characterId: character.id });
    return character;
  };

  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="brand"
          type="button"
          onClick={() => setPage({ name: "dashboard" })}
          aria-label="Scroll Smith home"
        >
          <span className="brand-mark" aria-hidden="true">
            S
          </span>
          <span>Scroll Smith</span>
        </button>
        <span className="topbar-note">Your characters, ready for adventure</span>
      </header>

      <main className="main-content">
        {loading && !data ? (
          <section className="message-panel" aria-live="polite">
            <span className="loading-mark" aria-hidden="true" />
            <h1>Gathering your adventurers</h1>
            <p>One moment while we open the ledger.</p>
          </section>
        ) : loadError && !data ? (
          <section className="message-panel" role="alert">
            <p className="eyebrow">The ledger is unavailable</p>
            <h1>We couldn&apos;t load your characters.</h1>
            <p>{loadError}</p>
            <button
              className="button button-primary"
              type="button"
              onClick={() => void loadDashboard()}
            >
              Try again
            </button>
          </section>
        ) : data ? (
          page.name === "dashboard" ? (
            <Dashboard
              data={data}
              onCreate={() => setPage({ name: "create" })}
              onSelect={(characterId) => setPage({ name: "detail", characterId })}
            />
          ) : page.name === "create" ? (
            <CharacterCreation
              data={data}
              onCancel={() => setPage({ name: "dashboard" })}
              onCreate={createCharacter}
            />
          ) : (
            <CharacterDetail
              data={data}
              characterId={page.characterId}
              onBack={() => setPage({ name: "dashboard" })}
            />
          )
        ) : null}
      </main>

      <footer className="footer">
        <span>Made for the next great story.</span>
        {loading && data ? <span className="refreshing">Refreshing your ledger...</span> : null}
      </footer>
    </div>
  );
}

export default App;
