import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    user:{type:mongoose.Schema.Types.ObjectId,ref:"Users"},
    message:String,
    room:String,
    timestamp: {
        type: Date,
        default: Date.now
    }
});
const messageModel = mongoose.model('Message', messageSchema);
export default messageModel;