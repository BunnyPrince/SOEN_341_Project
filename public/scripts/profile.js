const loadDoc = (mockDoc) => {
    // loads mock document from jsdom or browser document
    if (typeof document === 'undefined') {
        return mockDoc
    } else {
        return document
    }
}

function editFollow(userid, type, username, mockDoc){
        const doc = loadDoc(mockDoc)
        // console.log('clicked ' + type)
        let form = doc.createElement('form')
        form.setAttribute('id', 'editForm')
        form.setAttribute('method', 'post')
        form.setAttribute('action', '/' + type + '?_method=PUT')
        let currentUserInput = doc.createElement('input')
        currentUserInput.setAttribute('name', 'userid')
        currentUserInput.setAttribute('value', userid)
        let otherUserInput = doc.createElement('input')
        otherUserInput.setAttribute('name', 'username')
        otherUserInput.setAttribute('value', username)
        form.style.display = 'hidden'
        form.appendChild(currentUserInput)
        form.appendChild(otherUserInput)
        doc.body.appendChild(form)
        if (typeof mockDoc === 'undefined')
        form.submit()
        return {
            id: form.getAttribute('id'),
            method: form.getAttribute('method'),
            action: form.getAttribute('action'),
            currentUser: currentUserInput.getAttribute('name'),
            otherUser: otherUserInput.getAttribute('name'),
            currentUserId: currentUserInput.getAttribute('value'),
            otherUserName: otherUserInput.getAttribute('name')
        }
    }

    function showList(userid, isBeingFollowed, duplicateUser, type, username, mockDoc) {
        const doc = loadDoc(mockDoc)
        // console.log('clicked ' + type)
        let form = doc.createElement('form')
        form.setAttribute('id', 'showList')
        form.setAttribute('method', 'post')
        form.setAttribute('action', '/' + username + '/' + type)
        let currentUserIDinput = doc.createElement('input')
        currentUserIDinput.setAttribute('name', 'userid')
        currentUserIDinput.setAttribute('value', userid)
        let inputFollowed = doc.createElement('input')
        inputFollowed.setAttribute('name', 'isBeingFollowed')
        inputFollowed.setAttribute('value', isBeingFollowed)
        let inputDuplicate = doc.createElement('input')
        inputDuplicate.setAttribute('name', 'duplicateUser')
        inputDuplicate.setAttribute('value', duplicateUser)
        form.appendChild(currentUserIDinput)
        form.appendChild(inputFollowed)
        form.appendChild(inputDuplicate)
        form.style.display = 'hidden'
        doc.body.appendChild(form)
        if (typeof mockDoc === 'undefined')
        form.submit()
        return {
            id: form.getAttribute('id'),
            method: form.getAttribute('method'),
            action: form.getAttribute('action'),
            currentUser: currentUserIDinput.getAttribute('name'),
            currentUserId: currentUserIDinput.getAttribute('value'),
            followedName: inputFollowed.getAttribute('name'),
            followedValue: inputFollowed.getAttribute('value'),
            duplicateName: inputDuplicate.getAttribute('name'),
            duplicateValue: inputDuplicate.getAttribute('value')
        }
    }

    module.exports = {editFollow, showList}
