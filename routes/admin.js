const express = require('express')
const router = express.Router()
const mongoose = require('mongoose');
require('../models/Categoria');
const Categoria = mongoose.model('categorias')
require('../models/Postagem');
const Postagem = mongoose.model('postagens')


router.get('/',(req ,res) => {
    Postagem.find().sort({ date: 'desc'})
    .then((postagem) => {
        res.render("admin/index", { postagem: postagem})
    })
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

router.get("/postagens", ( req , res ) => {
    Postagem.find().populate("categoria").sort({data: "desc"})
    .then((postagens) => {
        res.render("admin/postagens", {postagens: postagens})
    })
    .catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar as postagens")
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/add", (req,res) => {
    Categoria.find()
    .then((categorias) => {
        res.render("admin/addpostagens", { categorias: categorias})
    })
    .catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o form")
        res.redirect('/admin')
    })
})

router.post("/postagens/nova", ( req , res ) => {
    let erros = []
    const { titulo, slug, descricao, categoria, conteudo, id } = req.body
    
    if(categoria == "0"){
        erros.push({ texto: 'Categoria inválida, registre uma categoria' })
    }
    if(erros.length > 0){
        res.render("admin/addpostagens", {erros: erros })
    }
    
    const novaPostagem = {
        titulo,
        descricao,
        conteudo,
        id,
        categoria,
        slug,
    }
    
    new Postagem(novaPostagem).save()
    .then(() => {
        req.flash("success_msg", `A postagem ${titulo} foi criada com sucesso`)
        res.redirect("/admin/postagens")
    })
    .catch((err) => {
        req.flash("error_msg", "Houve um erro para postar a postagem")
        res.redirect("/admin/postagens")
    })
})

router.get("/postagens/edit/:id", ( req , res ) => {
    Postagem.findOne({_id: req.params.id})
    .then((postagem) => {
        Categoria.find()
        .then((categorias) => {
            res.render("admin/editpostagens", {categorias: categorias, postagem: postagem})
        })
        .catch((err) => {
            req.flash("error_msg", "Houve ao carregar as categorias")
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve ao carregar o formulario de edicação de postagem")
        res.redirect("/admin/postagens")
    })
})

router.post("/postagens/edit", ( req , res ) => {
    Postagem.findOne({_id:req.body.id})
    .then((postagem) => {
        const { titulo, slug, descricao, categoria, conteudo } = req.body
        
        postagem.titulo = titulo
        postagem.slug = slug
        postagem.descricao = descricao
        postagem.categoria = categoria
        postagem.conteudo = conteudo

        postagem.save()
        .then(() => {
            req.flash("success_msg", "Postagem editada com sucesso")
            res.redirect("/admin/postagens")
        })
        .catch((err) => {
            console.log(err)
            req.flash("error_msg", `Houve um erro ao editar a postagem ${postagem.titulo}`)
            res.redirect("/admin/postagens")
        })
    })
})

router.get("/postagens/deletar/:id", ( req , res ) => {
    Postagem.remove({_id: req.params.id})
    .then(() => {
        req.flash("success_msg", "A postagem foi deletada com sucesso")
        res.redirect('/admin/postagens')
    }).catch((err) => {
        req.flash("error_msg", "Ocorreu um erro ao deletar a postagem")
        res.redirect('/admin/postagens')
        console.log(err)
    })
})

module.exports = router