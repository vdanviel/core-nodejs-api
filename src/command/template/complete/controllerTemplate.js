import { __TitleModuleName__ } from "../model/__ModuleName__.js";
import dotenv from 'dotenv'
import Util from "../util/util.js";
dotenv.config();

class Controller {

    async findAll(){
        return await __TitleModuleName__.findAll();
    }

    async find(__ModuleName__Id){
        const __ModuleName__ = await __TitleModuleName__.findOne({ where: { id: __ModuleName__Id } });

        if (__ModuleName__ == null) {
            return {
                error: "Não há __ModuleName__ definido."
            }
        } else {
            return __ModuleName__;
        }
    }

    async register(name, description, value){
        const data = await __TitleModuleName__.create({
            name: name,
            description: description,
            value: value,
            status: true
        });

        return data;
    }

    async update(__ModuleName__Id, name, description, value) {
        const founded__TitleModuleName__ = await __TitleModuleName__.findOne({where: {id: __ModuleName__Id}});

        if (founded__TitleModuleName__ == null) {
            return {
                error: "__TitleModuleName__ não encontrado."
            }
        }

        //libera a data em yyyy-mm-dd hh:ss
        let myTimezoneDate = Util.currentDateTime('America/Sao_Paulo');

        await founded__TitleModuleName__.update({
            name: name,
            description: description,
            value: value,
            updatedAt: myTimezoneDate
        });

        await founded__TitleModuleName__.save();

        return await founded__TitleModuleName__.toJSON();
    }

    async toggleStatus(__ModuleName__Id) {
        const founded__TitleModuleName__ = await __TitleModuleName__.findOne({ where: { id: __ModuleName__Id } });

        if (founded__TitleModuleName__ == null) {
            return {
                error: "__TitleModuleName__ não encontrado."
            }
        }

        //libera a data em yyyy-mm-dd hh:ss
        let myTimezoneDate = Util.currentDateTime('America/Sao_Paulo');

        // Toggle status
        const newStatus = !founded__TitleModuleName__.status;

        await founded__TitleModuleName__.update({
            status: newStatus,
            updatedAt: myTimezoneDate
        });

        return {
            message: `__TitleModuleName__ ${newStatus ? 'ativado' : 'desativado'} com sucesso.`
        }
    }

    async delete(__ModuleName__Id){
        const founded__TitleModuleName__ = await __TitleModuleName__.findOne({where: {id: __ModuleName__Id}});

        if (founded__TitleModuleName__ == null) {
            return {
                error: "__TitleModuleName__ não encontrado."
            }
        }

        await founded__TitleModuleName__.destroy();

        return {
            message: "__TitleModuleName__ deletado com sucesso."
        }
    }

}

const __TitleModuleName__Controller = new Controller();

export { __TitleModuleName__Controller }