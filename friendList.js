/*
    friendList.js : 

    2023.5.2 ~ park jong ki
*/

document.addEventListener('DOMContentLoaded', () => {
    const WebSocket = window.WebSocket;
    const ws = new WebSocket('ws://220.149.236.151:8080');

    const userID = localStorage.getItem("userID");
    
    const friendList = document.getElementById('friendList');

    let friends = [];
    let dl;
    let dt;
    let dd;

    /*
        
    */
    ws.addEventListener('open', (event) => {
        ws.send(JSON.stringify({
            type: 'MY_FRIENDS_LIST',
            data: {
                userID: userID
            }
        }));
    });
    
    /*
        
    */
    ws.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);

        switch(message.type) {
            case 'FRIEND_LIST':
                friends = message.data;
                displayFriends();
                break;
            
            case 'CHAT_ROOM_LIST_WITH_FRIEND':
                const chatRooms = message.data;
                const friendID = message.data.friendID;

                if(chatRooms.length === 0 || chatRooms.filter(room => room.participants.length === 2).length === 0) {
                    ws.send(JSON.stringify({
                        type: 'MY_NEW_CHAT_ROOM',
                        data: {
                            userID: userID,
                            friendID: friendID
                        }
                    }));
                }
                else {
                    const roomID = chatRooms.filter(rooms => room.participants.length === 2)[0].id;
                    localStorage.setItem('roomID', roomID);
                    window.location.href = 'specificRoom.html';
                }
                break;

            default:
                console.log('Invalid message type');
                break;
        }
    });

    function displayFriends() {
        friendList.innerHTML = '';

        for(let i = 0; i < friends.length; i++) {
            dl = document.createElement("dl");
            dt = document.createElement("dt");
            dd = document.createElement("dd");

            dt.innerHTML = friends[i].name + "(" + friends[i].id + ")";
            dd.innerHTML = "Click here to chat with";

            dd.addEventListener("click", () => chatHandler(userID, friends[i].id));

            friendList.appendChild(dl);
            dl.appendChild(dt);
            dl.appendChild(dd);
        }
    }

    function chatHandler(myID, friendID) {
        ws.send(JSON.stringify({
            type: 'MY_CHAT_ROOM_LIST_WITH_FRIEND',
            data: {
                userID: userID,
                friendID: friendID
            }
        }));
    }
});