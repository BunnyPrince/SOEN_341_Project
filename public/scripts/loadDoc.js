// Delete this script file

const loadDoc = (mockDoc) => {
    // loads mock document from jsdom or browser document
    if (typeof document === 'undefined') {
        return mockDoc
    } else {
        return document
    }
}
module.exports = loadDoc
