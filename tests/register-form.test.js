const loadForm = require('../public/scripts/register')

const jsdom = require("jsdom")
const {JSDOM} = jsdom
jest.setTimeout(30000)

const dom = new JSDOM(
    `<!DOCTYPE html><body>
    <div id="register-div" class="spacing-input"></div>
    </body>
    <script type="text/javascript">
    window.addEventListener('load', loadForm)
    let event = new Event('input', {
    bubbles: true,
    cancelable: true,
    })
    element.dispatchEvent(event)
    </script>
`)

const {window} = dom
const {document} = window
/**
 * @jest-environment jsdom
 */

// Dummy inputs
const fakeValidInput = {
    username: 'galaxy240',
    password: '5t4rS',
    validatePassword: '5t4rS',
    email: 'galaxy240@hotmail.com'
}

const fakeInvalidInput = {
    username: 'galaxy240',
    password: '5t4rS',
    validatePassword: 'stars',
    email: 'galaxy240@hotmail.com'
}

describe('Unit test register form',  () => {

    it('Testing invalid input', async() => {
        expect(loadForm(document, fakeInvalidInput)).toEqual(true)
    })


})

