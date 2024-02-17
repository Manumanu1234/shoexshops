const db = require("../config/connection")
const admincoll = require('../collectionname/collnamesqury');
const { response, set } = require("../app");
var ObjectId = require("mongodb").ObjectId;
var bcrypt = require("bcrypt")
module.exports = {

  addtoproduct: function addtoproduct(body, callback) {
    return new Promise((resolve, reject) => {

      db.get().collection(admincoll.productcolletion).insertOne(body).then((result) => {
        console.log("completed")

        var id = result.insertedId
        var gotid = id.toString()
        callback(gotid);
      })

    })


  },

  getAllproduct: () => {
    return new Promise(async (resolve, reject) => {
      const totalproduct = await db.get().collection(admincoll.productcolletion).find({}).toArray();


      resolve(totalproduct)
    })
  },
  deleteproduct: (prodid) => {
    return new Promise((resolve, reject) => {
      db.get().collection(admincoll.productcolletion).deleteOne({ _id: new ObjectId(prodid) }).then(() => {
        resolve();
      })
    })

  },
  editbutton: (editbutonid) => {
    return new Promise((resolve, reject) => {
      db.get().collection(admincoll.productcolletion).findOne({ _id: new ObjectId(editbutonid) }).then((response) => {
        resolve(response);
      })
    })
  },
  editproduct: (editproductid, newbody) => {
    console.log(newbody.name)
    console.log(newbody.images)
    return new Promise((resolve, reject) => {
      db.get().collection(admincoll.productcolletion).updateOne({ _id: new ObjectId(editproductid) }, {
        $set: {
          name: newbody.name,
          price: newbody.price,
          discription: newbody.discription,
          gender: newbody.gender,
          brand: newbody.brand,
          size: newbody.size,
          images: newbody.images
        }

      }).then(() => {
        resolve()
      })


    })

  },
  addBanner: (banner) => {
    return new Promise(async (resolve, reject) => {
      let bannercol = await db.get().collection(admincoll.BANNER_COLLECTION).find({}).toArray();


      let bannerid = banner.bannerimage;
      bannerid = bannerid.toString()
      var objbannerid = {
        bannerid: bannerid
      }

      db.get().collection(admincoll.BANNER_COLLECTION).insertOne(objbannerid).then((response) => {

      })
      resolve(response);






    })
  },
  getbanner: () => {
    return new Promise(async (resolve, reject) => {
      let totalbanner = await db.get().collection(admincoll.BANNER_COLLECTION).find({}).toArray()
      console.log(totalbanner)
      console.log("ok")
      resolve(totalbanner)
    })
  },
  deletebanner: (bannerid) => {
    return new Promise((resolve, reject) => {
      db.get().collection(admincoll.BANNER_COLLECTION).deleteOne({ _id: new ObjectId(bannerid) }).then(() => {
        resolve()
      })
    })

  },
  deletebanneroffers: (bannerofferid) => {
    return new Promise((resolve, reject) => {
      db.get().collection(admincoll.UPDATE_OFFERS).deleteOne({ _id: new ObjectId(bannerofferid) }).then(() => {
        resolve()
      })
    })
  },

  updateoffers: (nameimage) => {
    return new Promise((resolve, reject) => {
      var bannerobj = {
        nameimage: nameimage
      }
      db.get().collection(admincoll.UPDATE_OFFERS).insertOne(bannerobj).then(() => {
        resolve()
      })
    })
  },

  findoffers: () => {
    return new Promise(async (resolve, reject) => {
      let coll = await db.get().collection(admincoll.UPDATE_OFFERS).find({}).toArray()
      console.log(coll[0])
      resolve(coll)

    })
  },
  featuredproductlist: (proid) => {
    return new Promise(async (resolve, reject) => {
      let totalcolloftheproduct = await db.get().collection(admincoll.productcolletion).findOne({ _id: new ObjectId(proid) })

      let totl = {
        name: totalcolloftheproduct.name,
        image: totalcolloftheproduct.images,
        price: totalcolloftheproduct.price
      }
      db.get().collection(admincoll.FEATURED_PRODUCTL).insertOne(totl).then(() => {
        resolve(totalcolloftheproduct);
      })
    })

  },
  findfeturedproduct: () => {
    return new Promise(async (resolve, reject) => {
      let total = await db.get().collection(admincoll.FEATURED_PRODUCTL).find({}).toArray()
      resolve(total)
    })
  },

  removebookmark: (id) => {
    return new Promise((resolve, reject) => {
      db.get().collection(admincoll.FEATURED_PRODUCTL).deleteOne({ _id: new ObjectId(id) }).then((response) => {
        resolve(response)
      })
    })

  },
  offercatogorycolecting: () => {
    return new Promise(async (resolve, reject) => {
      const collection = await db.get().collection(admincoll.productcolletion).find({}).toArray();
      let collcatogoryonly = new Set(collection.map((product) => product.catogory))
      let cons = [...collcatogoryonly]
      console.log(cons)
      resolve(cons)

    })
  },
  offerupdate: (body) => {
    return new Promise(async (resolve, reject) => {
      let discontprice = parseInt(body.discountprice)
      let convertpercentagetoprice = discontprice / 100;

      const collection = await db.get().collection(admincoll.productcolletion).find({}).toArray();
      let collection1 = await db.get().collection(admincoll.DISCOUNT).find({}).toArray();

      let alredyexisting = await db.get().collection(admincoll.OFFANDPRICE).find({}).toArray()
      if (alredyexisting.length != 0) {
        alredyexisting = alredyexisting[0];

        var editalredy = await alredyexisting.array.map((elem) => {
          return elem.body
        })
        console.log(editalredy);
      }







      collection1 = collection1[0];

      console.log(convertpercentagetoprice)

      let arr = [];




      if (collection1 == null) {
        for (var i = 0; i < collection.length; i++) {
          if (collection[i].catogory == body.catogory) {
            var update1 = collection[i].price * convertpercentagetoprice;
            collection[i].price = collection[i].price - Math.round(update1);
            collection[i].offer = "offeradded";
            arr.push(collection[i])
          } else {
            arr.push(collection[i])
          }
        }
        await db.get().collection(admincoll.DISCOUNT).insertOne({ arr })
        resolve(arr)
      } else {
        const productCategory = body.catogory;
        const categoryMatch = editalredy.some(category => category === productCategory);


        if (categoryMatch) {
          let alredyofferadded = 1;
          resolve(alredyofferadded)

        } else {
          for (var i = 0; i < collection1.arr.length; i++) {
            if (collection1.arr[i].catogory == body.catogory) {
              var update1 = collection1.arr[i].price * convertpercentagetoprice;
              collection1.arr[i].price = collection1.arr[i].price - Math.round(update1);
              collection1.arr[i].offer = "offeradded";
              arr.push(collection1.arr[i])
            } else {
              arr.push(collection1.arr[i])
            }
          }
          console.log("now item come")
          console.log(arr)

          await db.get().collection(admincoll.DISCOUNT).deleteMany();
          await db.get().collection(admincoll.DISCOUNT).insertOne({ arr })

          resolve(arr)
        }


      }




    })
  },
  offerupdate1: (() => {
    return new Promise(async (resolve, reject) => {

      var sortproduct = await db.get().collection(admincoll.DISCOUNT).find({}).toArray()

      if (sortproduct.length == 0) {
        resolve(0)
      } else {
        resolve(sortproduct[0]);
      }

    })
  }),

  offerandprice: ((body, price) => {
    return new Promise(async (resolve, reject) => {
      let array = []

      let existingDoc = await db.get().collection(admincoll.OFFANDPRICE).findOne({});
      var finding = await db.get().collection(admincoll.OFFANDPRICE).find({}).toArray()
      finding = finding[0]
      console.log(finding)
      if (!existingDoc) {
        // No document exists, create a new one with an array
        await db.get().collection(admincoll.OFFANDPRICE).insertOne({ array: [{ body, price }] });
        resolve();
      } else {
        let existingelem = finding.array.findIndex(element => element.body == body);
        if (existingelem != -1) {
          await db.get().collection(admincoll.OFFANDPRICE).updateOne({ "array.body": body }, { $set: { "array.$.body": body, "array.$.price": price } })
          console.log("yewh boy complete")
          resolve()
        } else {
          // Document exists, push a new element into the 'array'
          await db.get().collection(admincoll.OFFANDPRICE).updateOne({}, { $push: { array: { body, price } } });
          resolve();
        }
      }
    })

  }),

  offercalling: (() => {
    return new Promise(async (resolve, reject) => {

      let collecte1 = await db.get().collection(admincoll.OFFANDPRICE).find({}).toArray()
      console.log(collecte1)

      resolve(collecte1[0])


    })
  }),



  offerremoving: (body, price) => {
    return new Promise(async (resolve, reject) => {
      let discountcoll = await db.get().collection(admincoll.DISCOUNT).find({}).toArray()
      discountcoll = discountcoll[0]
      let arr = []
      let convertpercentagetoprice = price / 100;

      for (var i = 0; i < discountcoll.arr.length; i++) {
        if (discountcoll.arr[i].catogory == body) {
          discountcoll.arr[i].price = Math.round(discountcoll.arr[i].price / (1 - convertpercentagetoprice));
          discountcoll.arr[i].offer = "offerremoved";
          arr.push(discountcoll.arr[i])
        } else {
          arr.push(discountcoll.arr[i])
        }
      }
      console.log("now item come")
      console.log(arr)

      await db.get().collection(admincoll.DISCOUNT).deleteMany();
      await db.get().collection(admincoll.DISCOUNT).insertOne({ arr })

      resolve(arr)
    })
  },
  removingfromoffandprice: (body) => {
    return new Promise(async (resolve, reject) => {
      let collectionsofoffandprice = await db.get().collection(admincoll.OFFANDPRICE).find({}).toArray();
      collectionsofoffandprice = collectionsofoffandprice[0];

      for (let i = 0; i < collectionsofoffandprice.array.length; i++) {
        if (collectionsofoffandprice.array[i].body == body) {
          await db.get().collection(admincoll.OFFANDPRICE).updateOne({ "array.body": body }, { $pull: { "array": { body: body } } }).then(() => {
            resolve()
          })
        } else {
          console.log("not product deleted")
          resolve()
        }
      }
    })
  },
  couponcollection: (body) => {
    return new Promise((resolve, reject) => {

      let coupouncode = body.couponcode
      let coupounprice = body.couponprice
      let coupoundate = body.appt;
      db.get().collection(admincoll.COUPOUNCOL).insertOne({ coupouncode, coupounprice, coupoundate }).then(() => {
        resolve()
      })

    })
  },

  couponcalling: () => {
    return new Promise(async (resolve, reject) => {
      let currentDate = new Date();
      let totalColCoupon = await db.get().collection(admincoll.COUPOUNCOL).find({}).toArray();

      for (let elem of totalColCoupon) {
        if (new Date(elem.coupoundate) < currentDate) {
          await db.get().collection(admincoll.COUPOUNCOL).deleteOne(
            { "_id": elem._id }
          ).then(() => {
            resolve()
          });
        } else {
          console.log("time is not expired");
        }
      }
    })
  },
  coupongetting: () => {
    return new Promise(async (resolve, reject) => {
      let collectioncoupon = await db.get().collection(admincoll.COUPOUNCOL).find({}).toArray()

      if (collectioncoupon.length == 0) {
        let total = 0
        resolve(total)
      } else {
        resolve(collectioncoupon);
      }
    })
  },

  adminlogin: () => {
    return new Promise(async (resolve, reject) => {
      let pass = await bcrypt.hash('manukuttan', 10)
      console.log(pass)
      var adminobj = {
        name: "manu",
        Email: "manumanuvkm123@gmail.com",
        Pass: pass
      }
      db.get().collection("hardcode").insertOne(adminobj).then(() => {
        resolve()
      })

    })



  },
  veryfiylogin: (body) => {
    return new Promise(async (resolve, reject) => {


      let adminobjct = await db.get().collection("hardcode").findOne({ Email: body.email })
      if(adminobjct==null){
        resolve({ status: false })
      }else{
           console.log('body.pass:', body.password);
      console.log('adminObject.Pass:', adminobjct.Pass);

      console.log('emailmached')
      if (adminobjct) {
        bcrypt.compare(body.password, adminobjct.Pass).then((status) => {
          console.log(status)
          if (status) {
            resolve({ status: true })
          } else {
            resolve({ status: false })
          }
        })
      } else {
        resolve({ status: false })
      }
      }


   
    })
  },

  //for admin panal userdeteials

  allorderfind: () => {
    return new Promise(async (resolve, rejects) => {
      let myoders = await db.get().collection(admincoll.MYORDERS).find({}).toArray()
      console.log("manu")

      resolve(myoders)
    })


  },

  orderdetailsgettingforlistigalldocuments: (productdetails) => {
    return new Promise(async (resolve, reject) => {


      let prod = await db.get().collection(admincoll.DISCOUNT).find({}).toArray()
      prod = prod[0]

      if (prod != undefined) {
       

      let editproduct=await db.get().collection(admincoll.MYORDERS).aggregate([
          {
            $unwind: "$totalproduct" // Unwind the totalproduct array to work with individual elements
          },
          {
            $lookup: {
              from: admincoll.DISCOUNT, // Replace "foreignCollection" with the actual name of your foreign collection
              localField: "totalproduct.item",
              foreignField: "arr._id",
              as: "matchedProducts"
            }
          },
          {
            $group: {
              _id: "$_id",
              userid: { $first: "$userid" },
              detailsid: { $first: "$detailsid" },
              Name: { $first: "$Name" },
              Address: { $first: "$Address" },
              Number: { $first: "$Number" },
              Email: { $first: "$Email" },
              date: { $first: "$date" },
              Paymentmethod: { $first: "$Paymentmethod" },
              status: { $first: "$status" },
              totalamount: { $first: "$totalamount" },
              totalproduct: { $push: "$totalproduct" },
              matchedProducts: { $push: { $arrayElemAt: ["$matchedProducts", 0] } }
            }
          }
        ]).toArray()
        
 console.log(editproduct)
     //   resolve(singleproduct[0])


      } else {
        let orderditem = [];
        for (let product of productdetails) {
          for (let item of product.totalproduct) {
            let totalproducts = await db.get().collection(admincoll.productcolletion).findOne({ '_id': new ObjectId(item.item) })
            if (totalproducts) {
              let orderedItemWithQuantity = {
                ...totalproducts,
                quantity: product.quantity  // Assuming 'quantity' is a field in productdetails
              };
              orderditem.push(orderedItemWithQuantity)
            }
          }
        }
        console.log("manu", orderditem)
        resolve(orderditem)
      }

    })
  },
  findinginvoice:(body)=>{
    return new Promise(async(resolve,reject)=>{
      let productcollection=await db.get().collection(admincoll.MYORDERS).findOne({_id:new ObjectId(body)})
      if(productcollection){
        let product=productcollection.totalproduct;
        resolve({product,productcollection})
        console.log("find")
      }else{
        console.log("could't find")
      }
    })
  },
  findalluser:()=>{
    return new Promise(async(resolve,reject)=>{
      let totaluser=await db.get().collection(admincoll.USERCOLLECTION).find({}).toArray()
      if(totaluser.length ==0){
        let totaluser1=0;
        resolve(totaluser1)
      }else{
        resolve(totaluser)
      }
    })
  },
  blockuser:(id)=>{
    return new Promise(async(resolve,reject)=>{
      let totaluser=await db.get().collection(admincoll.USERCOLLECTION).findOne({_id:new ObjectId(id)})
      if(totaluser.Status ==false){
          await db.get().collection(admincoll.USERCOLLECTION).updateOne({_id:new ObjectId(id)},{
        $set:{
          _id:totaluser._id,
          Name:totaluser.Name,
          Phone:totaluser.Phone,
          Password:totaluser.Password,
          Status:true
        }
      }).then(()=>{
        resolve()
      })
      }else{
        await db.get().collection(admincoll.USERCOLLECTION).updateOne({_id:new ObjectId(id)},{
          $set:{
            _id:totaluser._id,
            Name:totaluser.Name,
            Phone:totaluser.Phone,
            Password:totaluser.Password,
            Status:false
          }
        }).then(()=>{
          resolve()
        })
      }
    
    })
  },
  updatestatus:(id,value)=>{
    return new Promise((resolve,reject)=>{
      db.get().collection(admincoll.MYORDERS).updateOne({_id:new ObjectId(id)},{
        $set:{"status":value}
      }).then(()=>{
        resolve()
      })
    })
  }
}
