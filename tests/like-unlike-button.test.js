const editLike = require('../public/scripts/like')

const jsdom = require("jsdom")
const {JSDOM} = jsdom
jest.setTimeout(30000)
const image_id = 123456
const dom = new JSDOM(
    `<!DOCTYPE html><body>
            <button title="like" class="btn btn-lg like-button" type="button" id="like-button-${image_id}" onclick="editLike('${image_id}', 'like')">
                Like
            </button>
            <button title="unlike" class="btn btn-lg unlike-button" type="button" id="unlike-button-${image_id}" onclick="editLike('${image_id}', 'unlike')" style="display: none">
                Unlike                       
            </button>
            <p id="current-user-in-${image_id}" style="display: none">Show/Hide list</p>
            <button class="feed-btn btn btn-light" type="button" id="like-number-${image_id}">Number of Likes</button>
    </body>
`)
const expectedForm = {
    "formAction": "/like?_method=PUT",
    "inputValue": `${image_id}`
}

const {window} = dom
const {document} = window
/**
 * @jest-environment jsdom
 */

test('like-unlike button test', (done) => {
    expect(editLike(image_id, 'like', document)).toEqual(expectedForm)
    done()
})
