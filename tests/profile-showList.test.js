const {showList} = require('../public/scripts/profile.js');

const jsdom = require("jsdom")
const {JSDOM} = jsdom
jest.setTimeout(30000)

const dom = new JSDOM(
    `<!DOCTYPE html><body>
    <button class="button" type="button"
         onclick="showList('60438f9c0b84589e11a1cbf2', true , false, 'followers', 'eyeshield2110')">followers
    </button>
    
    </body>
`)

const {window} = dom
const {document} = window


test('Profile Test', (done) => {

      expect(showList('60438f9c0b84589e11a1cbf2',true , false, 'followers', 'eyeshield2110',document)).toEqual(
          {
              "action": "/eyeshield2110/followers",
              "currentUser": "userid",
              "currentUserId": "60438f9c0b84589e11a1cbf2",
              "duplicateName": "duplicateUser",
              "duplicateValue": "false",
              "followedName": "isBeingFollowed",
              "followedValue": "true",
              "id": "showList",
              "method": "post"
          }
      )
    done()
})
