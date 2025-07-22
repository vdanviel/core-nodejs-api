import express from "express";
import { verifyJwt } from "../middleware/auth.js";
import { body, validationResult, param } from "express-validator";
import { UserController } from "../controller/userController.js";

const userRouter = express.Router();

userRouter.get('/:id', verifyJwt, (req, res) => {
    
    UserController.find(req.params.id)
    .then(user => {       
        return res.send(user);
    })
    .catch(error => {
        return res.status(500).send({ 
            error: error.message,
            trace: error.stack
        });
    });

});

userRouter.post('/register', [
        body('email').exists().withMessage("Email é obrigatório.").notEmpty().withMessage("Email Inválido.").notEmpty().withMessage("Preencha o email."),
        body('password').exists().withMessage("Senha é obrigatória.").notEmpty().withMessage("Preencha a senha."),
        body('name').exists().withMessage("Nome é obrigatório.").notEmpty().withMessage("Preencha o nome.")
    ], (req, res) => {
    
        const validate = validationResult(req);

        if (validate.isEmpty() == false) {
            return res.send({
                missing: validate.array()
            });
        }
        
        UserController.register(req.body.name, req.body.email, req.body.password)
        .then(register => {
            return res.send(register);
        })
        .catch(error => {
            return res.status(500).send({ 
                error: error.message,
                trace: error.stack
            });
        });

});

userRouter.post('/login', [
        body('email').exists().withMessage("Email é obrigatório.").isEmail().withMessage("Email Inválido.").notEmpty().withMessage("Preencha o email."),
        body('password').exists().withMessage("Senha é obrigatória.").notEmpty().withMessage("Preencha a senha.")
    ], (req, res) => {
        
        const validate = validationResult(req);

        if (validate.isEmpty() == false) {
            return res.send({missing: validate.array()});
        }        

        UserController.login(req.body.email, req.body.password)
        .then(login => {       
            return res.send(login);
        }).catch(error => {
            return res.status(500).send({ 
                error: error.message,
                trace: error.stack
            });
        });

});

userRouter.put('/update/:id', [
        param('id').exists().withMessage("O ID do usuário é obrigatório.").notEmpty().withMessage("Preencha o ID do usuário."),
        body('email').exists().withMessage("Email é obrigatório.").notEmpty().withMessage("Email Inválido.").notEmpty().withMessage("Preencha o email."),
        body('name').exists().withMessage("Nome é obrigatório.").notEmpty().withMessage("Preencha o nome.")
], verifyJwt, (req, res) => {

        const validate = validationResult(req);

        if (validate.isEmpty() == false) {
            return res.send({
                missing: validate.array()
            });
        }

        UserController.update(req.params.id, req.body.name, req.body.email)
        .then(user => {
            return res.send(user);
        }).catch(error => {
            return res.status(500).send({ 
                error: error.message,
                trace: error.stack
            });
        });

});

// userRouter.delete('/delete/:id', [
//         param('id').exists().withMessage("O ID do usuário é obrigatório.").notEmpty().withMessage("Preencha o ID do usuário.")
//     ], verifyJwt, (req, res) => {

//         UserController.delete(req.params.id)
//         .then(user => {
//             return res.send(user);
//         }).catch(error => {
//             return res.status(500).send({ 
//                 error: error.message,
//                 trace: error.stack
//             });
//         });

// });

//atualiza a  senha do usuário usando o codigo
userRouter.patch('/update-password/:id', [
        param('id').exists().withMessage("O ID do usuário é obrigatório.").notEmpty().withMessage("Preencha o ID do usuário."),
        body('token').exists().withMessage("Token field is missed.").notEmpty().withMessage("Fill security token field."),
        body('old_password').exists().withMessage("Senha antiga é obrigatória.").notEmpty().withMessage("Preencha a senha antiga."),
        body('new_password').exists().withMessage("Nova senha é obrigatória.").notEmpty().withMessage("Preencha a nova senha."),
        body('secret').exists().withMessage("Nova senha é obrigatória.").notEmpty().withMessage("Preencha a nova senha.")
    ], verifyJwt, (req, res) => {

        const validate = validationResult(req);

        if (validate.isEmpty() == false) {
            return res.send({
                missing: validate.array()
            });
        }

        UserController.changePassword(req.params.id, req.body.old_password, req.body.new_password, req.body.token, req.body.secret)
        .then(user => {
            return res.send(user);
        }).catch(error => {
            return res.status(500).send({ 
                error: error.message,
                trace: error.stack
            });
        });

});

//envia email de recuperação de senha
userRouter.post('/forgot-password/mail', [
    body('email').exists().withMessage("Email é obrigatório.").notEmpty().withMessage("Preencha o email."),
], (req, res) => {

    const validate = validationResult(req);

    if (validate.isEmpty() == false) {
        return res.send({
            missing: validate.array()
        });
    }

    UserController.sendForgotPasswordCode(req.body.email).then((result) => {

        return res.send(result);

    }).catch(error => {
        return res.status(500).send({ 
            error: error.message,
            trace: error.stack
        });
    });

});

//acha o usuário pelo token
userRouter.get('/token/:tokenCode', [
    param('tokenCode').exists().withMessage("O token do usuário é obrigatório.").notEmpty().withMessage("Preencha o token do usuário.")
], (req, res) => {

    const validate = validationResult(req);

    if (validate.isEmpty() == false) {
        return res.send({
            missing: validate.array()
        });
    }

    UserController.findUserByToken(req.params.tokenCode).then((user) => {
        res.send(user);
    }).catch(error => {
        return res.status(500).send({ 
            error: error.message,
            trace: error.stack
        });
    });

});

//ativa/desativa usuario
userRouter.patch('/status/:id', [
    param('id').exists().withMessage("ID inválido.").notEmpty().withMessage("ID inválido."),
], verifyJwt, (req, res) => {
    const validate = validationResult(req);

    if (!validate.isEmpty()) {
        return res.status(400).send({
            missing: validate.array()
        });
    }

    UserController.toggleStatus(req.params.id)
    .then(result => {
        return res.send(result);
    }).catch(error => {
        return res.status(500).send({ 
            error: error.message,
            trace: error.stack
        });
    });
});



export {userRouter};