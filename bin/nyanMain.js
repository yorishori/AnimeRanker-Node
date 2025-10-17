const https = require('node:http');
const nyaR = require('./nyanRouting.js');

// Set hostname and port
const hostname = 'localhost';
const port = 1998;


//Create server and listen
const nyanServer = https.createServer((req,res) => {

	nyanRes = nyaR.nyanReq(req);

	if(!nyanRes.head.status || !nyanRes.val){
		res.writeHead(500);
		res.write('Error in request routing. Could not respond :(');
	}else if(nyanRes.head.opts){
		res.writeHead(nyanRes.head.status, nyanRes.head.opts);
		res.write(nyanRes.val);
	}else{
		res.writeHead(nyanRes.head.status);
		res.write(nyanRes.val);
	}

	res.end();

}).listen(port, hostname, () => {
	console.log(`Listener added at http://${hostname}:${port}/`);
});