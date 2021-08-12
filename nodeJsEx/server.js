var express = require('express');		//express framework unu çağırdık
var app = express();					
var http = require('http').Server(app);
var path = require('path');
var socket = require('socket.io')(http);
var port = 3000;

////////////////////////////////////////////////////////
//arduino kısmı/////////////////////////////////////////

var portName = "COM18";		//port adı
var baudRate = 9600;        //port baud rate

var ledDurum = false;
const SerialPort = require('serialport');   //seri port kütüphanesini çağırdık
const Readline = require('@serialport/parser-readline');
var portIsOpen = false;

//var olan portları arayıp sonuncuya bağlandık
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
//port hatası alıyorsanız bu kısmı silip portu 'portName' isimli değişkeni değişerek giriniz!!!!!!!!!!!!!!!!!!!!!!!!!
//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
SerialPort.list().then(function(pData){
    portName = pData[0].path;
});


//portun bulunabilmesi için 1 sn gecikme verdik
setTimeout(function(){
    const sPort = new SerialPort(portName, {
        baudRate: baudRate,
        autoOpen: true
    });
    const parser = sPort.pipe(new Readline({ delimiter: '\r\n' }));

	//hata varsa hatayı gösterdik yoksa porta bağlandık
	sPort.on('open',function(error) {
		if(error)
			console.log("failed to open" + error);
		else
    		console.log('Port open');
            portIsOpen = true;
  	});


    ////////////////////////////////////////////////////////
    //server kısmı//////////////////////////////////////////

    app.use(express.static(path.join(__dirname)));

    app.get('/', function(req ,res) {
        res.sendFile (__dirname + '/indexPot.html');
    });

    //server ile socketi açtık
    socket.on('connection', function(io){
        console.log("Biri baglandı");
        //led butonuna basılmışsa led durumunu değiştir
        io.on('_led', function(){		//client ten gelen _led isimli event
            console.log("Butona basıldı");
            if(portIsOpen)
            {
                sPort.write("#\n");	//arduino ya led yanması için # gönderdik
                ledDurum = !ledDurum;
                io.emit('_ledRes', ledDurum == true ? "Led yandı" : "Led sondu");
            }
        });

        //pot butonuna basılmışsa pottaki değeri okuyup geri dön
        io.on('_pot', function(){		//client ten gelen _pot isimli event
            console.log("Butona basıldı");
            if(portIsOpen)
            {
                sPort.write("$\n");	//arduino ya A0 dan veri okuması için $ gönderdik

                parser.on('data', function(_data)
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


}, 1000);

