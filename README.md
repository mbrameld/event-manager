# SETUP

- A MySQL database is required, set the DATABASE_URL in .env
- Make changes to the data model in prisma/schema.prisma
- Run npx prisma db push to write the database changes to the dev database
- Usually a restart of the TypeScript server is required to pick up the changes

# Structure

- Routes are defined in server/router/ROUTERNAME.ts and merged in server/router/index.ts
- Business logic is in server/lib
- Some complexity is in schedule/TimePicker.tsx calculating sortedTimesForDuration

# TODO

- Make ambassador dialog a Next page with a dynamic route instead
- User/dispensary management
- Page for ambassadors to see their events, link their calendar
- Error handling/messages
- Don't allow booking same day?
- More tests

# Ambassador schedules timezone awareness

## Problem

JS dates are stored as seconds since the epoch and displayed in the user's time zone. Ambassador start and end times are entered as numerical hours, 0 - 23.

## Proposed solution

Store the ambassador start and end hours in their local time
Add the ambassador's time zone to the Ambassador table
When calculating free time, convert scheduled event and exception times to the ambassador's time zone
When saving an event, to find an available ambassador convert event time to ambassador's time zone
