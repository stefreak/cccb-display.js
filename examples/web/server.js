var display = require('cccb-display')
  , io = require('socket.io')
  , fs = require('fs')
  , url = require('url')
  , http = require('http')
  ;

var disp = new display.Display();

server = http.createServer(function(req, res){
  var path = url.parse(req.url).pathname;

  // index document
  if (path[path.length-1] === '/')
    path += 'index.html';

  sendFile(res, path);
});

function send404(res){
  res.writeHead(404);
  res.end('404');
}

function sendFile(res, path) {
  fs.readFile(__dirname+path, function(err, data){
    if (err) return send404(res);

    split = path.split('.')
    switch (split[split.length-1]) {
      case 'js':
        type = 'text/javascript';
        break;
      case 'html':
        type = 'text/html';
        break;
      case 'css':
        type = 'text/css';
        break;
      default:
        type = 'text/text';
    }
    res.writeHead(200, {'Content-Type': type})
    res.end(data, 'utf8');
  });
}

server.listen(8080);
console.log('Webserver running at http://127.0.0.1:8080/\n');

var clients = []
  ;

var io = io.listen(server);
io.on('connection', function(client){
  client.send({welcome: 'have fun.'});
  clients.unshift(client);

  client.on('message', function(msg) {
    for (key in msg) {
      m = msg[key];
      switch(key) {
        case 'request':
          disp.request(m, function(err) {
            if (err) client.send({error: 'could not send to display'});
          });
          break;
        case 'pixel':
          disp.request({cmd: 3, data: 'coordinates: ' + m.x + ',' + m.y + '               '}, function(err) {
            if (err) return client.send({error: 'could not send to display'});
            broadcast({pixel: {x: m.x, y: m.y}});
          });
          break;
        default:
          client.send({error: 'unknown message key'});
          break;
      }
    }
  });

  client.on('disconnect', function() {
    for (i in clients) {
      if (clients[i] === client) {
        delete clients[i];
      }
    }
  });
});

function broadcast(msg) {
  for (i in clients) {
    clients[i].send(msg);
  }
}
