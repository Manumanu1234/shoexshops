

function deleteproduct(proId, event) {
    event.preventDefault();
    console.log(proId)

    const customMessageModal = $("#customMessageModal");
    const okButton = $("#okButton");
    const cancelButton = $("#cancelButton");
    cancelButton.on('click', () => {
        customMessageModal.css('display', 'none')
    })

    customMessageModal.css('display', 'flex')
    okButton.on('click', () => {
        $.ajax({
            url: "/admin/deletebutton/" + proId,
            method: 'get',
            success: function (response) {
                if (response.status) {
                    console.log('completed');
                    customMessageModal.css('display', 'none')
                    $('#cart-item-' + proId).remove();

                }
            },
            error: function (xhr, status, error) {
                console.error("AJAX request failed:", status, error);
            }
        });

    });


}


function removebanner(id) {
    alert("click")
    $.ajax({
        url: '/admin/removebanner/' + id,
        method: 'get',
        success: (response) => {
            document.getElementById(id).remove()
        }
    })

}

function removebanneroffers(id) {
    $.ajax({
        url: '/admin/removebanneroffers/' + id,
        method: 'get',
        success: (response) => {
            document.getElementById(id).remove()
        }
    })
}

$(document).ready(function () {



    $(document).on('click', '.hertmanu', function () {
        let currentColor = $(this).css('color');
        if (currentColor === 'rgb(95, 0, 197)') {
            $(this).css('color', 'red');
            let clickedId = $(this).attr('id');
            $.ajax({
                url: '/uploadfav/' + clickedId,
                method: 'get',
                success: (response) => {
                    console.log("complete");
                }
            });
        } else {
            $(this).css('color', '');
            let dltfav = $(this).attr('id');
            $.ajax({
                url: '/deletefav/' + dltfav,
                method: 'get',
                success: (response) => {
                    alert("completed");
                    console.log("complete");
                }
            });
        }
    });
});

function favbutton(id) {

    $.ajax({
        url: '/favdletfromfavcart/' + id,
        method: 'get',
        success: (response) => {
            $('#cart-item-' + id).remove();
        }
    })
}


function basketclicked(prodid) {
    var total = document.getElementById("cartitemid").innerHTML;

    $.ajax({

        url: "/cartaddproduct/" + prodid,
        method: 'get',
        success: (response) => {

        }

    })

}


function addsum() {

    $.ajax({
        url: '/currqunitityofcart',
        method: 'get',
        success: (response) => {
            var currpro = $("#cartitemid").text()
            currpro = parseInt(currpro) + 1;

            $("#cartitemid").text(currpro)
        }
    })
}


function buttonincrement(id, count, price, quntity) {
    $.ajax({
        url: '/incrementbtn',
        data: {
            itemid: id,
            count: count,
            price: price,
            quntity: quntity
        },
        method: 'post',
        success: (response) => {
            console.log(response)
            response = parseInt(response)
            if (response == 0 || response < 0) {
                console.log("totalzero")
                document.getElementById('cartitemss-' + id).innerHTML = 0;
                document.getElementById("cartdelete-" + id).remove()
                let totlcart = document.getElementById("cartitemid").innerHTML;
                totlcart = parseInt(totlcart);

                document.getElementById("cartitemid").innerHTML = totlcart - 1;
                $.ajax({
                    url: "/deletetheproduct/" + id,
                    method: "get",
                    success: (response) => {
                        alert("complte")
                    }
                })
            } else {
                let totlcart = document.getElementById("cartitemid").innerHTML;
                totlcart = parseInt(totlcart);
                document.getElementById("cartitemid").innerHTML = totlcart + count;
                document.getElementById('cartitemss-' + id).innerHTML = response

                let con = document.getElementById(id).innerHTML;
                con = parseInt(con)
                document.getElementById(id).innerHTML = con + 1

            }


        }
    })
}

