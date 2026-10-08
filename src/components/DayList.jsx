import { CalendarIcon, CarIcon, CheckIcon, PlusIcon } from "./icons.jsx";

export default function DayList({ days, onAdd, onOpen }) {
  return (
    <section className="panel days" aria-label="Days">
      {days.map((day) => (
        <DayRow key={day.key} day={day} onAdd={onAdd} onOpen={onOpen} />
      ))}
    </section>
  );
}

function DayRow({ day, onAdd, onOpen }) {
  const cls = ["day", day.weekend && "is-weekend", day.holiday && "is-holiday", day.isToday && "is-today"]
    .filter(Boolean)
    .join(" ");
  return (
    <div className={cls} id={`day-${day.key}`}>
      <div className="day-date">
        <span className="day-dow">{day.dow}</span>
        <span className="day-num">{day.dayNum}</span>
        {day.isToday && <span className="today-pill">Today</span>}
        {day.summary && <span className="day-summary">{day.summary}</span>}
      </div>
      <div className="day-body">
        {day.holiday && <span className="holiday-pill">{day.holiday}</span>}

        {day.tasks.map((t) => (
          <button
            key={t.id}
            className="task"
            style={{ "--p-bg": t.colour.bg, "--p-dot": t.colour.dot, "--p-fg": t.colour.fg }}
            onClick={() => onOpen(t.raw)}
          >
            <span className="task-time">{t.time}</span>
            <span className="task-kind">{t.isLift ? <CarIcon /> : <CheckIcon />}{t.isLift ? "Lift" : "Task"}</span>
            <span className="task-text">
              <span className="task-title">{t.title}</span>
              {t.notes && <span className="task-notes">{t.notes}</span>}
            </span>
            <span className="task-person"><span className="avatar">{t.personName.charAt(0)}</span>{t.personName}</span>
          </button>
        ))}

        <button className="add-inline" onClick={() => onAdd(day.key)} aria-label={`Add a lift or task on ${day.longLabel}`}>
          <PlusIcon size={13} />Add
        </button>

        {day.cal.length > 0 && (
          <div className="cal-block">
            <span className="cal-heading"><CalendarIcon />From the family calendar</span>
            {day.cal.map((ev) => (
              <div key={ev.id} className="cal-item">
                <span className="cal-time">{ev.time}</span>
                <span className="cal-cat" style={{ background: ev.fill, color: ev.text }}>{ev.category}</span>
                <span className="cal-title">{ev.title}</span>
                {ev.people.length > 0 && <span className="cal-people">{ev.people.join(", ")}</span>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
