import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { supabase, supabaseConfigured } from "./lib/supabase.js";
import { DOW, MONTHS, longLabel, monthKeys, parseKey, todayKey } from "./lib/dates.js";
import { UNASSIGNED, colourFor } from "./lib/palette.js";
import { spreadEvents } from "./lib/calendarEvents.js";
import { addPerson, deleteTask, loadMonth, saveTask } from "./lib/data.js";
import { useStoredState } from "./lib/useStoredState.js";
import AuthScreen from "./components/AuthScreen.jsx";
import Header from "./components/Header.jsx";
import PeopleBar from "./components/PeopleBar.jsx";
import DayList from "./components/DayList.jsx";
import TaskModal from "./components/TaskModal.jsx";
import Toast from "./components/Toast.jsx";

export default function App() {
  const [session, setSession] = useState(undefined); // undefined while checking

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, s) => setSession(s));
    return () => data.subscription.unsubscribe();
  }, []);

  if (!supabaseConfigured) {
    return (
      <main className="splash">
        <p>The planner isn't connected to the database yet. Add the Supabase settings in Netlify, then redeploy.</p>
      </main>
    );
  }
  if (session === undefined) return <main className="splash"><p>Loading…</p></main>;
  if (!session) return <AuthScreen />;
  return <Planner />;
}

