const logoutButton = require('../public/scripts/header')

const jsdom = require("jsdom")
const {JSDOM} = jsdom
jest.setTimeout(30000)

const dom = new JSDOM(
    `<!DOCTYPE html><body>
    <a type="button" 
    onclick="logoutButton()">Log Out
    </a>
    </body>
`)

const {window} = dom
const {document} = window
/**
 * @jest-environment jsdom
 */

test('header Test', (done) => {
    expect(logoutButton(document)).toEqual(
        {
            "action": "/logout",
            "id": "logout",
            "method": "post"
        }
    )
    done()
})
