const fs = require("fs");


function resGetCommand(fpath, socket, callback) {
    let rs = fs.createReadStream(fpath);
    rs.pipe(socket);
    rs.on('end', callback);
}

function resPutCommand(fpath, socket, callback) {
    let ws = fs.createWriteStream(fpath);
    socket.pipe(ws);
    socket.on('end', callback);
}


function resLsCommand(socket) {
    fs.readdir('.', (err, files) => {
        if (err) {
            console.log(err);
        }

        for (var i = 0; i < files.length; i++) {
            files[i] = files[i].concat("\r\n");
        }
        socket.write(files);
        socket.end();
    });
}

module.exports = {
    resGetCommand,
    resPutCommand,
    resLsCommand
};