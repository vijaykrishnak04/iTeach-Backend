import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  participants: [
    {
      type: mongoose.Schema.Types.ObjectId,
    }
  ],
  messages: [{
    recieverId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    senderId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    text: {
      type: String,
      required: true
    },
    timestamp: {
      type: Date,
    }
  }]
}, { timestamps: true });


const Chat = mongoose.model('Chat', chatSchema);

export default Chat;
