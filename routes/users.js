var express = require('express');
var router = express.Router();
var producthelpers = require('../producthelper/producthelpers')
var userhelpers = require('../producthelper/userhelpers');
const { response } = require('../app');
const accountSid = 'ACeedd2bff7688961ebebae472001146cc';
const authToken = '2d8cdd09a16df16b0c25f3e13d166606';
const client = require('twilio')(accountSid, authToken);
const paypal = require('paypal-rest-sdk');

const nodemailer = require("nodemailer");
/* GET users listing. */
paypal.configure({
  'mode': 'sandbox', //sandbox or live
  'client_id': 'ARpfgsZ_FTRWFstiWQmQjKbASEOfZPXN9Pw9TTpfM7U9zlHTOEDd4fxLfjUqZ1VB3EbywEh-HJQq2gze',
  'client_secret': 'EG-v9tubLNZqCwu8DRYwAodIxKcXTurvU48pT-aV4QHs_6JqC87kRLytsn45DAvQ2ReRcC3uN9Otc8-A'
});

var validitycheckinguser = function (req, res, next) {
  if (req.session.userlogin) {
    next()
  } else {
    res.redirect('/login')
  }
}

router.get('/', validitycheckinguser, function (req, res, next) {
  req.session.couponidfort = false;
  producthelpers.getbanner().then((response) => {
    console.log(response)
    const bannerObject = {};

    response.forEach((element, index) => {
      bannerObject[`banner${index + 1}`] = element.bannerid;
    });

    console.log(bannerObject)
    userhelpers.qunitycart(req.session.userid).then((response) => {
      userhelpers.findallfavproduct(req.session.userid).then((fav) => {
        console.log(fav)
        console.log(response)
        console.log("manuss")
        producthelpers.findoffers().then((updates) => {
          producthelpers.findfeturedproduct().then((totl) => {
            if (req.session.signupuser) {
              res.render("user/index", { user: true, bannerObject, response, fav, updates, totl, newac: true })
              req.session.signupuser = false;
            } else {
              res.render("user/index", { user: true, bannerObject, response, fav, updates, totl })
            }

          })

        })

      })

    })

    console.log("caled")
  })




});

router.get("/index", validitycheckinguser, (req, res) => {
  res.redirect('/')
})
router.get("/carthtml", validitycheckinguser, (req, res) => {
  userhelpers.findcart(req.session.userid).then((totalproduct) => {

    userhelpers.qunitycart(req.session.userid).then((response) => {
      userhelpers.findallfavproduct(req.session.userid).then((fav) => {
        userhelpers.updatecart(req.session.userid).then((totalcart) => {
          res.render("user/cart", { user: true, totalproduct, response, fav, totalcart })
        })


      })

    })

  })

})
router.get('/about', (req, res) => {
  userhelpers.qunitycart(req.session.userid).then((response) => {
    userhelpers.findallfavproduct(req.session.userid).then((fav) => {

      res.render("user/about", { user: true, response, fav })


    })

  })

})
router.get('/contact', validitycheckinguser, (req, res) => {
  res.render("user/contact", { user: true })
})
router.get('/shop', validitycheckinguser, (req, res) => {
  userhelpers.getAllproducts().then((totalproduct) => {
    userhelpers.qunitycart(req.session.userid).then((response) => {
      userhelpers.findallfavproduct(req.session.userid).then((fav) => {

        res.render('user/shop', { user: true, totalproduct, response, fav })


      })

    })
  })

})
router.get("/shop-single/:id", validitycheckinguser, (req, res) => {
  userhelpers.singleshoping(req.params.id).then((singleproduct) => {


    userhelpers.qunitycart(req.session.userid).then((response) => {
      userhelpers.findallfavproduct(req.session.userid).then((fav) => {

        producthelpers.findfeturedproduct().then((totl) => {
          res.render('user/shop-single', { user: true, singleproduct, response, fav, totl })
        })

      })


    })


  })


})
router.get('/thankyou', (req, res) => {
  req.session.couponidfort = false;
  res.render('user/thankyou')
})
//fdinddddd card
router.get('/checkout', validitycheckinguser, (req, res) => {
  userhelpers.findcart(req.session.userid).then((totalproduct) => {
    userhelpers.qunitycart(req.session.userid).then((response) => {
      userhelpers.findallfavproduct(req.session.userid).then((fav) => {
        userhelpers.findaddress(req.session.userid).then((adress) => {
          userhelpers.updatecart(req.session.userid).then((totalprice) => {
            if (adress == 0) {
              let username = req.session.username;
              let userid = req.session.userid;
              let email = req.session.useremail;
              res.render('user/userprofile', { user: true, response, fav, username, email, noadressfound: true, userid })
            } else if (totalproduct.length == 0) {
              res.render("user/oops")
            } else {
              let userid = req.session.userid;
              res.render('user/checkout', { user: true, response, fav, adress, totaladressfail: true, totalproduct, totalprice, userid })
            }
          })


        })

      })
    })
  })


})


