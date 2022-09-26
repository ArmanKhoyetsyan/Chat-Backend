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
    getUserName,
    editUserLastVisit,
    getGroupe,
    editReadVal,
    getLastMessage
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
    connection.push({ id: socket.id, secondGetMessage: false, getMessagesCount: 0 })

    socket.on('get_groupe', async (data) => {
        const userId = await getUserId(data.userName)
        const groupers = await getGroups(userId)
        for (let elem of groupers) {
            elem.firstuser = await getUserName(elem.firstuser)
            elem.seconduser = await getUserName(elem.seconduser)
            const messages = await getMessages(elem.id)
            const notReading = messages.filter(el => el.senderid !== userId && !el.read)
            const lastMessage = await getLastMessage(elem.id)
            const lastMessageSender = await getUserName(lastMessage[0].senderid)
            elem.notReading = notReading.length
            elem.lastMessage = {
                message: lastMessage[0].message, sender: lastMessageSender, read: lastMessage[0].read
            }
        }
        io.in(socket.id).emit('get_groupe', groupers)
    })

    socket.on('get_my_messages', async ({ groupId, firstUserId, firstUser, secondUser }) => {
        const user = connection.find(el => {
            return el.id === socket.id
        })
        if (groupId && user.secondGetMessage === groupId) {
            const messages = await getMessages(groupId)
            const message = messages.slice(0, user.getMessagesCount).sort((a, b) => a.id - b.id)
            await editReadVal(firstUserId, groupId)
            io.in(socket.id).emit('get_my_messages', {
                groupId: groupId,
                messages: message,
                firstUserId: firstUserId,
                firstUser: firstUser,
                secondUser: secondUser,
                connection: connection
            })
        }
    })

    socket.on('get_messages', async (data) => {
        const user = connection.find(el => {
            return el.id === socket.id
        })
        const date = new Date().toISOString()
        const secondUserId = await getUserId(data.secondUser)
        const firstUserId = await getUserId(data.firstUser)
        const secondUserConnectionId = connection.find(el => el.userName === data.secondUser)
        await editUserLastVisit(firstUserId, date)
        const groupId = await getGroupeId(firstUserId, secondUserId)
        user.secondGetMessage = groupId
        user.getMessagesCount = 20
        if (groupId) {
            const messages = await getMessages(groupId)
            const message = messages.slice(0, user.getMessagesCount).sort((a, b) => a.id - b.id)
            await editReadVal(firstUserId, groupId)
            io.in(socket.id).emit('get_messages', {
                groupId: groupId,
                messages: message,
                firstUserId: firstUserId,
                firstUser: data.firstUser,
                secondUser: data.secondUser,
                connection: connection,
            })
            io.in(secondUserConnectionId?.id).emit("update_message", {
                groupId: groupId,
                firstUserId: secondUserId,
                firstUser: data.secondUser,
                secondUser: data.firstUser,
            })
            io.in(secondUserConnectionId?.id).emit("update_groupe")
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

    socket.on("get_former_messages", async (data) => {
        const user = connection.find(el => el.id === socket.id)
        user.getMessagesCount += 20
        let messages = await getMessages(data.groupId)
        if (user.getMessagesCount < messages.length) {
            messages = messages.slice(0, user.getMessagesCount).sort((a, b) => a.id - b.id)
            io.in(socket.id).emit('get_former_messages', { messages: messages, allMessages: false })
        } else {
            messages.sort((a, b) => a.id - b.id)
            io.in(socket.id).emit('get_former_messages', { messages: messages, allMessages: true })
        }
    })

    // socket.on('get_last_messages', async (data) => {
    //     const firstUserId = await getUserId(data.firstUser)
    //     const secondUserId = await getUserId(data.secondUser)
    //     const groupId = await getGroupeId(firstUserId, secondUserId)
    //     socket.join(`room ${groupId}`)
    //     if (groupId) {
    //         const lastMessage = await getLastMessage(groupId)
    //         io.in(`room ${groupId}`).emit('last_messages', {
    //             lastMessage: lastMessage, senderI: lastMessage[0].senderid === firstUserId ? data.firstUser : data.secondUser
    //         })
    //     }
    // })

    socket.on('send_message', async (data) => {
        const user = connection.find(el => el.id === socket.id)
        const senderId = await getUserId(data.sender)
        socket.join(`room ${data.groupId}`)
        const group = await getGroupe(data.groupId)
        let secondUserId
        if (group?.[0]?.firstuser === senderId) {
            secondUserId = group?.[0]?.seconduser
        } else {
            secondUserId = group?.[0]?.firstuser
        }
        const secondUserName = await getUserName(secondUserId)
        const secondUserConnectionId = connection.find(el => el.userName === secondUserName)
        const connectSecondUser = connection.find(el => el.userName === secondUserName && el.secondGetMessage === data.groupId)
        await writeMessages(data.message, data.groupId, senderId, data.messageTime, connectSecondUser ? true : false)
        const messages = await getMessages(data.groupId)
        const message = messages.slice(0, user.getMessagesCount).sort((a, b) => a.id - b.id)

        connectSecondUser
            ? io.in(`room ${data.groupId}`).emit('send_message', { messages: message, sender: data.sender, connection: connection })
            : io.in(socket.id).emit('send_message', { messages: message, sender: data.sender, connection: connection })
        io.in(secondUserConnectionId?.id).emit('update_groupe')
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
