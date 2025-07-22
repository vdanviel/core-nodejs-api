import express from "express";
import { verifyJwt } from "../middleware/auth.js";
import { body, param, validationResult } from "express-validator";
import { FooController } from "../controller/fooController.js";

const fooRouter = express.Router();

fooRouter.get('/:id', verifyJwt, (req, res) => {
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

fooRouter.post('/register', [
    body('name').exists().withMessage("Nome é obrigatório.").notEmpty().withMessage("Preencha o nome."),
    body('description').exists().withMessage("Descrição é obrigatória.").notEmpty().withMessage("Preencha a descrição."),
    body('value').exists().withMessage("Valor é obrigatório.").notEmpty().withMessage("Preencha o valor."),
], verifyJwt, (req, res) => {
    const validate = validationResult(req);

    if (!validate.isEmpty()) {
        return res.status(400).send({
            missing: validate.array()
        });
    }

    FooController.register(req.body.name, req.body.description, req.body.value)
    .then(foo => {
        return res.status(200).send(foo);
    }).catch(error => {
        return res.status(500).send({ 
            error: error.message,
            trace: error.stack
        });
    });
});

fooRouter.put('/update/:id', [
    param('id').exists().withMessage("ID inválido.").notEmpty().withMessage("ID inválido."),
    body('name').exists().withMessage("Nome é obrigatório.").notEmpty().withMessage("Preencha o nome."),
    body('description').exists().withMessage("Descrição é obrigatória.").notEmpty().withMessage("Preencha a descrição."),
    body('value').exists().withMessage("Valor é obrigatório.").notEmpty().withMessage("Preencha o valor."),
    body('status').exists().withMessage("Status é obrigatório.").notEmpty().withMessage("Preencha o status."),
], verifyJwt, (req, res) => {
    const validate = validationResult(req);

    if (!validate.isEmpty()) {
        return res.status(400).send({
            missing: validate.array()
        });
    }

    FooController.update(req.params.id, req.body.name, req.body.description, req.body.value, req.body.status)
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
], verifyJwt, (req, res) => {
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
fooRouter.patch('/status/:id', [
    param('id').exists().withMessage("ID inválido.").notEmpty().withMessage("ID inválido."),
], verifyJwt, (req, res) => {
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