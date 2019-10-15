var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var path = require('path');
var Client = require('ssh2').Client;

var shell;
var conn = new Client();
conn.on('ready', function () {
    console.log('Client :: ready');
    conn.shell(function (err, stream) {
        shell = stream;
        if (err) throw err;
        stream.on('close', function () {
            console.log('Stream :: close');
            conn.end();
        }).on('data', function (data) {
            console.log('OUTPUT: ' + data.toString());
            io.emit('output', { 'stdout': data.toString() });
        });
    });
}).connect({
    host: 'localhost',
    port: 22,
    username: 'thebongy',
    password: 'rockstar123'
});

server.listen(4242);

app.use('/static', express.static(path.join(__dirname, 'public')))

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
    socket.on('keyPress', function (data) {
        console.log("Key received");
        shell.write(data.key);
    });
});

