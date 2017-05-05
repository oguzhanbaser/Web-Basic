var net = require('net');
var express = require('express');		//express framework unu çağırdık
var app = express();					
var http = require('http').Server(app);
var socket = require('socket.io')(http);
var port = 3000;                    //socket.io ve sunucu port

app.get('/', function(req ,res) {       //web sitesinin adres dizini
	res.sendfile ('index.html');        // '/' adresi istenince gönderilecek dosya
});

//socket.io için bağlantı event i
//bu kısımda nodejs sunucumuz web sitesi ile haberleşir
socket.on('connection', function(conn){
    conn.on('lm35', function(p_data){   
        client.write('b');              //lm35 isteği gelmişse Arduino ya aktar
    });

    conn.on("ldr", function(p_data){
        client.write('d');              //ldr isteği gelmişse Arduino ya aktar
    });

    conn.on("led1", function(p_data){
        client.write('a');              //led1 isteği gelmişse Arduino ya aktar
    });

    conn.on("led2", function(p_data){
        client.write('c');              //led2 isteği gelmişse Arduino ya aktar
    });
});

//tcp soket bağlantısı
//bu bağlantı Arduino ile nodejs sunucusu arasındadır.
var client = new net.Socket();

client.connect(61, '169.254.145.11', function() {       //bağlandığımız port, IP
	console.log('Connected');
});

//tcp server' da data event' i soketten veri geldiği zaman oluşur
client.on('data', function(p_data) {
	console.log('Received: ' + p_data);         //gelen veriyi görüntüle
    
    var arr = p_data.toString().split("|");     //gelen veriyi | ile arasında ayır

    console.log(arr);                           //ayrılmış veriyi göster

    //gelen veriyi anahtar kelimeye göre web sitesine gönder
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
});

http.listen(port,function(){                //sunucuyu seçilen portta başlat başlat
	console.log("Listeining: ", port);
});