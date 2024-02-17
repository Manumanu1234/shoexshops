
$(document).ready(function () {

  function callajax() {
      $.ajax({
          url: "/initialcalling",
          method: 'get',
          success: (response) => {
              for (i of response) {
                  $('#' + i.item).css('color', 'red');
                  console.log(i)
              }
          }


      })
  }
  window.callajax = callajax;
  callajax()
})


 function fileter(){
    $.ajax({
        url:"/productfindforfilter",
        method:"get",
        success:(response)=>{
        
            console.log(response)
            displayproduct(response)
            filter2(response)
            catogory(response)
            size(response)
            search(response)
            sorting(response)
            sortingprice(response)
        }
    })
}
function displayproduct(response){
    if(response.length>0){
          const productDetailsHTML=response.map((product)=>{
            if(product.offer=="offeradded"){
              return `
        
              <div class="col-sm-6 col-lg-4 mb-4 cartcollecion" data-aos="fade-up">
                      <div class="block-4 text-center border " style="height: 400px;" >
                        <figure class="block-4-image">
                          <img id="imagestyle"  style="height: 150px;" onmouseover="funchangeimage(event,'${product.images[1]}','${product.images[2]}')" onmouseout="resetImage(event,'${product.images[0]}')" src="/public/uploads/${product.images[0]}" alt="Image placeholder" class="img-fluid  productimagess">
                        </figure>
                        <div class="block-4-text p-4">
                        
                          <p class="mb-0">${product.name}</p>
                          <p class="text-primary font-weight-bold">${product.price}</p>
                          <p style="color: green;">Offer Added</p>
                          <div class="text-center"   style=" font-size: 20px; color:#7971ea">
                           <a href="/shop-single/${product._id}"><span  style="padding: 15px;"  class="icon icon-eye text-start manu">  </span></a> 
                           <span onclick="basketclicked('${product._id}'),success(),addsum()" style="padding: 15px;"   class="icon icon-shopping-basket manu" ></span>
                          <span id="${product._id}" style="padding: 15px;" onclick="favclick('${product._id}')"  class="icon icon-heart manu hertmanu"></span>
                          </div>
                          
                        </div>
                      </div>
                    </div>
              `
            }else{
              return `
        
              <div class="col-sm-6 col-lg-4 mb-4 cartcollecion" data-aos="fade-up">
                      <div class="block-4 text-center border " style="height: 400px;" >
                        <figure class="block-4-image">
                          <img id="imagestyle"  style="height: 150px;" onmouseover="funchangeimage(event,'${product.images[1]}','${product.images[2]}')" onmouseout="resetImage(event,'${product.images[0]}')" src="/public/uploads/${product.images[0]}" alt="Image placeholder" class="img-fluid  productimagess">
                        </figure>
                        <div class="block-4-text p-4">
                        
                          <p class="mb-0">${product.name}</p>
                          <p class="text-primary font-weight-bold">${product.price}</p>
                          <div class="text-center"   style=" font-size: 20px; color:#7971ea">
                           <a href="/shop-single/${product._id}"><span  style="padding: 15px;"  class="icon icon-eye text-start manu">  </span></a> 
                           <span onclick="basketclicked('${product._id}'),success(),addsum()" style="padding: 15px;"   class="icon icon-shopping-basket manu" ></span>
                          <span id="${product._id}" style="padding: 15px;" onclick="favclick('${product._id}')"  class="icon icon-heart manu hertmanu"></span>
                          </div>
                          
                        </div>
                      </div>
                    </div>
              `
            }
      
    }).join("")
    document.getElementById("manux").innerHTML = productDetailsHTML;
    }else{
    
        document.getElementById("manux").innerHTML=`<h3>No Products Available </h3>`

    }
  
}

 fileter()


