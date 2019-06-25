const fs = require("fs");


function resGetCommand(fpath, socket) {
    let rs = fs.createReadStream(fpath);
    rs.pipe(socket);
}

function resPutCommand(fpath, socket) {
    let ws = ws.createReadStream(fpath);
    socket.pipe(ws);
}


function resLsCommand(socket) {
    fs.readdir('.', (err, files) => {
        if(err) {
            console.log(err);
        }

        for(var i = 0; i < files.length; i++) {
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