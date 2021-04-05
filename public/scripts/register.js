function loadForm(mockDoc, testInput) {
    let doc
    if (typeof document === 'undefined') {
        doc = mockDoc
    } else {
        doc = document
    }

    let divForm = doc.getElementById('register-div')
    // let form = document.getElementById('register-form')
    let usernameInput = doc.createElement('input')
    usernameInput.setAttribute('type', 'text')
    usernameInput.setAttribute('name', 'username')
    usernameInput.setAttribute('placeholder', 'Enter Username')
    // usernameInput.setAttribute('required', true)
    usernameInput.setAttribute('autocomplete', 'off')

    let emailInput = doc.createElement('input')
    emailInput.type = 'email'
    emailInput.name = 'email'
    emailInput.chromeoff = true
    emailInput.placeholder = 'Enter Email'
    emailInput.required = true
    emailInput.autocomplete = 'off'

    let passwordInput = doc.createElement('input')
    passwordInput.id = 'password'
    passwordInput.type = 'password'
    passwordInput.name = 'password'
    passwordInput.placeholder = 'Enter password'
    passwordInput.autocomplete = 'off'
    passwordInput.required = true

    let errorPassword = ''
    let validatePasswordInput = doc.createElement('input')
    validatePasswordInput.type = 'password'
    validatePasswordInput.name = 'validate_password'
    validatePasswordInput.addEventListener('input', function () {
        if (this.value !== doc.getElementById('password').value) {
            errorPassword = 'invalid'
            console.log('errorPassword', errorPassword)
            this.setCustomValidity('Password Must be Matching.')
        } else {
            // input is valid -- reset the error message
            errorPassword = 'valid'
            console.log('errorPassword', errorPassword)
            this.setCustomValidity('')
        }
    })
    validatePasswordInput.placeholder = 'Reenter password'

    if (testInput) {
        const {username, email, password, validatePassword} = testInput
        usernameInput.value = username
        emailInput.value = email
        passwordInput.value = password
        validatePasswordInput.value = validatePassword

    }

    divForm.appendChild(usernameInput)
    divForm.appendChild(emailInput)
    divForm.appendChild(passwordInput)
    divForm.appendChild(validatePasswordInput)


    return {
        username: usernameInput.value,
        email: emailInput.value,
        password: passwordInput.value,
        validatePassword: validatePasswordInput.value,
        errorPassword
    }
}

module.exports = loadForm
