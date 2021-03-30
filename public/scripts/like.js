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
    } else {
        document.getElementById('unlike-button-' + img).style.display = 'none'
        document.getElementById('like-button-' + img).style.display = 'inline-block'
    }
    form.submit();
}

function setVisibilityLike(img) {
    document.getElementById('like-button-' + img).style.display = 'none'
    document.getElementById('unlike-button-' + img).style.display = 'inline-block'
}
