/*
  Basic ESP8266 MQTT example

  This sketch demonstrates the capabilities of the pubsub library in combination
  with the ESP8266 board/library.

  It connects to an MQTT server then:
  - publishes "hello world" to the topic "outTopic" every two seconds
  - subscribes to the topic "inTopic", printing out any messages
    it receives. NB - it assumes the received payloads are strings not binary
  - If the first character of the topic "inTopic" is an 1, switch ON the ESP Led,
    else switch it off

  It will reconnect to the server if the connection is lost using a blocking
  reconnect function. See the 'mqtt_reconnect_nonblocking' example for how to
  achieve the same result without blocking the main loop.

  To install the ESP8266 board, (using Arduino 1.6.4+):
  - Add the following 3rd party board manager under "File -> Preferences -> Additional Boards Manager URLs":
       http://arduino.esp8266.com/stable/package_esp8266com_index.json
  - Open the "Tools -> Board -> Board Manager" and click install for the ESP8266"
  - Select your ESP8266 in "Tools -> Board"

*/

#include <ESP8266WiFi.h>
#include <PubSubClient.h>

// Update these with values suitable for your network.

const char* ssid = "TTNET_AirTies_Air5650_4AY8";
const char* password = "YF6bfaK2p6";
const char* mqtt_server = "broker.shiftr.io";

WiFiClient espClient;
PubSubClient client(espClient);
long lastMsg = 0;
char msg[50];
int value = 0;

int led1 = 13, led2 = 12, led3 = 14;

void setup() {
  pinMode(led1, OUTPUT);  
  pinMode(led2, OUTPUT); 
  pinMode(led3, OUTPUT);    
  Serial.begin(9600);
  setup_wifi();
  client.setServer(mqtt_server, 1883);
  client.setCallback(callback);
}

void setup_wifi() {

  delay(10);
  // We start by connecting to a WiFi network
  Serial.println();
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, password);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
}

void callback(char* topic, byte* payload, unsigned int length) {

  //show incoming message
  Serial.print("Message arrived [");
  Serial.print(topic);
  Serial.print("] ");
  for (int i = 0; i < length; i++) {
    Serial.print((char)payload[i]);
  }
  Serial.println();

  //toggle led with incoming message
  if (strcmp(topic, "/esp8266/led1") == 0)       //if topic name led1
  {
    if ((char)payload[0] == '1') {      //if message '1' 
      digitalWrite(led1, LOW);
    } else {
      digitalWrite(led1, HIGH);  
    }
  }else if (strcmp(topic, "/esp8266/led2") == 0) //if topic name led2
  {
    if ((char)payload[0] == '1') {
      digitalWrite(led2, LOW);
    } else {
      digitalWrite(led2, HIGH);  
    }
  }else if (strcmp(topic, "/esp8266/led3") == 0) //if topic name led3
  {
    if ((char)payload[0] == '1') {
      digitalWrite(led3, LOW);
    } else {
      digitalWrite(led3, HIGH);  
    }
  }
}

void reconnect() {
  // Loop until we're reconnected
  while (!client.connected()) {
    Serial.print("Attempting MQTT connection...");
    // Attempt to connect
    if (client.connect("esp8266", "my-key-61", "8f078356f5b1d029")) {
      Serial.println("connected");
      // Once connected, publish an announcement...
      client.publish("outTopic", "hello world");
      // ... and resubscribe
      client.subscribe("/esp8266/led1");
      client.subscribe("/esp8266/led2");
      client.subscribe("/esp8266/led3");
    } else {
      Serial.print("failed, rc=");
      Serial.print(client.state());
      Serial.println(" try again in 5 seconds");
      // Wait 5 seconds before retrying
      delay(5000);
    }
  }
}
void loop() {

  if (!client.connected()) {
    reconnect();
  }
  
  client.loop();

  if (millis() - lastMsg > 2000) {
    value = analogRead(A0);                     //read analog value
    sprintf (msg, "{\"analog1\": %d}", value);  //write to buffer as a json
    Serial.print("Publish message: ");
    Serial.println(msg);
    client.publish("sens/val1", msg);           //publish message
    lastMsg = millis();
  }
}
