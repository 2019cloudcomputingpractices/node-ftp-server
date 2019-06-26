const net = require('net');
const myfs = require('./fs.js')


module.exports = {
    USER: function (username) {
        this.session.username = username;
        this.session.isLogged = false;
        this.send(`331 User name okay, password required for ${username}`);
    },

    PASS: function (password) {
        let socket = this;
        let username = socket.session.username;

        for (var i = 0; i < socket.userList.length; i++) {
            if (username == socket.userList[i].username &&
                password == socket.userList[i].password) {
                socket.session.isLogged = true;
                socket.session.basePath = socket.userList[i].path;
                socket.session.path = '/';
                socket.send(230, 'Logged on');
                return;
            }
        }
        socket.send(450, 'User name or password incorrect');
    },

    PORT: function (portCode) {
        if (!this.session.isLogged) {
            this.send(500, 'Please log in with USER and PASS first');
            return;
        }
        let portCodeArr = portCode.split(',');
        let ip = portCodeArr.slice(0, 4).join('.');
        let port = parseInt(portCodeArr[4]) * 256 + parseInt(portCodeArr[5]);
        this.session.dataLink.push({
            ip,
            port
        });
        this.send(200, 'Port command successful');
    },

    RETR: function (path) {
        if (!this.session.isLogged) {
            this.send(500, 'Please log in with USER and PASS first');
            return;
        }
        let comSocket = this;
        path = comSocket.session.path + path;
        let {
            ip,
            port
        } = comSocket.session.dataLink.shift();
        let dataSocket = net.createConnection(port, ip, () => {
            comSocket.send(150, `Opening data channel for file download from server of "${path}"`);
        });
        myfs.resGetCommand(comSocket.session.basePath + path, dataSocket, () => {
            comSocket.send(226, `Successfully transferred "${path}"`);
            dataSocket.end();
        });
    },

    STOR: function (path) {
        if (!this.session.isLogged) {
            this.send(500, 'Please log in with USER and PASS first');
            return;
        }
        let comSocket = this;
        path = comSocket.session.path + path;
        let {
            ip,
            port
        } = comSocket.session.dataLink.shift();
        let dataSocket = net.createConnection(port, ip, () => {
            comSocket.send(150, `Opening data channel for file upload to server of "${path}"`);
        });
        myfs.resPutCommand(comSocket.session.basePath + path, dataSocket, () => {
            comSocket.send(226, `Successfully transferred "${path}"`);
            dataSocket.end();
        });
    },

    QUIT: function () {
        this.send('221 Goodbye');
        this.end();
    },

    AUTH: function () {
        this.send('502 SSL/TLS authentication not allowed.')
    },

    PWD: function (args) {
        this.send('257 "/" is current directory')
    },

    TYPE: function (args) {
        this.send('200 Type set to I')
    },

    EPSV: function (args) {
        this.send('229 Entering Extended Passive Mode (|||30324|).')
    },

    PASV: function (args) {
        this.send('227 Entering Passive Mode (112,124,126,185,165,12).')
    },

    MLSD: function (args) {
        this.send('226 Successfully transferred "/"')
    },

    LIST: function (args) {
        this.send('502 Command not implemented.')

        this.send('502')
    },


};