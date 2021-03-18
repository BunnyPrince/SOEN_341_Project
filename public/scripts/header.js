var document;

function proceed() {
        var form = document.createElement('form');
        form.setAttribute('method', 'post');
        form.setAttribute('action', '/logout');
        form.style.display = 'hidden';
        document.body.appendChild(form)
        form.submit()
        return true;
    }



    module.exports = proceed;

