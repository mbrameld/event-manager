# SETUP

- Configure a firebase project with email auth enabled
- Set the required firebase variables in .env
- A MySQL database is required, set the DATABASE_URL in .env
- Make changes to the data model in prisma/schema.prisma
- Run npx prisma db push to write the database changes to the dev database
- Usually a restart of the TypeScript server is required to pick up the changes

# Structure

- All auth utils are in src/auth. Currently uses Firebase with plans to switch to next-auth
- Routes are defined in server/router/ROUTERNAME.ts and merged in server/router/index.ts
- Business logic is in server/lib
- Some complexity is in schedule/TimePicker.tsx calculating sortedTimesForDuration

# TODO

- Make ambassador dialog a Next page with a dynamic route instead
- User/dispensary management
- Next Auth/sendgrid/prisma to replace firebase auth
- Page for ambassadors to see their events, link their calendar
- Error handling/messages
- Don't allow booking same day?
- Deploy to vercel
- Tests
