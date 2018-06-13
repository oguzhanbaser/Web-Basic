load('api_config.js');        //cfg parametreleri
load('api_rpc.js');           
load('api_dht.js');           //dht kütüphanesi
load('api_timer.js');         //timer kütüphanesi
load('api_gpio.js');          //gpio kütüphanesi
load('api_mqtt.js');          //mqtt kütüphanesi

let pin = Cfg.get('app.dhtPin');          //config dosyasından dhtPin i çek
let led1 = Cfg.get('app.ledPin1');        //config dosyasından ledPin1 i çek
let led2 = 13;                            //led2 yi 13 numaralı pinde kullan
let btn = Cfg.get('app.btn');             //config dosyasından buton pinini çek

let dht = DHT.create(pin, DHT.DHT11);     //dht11 sınıfını oluştur
GPIO.set_mode(led1, GPIO.MODE_OUTPUT);    //led1 çıkış
GPIO.set_mode(led2, GPIO.MODE_OUTPUT);    //led2 çıkış
GPIO.set_mode(btn, GPIO.MODE_INPUT);      //buton giriş

GPIO.set_button_handler(btn, GPIO.PULL_UP, GPIO.INT_EDGE_NEG, 50, function(x) {
  let topic = Cfg.get('device.id') + '/button_pressed';                             //topic ismi
  let message = JSON.stringify({"temp": dht.getTemp(), "hum": dht.getHumidity()});  //gönderilecek mesaj
  GPIO.toggle(led2);                                                                //her butona basılınca ledin durumunu değiştir
  let ok = MQTT.pub(topic, message, 1);                                             //mqtt ile veriyi gönder
  print('Published:', ok ? 'yes' : 'no', 'topic:', topic, 'message:', message);     //konsola veriyi yazdır
}, true);

Timer.set(2000, true, function() {
  print('Temperature:', dht.getTemp());
  GPIO.toggle(led1); 
}, null);

RPC.addHandler('Temp.Read', function(args) {
  return { value: dht.getTemp() };
});