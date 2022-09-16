CREATE TABLE
  users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    password VARCHAR(50),
    lastVisit VARCHAR(50)
  );

CREATE TABLE
  message (
    id SERIAL PRIMARY KEY,
    message VARCHAR(500),
    sender VARCHAR(20)
  )
CREATE TABLE
  groupMessage (
    id SERIAL PRIMARY KEY,
    firstUser INT,
    secondUser INT,
    CONSTRAINT fk_firstUser FOREIGN KEY (firstUser) REFERENCES users (id),
    CONSTRAINT fk_secondUser FOREIGN KEY (secondUser) REFERENCES users (id)
  );

CREATE TABLE
  messages (
    id SERIAL PRIMARY KEY,
    message VARCHAR(500),
    groupId INT,
    senderId INT,
    read BOOL,
    messageTime VARCHAR(50),
    CONSTRAINT fk_groupId FOREIGN KEY (groupId) REFERENCES groupMessage (id)
  );

INSERT INTO
  users (name, password, lastVisit)
VALUES
  ('Arman', '123321', '');

INSERT INTO
  messages (message, groupId, senderId, messageTime,read)
VALUES
  ('Barev', 1, 1, 'as',false);

INSERT INTO
  groupMessage (firstUser, secondUser)
VALUES
  (1, 3);

DELETE FROM table_name WHERE condition;

DROP 

UPDATE
  messages
SET
  message = 'Vonch es?'
WHERE
  ID = 1;