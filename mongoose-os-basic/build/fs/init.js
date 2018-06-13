load('api_config.js');
load('api_rpc.js');
load('api_dht.js');
load('api_timer.js');
load('api_gpio.js');
load('api_mqtt.js');

let pin = Cfg.get('app.dhtPin');
let led1 = Cfg.get('app.ledPin1');
let led2 = 13;
let btn = Cfg.get('app.btn');
let dht = DHT.create(pin, DHT.DHT11);

GPIO.set_mode(led1, GPIO.MODE_OUTPUT);
GPIO.set_mode(led2, GPIO.MODE_OUTPUT);
GPIO.set_mode(btn, GPIO.MODE_INPUT);

GPIO.set_button_handler(btn, GPIO.PULL_INPUT, GPIO.INT_EDGE_NEG, 50, function(x) {
  let topic = Cfg.get('device.id') + '/button_pressed';
  let message = JSON.stringify({"temp": dht.getTemp(), "hum": dht.getHumidity()});
  GPIO.toggle(led2);
  let ok = MQTT.pub(topic, message, 1);
  print('Published:', ok ? 'yes' : 'no', 'topic:', topic, 'message:', message);
}, true);

Timer.set(2000, true, function() {
  print('Temperature:', dht.getTemp());
  GPIO.toggle(led1);
}, null);

RPC.addHandler('Temp.Read', function(args) {
  return { value: dht.getTemp() };
});