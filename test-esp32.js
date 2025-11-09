// Quick ESP32 connection test
const ESP32_IP = '192.168.22.122';

async function testESP32() {
  console.log('Testing ESP32 connection...');
  
  try {
    const response = await fetch(`http://${ESP32_IP}/`, {
      method: 'GET',
      mode: 'no-cors'
    });
    console.log('✅ ESP32 reachable');
  } catch (error) {
    console.log('❌ ESP32 connection failed:', error.message);
  }
  
  // Test with curl equivalent
  try {
    const response = await fetch(`http://${ESP32_IP}/status`);
    console.log('✅ Status endpoint works');
  } catch (error) {
    console.log('❌ Status endpoint failed');
  }
}

testESP32();