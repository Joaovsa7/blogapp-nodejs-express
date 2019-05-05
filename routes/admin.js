const express = require('express')
const router = express.Router()
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias')

router.get('/',(req ,res) => {
    res.render("admin/index")
})

router.get('/posts', (req, res) => {
    res.send('Página de posts')
})

router.get('/categorias', (req , res ) => {
    Categoria.find().sort({date: 'desc'}).then((categorias) => {
        res.render('admin/categorias', { categorias: categorias })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as categorias")
        res.redirect('/admin')
        console.log(err)
    })
})

router.get('/categorias/add', (req , res ) => {
    res.render("admin/addcategorias")
})

router.post('/categorias/nova', ( req , res ) => {
    
    var erros = []

    if(!req.body.nome && typeof req.body.nome === undefined || req.body.nome === null){
        erros.push({ texto: "Nome invalido" })
    }

    if(!req.body.slug && typeof req.body.slug === undefined || req.body.slug === null || req.body.slug === ""){
        erros.push({texto: "Slug invalido"})
    }

    if(req.body.nome.length < 3){
        erros.push({texto: 'Nome da categoria muito pequeno'})
    }

    if(erros.length > 0){
        res.render("admin/addcategorias", { erros: erros })
    }

    const novaCategoria = {
        nome: req.body.nome,
        slug: req.body.slug
    }

    new Categoria(novaCategoria).save()
    .then(() => {
        req.flash("success_msg", `A categoria ${req.body.nome} foi criada com sucesso`)
        res.redirect('/admin/categorias')
        console.log('Categoria salva com sucesso')
    }).catch((err) => {
        req.flash("error_msg", `Ocorreu um erro ao criar a categoria ${req.body.nome}`)
        res.redirect('/admin')
        console.log('erro ao salvar categoria' + err)
    })
})


module.exports = router