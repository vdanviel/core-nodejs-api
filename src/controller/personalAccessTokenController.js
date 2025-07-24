import { personalAccessToken } from "../model/personalAccessToken.js";

class Controller {

    async register(tokenableType = null, tokenableId = null, name = null, secret = null, token = null, abilities = null, lastUsedAt = null, expiresAt= null){

        const personalAT = await personalAccessToken.create({
            tokenable_type: tokenableType,
            tokenable_id: tokenableId,
            name: name,
            secret: secret,
            token: token,
            abilities: abilities,
            last_used_at: lastUsedAt,
            expires_at: expiresAt
        });

        return personalAT;

    }

    async verifyByCode(code){

        const personalAT = await personalAccessToken.findOne({
            where: {
                token: code
            }
        });

        if (personalAT == null) {
            return {
                error: "Código de recuperação é inválido."
            }
        }

        const tokenExpiresAtTime = new Date(personalAT.expires_at);
        const currentTime = new Date();

        if (currentTime.getTime() > tokenExpiresAtTime.getTime()) {
            return {
                error: "Código de recuperação expirado."
            }
        } else {
            return personalAT;
        }
    }

    async verifyBySecret(secret){

        const personalAT = await personalAccessToken.findOne({
            where: {
                secret: secret
            }
        });

        if (personalAT == null) {
            return {
                error: "Código de recuperação é inválido."
            }
        }

        const tokenExpiresAtTime = new Date(personalAT.expires_at);
        const currentTime = new Date();

        if (currentTime.getTime() > tokenExpiresAtTime.getTime()) {
            return {
                error: "Código de recuperação expirado."
            }
        } else {
            return personalAT;
        }
    }

    async deleteAllRelated(customerId) {
        const personalAT = await personalAccessToken.findAll({
            where: {
                tokenable_id: customerId,
                tokenable_type: "forgot_password"
            }
        });

        // Check if the array is empty
        if (personalAT.length === 0) {
            return {
                error: "Não há tokens reservados para este usuário."
            }
        }

        for (const token of personalAT) {
            await token.destroy();
        }

        return {
            message: "O token foi deletado com sucesso."
        }
    }

}

const PersonalAccessTokenController = new Controller();

export {PersonalAccessTokenController};