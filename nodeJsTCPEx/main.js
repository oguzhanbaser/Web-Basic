var net = require('net');
var express = require('express');		//express framework unu çağırdık
var app = express();					
var http = require('http').Server(app);
var socket = require('socket.io')(http);
var port = 3000;

app.get('/', function(req ,res) {
	res.sendfile ('index.html');
});

socket.on('connection', function(conn){
    conn.on('lm35', function(p_data){
        client.write('b');
    });

    conn.on("ldr", function(p_data){
        client.write('d');
    });

    conn.on("led1", function(p_data){
        client.write('a');
    });

    conn.on("led2", function(p_data){
        client.write('c');
    });
});

var client = new net.Socket();

client.connect(61, '169.254.145.11', function() {
	console.log('Connected');
});

client.on('data', function(p_data) {
	console.log('Received: ' + p_data);
    
    var arr = p_data.toString().split("|");

    console.log(arr);

    if(arr[0] == "lm35")
    {
        socket.emit('lm35res', arr[1]);
    }else if(arr[0] == "ldr")
    {
        socket.emit('ldrres', arr[1]);
    }else if(arr[0] == "led1")
    {
        socket.emit('led1res', arr[1]);
    }else if(arr[0] == "led2")
    {
        socket.emit('led2res', arr[1]);
    }
	//client.destroy(); // kill client after server's response
});

client.on('close', function() {
	console.log('Connection closed');
});

http.listen(port,function(){
	console.log("Listeining: ", port);
});