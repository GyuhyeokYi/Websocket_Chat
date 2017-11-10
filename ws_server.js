module.exports = ws_server;

var express = require('express');
var app = express();
var expressWs = require('express-ws')(app);

var port = 3000;
var name = 'WS One';

var os = require("os");
var ip = require('ip');
var dateFormat = require('dateformat');

var path    = require("path");
var BISON = require('bison');

// app.use(express.static(__dirname + '/views'));

// var wss = expressWs.getWss('/echo');
// var wss = expressWs.getWss('/chat/:roomId/user/:userId');

// Test URL
// ws://61.252.137.57:4300/chat/100/user/gyuhyeok

function ws_server(_port) {
	port = _port;
};

ws_server.prototype.start = function() {
	console.log('WebSocket Server start... lisening... ' + port);
	app.listen(port);
};
 
app.use(function (req, res, next) {
  console.log('middleware');
  req.testing = 'testing';
  return next();
});
 
app.get('/', function(req, res, next){
  console.log('get route', req.testing);
  res.end();
});

app.get('/client', function(req, res) {
     res.sendFile(path.join(__dirname+'/views/ws_client2.html'));
});


 
app.ws('/echo', function(ws, req) {
  ws.on('message', function(msg) {
    console.log(msg);
    ws.send('['+name+ ' = ' + os.hostname() + ' | ' + ip.address() + ':'+port+']'+'Server Message: = ' + msg);
  });
  console.log('socket', req.testing);
});

app.ws('/chat/:roomId/user/:userId', function(ws, req) {
	initConnection(ws, req);
	ws_chat_working(ws, req);
}); 

var roomlist = [];

var userlist = [];

var messages = [];

var count = 0;

function removeA(arr) {
    var what, a = arguments, L = a.length, ax;
    while (L > 1 && arr.length) {
        what = a[--L];
        while ((ax= arr.indexOf(what)) !== -1) {
            arr.splice(ax, 1);
        }
    }
    return arr;
};
 
function sendMessage(roomId, userKey, message) {
	roomlist[roomId].forEach(function(element) {
		if(element.userKey != userKey) {
			try { sendBISON(element, message); //element.send(message); 
      } catch(e) { }
		}   	
    });
};

function sendMessageUser(roomId, userKey, message) {
	roomlist[roomId].forEach(function(element) {
		if(element.userKey == userKey) {
			try { sendBISON(element, message); //element.send(message); 
      } catch(e) { }
			return;
		}    	
    });
};

var userKey = 0;

function sendBISON(ws, message) {
  // ws.send(BISON.encode(message));
  ws.send(message);
};

function initConnection(ws, req) {
	var id = parseInt(req.params.roomId);
  	console.log(id);
  	console.log("ROOM: " + roomlist[id]);

  	ws.userKey = userKey;
  	userKey++;

  	ws.userId  = req.params.userId;
  	ws.roomId = req.params.roomId;
  	console.log("ROOM ID: " + req.params.roomId);
  	userlist.push(ws);

  	
  	if(roomlist[id] == undefined)
  		roomlist[id] = [];
  	roomlist[id].push(ws);

  	var user = [];
  	roomlist[id].forEach( function(element) {
  		console.log("ROOM: " + element.userId);
  		user.push(element.userId);
  	});
  	
  	var message = '[' + ws.userId + ']님이 입장하셨습니다. ' + (dateFormat(new Date(), "isoDateTime"));

  	var json = {};
  	json.usercount = user.length;
  	json.userlist = user;
  	sendBISON(ws, JSON.stringify(json));//ws.send(JSON.stringify(json));
    // sendBISON(ws, json);
  	sendBISON(ws, message); //ws.send(message);

  	// message = { };
  	// message.users = user;
  	// ws.send(JSON.stringify(message));

  	// ws.send('대화참여자 = ' + JSON.stringify(user));

  	sendMessage(ws.roomId, ws.userKey, message);
  	sendMessage(ws.roomId, ws.userKey, JSON.stringify(json));
   	/*
   	messages.forEach(function(message){
    	ws.send(message);
  	});
  	*/
};

function ws_chat_working(ws, req) {
	ws.on('close', function(reasonCode, description) {
	    console.log((new Date()) + ' Peer ' + ws.remoteAddress + ' disconnected.');
	    console.log(req.params.roomId + ' : ' + req.params.userId);

	    var roomId = parseInt(req.params.roomId);

	    removeA(roomlist[roomId], ws);
	    sendMessage(roomId, ws.userKey, '[' + ws.userId + ']님이 퇴장하셨습니다. ' + (dateFormat(new Date(), "isoDateTime")));

	    var json = {};
  		json.usercount = roomlist[roomId].length;

  		var user = [];
	  	roomlist[roomId].forEach( function(element) {
	  		console.log("ROOM: " + element.userId);
	  		user.push(element.userId);
	  	});
	  	
  		json.userlist = user;
  		sendMessage(ws.roomId, ws.userKey, JSON.stringify(json));

	});

  	ws.on('message', function(msg) {
	  	var message = '['+ req.params.userId + ']: ' + msg;
	    console.log(message);
	    messages.push(message);
	    var roomId = parseInt(req.params.roomId);
	    sendMessage(roomId, ws.userKey, message);
  	});
};



