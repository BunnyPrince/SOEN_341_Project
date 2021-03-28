const jsdom = require("jsdom")
const { JSDOM } = jsdom
jest.setTimeout(30000);

const dom = new JSDOM (
    `<!DOCTYPE html><body>
    <p id="username" />John</p>
    </body>
`)

const { window } = dom
const { document } = window


function demo() {
    let paragraphEl = document.getElementById('username')
    return 'Welcome ' + paragraphEl.innerHTML
}


// This prints "My First JSDOM!"
// console.log(dom.window.document.getElementById('username'));

test("preview image", (done) => {
    const fn = demo()
    expect(fn).toBe('Welcome John')
    done()

})
