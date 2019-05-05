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
        return res.render("admin/addcategorias", { erros: erros })
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
        res.redirect('/admin/categorias')
        console.log('erro ao salvar categoria' + err)
    })
})

router.get("/categorias/edit/:id", (req, res) => {
    Categoria.findOne({_id: req.params.id })
    .then((categoria) => {
        res.render("admin/editcategorias", { categoria: categoria })
    }).catch((err) => {
        req.flash("error_msg", "Esta categoria não existe")
        req.redirect('/admin/categorias')
    })
})

router.post("/categorias/edit", (req, res) => {

    let errosCategorias = []
    let reqFlashError = ""
    if(req.body.nome === "" || req.body.nome.length < 3){
        reqFlashError = `O nome da categoria ${req.body.nome} está invalido` 
        errosCategorias.push({texto: reqFlashError})
    }
    if(req.body.slug === "" || req.body.slug.length < 3){
        reqFlashError = `O slug da categoria ${req.body.slug} está invalido` 
        errosCategorias.push({texto: reqFlashError})
    }
    if(errosCategorias.length > 0){
        req.flash("error_msg",  `${reqFlashError}`)
        res.redirect("/admin/categorias")
    }

    Categoria.findOne({_id: req.body.id })
    .then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "categoria editada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((err) => {
            console.log(err)
            req.flash("error_msg", "Houve um erro ao salvar a edição")
            res.redirect('/admin/categorias')
        })
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Houve um erro ao editar a categoria")
        res.redirect('/admin/categorias')
    })
})

router.post("/categorias/deletar", (req, res) => {
    Categoria.remove({ _id: req.body.id })
    .then(() => {
        req.flash("success_msg", "Categoria deletada com sucesso")
        res.redirect("/admin/categorias")
    }).catch((err) => {
        res.flash("error_msg", "houve um erro ao deletar a categoria")
        res.redirect("/admin/categorias")
    })
})


module.exports = router