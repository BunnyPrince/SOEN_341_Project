function check(input) {
    if (input.value !== document.getElementById('password').value) {
        input.setCustomValidity('Password Must be Matching.')
    } else {
        // input is valid -- reset the error message
        input.setCustomValidity('')
    }
}


function loadForm() {
    let divForm = document.getElementById('form-div')
    let form = document.createElement('form')
    let usernameInput = document.createElement('input')
    usernameInput.setAttribute('type', 'text')
    usernameInput.setAttribute('name', 'username')
    usernameInput.setAttribute('placeholder', 'Enter Username')
    // usernameInput.setAttribute('required', true)
    usernameInput.setAttribute('autocomplete', 'off')

    let emailInput = document.createElement('input')
    emailInput.type = 'email'
    emailInput.name = 'email'
    emailInput.chromeoff = true
    emailInput.placeholder = 'Enter Email'
    emailInput.required = true
    emailInput.autocomplete = 'off'

    let passwordInput = document.createElement('input')
    passwordInput.id = 'password'
    passwordInput.type = 'password'
    passwordInput.name = 'password'
    passwordInput.placeholder = 'Enter password'
    passwordInput.autocomplete = 'off'
    passwordInput.required = true

    let validatePasswordInput = document.createElement('input')
    validatePasswordInput.type = 'password'
    validatePasswordInput.name = 'validate_password'
    validatePasswordInput.addEventListener('input', check)

    form.appendChild(usernameInput)
    form.appendChild(emailInput)
    form.appendChild(passwordInput)
    form.appendChild(validatePasswordInput)

    divForm.appendChild(form)

}

/*

<input type="text" name="username" placeholder="Enter Username" required autoComplete="off">
    <input type="email" name="email" placeholder="Enter Email" required autoComplete="off chrome-off">
        <input id="password" type="password" name="password" placeholder="Enter password" required autoComplete="off">
            <input type="password" name="validate_password" onInput="check(this)" placeholder="Reenter password"
                   required autoComplete="off">
*/
