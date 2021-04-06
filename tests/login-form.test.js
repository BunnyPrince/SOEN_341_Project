const loadForm = require('../public/scripts/login')

const jsdom = require("jsdom")
const {JSDOM} = jsdom
jest.setTimeout(30000)

const dom = new JSDOM(
    `<!DOCTYPE html><body>
    <div id="login-div" class="input1"></div>
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
    username: 'Rihanna',
    password: 'grammy',
}

const fakeInvalidInput = {
    username: 'Rihanna',
    password: '5t4rS',
}

describe('Unit test register form',  () => {

    it('Testing invalid input', async() => {
        expect(loadForm(document, fakeValidInput)).toEqual(true)
    })


})
