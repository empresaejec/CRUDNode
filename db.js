//tentativa de tranformar em mais modulos o crud, porem nao deu certo

const MongoClient = require('mongodb').MongoClient 
const ObjectId = require('mongodb').ObjectID
const uri = "mongodb+srv://Tomao:tomao123@loginsystem-px6rr.mongodb.net/test?retryWrites=true&w=majority"

MongoClient.connect(uri, { useNewUrlParser: true }, (err, client) => {
  if(err) return console.log(err)
  this.db = client.db('loginsystem')

  /* app.listen(8001, ()=>{
      console.log('Server running on port 8001')
  }) */
})

module.exports = {MongoClient, ObjectId};