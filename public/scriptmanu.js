

function imagefun(event){
    console.log("event triggerd")
    console.log(event.target.files)
    
    const files = event.target.files[0];
  

  var im= document.getElementById('imageinaddproduct')
    im.src=URL.createObjectURL(files);
}

function secimage(event){
    const file2=event.target.files[0]
    var im2=document.getElementById('sideimages1')
    im2.src=URL.createObjectURL(file2)

}
function thirdimage(event){
    const file3=event.target.files[0]
    var im3=document.getElementById('sideimages2')
    im3.src=URL.createObjectURL(file3)

}



function showCustomModal(productName) {
  customMessageText.textContent = `Are you sure to delete ${productName} ?`
  customMessageModal.style.display = "flex";

}

function hideCustomModal() {
  customMessageModal.style.display = "none";
}

