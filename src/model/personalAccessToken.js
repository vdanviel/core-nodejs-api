import { DataTypes } from "sequelize";
import { databaseInstance } from "../connection/database.js";
import { User } from "./user.js";

class personalAccessTokenModel {
    constructor() {
        this.sequelizeDefine = databaseInstance.define('personal_access_token', 
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true,
                    allowNull: false,
                },
                tokenable_type: DataTypes.STRING,//o tipo de token que esta transicionando
                tokenable_id: DataTypes.INTEGER,//o user ou objeto associado a esse token
                name: DataTypes.TEXT,//o nome do usuario ou objeto que esta pedindo o token da sua preferência, pode ser usado para tranferir identificadores alem de id
                secret: DataTypes.STRING,//codigo secreto para verifição de segurança
                token: {//o token
                    type: DataTypes.TEXT,
                    allowNull: true,
                    unique: true //token deve ser único
                },
                abilities: {//permissões que esse token tem...
                    type: DataTypes.TEXT, // É uma string JSON
                    allowNull: true, // não é obrigatório
                },
                last_used_at: DataTypes.DATE,
                expires_at: DataTypes.DATE
            },
            {
                tableName: 'personal_access_token'
            }
        );

    }

    getModel(){
        
        return databaseInstance.models.personal_access_token;
    }

}

const personalAccessToken = new personalAccessTokenModel().getModel();

export {personalAccessToken};