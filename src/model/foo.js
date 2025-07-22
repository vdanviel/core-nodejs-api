import { DataTypes } from "sequelize";
import { databaseInstance } from "../connection/database.js";

class FooModel {
    constructor() {
        databaseInstance.define('foo', 
            {
                id: {
                    type: DataTypes.INTEGER,
                    primaryKey: true,
                    autoIncrement: true
                },
                name: DataTypes.STRING,
                description: DataTypes.STRING,
                value: DataTypes.FLOAT,
                status: {
                    type: DataTypes.BOOLEAN,
                    defaultValue: true//o usuario ja começa a tivo
                }
            },
            {
                tableName: "foo"
            }
        );
    }

    getModel(){
        return databaseInstance.models.foo;
    }

}

const Foo = new FooModel().getModel();

export { Foo };