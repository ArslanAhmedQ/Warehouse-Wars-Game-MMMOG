#!/bin/bash
echo "Welcome to our CSC309 Assignment 2. Please enter the information as prompted."
read -p "Enter the schema absolute path: " schema
read -p "Enter the port number: " port

cd db
rm database.db
sqlite3 database.db < $schema
cd ..
npm install
echo "global.port = $port;" > port.js
nodejs ww_node.js