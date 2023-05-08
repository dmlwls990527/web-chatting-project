/* 
기능 분리를 위해 chatRoom.html 에서 새로운 채팅방을 생성하는 부분을 삭제
<body> 의 <div> 태그 내에 위치했던 폼 요소를 떼어옴

<form id="createRoomForm">
<input type="text" placeholder="chat room name">
<button type="submit"> Create </button>
</form>
*/


/*
chatRoom.js 에서 폼 요소를 처리하는 부분을 삭제

const createRoomForm = document.getElementById('createRoomForm');
....
case 'NEW_ROOM_SUCCESS':
    refreshRooms();
    break;
....

createRoomForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const roomName = createRoomForm.querySelector('input').value;

    ws.send(JSON.stringify({
        type: 'NEW_ROOM',
        data: {
            name: roomName
        }
    }));
});
....

function refreshRooms() {
    ws.send(JSON.stringify({
        type: 'ROOMS_LIST',
        data: {
            userID: userID
        }
    }));
}
    
*/