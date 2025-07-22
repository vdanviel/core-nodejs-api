//conexão aos serviços google a partir daqui é só usar o objeto autenticado do google para utilizar os serviços em qualquer lugar da aplicação

import {google} from "googleapis";
import dotenv from 'dotenv'//pegando os dados do env
dotenv.config();

const googleAuthClient = new google.auth.OAuth2(//autenticando na conta google apis (https://console.cloud.google.com/), preencha os dados necessarios no env
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    process.env.GOOGLE_REDIRECT_URI
);

google.options({auth: googleAuthClient});

export {googleAuthClient}