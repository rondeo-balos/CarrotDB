const http = require("http");
const fs = require("fs");
const qs = require("querystring");
const base64 = require("./lib/base64");
const _ = require("underscore")._;

var self = "127.0.0.1";
var port = "3000";

var server = http.createServer((req,res)=>{
	get(req,res);
});

server.listen(port,self,()=>{
	console.log('Server running at http://'+self+':'+port+'/');
});

var config = {
	"granted_access":"http://localhost",
	"sandbox":true,
	"api":"amtmaGhlb2pmZGhma2RoZ29qa2RzZ2toc2RnZg=="
};
var origin;

function get(req,res){
	origin = req.headers.origin;
	if(req.method==="POST"){
		var body = '';
		req.on('data',function(data){
			body+=data;
			if(body.length>1e6)
				req.connection.destroy();
		});
		req.on('end',function(){
			var post = qs.parse(disinfect(body,"%"));
			//database
			if((data=set(post,"set"))!==false){
				checktoken(res,post,function(){
					setdb(res,post.collection,data);
				});
			}else if((data=set(post,"clear"))!==false){
				checktoken(res,post,function(){
					cleardb(res,data);
				});
			}else if((data=set(post,"push"))!==false){
				checktoken(res,post,function(){
					pushdb(res,post.collection,data,post.data);
				});
			}else if((data=set(post,"collection"))!==false){
				checktoken(res,post,function(){
					retrievedb(dbase,res,data);
				});
			}else{
				//auth
				if((data=set(post,"me"))!==false){
					checktoken(res,post,function(){
						retrievedb(users,res,"users/"+data);
					});
				}else if((data=set(post,"signup"))!==false){
					checktoken(res,post,function(){
						aupushdb(res,base64.encode(Date.now().toString()),data);
					});
				}else if((data=set(post,"signin"))!==false){
					checktoken(res,post,function(){
						aufind(res,data);
					});
				}else if(set(post,"tempsignin")!==false){
					checktoken(res,post,function(){
						autpushdb(res,base64.encode(Date.now().toString()));
					});
				}else if((data=set(post,"update"))!==false){
					checktoken(res,post,function(){
						auupdate(res,data,post.data);
					});
				}else if((data=set(post,"migrate"))!==false){
					checktoken(res,post,function(){
						aumigrate(res,data,post.data);
					});
				}else
					s_end(res,"404","Page Not Found!");
			}
		});
	}else{
		var get = qs.parse(disinfect(req.url,"%"));
		if((data=set(get,"api"))!==false){
			if(get.api===config.api){
				genToken(res,data);
			}else{
				s_end(res,"403","Invalid Api!");
			}
		}else if(req.url==="/carrotdb.js"){
			res.writeHead(200,{
				'Content-Type':'text/javascript',
				'Access-Control-Allow-Origin':(origin||("http://"+self+":"+port))
			});
			fs.readFile("./public/carrotdb.js",function(err,data){
				if(err) res.end();
				res.end(data.toString('utf8'));
			});
		}else
			s_end(res,"404","Not Found!");
	}
}

function set(post,key){
	var retval = false;
	Object.keys(post).forEach(function(e){
		if(e===key)
			retval = post[key];
	});
	return retval;
}

function s_end(res,status,msg,data){
	res.writeHead(status,{
		'Content-Type':'text/plain',
		'Access-Control-Allow-Origin':config.sandbox?(origin||("http://"+self+":"+port)):config.granted_access
	});
	var response = {
		"status":status,
		"msg":msg||"",
		"data":data||{}
	}
	res.end(JSON.stringify(response));
	savechanges();
}

function checktoken(res,post,fun){
	if(post.api===config.api){
		fs.readFile("./temp/"+post.token,function(err,data){
			if(!err){
				fs.unlink("./temp/"+post.token,function(err){});
				if(post.token===data.toString('utf8')){
					fun();
				}
			}else{
				s_end(res,"500",err);
			}
		});
	}else{
		s_end(res,"403","Invalid Api, Token! Data Breach has been detected.");
	}
}

function genToken(res,api){
	var token = base64.encode(base64.decode(api)+Date.now());
	fs.writeFile("./temp/"+token,token,function(err){
		if(err)
			s_end(res,"500",err);
		else
			s_end(res,"200","Success",{
				"token":token
			});
	});
}

//for database
var dbase = require("./db/database.json");
var rules = "./db/rules.json";
var users = require("./db/users.json");

function auupdate(res,id,pdata){
	if(typeof pdata === 'string')
		pdata = JSON.parse(pdata.toString('utf8')||"{}");

	try{
		ref = users["users"][id];
		if(ref.user==pdata.user && ref.pass==pdata.pass){
			if(ref.user!==pdata.usern){
				var search = _.find(json.users,{user:pdata.usern});
				if(typeof search === 'undefined'){
					ref["user"] = pdata.usern;
				}else
					s_end(res,"403","This mobile is already registered with another account");
			}
			if(ref.pass!==pdata.passn){
				ref["pass"] = pdata.passn;
			}
			ref["data"] = pdata.data;
			ref["verified"] = true;
			users = addProps(users,"users/"+id,ref);
			users = dataFilter(users);
			s_end(res,"200","Success",ref);
		}else
			s_end(res,"403","Invalid password");
	}catch(err){
		console.log(err);
		s_end(res,"500",err);
	}
}