function favclick(id) {
    let cuurval = parseInt(document.getElementById("cartfavid").innerHTML);

    // Use event delegation for dynamically added elements
    $(document).on('click', '.hertmanu', function () {
        let currentColor = $(this).css('color');
        if (currentColor === 'rgb(95, 0, 197)') {
            document.getElementById("cartfavid").innerHTML = cuurval - 1;
        } else {
            document.getElementById("cartfavid").innerHTML = cuurval + 1;
        }
    });
}

function removex(event, itemid, name) {
    event.preventDefault()
    const customMessageModal = $("#customMessageModal");
    const okButton = $("#okButton");
    const cancelButton = $("#cancelButton");
    const customtext = $("#customMessageText");

    cancelButton.on('click', () => {
        customMessageModal.css('display', 'none')
    });

    customMessageModal.css('display', 'flex')
    customtext.text("are you sure to remove " + name + "?")
    okButton.on('click', () => {
        $.ajax({
            url: "/removecart/" + itemid,
            method: "get",
            success: (response) => {
                let con = document.getElementById(itemid).innerHTML;
                con = parseInt(con)
                $("#cartdelete-" + itemid).remove()
                let totlcart = document.getElementById("cartitemid").innerHTML;
                totlcart = parseInt(totlcart);
                document.getElementById("cartitemid").innerHTML = totlcart - con;
                customMessageModal.css('display', 'none')
            }
        })
    })


}

function featured(event, id, callback) {
    event.preventDefault()

    $.ajax({
        url: "/admin/featured/" + id,
        method: "get",
        success: (response) => {
            callback()

        }

    })
}


function removebookmark(id) {
    $.ajax({
        url: "/admin/removebookmark/" + id,
        method: "get",
        success: (response) => {
            alert("item removed")
            location.href = "/admin"

        }
    })
}

function updatecart() {
    $.ajax({
        url: "/updatecart",
        method: "get",
        success: (response) => {
            response = parseFloat(response)
            document.getElementById("subtotal").innerHTML = "$" + response;
            document.getElementById("total").innerHTML = "$" + response;
        }
    })
}


function increasebtn() {
    let total = document.getElementById("hey").innerHTML;
    total = parseInt(total)
    document.getElementById("hey").innerHTML = total + 1;

}
function decreasebtn() {
    let total = document.getElementById("hey").innerHTML;
    total = parseInt(total)
    if (total == 1) {
        document.getElementById("hey").innerHTML = 1
    } else {
        document.getElementById("hey").innerHTML = total - 1;
    }

}


function basketclicked1(id) {
    let total = document.getElementById("hey").innerHTML;
    total = parseInt(total)

    $.ajax({
        url: "/singleupdate-update",
        data: { id: id, total: total },
        method: "post",
        success: (response) => {
            location.href = "/carthtml"
        }
    })
}

function removeoffer(body, price) {
    console.log(body)
    let pricenew = parseInt(price)
    $.ajax({
        url: "/admin/removeoffer/",
        data: { id: body, price: pricenew },
        method: "post",
        success: (response) => {
            console.log("response got it")
            console.log("idof" + body)
            let cardElement = document.getElementById("id-" + body)
            console.log(cardElement)
            if (cardElement) {
                cardElement.style.display = "none";
            } else {
                console.error("Card element not found:", "idof" + body);
            }

        }

    })
}
function couponchecking(userid) {
    let cpcode = document.getElementById("cpcode").value;
    console.log(cpcode);
    $.ajax({
        url: "/couponchecking/" + cpcode,
        method: "get",
        success: (response) => {
            console.log(response)
            if (response.mormis.coup == "match") {
                let checkinner = document.getElementById("hiddencouponsum").innerHTML
                if (checkinner != 0) {
                    alert("alredy coupon added")
                } else {
                    console.log("complete your coupon")
                    let cpnot = document.getElementById("cpnot")
                    cpnot.style.display = "none"
                    let cpap = document.getElementById("cpap")
                    cpap.removeAttribute("hidden")
                    document.getElementById("hiddencouponsum").innerHTML = parseInt(document.getElementById("hiddencouponsum").innerHTML) + parseInt(response.mormis.coup1)
                    console.log(checkinner)
                    document.getElementById("cpapval").innerHTML = "-$" + response.mormis.coup1;
                    let price0 = document.getElementById("hiddencouponsum").innerHTML;
                    let price = parseInt(price0);
                    let price2 = parseInt(response.totalprice);
                    console.log(price, price2)
                    let newprice = price2 - price;
                    document.getElementById("totalcart").innerHTML = newprice
                    document.getElementById("totalcart1").innerHTML = newprice
                    alert("coupon applied")

                }


            } else {
                let cpnot = document.getElementById("cpnot")
                cpnot.removeAttribute("hidden");
            }
        }
    })
}
function logutformindex() {
    $.ajax({
        url: "/logout",
        method: "get",
        success: (response) => {
            location.reload()
        }
    })
}


