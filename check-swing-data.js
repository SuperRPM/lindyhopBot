const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./swing.db');

console.log('Checking swing_info table data...');

db.all('SELECT * FROM swing_info ORDER BY startTime', (err, rows) => {
  if (err) {
    console.error('Error:', err);
  } else {
    console.log('Total rows:', rows.length);
    console.log('\nAll swing_info data:');
    rows.forEach((row, index) => {
      console.log(`${index + 1}. ${row.startTime}: ${row.place} - ${row.club} (DJ: ${row.dj || 'N/A'}, Generation: ${row.generation || 'N/A'})`);
    });
    
    // generation 133 데이터만 확인
    console.log('\nGeneration 133 data:');
    const generation133Data = rows.filter(row => row.generation === 133);
    generation133Data.forEach((row, index) => {
      console.log(`${index + 1}. ${row.startTime}: ${row.place} - ${row.club} (DJ: ${row.dj || 'N/A'})`);
    });
    
    // 오늘 이후 데이터 확인
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    console.log('\nToday and future data:');
    const futureData = rows.filter(row => new Date(row.startTime) >= today);
    futureData.forEach((row, index) => {
      console.log(`${index + 1}. ${row.startTime}: ${row.place} - ${row.club} (DJ: ${row.dj || 'N/A'}, Generation: ${row.generation || 'N/A'})`);
    });
  }
  db.close();
}); 