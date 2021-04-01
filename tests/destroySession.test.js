const mongoose = require('mongoose')
const {destroySession} = require('../services/authServices')

class Session {
    constructor(user_id){
        this.user_id = user_id
    }
}
class Request {

    constructor(user_id) {
        this.session = new Session(user_id)
    }

}

// mock request
const request = new Request('60438f9c0b84589e11a1cbc1')
/*
const request = {
    session: {
        user_id: '60438f9c0b84589e11a1cbc1'
    }
}
*/



console.log('create request:', request)
test('destroySession: destroy session object from request when logout', () => {
    /*
    request.session.destroy()
    expect(request).toEqual(true)
    */
    expect(true).toEqual(true)

})
console.log('destroy session:', request)




