import express from "express";
import { isAuth } from "../middleware/auth.js";
import { checkScope } from "../middleware/scope.js";
import { body, param, validationResult } from "express-validator";
import { FooController } from "../controller/fooController.js";

const fooRouter = express.Router();

//listar o foo
fooRouter.get('/', [isAuth, checkScope('read:foo')], (req, res) => {

    FooController.findAll()
    .then((foos) => {
        return res.send(foos);
    })
    .catch(error => {
        return res.status(500).send({ 
            error: error.message
        });
    });

});

fooRouter.get('/find/:id',[
    param('id').exists().withMessage("ID inválido.").notEmpty().withMessage("ID inválido."),
], [isAuth, checkScope('read:foo')], (req, res) => {

    FooController.find(req.params.id)
    .then(foo => {       
        return res.send(foo);
    }).catch(error => {
        return res.status(500).send({ 
            error: error.message,
            trace: error.stack
        });
    });

});

//registra o foo
fooRouter.post('/register', [
    body('name').exists().withMessage("Nome é obrigatório.").notEmpty().withMessage("Nome não pode estar vazio."),
    body('description').exists().withMessage("Descrição é obrigatória.").notEmpty().withMessage("Descrição não pode estar vazia."),
    body('value').exists().withMessage("Valor é obrigatório.").notEmpty().withMessage("Valor não pode estar vazio.")
], [isAuth, checkScope('write:foo')], (req, res) => {

    FooController.register(req.body.name,req.body.description,req.body.value)
    .then((foo) => {
        return res.send(foo);
    })
    .catch(error => {
        return res.status(500).send({ 
            error: error.message
        });
    });

});

fooRouter.put('/update/:id', [
    param('id').exists().withMessage("ID inválido.").notEmpty().withMessage("ID inválido."),
    body('name').exists().withMessage("Nome é obrigatório.").notEmpty().withMessage("Preencha o nome."),
    body('description').exists().withMessage("Descrição é obrigatória.").notEmpty().withMessage("Preencha a descrição."),
    body('value').exists().withMessage("Valor é obrigatório.").notEmpty().withMessage("Preencha o valor.")
], [isAuth, checkScope('update:foo')], (req, res) => {
    const validate = validationResult(req);

    if (!validate.isEmpty()) {
        return res.status(400).send({
            missing: validate.array()
        });
    }

    FooController.update(req.params.id, req.body.name, req.body.description, req.body.value)
    .then(foo => {
        return res.status(200).send(foo);
    }).catch(error => {
        return res.status(500).send({ 
            error: error.message,
            trace: error.stack
        });
    });
});

fooRouter.delete('/delete/:id', [
    param('id').exists().withMessage("ID inválido.").notEmpty().withMessage("ID inválido."),
], [isAuth, checkScope('delete:foo')], (req, res) => {
    const validate = validationResult(req);

    if (!validate.isEmpty()) {
        return res.status(400).send({
            missing: validate.array()
        });
    }

    FooController.delete(req.params.id)
    .then((foo) => {
        return res.status(200).send(foo);
    }).catch(error => {
        return res.status(500).send({ 
            error: error.message,
            trace: error.stack
        });
    });
});

// Toggle status
fooRouter.patch('/toggle-status/:id', [
    param('id').exists().withMessage("ID inválido.").notEmpty().withMessage("ID inválido."),
], [isAuth, checkScope('update:foo')], (req, res) => {
    const validate = validationResult(req);

    if (!validate.isEmpty()) {
        return res.status(400).send({
            missing: validate.array()
        });
    }

    FooController.toggleStatus(req.params.id)
    .then(result => {
        return res.send(result);
    }).catch(error => {
        return res.status(500).send({ 
            error: error.message,
            trace: error.stack
        });
    });
});

export {fooRouter};