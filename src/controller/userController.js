import { User } from "../model/user.js";
import { mail } from "../mail/manager.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import fs from "node:fs";
import path from "node:path";
import Util from '../util/util.js';
import { v4 as uuidv4 } from 'uuid';
import { PersonalAccessTokenController } from "./personalAccessTokenController.js";
import dotenv from 'dotenv'
dotenv.config();

class Controller {

    async find(userId){
        const foundUser = await User.findOne({ where: { id: userId } });

        if (foundUser == null) {
            return {
                error: "Não há usuário."
            }
        } else {
            return foundUser.toJSON();
        }
    }

    async register(name, email, password,phone, token = null){

        if (email != null) {
            let data = await User.findOne({ where: { email: email } });
            if(data != null){
                return {
                    "error": "Usuário já existe."
                };
            }
        }

        let hash = null;
        if (password != null) {
            const salt = bcrypt.genSaltSync(10);
            hash = bcrypt.hashSync(password, salt);
        }

        const userToken = token ?? uuidv4();

        const data = await User.create({
            name: name ?? null,
            email: email ?? null,
            phone: phone,
            password: hash,
            token: userToken,
            status: true
        });

        //ele envia o email de boas vindas só se foi registrado o email, pois em alguns fluxos de cadastro como no Google o user é registrado somente o token para depois registrar os restos dos dados
        if(email != null){
            const templateFilePath = path.join(Util.getTemplatePath(import.meta.url), '../mail/template/welcome.html');
            fs.readFile(templateFilePath, 'utf8', (err, content) => {
                if (err) throw err;
                let plainHTML = content.toString().replace("{name}", name ?? "");
                mail.sendEmail(email, name ?? "", "Bem vindo a Company!", plainHTML);
            });
        }

        // Remover o campo password do objeto retornado
        if (data && data.dataValues) {
            delete data.dataValues.password;
        }

        return data;
    }

    async findUserByToken(userToken){
        const foundUser = await User.findOne({ where: { token: userToken } });

        if (foundUser == null) {
            return {
                error: "Não há usuário."
            }
        } else {
            
            return foundUser.toJSON();
            
        }
    }

    async login(email, password){
        const foundUser = await User.findOne({
            where: { email: email},
            attributes: { include: ['password'] }
        });
        
        if(foundUser == null){
            return {
                "error": "Usuário não existe."
            };
        }
        
        if(bcrypt.compareSync(password, foundUser.password) == true){

            //deletar o password do obj para retornar...
            delete foundUser.dataValues.password;

            //criando o JWT...
            let encodedJwt = jwt.sign({
                data: foundUser,
                scope: ["read:foo", "write:foo", /* "delete:foo", */ "update:foo"]
            }, process.env.JWT_SECRET, { expiresIn: '45h' });

            return {
                ...foundUser.toJSON(),
                encodedJwt
            };

        }else{
            return {
                "error": "A senha é inválida."
            };
        }
    }

    async   update(userId, name, phone){
        const foundUser = await User.findOne({ where: { id: userId } });

        if(foundUser == null){
            return {
                "error": "Usuário não existe."
            };
        }

        await foundUser.update({            
            name: name,
            phone: phone
        });

        await foundUser.save();

        return foundUser.toJSON();
    }

    async delete(userId){
        const foundUser = await User.findOne({ where: { id: userId } });

        if(foundUser == null){
            return {
                "error": "Usuário não existe."
            };
        }

        await foundUser.destroy();

        return {
            message: "Usuário deletado com sucesso."
        }
    }

    async findByEmail(userEmail){
        const foundUser = await User.findOne({ where: { email: userEmail } });

        if (foundUser == null) {
            return {
                error: "Não há usuário."
            }
        } else {
            return foundUser.toJSON();
        }

    }

     //envia o email de "esqueci a senha"
    async sendForgotPasswordCode(email) {
        
        const user = await User.findOne({
            where:{
                email: email
            }
        });

        if (user == null) {
            return {
                error: "Usuário não existe."
            }
        }

        const generatedCode = Util.generateCode(5);
        const secretWord = uuidv4();

        //registrar codigo no db..
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000);//1hr ele expira
        await PersonalAccessTokenController.register("forgot_password", user.id, user.name, secretWord, generatedCode, null, Date.now(), expiresAt);

        //enviar email com codigo...
        //recupera o caminho do template do email html...
        const templateFilePath = path.join(Util.getTemplatePath(import.meta.url), '../mail/template/forgotPassword.html');

