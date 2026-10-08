import { useEffect, useRef, useState } from "react";
import { colourFor } from "../lib/palette.js";

export default function TaskModal({ initial, people, onSave, onDelete, onClose }) {
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const titleRef = useRef(null);
  const editing = Boolean(initial.id);

  useEffect(() => {
    titleRef.current?.focus();
  }, []);

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }));
  const choose = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return setError("Add a short description of what needs doing.");
    if (!form.date) return setError("Pick a date.");
    setBusy(true);
    setError("");
    try {
      await onSave(form);
    } catch (err) {
      setError(err.message || "Couldn't save. Check your connection and try again.");
      setBusy(false);
    }
  }

  async function remove() {
    const word = form.kind === "lift" ? "lift" : "task";
    if (!window.confirm(`Delete this ${word}?`)) return;
    setBusy(true);
    try {
      await onDelete(form.id);
    } catch (err) {
      setError(err.message || "Couldn't delete. Try again.");
      setBusy(false);
    }
  }

  return (
    <div
      className="overlay"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
      onKeyDown={(e) => e.key === "Escape" && onClose()}
    >
      <form className="dialog" role="dialog" aria-modal="true" aria-labelledby="task-dialog-title" onSubmit={submit}>
        <h2 id="task-dialog-title">{editing ? "Edit lift or task" : "Add a lift or task"}</h2>

        <label className="field">
          <span>What needs doing</span>
          <input ref={titleRef} value={form.title} onChange={set("title")} placeholder="e.g. Fetch Ann from physio" />
        </label>

        <div className="field">
          <span id="kind-label">Type</span>
          <div className="segmented" role="group" aria-labelledby="kind-label">
            <button type="button" aria-pressed={form.kind === "lift"} onClick={() => choose("kind", "lift")}>Lift</button>
            <button type="button" aria-pressed={form.kind === "task"} onClick={() => choose("kind", "task")}>Task</button>
          </div>
        </div>

        <div className="field-pair">
          <label className="field">
            <span>Date</span>
            <input type="date" value={form.date} onChange={set("date")} required />
          </label>
          <label className="field">
            <span>Start time</span>
            <input type="time" value={form.time} onChange={set("time")} />
          </label>
        </div>

        <div className="field">
          <span id="person-label">Who's responsible</span>
          <div className="person-picker" role="group" aria-labelledby="person-label">
            {people.map((p) => {
              const c = colourFor(p.color_index);
              return (
                <button
                  key={p.id}
                  type="button"
                  className="chip chip-person"
                  style={{ "--p-bg": c.bg, "--p-dot": c.dot, "--p-fg": c.fg }}
                  aria-pressed={form.personId === p.id}
                  onClick={() => choose("personId", p.id)}
                >
                  <span className="avatar">{p.name.charAt(0).toUpperCase()}</span>
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        <label className="field">
          <span>Notes (optional)</span>
          <input value={form.notes} onChange={set("notes")} placeholder="e.g. Pick up from the main gate" />
        </label>

        {error && <p className="form-message" role="alert">{error}</p>}

        <div className="dialog-actions">
          {editing && (
            <button type="button" className="btn btn-danger" onClick={remove} disabled={busy}>Delete</button>
          )}
          <span className="spacer" />
          <button type="button" className="btn" onClick={onClose}>Cancel</button>
          <button type="submit" className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}
