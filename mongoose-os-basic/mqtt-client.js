var mqtt = require('mqtt');
 
var name = "***TOKEN NAME***";
var pwd = "****TOKEN PSWD***";
 
var client = mqtt.connect('mqtt://' + name + ':' + pwd + '@broker.shiftr.io', {
  clientId: 'home-pc-sub'
});
 
client.on('connect', function(){
  console.log('client has connected!');
 
  client.subscribe('/my-esp8266/button_pressed');         //bağlanılan topic adı
 
  console.log("Connected!");
});
 
client.on('message', function(topic, message) {
  console.log('new message:', topic, message.toString());
});