function filter2(totalproduct){
    const priceranger = document.querySelector("#slide-ranger");
    const priceval = document.querySelector(".priceval");
  
    // Assuming totalproduct is an array of products and each product has a 'price' property
    const prices = totalproduct.map((product) => product.price);
  
    const minrange = Math.min(...prices);
    const maxrange = Math.max(...prices);
  
    // Update the price value
    priceval.textContent = "Rs " + minrange;
  
    // Set the min and max values for the slider
    priceranger.min = minrange;
    priceranger.max = maxrange;
  
    // Update the input value on slider input change
    priceranger.addEventListener("input", (event) => {
        priceval.textContent = "Rs " + event.target.value;
            const filteredProducts = totalproduct.filter((product) => product.price <= event.target.value);
        displayproduct(filteredProducts);
        callajax();
      
      });
      
}

function catogory(response){
    const allcatogory=response.map((product)=>product.catogory)
    console.log(allcatogory)
 const catogorycoll=[
    "All",
      ...allcatogory.filter((product,index)=>{
        return allcatogory.indexOf(product)===index;

      })
 ]

 const categoryLengths = catogorycoll.map(product => {
    let length = 0;
    if (product === 'All') {
        length = allcatogory.length;
        return {
            product:"All",
            length:length
        }
     
    } else {
      length = allcatogory.filter(item=>item==product).length;
      return {
        product: product,
        length: length
      };
    }
   
  });
  console.log(categoryLengths)

 let productdetal=categoryLengths.map((product)=>{
    
   return `<li  class="mb-1"><h5 class="d-flex"><span>${product.product}</span> <span  style="color: #7971ea; "  class="text-black ml-auto">(${product.length})</span></h5></li>`
  }).join("")

  let productdetal2=categoryLengths.map((product)=>{
    return `<li class="dropdown-item">${product.product}</li>`
   }).join("")

  console.log(productdetal)

  document.getElementById("catogory").innerHTML=productdetal
  document.getElementById("manux2").innerHTML=productdetal2

  let ullist=  document.getElementById("catogory");
  ullist.addEventListener("click",(event)=>{
    const checkboxes = document.querySelectorAll('.eventadding');
    checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
    });
    event.preventDefault()
    let values=event.target.textContent;
    console.log(values)
    if(values==="All"){
        displayproduct(response)
        filter2(response)
        size(response)
    }else{
          var ullistproduct=response.filter((product)=>product.catogory==values)
          displayproduct(ullistproduct)
          filter2(ullistproduct)
          size(ullistproduct)
        }
        callajax();
    
  })





  let ullist2=  document.getElementById("manux2");
  ullist2.addEventListener("click",(event)=>{
    const checkboxes = document.querySelectorAll('.eventadding');
    checkboxes.forEach((checkbox) => {
            checkbox.checked = false;
    });
    event.preventDefault()
    let values=event.target.textContent;
    console.log(values)
    if(values==="All"){
        var ullistproduct=response.filter((product)=>product)
    }else{
          var ullistproduct=response.filter((product)=>product.catogory==values)
    }
    displayproduct(ullistproduct)
    filter2(ullistproduct)
  
     callajax();

  })
  
}



function size(response){
    let size=document.getElementById("size123")

    let totalsize=response.map((product)=>{
      return  product.size       
    })
  
   
    let sizecatogory=[
        "All",
        ...totalsize.filter((product,index)=>{
         return   totalsize.indexOf(product)===index;
        })
    ]
    
    let mustproduct=sizecatogory.map((product)=>{
        let length=0;
        if(product === "All"){
          length=totalsize.length
           return{
            product:"All",
            length:length
           } 
        }else{
              let length=totalsize.filter((item)=>item===product).length
       return{
        product:product,
        length:length
       }   
        }
   
      
    })

    console.log(mustproduct)

  let  totalmust= mustproduct.map((product)=>{
           return`
    <label  for="s_sm" class="d-flex">
    <input class="eventadding" type="checkbox" id="${product.product}" class="mr-2 mt-1"> <span  class="text-black">${product.product}  (${product.length})</span>
  </label>`
    }).join("")
    size.innerHTML=totalmust

   size.addEventListener("change",(event)=>{
    
        let values=event.target.id;
        let totalsize=response.filter((product)=>{
           return product.size==values;
        })
        
    const checkboxes = document.querySelectorAll('.eventadding');
        checkboxes.forEach((checkbox) => {
            // Uncheck all checkboxes except the current one
            if (checkbox.id !== event.target.id) {
                checkbox.checked = false;
            }
        });

        console.log(totalsize)
        console.log(event.target.checked)
        if(event.target.checked==true && event.target.id=="All"){
            displayproduct(response)
            filter2(response)

        }else{
             if(event.target.checked==true){
            displayproduct(totalsize)
            filter2(totalsize)
        }else{
            displayproduct(response)
            filter2(response)
        }
        }
        callajax();
    })
    
}



