const socketio = require('socket.io');
const http = require('http')
const express = require('express');
const path = require('path');
const Filter = require('bad-words')

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))

io.on('connection', (socket) => {
    console.log('New WebSocket Connection')

    socket.emit('showMessage', 'Welcome!')

    socket.broadcast.emit('showMessage', 'A new user has joined')

    socket.on('sendMessage', (message, callback) => {
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Dont use abusive language')
        }
        io.emit('showMessage', message)
        callback()
    })

    socket.on('disconnect', () => {
        io.emit('showMessage', 'A User has left')
    })

    socket.on('sendLocation', (coords, callback) => {
        io.emit('showMessage', `https://google.com/maps?q=${coords.latitude},${coords.longitude}`)
        callback()
    })
})

server.listen(port, () => {
    console.log('SERVER IS UP ON PORT', port)
})