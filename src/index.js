const socketio = require('socket.io');
const http = require('http')
const express = require('express');
const path = require('path');
const Filter = require('bad-words')
const cors = require('cors')

const { generateMessage, generateLocationMessage } = require('./Utils/messages')
const { addUser, getUser, removeUser, getUsersInRoom } = require('./Utils/users')

const app = express()
const server = http.createServer(app)
const io = socketio(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

const port = process.env.PORT || 3000

const publicDirectoryPath = path.join(__dirname, '../public')

app.use(express.static(publicDirectoryPath))
app.use(cors({
    " Access-Control-Allow-Origin": "*"
}))

io.on('connection', (socket) => {
    console.log('New WebSocket Connection')
    //User Join
    socket.on('join', ({ username, room }, callback) => {
        const { error, user } = addUser({ id: socket.id, username: username, room: room })

        if (error) {
            return callback(error)
        }

        socket.join(user.room)

        socket.emit('showMessage', generateMessage('Welcome!'))
        socket.broadcast.to(user.room).emit('showMessage', generateMessage(`${user.username} has joined the room!`))

        // sidebar
        io.to(user.room).emit('roomData', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
    })
    // sending messages
    socket.on('sendMessage', (message, callback) => {
        const user = getUser(socket.id)
        const filter = new Filter()

        if (filter.isProfane(message)) {
            return callback('Dont use abusive language')
        }
        io.to(user.room).emit('showMessage', generateMessage(user.username, message, socket.id))
        callback()
    })

    // User leaves
    socket.on('disconnect', () => {
        const user = removeUser(socket.id)

        if (user) {
            io.to(user.room).emit('showMessage', generateMessage(`${user.username} has left`))

            // sidebar
            io.to(user.room).emit('roomData', {
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }
    })
    // Sending location
    socket.on('sendLocation', (coords, callback) => {
        const user = getUser(socket.id)
        io.to(user.room).emit('showLocation', generateLocationMessage(user.username, `https://google.com/maps?q=${coords.latitude},${coords.longitude}`, socket.id))
        callback()
    })
})

server.listen(port, () => {
    console.log('SERVER IS UP ON PORT', port)
})