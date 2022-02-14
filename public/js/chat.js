const socket = io()

// Elements
const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')
const sendLocationButton = document.querySelector('#send-location')
const messages = document.querySelector('#messages')
const sidebar = document.querySelector('#sidebar')

// Templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const messageMeTemplate = document.querySelector('#message-me-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const locationMeTemplate = document.querySelector('#location-me-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

// Options
const { username, room } = Qs.parse(location.search, { ignoreQueryPrefix: true })

// Autoscroll
const autoscroll = () => {
    // new message element
    const newMessage = messages.lastElementChild

    // height of new message
    const newMessageStyles = getComputedStyle(newMessage)
    const newMessageMargin = parseInt(newMessageStyles.marginBottom)
    const newMessageHeight = newMessage.offsetHeight + newMessageMargin

    // visible height
    const visibleHeight = messages.offsetHeight

    // height of message container
    const containerHeight = messages.scrollHeight

    // how far have i scrolled
    const scrollOffset = messages.scrollTop + visibleHeight

    if (containerHeight - newMessageHeight <= scrollOffset) {
        messages.scrollTop = messages.scrollHeight
    }
}


// Connections
socket.on('showMessage', (message) => {
    console.log(message)
    if (socket.id === message.id) {
        const html = Mustache.render(messageMeTemplate, {
            username: message.username,
            message: message.text,
            createdAt: moment(message.createdAt).format('h:mm a'),
        })
        messages.insertAdjacentHTML('beforeend', html)
    } else {
        const html = Mustache.render(messageTemplate, {
            username: message.username,
            message: message.text,
            createdAt: moment(message.createdAt).format('h:mm a'),
        })
        messages.insertAdjacentHTML('beforeend', html)
    }
    autoscroll()
})

socket.on('showLocation', (message) => {
    console.log(message)
    if (socket.id === message.id) {
        const html = Mustache.render(locationMeTemplate, {
            username: message.username,
            url: message.url,
            createdAt: moment(message.createdAt).format('h:mm a')
        })
        messages.insertAdjacentHTML('beforeend', html)
    } else {
        const html = Mustache.render(locationTemplate, {
            username: message.username,
            url: message.url,
            createdAt: moment(message.createdAt).format('h:mm a')
        })
        messages.insertAdjacentHTML('beforeend', html)
    }
    autoscroll()
})

socket.on('roomData', ({ room, users }) => {
    const html = Mustache.render(sidebarTemplate, {
        room: room,
        users: users
    })
    sidebar.innerHTML = html
})

// Event listners
messageForm.addEventListener('submit', (e) => {
    e.preventDefault()

    // disable
    messageFormButton.setAttribute('disabled', 'disabled')

    const message = e.target.elements.message.value

    socket.emit('sendMessage', message, (err) => {
        // enable
        messageFormButton.removeAttribute('disabled')
        messageFormInput.value = ''
        messageFormInput.focus()

        if (err) {
            return alert(err)
        }
        console.log('Message Delivered')
    })
})

sendLocationButton.addEventListener('click', () => {
    if (!navigator.geolocation) {
        return alert('Geolocation not supported')
    }

    // disable
    sendLocationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude
        }, () => {
            // enable
            sendLocationButton.removeAttribute('disabled')
            console.log("Location shared")
        })
    })
})

socket.emit('join', { username, room }, (error) => {
    if (error) {
        alert(error)
        location.href = '/'
    }
})