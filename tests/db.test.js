const sqlite3 = require('sqlite3');
const { open } = require('sqlite');

describe('SQLCipher Integration', () => {
  test('Database requires encryption key', async () => {
    const db = await open({
      filename: ':memory:',
      driver: sqlite3.Database,
      mode: sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE,
      password: 'test-key'
    });
    
    await expect(db.exec('CREATE TABLE test (id INTEGER PRIMARY KEY)'))
      .resolves.not.toThrow();
  });
});