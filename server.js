const net = require('net');
const COMMANDS = require('./command.js');
const REPLY_CODE = require('./reply-code.js')


let userList = [{
    username: 'hjj',
    password: '123',
    path: './.idea'
}];








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

    socket.send(220, 'Welcome to FTP Server');

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

                func
                    ?
                    func.apply(socket, arg) :
                    socket.send(502)
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
    port: 21
}, function () {
    console.log('opened server on', ftpServer.address());
});