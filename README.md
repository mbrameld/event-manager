# SETUP

- A MySQL database is required, set the DATABASE_URL in .env
- Make changes to the data model in prisma/schema.prisma
- Run npx prisma db push to write the database changes to the dev database
- Run yarn to regenerate the prisma client

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
