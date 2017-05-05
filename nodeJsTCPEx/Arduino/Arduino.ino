

#include <SPI.h>
#include <Ethernet.h>

//sıradan bir mac adresi atadık
byte mac[] = {
  0xDE, 0xAD, 0xBE, 0xEF, 0xFE, 0xED
};

//IP ayarlamaları
//aşağıdaki gibi ayarlama yaparsanız sorun ile kaşılaşmazsınız
IPAddress ip(169, 254, 145, 11);
IPAddress myDns(169, 254, 1, 1);
IPAddress gateway(169, 254, 1, 1);
IPAddress subnet(255, 255, 0, 0);

int led1 = 3, led2 = 5;
String sendVal = "";

//kullanmak üzere seçtiğimiz port
EthernetServer server(61);              //Trabzon' dan selamlar .. :)

boolean alreadyConnected = false; //ilk kez bağlantı yapılıyormu kontrol değişkeni

void setup() {
  // Shield kurulumu
  Ethernet.begin(mac, ip, myDns, gateway, subnet);
  // server başlattık ve client' leri dinlemeye başladık
  server.begin();

  //Seri haberleşmeyi başlattık
  Serial.begin(9600);

  pinMode(led1, OUTPUT);
  pinMode(led2, OUTPUT);

  //IP adresini serial monitör' e yazdırdık
  Serial.print("TCP server address:");
  Serial.println(Ethernet.localIP());
}

unsigned long lastTime = 0;

void loop() {
  // bağlanan client' ları yakaladık
  EthernetClient client = server.available();

  if (client) {
    //ilk kez bağlantı yapılıyorsa tampondaki verileri temizledik
    if (!alreadyConnected) {
      // clear out the input buffer:
      client.flush();
      Serial.println("Baglantı Var");
      alreadyConnected = true;
    }

    //client den veri geliyor mu?
    if (client.available() > 0) {


      // read the bytes incoming from the client:
      char thisChar = client.read();
      // echo the bytes back to the client:
      Serial.print("Read Char: ");
      Serial.print(thisChar);
      Serial.print(" ");

      switch(thisChar)
      {
          case 'a':
            digitalWrite(led1, !digitalRead(led1));
            sendVal = "led1|" + String(digitalRead(led1)) + "|";
            client.print(sendVal);
            break;
          case 'b':
            sendVal = "lm35|" + String(analogRead(A0) * 0.48828) + "|";
            client.print(sendVal);
            break;
          case 'c':
            digitalWrite(led2, !digitalRead(led2));
            sendVal = "led2|" + String(digitalRead(led2)) + "|";
            client.print(sendVal);
            break;
          case 'd':
            sendVal = "ldr|" + String(analogRead(A1)) + "|";
            client.print(sendVal);
            break;

      }

      Serial.print("Gecen Zaman: ");
      Serial.println(millis() - lastTime);
      lastTime = millis();

    }
  }

}


