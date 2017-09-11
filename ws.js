let http = require('http'),
    path = require('path'),
    fs = require('fs'),
    { Server: WebSocketServer } = require('ws');

let ws = new WebSocketServer({port: 3000});
let people = {};
ws.broadcast = function broadcast(state,message) {
  ws.clients.forEach(function each(client) {
    let switches = {
      close () {
        if(client.username === message) client.close();
        else client.send(`${message} 退出聊天室`);
      },
      open () {
        if(client.username === message) client.send(`欢迎加入dollars，当前在线人数为${Object.keys(people).length}`);
        else client.send(`${message} 进入聊天室`);
      },
      message () { client.send(message); }
    };
    switches[state]();
  });
};

ws.on('connection', (socket,req) => {

  socket.on('message', data => {
    if( data.match(/^\$\{id\}/) ) (socket.username = data.replace(/^\$\{id\}/,'')) && (people[socket.username] ? null : (people[socket.username] = socket.username) && ws.broadcast('open',socket.username));
    else ws.broadcast('message',JSON.stringify({username: socket.username,data}));
  });

  socket.on('close', data => {
    delete people[socket.username];
    ws.broadcast('close',socket.username);
  });

});


http.createServer((request,response) => {
  response.writeHead(200,{'Conten-Type': 'text/plain'});
  let url = __dirname + '/a.html';
  fs.readFile(url,(err,data) => {
    if(err)
    console.log(err,data);
    response.end(data);
  });
}).listen(8888);
