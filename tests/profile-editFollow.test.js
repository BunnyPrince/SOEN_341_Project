const {editFollow} = require('../public/scripts/profile.js');

const jsdom = require('jsdom')
const {JSDOM} = jsdom
jest.setTimeout(30000)

const dom = new JSDOM(
    `<!DOCTYPE html><body>
    <button class='button' type='button' style='display: none'
        onclick="editFollow('60438f9c0b84589e11a1cbf2', 'follow', ' eyeshield2110')"> Follow
    </button>
    
    </body>
`)

const {window} = dom
const {document} = window


test('Profile Test', (done) => {

      expect(editFollow('60438f9c0b84589e11a1cbf2', 'follow', ' eyeshield2110', document)).toEqual(
          {
              'action': '/follow?_method=PUT',
              'currentUser': 'userid',
              'currentUserId': '60438f9c0b84589e11a1cbf2',
              'id': 'editForm',
              'method': 'post',
              'otherUser': 'username',
              'otherUserName': 'username'
          }
      )
    done()
})
