const bcrypt = require('bcryptjs') 
const MongoClient = require('mongodb').MongoClient 
const ObjectId = require('mongodb').ObjectID
const uri = "mongodb+srv://Tomao:tomao123@loginsystem-px6rr.mongodb.net/test?retryWrites=true&w=majority"

const express = require('express')

const bodyParser = require('body-parser')

const app = express()

const passport = require('passport')
const session = require('express-session')
const MongoStore = require('connect-mongo')(session)

const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.live.com", //no caso, testado com o hotmail
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
        user: "seu email", //user do email
        pass: "insira sua senha aqui" //senha do email
    },
    tls: { rejectUnauthorized: false }
});

MongoClient.connect(uri, { useNewUrlParser: true }, (err, client) => {
    if(err) return console.log(err)
    db = client.db('loginsystem')// banco utilizado
  
     app.listen(8001, ()=>{
        console.log('Server running on port 8001')
    }) 
  })

app.use(bodyParser.urlencoded({ extended: true}))//urlencoded diz as parser para extrair dados do elemmento form e adicionalos a body

//require('./auth')(passport);
app.use(session({
    Store: new MongoStore({
    db:  'loginsystem',
    port: 8001, //port utilizado
    url: uri, // uri é a url criada do banco
    ttl:30 * 60 // 30 minutos de sessao    
    }),
    secret: 'null', //configure um segredo seu aqui, deixei null por nao ter necessidade
    resave: false,
    saveUninitialized: false
}))
app.use(passport.initialize());
app.use(passport.session());

var BCRYPT_SALT_ROUNDS = 12;//12 caracteres de salt utilizados na criptografia

app.set('view engine', 'ejs')
//ROTAS
//----
//Rota para salvar dados no banco/página principal
app.route('/')
.get((req,res)=>{
    res.render('index.ejs')
    var cursor = db.collection('data').find()
})

app.route('/show')
.get( (req, res) => {
    db.collection('data').find().toArray((err, results)=> {
        if (err) return console.log(err)
        res.render('show.ejs', {email: req.body.email,  data: results})
    })
})
.post((req, res) => {
    var name = req.body.name;
    var surname = req.body.surname;
    var email = req.body.email;
    var password = req.body.password;

    bcrypt.hash(password, BCRYPT_SALT_ROUNDS, (err, hashedPassword) => {
        db.collection('data').insertOne({
            name: name, 
            surname: surname, 
            email: email, 
            password: hashedPassword
        }) .then((data) => {
                if(data){
                    console.log('salvo no banco de dados')
                    res.redirect('/show');
                }
            });
    });  
});
//Rota para edição de dados do cadastro
app.route('/edit/:id')
.get((req, res) => {
    var id = req.params.id

    db.collection('data').find(ObjectId(id)).toArray((err, result) => {
        if (err) return res.send(err)
        res.render('edit.ejs', { data: result })
    })
})
.post((req, res) => {
    var id = req.params.id
    var name = req.body.name
    var surname = req.body.surname
    var email = req.body.email

    db.collection('data').updateOne({_id: ObjectId(id)},{
        $set: {
            name: name,
            surname: surname,
            email: email
        }
    }, (err, result) => {
        if (err) return res.send(err)
        res.redirect('/show')
        console.log('Atualizado no banco de dados')
    })
})
//Rota para deletar dados do cadastro
app.route('/delete/:id')
.get((req, res) => {
    var id = req.params.id

    db.collection('data').deleteOne({_id: ObjectId(id)}, (err, result) => {
        if (err) return res.send(500, err)
        console.log('Deletado do Banco de dados')
        res.redirect('/show')
    })
})
//Rota para Login
app.route('/login')
.get((req,res) => {
    if (req.query.fail){
        res.render('login.ejs', {message: 'Usuario e/ou senha incorretos!'});
    }
    else 
        res.render('login.ejs', {message: null});    
})
.post((req, res) => {
    var email = req.body.email

    db.collection('data').findOne({ email: email })
    .then((user) => {
        if (!user){
            console.log('email nao encontrado');
            res.redirect('/login');
        }else {
            //compare do bcrypt compara os hashs diretamente
            bcrypt.compare(req.body.password, user.password, (err, result) => {
                if (result == true) {
                    console.log('login feito com sucesso!');
                    res.redirect('/show');
                } else {
                 console.log('senha incorreta');
                 res.redirect('/login');
                }
            });
        }
    });
    
});
//rota para enviar email
app.route('/email/:id')
.get((req, res) => {
    var id = req.params.id

    db.collection('data').findOne({_id: ObjectId(id)})
    .then((user) => {
        if (!user){
            console.log('id nao encontrado');
            res.redirect('/show');
        }else {
            const mailOptions = {
                from: 'fetomao@hotmail.com',//email remetente
                to: user.email, //email destinatario, pode ser um array
                subject: 'E-mail enviado usando Node!',// assunto
                text: 'Ao tilápia'// texto do email, pode ser substituido por tags html
            };
            transporter.sendMail(mailOptions, function(error, info){
                if (error) {
                  console.log(error);
                } else {
                  console.log('Email enviado: ' + info.response);
                  res.redirect('/show');
                }
            });
        }
    });
})
