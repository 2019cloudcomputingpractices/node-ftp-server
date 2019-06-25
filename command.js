module.exports = {
    USER: function ([username]) {
        this.session.username = username;
        this.send('331 User name okay, password required for' + username);
    },

    PASS: function ([password]) {
        var socket = this;
        var username = socket.session.username;

        for (var i = 0; i < socket.userList.length; i++) {
            if (username == socket.userList[i].username &&
                password == socket.userList[i].password) {
                socket.session.isLogged = true;
                socket.send(230, 'Logged on');
                return;
            }
        }
        socket.send(450, 'User name or password incorrect');
    },

    PORT: function ([portCode]) {
        var portCodeArr = portCode.split(',');
        var ip = portCodeArr.slice(0, 4).join('.');
        var port = parseInt(portCodeArr[4]) * 256 + parseInt(portCodeArr[5]);
        socket.session.link.append({ip, port, socket: null});
        socket.send(200, 'Port command successful');
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