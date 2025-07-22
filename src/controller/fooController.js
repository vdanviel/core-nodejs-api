import { Foo } from "../model/foo.js";
import dotenv from 'dotenv'
import Util from "../util/util.js";
dotenv.config();

class Controller {

    async findAll(){
        return await Foo.findAll();
    }

    async find(fooId){
        const foo = await Foo.findOne({ where: { id: fooId } });

        if (foo == null) {
            return {
                error: "Não há foo definido."
            }
        } else {
            return foo;
        }
    }

    async register(name, description, value){
        const data = await Foo.create({
            name: name,
            description: description,
            value: value,
            status: true
        });

        return data;
    }

    async update(fooId, name, description, value, status) {
        const foundedFoo = await Foo.findOne({where: {id: fooId}});

        if (foundedFoo == null) {
            return {
                error: "Foo não encontrado."
            }
        }

        //libera a data em yyyy-mm-dd hh:ss
        let saoPauloDate = Util.currentDateTime('America/Sao_Paulo');

        await foundedFoo.update({
            name: name,
            description: description,
            value: value,
            status: status,
            updatedAt: saoPauloDate
        });

        await foundedFoo.save();

        return await foundedFoo.toJSON();
    }

    async toggleStatus(fooId) {
        const foundedFoo = await Foo.findOne({ where: { id: fooId } });

        if (foundedFoo == null) {
            return {
                error: "Foo não encontrado."
            }
        }

        //libera a data em yyyy-mm-dd hh:ss
        let saoPauloDate = Util.currentDateTime('America/Sao_Paulo');

        // Toggle status
        const newStatus = !foundedFoo.status;

        await foundedFoo.update({
            status: newStatus,
            updatedAt: saoPauloDate
        });

        return {
            message: `Foo ${newStatus ? 'ativado' : 'desativado'} com sucesso.`
        }
    }

    async delete(fooId){
        const foundedFoo = await Foo.findOne({where: {id: fooId}});

        if (foundedFoo == null) {
            return {
                error: "Foo não encontrado."
            }
        }

        await foundedFoo.destroy();

        return {
            message: "Foo deletado com sucesso."
        }
    }



}

const FooController = new Controller();

export { FooController }