        //busca pelo arquivo hmtl
        fs.readFile(templateFilePath, 'utf8', (err, content) => {
            if (err) throw err;
            
            //pega o html do template de emaisl e muda as variaveis na string...
            let plainHTML = content.toString().replace("{name}", user.name);
            plainHTML = plainHTML.toString().replace("{code}", generatedCode);

            //envia email de esqueci senha
            mail.sendEmail(user.email, user.name, "Redefinição de Senha Company", plainHTML);
        });

        return {
            "message": "O código de redefinição de senha foi enviado ao e-mail com sucesso."
        }

    }

    //mudar senha com codigo personalAccessToken
    async changePassword(oldPassword, newPassword, code, secret) {

        const personalAT = await PersonalAccessTokenController.verifyByCode(code);

        if(personalAT.error){
            return personalAT;
        }

        //se o secret for diferente não pode mudar
        if (personalAT.secret !== secret) {
            return {
                error: "Falha na validação de segurança. (SCRT)"
            }
        }

        const user = await User.findOne({
            where: { id: personalAT.tokenable_id },
            attributes: { include: ['password'] }
        });

        if(user == null){
            return {
                "error": "Usuário não existe."
            };
        }

        if(bcrypt.compareSync(oldPassword, user.password) == true){

            const salt = bcrypt.genSaltSync(10);
            const hash = bcrypt.hashSync(newPassword, salt);

            user.update({
                password: hash
            });

            user.save();

            //deletar codigo de recuperação antes de retornar para usuario..
            await PersonalAccessTokenController.deleteAllRelated(user.id);

            return {
                message: "Senha alterada com sucesso."
            };

        }else{
            return {
                "error": "A senha antiga é inválida."
            };
        }

    }

    // envia email com código para mudança de email
    async sendChangeEmailCode(userId, newEmail) {
        const user = await User.findOne({ where: { id: userId } });

        if (!user) {
            return { error: "Usuário não existe." };
        }

        // Verifica se o novo email já está em uso
        const emailExists = await User.findOne({ where: { email: newEmail } });
        if (emailExists) {
            return { error: "Este email já está em uso." };
        }

        const generatedCode = Util.generateCode(5);
        const secretWord = uuidv4();
        const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1hr

        await PersonalAccessTokenController.register(
            "change_email",
            user.id,
            newEmail,
            secretWord,
            generatedCode,
            null,
            Date.now(),
            expiresAt
        );

        const templateFilePath = path.join(Util.getTemplatePath(import.meta.url), '../mail/template/changeEmail.html');
        fs.readFile(templateFilePath, 'utf8', (err, content) => {
            if (err) throw err;
            let plainHTML = content.toString().replaceAll("{name}", user.name).replaceAll("{host}", process.env.SPA_APPLICATION_URL).replaceAll("{email}", newEmail).replaceAll("{code}", generatedCode).replaceAll("{secret}", secretWord);
            mail.sendEmail(newEmail, user.name, "Confirmação de Mudança de Email, Company", plainHTML);
        });

        return { message: "O código de confirmação foi enviado ao novo e-mail com sucesso." };
    }

    // altera o email do usuário após validação
    async changeEmail(email, code, secret) {

        const personalAT = await PersonalAccessTokenController.verifyByCode(code);

        if (personalAT.error) {
            return personalAT;
        }

        if (personalAT.secret !== secret) {
            return { error: "Falha na validação de segurança. (SCRT)" };
        }

        const user = await User.findOne({ where: { id: personalAT.tokenable_id } });

        if (!user) {
            return { error: "Usuário não existe." };
        }

        const newEmail = email;

        // Verifica se o novo email já está em uso
        const emailExists = await User.findOne({ where: { email: newEmail } });
        if (emailExists) {
            return { error: "Este email já está em uso." };
        }

        await user.update({ email: newEmail });
        await user.save();

        await PersonalAccessTokenController.deleteAllRelated(user.id);

        return { message: "Email alterado com sucesso." };
    }

    async toggleStatus(userId) {
        const foundUser = await User.findOne({ where: { id: userId } });

        if (foundUser == null) {
            return {
                error: "Usuário não encontrado."
            }
        }

        let myTimezoneDate = Util.currentDateTime('America/Sao_Paulo');
        const newStatus = !foundUser.status;

        await foundUser.update({
            status: newStatus,
            updatedAt: myTimezoneDate
        });

        return {
            message: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso.`
        }
    }

}

const UserController = new Controller();

export { UserController }