function Planner() {
  const now = new Date();
  const [cursor, setCursor] = useState({ y: now.getFullYear(), m: now.getMonth() });
  const [people, setPeople] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [holidays, setHolidays] = useState({});
  const [calendarError, setCalendarError] = useState("");
  const [loaded, setLoaded] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [filter, setFilter] = useStoredState("planner.filter", null);
  const [showCal, setShowCal] = useStoredState("planner.showCalendar", true);
  const [modal, setModal] = useState(null);
  const [toast, setToast] = useState("");
  const scrollTarget = useRef({ key: todayKey(), block: "start" });

  const refresh = useCallback(async () => {
    try {
      const data = await loadMonth(cursor.y, cursor.m);
      setPeople(data.people);
      setTasks(data.tasks);
      setEvents(data.events);
      setHolidays(data.holidays);
      setCalendarError(data.calendarError);
      setLoadError("");
    } catch (err) {
      setLoadError(err.message || "Couldn't load the planner.");
    } finally {
      setLoaded(true); // only the first load shows the full-screen loader
    }
  }, [cursor.y, cursor.m]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  // Live updates: anything changed here, or in the family calendar, refreshes quietly.
  const refreshRef = useRef(refresh);
  refreshRef.current = refresh;
  useEffect(() => {
    let timer;
    const kick = () => {
      clearTimeout(timer);
      timer = setTimeout(() => refreshRef.current(), 250);
    };
    const channel = supabase.channel("planner-live");
    ["planner_tasks", "planner_people", "events", "event_people"].forEach((table) =>
      channel.on("postgres_changes", { event: "*", schema: "public", table }, kick)
    );
    channel.subscribe();
    return () => {
      clearTimeout(timer);
      supabase.removeChannel(channel);
    };
  }, []);

  const tryScroll = useCallback(() => {
    const target = scrollTarget.current;
    if (!target) return;
    const el = document.getElementById(`day-${target.key}`);
    if (el) {
      const calm = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: calm ? "auto" : "smooth", block: target.block });
      scrollTarget.current = null;
    }
  }, []);

  useEffect(() => {
    if (loaded) requestAnimationFrame(tryScroll);
  }, [loaded, tasks, events, cursor, tryScroll]);

  // Forget a filter for someone who no longer exists.
  const activeFilter = filter && people.some((p) => p.id === filter) ? filter : null;

  const days = useMemo(() => {
    const keys = monthKeys(cursor.y, cursor.m);
    const today = todayKey();
    const peopleById = Object.fromEntries(people.map((p) => [p.id, p]));
    const calByDay = showCal ? spreadEvents(events, keys) : {};

    return keys.map((key) => {
      const d = parseKey(key);
      const dayTasks = tasks
        .filter((t) => t.task_date === key && (!activeFilter || t.person_id === activeFilter))
        .map((t) => {
          const person = peopleById[t.person_id];
          const time = t.start_time ? t.start_time.slice(0, 5) : "";
          return {
            id: t.id,
            raw: t,
            sortKey: time || "00:00",
            time: time || "Any time",
            isLift: t.kind === "lift",
            title: t.title,
            notes: t.notes,
            personName: person ? person.name : UNASSIGNED.name,
            colour: person ? colourFor(person.color_index) : UNASSIGNED,
          };
        })
        .sort((a, b) => a.sortKey.localeCompare(b.sortKey) || a.title.localeCompare(b.title));

      const lifts = dayTasks.filter((t) => t.isLift).length;
      const jobs = dayTasks.length - lifts;
      const cal = calByDay[key] || [];
      const parts = [];
      if (lifts) parts.push(`${lifts} ${lifts === 1 ? "lift" : "lifts"}`);
      if (jobs) parts.push(`${jobs} ${jobs === 1 ? "task" : "tasks"}`);
      if (cal.length) parts.push(`${cal.length} on calendar`);

      return {
        key,
        dow: DOW[d.getDay()],
        dayNum: d.getDate(),
        longLabel: longLabel(key),
        weekend: d.getDay() === 0 || d.getDay() === 6,
        isToday: key === today,
        holiday: holidays[key] || "",
        tasks: dayTasks,
        cal,
        summary: parts.join(", "),
      };
    });
  }, [cursor, tasks, people, events, holidays, showCal, activeFilter]);

  const counts = useMemo(() => {
    const c = {};
    tasks.forEach((t) => {
      if (t.person_id) c[t.person_id] = (c[t.person_id] || 0) + 1;
    });
    return c;
  }, [tasks]);

  function goMonth(delta) {
    setCursor(({ y, m }) => {
      const n = new Date(y, m + delta, 1);
      return { y: n.getFullYear(), m: n.getMonth() };
    });
  }

  function goToday() {
    const n = new Date();
    scrollTarget.current = { key: todayKey(), block: "start" };
    if (n.getFullYear() === cursor.y && n.getMonth() === cursor.m) tryScroll();
    else setCursor({ y: n.getFullYear(), m: n.getMonth() });
  }

  function openAdd(dateKey) {
    const defaultPerson = activeFilter || (people[0] && people[0].id) || null;
    setModal({ id: null, date: dateKey, time: "08:00", kind: "lift", title: "", notes: "", personId: defaultPerson });
  }

  function openEdit(t) {
    setModal({
      id: t.id,
      date: t.task_date,
      time: t.start_time ? t.start_time.slice(0, 5) : "",
      kind: t.kind,
      title: t.title,
      notes: t.notes || "",
      personId: t.person_id,
    });
  }

  async function handleSave(form) {
    await saveTask(form);
    setModal(null);
    setToast(form.id ? "Changes saved" : form.kind === "lift" ? "Lift added" : "Task added");
    const [y, m] = form.date.split("-").map(Number);
    scrollTarget.current = { key: form.date, block: "nearest" };
    if (y !== cursor.y || m - 1 !== cursor.m) setCursor({ y, m: m - 1 });
    else refresh();
  }

  async function handleDelete(id) {
    await deleteTask(id);
    setModal(null);
    setToast("Deleted");
    refresh();
  }

  async function handleAddPerson(name, colorIndex) {
    const nextOrder = people.reduce((max, p) => Math.max(max, p.sort_order || 0), 0) + 1;
    await addPerson(name, colorIndex, nextOrder);
    setToast(`${name.trim()} added`);
    refresh();
  }

  const clearToast = useCallback(() => setToast(""), []);

  if (!loaded) return <main className="splash"><p>Loading the planner…</p></main>;

  return (
    <div className="page">
      <div className="wrap">
        <Header
          monthLabel={`${MONTHS[cursor.m]} ${cursor.y}`}
          onPrev={() => goMonth(-1)}
          onNext={() => goMonth(1)}
          onToday={goToday}
          onAddTask={() => openAdd(todayKey())}
          onSignOut={() => supabase.auth.signOut()}
        />

        {loadError && (
          <p className="panel notice" role="alert">
            {loadError} If this is a new setup, check that planner-setup.sql has been run in Supabase.
          </p>
        )}
        {showCal && calendarError && (
          <p className="panel notice" role="status">The family calendar couldn't be read just now, so its entries are missing.</p>
        )}

        <PeopleBar
          people={people}
          counts={counts}
          filter={activeFilter}
          onFilter={setFilter}
          onAddPerson={handleAddPerson}
          showCal={showCal}
          onToggleCal={setShowCal}
        />

        <DayList days={days} onAdd={openAdd} onOpen={openEdit} />
      </div>

      {modal && (
        <TaskModal
          initial={modal}
          people={people}
          onSave={handleSave}
          onDelete={handleDelete}
          onClose={() => setModal(null)}
        />
      )}
      <Toast message={toast} onDone={clearToast} />
    </div>
  );
}
