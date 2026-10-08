import { supabase } from "./supabase.js";
import { monthBounds } from "./dates.js";

/** Load everything one month of the planner needs. */
export async function loadMonth(y, m) {
  const { firstKey, lastKey, startISO, endISO } = monthBounds(y, m);

  const [people, tasks, events, holidays] = await Promise.all([
    supabase.from("planner_people").select("*").order("sort_order").order("name"),
    supabase.from("planner_tasks").select("*").gte("task_date", firstKey).lte("task_date", lastKey),
    supabase
      .from("events")
      .select("id, title, starts_at, ends_at, all_day, categories(name, fill_color, text_color), event_people(people(name, sort_order))")
      .lt("starts_at", endISO)
      .gte("ends_at", startISO),
    supabase.from("holidays").select("holiday_date, name").gte("holiday_date", firstKey).lte("holiday_date", lastKey),
  ]);

  if (people.error) throw people.error;
  if (tasks.error) throw tasks.error;

  const holidayMap = {};
  (holidays.data || []).forEach((h) => (holidayMap[h.holiday_date] = h.name));

  return {
    people: people.data || [],
    tasks: tasks.data || [],
    events: events.data || [],
    calendarError: events.error ? events.error.message : "",
    holidays: holidayMap,
  };
}

export async function saveTask(form) {
  const row = {
    task_date: form.date,
    start_time: form.time || null,
    kind: form.kind,
    title: form.title.trim(),
    notes: form.notes.trim() || null,
    person_id: form.personId || null,
  };
  const query = form.id
    ? supabase.from("planner_tasks").update({ ...row, updated_at: new Date().toISOString() }).eq("id", form.id)
    : supabase.from("planner_tasks").insert(row);
  const { error } = await query;
  if (error) throw error;
}

export async function deleteTask(id) {
  const { error } = await supabase.from("planner_tasks").delete().eq("id", id);
  if (error) throw error;
}

export async function addPerson(name, colorIndex, sortOrder) {
  const { error } = await supabase
    .from("planner_people")
    .insert({ name: name.trim(), color_index: colorIndex, sort_order: sortOrder });
  if (error) {
    if (error.code === "23505") throw new Error(`${name.trim()} is already on the list.`);
    throw error;
  }
}
