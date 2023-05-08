#!/bin/bash

#variables in shell script
PATH="/"

# run setupDatabase.js
node ${PATH}/setupDatabase.js

# run train_politeness_analysis.py
python ${PATH}/train_politeness_analysis.py

# run server_daemon.js
node ${PATH}/server_daemon.js &

# run server.js
node ${PATH}/server.js

