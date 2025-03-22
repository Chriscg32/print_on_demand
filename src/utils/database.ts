import Database from 'better-sqlite3'

const db = new Database('database.db', {
  verbose: console.log
})

export const initializeDatabase = () => {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      design TEXT,
      quantity INTEGER,
      size TEXT,
      color TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `)
}

export default db
