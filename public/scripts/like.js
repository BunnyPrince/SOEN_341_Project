function setVisibilityLike(img) {
    document.getElementById('like-button-' + img).style.display = 'none'
    document.getElementById('unlike-button-' + img).style.display = 'inline-block'
}

function editLike(img, type) {
    // iframe
    let iframe = document.createElement('iframe');
    iframe.setAttribute('name', 'like-iframe');
    iframe.style.display = 'none';
    document.body.appendChild(iframe);
    // form
    let form = document.createElement('form');
    form.setAttribute('method', 'post');
    form.setAttribute('action', '/' + type + '?_method=PUT');
    form.setAttribute('target', 'like-iframe');
    form.style.display = 'none'
    let input = document.createElement('input');
    input.setAttribute('name', 'image');
    input.setAttribute('value', img);
    input.style.display = 'none'
    form.style.display = 'none';
    form.appendChild(input);
    document.body.appendChild(form);
    if (type === 'like') {
        document.getElementById('like-button-' + img).style.display = 'none'
        document.getElementById('unlike-button-' + img).style.display = 'inline-block'
        try {
            updateLike(img, true)
        } catch (e) {
        } finally {
            form.submit()
        }
    } else {
        document.getElementById('unlike-button-' + img).style.display = 'none'
        document.getElementById('like-button-' + img).style.display = 'inline-block'
        try {
            updateLike(img, false)
        } catch (e) {
        } finally {
            form.submit()
        }
    }
}


function updateLike(img, inc) {
    if (inc) {
        showCurrentUserInList(img)
        let i = parseInt(document.getElementById('like-number-' + img).innerText)
        document.getElementById('like-number-' + img).innerText = (i + 1) + ''
    } else {
        hideCurrentUserInList(img)
        let i = parseInt(document.getElementById('like-number-' + img).innerText)
        document.getElementById('like-number-' + img).innerText = (i - 1) + ''
    }
}

function showCurrentUserInList(img) {
    console.log('img id:', img)
    let show = document.getElementById('current-user-in-' + img)
    console.log(show)
    show.style.display = 'block'
}

function hideCurrentUserInList(img) {
    console.log('img id:', img)
    let hide = document.getElementById('current-user-in-' + img)
    console.log(hide)
        hide.style.display = 'none'
}

