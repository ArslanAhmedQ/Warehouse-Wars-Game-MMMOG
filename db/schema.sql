--- load with 
--- sqlite3 database.db < schema.sql

CREATE TABLE appuser (
	user VARCHAR(20) primary key,
	password VARCHAR(20) NOT NULL,
	---passwordRepeat VARCHAR(20) NOT NULL,
	firstName text(20) NOT NULL,
	lastName text(20) NOT NULL,
	gender text(20) NOT NULL,
	birthday date NOT NULL,
	score varchar(20) NOT NULL
);


