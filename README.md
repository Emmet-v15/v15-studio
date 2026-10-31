# v15-studio

The Node.js server that ran v15.studio in 2022 and 2023. Archived: kept for reference, no longer maintained.

It has three parts:

- An Express HTTPS server: static pages from `public/` and a small API on the `api` subdomain (`api/router.js`).
- A discord.js v14 bot (`bot.js`, `commands/`, `events/`): support tickets, role buttons, reminders and settings, stored with Enmap.
- A Puppeteer task (`systems/tasks/fetchTimetable.js`) that pulls a class timetable and renders the timetable page to an image.

It doesn't run as is. It expects a `.env` file (bot token, timetable login) and TLS certificates in `sslcert/`, and neither is in the repo.
