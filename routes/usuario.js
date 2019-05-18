const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const passport = require("passport")


router.get('/registro', ( req, res ) => {
    res.render("usuarios/registro")
})

router.post("/registro", (req,res) => {
    let erros = []
    const { nome, email, senha, senha2 } = req.body

    if(!nome || typeof nome === undefined || nome === null){
        erros.push({texto: "Nome invalido"})
    }
    if(!email || typeof email === undefined || email === null){
        erros.push({texto: "Email invalido"})
    }
    if(!senha || typeof senha === undefined || senha === null){
        erros.push({texto: "Senha invalido"})
    }
    if(senha.length < 4){
        erros.push({texto: "Senha muito curta"})
    }
    if(senha !== senha2){
        erros.push({texto: "As senhas não conferem"})
    }

    if(erros.length > 0){
        res.render("usuarios/registro", {erros})
    }
    else {
        Usuario.findOne({email: email})
        .then((usuario) => {
            if(usuario){
                req.flash("error_msg", "Já existe uma conta com este e-mail")
                return res.redirect('/usuarios/registro')
            } else {

                const novoUsuario = new Usuario({
                    nome: nome,
                    email: email,
                    senha: senha
                })

                bcrypt.genSalt(10, (erro, salt) => {
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) => {
                       if(erro){
                            req.flash("error_msg", "Houve um erro na criação do usuario")
                            res.redirect('/')
                       }
                       novoUsuario.senha = hash
                       novoUsuario.save().then(() => {
                           req.flash("success_msg", "Usuario criado com sucesso")
                           res.redirect('/')
                       })
                       .catch((err) => {
                           console.log(err)
                           console.log('catch')
                           req.flash("error_msg", "Houve um erro ao criar o usuario")
                           res.redirect('/usuarios/registro')
                       })
                    })
                })

            }
        })
        .catch((err) => {
            req.flash("error_msg", "Houve um erro interno")
            res.redirect('/')
        })
    }

})

router.get('/login', ( req, res ) => {
    res.render("usuarios/login")
})

router.post("/login", (req,res, next) => {
    
    passport.authenticate("local", {
        successRedirect: "/",
        failureRedirect: '/usuarios/login',
        failureFlash: true
    })(req, res, next)
})

module.exports = router