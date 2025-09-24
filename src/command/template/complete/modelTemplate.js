import { DataTypes } from "sequelize";
import { databaseInstance } from "../connection/database.js";

class __TitleModuleName__Model {
    constructor() {
        databaseInstance.define('__ModuleName__', 
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                //adicionar restante colunas aqui...
            },
            {
                tableName: "__ModuleName__"
            }
        );
    }

    getModel(){
        return databaseInstance.models.__ModuleName__;
    }

}

const __TitleModuleName__ = new __TitleModuleName__Model().getModel();

export { __TitleModuleName__ };