router.get('/signup', (req, res) => {
  if (req.session.alredysign) {
    res.render('user/siginup', { signerr: true })
  } else {
    res.render('user/siginup')
  }

})
router.post("/usersignup", (req, res) => {
  userhelpers.getSignUp(req.body).then((response) => {
    if (response.status) {
      req.session.signupuser = true;
      req.session.userlogin = true;
      req.session.username = response.response.Name;
      req.session.useremail = response.response.Email;
      req.session.userid = response.response._id;
      res.redirect("/")
    } else {
      req.session.alredysign = true
      res.redirect("/signup")
    }

  })
})



router.get('/login', (req, res) => {
  if (req.session.userloginerr) {
    res.render('user/login', { userloginerr: true })
    req.session.userloginerr = false
  } else if (req.session.forgotpasswordsucess) {
    res.render('user/login', { forgotsucess: true })
  } else if (req.session.block) {
    res.render('user/login', { block: true })
    req.session.block = false
  } else {
    res.render('user/login')
  }

})

router.post("/userlogin", (req, res) => {
  console.log(req.body)
  userhelpers.getLoginUp(req.body).then((response) => {
    console.log("okcome", response)
    if (response.status == true) {
      console.log(response)
      req.session.userlogin = true
      req.session.username = response.user.Name;
      req.session.useremail = response.user.Email;
      req.session.userid = response.user._id;
      res.redirect("/")
    } else if (response.block == true) {
      req.session.block = true;

      res.redirect("/login")
    } else {
      req.session.userloginerr = true;
      res.redirect("/login")
    }
  })
})

router.get("/logout", (req, res) => {
  req.session.destroy();
  res.json({ response })
})



router.get("/userprofile", validitycheckinguser, (req, res) => {
  userhelpers.qunitycart(req.session.userid).then((response) => {
    userhelpers.findallfavproduct(req.session.userid).then((fav) => {
      let username = req.session.username;
      let email = req.session.useremail;
      if (req.session.userdataupload) {
        res.render('user/userprofile', { user: true, response, fav, username, email, newupload: true })
        req.session.userdataupload = false
      } else {
        res.render('user/userprofile', { user: true, response, fav, username, email })
      }

    })
  })

})


router.get('/uploadfav/:id', validitycheckinguser, (req, res) => {
  console.log("itscomming", req.params.id)
  userhelpers.favproduct(req.params.id, req.session.userid).then((response) => {
    console.log('its uploadfav')
    res.json(response)

  })

})
router.get('/deletefav/:id', validitycheckinguser, (req, res) => {
  userhelpers.favdlt(req.params.id, req.session.userid).then((response) => {
    res.json(response)
  })
})
router.get('/fav', validitycheckinguser, (req, res) => {

  userhelpers.findallfav(req.session.userid).then((favitemarry) => {
    if (favitemarry == 0) {
      var favcoll = favitemarry;
      console.log(favcoll)
      console.log("hellow manuss")
    } else {
      var favcoll = favitemarry.manu;
      console.log(favcoll.length)
      console.log("hellow manuzz")
    }


    if (favcoll.length == 0) {
      userhelpers.qunitycart(req.session.userid).then((response) => {
        userhelpers.findallfavproduct(req.session.userid).then((fav) => {
          res.render("user/fav", { user: true, favcoll, response, fav })
        })
      })

    } else {

      userhelpers.qunitycart(req.session.userid).then((response) => {
        userhelpers.findallfavproduct(req.session.userid).then((fav) => {
          res.render("user/fav", { user: true, favcoll, response, fav })
        })

      })
    }

  })
})
router.get('/favdletfromfavcart/:id', validitycheckinguser, (req, res) => {
  userhelpers.favdlt(req.params.id, req.session.userid).then((response) => {
    res.json(response)
  })
})

