import express from "express";
import { isAuth } from "../middleware/auth.js";
import { checkScope } from "../middleware/scope.js";
import { body, validationResult, param } from "express-validator";
import { UserController } from "../controller/userController.js";
import { FooController } from "../controller/fooController.js";

const userRouter = express.Router();

userRouter.get('/me', isAuth, (req, res) => {

    UserController.find(req.auth.data.id)
    .then(user => {

        return res.send(user);

    })
    .catch(error => {
        return res.status(500).send({ 
            error: error.message
        });
    });

});

userRouter.post('/register', [
        body('name').exists().withMessage("Nome é obrigatório.").notEmpty().withMessage("Preencha o nome."),
        body('email').exists().withMessage("Email é obrigatório.").isEmail().withMessage("Email Inválido.").notEmpty().withMessage("Preencha o email."),
        body('phone').exists().withMessage("Celular é obrigatório.").isMobilePhone('pt-BR').withMessage("Número celular inválido.").notEmpty().withMessage("Preencha o celular."),
        body('password').exists().withMessage("Senha é obrigatória.").notEmpty().withMessage("Preencha a senha."),
    ], (req, res) => {
    
        const validate = validationResult(req);

        if (validate.isEmpty() == false) {
            return res.send({
                missing: validate.array()
            });
        }
        
        UserController.register(req.body.name, req.body.email, req.body.password,req.body.phone)
        .then(register => {
            return res.send(register);
        })
        .catch(error => {
            return res.status(500).send({ 
                error: error.message
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
                error: error.message
            });
        });

});

userRouter.put('/update', [
    body('name').exists().withMessage("Nome é obrigatório.").notEmpty().withMessage("Preencha o nome."),
    body('phone').exists().withMessage("Celular é obrigatório.").isMobilePhone('pt-BR').withMessage("Número celular inválido.").notEmpty().withMessage("Preencha o celular."),
], isAuth, (req, res) => {

        const validate = validationResult(req);

        if (validate.isEmpty() == false) {
            return res.send({
                missing: validate.array()
            });
        }

        UserController.update(req.auth.data.id, req.body.name, req.body.phone)
        .then(user => {
            return res.send(user);
        }).catch(error => {
            return res.status(500).send({ 
                error: error.message
            });
        });

});

// userRouter.delete('/delete/:id', [
//         param('id').exists().withMessage("O ID do usuário é obrigatório.").notEmpty().withMessage("Preencha o ID do usuário.")
//     ], isAuth, (req, res) => {

//         UserController.delete(req.params.id)
//         .then(user => {
//             return res.send(user);
//         }).catch(error => {
//             return res.status(500).send({ 
//                 error: error.message,
//  //             });
//         });

// });

// Envia código para mudança de email
userRouter.post('/change-email/mail', [
    body('new_email').exists().withMessage("Novo email é obrigatório.").isEmail().withMessage("Email inválido.").notEmpty().withMessage("Preencha o novo email."),
], isAuth, (req, res) => {
    const validate = validationResult(req);

    if (!validate.isEmpty()) {
        return res.send({ missing: validate.array() });
    }

    UserController.sendChangeEmailCode(req.auth.data.id, req.body.new_email)
    .then(result => {return res.send(result)})
    .catch(error => {return res.status(500).send({ error: error.message })});
});

// Altera o email do usuário após validação
userRouter.patch('/change-email', [
    body('code').exists().withMessage("Código é obrigatório.").notEmpty().withMessage("Preencha o código."),
    body('secret').exists().withMessage("Secret é obrigatório.").notEmpty().withMessage("Preencha o secret."),
    body('new_email').exists().withMessage("Novo email é obrigatório.").isEmail().withMessage("Email inválido.").notEmpty().withMessage("Preencha o novo email."),
], (req, res) => {
    const validate = validationResult(req);

    if (!validate.isEmpty()) {
        return res.send({ missing: validate.array() });
    }

    UserController.changeEmail(req.body.new_email, req.body.code, req.body.secret)
    .then(result => {return res.send(result)})
    .catch(error => {return res.status(500).send({ error: error.message })});
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
            error: error.message
        });
    });

});

//atualiza a  senha do usuário usando o codigo
userRouter.patch('/update-password/', [
        body('code').exists().withMessage("Code field is missed.").notEmpty().withMessage("Fill security code field."),
        body('old_password').exists().withMessage("Senha antiga é obrigatória.").notEmpty().withMessage("Preencha a senha antiga."),
        body('new_password').exists().withMessage("Nova senha é obrigatória.").notEmpty().withMessage("Preencha a nova senha."),
        body('secret').exists().withMessage("Nova senha é obrigatória.").notEmpty().withMessage("Preencha a nova senha.")
    ], (req, res) => {

        const validate = validationResult(req);

        if (validate.isEmpty() == false) {
            return res.send({
                missing: validate.array()
            });
        }

        UserController.changePassword(req.body.old_password, req.body.new_password, req.body.code, req.body.secret)
        .then(user => {
            return res.send(user);
        }).catch(error => {
            return res.status(500).send({ 
                error: error.message,
            });
        });

});

//acha o usuário pelo token dele
userRouter.get('/token/:token', [
    param('token').exists().withMessage("O token do usuário é obrigatório.").notEmpty().withMessage("Preencha o token do usuário.")
], (req, res) => {

    const validate = validationResult(req);

    if (validate.isEmpty() == false) {
        return res.send({
            missing: validate.array()
        });
    }

    UserController.findUserByToken(req.params.token).then((user) => {
        res.send(user);
    }).catch(error => {
        return res.status(500).send({ 
            error: error.message
        });
    });

});

//ativa/desativa usuario
userRouter.patch('/toogle-status', isAuth, (req, res) => {
    const validate = validationResult(req);

    if (!validate.isEmpty()) {
        return res.status(400).send({
            missing: validate.array()
        });
    }

    UserController.toggleStatus(req.auth.data.id)
    .then(result => {
        return res.send(result);
    }).catch(error => {
        return res.status(500).send({ 
            error: error.message
        });
    });
});

export {userRouter};