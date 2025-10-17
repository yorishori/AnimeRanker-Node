const https = require("node:http");
const fs = require("node:fs");
const nyaDB = require("./nyanDatabase.js");
const post_timeout_ms = 120*1000;


/*===============================
=			CONSTANTS			=
===============================*/
const files = {
	static:[
		// HTML
		{vpath:"/", path:"static/html/index.html", type:"text/html"},
		// CSS
		{vpath:"/output.css", path:"static/css/output.css", type:"text/css"},
		// JS
		{vpath:"/index.js", path:"static/js/index.js", type:"text/javascript"},
		{vpath:"/jquery.js", path:"lib/jquery-3.7.1.slim.min.js", type:"text/javascript"},
		// Assets
		{vpath:"/favicon.png", path:"static/assets/favicon.png", type:"image/png"}
	],
	db:[
		{vpath:"/saves/headers", type:"text/json"}
	],
	err:{
		db:{status:503, path:"static/html/err/dberr.html"},
		nyan:{status:418, path:"static/html/err/nyan.html"},
	}
}


/*===============================
=			FUNCTIONS			=
===============================*/
/** Return the response depending on request
 * 
 * @param {https.IncomingMessage} req http request
 * @returns json variable {head{status,opts},val};
 *    
 */
function nyanReq(req){
	let res = {head: {status: undefined,opts: undefined},val: undefined};
	let vPath = req.url;
	
	try{
		switch(req.method){
			case "GET":
				nyanGet(res, vPath);break;
			case "POST":
				nyanPost(res, req);break;
			default:
				res.head.status = 501;
				res.val = `Something went wrong with requested method :(`;
				console.log(`Client requested unimplemented method: "${req.method}"`);
				break;
		}
	}catch(err){
		res.head.status = 404;
		res.val = `Something went wrong with routing your HTTP request :(`;
		console.error(`Internal ERROR [nyanRouting]: ${err}`);
	}finally{	
		return res;
	}
}

/** 
 * 
 * @param {any}	res reference to custom reponse json (updatable)
 * @param {string} vPath virtual path from request
 */
function nyanGet(res, vPath){
	// Search static files
	for(i=0; i<files.static.length; i++){
		let e = files.static[i];
		if (e.vpath===vPath){
			if(e.type==="text/html" && !nyaDB.nyActive()){
				nyanGetErr(res, files.err.db);
				console.log(`Internal ERROR [nyanRouting]: Database unavailable. Client requested "${vPath}" but will be delivered error page instead.`);
			}else{	
				getFile(res, e.path, e.type);
			}
			return;
		}
	}

	// Search database


	nyanGetErr(res, files.err.nyan);
	console.log(`Client requested a site that isn't in the list accepted paths: "${vPath}"`);
	return;
}


/** 
 * 
 * @param {any}	res reference to custom response json (updatable)
 * @param {string} req post request
 */
function nyanPost(res, req){
	if(req.url==="/newData"){
		let body = [], end=false;
		req.on("data", d => {
			body.push(d);
		}).on("end",()=>{
			body = Buffer.concat(body).toString();
			// TODO: call db
			end=true;
		}).on("error", err => {
			nyanGetErr(res, files.err.nyan);
			return res;
		});
		
		res.head.status = 200;
		res.val = `File loaded. Redirecting... :)`;
		console.error(`Internal INFO [nyanRouting]: File Loaded`);

		return res;	
	}
}

/** 
 * 
 * @param {any}	res reference to custom reponse json (updatable)
 * @param {any} errType file error object
 */
function nyanGetErr(res, errType){
	res.head.status = errType.status;
	res.head.opts = {'Content-Type':"text/html"};
	res.val = fs.readFileSync(errType.path);
	return;
}

/**
 * 
 * @param {any} res reference to custom reponse json (updatable)
 * @param {string} path physicaḷ relative path to the file
 * @param {string} type type of file
 * @returns 
 */
function getFile(res, path, type){
	res.head.status = 200;
	res.head.opts = {'Content-Type':type};
	res.val = fs.readFileSync(path);
	return;
}


// Funtion Exports
exports.nyanReq = nyanReq;
