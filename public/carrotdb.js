if(typeof jQuery === 'undefined')
	throw("Database must require jQuery");

var carrotdb = {
	config:{
		api:"",
		link:""
	},
	auth: function(){
		return {
			signUp: function(user,pass,data){
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
						var response = JSON.parse(e||{});
					});
				});
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
								var response = JSON.parse(e.replace(RegExp("%2F","g")," ")||{});
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
								var response = JSON.parse(e||{});
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
								var response = JSON.parse(e||{});
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
								var response = JSON.parse(e||{});
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
			var response = JSON.parse(e||{});
			if(response.status===200)
				fun(response.data);
		});
	}
};