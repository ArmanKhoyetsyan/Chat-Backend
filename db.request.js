const { Pool } = require('pg')

const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    password: '15975324862Ax',
    database: 'chat',
    port: '5432'
});

const getUsers = async () => {
    try {
        const response = await pool.query(`SELECT * FROM users`)
        return response.rows
    } catch (error) {
        console.log(error)
    }
}
const getUserId = async (userName) => {
    try {
        const response = await pool.query(`SELECT * FROM users where name = $1;`, [userName])
        return response.rows?.[0]?.id
    } catch (error) {
        console.log(error)
    }
}
const getUserName = async (userId) => {
    try {
        const response = await pool.query(`SELECT * FROM users where id=$1;`, [userId])
        return response.rows?.[0]?.name
    } catch (error) {
        console.log(error)
    }
}

const getGroupeId = async (firstUserId, secondUserId) => {
    try {
        const response = await pool.query(`SELECT * FROM groupmessage where firstuser=$1 AND seconduser=$2 OR firstuser=$2 AND seconduser=$1;`, [firstUserId, secondUserId])
        return response.rows?.[0]?.id
    } catch (error) {
        console.log(error);
    }
}

const getMessages = async (groupId) => {
    try {
        const response = await pool.query(`SELECT * FROM messages where groupid =$1`, [groupId])
        return response.rows
    } catch (error) {
        console.log(error)
    }
}

const writeMessages = async (message, groupid, senderid, lastMessage) => {
    try {
        await pool.query(`INSERT INTO messages(message,groupid, senderid,lastMessage) VALUES($1,$2,$3,$4)`, [message, groupid, senderid,lastMessage])
    } catch (error) {
        console.log(error)
    }
}

const getGroups = async (userId) => {
    try {
        const response = await pool.query(`SELECT * FROM groupmessage where firstuser=$1 OR seconduser=$1`, [userId])
        return response.rows
    } catch (error) {
        console.log(error)
    }
}

const createGroupe = async (secondUserId, firstUserId) => {
    try {
        await pool.query(`INSERT INTO groupMessage(firstUser, secondUser) VALUES($1, $2)`, [secondUserId, firstUserId])
    } catch (error) {
        console.log(error)
    }
}
module.exports = {
    getUsers,
    getGroups,
    getUserId,
    getMessages,
    writeMessages,
    getGroupeId,
    createGroupe,
    getUserName
}
