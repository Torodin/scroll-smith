import { useCallback, useEffect, useState } from "react";
import type {
  BackgroundOption,
  Character,
  ClassDetail,
  ClassSummary,
  DashboardData,
  LevelUpInput,
  SpeciesOption,
  SpellOption,
} from "./core/types";
import CharacterCreation from "./components/CharacterCreation";
import type { CharacterCreationInput } from "./components/CharacterCreation";
import CharacterDetail from "./components/CharacterDetail/CharacterDetail";
import LevelUp from "./components/LevelUp";
import SpellEditor from "./components/SpellEditor";
import ClassEditor from "./components/ClassEditor";
import type { ClassUpdateInput } from "./components/ClassEditor";
import { optionName } from "./components/option-name";
import Dashboard from "./components/Dashboard";
import "./App.css";

type Page =
  | { name: "dashboard" }
  | { name: "create" }
  | { name: "spells" }
  | { name: "classes" }
  | { name: "detail"; characterId: number }
  | { name: "levelUp"; characterId: number };

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "/api";

function fetchDashboardData(): Promise<DashboardData> {
  return Promise.all([
    request<Character[]>("/characters"),
    request<SpeciesOption[]>("/species"),
    request<BackgroundOption[]>("/backgrounds"),
    request<ClassSummary[]>("/classes"),
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

  if (response.status === 204) return undefined as T;

  return response.json() as Promise<T>;
}

const loadClass = (id: number) => request<ClassDetail>(`/classes/${id}`);
const updateClass = (id: number, input: ClassUpdateInput) =>
  request<ClassDetail>(`/classes/${id}`, { method: "PATCH", body: JSON.stringify(input) });
const loadAllSpells = (classId: number) => request<SpellOption[]>(`/spells?classId=${classId}`);
const loadSpellCatalog = () => request<SpellOption[]>("/spells");

type SpellMutation = Omit<SpellOption, "id" | "classes"> & { classIds: number[] };

const createSpell = (input: SpellMutation) =>
  request<SpellOption>("/spells", { method: "POST", body: JSON.stringify(input) });
const updateSpell = (id: number, input: SpellMutation) =>
  request<SpellOption>(`/spells/${id}`, { method: "PATCH", body: JSON.stringify(input) });
const deleteSpell = (id: number) => request<void>(`/spells/${id}`, { method: "DELETE" });

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

  const levelUpCharacter = async (characterId: number, input: LevelUpInput) => {
    const character = await request<Character>(`/characters/${characterId}/level-up`, {
      method: "POST",
      body: JSON.stringify(input),
    });

    setData((current) =>
      current
        ? {
            ...current,
            characters: current.characters.map((item) =>
              item.id === characterId ? character : item,
            ),
          }
        : current,
    );
    setPage({ name: "detail", characterId });
  };

  const deleteCharacter = async (characterId: number) => {
    await request<void>(`/characters/${characterId}`, { method: "DELETE" });

    setData((current) =>
      current
        ? { ...current, characters: current.characters.filter((item) => item.id !== characterId) }
        : current,
    );
    setPage({ name: "dashboard" });
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
        <div className="topbar-actions">
          <button
            className="button button-secondary topbar-spells-button"
            type="button"
            aria-current={page.name === "classes" ? "page" : undefined}
            onClick={() => setPage({ name: "classes" })}
          >
            Manage classes
          </button>
          <button
            className="button button-secondary topbar-spells-button"
            type="button"
            aria-current={page.name === "spells" ? "page" : undefined}
            onClick={() => setPage({ name: "spells" })}
          >
            Manage spells
          </button>
        </div>
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
              loadClass={(id) => request<ClassDetail>(`/classes/${id}`)}
              loadSpells={(classId) =>
                request<SpellOption[]>(`/spells?classId=${classId}&maxLevel=1`)
              }
            />
          ) : page.name === "spells" ? (
            <SpellEditor
              classes={data.classes}
              loadSpells={loadSpellCatalog}
              createSpell={createSpell}
              updateSpell={updateSpell}
              deleteSpell={deleteSpell}
            />
          ) : page.name === "classes" ? (
            <ClassEditor
              classes={data.classes}
              loadClass={loadClass}
              updateClass={updateClass}
              onSaved={(saved) =>
                setData((current) =>
                  current
                    ? {
                        ...current,
                        classes: current.classes
                          .map((item) => (item.id === saved.id ? { ...item, ...saved } : item))
                          .sort((a, b) => a.name.localeCompare(b.name)),
                      }
                    : current,
                )
              }
            />
          ) : page.name === "levelUp" ? (
            (() => {
              const levelingCharacter = data.characters.find(
                (item) => item.id === page.characterId,
              );
              return levelingCharacter ? (
                <LevelUp
                  key={levelingCharacter.id}
                  character={levelingCharacter}
                  className={optionName(data.classes, levelingCharacter.classId)}
                  loadClass={loadClass}
                  loadSpells={loadAllSpells}
                  onCancel={() => setPage({ name: "detail", characterId: page.characterId })}
                  onLevelUp={(input) => levelUpCharacter(page.characterId, input)}
                />
              ) : null;
            })()
          ) : (
            <CharacterDetail
              data={data}
              characterId={page.characterId}
              onBack={() => setPage({ name: "dashboard" })}
              onDelete={deleteCharacter}
              onLevelUp={() => setPage({ name: "levelUp", characterId: page.characterId })}
              loadClass={loadClass}
              loadSpells={loadAllSpells}
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
