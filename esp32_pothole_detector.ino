#include <WiFi.h>
#include <WebServer.h>
#include <ArduinoJson.h>
#include <Wire.h>
#include <MPU6050.h>
#include <SoftwareSerial.h>

// WiFi credentials
const char* ssid = "YOUR_WIFI_SSID";
const char* password = "YOUR_WIFI_PASSWORD";

// Pin definitions
#define TRIG_PIN 5
#define ECHO_PIN 18
#define GPS_RX 16
#define GPS_TX 17

// Sensor objects
MPU6050 mpu;
SoftwareSerial gpsSerial(GPS_RX, GPS_TX);
WebServer server(80);

// Global variables
float distance = 0;
float depth = 0;
float gyroX = 0, gyroY = 0, gyroZ = 0;
float gpsLat = 11.0168;
float gpsLng = 76.9558;
float gpsAccuracy = 5.0;
int batteryLevel = 100;
int signalStrength = 4;

void setup() {
  Serial.begin(115200);
  
  // Initialize pins
  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);
  
  // Initialize I2C and MPU6050
  Wire.begin();
  mpu.initialize();
  
  // Initialize GPS
  gpsSerial.begin(9600);
  
  // Connect to WiFi
  WiFi.begin(ssid, password);
  while (WiFi.status() != WL_CONNECTED) {
    delay(1000);
    Serial.println("Connecting to WiFi...");
  }
  
  Serial.println("WiFi connected!");
  Serial.print("IP address: ");
  Serial.println(WiFi.localIP());
  
  // Setup web server routes
  server.on("/", handleRoot);
  server.on("/data", handleData);
  server.enableCORS(true);
  server.begin();
  
  Serial.println("ESP32 Pothole Detector Ready!");
}

void loop() {
  server.handleClient();
  
  // Read sensors every 100ms
  readUltrasonic();
  readGyroscope();
  readGPS();
  updateBattery();
  
  delay(100);
}

void readUltrasonic() {
  // Send ultrasonic pulse
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);
  
  // Read echo
  long duration = pulseIn(ECHO_PIN, HIGH);
  distance = duration * 0.034 / 2;
  
  // Calculate pothole depth (assuming normal road distance is 30cm)
  float normalDistance = 30.0;
  depth = max(0.0f, normalDistance - distance);
}

void readGyroscope() {
  int16_t ax, ay, az, gx, gy, gz;
  mpu.getMotion6(&ax, &ay, &az, &gx, &gy, &gz);
  
  // Convert to degrees
  gyroX = gx / 131.0;
  gyroY = gy / 131.0;
  gyroZ = gz / 131.0;
}

void readGPS() {
  // Simulate GPS reading (replace with actual GPS parsing)
  if (gpsSerial.available()) {
    String gpsData = gpsSerial.readString();
    // Parse NMEA sentences here for real GPS data
    // For demo, we'll simulate movement
    gpsLat += (random(-10, 11) / 1000000.0);
    gpsLng += (random(-10, 11) / 1000000.0);
    gpsAccuracy = random(1, 10);
  }
}

void updateBattery() {
  // Simulate battery drain
  static unsigned long lastUpdate = 0;
  if (millis() - lastUpdate > 60000) { // Update every minute
    batteryLevel = max(0, batteryLevel - 1);
    lastUpdate = millis();
  }
  
  // Update signal strength based on WiFi
  signalStrength = map(WiFi.RSSI(), -100, -50, 1, 5);
}

void handleRoot() {
  String html = "<!DOCTYPE html><html><head><title>ESP32 Pothole Detector</title></head>";
  html += "<body><h1>ESP32 Pothole Detector</h1>";
  html += "<p>Device is running and sending data to dashboard.</p>";
  html += "<p>Access data at: <a href='/data'>/data</a></p>";
  html += "<p>IP Address: " + WiFi.localIP().toString() + "</p>";
  html += "</body></html>";
  
  server.send(200, "text/html", html);
}

void handleData() {
  // Create JSON response
  StaticJsonDocument<512> doc;
  
  // Ultrasonic data
  doc["ultrasonic"]["distance"] = round(distance * 10) / 10.0;
  doc["ultrasonic"]["depth"] = round(depth * 10) / 10.0;
  
  // Gyroscope data
  doc["gyroscope"]["x"] = round(gyroX * 10) / 10.0;
  doc["gyroscope"]["y"] = round(gyroY * 10) / 10.0;
  doc["gyroscope"]["z"] = round(gyroZ * 10) / 10.0;
  
  // GPS data
  doc["gps"]["latitude"] = gpsLat;
  doc["gps"]["longitude"] = gpsLng;
  doc["gps"]["accuracy"] = gpsAccuracy;
  
  // System data
  doc["battery"] = batteryLevel;
  doc["signal"] = signalStrength;
  doc["timestamp"] = millis();
  
  String jsonString;
  serializeJson(doc, jsonString);
  
  server.send(200, "application/json", jsonString);
}