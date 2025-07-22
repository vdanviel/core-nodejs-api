import { DataTypes } from "sequelize";
import { databaseInstance } from "../connection/database.js";

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

export {User};