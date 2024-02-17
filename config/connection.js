const MongoClient = require('mongodb').MongoClient;

const mongo= {
  db: null,
}

module.exports.connect = function (done) {
  const url = 'mongodb://127.0.0.1:27017/';
  const dbName = 'newprj';

  let client = new MongoClient(url);
  
 return client.connect()
    .then(() => {
        
      mongo.db =client.db(dbName);
     
      console.log("Database connected successfully");
      
    })
    .catch((err) => {
      console.error("Failed to connect to the database:", err);
    
    });
}

module.exports.get=function(){
    return mongo.db;
}