function aumigrate(res,id,pdata){
	if(typeof pdata === 'string')
		pdata = JSON.parse(pdata.toString('utf8')||"{}");

	var search = _.find(users.users,{user:pdata.user});
	if(typeof search === 'undefined'){
		try{
			var newj = users["users"][id];
			newj["user"] = pdata.user;
			newj["pass"] = pdata.pass;
			newj["data"] = pdata.data;
			newj["verified"] = true;
			users = addProps(users,"users/"+id,newj);
			users = dataFilter(users);
			s_end(res,"200","Success",{
				"uid":id
			});
		}catch(err){
			console.log(err);
			s_end(res,"500",err);
		}
	}else
		s_end(res,"403","This mobile is already registered with another account.");
}

function aupushdb(res,id,pdata){
	if(typeof pdata === 'string')
		pdata = JSON.parse(pdata.toString('utf8')||"{}");
	
	var search = _.find(users.users,{ user:pdata.user });
	if(typeof search === 'undefined'){
		try{
			pdata.verified = true;
			users = addProps(users,"users/"+id,pdata);
			users = dataFilter(users);
			s_end(res,"200","Success",{
				"uid":id
			});
		}catch(err){
			console.log(err);
			s_end(res,"500",err);
		}
	}else
			s_end(res,"403","This mobile is already registered with another account.");
}

function autpushdb(res,id){
	try{
		users = addProps(users,"users/"+id,{"user":"","pass":"","verified":false});
		users = dataFilter(users);
		s_end(res,"200","Success",{
			"uid":id
		});
	}catch(err){
		console.log(err);
		s_end(res,"500",err);
	}
}

function aufind(res,pdata){
	if(typeof pdata === 'string')
		pdata = JSON.parse(pdata.toString('utf8')||"{}");

	var search = _.find(users.users,{ user:pdata.user });
	if(typeof search !== 'undefined'){
		search = _.find(users.users,{ user:pdata.user, pass:pdata.pass });
		if(typeof search !== 'undefined'){
			index = _.findKey(users.users,search);
			search["uid"] = index;
			s_end(res,"200","Welcome",search);
		}else
			s_end(res,"500","Invalid Credentials");
	}else
		s_end(res,"500","Phone/Email not Found.");
}

//------//

function cleardb(res,ref){
	try{
		dbase = addProps(dbase,ref,{});
		dbase = dataFilter(dbase);
		s_end(res,"200","Success");
	}catch(err){
		console.log(err);
		s_end(res,"500",err);
	}
}

function setdb(res,ref,pdata){
	try{
		dbase = addProps(dbase,ref,pdata);
		dbase = dataFilter(dbase);
		s_end(res,"200","Success");
	}catch(err){
		console.log(err);
		s_end(res,"500",err);
	}
}

function pushdb(res,ref,id,pdata){
	try{
		dbase = addProps(dbase,ref+"/"+id,pdata);
		dbase = dataFilter(dbase);
		s_end(res,"200","Success",{
			"key":id
		});
	}catch(err){
		console.log(err);
		s_end(res,"500",err);
	}
}

function retrievedb(current,res,ref){
	var refs = ref.split(/\//);
	var temp = current;
	try{
		refs.forEach(function(e){
			if(e.length!==0)
				temp = temp[e];
		});
		s_end(res,"200","Success",temp);
	}catch(err){
		console.log(err);
		s_end(res,"500",err,{});
	}
}

//credits: stackoverflow.com:columbos
// this method is recursive
function addProps(json,arr,val){
	if(typeof arr === 'string'){
		arr = arr.replace(RegExp("//","g"),"/");
		arr = arr.split('/');
	}

	if(typeof val === 'string'){
		val = JSON.parse(val);
	}

	json[arr[0]] = json[arr[0]] || {};

	var tmp = json[arr[0]];

	if(arr.length>1){
		arr.shift();
		addProps(tmp,arr,val);
	}else
		json[arr[0]] = val;

	return json;
}

//credits: stackoverflow.com:Egor Stambakio
// this method is non-recursive
function dataFilter(jsonString) {
    var res = JSON.parse(JSON.stringify(jsonString), (k, v) => {
  	return (v === null // delete null values
    || (Array.isArray(v) && v.length === 0) // delete empty arrays
    || (typeof v === 'object' && Object.keys(v).length === 0)) // delete empty objects
      ? undefined : v // else return the value
	});
	return res;
}

/*fs.readFile('file',function(err,data){});*/
/*fs.appendFile('file','str',function(err){});*/
/*fs.writeFileSync('file','str',function(err){});*/
/*fs.unlink('file',function(err){});*/
/*fs.rename('old','new',function(err){});*/

function disinfect(stringval,whitelists){
	return stringval.replace(RegExp("[^a-zA-Z0-9=&"+(whitelists||"")+"]","g"),"");
}

function savechanges(){
	fs.writeFile('./db/users.json',JSON.stringify(dataFilter(users)),function(err){});
	fs.writeFile('./db/database.json',JSON.stringify(dataFilter(dbase)),function(err){});
}