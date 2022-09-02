const { getUsers, getUser, getUserId, getGroupeId, getMessages } = require("../db.request")


const logIn = async (req, res) => {
  try {
    const users = await getUsers()
    const user = users.find(el => {
      return el.name === req.body.userName
    })
    if (user && user.password === req.body.password) {
      res.status(200).json(user)
    } else {
      res.status(401).json({ msg: 'Unauthorized' });
    }
  } catch (error) {
    console.log(error)
  }
}

const getMessagesDb = async (req, res) => {
  try {
    const secondUserId = await getUserId(req?.body?.secondUserName)
    const firstUserId = await getUserId(req?.body?.firstUserName)
    const groupId = await getGroupeId(firstUserId, secondUserId)
    if (groupId) {
      const messages = await getMessages(groupId)
      res.status(200).json({
        messages: messages,
        secondUserId: secondUserId,
        secondUserName: req?.body?.secondUserName,
        firstUserId: firstUserId,
        firstUserName: req?.body?.firstUserName
      })
    } else {
      await createGroupe(firstUserId, secondUserId)
      const groupId = await getGroupeId(firstUserId, secondUserId)
      await writeMessages("Hi", groupId, secondUserId)
      const messages = await getMessages(groupId)
      res.status(200).json({
        messages: messages,
        secondUserId: secondUserId,
        secondUserName: req?.body?.secondUserName,
        firstUserId: firstUserId,
        firstUserName: req?.body?.firstUserName
      })
    }
  } catch (error) {
    console.log(error)
  }
}



module.exports = { logIn, getMessagesDb }