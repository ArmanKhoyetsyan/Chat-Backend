const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser');
const app = express();
const http = require('http');
const { Server } = require('socket.io');
const router = require('./routers');
const {
    getUserId,
    getGroupeId,
    getMessages,
    writeMessages,
    getGroups,
    createGroupe,
    getUserName,
    editUserLastVisit,
    getGroupe,
    editReadVal
} = require('./db.request');
const server = http.createServer(app);
const port = process.env.PORT || 3030;
const io = new Server(server, {
    cors: {
        origin: ["https://arman-chat.herokuapp.com", 'http://localhost:3000'],
        methods: ["GET", "POST"]
    }
});

app.use(cors())
app.use(bodyParser.json({ limit: '50mb' }));

const connection = []

app.post('/login', router)

io.on('connection', (socket) => {
    connection.push({ id: socket.id, getMessage: false })

    socket.on('get_groupe', async (data) => {

        const userId = await getUserId(data.userName)
        const groupers = await getGroups(userId)
        const date = new Date().toISOString()
        await editUserLastVisit(userId, date)
        for (let elem of groupers) {
            elem.firstuser = await getUserName(elem.firstuser)
            elem.seconduser = await getUserName(elem.seconduser)
        }
        io.emit('get_groupe', groupers)
    })

    socket.on('get_messages', async (data) => {
        const i = connection.findIndex(el => {
            return el.id === socket.id
        })
        const date = new Date().toISOString()
        connection[i].getMessage = true
        const secondUserId = await getUserId(data.secondUser)
        const firstUserId = await getUserId(data.firstUser)
        await editUserLastVisit(firstUserId, date)
        const groupId = await getGroupeId(firstUserId, secondUserId)
        if (groupId) {
            const messages = await getMessages(groupId)
            const notRead = messages.filter(el => !el.read && el.senderid !== firstUserId)
            await editReadVal(firstUserId, groupId)
            messages.sort((a, b) => a.id - b.id)
            io.emit('get_messages', {
                groupId: groupId,
                messages: messages,
                firstUserId:firstUserId,
                firstUser: data.firstUser,
                notRead: notRead,
                connection: connection
            })
        }
        // else {
        //     await createGroupe(secondUserId, firstUserId)
        //     const groupId = await getGroupeId(firstUserId, secondUserId)
        //     await writeMessages("Hi", groupId, secondUserId, new Date())
        //     const messages = await getMessages(groupId)
        //     io.emit('get_messages', {
        //         messages: messages,
        //         secondUserId: secondUserId,
        //         secondUserName: data.secondUser,
        //         firstUserId: firstUserId,
        //         firstUserName: data.firstUser
        //     })
        // }
    })

    socket.on('send_message', async (data) => {
        const senderId = await getUserId(data.sender)
        const group = await getGroupe(data.groupId)
        let secondUserId
        if (group[0].firstuser === senderId) {
            secondUserId = group[0].seconduser
        } else {
            secondUserId = group[0].firstuser
        }
        const secondUserName = await getUserName(secondUserId)
        const connectSecondUser = connection.find(el => el.userName === secondUserName)
        await writeMessages(data.message, data.groupId, senderId, data.messageTime, connectSecondUser ? true : false)
        const messages = await getMessages(data.groupId)
        messages.sort((a, b) => a.id - b.id)
        io.emit('send_message', { messages: messages, sender: data.sender, connection: connection })
    })

    socket.on('send_userName', (data) => {
        const i = connection.findIndex(el => {
            return el.id === socket.id
        })
        connection[i].userName = data.userName
        io.emit('connect_new_user', connection)
    })

    socket.on('disconnect', async () => {
        const i = connection.findIndex(el => {
            return el.id === socket.id
        })
        connection.splice(i, 1)
        io.emit('disconnect_user', connection)
    })
});

server.listen(port, () => console.log(`Port${port}`))
