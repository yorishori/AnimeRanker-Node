const https = require("node:http");
const fs = require("node:fs");
const nyaDB = require("./nyanDatabase.js");


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
	err:{
		db:{status:503, path:"static/html/err/dberr.html"},
		nyan:{status:418, path:"static/html/err/nyan.html"},
	}
}


/*===============================
=			FUNTIONS			=
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
				//routePost(req);break;
			default:
				res.head.status = 501;
				res.val = `Something went wrong with resquested method :(`;
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

/** Route from content type of request
 * 
 * @param {any}	res reference to custom reponse json (updatable)
 * @param {string} vPath virtual path from request
 */
function nyanGet(res, vPath){
	for(i=0; i<files.static.length; i++){
		let e = files.static[i];
		if (e.vpath===vPath){
			if(e.type==="text/html" && !nyaDB.nyActive()){
				nyanGetErr(res, files.err.db);
				console.log(`Internal ERROR [nyanRouting]: Database unavailble. Client requested "${vPath}" but will be delivered error page instead.`);
			}else{	
				getFile(res, e.path, e.type);
			}
			return;
		}
	}

	nyanGetErr(res, files.err.nyan);
	console.log(`Client requested a site that isn't in the list accepeted paths: "${vPath}"`);
	return;
}

/** Return the requested error page
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

// Funtions
exports.nyanReq = nyanReq;
