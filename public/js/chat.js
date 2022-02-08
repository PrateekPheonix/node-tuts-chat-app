const socket = io()

// Elements
const messageForm = document.querySelector('#message-form')
const messageFormInput = messageForm.querySelector('input')
const messageFormButton = messageForm.querySelector('button')
const sendLocationButton = document.querySelector('#send-location')

socket.on('showMessage', (message) => {
    console.log(message)
})

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
            return console.log(err)
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