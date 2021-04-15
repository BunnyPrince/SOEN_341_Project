function setVisibilityLike(img) {
    document.getElementById(`like-button-${img}`).style.display = 'none'
    document.getElementById(`unlike-button-${img}`).style.display = 'inline-block'
}

function editLike(img, type, mockDoc) {
    // load virtual document
    let doc
    if (typeof document === 'undefined') {
        doc = mockDoc
    } else {
        doc = document
    }
    // iframe
    let iframe = doc.createElement('iframe')
    iframe.setAttribute('name', 'like-iframe')
    iframe.style.display = 'none'
    doc.body.appendChild(iframe)
    // form
    let form = doc.createElement('form')
    form.setAttribute('method', 'post')
    form.setAttribute('action', '/' + type + '?_method=PUT')
    form.setAttribute('target', 'like-iframe')
    form.style.display = 'none'
    let input = doc.createElement('input')
    input.setAttribute('name', 'image')
    input.setAttribute('value', img)
    input.style.display = 'none'
    form.style.display = 'none'
    form.appendChild(input)
    doc.body.appendChild(form)
    if (type === 'like') {
        doc.getElementById('like-button-' + img).style.display = 'none'
        doc.getElementById('unlike-button-' + img).style.display = 'inline-block'
        /*
        try {
            updateLike(img, true)
        } catch (e) {
        } finally {
            form.submit()
        }
        */
        updateLike(img, true, mockDoc)
        //form.submit()
    } else {
        doc.getElementById('unlike-button-' + img).style.display = 'none'
        doc.getElementById('like-button-' + img).style.display = 'inline-block'
        /*
        try {
            updateLike(img, false)
        } catch (e) {
        } finally {
            form.submit()
        }
        */
        updateLike(img, false, mockDoc)
        //form.submit()
    }
    if (typeof mockDoc === 'undefined')
        form.submit()
    return {
        formAction: form.getAttribute('action'),
        inputValue: input.getAttribute('value')
    }
}


function updateLike(img, inc, mockDoc) {
    let doc
    if (typeof document === 'undefined') {
        doc = mockDoc
    } else {
        doc = document
    }
    if (inc) {
        let show = doc.getElementById(`current-user-in-${img}`)
        show.style.display = 'block'
        // showCurrentUserInList(img)
        let i = parseInt(doc.getElementById(`like-number-${img}`).innerText)
        doc.getElementById(`like-number-${img}`).innerText = (i + 1) + ''
    } else {
        let hide = doc.getElementById(`current-user-in-${img}`)
        hide.style.display = 'none'
        // hideCurrentUserInList(img)
        let i = parseInt(doc.getElementById(`like-number-${img}`).innerText)
        doc.getElementById(`like-number-${img}`).innerText = (i - 1) + ''
    }
}

function showCurrentUserInList(img) {
    //console.log('img id:', img)
    let show = document.getElementById(`current-user-in-${img}`)
    // console.log(show)
    show.style.display = 'block'
}

function hideCurrentUserInList(img) {
    //console.log('img id:', img)
    let hide = document.getElementById(`current-user-in-${img}`)
    //console.log(hide)
    hide.style.display = 'none'
}

module.exports = editLike
