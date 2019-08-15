//era pra ser usado na autenticaçao, as foi cortado devido a bugs
//acabou que deu certo sem ele e as estrategias do passport-local


const bcrypt = require('bcryptjs')  
const LocalStrategy = require('passport-local').Strategy
 
module.exports = function(passport){
   //configuraremos o passport aqui
   function findUser(email, callback){
       db.collection('data').findOne({'email': email}, function(err, doc){
           callback(err, doc);
       });
   }
   function findUserById(id, callback){
       const ObjectID = require('mongodb').ObjectId;
       db.collection('data').findOne({_id: ObjectID(id)}, (err, doc) => {
           callback(err, doc);
       });
   }
   passport.serializeUser(function(user, done){
       done(null, user._id);
   });
   passport.deserializeUser(function(id, done){
       findUserById(id, function(err, user){
           done(err, user);
       });
   });
   passport.use(new LocalStrategy( {
       emailField: 'email',
       passwordField: 'password'
   },
   (email, password, done) => {
       findUser(email, (err, user) => {
           if (err) { return done(err) }
           
           //usuario inexistente
           if (!user){ 
                console.log('usuario ´r inexistente')
               return done(null, false) 
            }
           
           //comparando as senhas
           bcrypt.compare(req.body.password, user.password, (err, isValid) => {
               if (err){ 
                console.log('erro')
                return done(err) }
               if (!isValid){ return done(null, false) }
               return done(null, user)
           })
       })
   }
   ));
}