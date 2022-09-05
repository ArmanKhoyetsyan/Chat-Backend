const { getUsers } = require("../db.request")

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

module.exports = logIn
