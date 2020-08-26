const express = require('express')
const path = require('path')
const http = require('http')
const Filter = require('bad-words')
const socketio = require('socket.io')
const {generateMessage, generateLocationURL}  = require('./utils/messages')
const {addUser, deleteUser , getUser, getUsersInRoom} = require('./utils/users')

const app = express()
// express create the server behind the scene so we can not access that, to access the server we create it manually
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000

const publicPath = path.join(__dirname,'../public')


app.use(express.static(publicPath))

// io is socket.io object that can have connection with all the clients but socket is specific to every connection 
io.on('connection', (socket) => {
    console.log('client is connected')


    socket.on('join', (options , callback) => {
        //...options refrence to the {username , room}
        // be sure that what is retured from the addUser is an object
        const {error, user } = addUser({id: socket.id, ...options})
        
        if(error){
            return callback(error)
        }

        //we join this specific user(on this specific connection (socket)) to this specific room 
        socket.join(user.room)
        socket.emit('message', generateMessage('admin',`Dear ${user.username} !  Welcome to Chat App`))
        //socket.broadcast() send the message to everyone that are on the specific room  except the user who own socket object 
        socket.broadcast.to(user.room).emit('admin','message', generateMessage(`${user.username} is joined the chat`))

        io.to(user.room).emit('usersList', {
            room: user.room,
            users: getUsersInRoom(user.room)
        })

        callback()
        
    })

    socket.on('myMessage', (msg, callback) => {
        const user = getUser(socket.id)
      
        const filter = new Filter()

        if(filter.isProfane(msg)){
            return callback('be polite please!')
        }

        io.to(user.room).emit('message', generateMessage(user.username, msg))
        callback()
    })

    socket.on('sendLocation', ({latitude, longitude}, callback) =>{
        const user = getUser(socket.id)
       
        io.to(user.room).emit('LocationMessage',generateLocationURL(user.username, `https://google.com/maps?q=${latitude},${longitude}`))
        callback()
    })

    //disconnect is the event that is controled over the socket.io
    socket.on('disconnect', () => {
        const user = deleteUser(socket.id)
        if(user){
            io.to(user.room).emit('message',generateMessage( 'admin',`${user.username} left the Chat Room!`))
            io.to(user.room).emit('usersList',{
                room: user.room,
                users: getUsersInRoom(user.room)
            })
        }

       

    })

   
})


server.listen(port, () => {
    console.log(`server is up and running on port ${port}`)
})