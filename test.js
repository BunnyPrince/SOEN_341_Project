const bcrypt = require('bcrypt')
const password = 'bigbrain'
const hash = bcrypt.hash(password, 12).then( (x) =>
    console.log(x)
)

