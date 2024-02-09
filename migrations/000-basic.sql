CREATE TYPE GRADE AS ENUM ('Fail', 'Pass');

CREATE TABLE CARDS (
	ID SERIAL PRIMARY KEY,
	Front TEXT NOT NULL,
	Back TEXT NOT NULL DEFAULT ''
);

CREATE TABLE REVIEWS (
	ID SERIAL PRIMARY KEY,
	CardID INT NOT NULL REFERENCES Cards(ID) ON DELETE CASCADE,
	UserID TEXT NOT NULL,
	Grade GRADE NOT NULL,
	Time TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE USER_CARDS (
	UserID TEXT NOT NULL,
	CardID INT NOT NULL REFERENCES CARDS(ID) ON DELETE CASCADE,
	Due DATE,
	Streak INT NOT NULL DEFAULT 0,

	PRIMARY KEY(UserID, CardID)
);
