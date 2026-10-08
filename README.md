# Spavins Planner

A day-by-day list of who's doing which lifts and tasks, with the Spavins Calendar's
events shown at the bottom of each day.

- One row per day. Lifts and tasks sit in a single column, sorted by start time.
- Each entry is assigned to one person (starting with Gavin, Viv, Ann and Lyn).
  Add more people with **Add person**.
- Tap a person's name at the top to see only their jobs.
- The family calendar's events appear at the bottom of each day, read-only, and update
  live as they're added. **Family calendar: shown / hidden** switches them off.
- Same login as the Spavins Calendar. It uses the same Supabase database and adds two
  new tables of its own (`planner_people`, `planner_tasks`). The calendar is not changed.

---

## Setting it up (one time, about 15 minutes)

Do these in order. You don't need to install anything on your computer.

### Step 1 — Add the planner's tables to the database

1. Go to **supabase.com**, sign in and open the **same project** the Spavins Calendar uses.
2. In the left menu click **SQL Editor**, then **New query**.
3. Open the file `planner-setup.sql` from this folder in Notepad, select everything
   (Ctrl+A), copy (Ctrl+C) and paste it into the Supabase box (Ctrl+V).
4. Click **Run**. You should see "Success. No rows returned."

### Step 2 — Put the code on GitHub

1. Unzip the download: right-click `spavins-planner.zip` → **Extract All**.
2. Go to **github.com**, click the **+** at the top right → **New repository**.
3. Name it `spavins-planner`, choose **Private**, and click **Create repository**.
4. On the next page click the link **uploading an existing file**.
5. Open the extracted `spavins-planner` folder on your computer, press Ctrl+A to select
   everything inside it, and drag it all onto the GitHub page.
6. Wait for the files to finish uploading, then click **Commit changes**.

### Step 3 — Create the website on Netlify

1. Go to **app.netlify.com**. First, open your **Spavins Calendar** site →
   **Site configuration** → **Environment variables**, and keep that tab open. You'll
   copy three values from it.
2. In a new tab, from the Netlify home page click **Add new site** →
   **Import an existing project** → **GitHub**, and choose `spavins-planner`.
3. Leave the build settings as they are. Click **Add environment variables** and add
   these three, copying each value from the calendar's tab:

   | Name | Value |
   |---|---|
   | `VITE_SUPABASE_URL` | same as the calendar |
   | `VITE_SUPABASE_ANON_KEY` | same as the calendar |
   | `VITE_FAMILY_INVITE_CODE` | same as the calendar |

4. Click **Deploy**. It takes a minute or two.
5. To give it a tidy address: **Site configuration** → **Change site name** →
   `spavins-planner` (it becomes `spavins-planner.netlify.app`).

If you added the variables after the first deploy, go to **Deploys** →
**Trigger deploy** → **Deploy site** so it picks them up.

### Step 4 — Use it

- Open the site and sign in with your Spavins Calendar email and password.
- To put it on a phone's home screen: on iPhone, open it in Safari → Share →
  **Add to Home Screen**. On Android, open it in Chrome → ⋮ menu → **Add to Home screen**.

---

## Making changes later

Same as the calendar: upload the changed files to the `spavins-planner` repository on
GitHub and Netlify rebuilds by itself. If a change comes with a `.sql` file, run that in
Supabase first.

## Good to know

- People added in the planner are separate from the calendar's people (Gav, Sue, Nath,
  Sarah, Jess). The calendar's names are shown as written on each calendar entry.
- There's no way yet to rename or remove a planner person in the app. In Supabase,
  **Table Editor** → `planner_people` lets you edit names. Removing someone leaves their
  jobs in place, marked "Unassigned".
- Public holidays come from the calendar's `holidays` table, so they match the calendar.
- To change the main colour, edit `--accent` near the top of `src/styles/theme.css`.

## For a developer

React 18 + Vite, plain CSS, Supabase (auth, Postgres with RLS, realtime). No serverless
functions. Live updates listen to `planner_tasks`, `planner_people`, `events` and
`event_people`. Calendar events spanning several days are spread across each day they
cover (`src/lib/calendarEvents.js`). Local dev: copy `.env.example` to `.env`, then
`npm install && npm run dev`.
