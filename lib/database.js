const fs = require('fs/promises');
const path = require('path');
const config = require('../config');

const dbPath = path.join(__dirname, '..', 'database.json');

async function initDB() {
  try {
    await fs.access(dbPath);
  } catch {
    await fs.writeFile(dbPath, JSON.stringify({ users: {} }, null, 2));
  }
}

async function getDB() {
  await initDB();
  return JSON.parse(await fs.readFile(dbPath, 'utf8'));
}

async function saveDB(db) {
  const tmp = `${dbPath}.tmp`;
  await fs.writeFile(tmp, JSON.stringify(db, null, 2));
  await fs.rename(tmp, dbPath);
}

function jakartaDate() {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: config.timezone, year: 'numeric', month: '2-digit', day: '2-digit'
  }).format(new Date());
}

async function checkLimit(userId) {
  const db = await getDB();
  const today = jakartaDate();
  let user = db.users[userId];
  if (!user) {
    user = db.users[userId] = { limit: config.maxLimit, lastReset: today };
  } else if (user.lastReset !== today) {
    user.limit = config.maxLimit;
    user.lastReset = today;
  }
  await saveDB(db);
  return user.limit > 0;
}

async function reduceLimit(userId) {
  const db = await getDB();
  const user = db.users[userId];
  if (user && user.limit > 0) {
    user.limit -= 1;
    await saveDB(db);
  }
}

async function getLimit(userId) {
  const db = await getDB();
  const user = db.users[userId];
  if (!user) return config.maxLimit;
  return user.limit;
}

module.exports = { initDB, getDB, saveDB, checkLimit, reduceLimit, getLimit };