function search(response){
    let searchelem=document.getElementById("textsearch");

    searchelem.addEventListener("keyup",(event)=>{
      const checkboxes = document.querySelectorAll('.eventadding');
      checkboxes.forEach((checkbox) => {
              checkbox.checked = false;
      });
        const values=event.target.value.toLowerCase().trim()
        if(values){
            displayproduct(response.filter((product)=>product.name.toLowerCase().indexOf(values) !==-1))
        }else{
            displayproduct(response)

        }
        callajax();
    })
    
}


function sorting(response){
  const checkboxes = document.querySelectorAll('.eventadding');
  checkboxes.forEach((checkbox) => {
          checkbox.checked = false;
  });

 let atozid=document.getElementById("atoz");
 atozid.addEventListener("click",(event)=>{
  const checkboxes = document.querySelectorAll('.eventadding');
  checkboxes.forEach((checkbox) => {
          checkbox.checked = false;
  });
    let sortedarr=  response.sort((a, b) => a.name.localeCompare(b.name));
    displayproduct(sortedarr)
    callajax();
 })
 let manu2=document.getElementById("sortedtotback")
 manu2.addEventListener("click",(event)=>{
  const checkboxes = document.querySelectorAll('.eventadding');
  checkboxes.forEach((checkbox) => {
          checkbox.checked = false;
  });
    let sortedarr=  response.sort((a, b) => b.name.localeCompare(a.name));
    displayproduct(sortedarr)
    callajax();
 })
}

function sortingprice(response){
 let PlowH=document.getElementById("pricelowtohigh");
 let HlowP=document.getElementById("pricehightolow");
 PlowH.addEventListener("click",(event)=>{
  const checkboxes = document.querySelectorAll('.eventadding');
  checkboxes.forEach((checkbox) => {
          checkbox.checked = false;
  });
    let sortedarr=  response.sort((a, b) => a.price-b.price);
    displayproduct(sortedarr)
    callajax();
 })
 HlowP.addEventListener("click",(event)=>{
  const checkboxes = document.querySelectorAll('.eventadding');
  checkboxes.forEach((checkbox) => {
          checkbox.checked = false;
  });
    let revsortedarr=response.sort((a,b)=>b.price-a.price)
    displayproduct(revsortedarr)
    callajax();
 })

}





function filter3(parameter){
  const priceranger = document.querySelector("#slide-ranger");
  const priceval = document.querySelector(".priceval");

  // Assuming totalproduct is an array of products and each product has a 'price' property
  const prices = totalproduct.map((product) => product.price);

  const minrange = Math.min(...prices);
  const maxrange = Math.max(...prices);

  // Update the price value
  priceval.textContent = "Rs " + minrange;

  // Set the min and max values for the slider
  priceranger.min = minrange;
  priceranger.max = maxrange;

  // Update the input value on slider input change
  priceranger.addEventListener("input", (event) => {
      priceval.textContent = "Rs " + event.target.value;
          const filteredProducts = totalproduct.filter((product) => product.price <= event.target.value);
      displayproduct(filteredProducts);
      callajax();
    });
}