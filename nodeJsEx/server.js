var express = require('express');		//express framework unu çağırdık
var app = express();					
var http = require('http').Server(app);
var path = require('path');
var socket = require('socket.io')(http);
var port = 3000;

////////////////////////////////////////////////////////
//arduino kısmı/////////////////////////////////////////
var com = require("serialport"); 	//seri port kütüphanesini çağırdık
var portName = "/dev/ttyACM0";		//default port adı
var serialPort;

var ledDurum = false;


//var olan portları arayıp sonuncuya bağlandık
com.list(function (err, ports) {
	ports.forEach(function(port) {
    //console.log(port.comName);

    	portName = port.comName;
	});
});

//portun bulunabilmesi için 1 sn gecikme verdik
setTimeout(function(){
	serialPort = new com.SerialPort(portName, {
		baudrate: 9600,
		parser: com.parsers.readline('\r\n')
	});

	//hata varsa hatayı gösterdik yoksa porta bağlandık
	serialPort.on('open',function(error) {
		if(error)
			console.log("failed to open" + error);
		else
    		console.log('Port open');
  	});
}, 1000);

////////////////////////////////////////////////////////
//server kısmı//////////////////////////////////////////

app.use(express.static(path.join(__dirname)));

app.get('/', function(req ,res) {
	res.sendfile (__dirname + '/indexPot.html');
});

//server ile socketi açtık
socket.on('connection', function(io){
	console.log("Biri baglandı");
	//led butonuna basılmışsa led durumunu değiştir
	io.on('_led', function(){		//client ten gelen _led isimli event
		console.log("Butonuna basıldı");
		if(serialPort.isOpen())
		{
			serialPort.write("#\n");	//arduino ya led yanması için # gönderdik
			ledDurum = !ledDurum;
			io.emit('_ledRes', ledDurum == true ? "Led yandı" : "Led sondu");
		}
	});

	//pot butonuna basılmışsa pottaki değeri okuyup geri dön
	io.on('_pot', function(){		//client ten gelen _pot isimli event
		console.log("Butona basıldı");
		if(serialPort.isOpen())
		{
			serialPort.write("$\n");	//arduino ya A0 dan veri okuması için $ gönderdik
			serialPort.on('data', function(_data)
			{
				io.emit('_potRes', _data);		//client e geri arduino dan data
												//gönderdik
			});			
		}
	})
});

//portu dinle
http.listen(port,function(){
	console.log("Listeining: ", port);
});


