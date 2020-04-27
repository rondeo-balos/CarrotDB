if(typeof jQuery === 'undefined')
	throw("Database must require jQuery");

var carrotdb = {
	config:{
		api:"",
		link:""
	},
	auth: function(){
		return {
			signUp: function(user,pass,data,fun,funerr){
				carrotdb.__getToken(function(res){
					$.ajax(carrotdb.config.link,{
						type:"POST",
						data:{
							"api":carrotdb.config.api,
							"token":res.token,
							"signup":JSON.stringify({
								"user":user,
								"pass":pass,
								"data":data
							})
						}
					}).then(function(e){
						var response = JSON.parse(e||"{}");
						localStorage.carrotdb_sessid = response.data.uid;
						localStorage.carrotdb_type = 1;
						fun(response.data);
					}).catch(function(err){
						var response = JSON.parse(err.responseText||{});
						funerr(response);
					});
				});
			},
			tempSignIn: function(fun){
				carrotdb.__getToken(function(res){
					$.ajax(carrotdb.config.link,{
						type:"POST",
						data:{
							"api":carrotdb.config.api,
							"token":res.token,
							"tempsignin":1
						}
					}).then(function(e){
						var response = JSON.parse(e||"{}");
						localStorage.carrotdb_sessid = response.data.uid;
						localStorage.carrotdb_type = 0;
						fun(response.data);
					});
				});
			},
			signIn: function(user,pass,fun,funerr){
				carrotdb.__getToken(function(res){
					$.ajax(carrotdb.config.link,{
						type:"POST",
						data:{
							"api":carrotdb.config.api,
							"token":res.token,
							"signin":JSON.stringify({
								"user":user,
								"pass":pass
							})
						}
					}).then(function(e){
						var response = JSON.parse(e||"{}");
						localStorage.carrotdb_sessid = response.data.uid;
						localStorage.carrotdb_type = 1;
						fun(response.data);
					}).catch(function(err){
						var response = JSON.parse(err.responseText||{});
						funerr(response);
					});
				});
			},
			me: function(fun){
				if(carrotdb.auth().isSignedIn()){
					carrotdb.__getToken(function(res){
						$.ajax(carrotdb.config.link,{
							type:"POST",
							data:{
								"api":carrotdb.config.api,
								"token":res.token,
								"me":localStorage.carrotdb_sessid
							}
						}).then(function(e){
							var response = JSON.parse(e||"{}");
							fun(response.data);
						});
					});
				}
			},
			update: function(user,usern,pass,passn,data,fun,funerr){
				if(carrotdb.auth().isSignedIn()){
					carrotdb.__getToken(function(res){
						$.ajax(carrotdb.config.link,{
							type:"POST",
							data:{
								"api":carrotdb.config.api,
								"token":res.token,
								"update":localStorage.carrotdb_sessid,
								"data":JSON.stringify({
									"user":user,
									"pass":pass,
									"usern":usern,
									"passn":passn,
									"data":data
								})
							}
						}).then(function(e){
							var response = JSON.parse(e||"{}");
							fun(response.data);
						}).catch(function(err){
							var response = JSON.parse(err.responseText||"{}");
							funerr(response);
						});
					});
				}
			},
			migrate: function(user,pass,data,fun,funerr){
				if(carrotdb.auth().isSignedIn()){
					carrotdb.__getToken(function(res){
						$.ajax(carrotdb.config.link,{
							type:"POST",
							data:{
								"api":carrotdb.config.api,
								"token":res.token,
								"migrate":localStorage.carrotdb_sessid,
								"data":JSON.stringify({
									"user":user,
									"pass":pass,
									"data":data
								})
							}
						}).then(function(e){
							var response = JSON.parse(e||"{}");
							fun(response.data);
						}).catch(function(err){
							var response = JSON.parse(err.responseText||"{}");
							funerr(response);
						});
					});
				}
			},
			signOut: function(link){
				localStorage.removeItem("carrotdb_sessid");
				localStorage.clear();
				if(typeof link !== 'undefined')
					carrotdb.auth().setUnsignedPage(link);
			},
			isSignedIn: function(){
				return (typeof localStorage.carrotdb_sessid !== 'undefined');
			},
			setUnsignedPage: function(link){
				if(!carrotdb.auth().isSignedIn()){
					document.location = link;
				}
			}
		}
	},
	database: function(){
		return {
			collection: function(collection){
				if(typeof collection !== 'string')
					throw("Collection reference must be a string");
				return {
					/* doc: usage
					/* carrotdb.database().collection("stores/products/").value(function(e){
					/*     //e returns a json array of data
					/* });
					*/
					value: function(fun){
						carrotdb.__getToken(function(res){
							$.ajax(carrotdb.config.link,{
								type:"POST",
								data:{
									"api":carrotdb.config.api,
									"token":res.token,
									"collection":collection
								}
							}).then(function(e){
								var response = JSON.parse(e.replace(RegExp("%2F","g")," ")||"{}");
								fun(response.data);
							});
						});
					},
					/* doc: usage
					/* carrotdb.database().collection("stores/products/").push(function(e){
					/*     //e returns a a key of pushed data
					/*     //e.key
					/* });
					*/
					push: function(data,fun){
						carrotdb.__getToken(function(res){
							_a = $.ajax(carrotdb.config.link,{
								type:"POST",
								data:{
									"api":carrotdb.config.api,
									"token":res.token,
									"push":btoa(Date.now()),
									"collection":collection,
									"data":JSON.stringify(data)
								}
							}).then(function(e){
								var response = JSON.parse(e||"{}");
								fun(response.data);
							});
						});
					},
					/* doc: usage
					/* carrotdb.database().collection("stores/products/").set({json data});
					*/
					set: function(value,fun){
						carrotdb.__getToken(function(res){
							_a = $.ajax(carrotdb.config.link,{
								type:"POST",
								data:{
									"api":carrotdb.config.api,
									"token":res.token,
									"set":JSON.stringify(value),
									"collection":collection
								}
							}).then(function(e){
								var response = JSON.parse(e||"{}");
								fun(response.data);
							});
						});
					},
					clear: function(fun){
						carrotdb.__getToken(function(res){
							$.ajax(carrotdb.config.link,{
								type:"POST",
								data:{
									"api":carrotdb.config.api,
									"token":res.token,
									"clear":collection
								}
							}).then(function(e){
								var response = JSON.parse(e||"{}");
								fun(response.data);
							});
						});
					}
				}
			}
		}
	},
	__getToken: function(fun){
		$.ajax(carrotdb.config.link,{
			type:"GET",
			data:{
				"api": carrotdb.config.api
			}
		}).then(function(e){
			var response = JSON.parse(e||"{}");
			if(response.status.toString('utf8')==="200")
				fun(response.data);
		});
	}
};