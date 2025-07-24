import { DataTypes } from "sequelize";
import { databaseInstance } from "../connection/database.js";
import { personalAccessToken } from "./personalAccessToken.js";

class UserModel {
    constructor() {
        this.sequelizeDefine = databaseInstance.define('user', 
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                name: DataTypes.STRING,
                email: DataTypes.STRING,
                password: DataTypes.STRING,
                phone: DataTypes.STRING,
                token: DataTypes.STRING,
                status: DataTypes.BOOLEAN,
                provider: {//esse dado diz de onde a pessoa se registrou se foi google ou terceiros ou se foi manual
                    type: DataTypes.STRING,
                    allowNull: true,
                    defaultValue: "manual"
                },
            },
            {
                tableName: "user",
                defaultScope: {
                    attributes: { exclude: ['password'] }
                }
            }            
        );

    }

    getModel(){
        
        return databaseInstance.models.user;
    }

}

const User = new UserModel().getModel();

//se quiser relação direta no banco de dados entre o user e os tokens...
User.hasMany(personalAccessToken, { foreignKey: 'tokenable_id' });
personalAccessToken.belongsTo(User, { foreignKey: 'tokenable_id' });

export {User};

