import { useState } from "react";
import { PALETTE, colourFor } from "../lib/palette.js";
import { CalendarIcon, PlusIcon } from "./icons.jsx";

export default function PeopleBar({ people, counts, filter, onFilter, onAddPerson, showCal, onToggleCal }) {
  const [adding, setAdding] = useState(false);
  const [name, setName] = useState("");
  const [colour, setColour] = useState(0);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function startAdding() {
    setName("");
    setError("");
    setColour(people.length % PALETTE.length);
    setAdding(true);
  }

  async function confirm(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError("Type a name first.");
      return;
    }
    setBusy(true);
    try {
      await onAddPerson(name, colour);
      setAdding(false);
    } catch (err) {
      setError(err.message || "Couldn't add that person. Try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="panel people-bar" aria-label="People">
      <div className="people-row">
        <span className="people-label">Show</span>
        <button className={`chip chip-everyone${filter ? "" : " is-active"}`} aria-pressed={!filter} onClick={() => onFilter(null)}>
          Everyone
        </button>
        {people.map((p) => {
          const c = colourFor(p.color_index);
          const active = filter === p.id;
          return (
            <button
              key={p.id}
              className={`chip chip-person${active ? " is-active" : ""}${filter && !active ? " is-dimmed" : ""}`}
              style={{ "--p-bg": c.bg, "--p-dot": c.dot, "--p-fg": c.fg }}
              aria-pressed={active}
              onClick={() => onFilter(active ? null : p.id)}
            >
              <span className="avatar">{p.name.charAt(0).toUpperCase()}</span>
              {p.name}
              {counts[p.id] ? <span className="chip-count" aria-label={`${counts[p.id]} this month`}>{counts[p.id]}</span> : null}
            </button>
          );
        })}
        {!adding && (
          <button className="chip chip-add" onClick={startAdding}><PlusIcon size={14} />Add person</button>
        )}
        <span className="spacer" />
        <button className={`chip chip-cal${showCal ? " is-active" : ""}`} aria-pressed={showCal} onClick={() => onToggleCal(!showCal)}>
          <CalendarIcon />
          {showCal ? "Family calendar: shown" : "Family calendar: hidden"}
        </button>
      </div>

      {adding && (
        <form className="add-person" onSubmit={confirm}>
          <label className="field">
            <span>Name</span>
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Peter" autoFocus />
          </label>
          <fieldset className="field">
            <legend>Colour</legend>
            <div className="swatches">
              {PALETTE.map((c, i) => (
                <button
                  key={c.name}
                  type="button"
                  className={`swatch${colour === i ? " is-active" : ""}`}
                  style={{ background: c.dot }}
                  aria-label={c.name}
                  aria-pressed={colour === i}
                  onClick={() => setColour(i)}
                />
              ))}
            </div>
          </fieldset>
          <div className="add-person-actions">
            <button className="btn btn-dark" type="submit" disabled={busy}>{busy ? "Adding…" : "Add"}</button>
            <button className="btn" type="button" onClick={() => setAdding(false)}>Cancel</button>
          </div>
          {error && <p className="form-message" role="alert">{error}</p>}
        </form>
      )}
    </section>
  );
}
