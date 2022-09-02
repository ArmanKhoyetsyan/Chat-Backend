CREATE TABLE
  users(
    id SERIAL PRIMARY KEY,
    name VARCHAR(50),
    password VARCHAR(50)
  )
CREATE TABLE
  users(id SERIAL PRIMARY KEY,)
CREATE TABLE
  message(
    id SERIAL PRIMARY KEY,
    message VARCHAR(500),
    sender VARCHAR(20)
  )
CREATE TABLE
  groupMessage(
    id SERIAL PRIMARY KEY,
    firstUser INT,
    secondUser INT,
    CONSTRAINT fk_firstUser FOREIGN KEY(firstUser) REFERENCES users(id),
    CONSTRAINT fk_secondUser FOREIGN KEY(secondUser) REFERENCES users(id)
  );

CREATE TABLE
  messages(
    id SERIAL PRIMARY KEY,
    message VARCHAR(500),
    groupId INT,
    senderId INT,
    lastMessage INT,
    CONSTRAINT fk_groupId FOREIGN KEY(groupId) REFERENCES groupMessage(id)
  );

INSERT INTO
  messages(message, groupId, senderId, lastMessage)
VALUES
  ('Barev', 2, 1, 5);

INSERT INTO
  groupMessage(firstUser, secondUser)
VALUES
  (1, 2,)