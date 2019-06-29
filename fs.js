const fs = require('fs');
const path = require('path');


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


function resNLSTCommand(dpath, socket, callback) {
    fs.readdir(dpath, (err, files) => {
        if (err) {
            console.log(err);
            socket.end();
        } else {
            socket.write(files.join('\r\n') + '\r\n');
            callback();
        }
    });
}

function resMLSDCommand(dpath, socket, callback) {
    fs.readdir(dpath, {
        withFileTypes: true
    }, (err, files) => {
        if (err) {
            console.log(err);
            socket.end();
        } else {
            files = files.map(dirent => {
                let type = 'unknow';
                if (dirent.isFile()) type = 'file';
                else if (dirent.isDirectory()) type = 'dir';
                return `type=${type}; ${dirent.name}`
            });
            socket.write(files.join('\r\n') + '\r\n');
            callback();
        }
    });
}

function resCWDCommand(basePath, oldPath, cdArg) {
    let newPath = path.join(oldPath, cdArg);
    return fs.existsSync(path.join(basePath, newPath)) ? newPath : oldPath;
}

module.exports = {
    resGetCommand,
    resPutCommand,
    resNLSTCommand,
    resMLSDCommand,
    resCWDCommand
};