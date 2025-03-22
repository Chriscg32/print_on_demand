const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

module.exports = async () => {
  return open({
    filename: process.env.SQLITE_PATH || './printondemand.db',
    driver: sqlite3.Database,
    mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
    password: process.env.SQLCIPHER_KEY
  });
};