const generateMessage = (username, text) =>{
    return {
        username,
        text,
        createdAt : new Date().getTime()
    }
}

const generateLocationURL = (username, url) => {
    return{
        username,
        url,
        createdAt : new Date().getTime()
    }
}

module.exports = {
    generateMessage,
    generateLocationURL
}