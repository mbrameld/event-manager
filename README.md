# SETUP

- A MySQL database is required, set the DATABASE_URL in .env
- Make changes to the data model in prisma/schema.prisma
- Run npx prisma db push to write the database changes to the dev database
- Run yarn to regenerate the prisma client

# Structure

- API Routes are defined in src/server/router/subroutes/ROUTERNAME.ts and merged in src/server/router/index.ts
- Role-based auth stuff lives in src/middleware.ts
- Most of the complexity is in src/server/lib/ambassador.ts and the event subrouter
- Some complexity is in the TimePicker component on the schedule page calculating sortedTimesForDuration
- Unit tests are colocated with the code being tested. So far only ambassador.ts.
- Integration and e2e tests are in /tests. So far none.

# TODO

- Input validation for ambassador times
- Make ambassador creation a Next page with a dynamic route instead of a dialog
- Page for ambassadors to see their events, link their calendar
- Error handling/messages
- Don't allow booking same day?
- More tests
- Factor out duplicate logic between calculateFreeHours in ambassador.ts and hoursAvailable in event.ts
- Factor out duplicate logic between showing time slots and hilighting dates with free times
- Disable duration button if no slots for that length exist in the month
- Show message when no event types
- Standardize and extract common elements from forms
- Fix algnment of different event types on the upcoming events panel

# Next

- Dispensary management

# Next Next

## Ambassador schedules timezone awareness

## Problem

JS dates are stored as seconds since the epoch and displayed in the user's time zone. Ambassador start and end times are entered as numerical hours, 0 - 23.

## Proposed solution

1. Store the ambassador start and end hours in their local time
2. Add the ambassador's time zone to the Ambassador table
3. When calculating free time, convert scheduled event and exception times to the ambassador's time zone
4. When saving an event, to find an available ambassador convert event time to ambassador's time zone
5. Explore the need for allowing dispensary users to choose a time zone, either globally or per event
