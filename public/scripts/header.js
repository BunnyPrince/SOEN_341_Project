const loadDoc = (mockDoc) => {
    // loads mock document from jsdom or browser document
    if (typeof document === 'undefined') {
        return mockDoc
    } else {
        return document
    }
}

const proceed = (mockDoc) => {
    const doc = loadDoc(mockDoc)
    let form = doc.createElement('form')
    form.setAttribute('id', 'logout')
    form.setAttribute('method', 'post')
    form.setAttribute('action', '/logout')
    form.style.display = 'hidden'
    doc.body.appendChild(form)
    // handle console.error from unit testing (jsdom does not implement submit)
    if (typeof mockDoc === 'undefined')
        form.submit()
    return {
        id: form.getAttribute('id'),
        method: form.getAttribute('method'),
        action: form.getAttribute('action')
    }
}


module.exports = proceed

