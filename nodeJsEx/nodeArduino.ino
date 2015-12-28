void setup()
{
	Serial.begin(9600);
	pinMode(A0, INPUT);
	pinMode(13, OUTPUT);
}

void loop()
{
	//seri porttan gelen veriyi okuduk
	if(Serial.available() > 0){
	    char c = Serial.read();

	    //eğer gelen karakter # ise ledin durumunu değiştik
	    //eğer gelen karakter $ ise A0 daki gerilimi porta yazdırdık
	    switch(c)
	    {
	    	case '#':
	    		digitalWrite(13, !digitalRead(13));	//led durumu değiş
	    		break;
	    	case '$':
	    		Serial.println(analogRead(A0));	//analog değeri yazdır
	    		break;
	    	default:
	    		break;
	    }
	}
}
