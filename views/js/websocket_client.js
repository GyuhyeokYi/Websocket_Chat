var WebSocketClient = function(host, port, router, interval, callback) {
	var ws = new WebSocket("ws://" + host + ":" + port + "/" + router);

	interval = interval || 1000;

	function sendNumber() {
	   if (ws.readyState == 1) {
	       var number = Math.round(Math.random() * 0xFFFFFF);
	       ws.send(number.toString());
	       setTimeout(sendNumber, interval);
	   }
	 }

	ws.onopen = function() {
      // Web Socket is connected, send data using send()
      ws.send("Message to send");
      alert("Message is sent... and send number...");
      // sendNumber();
   };
	
   ws.onmessage = function (evt) { 
      var received_msg = evt.data;
      // alert("Message is received...");
      console.log('onmessage() = ' + received_msg);
      callback(received_msg);
   };
	
   ws.onclose = function() { 
      // websocket is closed.
      alert("Connection is closed..."); 
   };
		
   window.onbeforeunload = function(event) {
      socket.close();
   };

};