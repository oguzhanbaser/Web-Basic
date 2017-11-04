
var express = require('express');		//express framework unu çağırdık
var app = express();					
var http = require('http').Server(app);
var socket = require('socket.io')(http);
var path = require('path');
var port = 3000;                    //socket.io ve sunucu port

var gpio = require('omega_gpio');       //gpio kütüphanesi
var LED = gpio.LED;                     //kütüphaneden led sınıfını çağırdık

app.use(express.static(path.join(__dirname)));      //kodlarının bulunduğu dosya yolunu
                                                    //projeye dahil ettik

var myLED1 = new LED(19, {on_when:"low"});      //19 numaralı pinde led tanımladık
var myLED2 = new LED(18, {on_when:"low"});      //18 numaralı pinde led tanımladık        

app.get('/', function(req ,res) {       //web sitesinin adres dizini
	res.sendfile ('indexOmega.html');        // '/' adresi istenince gönderilecek dosya
});

var ledStat1 = false, ledStat2 = false;         //led lerin ilk durumlarını tutan değişken

//socket.io için bağlantı event i
//bu kısımda nodejs sunucumuz web sitesi ile haberleşir
socket.on('connection', function(conn){

    //ledlerin ilk durumlarını bağlantı açılınca gönder
    socket.emit('led1res', ledStat1);           
    socket.emit('led2res', ledStat2);

    //led 1 butonuna basılmışsa
    conn.on("led1", function(p_data){
        myLED1.toggle();
        ledStat1 = !ledStat1;
        socket.emit('led1res', ledStat1);
        //console.log("Led1: " + myLED1.isLit());
    });

    //led 2 butonuna basılmışsa
    conn.on("led2", function(p_data){
        myLED2.toggle();
        ledStat2 = !ledStat2;
        socket.emit('led2res', ledStat2);
        //console.log("Led2: " + myLED2.isLit());
    });
});

http.listen(port,function(){                //sunucuyu seçilen portta başlat başlat
	console.log("Listeining: ", port);
});

//ctrl c 'ye basılmışsa ledleri deaktif et
process.on('SIGINT', function(){
    console.log("Cleaning up...");
      myLED1.destroy();
      myLED2.destroy();
      process.exit();
});