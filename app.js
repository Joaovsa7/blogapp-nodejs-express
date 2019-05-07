//Carregando os modulos necessarios
const express = require('express');
const handlebars = require('express-handlebars');
const bodyParser = require('body-parser');
const mongoose = require('mongoose')
const app = express();
const admin = require("./routes/admin")
const path = require("path")
const session = require('express-session')
const flash = require('connect-flash')

//model de postagens
require('./models/Postagem')
const Postagem = mongoose.model('postagens')
// const mongoose = require("mongoose")

// Configurações
    //Sessao
    app.use(session({ 
        secret: 'cursodenode',
        resave: true,
        saveUninitialized: true
    }))
    app.use(flash())

    //Middleware

    app.use((req, res, next) => {
        res.locals.success_msg = req.flash("success_msg")
        res.locals.error_msg = req.flash("error_msg")
        next()
    })

    // Body Parser
        app.use(bodyParser.urlencoded( { extended: true }))
        app.use(bodyParser.json())
    // Handlebars
        app.engine('handlebars', handlebars({ defaultLayout: 'main' }))
        app.set('view engine', 'handlebars')
    
    // Mongoose
        mongoose.Promise = global.Promise;
        mongoose.connect('mongodb://localhost/blogapp')
        .then(() => {
            console.log('Conectado com sucesso')
        }).catch((err) => {
            console.log('Erro ao se conectar' + err)
        })

    // Public
        app.use(express.static(path.join(__dirname, 'public')))
        app.use((req, res, next) => {
            console.log('oi eu sou um middleware e li tudo do codigo antes de passar por vc')
            next();
        })
// Rotas
    app.get('/', (req, res) => {
        Postagem.find().populate("categoria")
        .sort({ data: "desc"}).then((postagem) => {
            res.render("index", { postagem: postagem })
        })
        .catch((err) => {
            console.log(err)
            req.flash("error_msg", "Ocorreu um erro no loading das postagens")
            res.redirect('/404')
        })
    })
    app.get('/404', ( req , res) => {
        res.send('erro 404')
        setTimeout(() => {
            res.redirect('/')
        }, 3000);
    })
    app.get('/postagem/:slug', (req, res) => {
        Postagem.findOne({ slug: req.params.slug })
        .then((postagem) => {
            if(postagem){
                res.render("postagens/index", { postagem: postagem })
            }
            else {
                req.flash("error_msg", "Ocorreu um erro interno")
                res.redirect('/')
            }
        })
        .catch((err) => {
            console.log(err)
            res.redirect('/')
        })
    })


    app.use('/admin', admin)

//outros


const PORT = 3001
app.listen(PORT, () => {
    console.log('servidor rodando na porta 3001')
})