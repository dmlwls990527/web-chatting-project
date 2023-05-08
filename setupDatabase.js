/*
   setupDatabase.js
   Connecting Database with server program
   Creating database and tables
   2023.4.30 park jong ki
*/

const mysql = require('mysql');
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '0000'
});

const userTableQuery = `
	CREATE TABLE IF NOT EXISTS users (
		id INT NOT NULL AUTO_INCREMENT,
		username VARCHAR(255) NOT NULL,
		email VARCHAR(255) NOT NULL,
		password VARCHAR(255) NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		PRIMARY KEY (id)
	)
`;

const friendTableQuery = `
	CREATE TABLE IF NOT EXISTS friends (
		id INT NOT NULL AUTO_INCREMENT,
		user_id INT NOT NULL,
		friend_id INT NOT NULL,
		PRIMARY KEY (id),
		FOREIGN KEY (user_id) REFERENCES users(id),
		FOREIGN KEY (friend_id) REFERENCES users(id)
	)
`;
const roomTableQuery = `
	CREATE TABLE IF NOT EXISTS rooms (
		id INT AUTO_INCREMENT,
		name VARCHAR(255) NOT NULL,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		PRIMARY KEY (id)
  	)
`;

const room_participantsTableQuery = `
	CREATE TABLE IF NOT EXISTS room_participants (
		id INT AUTO_INCREMENT,
		room_id INT NOT NULL,
		user_id INT NOT NULL,
		PRIMARY KEY (id),
		FOREIGN KEY (room_id) REFERENCES rooms(id),
		FOREIGN KEY (user_id) REFERENCES users(id)
	)
`;

const messageTableQuery = `
	CREATE TABLE messages (
		id INT AUTO_INCREMENT,
		room_id INT NOT NULL,
		user_id INT NOT NULL,
		message TEXT NOT NULL,
		politeness_score DOUBLE DEFAULT 0,
		created_at TIMESTAMP NOT NULL DEFAULT NOW(),
		PRIMARY KEY (id),
		FOREIGN KEY (room_id) REFERENCES rooms(id),
		FOREIGN KEY (user_id) REFERENCES users(id)
	)
`;

connection.connect((err) => {
	if(err) throw err;
	console.log('Database connected!');

	connection.query("CREATE DATABASE IF NOT EXISTS CHATTYFY", (err, result, fields) => {
		if(err) throw err;
		if(result.warningCount === 1) {
			console.log('Already exists');
		} else {
			console.log('Database CHATTYFY created');
		}
		
		connection.query("USE CHATTYFY", (err, result, fields) => {
			if (err) throw err;
			console.log('Database CHATTYFY selected');

			connection.query(userTableQuery, (err, result, fields) => {
				if(err) throw err;
				console.log('Table "users" created');
				
				connection.query(friendTableQuery, (err, result, fields) => {
					if(err) throw err;
					console.log('Table "friends" created');

					connection.query(roomTableQuery, (err, result, fields) => {
						if(err) throw err;
						console.log('Table "rooms" created');

						connection.query(room_participantsTableQuery, (err, result, fields) => {
							if(err) throw err;
							console.log('Table "room_participants" created');

							connection.query(messageTableQuery, (err, result, fields) => {
								if(err) throw err;
								console.log('Table "messages" created');

								connection.end((err) => {
									if(err) throw err;
									console.log('Database connection closed.');
								});
							});
						});
					});
				});
			});
		});
	});
});

