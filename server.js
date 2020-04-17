const http = require("http");
const fs = require("fs");
const qs = require("querystring");
const base64 =require("./lib/base64");

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
			current = dbase;
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
					//create a new node
					pushdb(res,post.collection,data,post.data);
				});
			}else if((data=set(post,"collection"))!==false){
				checktoken(res,post,function(){
					//return a nodes
					retrievedb(res,data);
				});
			}else{
				current = users;
				if((data=set(post,"signup"))!==false){
					checktoken(res,post,function(){
						//register account
						
					});
				}else
					s_end(res,"404","Not Found!");
			}
		});
	}else{
		var get = qs.parse(disinfect(req.url,"%"));
		if((data=set(get,"api"))!==false){
			if(get.api===config.api){
				genToken(res,get.api);
			}else{
				s_end(res,"403","Invalid Api!");
			}
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
}

function checktoken(res,post,fun){
	if(post.api===config.api){
		fs.readFile("./temp/"+post.token,function(err,data){
			if(!err){
				if(post.token===data.toString('utf8')){
					fun();
					fs.unlink("./temp/"+post.token,function(err){});
				}
			}else{
				s_end(res,"403",err);
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
			s_end(res,"403",err);
		else
			s_end(res,"200","Success",{
				"token":token
			});
	});
}

//for database
var dbase = "./db/database.json";
var rules = "./db/rules.json";
var users = "./db/users.json";
var current = dbase;

function cleardb(res,ref){
	fs.readFile(current,function(err,data){
		if(err) s_end(res,"403",err);
		var json = JSON.parse(data.toString('utf8')||"{}");
		var evalstr = "javascript:json"+toEvaluation(ref);
		try{
			eval(evalstr+" = {}");
			s_end(res,"200","Success");
		}catch(err){
			s_end(res,"403",err);
		}
		fs.writeFile(current,JSON.stringify(json),function(err){
			if(err){
				s_end(res,"403",err);
			}
		});
	});
}

function setdb(res,ref,pdata){
	fs.readFile(current,function(err,data){
		if(err) s_end(res,"403","Denied");
		var json = JSON.parse(data.toString('utf8')||"{}");
		//disinfect(pdata.toString('utf8'),"{}\'\'\"\":,\s\n/,;_-")
		var evalstr = "javascript:json"+toEvaluation(ref);
		try{
			eval(evalstr+" = "+pdata);
			s_end(res,"200","Success");
		}catch(err){
			s_end(res,"403",err);
		}
		fs.writeFile(current,JSON.stringify(json),function(err){
			if(err)
				s_end(res,"403",err);
		});
	});
}

function pushdb(res,ref,id,pdata){
	fs.readFile(current,function(err,data){
		if(err) s_end(res,"403",err);
		var json = JSON.parse(data.toString('utf8')||"{}");
		var evalstr = "javascript:(json"+toEvaluation(ref)+"||(json"+toEvaluation(ref)+" = {}))"+"['"+id+"']";
		try{
			eval(evalstr+" = "+pdata);
			s_end(res,"200","Success",{
				"key":id
			});
		}catch(err){
			s_end(res,"403",err);
		}
		fs.writeFile(current,JSON.stringify(json),function(err){
			if(err) s_end(res,"403",err);
		});
	});
}

function retrievedb(res,ref){
	fs.readFile(current,function(err,data){
		if(err) s_end(res,"403",err,{});
		var json = JSON.parse(data.toString('utf8')||"{}");
		var refs = ref.split(/\//);
		try{
			refs.forEach(function(e){
				if(e.length!==0)
					json = json[e];
			});
		}catch(err){
			s_end(res,"403",err,{});
		}
		s_end(res,"200","Success",json);
	});
}

function disinfect(stringval,whitelists){
	return stringval.replace(RegExp("[^a-zA-Z0-9=&"+(whitelists||"")+"]","g"),"");
}

function toEvaluation(strval){
	var str = disinfect(strval,"/%");
	console.log(str);
	if(str.startsWith("/"))
		str = str.substr(1);
	if(str.endsWith("/"))
		str = str.substr(0,str.length-1);
	str = str.replace(RegExp("[/]","g"),"']['");
	str = "['"+str+"']";
	return str;
}

/*fs.readFile('file',function(err,data){});*/
/*fs.appendFile('file','str',function(err){});*/
/*fs.writeFile('file','str',function(err){});*/
/*fs.unlink('file',function(err){});*/
/*fs.rename('old','new',function(err){});*/