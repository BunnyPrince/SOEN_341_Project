function showPreviewOne(event){
      if(event.target.files.length > 0) {
        let src = URL.createObjectURL(event.target.files[0])
        let preview = document.getElementById('file')
        preview.src = src
        preview.style.display = 'block'
        preview.style.height = '200px'
      }
    }
    function myImgRemoveFunctionOne() {
      document.getElementById('file').src = 'https://i.ibb.co/ZVFsg37/default.png'
    }
