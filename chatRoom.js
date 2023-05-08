    /*
        chatRoom.js : shows a list of all chat rooms the user is participating in
        There are two kinds of JSON messages
            1) client -> server 
                MY_CHAT_ROOMS_LIST
            2) server -> client
                ROOMS_LIST
            
        2023.4.9 ~ Jongki Park
    */

    document.addEventListener('DOMContentLoaded', () => {
        const WebSocket = window.WebSocket;
        const ws = new WebSocket('ws://220.149.236.151:8080');

        const userID = new URLSearchParams(window.location.search).get('userID');
        localStorage.setItem('userID', userID);
        
        const roomList = document.getElementById('roomList');

        let rooms = [];
        let dl;
        let dt;
        let dd;

        /*

        */
        ws.addEventListener('open', (event) => {
            ws.send(JSON.stringify({
                type: 'MY_CHAT_ROOMS_LIST',
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
                case 'ROOMS_LIST':
                    rooms = message.data;
                    displayRooms();
                    break;

                default:
                    console.log('Invalid message type');
                    break;
            }
        });

        function displayRooms() {
            roomList.innerHTML = '';

            for(let i = 0; i < rooms.length; i++) {
                dl = document.createElement("dl");
                dt = document.createElement("dt");
                dd = document.createElement("dd");

                dt.innerHTML = rooms[i].name + "(" + rooms[i].id + ")";
                dd.innerHTML = `Created at ${rooms[i].created_at}`;

                dt.addEventListener("click", () => enterRoom(rooms[i].id));

                
                roomList.appendChild(dl);
                dl.appendChild(dt);
                dl.appendChild(dd);
            }
        }

        function enterRoom(roomId) {
            localStorage.setItem("chatroomID", roomId);
            window.location.href = "./specificRoom.html";
        }
    });