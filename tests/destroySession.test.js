const mongoose = require('mongoose')
const {destroySession} = require('../services/authServices')

class Session {
    constructor(userId){
        this.userId = userId
    }
}
class Request {

    constructor(userId) {
        this.session = new Session(userId)
    }

}

// mock request
const request = new Request('60438f9c0b84589e11a1cbc1')
/*
const request = {
    session: {
        userId: '60438f9c0b84589e11a1cbc1'
    }
}
*/



console.log('create request:', request)
test('destroySession: destroy session object from request when logout', () => {
    expect(destroySession(request).userId).toEqual(null)

})




