const imgRouter = require('../../routes/imgRouter')
const express = require('express')
const app = express()
const request = require('supertest')

jest.setTimeout(30000);

app.use('/images', imgRouter)

test("image router: explore,", (doneCallback) => {
    request(app)
        .get("/images")
        .expect(500, doneCallback)
})
