const generateMessage = (username, text, id) => {
    return {
        username: username,
        text: text,
        createdAt: new Date().getTime(),
        id: id
    }
}

const generateLocationMessage = (username, url, id) => {
    return {
        username: username,
        url: url,
        createdAt: new Date().getTime(),
        id: id
    }
}

module.exports = {
    generateMessage,
    generateLocationMessage
}