function editFollow(userid, type, username) {
        console.log('clicked ' + type);
        let form = document.createElement('form');
        form.setAttribute('method', 'post');
        form.setAttribute('action', '/' + type + '?_method=PUT');
        let input = document.createElement('input');
        input.setAttribute('name', 'userid');
        input.setAttribute('value', userid);
        let input2 = document.createElement('input')
        input2.setAttribute('name', 'username')
        input2.setAttribute('value', username)
        form.style.display = 'hidden';
        form.appendChild(input);
        form.appendChild(input2)
        document.body.appendChild(form);
        form.submit();
        return true;
    }

    function showList(userid, isBeingFollowed, duplicateUser, type, username) {
        console.log('clicked ' + type);
        let form = document.createElement('form');
        form.setAttribute('method', 'post');
        form.setAttribute('action', '/' + username + '/' + type);
        let inputUserID = document.createElement('input');
        inputUserID.setAttribute('name', 'userid');
        inputUserID.setAttribute('value', userid);
        let inputFollowed = document.createElement('input');
        inputFollowed.setAttribute('name', 'isBeingFollowed');
        inputFollowed.setAttribute('value', isBeingFollowed);
        let inputDuplicate = document.createElement('input');
        inputDuplicate.setAttribute('name', 'duplicateUser');
        inputDuplicate.setAttribute('value', duplicateUser);
        form.appendChild(inputUserID);
        form.appendChild(inputFollowed);
        form.appendChild(inputDuplicate);
        form.style.display = 'hidden';
        document.body.appendChild(form);
        form.submit();
        return true;
    }
