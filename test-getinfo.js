const http = require('http');

const postData = JSON.stringify({
  action: {
    params: {
      generation: 133
    }
  }
});

const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/getInfo',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

const req = http.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers:`, res.headers);
  
  let data = '';
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const response = JSON.parse(data);
      console.log('Response:');
      console.log(JSON.stringify(response, null, 2));
      
      // schedule 데이터 확인
      if (response.data && response.data.schedule) {
        console.log('\nSchedule data:');
        console.log(JSON.stringify(response.data.schedule, null, 2));
      }
    } catch (e) {
      console.error('Error parsing response:', e);
      console.log('Raw response:', data);
    }
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end(); 