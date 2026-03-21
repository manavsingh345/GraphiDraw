const fs = require('fs');
const dbUrl = '\nDATABASE_URL="postgresql://neondb_owner:npg_2jP3XwJOLrbs@ep-dark-mode-ahhopkod-pooler.c-3.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require"\n';
fs.appendFileSync('apps/http-backend/.env', dbUrl);
fs.appendFileSync('apps/ws-backend/.env', dbUrl);
