function loadForm(mockDoc, testInput) {
    let doc
    if (typeof document === 'undefined') {
        doc = mockDoc
    } else {
        doc = document
    }

     let divForm = doc.getElementById('login-div')

    let usernameInput = doc.createElement('input')
    usernameInput.setAttribute('type', 'text')
    usernameInput.setAttribute('name', 'username')
    usernameInput.setAttribute('placeholder', 'Enter Username')
    usernameInput.setAttribute('required', true)

    let passwordInput = doc.createElement('input')
    passwordInput.id = 'password'
    passwordInput.type = 'password'
    passwordInput.name = 'password'
    passwordInput.placeholder = 'Enter password'
    passwordInput.autocomplete = 'off'
    passwordInput.required = true

    if (testInput) {
        const {username, password} = testInput
        usernameInput.value = username
        passwordInput.value = password

    }


    divForm.appendChild(usernameInput)
    divForm.appendChild(passwordInput)

    return {
        username: usernameInput.value,
        password: passwordInput.value
    }

}

module.exports = loadForm
