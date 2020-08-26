//this file is saving the users and for working with them

const users = []


const addUser = ({id, username, room}) => {
    //clean the data. trim will removes the unlike spaces
    username = username.toLowerCase().trim()
    room = room.trim().toLowerCase()


    //validate the data 
    if(!username || !room) {
        return {
            error: 'username or room can not be empty'
        }
    }

    //same username is not valid in the same room
    const doubleusername = users.find( (user) => {
        return  user.room === room && user.username === username 
    }) 

    if(doubleusername){
        return{
            error: 'username is in use!'
        }
    }

    //add user to the users array
    const user = { id, username , room}
    users.push(user)

    return {user}

}

const deleteUser = (id) =>{
    const indexuser = users.findIndex((user) =>{
        return user.id === id
    })

    if(indexuser !== -1){
    //users.splice return an array of all the users have been removed our array has just one object 
    return users.splice(indexuser, 1) [0]
    }
  
}


//find looks for one match and if find it returns it but filter goes to all the array and check them
const getUser = (id) => {
    return  users.find((user) =>  user.id === id)
}

const getUsersInRoom = (room) =>{
    return users.filter((user) => user.room === room)
}

module.exports = {
    addUser,
    deleteUser,
    getUser,
    getUsersInRoom
}