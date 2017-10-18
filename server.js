'use strict'


var app = require('express')();
var e = require('express');
var express = e();
var  server = require('http').Server(app);
var io = require('socket.io')(server);
var bp = require("body-parser");
var user;
var online = {};

const mongoose=require('mongoose');
const Mensaje=require('./model/mensaje');

app.use(e.static(__dirname+'/content'));
app.use('/content', e.static(__dirname+'/content'));

mongoose.set(`debug`,true);

mongoose.connect('mongodb://localhost:27017/chat_node_mongo',(err,res)=>{
	if(err){
		return console.log('error al conectar con la BD:',err);
	}
	console.log('La Conexión con la base de datos es exitosa');

})




app.use(bp.urlencoded({ extended: false }));
app.use(bp.json());
app.set('port', process.env.PORT || 3000);

server.listen(3000);

app.get('/', function(req, res){
	res.sendfile(__dirname + '/index.html');
});



io.on('connection',function(socket) {


	socket.on('New_user',function(data,callback) {
	      if (data in online) {
		  	callback(false);
		  } else {
		  	callback(true);
		  	socket.username = data;
		  	online[socket.username] = socket;
		  	//online.push(socket.username);
		  	console.log(data + '  is connected');
            updtng_nw_usr();
            io.sockets.emit('snd_mg','<font class="panel" size="2.5" face="Permanent Marker" color="gray">'+ socket.username +' is Conected.....</font><hr>');
		  }
	    
	});

	socket.on('disconnect',function(){
		if (socket.username) {
			delete online[socket.username];
			//online.splice(online.indexOf(socket.username),1);
			updtng_nw_usr();
			console.log(socket.username + '  is disconnected');
			io.sockets.emit('snd_mg','<font size="2.5" class="panel" face="Permanent Marker" color="gray">'+ socket.username +' is Disconected.....</font><hr>');
		}
	});

	function updtng_nw_usr(){
	  
	  var html = " ";
	  for (var i = 0; i < Object.keys(online).length; i++) {
	    html = '<button style="height: 30px; width:200px; " id="'+Object.keys(online)[i] +'" value="'+Object.keys(online)[i] +'" class="glyphicon glyphicon-send User buttonUser" onclick="msgUser(\''+Object.keys(online)[i] +'\')"> '+Object.keys(online)[i] +'</button> <br>' + html;

	  }
	  io.sockets.emit('all_users','Users Conected: <br><hr>'+ html);
	}

	socket.on('msg_k',function(data , callback){
        var msg = data.trim();
        var border_pos = msg.indexOf('$');
        var pure_msg = msg.substr(0,border_pos);
        var to = msg.substr(border_pos+1)
        if (pure_msg.trim() !== '') {
          if (to.trim() !== '') {
          	 console.log("online: ");
          	 
          	 console.log(Object.keys(online));

          	 console.log("To: ");
          	 console.log(to);

          	 var keys = Object.keys(online);

          	 console.log("To in keys: ");
          	 console.log(to in keys);
          	 console.log(keys.indexOf(to));
          	 console.log("KEYS: ");
          	 console.log(keys);

          	 /*that.socket.emit('postMsg', msg, color);
          	 that._displayNewMsg('me', msg, color);
          	 return;
          	 
*/



//             if (to in online) { 
			  if (keys.indexOf(to)!=-1){
			  	console.log("ok");
                online[to].emit('call','<b>'+ socket.username +' :</b>'+'<span style="color:black;">'+pure_msg+'</span>',socket.username);
                online[socket.username].emit('call','<b>'+ socket.username  +' :</b>'+'<span style="color:black;">'+pure_msg+'</span>',to);
                                online[socket.username].emit('call','<b>'+ socket.username  +' :</b>'+'<span style="color:black;">'+"zumb"+'</span>',to);

			let mensaje = new Mensaje();         
			mensaje.nick  = socket.username;
			mensaje.mensaje = pure_msg;

			mensaje.pm  = true;
			mensaje.para = to;

			mensaje.save((err,mensajeStored)=>{
				console.log("mensajeStored");
				//console.log(mensajeStored);
				//if(err) return res.status(500).send({message:'Error al salvar el mensaje en la BD: ',err})
				//	res.status(200).send({mensaje:mensajeStored})
			});


              }else {
                callback('User is Not In Online...');
              }
          }else{//public msg when to box is empty
            io.sockets.emit('snd_mg','<b>'+ socket.username +' : </b>'+'<span style="color:blue;">'+pure_msg+'</span>');
            //hhhhh

			let mensaje = new Mensaje();         
			mensaje.nick  = socket.username;
			mensaje.mensaje = pure_msg;

			mensaje.pm  = false;
			mensaje.para = '';

			mensaje.save((err,mensajeStored)=>{
				console.log("mensajeStored");
				//console.log(mensajeStored);
				//if(err) return res.status(500).send({message:'Error al salvar el mensaje en la BD: ',err})
				//	res.status(200).send({mensaje:mensajeStored})
			});

          }

          
        }
	});



	socket.on('typing_ray',function(data){
       socket.broadcast.emit('eva','<b>'+ socket.username +' :</b>'+'<span style="color:red;">Typyng...</span>');
	});

    socket.on('stop_ray',function(data){
       socket.broadcast.emit('eva','');
	});
	socket.on('postMsg', function(msg, color) {
        socket.broadcast.emit('newMsg', socket.nickname, msg, color);
    });
    /*socket.on('img', function(imgData, color){
    	socket.broadcast.emit('newImg', socket.nickname, imgData, color);
    });*/

});


