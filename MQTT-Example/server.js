var mqtt = require('mqtt');				//include library

var my_token_name = "**TOKEN_NAME**";            //your token name
var my_token = "**TOKEN**";          //your token code

var client = mqtt.connect('mqtt://' + my_token_name +':' + my_token + '@broker.shiftr.io');

//subscribed topics
client.subscribe('sens/val1');
client.subscribe('sens/val2');
client.subscribe('/esp8266/led1');
client.subscribe('/esp8266/led2');
client.subscribe('/esp8266/led3');

//subscribed topic callback
client.on('message', function(topic, message, packet) {
    console.log(topic + ' ' + message);
});

var stat1 = 1;
setInterval(function(){
	var msgStr = String(stat1 = !stat1);
	client.publish('led', msgStr);				//send a value in 1 second interval
}, 2000);
