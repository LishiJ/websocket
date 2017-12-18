/**
 * 聊天demo服务端
 * Author: ShiJie.Li
 */
var WebSocket = require('ws');
var ws = WebSocket.Server, wss = new ws({port: 9999});
var clients = [],chatLists = [];

function wsSend(type, uuid, message) {
    console.log(uuid)
    if (uuid != '') {
        for (var i = 0; i < clients.length; i++) {
            console.log(11111)
            if (clients[i].uuid == uuid) {
                console.log(55555)
                var clientSocket = clients[i].ws;
                if (clientSocket.readyState === WebSocket.OPEN) {
                    console.log(222222)
                    clientSocket.send(JSON.stringify({
                        "type": type,
                        "message": message == '' ? '' : {
                            "name": message.name,
                            "uuid": message.uuid,
                            "avatar": message.avatar
                        }
                    }));
                }
            }
        }

    } else {
        for (var i = 0; i < clients.length; i++) {
            var clientSocket = clients[i].ws;
            if (clientSocket.readyState === WebSocket.OPEN) {
                console.log(333333)
                clientSocket.send(JSON.stringify({
                    "type": type,
                    "message": message,
                    "chatLists": chatLists
                }));
            }
        }
    }
}


wss.on('connection', function (ws) {
    console.log('client connected');
    ws.on('message', function (message) {
        var msg = JSON.parse(message);
        console.dir(msg.sender)
        if (msg.sender == 'updateUserInfo') {
            msg.body.ws = ws;
            for (var i = 0, sum = 0; i < clients.length; i++) {
                if (clients[i].uuid == msg.body.uuid)
                    clients.splice(i, 1, msg.body);
                else
                    sum++
            }
            if (sum == clients.length)
                clients.push(msg.body);
        } else if (msg.sender == 'sendUserMessage') {
            console.dir(msg.body)
            var newMsg = {
                "uuid": msg.body.uuid,
                "name": msg.body.name,
                "avatar": msg.body.avatar,
                "message":msg.body.message
            };
            chatLists.push(newMsg)
            wsSend('post', msg.body.toUUid, newMsg)
        } else if (msg.sender == 'getUserInfo') {
            for (var i = 0, sum = 0; i < clients.length; i++) {
                if (clients[i].uuid == msg.body.uuid) {
                    console.log(00000)
                    clients[i].ws = ws;
                    wsSend('get', msg.body.uuid, clients[i])
                }
                else
                    sum++
            }
            if (sum == clients.length) {
                console.log(88888)
                clients.push({
                    "ws": ws,
                    "name": '',
                    "uuid": msg.body.uuid,
                    "avatar": ''
                });
                wsSend('get', msg.body.uuid, '')
            }
            wsSend('post', '', '')

        }
    });
});