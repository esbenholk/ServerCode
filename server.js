const http = require("http");
const express = require("express");
const cors = require("cors");
// const { cloudinary } = require("./utils/cloudinary");
// const webrtc = require("wrtc");
const bodyParser = require("body-parser");
var path = require("path");

const stun = require("stun");

stun.request("stun.l.google.com:19302", (err, res) => {
  if (err) {
    console.error("stun doesnt work", err);
  } else {
    const { address } = res.getXorAddress();
    console.log("your ip", address);
  }
});

const PORT = process.env.PORT || 8123;



const roomName = "bddd_dungeon";

const app = express();
const server = http.createServer(app);


app.use(cors());
// app.use(router);
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

app.use(express.static('public'))
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));


const io = require('socket.io')(server, { //8123 is the local port we are binding the demo server to
  pingInterval: 30005,		//An interval how often a ping is sent
  pingTimeout: 5000,		//The time a client has to respont to a ping before it is desired dead
  upgradeTimeout: 3000,		//The time a client has to fullfill the upgrade
  allowUpgrades: true,		//Allows upgrading Long-Polling to websockets. This is strongly recommended for connecting for WebGL builds or other browserbased stuff and true is the default.
  cookie: false,			//We do not need a persistence cookie for the demo - If you are using a load balöance, you might need it.
  serveClient: true,		//This is not required for communication with our asset but we enable it for a web based testing tool. You can leave it enabled for example to connect your webbased service to the same server (this hosts a js file).
  allowEIO3: false,			//This is only for testing purpose. We do make sure, that we do not accidentially work with compat mode.
  cors: {
    origin: "*"				//Allow connection from any referrer (most likely this is what you will want for game clients - for WebGL the domain of your sebsite MIGHT also work)
  }
});


//This funciton is needed to let some time pass by between conversation and closing. This is only for demo purpose.
function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}  

var GameSocketID;

// App Code starts here

console.log('Starting Socket.IO demo server', );

io.on('connection', (socket) => {

  socket.join(roomName);
	console.log('[' + (new Date()).toUTCString() + '] game connecting');
	

	socket.on('connect', (data) => {
		console.log('[' + (new Date()).toUTCString() + '] there is a connection ' + socket.id);
    // io.sockets.connected[socket.id].join(roomName);
	});

  socket.on('game_connection', (data) => {
		console.log('[' + (new Date()).toUTCString() + '] gameconnection ' + socket.id);
    GameSocketID = socket.id;
    // io.sockets.connected[socket.id].join(roomName);
	});

  socket.on("hello", (data) => {
		console.log("someone says hi", socket.id, data);

    io.to(GameSocketID).emit('hello', data);

    socket.emit("hello", data);
	});
	socket.on('Goodbye', async (data) => {
		console.log('[' + (new Date()).toUTCString() + '] Client said "' + data + '" - The server will disconnect the client in five seconds. You can now abort the process (and restart it afterwards) to see an auto reconnect attempt.');
		await sleep(5000); //This is only for demo purpose.
		socket.disconnect(true);
	});

	socket.on('disconnect', (data) => {
		console.log('[' + (new Date()).toUTCString() + '] Bye, client ' + socket.id);
	});



 



	});



app.get("/*", (req, res) => {  res.sendFile(path.join(__dirname, "", "index.html"));


});



server.listen(PORT, () => console.log(`Server has started.`, PORT));
