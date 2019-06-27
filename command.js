const net = require('net');
const path = require('path');
const myfs = require('./fs.js');


module.exports = {
    USER: function (username) {
        this.session.username = username;
        this.session.isLogged = false;
        this.send(`331 User name okay, password required for ${username}`);
    },

    PASS: function (password) {
        let socket = this;
        let username = socket.session.username;

        for (let i = 0; i < socket.userList.length; i++) {
            if (username == socket.userList[i].username &&
                password == socket.userList[i].password) {
                socket.session.isLogged = true;
                socket.session.basePath = socket.userList[i].path;
                socket.session.path = path.join('/');
                socket.send(230, 'Logged on');
                return;
            }
        }
        socket.send(450, 'User name or password incorrect');
    },

    PORT: function (portCode) {
        if (!this.session.isLogged) {
            this.send(530, 'Please log in with USER and PASS first');
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

    RETR: function (fpath) {
        if (!this.session.isLogged) {
            this.send(530, 'Please log in with USER and PASS first');
            return;
        }
        let comSocket = this;
        fpath = path.join(comSocket.session.path, fpath);
        let {
            ip,
            port
        } = comSocket.session.dataLink.shift();
        let dataSocket = net.createConnection(port, ip, () => {
            comSocket.send(150, `Opening data channel for file download from server of "${fpath}"`);
            myfs.resGetCommand(path.join(comSocket.session.basePath, fpath), dataSocket, () => {
                comSocket.send(226, `Successfully transferred "${fpath}"`);
                dataSocket.end();
            });
        });
    },

    STOR: function (fpath) {
        if (!this.session.isLogged) {
            this.send(530, 'Please log in with USER and PASS first');
            return;
        }
        let comSocket = this;
        fpath = path.join(comSocket.session.path, fpath);
        let {
            ip,
            port
        } = comSocket.session.dataLink.shift();
        let dataSocket = net.createConnection(port, ip, () => {
            comSocket.send(150, `Opening data channel for file upload to server of "${fpath}"`);
            myfs.resPutCommand(path.join(comSocket.session.basePath, fpath), dataSocket, () => {
                comSocket.send(226, `Successfully transferred "${fpath}"`);
                dataSocket.end();
            });
        });
    },

    NLST: function () {
        if (!this.session.isLogged) {
            this.send(530, 'Please log in with USER and PASS first');
            return;
        }
        let comSocket = this;
        let {
            ip,
            port
        } = comSocket.session.dataLink.shift();
        let dataSocket = net.createConnection(port, ip, () => {
            comSocket.send(150, `Opening data channel for directory listing of "${comSocket.session.path}"`);
            myfs.resNLSTCommand(path.join(comSocket.session.basePath, comSocket.session.path), dataSocket, () => {
                comSocket.send(226, `Successfully transferred "${comSocket.session.path}"`);
                dataSocket.end();
            });
        });
    },


    XPWD: function () {
        if (!this.session.isLogged) {
            this.send(530, 'Please log in with USER and PASS first');
            return;
        }
        this.send(257, `"${this.session.path}" is current directory`);
    },

    CWD: function (arg) {
        if (!this.session.isLogged) {
            this.send(530, 'Please log in with USER and PASS first');
            return;
        }
        this.session.path = myfs.resCWDCommand(this.session.basePath, this.session.path, arg);
        this.send(250, `CWD successful. "${this.session.path}" is current directory`);
    },

    QUIT: function () {
        this.send('221 Goodbye');
        this.end();
    }
};