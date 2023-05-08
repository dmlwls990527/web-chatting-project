/*
    login.js : login process for ChattyFY
    There are two kinds of JSON messages
        1) client -> server 
            MY_LOGIN_ATTEMPT
        2) server -> client
            LOGIN_SUCCESS, LOGIN_FAILURE_BY_ID, LOGIN_FAILURE_BY_PW

    Upon successful login, chatRoom.html is loaded.
    2023.5.1 ~ Jongki Park
*/

document.addEventListener('DOMContentLoaded', () => {
    const WebSocket = window.WebSocket;
    const ws = new WebSocket('ws://220.149.236.151:8080');

    const loginForm = document.querySelector('form');

    const handleSubmit = (event) => {
        event.preventDefault();

        const emailInput = document.querySelector('input[type="email"]');
        const passwordInput = document.querySelector('input[type="password"]');

        const email = emailInput.value.trim();
        const password = passwordInput.value.trim();

        ws.send(JSON.stringify({
            type: 'MY_LOGIN_ATTEMPT',
            data: {
                email: email,
                password: password
            }
        }));

        loginForm.removeEventListener('submit', handleSubmit);
    };
    loginForm.addEventListener('submit', handleSubmit);

    ws.addEventListener('message', (event) => {
        const message = JSON.parse(event.data);

        switch(message.type) {
            case 'LOGIN_SUCCESS':
                alert('Login Success');

                window.location.href = `chatRoom.html?userID=${message.data.userID}`;
                localStorage.setItem('userID', message.data.userID);
                break;

            case 'LOGIN_FAILURE_BY_ID':
                alert('Login Failed invalid ID(Email)');

                loginForm.addEventListener('submit', handleSubmit);
                break;

            case 'LOGIN_FAILURE_BY_PW':
                alert('Login Failed check password');

                loginForm.addEventListener('submit', handleSubmit);
                break;

            default:
                console.log('Invalid message type');
                break;
        }
    });
});
