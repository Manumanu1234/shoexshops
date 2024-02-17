const db = require("../config/connection")
const admincoll = require('../collectionname/collnamesqury');
const { response } = require("../app");
var ObjectId = require("mongodb").ObjectId;
var bycrpt = require("bcrypt")
const accountSid = 'ACeedd2bff7688961ebebae472001146cc';
const authToken = '2d8cdd09a16df16b0c25f3e13d166606';
const client = require('twilio')(accountSid, authToken);
const Razorpay = require("razorpay");
const { resolve } = require("path");
const { rejects } = require("assert");
var instance = new Razorpay({ key_id: 'rzp_test_bQuC3tCBEV6iGn', key_secret: 'WTS4y1ORhsbXGOS4eMzbPFir' })
module.exports = {
    getAllproducts: function () {
        return new Promise(async (resolve, reject) => {
            let totalproduct = await db.get().collection(admincoll.productcolletion).find({}).toArray()
            resolve(totalproduct)

        })
    },
    singleshoping: function (id) {
        console.log(id)
        return new Promise(async (resolve, reject) => {

            let discountcol = await db.get().collection(admincoll.DISCOUNT).find({}).toArray()
            discountcol = discountcol[0];
            if (discountcol == undefined) {
                let singleproduct = await db.get().collection(admincoll.productcolletion).findOne({ _id: new ObjectId(id) })
                resolve(singleproduct)

            } else {
                let singleproduct = await db.get().collection(admincoll.DISCOUNT).aggregate([
                    {
                        $unwind: "$arr"
                    },
                    {
                        $match: {
                            "arr._id": new ObjectId(id)
                        }
                    }
                ]).toArray();

                if (singleproduct[0]) {
                    let { _id, name, price, catogory, discription, gender, brand, size, images, offer } = singleproduct[0].arr;

                    let simplifiedProduct = {
                        _id,
                        name,
                        price,
                        catogory,
                        discription,
                        gender,
                        brand,
                        size,
                        images,
                        offer
                    };

                    resolve(simplifiedProduct);
                } else {
                    // Handle the case when no product is found
                    resolve(null);
                }
            }


        })
    },
    favproduct: function (proid, userid) {
        return new Promise(async (resolve, reject) => {
            var productotal = {
                userid: userid,
                product: [{ item: new ObjectId(proid) }]
            }
            let producttot = await db.get().collection(admincoll.FAV_COLLECTION).findOne({ userid: userid })
            console.log(producttot)
            console.log("hey")
            if (producttot == null) {
                db.get().collection(admincoll.FAV_COLLECTION).insertOne(productotal).then((response) => {
                    resolve(response)
                })
            } else {
                db.get().collection(admincoll.FAV_COLLECTION).updateOne({ userid: userid }, {
                    $push: { product: { item: new ObjectId(proid) } }
                }).then((response) => {
                    resolve(response)
                })
            }

        })
    },
    findfavproduct: function (userid) {
        return new Promise(async (resolve, reject) => {
            let total = await db.get().collection(admincoll.FAV_COLLECTION).findOne({ userid: userid })
            if (total == null) {
                resolve()
            } else {
                console.log(total.product)
                resolve(total.product)
            }

        })

    },
    favdlt: function (dltid, userid) {
        return new Promise(async (resolve, reject) => {

            db.get().collection(admincoll.FAV_COLLECTION).updateOne({ userid: userid }, {
                $pull: { product: { item: new ObjectId(dltid) } }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    findallfav: function (userid) {
        return new Promise(async (resolve, reject) => {
            let totalfavprooduct = await db.get().collection(admincoll.FAV_COLLECTION).findOne({ userid: userid })
            if (totalfavprooduct != null) {
                let discountproduct = await db.get().collection(admincoll.DISCOUNT).find({}).toArray()
                if (discountproduct.length == 0) {
                    let aggregatefav = await db.get().collection(admincoll.FAV_COLLECTION).aggregate([
                        {
                            $lookup: {
                                from: admincoll.productcolletion,
                                let: { products: totalfavprooduct.product },
                                pipeline: [
                                    {
                                        $match: {
                                            $expr: {
                                                $in: ['$_id', '$$products.item']
                                            },
                                        }
                                    }

                                ],
                                as: 'favitems'
                            }
                        },
                        {
                            $project: {
                                manu: {
                                    $map: {
                                        input: '$favitems',
                                        as: 'favitem',
                                        in: {
                                            _id: "$$favitem._id",
                                            name: '$$favitem.name',
                                            price: '$$favitem.price',
                                            images: { $arrayElemAt: ['$$favitem.images', 0] }
                                        }
                                    }
                                }
                            }
                        }

                    ]).toArray()

                    resolve(aggregatefav[0])
                } else {
                    let aggregatefav = await db.get().collection(admincoll.FAV_COLLECTION).aggregate([
                        {
                            $match: { userid: userid }
                        },
                        { $unwind: '$product' },
                        {
                            $project: {
                                item: '$product.item',
                            }
                        },
                        {
                            $lookup: {
                                from: 'discount',
                                let: { productItem: '$item' },
                                pipeline: [
                                    {
                                        $unwind: '$arr' // Unwind the 'arr' array
                                    },
                                    {
                                        $match: {
                                            $expr: {
                                                $eq: ['$arr._id', '$$productItem']
                                            }
                                        }
                                    }
                                ],
                                as: 'catitem'
                            }
                        },
                        {
                            $unwind: '$catitem'
                        },
                        {
                            $group: {
                                _id: '$_id',
                                manu: {
                                    $push: {
                                        _id: '$catitem.arr._id',
                                        name: '$catitem.arr.name',
                                        price: '$catitem.arr.price',
                                        images: { $arrayElemAt: ['$catitem.arr.images', 0] },

                                    }
                                }
                            }
                        }
                    ]).toArray()
                    console.log("what", aggregatefav)
                    resolve(aggregatefav[0])
                }



            } else {
                let total = 0
                resolve(total)
            }
        })
    },
    increasetheproduct: function (proid, userid) {
        console.log(userid)
        return new Promise(async (resolve, reject) => {
            var productobj = {
                userid: userid,
                product: [
                    {
                        item: new ObjectId(proid),
                        quntity: 1,
                    }
                ]
            }
            let finding = await db.get().collection(admincoll.CART_COLLETION).findOne({ userid: userid })
            console.log(finding, "emptyahnu")
            if (finding == null) {
                console.log("emptyahnu111")
                await db.get().collection(admincoll.CART_COLLETION).insertOne(productobj).then((response) => {
                    resolve(response)
                })
            } else {
                console.log("emptyahnueee")
                // let finded = finding[0]._id;
                let updateproduct = {
                    item: new ObjectId(proid),
                    quntity: 1,
                }
                let sameelem = finding.product.findIndex(product => product.item == proid)
                console.log(sameelem)
                if (sameelem != -1) {
                    console.log("emptyahnurrr")
                    await db.get().collection(admincoll.CART_COLLETION).updateOne({ userid: userid, 'product.item': new ObjectId(proid) }, {
                        $inc: { 'product.$.quntity': 1 }
                    }).then((response) => {
                        resolve(response)
                    })
                } else {
                    console.log("emptyahnujjj")
                    await db.get().collection(admincoll.CART_COLLETION).updateOne({ userid: userid }, {
                        $push: { product: updateproduct }
                    }).then((response) => {
                        resolve(response)
                    })
                }
            }
        })
    },
    findcart: (userid) => {
        return new Promise(async (resolve, reject) => {
            let discountcol = await db.get().collection(admincoll.DISCOUNT).find({}).toArray()
            discountcol = discountcol[0];

            if (discountcol == undefined) {
                let totalproduct = await db.get().collection(admincoll.CART_COLLETION).aggregate([
                    {
                        $match: { userid: userid }

                    },

                    {
                        $unwind: '$product'
                    },
                    {
                        $project: {
                            item: "$product.item",
                            quntity: "$product.quntity"
                        }
                    },
                    {
                        $lookup: {
                            from: admincoll.productcolletion,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'catitem'
                        },
                    },
                    {
                        $project: {
                            item: 1,
                            quntity: 1,
                            name: { $arrayElemAt: ["$catitem.name", 0] },
                            price: { $arrayElemAt: ["$catitem.price", 0] },
                            images: { $arrayElemAt: ["$catitem.images", 0] },
                            catogory: { $arrayElemAt: ["$catitem.catogory", 0] },
                            total: {
                                $multiply: [
                                    { $arrayElemAt: ["$catitem.price", 0] },
                                    "$quntity"
                                ]

                            }
                        }
                    }

                ]).toArray()
                console.log(totalproduct)
                resolve(totalproduct)
            } else {
                let totalproduct = await db.get().collection(admincoll.CART_COLLETION).aggregate([
                    {
                        $match: { userid: userid }
                    },
                    { $unwind: '$product' },
                    {
                        $project: {
                            _id: 1,
                            item: '$product.item',
                            quntity: '$product.quntity'
                        }
                    },
                    {
                        $lookup: {
                            from: 'discount',
                            let: { productItem: '$item' },
                            pipeline: [
                                {
                                    $unwind: '$arr' // Unwind the 'arr' array
                                },
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ['$arr._id', '$$productItem']
                                        }
                                    }
                                }
                            ],
                            as: 'catitem'
                        }
                    },
                    {
                        $unwind: '$catitem'
                    },
                    {
                        $project: {
                            _id: 1,
                            item: 1,
                            quntity: 1,
                            name: '$catitem.arr.name',
                            price: '$catitem.arr.price',
                            images: '$catitem.arr.images',
                            category: '$catitem.arr.catogory',
                            total: { $multiply: ['$catitem.arr.price', '$quntity'] }
                        }
                    }
                ]).toArray();
                console.log(totalproduct)
                console.log("juman")
                resolve(totalproduct)

            }

        })
    },
    qunitycart: function (userid) {

        return new Promise(async (resolve, reject) => {
            let totalprod = await db.get().collection(admincoll.CART_COLLETION).findOne({ userid: userid })
            var total = 0;
            console.log(totalprod)
            if (totalprod != null) {
                let qunity = totalprod.product;
                for (let i = 0; i < qunity.length; i++) {
                    let qunitytotal = qunity[i].quntity;
                    total = total + qunitytotal;
                }
                console.log(total)
                resolve(total)
            } else {
                resolve(total)
            }
        })
    },
    increasecount: (body, userid) => {
        return new Promise(async (resolve, reject) => {

            let count = parseInt(body.count);

            await db.get().collection(admincoll.CART_COLLETION).updateOne({ userid: userid, "product.item": new ObjectId(body.itemid) }, {

                $inc: { "product.$.quntity": count }
            }).then((response) => {
                resolve(response)
            })

        })
    },
    totalpriceproduct: (body2, userid) => {
        return new Promise(async (resolve, reject) => {

            let dicountcol2 = await db.get().collection(admincoll.DISCOUNT).find({}).toArray()
            dicountcol2 = dicountcol2[0];

            if (dicountcol2 == undefined) {
                let totalprice = await db.get().collection(admincoll.CART_COLLETION).aggregate([
                    {
                        $match: { userid: userid }
                    },
                    {
                        $unwind: '$product'
                    },
                    {
                        $project: {
                            item: "$product.item",
                            quntity: "$product.quntity"
                        }
                    },
                    {
                        $lookup: {
                            from: admincoll.productcolletion,
                            localField: 'item',
                            foreignField: '_id',
                            as: 'catitem'
                        },
                    },
                    {
                        $project: {
                            item: 1,
                            quntity: 1,
                            total: {
                                $multiply: [
                                    { $arrayElemAt: ["$catitem.price", 0] },
                                    "$quntity"
                                ]

                            }
                        }
                    }

                ]).toArray()

                let totalzero = 0;
                for (let prod of totalprice) {
                    if (prod.item == body2.itemid) {
                        if (prod.quntity == 0 || prod.quntity < 0) {
                            console.log("zeroooooooooooooooooooooooooooooo")
                            resolve(totalzero)
                        } else {
                            resolve(prod.total)
                        }

                    }
                }
            } else {
                console.log("ok got it")
                let totalprice = await db.get().collection(admincoll.CART_COLLETION).aggregate([
                    {
                        $match: { userid: userid }
                    },
                    { $unwind: '$product' },
                    {
                        $project: {
                            _id: 1,
                            item: '$product.item',
                            quntity: '$product.quntity'
                        }
                    },
                    {
                        $lookup: {
                            from: 'discount',
                            let: { productItem: '$item' },
                            pipeline: [
                                {
                                    $unwind: '$arr' // Unwind the 'arr' array
                                },
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ['$arr._id', '$$productItem']
                                        }
                                    }
                                }
                            ],
                            as: 'catitem'
                        }
                    },
                    {
                        $unwind: '$catitem'
                    },
                    {
                        $project: {
                            item: 1,
                            quntity: 1,
                            total: { $multiply: ['$catitem.arr.price', '$quntity'] }
                        }
                    }

                ]).toArray()
                console.log(totalprice)
                let totalzero = 0;
                for (let prod of totalprice) {
                    if (prod.item == body2.itemid) {
                        if (prod.quntity == 0 || prod.quntity < 0) {
                            console.log("zeroooooooooooooooooooooooooooooo")
                            resolve(totalzero)
                        } else {
                            resolve(prod.total)
                        }

                    }
                }
            }







        })

    },
    deleteproduct: (id, userid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(admincoll.CART_COLLETION).updateOne({ userid: userid, "product.item": new ObjectId(id) }, {
                $pull: { product: { item: new ObjectId(id) } }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    findallfavproduct: (userid) => {
        return new Promise(async (resolve, reject) => {
            var all = await db.get().collection(admincoll.FAV_COLLECTION).findOne({ userid: userid })
            console.log(all)
            if (all == null) {
                let tot = 0
                resolve(tot)
            } else {
                let fav = all.product.length
                if (fav == 0) {
                    let totfav = 0;
                    resolve(totfav)
                } else {
                    resolve(fav)
                }
            }



        })
    },
    removecart: (itemid, userid) => {
        return new Promise((resolve, reject) => {
            db.get().collection(admincoll.CART_COLLETION).updateOne({ userid: userid, "product.item": new ObjectId(itemid) }, {
                $pull: { product: { item: new ObjectId(itemid) } }
            }).then((response) => {
                resolve(response)
            })
        })
    },
    updatecart: (userid) => {
        return new Promise(async (resolve, reject) => {
            let discountcol3 = await db.get().collection(admincoll.DISCOUNT).find({}).toArray();
            discountcol3 = discountcol3[0]

            if (discountcol3 == undefined) {
                let total = await db.get().collection(admincoll.CART_COLLETION).aggregate([
                    {
                        $match: { userid: userid }
                    },
                    {
                        $unwind: "$product"
                    },
                    {
                        $project: {
                            item: "$product.item",
                            quntity: "$product.quntity"
                        }
                    },
                    {
                        $lookup: {
                            from: admincoll.productcolletion,
                            localField: "item",
                            foreignField: "_id",
                            as: "catitem"
                        }
                    },
                    {
                        $project: {
                            item: 1,
                            quntity: 1,
                            catitem: { $arrayElemAt: ["$catitem.price", 0] }
                        }
                    },
                    {
                        $group: {
                            _id: "",
                            totol: { $sum: { $multiply: ["$catitem", "$quntity"] } }
                        }
                    }



                ]).toArray()


                if (total.length != 0) {
                    let totals = parseFloat(total[0].totol)

                    resolve(totals)

                } else {
                    let totol = 0;
                    resolve(totol)
                }
            } else {
                let total = await db.get().collection(admincoll.CART_COLLETION).aggregate([
                    {
                        $match: { userid: userid }
                    },
                    { $unwind: '$product' },
                    {
                        $project: {
                            _id: 1,
                            item: '$product.item',
                            quntity: '$product.quntity'
                        }
                    },
                    {
                        $lookup: {
                            from: 'discount',
                            let: { productItem: '$item' },
                            pipeline: [
                                {
                                    $unwind: '$arr' // Unwind the 'arr' array
                                },
                                {
                                    $match: {
                                        $expr: {
                                            $eq: ['$arr._id', '$$productItem']
                                        }
                                    }
                                }
                            ],
                            as: 'catitem'
                        }
                    },
                    {
                        $unwind: '$catitem'
                    },
                    {
                        $group: {
                            _id: "",
                            totol: { $sum: { $multiply: ["$catitem.arr.price", "$quntity"] } }
                        }
                    },



                ]).toArray()
                console.log(total)
                if (total.length != 0) {
                    let totals = parseFloat(total[0].totol)

                    resolve(totals)

                } else {
                    let totol = 0;
                    resolve(totol)
                }
            }



        })
    },
    singleupdate: (id, total, userid) => {
        return new Promise(async (resolve, reject) => {
            total = parseInt(total)
            let collectionfinding = await db.get().collection(admincoll.CART_COLLETION).findOne({ userid: userid })


            if (collectionfinding) {
                db.get().collection(admincoll.CART_COLLETION).updateOne({ userid: userid, "product.item": new ObjectId(id) },
                    {
                        $inc: { "product.$.quntity": total }
                    }).then((response) => {
                        resolve(response)
                    })
            } else {
                db.get().collection(admincoll.CART_COLLETION).updateOne({ userid: userid }, {
                    $push: { product: { item: new ObjectId(id), quntity: total } }
                }).then((response) => {
                    console.log("comming")
                    resolve(response)
                })
            }


        })

    },
    userdetails: (body, userid) => {
        return new Promise(async (resolve, reject) => {

            let details = {
                userid: userid,
                adressdetials: [{ _id: new ObjectId(), ...body }]
            }
            let usersame = await db.get().collection(admincoll.USER_DETAILS).findOne({ userid: userid });
            if (usersame) {
                db.get().collection(admincoll.USER_DETAILS).updateOne({ userid: userid }, {
                    $push: { adressdetials: { _id: new ObjectId(), ...body } }
                }).then(() => {
                    resolve()
                })

            } else {
                db.get().collection(admincoll.USER_DETAILS).insertOne(details).then(() => {
                    console.log(body)
                    resolve()
                })
            }
        })

    },
    findaddress: (userid) => {
        return new Promise(async (resolve, reject) => {
            let adress = await db.get().collection(admincoll.USER_DETAILS).findOne({ userid: userid })
            if (adress == null) {
                let total = 0
                resolve(total)
            } else {
                console.log(adress.adressdetials)
                resolve(adress.adressdetials);
            }

        })
    },
    editadress: (adressid, body, userid) => {
        return new Promise((resolve, reject) => {
            console.log(adressid, body, userid)
            const newAdressId = new ObjectId();
            db.get().collection(admincoll.USER_DETAILS).updateOne({ userid: userid, "adressdetials._id": new ObjectId(adressid) }, {
                $set: {
                    "adressdetials.$._id": newAdressId,
                    "adressdetials.$.c_fname": body.c_fname,
                    "adressdetials.$.c_lname": body.c_lname,
                    "adressdetials.$.c_companyname": body.c_companyname,
                    "adressdetials.$.c_address": body.c_address,
                    "adressdetials.$.stateorcountry": body.stateorcountry,
                    "adressdetials.$.c_postal_zip": body.c_postal_zip,
                    "adressdetials.$.c_email_address": body.c_email_address,
                    "adressdetials.$.c_phone": body.c_phone
                }
            }).then((result) => {
                resolve()
            })
        })
    },
    finduseradress: (id, userid) => {
        console.log(id, userid)
        return new Promise(async (resolve, reject) => {
            await db.get().collection(admincoll.USER_DETAILS).findOne({ userid: userid, "adressdetials._id": new ObjectId(id) }).then((adresssresolve) => {
                const foundElement = adresssresolve.adressdetials.find(element => element._id.toString() === id);

                if (foundElement) {
                    resolve(foundElement);
                    console.log(foundElement)
                } else {
                    reject("Element not found");
                }
            })

        })

    },
    couponchecking: (id, userid) => {
        return new Promise(async (resolve, reject) => {
            let couponcol = await db.get().collection(admincoll.COUPOUNCOL).find({}).toArray()
            if (couponcol.length == 0) {
                let coup = "mismatch"
                resolve(coup)
            } else {
                console.log("manu", couponcol.length)
                let flag = 0
                let globalproduct;
                let globalcode;
                let fg=0;

                let cpcol = await db.get().collection(admincoll.COLLECTDCOUPON).findOne({ userid: userid })

                if (cpcol == null) {
                    for (let i = 0; i < couponcol.length; i++) {
                        console.log(couponcol[i].coupouncode)
                        if (couponcol[i].coupouncode.toLowerCase() == id.toLowerCase()) {
                            flag = 1;
                            globalproduct = couponcol[i].coupounprice;
                            globalcode = couponcol[i].coupouncode;
                            break;
                        }
                    }
                    if (flag == 1) {
                        var coup = "match";
                        let coup1 = globalproduct;
                        let coup2 = globalcode;
                        let col = { coup, coup1, coup2 }
                        resolve(col)
                    } else {
                        let coup = "mismatch"
                        resolve(coup)
                    }
                } else {
                    for(let i=0;i<cpcol.couponcoll.length;i++){
                        if(cpcol.couponcoll[i].toLowerCase()==id.toLowerCase()){
                        fg=1;
                        break;
                        }
                    }
                    if(fg==1){
                        let coup = "mismatch"
                        resolve(coup)
                    }else{
                        for (let i = 0; i < couponcol.length; i++) {
                            console.log(couponcol[i].coupouncode)
                            if (couponcol[i].coupouncode.toLowerCase() == id.toLowerCase()) {
                                flag = 1;
                                globalproduct = couponcol[i].coupounprice;
                                globalcode = couponcol[i].coupouncode;
                                break;
                            }
                        }
                        if (flag == 1) {
                            var coup = "match";
                            let coup1 = globalproduct;
                            let coup2 = globalcode;
                            let col = { coup, coup1, coup2 }
                            resolve(col)
                        } else {
                            let coup = "mismatch"
                            resolve(coup)
                        }
                    }

                }


            }


        })
    },
    getSignUp: function (signupndetails) {
        console.log(signupndetails)
        return new Promise(async (resolve, reject) => {
            let alredysign1 = await db.get().collection(admincoll.USERCOLLECTION).find({}).toArray()
            if (alredysign1.length != 0) {
                let alredysign = await db.get().collection(admincoll.USERCOLLECTION).find({ Email: signupndetails.Email }).toArray();
                console.log("alreydy", alredysign)
                if (alredysign.length > 0) {
                    resolve({ status: false })
                } else {
                    signupndetails.Password = await bycrpt.hash(signupndetails.Password, 10);
                    let userobj = {
                        Name: signupndetails.Name,
                        Email: signupndetails.Email,
                        Phone: signupndetails.Phone,
                        Password: signupndetails.Password,
                        Status: "unblocked"
                    }
                    db.get().collection(admincoll.USERCOLLECTION).insertOne(userobj).then((data) => {
                        db.get().collection(admincoll.USERCOLLECTION).findOne({ Email: userobj.Email }).then((response) => {
                            resolve({ status: true, response })
                        })

                    })
                }
            } else {
                signupndetails.Password = await bycrpt.hash(signupndetails.Password, 10);
                let userobj = {
                    Name: signupndetails.Name,
                    Email: signupndetails.Email,
                    Phone: signupndetails.Phone,
                    Password: signupndetails.Password,
                    Status: "unblocked"
                }
                db.get().collection(admincoll.USERCOLLECTION).insertOne(userobj).then((data) => {
                    db.get().collection(admincoll.USERCOLLECTION).findOne({ Email: userobj.Email }).then((response) => {
                        resolve({ status: true, response })
                    })
                })
            }


        })

    },
    getLoginUp: function (logindetails) {
        var loginstatus = false;
        var response = {};
        return new Promise(async (resolve, reject) => {
            let user = await db.get().collection(admincoll.USERCOLLECTION).findOne({ Email: logindetails.Email })
            if (user) {
                bycrpt.compare(logindetails.Password, user.Password).then((status) => {
                    if (status) {
                        if (user.Status == true) {
                            response.block = true
                            resolve(response)
                        } else {
                            response.user = user;
                            response.status = true;
                            resolve(response);
                        }

                    } else {
                        response.status = false;
                        resolve(response)
                    }

                })

            } else {
                response.status = false;
                resolve(response);
            }
        })

    },
    forgotemailtocheck: (phone) => {
        return new Promise(async (resolve, reject) => {
            let usercollection = await db.get().collection(admincoll.USERCOLLECTION).findOne({ Phone: phone })
            if (usercollection != null) {
                resolve(phone)
            } else {
                let empty = 0
                resolve(empty)
            }
        })
    },
    forgotpassword: (body) => {
        return new Promise(async (resolve, reject) => {
            body.Password = await bycrpt.hash(body.Password, 10);
            await db.get().collection(admincoll.USERCOLLECTION).updateOne({ Phone: body.Phone }, {
                $set: { Password: body.Password }
            }).then(() => {
                resolve()
            })
        })
    },
    checkingotp: (body) => {
        return new Promise((resolve, reject) => {
            client.verify.v2.services('VAdf441f92f05f01adb6b4b5f53e64adae')
                .verificationChecks
                .create({ to: '+918136860631', code: body.otp })
                .then(verification_check => {
                    console.log(verification_check.status)
                    resolve(verification_check.status)
                });
        })
    },
    getRazorpay: function (orderid, costamount) {
        return new Promise((resolve, reject) => {
            console.log(costamount)
            instance.orders.create({
                amount: parseInt(costamount) * 100,
                currency: "INR",
                receipt: orderid,
                notes: {
                    key1: "value3",
                    key2: "value2"
                }
            }, function (err, order) {
                console.log(order)
                resolve(order)
            })

        })
    },
    verifypayments: (body) => {
        return new Promise((resolve, reject) => {
            const crypto = require('crypto');
            let hash = crypto.createHmac('sha256', 'WTS4y1ORhsbXGOS4eMzbPFir')
            console.log(body['response[razorpay_payment_id]'])
            hash.update(body['response[razorpay_order_id]'] + '|' + body['response[razorpay_payment_id]'])
            hash = hash.digest('hex')
            if (hash == body['response[razorpay_signature]']) {
                console.log("mached confirm")
                let status = "approved"
                resolve({ status })
            } else {
                let status = "notapproved"
                resolve({ status })

            }
        })
    },
    myorders: (body, product) => {
        return new Promise(async (resolve, rejects) => {
            let detailsid = new ObjectId()
            let details = {
                userid: body.orderid,
                detailsid: detailsid,
                Name: body['addressObj[Name]'],      // Updated to use correct key
                Address: body['addressObj[Address]'], // Updated to use correct key
                Number: body['addressObj[Number]'],   // Updated to use correct key
                Email: body['addressObj[Email]'],
                date: new Date(),
                Paymentmethod: "COD",
                status: "placed",
                totalamount: body.totalamount,
                totalproduct: product.map(product => ({
                    item: product.item,
                    quantity: product.quntity
                }))// Wrap the body.totalproduct in an array if needed

            }
            db.get().collection(admincoll.MYORDERS).insertOne(details).then((response) => {
                resolve(response)
            })
        })

    },
    myordersfind: (userid) => {
        return new Promise(async (resolve, rejects) => {
            let myoders = await db.get().collection(admincoll.MYORDERS).find({ userid: userid }).toArray()
            console.log("manu")
            console.log(myoders[0])
            resolve(myoders)
        })


    },
    findcartitem: (userid) => {
        return new Promise(async (resolve, reject) => {
            let mycartorder = await db.get().collection(admincoll.CART_COLLETION).findOne({ userid: userid })
            mycartorder = mycartorder.product;
            resolve(mycartorder)


        })

    },
    myorderproductfinding: (detailsid) => {
        return new Promise(async (resolve, reject) => {
            let myordertotalproduct = await db.get().collection(admincoll.MYORDERS).findOne({ detailsid: new ObjectId(detailsid) })
            if (myordertotalproduct != null) {
                let product = myordertotalproduct.totalproduct;
                resolve(product)
            } else {
                let product = "no id found"
                resolve(product)
            }
        })
    },
    orderdetailsgetting: (productdetails) => {
        return new Promise(async (resolve, reject) => {


            let prod = await db.get().collection(admincoll.DISCOUNT).find({}).toArray()
            prod = prod[0]

            if (prod != undefined) {
                let orderditem = [];
                for (let product of productdetails) {
                    let singleproduct = await db.get().collection(admincoll.DISCOUNT).aggregate([
                        {
                            $unwind: "$arr"
                        },
                        {
                            $match: {
                                "arr._id": new ObjectId(product.item)
                            }
                        }
                    ]).toArray();
                    if (singleproduct[0]) {
                        let { _id, name, price, catogory, discription, gender, brand, size, images, offer } = singleproduct[0].arr;

                        let orderedItemWithQuantity = {
                            _id,
                            name,
                            price,
                            catogory,
                            discription,
                            gender,
                            brand,
                            size,
                            images,
                            offer,
                            quantity: product.quantity // Assuming 'quantity' is a field in productdetails
                        };
                        orderditem.push(orderedItemWithQuantity)
                    }
                }

                resolve(orderditem)


            } else {
                let orderditem = [];
                for (let product of productdetails) {

                    let totalproducts = await db.get().collection(admincoll.productcolletion).findOne({ '_id': product.item })

                    if (totalproducts) {
                        let orderedItemWithQuantity = {
                            ...totalproducts,
                            quantity: product.quantity  // Assuming 'quantity' is a field in productdetails
                        };
                        orderditem.push(orderedItemWithQuantity)
                    }
                }
                console.log("manu", orderditem)
                resolve(orderditem)
            }

        })
    },
    cancelproduct: (id) => {
        return new Promise(async (resolve, reject) => {
            let orderdetails = await db.get().collection(admincoll.MYORDERS).findOne({ detailsid: new ObjectId(id) });
            if (orderdetails.Paymentmethod == "Razorpay") {
                let amount = orderdetails.totalamount;
                let paymentmethod = orderdetails.Paymentmethod;
                resolve(amount)
            } else {
                db.get().collection(admincoll.MYORDERS).deleteOne({ detailsid: new ObjectId(id) }).then(() => {
                    let amount = "notdefined"
                    resolve(amount)
                })
            }

        })
    },
    myorders2: (body, product) => {
        return new Promise(async (resolve, rejects) => {
            let detailsid = new ObjectId()
            let details = {
                userid: body['order[receipt]'],
                detailsid: detailsid,
                Name: body['addressObj[Name]'],      // Updated to use correct key
                Address: body['addressObj[Address]'], // Updated to use correct key
                Number: body['addressObj[Number]'],   // Updated to use correct key
                Email: body['addressObj[Email]'],
                date: new Date(),
                Paymentmethod: "Razorpay",
                status: "placed",
                totalamount: parseInt(body.amounts),
                totalproduct: product.map(product => ({
                    item: product.item,
                    quantity: product.quntity
                }))// Wrap the body.totalproduct in an array if needed
            }
            db.get().collection(admincoll.MYORDERS).insertOne(details).then((response) => {
                resolve(response)
            })

        })
    },
    walletamount: (amount, userid, id) => {
        return new Promise(async (resolve, rejects) => {
            let walletamount = await db.get().collection(admincoll.WALLET).findOne({ "walletdetails.userid": userid })
            console.log("walletamount not fund", walletamount)
            if (walletamount == null) {
                let walletdetails = {
                    userid: userid,
                    totalamount: amount,
                }

                db.get().collection(admincoll.WALLET).insertOne({ walletdetails }).then(() => {
                    db.get().collection(admincoll.MYORDERS).deleteOne({ detailsid: new ObjectId(id) }).then(() => {

                        resolve()
                    })
                })

            } else {
                db.get().collection(admincoll.WALLET).updateOne({ "walletdetails.userid": userid }, {
                    $inc: { "walletdetails.totalamount": +amount }
                }).then(() => {
                    db.get().collection(admincoll.MYORDERS).deleteOne({ detailsid: new ObjectId(id) }).then(() => {

                        resolve()
                    })
                })
            }

        })


    },
    findmywallet: (userid) => {
        return new Promise(async (resolve, rejects) => {
            let walletdetails = await db.get().collection(admincoll.WALLET).findOne({ "walletdetails.userid": userid })
            if (walletdetails == null) {
                let found = 0
                resolve(found)
            } else {
                let found = walletdetails.walletdetails.totalamount;
                console.log(found)
                console.log("is it undefined")
                resolve(found)
            }
        })
    },
    updatewalletbycouponamount: (amount, userid) => {
        return new Promise(async (resolve, rejects) => {
            let amounts = parseInt(amount)

            let walletamount = await db.get().collection(admincoll.WALLET).findOne({ "walletdetails.userid": userid })
            console.log("walletamount not fund", walletamount)
            if (walletamount == null) {
                let walletdetails = {
                    userid: userid,
                    totalamount: amounts,
                }

                db.get().collection(admincoll.WALLET).insertOne({ walletdetails }).then(() => {
                    resolve()
                })

            } else {
                db.get().collection(admincoll.WALLET).updateOne({ "walletdetails.userid": userid }, {
                    $inc: { "walletdetails.totalamount": +amounts }
                }).then(() => {
                    resolve()
                })
            }


        })
    },
    couponcollected: (userid, coupid) => {
        return new Promise(async (resolve, rejects) => {
            let couponused = await db.get().collection(admincoll.COLLECTDCOUPON).findOne({ userid: userid })
            let details = { userid: userid, couponcoll: [coupid] }

            if (couponused == null) {
                db.get().collection(admincoll.COLLECTDCOUPON).insertOne(details).then(() => {
                    resolve()
                })
            } else {
                db.get().collection(admincoll.COLLECTDCOUPON).updateOne({ userid: userid }, { $push: { couponcoll: coupid } }).then(() => {
                    resolve()
                })

            }
        })
    }
}