router.get('/initialcalling', validitycheckinguser, (req, res) => {
  userhelpers.findfavproduct(req.session.userid).then((response) => {
    console.log("called")
    res.json(response)

  })

})
router.get('/cartaddproduct/:id', validitycheckinguser, (req, res) => {
  userhelpers.increasetheproduct(req.params.id, req.session.userid).then((response) => {
    console.log("ok get in")
    res.json(response);
  })
})
router.get('/currqunitityofcart', validitycheckinguser, (req, res) => {
  userhelpers.qunitycart(req.session.userid).then((response) => {
    res.json(response)
  })
})


router.post('/incrementbtn', (req, res) => {

  userhelpers.increasecount(req.body, req.session.userid).then((response) => {
    userhelpers.totalpriceproduct(req.body, req.session.userid).then((response) => {
      console.log(response)
      res.json(response)
    })


  })
})

router.get("/deletetheproduct/:id", validitycheckinguser, (req, res) => {
  console.log(req.params.id)
  userhelpers.deleteproduct(req.params.id, req.session.userid).then((response) => {
    res.json(response)
  })
})

router.get("/removecart/:id", validitycheckinguser, (req, res) => {
  userhelpers.removecart(req.params.id, req.session.userid).then((response) => {
    res.json(response);
  })
})

router.get("/updatecart", validitycheckinguser, (req, res) => {
  userhelpers.updatecart(req.session.userid).then((response) => {
    res.json(response);
  })
})

router.post("/singleupdate-update", (req, res) => {
  console.log(req.body)
  userhelpers.singleupdate(req.body.id, req.body.total, req.session.userid).then((response) => {
    res.json(response)
  })
})

router.post("/userprofile", (req, res) => {
  console.log("helllo")
  userhelpers.userdetails(req.body, req.session.userid).then(() => {
    req.session.userdataupload = true;
    res.redirect("/userprofile")
  })
})

router.post("/userprofile1", (req, res) => {
  console.log("helllo")
  userhelpers.userdetails(req.body, req.session.userid).then(() => {
    res.redirect("/checkout")
  })
})

router.get("/edituseradress/:id", validitycheckinguser, (req, res) => {
  console.log(req.params.id)
  let responseid = req.params.id
  userhelpers.qunitycart(req.session.userid).then((response) => {
    userhelpers.findallfavproduct(req.session.userid).then((fav) => {
      userhelpers.finduseradress(responseid, req.session.userid).then((adresssresolve) => {
        res.render("user/editadress", { user: true, responseid, adresssresolve, response, fav })
      })
    })
  })
})

router.post("/editadresspost/:id", (req, res) => {
  console.log(req.params.id)
  userhelpers.editadress(req.params.id, req.body, req.session.userid).then(() => {
    res.redirect("/checkout")
  })
})

router.get("/productfindforfilter", validitycheckinguser, (req, res) => {
  userhelpers.getAllproducts().then((totalproduct) => {
    producthelpers.offerupdate1().then((arr) => {
      console.log("manu")

      if (arr == 0 && totalproduct.length == 0) {
        var total1 = 0;
        res.json(total1)
      } else {
        if (arr == 0) {
          res.json(totalproduct)
        } else {
          let newarr = arr.arr;
          res.json(newarr)
        }

      }

    })


  })
})

router.get("/couponchecking/:id", validitycheckinguser, (req, res) => {
  console.log(req.params.id)
  userhelpers.couponchecking(req.params.id, req.session.userid).then((mormis) => {
    userhelpers.updatecart(req.session.userid).then((totalprice) => {
      if (mormis.coup == "mismatch") {
        console.log(mormis)
        res.json({ mormis, totalprice })
        req.session.couponidfort = false;
      } else {
        console.log(mormis)
        req.session.couponid = mormis.coup2;
        req.session.couponidfort = true;
        res.json({ mormis, totalprice })
      }

    })

  })
})
router.get("/forgotemail", (req, res) => {
  if (req.session.useremailverify) {
    res.render("user/registerdemail", { userfail: true });
    req.session.useremailverify = false
  } else if (req.session.otpvalidationfail) {
    res.render("user/registerdemail", { otpfail: true });
    req.session.otpvalidationfail = false;
  } else {
    res.render("user/registerdemail");
  }

})
router.post("/forgotemailverification", (req, res) => {
  console.log(req.body)
  userhelpers.forgotemailtocheck(req.body.Phone).then((details) => {
    console.log(details)
    if (details != 0) {

      client.verify.v2.services('VAdf441f92f05f01adb6b4b5f53e64adae')
        .verifications
        .create({ to: '+918136860631', channel: 'sms' })
        .then(verification => console.log(verification.status), res.render("user/otpverify", { details }));

    } else {
      req.session.useremailverify = true;
      console.log("error is coming");
      res.redirect("/forgotemail?userfail=true");
    }

  })

})

