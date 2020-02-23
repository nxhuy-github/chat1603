const express = require('express');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

server.listen(3000, () => console.log('Server started'));

app.use(express.static('public'));
app.set('view engine', 'ejs');
app.set('views', './views');

app.get('/', (req, res) => res.render('home'));

const arrUsername = [];

io.on('connection', socket => {
    socket.on('CLIENT_SIGN_UP', username => {
        if(arrUsername.indexOf(username) !== -1){
            return socket.emit('CONFIRM_SIGN_UP', false);
        }

        socket.username = username; // gắn thuộc tính cho socket

        socket.emit('CONFIRM_SIGN_UP', arrUsername);
        arrUsername.push(username);
        io.emit('NEW_USER', username);
    });

    socket.on('CLIENT_SEND_MSG', msg => {
        io.emit('MSG_FOR_ALL', `${socket.username}: ${msg}`);
    });

    socket.on('disconnect', () => {
        const index = arrUsername.indexOf(socket.username);
        if(index !== -1){
            arrUsername.splice(index, 1);
            io.emit('USER_LOG_OUT', socket.username);
        }
    });
});
