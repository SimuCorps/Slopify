# Docs

### How to setup:
1. Fork and clone this
2. Go to https://vercel.com/ and add your repo
3. Click the storage tab in your project
4. Add a Neon PG Serverless DB
5. Copy the env provided, should look something like this
```env
# Recommended for most uses

DATABASE_URL=************


# For uses requiring a connection without pgbouncer

DATABASE_URL_UNPOOLED=*********************


# Parameters for constructing your own connection string

PGHOST=******

PGHOST_UNPOOLED=***************
```

and paste it in a newly created `.env` file inside the root of the project

6. Install deps (`npm i`)

7. Setup db:
We need to push the existing schema to your new db - `npx prisma db push`

7. Run it `npx vercel dev` (we need the vercel dev server due to functions)

you are done yipee

---

### Update to latest version:

1. Pull changes:
```sh
git pull
```
2. Run migrations:
```sh
npx prisma migrate deploy
```

---

### Database:

when u make a change to the db make sure to create a migration:
```sh
$ npx prisma migrate dev
```