const socket = io()

// dom elements
const $myform = document.querySelector('#messageForm')
const $formButton = $myform.querySelector('button')
const $formInput = $myform.querySelector('input')
const $locationButton = document.querySelector('#location')
const $messages = document.querySelector('#messages')
const $sidebar = document.querySelector('#sidebar')


//templates
const messageTemplate = document.querySelector('#message-template').innerHTML
const locationTemplate = document.querySelector('#location-template').innerHTML
const sidebarTemplate = document.querySelector('#sidebar-template').innerHTML

//options
//this get the parameter from the url of the join page and delete the ? of the first and return the values of the properties
const {username , room } = Qs.parse(location.search,{ ignoreQueryPrefix : true})


const autoscroll = () =>{
    //get the newst message 
    const $newMessage = $messages.lastElementChild

    //height of the new message plus margin
    const messageStyles = getComputedStyle($newMessage)
    const messageMargin = parseInt(messageStyles.marginBottom)
    const newmessageHeight = $newMessage.offsetHeight + messageMargin
    

    //visible height 
    const visibleHeight = $messages.offsetHeight

    //container height
    const containerHeight = $messages.scrollHeight

    //where are we now? 
    const ourHeight = $messages.scrollTop + visibleHeight 

    if(containerHeight - newmessageHeight <= ourHeight){
        $messages.scrollTop = $messages.scrollHeight
    }
}

socket.on('message', (msg) => {
    console.log(msg)
    const html = Mustache.render(messageTemplate, {
        username: msg.username,
        msg: msg.text,
        createdAt: moment(msg.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend',html)
    autoscroll()

})

socket.on('LocationMessage', (url) => {
    console.log(url)
    const html = Mustache.render(locationTemplate, {
        username: url.username, 
        url : url.url,
        createdAt : moment(url.createdAt).format('h:mm a')
    })
    $messages.insertAdjacentHTML('beforeend', html)
    autoscroll()
} )

socket.on('usersList', ({room, users}) =>{
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    })
    // we dont use .insertAdjacect because every time we want to change entire element
    $sidebar.innerHTML = html
})

$myform.addEventListener('submit', (e) =>{
    e.preventDefault()

    //disable form to submit again 
    $formButton.setAttribute('disabled','disabled')

    //e.target stands for the target of this event that is #messageform and in its 'elements' we access the element by its name 
    const message  = e.target.elements.msgInput.value

    socket.emit('myMessage', message, (error) => {
        //enable form to submit 
        $formButton.removeAttribute('disabled')
        $formInput.value = ''
        $formInput.focus()
        if(error){
            alert(error)
            return console.log(error)
        }

        console.log('message delivered')
        
    })
})


document.querySelector('#location').addEventListener('click', () => {
    if(!navigator.geolocation){
        return alert('your browser cant support geolocation')
    }

    //disable to send location again
    $locationButton.setAttribute('disabled', 'disabled')

    navigator.geolocation.getCurrentPosition((position) => {
      
        socket.emit('sendLocation',  {
            latitude: position.coords.latitude, 
            longitude: position.coords.longitude
        }, () => {
            $locationButton.removeAttribute('disabled')
            console.log('location shared!')
        })
    }) 
})

socket.emit('join' , {username, room}, (error) =>{
    if(error){
        alert(error)
        //if an error accours we should send the user to the join page again 
        location.href = '/'
    }
})