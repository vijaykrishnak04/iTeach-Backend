import { Server } from 'socket.io';
import Chat from '../Models/ChatSchema.js';

const initSocketIO = (server) => {
    const io = new Server(server, {
        cors: {
            origin: "https://i-teach.netlify.app/"
        }
    });

    const userSockets = {};

    io.on('connection', (socket) => {
        socket.on('register', userId => {
            userSockets[userId] = socket.id;  // Store the mapping
        });

        socket.on('send-message', (outgoingMessage) => {
            console.log(outgoingMessage);
            const { recieverId, senderId, text, timestamp } = outgoingMessage;

            // Find or create a chat between the two participants
            Chat.findOne({
                participants: { $all: [recieverId, senderId] }
            })
                .then(chat => {
                    if (chat) {
                        // Update existing chat
                        return Chat.findOneAndUpdate(
                            { _id: chat._id },
                            { $push: { messages: { recieverId, senderId, text, timestamp } } },
                            { new: true }
                        );
                    } else {
                        // Create a new chat
                        return Chat.create({
                            participants: [recieverId, senderId],
                            messages: [{ recieverId, senderId, text, timestamp }]
                        });
                    }
                })
                .then(updatedChat => {
                    const receiverSocketId = userSockets[recieverId];
                    if (receiverSocketId) {
                        socket.to(receiverSocketId).emit('recieve-message', outgoingMessage);
                    }
                })
                .catch(error => {
                    console.error("Error processing message:", error);
                });

        });
    });
}

export default initSocketIO;
