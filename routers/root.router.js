import express from 'express';
import authRouter from './auth.router.js';
import userRouter from './user.routers.js';
import shoeRouter from './shoe.routers.js';


const rootRouter = express.Router();
rootRouter.use('/auth',authRouter)
rootRouter.use('/user',userRouter)
rootRouter.use('/shoe',shoeRouter)
export default rootRouter; 