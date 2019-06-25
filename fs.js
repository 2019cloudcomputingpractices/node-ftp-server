var fs = require("fs");


function resGetCommand(fpath, socket) {
    let rs = fs.createReadStream(fpath);
    rs.on("data", (data) => {
        socket.write(data);
    });
}

function resPutCommand(fpath, socket) {
    let ws = ws.createReadStream(fpath);
    socket.on("data", (data) => {
        ws.write(data);
    });
}


module.exports = {
    resGetCommand,
    resPutCommand
};