function razopayment(totalamount, totalproduct, orderid, adress, totaladressfail) {
    console.log("razoropaycaling functin")
    console.log(totalamount)
    console.log(totalproduct)
    console.log(orderid)
    console.log(adress)
    console.log(totaladressfail)
    let couponprice = document.getElementById("totalcart1").innerHTML;
    couponprice = parseInt(couponprice);
    if (couponprice == 0) {
        $.ajax({
            url: "/placeorderbyrazorpay",
            method: "post",
            data: { orderid, totalamount },
            success: (response) => {
                console.log(response)
                console.log("hey prebu")
                razorpaypayment(response.order)
                console.log("payment completed")
            }
        })
    } else {
        let totalamount=couponprice;
        $.ajax({
            url: "/placeorderbyrazorpay",
            method: "post",
            data: { orderid, totalamount },
            success: (response) => {
                console.log(response)
                console.log("hey prebu")
                razorpaypayment(response.order)
                console.log("payment completed")
            }
        })
    }

}



function razorpaypayment(orderid) {
    var options = {
        "key": "rzp_test_bQuC3tCBEV6iGn", // Enter the Key ID generated from the Dashboard
        "amount": orderid.amount, // Amount is in currency subunits. Default currency is INR. Hence, 50000 refers to 50000 paise
        "currency": "INR",
        "name": "Manu tecnology", //your business name
        "description": "Test Transaction",
        "image": "https://example.com/your_logo",
        "order_id": orderid.id, //This is a sample Order ID. Pass the `id` obtained in the response of Step 1
        "handler": function (response) {
            console.log("manukuttan")
            console.log(response)

            // Call a function to verify the payment with your server
            verifypayment(response, orderid);
        },

        "prefill": { //We recommend using the prefill parameter to auto-fill customer's contact information especially their phone number
            "name": "Gaurav Kumar", //your customer's name
            "email": "gaurav.kumar@example.com",
            "contact": "9000090000" //Provide the customer's phone number for better conversion rates 
        },
        "notes": {
            "address": "Razorpay Corporate Office"
        },
        "theme": {
            "color": "#3399cc"
        }

    };
    ele = document.getElementById("idscomming").innerHTML
    console.log(ele)
    var idsCommingElement = document.getElementById("idscomming");

    if (idsCommingElement) {
        // Extract lines of information
        var lines = idsCommingElement.innerHTML.split('<br>');

        // Check if there are enough lines to create the addressObj
        if (lines.length >= 4) {
            // Create an address object
            var addressObj = {
                Name: lines[0].replace('Name: ', '').trim(),
                Address: lines[1].replace('Address: ', '').trim(),
                Number: lines[2].replace('Number: ', '').trim(),
                Email: lines[3].replace('Email: ', '').trim()
            };

            console.log(addressObj);
            var rzp1 = new Razorpay(options);
            rzp1.open()
        } else {
            alert("you are not selected any adress please select it")
        }
    } else {
        alert("you are not selected any adress please select it")
    }

}

