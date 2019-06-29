const net = require('net');
const COMMANDS = require('./command.js');
const REPLY_CODE = require('./reply-code.js')
const userList = require('./user.js')








let sendHandler = function (type, message) {
    let socket = this;
    let command;

    if (arguments.length < 2) {
        if (REPLY_CODE[type]) {
            command = type + ' ' + REPLY_CODE[type];
        } else {
            command = type.toString();
        }
    } else {
        command = type + ' ' + message;
    }

    console.log('S:', command);

    socket.write(command + '\r\n');
};

let ftpServer = net.createServer(function (socket) {
    socket.session = {};
    socket.session.dataLink = [];
    socket.send = sendHandler;
    socket.userList = userList;

    socket.send('220-Welcome to node-ftp-server\r\n220-written by hjj & hjp\r\n' +
        '220 Please visit https://github.com/2019cloudcomputingpractices/node-ftp-server');

    let onCommand = function (buffer) {
        let buffers = buffer.toString();
        let lines = buffers.split('\r\n');

        for (let i = 0, l = lines.length; i < l; i++) {
            let line = lines[i];
            if (line) {
                console.log('C:', line);

                let cmds = line.split(' ');
                let cmd = cmds[0].toUpperCase();
                let arg = cmds.slice(1);

                let func = COMMANDS[cmd];

                if (func) {
                    func.apply(socket, arg);
                } else {
                    socket.send(502)
                    socket.session.dataLink.shift();
                }
            }
        }
    };

    socket.setTimeout(600000);
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
            socket.send(421, 'Connection timed out');
            socket.end();
        })
        .on('error', function (err) {
            console.log('error', arguments);
        })

}).on('error', function (err) {
    console.error(err)
});



ftpServer.listen({
    host: '0.0.0.0',
    port: 21
}, function () {
    console.log('opened server on', ftpServer.address());
});