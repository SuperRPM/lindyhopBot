const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./swing.db');

console.log('Checking afterparty_place table...');

db.all("PRAGMA table_info(afterparty_place)", (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('afterparty_place table schema:');
    if (rows && rows.length > 0) {
      rows.forEach(row => {
        console.log(`- ${row.name}: ${row.type} ${row.notnull ? 'NOT NULL' : ''} ${row.pk ? 'PRIMARY KEY' : ''}`);
      });
    } else {
      console.log('No columns found or table is empty');
    }
  }
  
  // 테이블에 데이터가 있는지도 확인
  db.all("SELECT COUNT(*) as count FROM afterparty_place", (err, rows) => {
    if (err) {
      console.error('Count error:', err);
    } else {
      console.log(`Rows in table: ${rows[0].count}`);
    }
    db.close();
  });
}); 