router.post("/otpverify", (req, res) => {

  userhelpers.checkingotp(req.body).then((otpvalid) => {
    console.log(req.session.otpnumber)
    if (otpvalid == 'approved') {
      let usernumber = req.body.Phone;
      res.render("user/forgotpassword", { usernumber })
    } else {
      req.session.otpvalidationfail = true;
      res.redirect("/forgotemail");

    }
  })
})
router.post("/forgotpassword", (req, res) => {
  console.log(req.body)
  userhelpers.forgotpassword(req.body).then(() => {
    req.session.forgotpasswordsucess = true
    res.redirect("/login")
  })
})

router.post("/placeorderbyrazorpay", (req, res) => {
  userhelpers.getRazorpay(req.body.orderid, req.body.totalamount).then((order) => {
    res.json({ order })

  })
})

router.post("/verifypaymentrazorpay", async (req, res) => {
  console.log(req.body)
  console.log("hey prebu")
  await userhelpers.verifypayments(req.body).then((status) => {
    if (status.status == "approved") {
      let newstatus = true
      req.session.scrachcardgenerate = true;
      if (req.session.couponidfort) {
        userhelpers.couponcollected(req.session.userid, req.session.couponid).then(() => {
          userhelpers.findcartitem(req.session.userid).then((products) => {
            userhelpers.myorders2(req.body, products).then((response) => {
              res.json({ newstatus })
            })
          })
        })
      } else {
      
        userhelpers.findcartitem(req.session.userid).then((products) => {
          userhelpers.myorders2(req.body, products).then((response) => {
            res.json({ newstatus })
          })
        })
      }

    } else {
      let newstatus = false
      res.json({ newstatus })

    }

  })
})

router.post("/paypalpayment", (req, res) => {
  console.log(req.body.totalamount)
  const create_payment_json = {
    "intent": "sale",
    "payer": {
      "payment_method": "paypal"
    },
    "redirect_urls": {
      "return_url": "http://localhost:3000/success",
      "cancel_url": "http://localhost:3000/cancel"
    },
    "transactions": [{
      "item_list": {
        "items": [{
          "name": "Manu",
          "sku": "001",
          "price": req.body.totalamount,
          "currency": "USD",
          "quantity": 1
        }]
      },
      "amount": {
        "currency": "USD",
        "total": req.body.totalamount,
      },
      "description": "Hat for the best team ever"
    }]
  };
  router.get('/success', (req, res) => {
    const payerId = req.query.PayerID;
    const paymentId = req.query.paymentId;

    const execute_payment_json = {
      "payer_id": payerId,
      "transactions": [{
        "amount": {
          "currency": "USD",
          "total": req.body.totalamount,
        }
      }]
    };

    paypal.payment.execute(paymentId, execute_payment_json, function (error, payment) {
      if (error) {
        console.log(error.response);
        throw error;
      } else {
        console.log(JSON.stringify(payment));
        res.send('Success');
      }
    });
  });
  paypal.payment.create(create_payment_json, function (error, payment) {
    if (error) {
      res.status(500).json({ error: 'Error creating PayPal payment' });
    } else {
      for (let i = 0; i < payment.links.length; i++) {
        if (payment.links[i].rel === 'approval_url') {
          res.json({ approvalUrl: payment.links[i].href });
          return;
        }
      }
      res.status(500).json({ error: 'No approval URL found in PayPal response' });
    }
  });

  router.get('/cancel', (req, res) => {
    res.redirect('/checkout')
  })

});

//cashon delevery
router.post("/cashondelivery", async (req, res) => {
  await userhelpers.findcartitem(req.body.orderid).then((products) => {
    if (req.session.couponidfort) {
      userhelpers.couponcollected(req.session.userid, req.session.couponid).then(() => {

        console.log(products)
        console.log(req.body)
        userhelpers.myorders(req.body, products).then((response) => {
          res.json({ response })
        })
      })
    } else {
      console.log(products)
      console.log(req.body)
      userhelpers.myorders(req.body, products).then((response) => {
        res.json({ response })
      })
    }


  })
})

