const { Pool } = require('pg')

const pool = new Pool({
    connectionString:process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

// const pool = new Pool({
//     user: 'postgres',
//     host: 'localhost',
//     password:'15975324862',
//     database: 'chat',
//     port: '5432'
// });

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
        return response.rows[0].id
    } catch (error) {
        console.log(error)
    }
}
const getUserName = async (userId) => {
    try {
        const response = await pool.query(`SELECT * FROM users where id=$1;`, [userId])
        return response.rows[0].name
    } catch (error) {
        console.log(error)
    }
}

const getGroupeId = async (firstUserId, secondUserId) => {
    try {
        const response = await pool.query(`SELECT * FROM groupmessage where firstuser=$1 AND seconduser=$2 OR firstuser=$2 AND seconduser=$1;`, [firstUserId, secondUserId])
        return response.rows[0].id
    } catch (error) {
        console.log(error);
    }
}

const getMessages = async (groupId) => {
    try {
        const response = await pool.query(`SELECT * FROM messages where groupid =$1`, [groupId])
        return response.rows.sort((a, b) =>  b.id - a.id)
    } catch (error) {
        console.log(error)
    }
}

const writeMessages = async (message, groupid, senderid, messageTime,read) => {
    try {
        await pool.query(`INSERT INTO messages(message,groupid, senderid,messageTime,read) VALUES($1,$2,$3,$4,$5)`, [message, groupid, senderid, messageTime, read])
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

const getGroupe = async (groupId) => {
    try {
        const response = await pool.query(`SELECT * FROM groupmessage where id=$1 `, [groupId])
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

const editUserLastVisit = async (userId, date) => {
    try {
        await pool.query(`UPDATE users SET lastVisit='${date}' WHERE id=${userId}`)
    } catch (error) {
        console.log(error);
    }
}
const editReadVal = async (senderId, groupId) => {
    try {
        await pool.query(`UPDATE messages SET read=${true} WHERE senderid!=${senderId} AND groupid=${groupId}`)
    } catch (error) {
        console.log(error);
    }
}

module.exports = {
    editReadVal,
    getUsers,
    getGroups,
    getUserId,
    getMessages,
    writeMessages,
    editUserLastVisit,
    getGroupeId,
    createGroupe,
    getUserName,
    getGroupe
}
