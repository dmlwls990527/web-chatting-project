/*
    server.js : Handles all the client requests.
    Currently, the server is configured in a monolithic form,
    but we plan to upgrade to a distributed form later.

    Type of messages sent by the client starts with MY_XXXX
    Type of messages sent to client do not start with MY_XXXX
    2023.4.30 ~ Jongki Park
*/

const mysql = require('mysql');
const moment = require('moment');
//const data = moment().format('YYYY-MM-DD HH:mm:ss');
const { spawn } = require('child_process');
const express = require('express');
const WebSocket = require('ws');

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '0000',
    database: 'CHATTYFY'
});

const wss = new WebSocket.Server({port : 8080});

db.connect((err) => {
    if(err) {
        console.error('MySQL connection Error' + err.stack);
        return;
    }

    console.log("MySQL connected successfully!");
});

wss.on('connection', (ws) => {
    console.log('Client connected');

    let userID;
    let roomName;
    let roomID;

    ws.on('message', (message) => {
        console.log('Message from client' + message);

        const request = JSON.parse(message);

        switch(request.type) {
            case 'MY_LOGIN_ATTEMPT':
                if(validUser(request.data.email, request.data.password)) {
                    ws.send(JSON.stringify({
                        type: 'LOGIN_SUCCESS',
                        data: {
                            userID: getUserID(request.data.email)
                        }
                    }));
                } else {
                    const userExists = checkByEmail(request.data.email);
                    if(userExists == false) {
                        //user not exist
                        ws.send(JSON.stringify({
                            type: 'LOGIN_FAILURE_BY_ID',
                            data: {}
                        }));
                    }
                    else {
                        //user exist but wrong password
                        ws.send(JSON.stringify({
                            type: 'LOGIN_FAILURE_BY_PW',
                            data: {}
                        }));
                    }
                }

                break;

            case 'MY_CHAT_ROOMS_LIST':
                userID = request.data.userID;

                if (userID) {
                    db.query(`
                        SELECT rooms.id, rooms.name, rooms.created_at
                        FROM room_participants
                        JOIN rooms ON room_participants.room_id = room.id
                        WHERE room_participants.user_id = ? 
                        `, [userID], (error, results) => {
                            if(error) {
                                console.log('ROOM_LIST query error');
                                return;
                            }
                            
                            const rooms_info = results.map((room) => {
                                return {
                                    id: room.id,
                                    name: room.name,
                                    created_at: room.created_at
                                };
                            });

                            ws.send(JSON.stringify({
                                type: 'ROOMS_LIST',
                                data: rooms_info
                            }));
                        });
                }
                break;

            case 'NEW_ROOM':
                userID = request.data.userID;
                roomName = request.data.name;

                if (roomName && userID) {
                    db.query(`
                        INSERT INTO rooms (name, created_at)
                        VALUES (?, NOW())
                        `, [roomName], (error, results) => {
                        if (error) {
                            console.log('NEW_ROOM query error');
                            return;
                        }

                        const roomID = results.insertId;

                        db.query(`
                            INSERT INTO room_participants (user_id, room_id)
                            VALUES (?, ?)
                            `, [userID, roomID], (error, results) => {
                            if (error) {
                                console.log('NEW_ROOM query error');
                                return;
                            }

                            ws.send(JSON.stringify({
                                type: 'NEW_ROOM_SUCCESS',
                                data: {
                                    id: roomID,
                                    name: roomName,
                                    created_at: 'NOW()'
                                }
                            }));
                        });     
                    });
                }
                break;
            
            case 'MY_CHAT_ROOM_LOG':
                userID = request.data.userID;
                roomID = request.data.chatroomID;

                if(userID && roomID) {
                    db.query(`
                        SELECT r.id, r.name, r.created_at, GROUP_CONCAT(rp.user_id) AS participants
                        FROM rooms AS r
                        INNER JOIN room_participants AS rp ON r.id = rp.room_id
                        WHERE r.id = ? AND rp.user_id = ?
                        GROUP BY r.id
                        `, [chatroomID, userID], (error, results) => {
                        if (error) {
                            console.log('ROOM_LOG query error');
                            return;
                        }
                        
                        const [room] = results;
                        if (!room) {
                            console.log(`No chatroom found for id ${chatroomID} and user ${userID}`);
                            return;
                        }

                        const participants = room.participants.split(',');
    
                        ws.send(JSON.stringify({
                            type: 'ROOM_LOG',
                            data: {
                                id: room.id,
                                name: room.name,
                                created_at: room.created_at,
                                participants,
                            }
                        }));
                    });
                }
                break;

            case 'MY_CHAT_LOG':
                userID = request.data.userID;
                roomID = request.data.chatroomID;

                if (userID && roomID) {
                    db.query(`
                        SELECT messages.id, messages.user_id, messages.message, messages.created_at, users.name
                        FROM messages
                        JOIN users ON messages.user_id = users.id
                        WHERE messages.chatroom_id = ? 
                        `, [roomID], (error, results) => {
                        if(error) {
                            console.log('ROOM_LOG query error');
                            return;
                        }

                        const chat_log = results.map((msg) => {
                            return {
                                id: msg.id,
                                user_id: msg.user_id,
                                name: msg.name,
                                message: msg.message,
                                created_at: msg.created_at
                            };
                        });
        
                        ws.send(JSON.stringify({
                            type: 'CHAT_LOG',
                            data: chat_log
                        }));
                    });
                }
                break;

            case 'MY_NEW_CHAT_MESSAGE':
                userID = request.data.userID;
                roomID = request.data.chatroomID;
                const messageText = request.data.message;
                const pythonProcess = childProcess.spawn('python', ['run_politeness_analysis.py', messageText]);
                let analysisResult = '';
                const now = new Date();
                const timestamp = now.toISOString();

                pythonProcess.stdout.on('data', function (data) {
                    analysisResult += data.toString();
                  });
                  
                  pythonProcess.on('close', function (code) {
                    const analysis = JSON.parse(analysisResult.trim());
                    const isPolite = analysis.is_polite;

                    db.query(`
                        INSERT INTO messages (user_id, chatroom_id, message, is_polite, created_at)
                        VALUES (?, ?, ?, ?, ?)
                        `, [userID, chatroomID, text, Number(isPolite), timestamp], (error, results) => {
                        if (error) {
                            console.log('NEW_CHAT_MESSAGE query error');
                            return;
                        }
              
                        const newMessageID = results.insertId;
                        const newMessage = {
                            id: newMessageID,
                            user_id: userID,
                            name: '',
                            message: text,
                            is_polite: Number(isPolite),
                            created_at: timestamp
                        };

                        const newMessageEvent = {
                            type: 'UPDATE_NEW_CHAT_MESSAGE',
                            data: newMessage
                        };
                        sendToAllConnected(JSON.stringify(newMessageEvent), chatroomID, ws);
                    });
                });
                break;

            default:
                console.error('Unknown request: ' + message);
        }
    });

    ws.on('close', () => {
        //데이터베이스와의 연결을 끊어구는 코드 추가
        console.log('Client closed connection');
    });
});

//If user info exists in database, return true . If it doesn't, return false
function validUser(email, password) {
    const InputQuery = `SELECT * FROM users WHERE email = '${email}' AND password = '${password}'`;
    const result = db.query(InputQuery);

    if(result.length > 0) {
        return true;
    }
    else {
        return false;
    }
}

//Returns user id from database. No need to check if exists
function getUserID(email) {
    const InputQuery = `SELECT id FROM users WHERE email ='${email}'`;
    const result = db.query(InputQuery);

    return result[0].id;
}

//Called to check if password is valid.
function checkByEmail(email) {
    const InputQuery = `SELECT * FROM users WHERE email = '${email}'`;
    const result = db.query(InputQuery);

    if(result.length > 0) {
        return true;
    }
    else {
        return false;
    }
}

function sendToAllConnected() {

}
// fs 모듈 사용해서 로그 파일 생성 및 작성, 추가 데이터 작성 
const fs = require('fs');

const logFilePath = 'logs.txt';

// 로그 파일 생성 및 작성
const logData = 'Log data to be written';
fs.writeFileSync(logFilePath, logData);

// 추가 데이터 작성 (로그)
const moreLogData = 'More log data to be written';
fs.appendFileSync(logFilePath, moreLogData);