router.get("/myorders", validitycheckinguser, (req, res) => {
  userhelpers.myordersfind(req.session.userid).then((userdetails) => {
    if (userdetails.length == 0) {
      console.log(userdetails)
      userhelpers.getAllproducts().then((totalproduct) => {
        userhelpers.qunitycart(req.session.userid).then((response) => {
          userhelpers.findallfavproduct(req.session.userid).then((fav) => {
            res.render('user/myorders', { user: true, totalproduct, response, fav, userdetails, noproduct: true })
          })

        })
      })
    } else {
      userhelpers.getAllproducts().then((totalproduct) => {
        userhelpers.qunitycart(req.session.userid).then((response) => {
          userhelpers.findallfavproduct(req.session.userid).then((fav) => {
            res.render('user/myorders', { user: true, totalproduct, response, fav, userdetails })
          })

        })
      })
    }


  })
})



router.get("/myorderproduct/:id", validitycheckinguser, (req, res) => {
  console.log("manukuttan")
  console.log(req.params.id)

  userhelpers.myorderproductfinding(req.params.id).then((response) => {
    console.log(response)
    userhelpers.orderdetailsgetting(response).then((productcollection) => {
      userhelpers.getAllproducts().then((totalproduct) => {
        userhelpers.qunitycart(req.session.userid).then((response) => {
          userhelpers.findallfavproduct(req.session.userid).then((fav) => {
            res.render('user/myorderproduct1', { user: true, totalproduct, response, fav, productcollection })

          })

        })
      })

    })
  })
})

router.get("/wallet", validitycheckinguser, (req, res) => {
  userhelpers.getAllproducts().then((totalproduct) => {
    userhelpers.qunitycart(req.session.userid).then((response) => {
      userhelpers.findallfavproduct(req.session.userid).then((fav) => {
        userhelpers.findmywallet(req.session.userid).then((walletamounts) => {
          res.render('user/mywallet', { user: true, totalproduct, response, fav, walletamounts })



        })

      })

    })
  })


})


router.get("/cancelproduct/:id", validitycheckinguser, (req, res) => {
  userhelpers.cancelproduct(req.params.id).then((amount) => {
    if (amount == "notdefined") {
      res.json({ response })
    } else {
      userhelpers.walletamount(amount, req.session.userid, req.params.id).then(() => {
        res.json({ response })
      })

    }

  })
})

router.get("/scrachcard", (req, res) => {
  if (req.session.scrachcardgenerate) {
    res.render("user/scrachcard")
    req.session.scrachcardgenerate = false;
  } else {
    res.redirect("/shop")
  }

})

router.get("/updatescrachcardamount/:id", (req, res) => {
  console.log(req.params.id)
  console.log("amount")
  userhelpers.updatewalletbycouponamount(req.params.id, req.session.userid).then(() => {
    res.json({ response })
  })
})

router.post("/contacttoadmin", validitycheckinguser, (req, res) => {
  console.log(req.body);

  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
    secure: true,

    auth: {
      // TODO: replace `user` and `pass` values from <https://forwardemail.net>
      user: "madhumanum8@gmail.com",
      pass: "npag lcaz pqwr naka",
    },
  });

  // async..await is not allowed in global scope, must use a wrapper
  async function main(body) {
    // send mail with defined transport object
    const info = await transporter.sendMail({
      from: body.c_email, // sender address
      to: "madhumanum8@gmail.com", // list of receivers
      subject: body.c_subject, // Subject line
      html: `
      <html>
        <head>
          <style>
            /* Add your CSS styles here */
          </style>
        </head>
        <body>
        <p>From:${body.c_email}</p>
        <p>subject:${body.c_subject}</p>
        <br>
          <h3>Hii my name is ${body.c_fname} ${body.c_lname} </h3>
          <p>${body.c_message}</p>
        </body>
      </html>
    `,
    });




    console.log("Message sent: %s", info.messageId);
    // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>

    //
    // NOTE: You can go to https://forwardemail.net/my-account/emails to see your email delivery status and preview
    //       Or you can use the "preview-email" npm package to preview emails locally in browsers and iOS Simulator
    //       <https://github.com/forwardemail/preview-email>
    //
  }
  main(req.body).then(() => {
    res.redirect("/contact")
  }).catch(console.error);

})







module.exports = router;

