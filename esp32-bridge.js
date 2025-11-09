// ESP32 Data Bridge - Run this on your computer to bridge ESP32 serial data to web
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

let latestSensorData = {
  distance: -1.00,
  vibration: 9.68,
  latitude: 0.00,
  longitude: 0.00,
  status: 'Normal Road'
};

// Endpoint for ESP32 to send data
app.post('/update', (req, res) => {
  latestSensorData = req.body;
  console.log('Updated sensor data:', latestSensorData);
  res.json({ success: true });
});

// Endpoint for web dashboard to get data
app.get('/live', (req, res) => {
  res.json({
    ultrasonic: { distance: latestSensorData.distance, depth: 0 },
    gps: { latitude: latestSensorData.latitude, longitude: latestSensorData.longitude, accuracy: 0 },
    vibration: latestSensorData.vibration,
    battery: 85,
    signal: 4,
    potholeDetected: latestSensorData.status !== 'Normal Road'
  });
});

app.listen(3001, () => {
  console.log('ESP32 bridge running on http://localhost:3001');
  console.log('Configure your ESP32 to POST data to http://YOUR_IP:3001/update');
});

// Sample ESP32 Arduino code to send data:
/*
#include <WiFi.h>
#include <HTTPClient.h>
#include <ArduinoJson.h>

void sendSensorData(float distance, float vibration) {
  HTTPClient http;
  http.begin("http://YOUR_COMPUTER_IP:3001/update");
  http.addHeader("Content-Type", "application/json");
  
  StaticJsonDocument<200> doc;
  doc["distance"] = distance;
  doc["vibration"] = vibration;
  doc["latitude"] = 0.00;
  doc["longitude"] = 0.00;
  doc["status"] = distance > 10 ? "POTHOLE DETECTED" : "Normal Road";
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  int httpResponseCode = http.POST(jsonString);
  http.end();
}
*/