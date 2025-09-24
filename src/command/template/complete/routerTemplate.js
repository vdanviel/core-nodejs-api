import express from "express";

import { isAuth } from "../middleware/auth.js"; //para verificar se jwt é presente e válido...
import { checkScope } from "../middleware/scope.js"; //para verificar se o escopo do token jwt permite acessar a rota...
import { body, param, validationResult } from "express-validator"; // para validar os dados de entrada...

import { __TitleModuleName__Controller } from "../controller/__ModuleName__Controller.js";

const __ModuleName__Router = express.Router();

//listar o __ModuleName__
__ModuleName__Router.get('/', [isAuth, checkScope('read:__ModuleName__')], (req, res) => {

    __TitleModuleName__Controller.findAll()
    .then((__ModuleName__s) => {
        return res.send(__ModuleName__s);
    })
    .catch(error => {
        return res.status(500).send({ 
            error: error.message
        });
    });

});

__ModuleName__Router.get('/find/:id',[
    param('id').exists().withMessage("ID inválido.").notEmpty().withMessage("ID inválido."),
], [isAuth, checkScope('read:__ModuleName__')], (req, res) => {

    const validate = validationResult(req);

    if (validate.isEmpty() == false) {
        return res.send({
            missing: validate.array()
        });
    }

    __TitleModuleName__Controller.find(req.params.id)
    .then(__ModuleName__ => {       
        return res.send(__ModuleName__);
    }).catch(error => {
        return res.status(500).send({ 
            error: error.message,
            trace: error.stack
        });
    });

});

//registra o __ModuleName__
__ModuleName__Router.post('/register', [
    body('name').exists().withMessage("Nome é obrigatório.").notEmpty().withMessage("Nome não pode estar vazio."),
    body('description').exists().withMessage("Descrição é obrigatória.").notEmpty().withMessage("Descrição não pode estar vazia."),
    body('value').exists().withMessage("Valor é obrigatório.").notEmpty().withMessage("Valor não pode estar vazio.")
], [isAuth, checkScope('write:__ModuleName__')], (req, res) => {

    const validate = validationResult(req);

    if (validate.isEmpty() == false) {
        return res.send({
            missing: validate.array()
        });
    }

    __TitleModuleName__Controller.register(req.body.name,req.body.description,req.body.value)
    .then((__ModuleName__) => {
        return res.send(__ModuleName__);
    })
    .catch(error => {
        return res.status(500).send({ 
            error: error.message
        });
    });

});

__ModuleName__Router.put('/update/:id', [
    param('id').exists().withMessage("ID inválido.").notEmpty().withMessage("ID inválido."),
    body('name').exists().withMessage("Nome é obrigatório.").notEmpty().withMessage("Preencha o nome."),
    body('description').exists().withMessage("Descrição é obrigatória.").notEmpty().withMessage("Preencha a descrição."),
    body('value').exists().withMessage("Valor é obrigatório.").notEmpty().withMessage("Preencha o valor.")
], [isAuth, checkScope('update:__ModuleName__')], (req, res) => {

    const validate = validationResult(req);

    if (!validate.isEmpty()) {
        return res.status(400).send({
            missing: validate.array()
        });
    }

    __TitleModuleName__Controller.update(req.params.id, req.body.name, req.body.description, req.body.value)
    .then(__ModuleName__ => {
        return res.status(200).send(__ModuleName__);
    }).catch(error => {
        return res.status(500).send({ 
            error: error.message,
            trace: error.stack
        });
    });
});

__ModuleName__Router.delete('/delete/:id', [
    param('id').exists().withMessage("ID inválido.").notEmpty().withMessage("ID inválido."),
], [isAuth, checkScope('delete:__ModuleName__')], (req, res) => {

    const validate = validationResult(req);

    if (!validate.isEmpty()) {
        return res.status(400).send({
            missing: validate.array()
        });
    }

    __TitleModuleName__Controller.delete(req.params.id)
    .then((__ModuleName__) => {
        return res.status(200).send(__ModuleName__);
    }).catch(error => {
        return res.status(500).send({ 
            error: error.message,
            trace: error.stack
        });
    });
});

// Toggle status
__ModuleName__Router.patch('/toggle-status/:id', [
    param('id').exists().withMessage("ID inválido.").notEmpty().withMessage("ID inválido."),
], [isAuth, checkScope('update:__ModuleName__')], (req, res) => {
    
    const validate = validationResult(req);

    if (!validate.isEmpty()) {
        return res.status(400).send({
            missing: validate.array()
        });
    }

    __TitleModuleName__Controller.toggleStatus(req.params.id)
    .then(result => {
        return res.send(result);
    }).catch(error => {
        return res.status(500).send({ 
            error: error.message,
            trace: error.stack
        });
    });
});

export {__ModuleName__Router};