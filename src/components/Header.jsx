import { ChevronLeft, ChevronRight, PlusIcon } from "./icons.jsx";

export default function Header({ monthLabel, onPrev, onNext, onToday, onAddTask, onSignOut }) {
  return (
    <header className="panel header">
      <div className="brand">
        <img src="/icons/icon-192.png" alt="" width="52" height="52" />
        <div>
          <h1>Spavins Planner</h1>
          <p className="muted">Who's doing which lifts and tasks, day by day</p>
        </div>
      </div>
      <div className="header-actions">
        <div className="month-nav">
          <button className="btn btn-icon" onClick={onPrev} aria-label="Previous month"><ChevronLeft /></button>
          <h2 className="month-label" aria-live="polite">{monthLabel}</h2>
          <button className="btn btn-icon" onClick={onNext} aria-label="Next month"><ChevronRight /></button>
        </div>
        <button className="btn" onClick={onToday}>Today</button>
        <button className="btn btn-primary" onClick={onAddTask}><PlusIcon />Add task</button>
        <button className="btn btn-quiet" onClick={onSignOut}>Sign out</button>
      </div>
    </header>
  );
}
