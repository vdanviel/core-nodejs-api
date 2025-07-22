import { Sequelize } from "sequelize";
import dotenv from 'dotenv'
dotenv.config();


class Database{
  
  constructor() {

    // this.sequelize = new Sequelize({
    //   dialect: 'sqlite',
    //   storage: './database.sqlite'
    // });

    this.sequelize = new Sequelize(process.env.DB_NAME, process.env.DB_USERNAME, process.env.DB_PASSWORD, {
      host: process.env.DB_HOST,
      dialect: 'mysql'
    });

    this.sequelize.sync();//sincroniza o banco de dados com as entidades presentes na classe.. (acesse src/model)

  }

  getInstace() {
    return this.sequelize;
  }

}

const databaseInstance = new Database().getInstace();

export {databaseInstance};