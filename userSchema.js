import mongoose from "mongoose";

const userSchema=new mongoose.Schema({
    name:String,
    room:String,
    image:String,
    active:{type:Boolean,default:true}
});

const userModel=mongoose.model("Users",userSchema);

export default userModel;