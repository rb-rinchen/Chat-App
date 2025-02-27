import dotenv from "dotenv"
dotenv.config();
import express from "express";
import {Server} from "socket.io";
import http from "http";
import cors from "cors";
import { connectDatabase } from "./config/connectDatabase.js";
import userModel from "./userSchema.js";
import messageModel from "./message.schema.js"
import path from "path";

const app=express();
app.use(express.static(path.join(path.resolve("client","public"))));
app.get('/', (req, res) => {
    res.sendFile(path.join(path.resolve("client","public","index.html")));
});
const server=http.createServer(app);
app.use(cors());
const io=new Server(server,{
    cors:{
        origin:"*",
        methods:["GET","POST"]
    }
});
let userId='';

io.on("connection",(socket)=>{
    console.log("connection has been made");
    socket.on("join", async (data) => {
        const { name, roomId, image} = data;
        socket.emit("message", { text: name });
        socket.broadcast.to(roomId).emit("message", {
            joinUser: `${name} has joined the room.`,
            name: name,
        });
        socket.roomId = roomId;
        socket.user = name;
        socket.join(roomId);
       //save the user 
      const user= new userModel({name,room:roomId,image})
      const saveUser=await user.save();
      userId=saveUser._id;
 
       //send the active users array
       const activeUsers= await userModel.find({room:roomId,active:true});
       socket.emit("activeUsers",{activeUsers});

       //show prev messeages
       const date24HoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
       const messages = await messageModel.find({ 
        room: roomId, 
        timestamp: { $gte: date24HoursAgo } 
    })
    .populate('user', 'name image') // Populate user details (name and image)
    .sort({ timestamp: -1 });
    socket.emit("previousMessages",{messages});
    });
    socket.on("sendMessage", async (data) => {
        const {name,message,image,roomId} = data;
        const user=await userModel.findById(userId);
         const newMessage=new messageModel({user:user._id,message,room:roomId});
         await newMessage.save();
        io.to(roomId).emit("message", {
            user:name,
            text:message,
            image:image
        });
    });
    socket.on("disconnect",async()=>{
        const updatedUser = await userModel.findOneAndUpdate(
            { _id: userId },
            { $set: { active: false } }, 
            { new: true }
        );
      socket.to(socket.roomId).emit("message",{disconnect:`${socket.user} has left the room`});
      console.log("connection has been disconncted");
    })
});

server.listen(3000,()=>{
    console.log("server is listening at the port number 3000");
    connectDatabase();
})