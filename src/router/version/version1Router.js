import express from "express";

//rotas
import { userRouter } from "../userRouter.js";
import { personalAccessTokenRouter } from "../personalAcessTokenRouter.js";
import { fooRouter } from "../fooRouter.js";

const version1Router = express.Router();

version1Router.use(`/customer`, userRouter);
version1Router.use(`/foo`, fooRouter);
version1Router.use(`/token`, personalAccessTokenRouter);

export {version1Router};