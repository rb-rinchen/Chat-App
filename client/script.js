const socket = io.connect('http://localhost:3000');

const formContainer=document.getElementById("chatForm-container");
const nameInput=document.getElementById("chat-main");
const roomInput=document.getElementById("chat-sub");
const imageInput=document.getElementById("profile-pic");
const chatBoxContainer = document.querySelector(".chatbox-container");
const chatBoxInbox=document.querySelector(".chatbox-inbox");
const onlineUsersBox=document.querySelector(".chatbox-users");
let name="";
let image;
let roomId="";
let message="";


function submitForm(event){
   event.preventDefault();
   name=nameInput.value;  
   image=imageInput.files[0];
   image=URL.createObjectURL(image);
   roomId=roomInput.value;
   nameInput.value="";
   roomInput.value="";
   formContainer.style.display="none";
   chatBoxContainer.style.display="flex";
   socket.emit('join', { name, roomId,image});
   imageInput.value="";
   joinRoom();
   socket.on("activeUsers",(activeUsers)=>{
         showActiveUsers(activeUsers);
    });
}
function joinRoom() {
    socket.on("message", (message) => {
        const WelcomeText=document.createElement('h4');
        if(message.user){
            const chatbox = document.createElement("div");
            chatbox.className = "chatbox-messages";
            const profilePic = document.createElement("img");
            profilePic.className = "chatbox-userImg";
            profilePic.src = message.image;
            const textMessage = document.createElement("span");
            const user = document.createElement("p");
            user.textContent=message.user;
            textMessage.textContent=message.text;
            chatbox.appendChild(profilePic);
            chatbox.appendChild(user);
            chatbox.appendChild(textMessage);
            chatBoxInbox.appendChild(chatbox);
            
        }
        else if(message.joinUser){ 
            const notify=document.querySelector(".chatbox-notify");
            const messageText=document.createElement("p");
            messageText.textContent=message.joinUser;
            notify.appendChild(messageText);
    
        }
        else if(message.disconnect){
            const notify=document.querySelector(".chatbox-notify");
            const messageText=document.createElement("p");
            messageText.textContent=message.disconnect;
            messageText.style.color="red";
            notify.appendChild(messageText);
        }
        else{
            WelcomeText.textContent=`Welcome, ${message.text}!`;
            chatBoxInbox.appendChild(WelcomeText);
        }
    });
}

function showActiveUsers(users){
    users.activeUsers.map((user)=>{
        const onlineUser=document.createElement("div");
        onlineUser.className="chatbox-user";
        const online=document.createElement("span");
        const userName=document.createElement("p");
        userName.textContent=user.name;
        onlineUser.appendChild(online);
        onlineUser.appendChild(userName);
        onlineUsersBox.appendChild(onlineUser);
    });
}

function sendMessage(event){
    event.preventDefault();
    const sendMessageInput=document.querySelector(".chatbox-input");
    let message=sendMessageInput.value;
    socket.emit("sendMessage",{name,message,image,roomId});
    sendMessageInput.value="";
   
}

socket.on('previousMessages', (data) => {
    data.messages.forEach((msg)=>{
        const chatbox = document.createElement("div");
        chatbox.className = "chatbox-messages";
        const profilePic = document.createElement("img");
        profilePic.className = "chatbox-userImg";
        profilePic.src =msg.user.image;
        const textMessage = document.createElement("span");
        const user = document.createElement("p");
        user.textContent=msg.user.name;
        textMessage.textContent=msg.message;
        chatbox.appendChild(profilePic);
        chatbox.appendChild(user);
        chatbox.appendChild(textMessage);
        chatBoxInbox.appendChild(chatbox);
    })
});
