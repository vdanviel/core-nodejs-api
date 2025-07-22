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
            return foundUser;
        }
    }

    async register(name, email, password, token = null){
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

        return data;
    }

    async findUserByToken(userToken){
        const foundUser = await User.findOne({ where: { token: userToken } });

        if (foundUser == null) {
            return {
                error: "Não há usuário."
            }
        } else {

            //criando o JWT...
            let encodedJwt = jwt.sign({
                data: foundUser
            }, process.env.JWT_SECRET, { expiresIn: '45h' });

            return {
                ...foundUser,
                encodedJwt
            };
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
            let encodedJwt = jwt.sign({
                data: foundUser
            }, process.env.JWT_SECRET, { expiresIn: '45h' });

            return {
                ...foundUser,
                encodedJwt
            };

        }else{
            return {
                "error": "A senha é inválida."
            };
        }
    }

    async update(userId, name, email){
        const foundUser = await User.findOne({ where: { id: userId } });

        if(foundUser == null){
            return {
                "error": "Usuário não existe."
            };
        }

        await foundUser.update({            
            name: name,
            email: email
        });

        await foundUser.save();

        return foundUser;
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
            return foundUser;
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
    async changePassword(userId, oldPassword, newPassword, code, secret) {

        const user = await User.findOne({
            where: { id: userId },
            attributes: { include: ['password'] }
        });

        if(user == null){
            return {
                "error": "Usuário não existe."
            };
        }

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

    async toggleStatus(userId) {
        const foundUser = await User.findOne({ where: { id: userId } });

        if (foundUser == null) {
            return {
                error: "Usuário não encontrado."
            }
        }

        let saoPauloDate = Util.currentDateTime('America/Sao_Paulo');
        const newStatus = !foundUser.status;

        await foundUser.update({
            status: newStatus,
            updatedAt: saoPauloDate
        });

        return {
            message: `Usuário ${newStatus ? 'ativado' : 'desativado'} com sucesso.`
        }
    }

}

const UserController = new Controller();

export { UserController }