const net = require('net');
const COMMANDS = require('./command.js');
const REPLY_CODE = require('./reply-code.js')


let userList = [{username: 'hjj', password:'123', path:'./'}];








var sendHandler = function (type, message) {
    var socket = this;
    var command;

    if (arguments.length < 2) {
        if (REPLY_CODE[type]) {
            command = REPLY_CODE[type]
        } else {
            command = type.toString()
        }
    } else {
        command = type + ' ' + message;
    }

    console.log('S:', command);

    socket.write(command + '\r\n');
};

var ftpServer = net.createServer(function (socket) {
    socket.session = {};
    socket.session.dataLink = [];
    socket.send = sendHandler;
    socket.userList = userList;

    socket.send(220, 'Welcome to FTP Server');

    var onCommand = function (buffer) {
        //receives.push(data)
        //var buffer  = Buffer.concat(receives).toString()
        //receives = []
        var buffers = buffer.toString();
        var lines = buffers.split('\r\n');

        for (var i = 0, l = lines.length; i < l; i++) {
            var line = lines[i];
            if (line) {
                console.log('C:', line);

                //lines.push(raw[i])
                var cmds = line.split(' ');
                var cmd = cmds[0].toUpperCase();
                var arg = cmds.slice(1);

                var func = COMMANDS[cmd];

                func
                    ?
                    func.apply(socket, arg) :
                    socket.send(502)
            }
        }
    };

    socket
        .on('data', onCommand)
        .on('end', function () {
            console.log('end', arguments);
        })
        .on('close', function () {
            console.log('close', arguments);
        })
        .on('timeout', function () {
            console.log('timeout', arguments);
        })
        .on('error', function (err) {
            console.log('error', arguments);
        })

}).on('error', function (err) {
    console.error(err)
});



ftpServer.listen({
    port: 21
}, function () {
    console.log('opened server on', ftpServer.address());
});