function verifypayment(response, order) {
    ele = document.getElementById("idscomming").innerHTML
    console.log(ele)
    var idsCommingElement = document.getElementById("idscomming");

    if (idsCommingElement) {
        // Extract lines of information
        var lines = idsCommingElement.innerHTML.split('<br>');

        // Check if there are enough lines to create the addressObj
        if (lines.length >= 4) {
            // Create an address object
            var addressObj = {
                Name: lines[0].replace('Name: ', '').trim(),
                Address: lines[1].replace('Address: ', '').trim(),
                Number: lines[2].replace('Number: ', '').trim(),
                Email: lines[3].replace('Email: ', '').trim()
            };

            console.log(addressObj);
        } else {
            console.error("Insufficient lines in idsCommingElement to create addressObj");
        }
    } else {
        console.error("idsCommingElement not found");
    }
    console.log("verifypayment", response)
    let amounts = order.amount / 100
    $.ajax({
        url: "/verifypaymentrazorpay",
        data: {
            response, order, addressObj, amounts
        },
        method: "post",
        success: function (comming) {
            console.log("manvu")
            console.log(comming)
            console.log("manvu")
            if (comming.newstatus) {

                console.log("response is comming")
                location.href = "/scrachcard"

                //location.href='/thankyou'
            } else {
                alert("payment failed")
                location.reload()

            }

        }
    })

}

function paypalpayment(totalamount, totalproduct, orderid, adress, totaladressfail) {
    $.ajax({
        url: "/paypalpayment",
        data: { orderid, totalamount },
        method: "post",
        success: (response) => {
            window.location.href = response.approvalUrl;
        }
    })
}

function cashondeleivery(totalamount, totalproduct, orderid, adress, totaladressfail) {
    ele = document.getElementById("idscomming").innerHTML
    console.log(ele)
    var idsCommingElement = document.getElementById("idscomming");

    if (idsCommingElement) {
        // Extract lines of information
        var lines = idsCommingElement.innerHTML.split('<br>');

        // Check if there are enough lines to create the addressObj
        if (lines.length >= 4) {
            // Create an address object
            var addressObj = {
                Name: lines[0].replace('Name: ', '').trim(),
                Address: lines[1].replace('Address: ', '').trim(),
                Number: lines[2].replace('Number: ', '').trim(),
                Email: lines[3].replace('Email: ', '').trim()
            };
            let couponprice = document.getElementById("totalcart1").innerHTML;
            couponprice = parseInt(couponprice);
            if (couponprice == 0) {
                console.log(addressObj);
                $.ajax({
                    url: "/cashondelivery",
                    data: { totalamount, totalproduct, orderid, totaladressfail, addressObj },
                    method: "post",
                    success: (response) => {
                        location.href = "/thankyou"
                    }
                })
            } else {
                alert(couponprice)
                let totalamount = couponprice
                $.ajax({
                    url: "/cashondelivery",
                    data: { totalamount, totalproduct, orderid, totaladressfail, addressObj },
                    method: "post",
                    success: (response) => {
                        location.href = "/thankyou"
                    }
                })
            }

        } else {
            alert("you are not selected any adress please select it")
        }
    } else {
        alert("you are not selected any adress please select it")


    }




}
///are you confirm to delete the order
function myordercancel(detailsid) {
    console.log("comming")
    const customMessageModal = $("#customMessageModal");
    const okButton = $("#okButton");
    const cancelButton = $("#cancelButton");
    const customtext = $("#customMessageText");

    cancelButton.on('click', () => {
        customMessageModal.css('display', 'none')
    });

    customMessageModal.css('display', 'flex')
    customtext.text("are you sure to cancel the product ")

    okButton.on('click', () => {
        $.ajax({
            url: "/cancelproduct/" + detailsid,
            method: "get",
            success: (response) => {
                location.reload()
            }
        })
    })

}

function updatestatus(id) {
    console.log(id)
    let e = document.getElementById(id);
    var value = e.value;
    console.log(value)
    $.ajax({
        url: "/admin/updatestatus",
        data: { id: id, value: value },
        method: "post",
        success: (response) => {
            alert("updated Sucessfully")
            location.reload()
        }
    })
}


function calllocation(x) {
    $.ajax({
        url: "/updatescrachcardamount/" + x,
        method: "get",
        success: (response) => {
            location.href = "/thankyou"
        }
    })

}