/*
    specificRoom.js : Enter an existing chat room or 
        add a new participant within the chat room

    There are two kinds of JSON messages
        1) client -> server
            MY_CHAT_ROOM_LOG, MY_CHAT_LOG, MY_NEW_CHAT_MESSAGE
        2) server -> client
            ROOM_LOG, CHAT_LOG
        
    2023.4.10 ~ Jongki Park
*/

document.addEventListener('DOMContentLoaded', () => {
    const WebSocket = window.WebSocket;
    const ws = new WebSocket('ws://220.149.236.151:8080');

    const userID = localStorage.getItem("userID");
    const chatroomID = localStorage.getItem("chatroomID");
    
    const roomNameElement = document.getElementById("roomName");
    const participantsList = document.getElementById("participants");
    
    const chatHistoryList = document.getElementById("chatHistory");
    const chatMessageInput = document.getElementById("chat-message");
    const sendMessageButton = document.getElementById("send-message");

    const addParticipantInput = document.getElementById("addParticipant");
    const addParticipantButton = document.getElementById("add");
    
    const now = new Date();
    const twoWeeksAgo = new Date(now.getTime() - (14 * 24 * 60 * 60 * 1000));
    const start_time = twoWeeksAgo.toISOString();
    const end_time = now.toISOString();

    /*
        Client send request for CHAT_LOG to server
    */
    ws.addEventListener('open', (event) => {
        ws.send(JSON.stringify({
            type: 'MY_CHAT_ROOM_LOG',
            data: {
                userID: userID,
                chatroomID: chatroomID
            }
        }));

        ws.send(JSON, stringify({
            type: 'MY_CHAT_LOG',
            data: {
                userID: userID,
                chatroomID: chatroomID,
                start: start_time,
                end: end_time
            }
        }));
    });
    
    /*
        Client handles message from server
        two kinds of message exist 
    */
    ws.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);

        switch(message.type) {
            case 'ROOM_LOG':
                break;
            
            case 'CHAT_LOG':
                break;

            default:
                console.log('Invalid message type');
                break;
        }
    });

    sendMessageButton.addEventListener('click', (event) => {
        const message = chatMessageInput.value.trim();
        if (message) {
            ws.send(JSON.stringify({
                type: 'MY_NEW_CHAT_MESSAGE',
                data: {
                    userID: userID,
                    chatroomID: chatroomID,
                    message: message
                }
            }));
            chatMessageInput.value = '';
        }
    });

});