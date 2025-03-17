import express from 'express'
import { changePass, forgotPass, login, loginFacebook, logout } from '../controllers/auth.js';
import { register } from 'module';
const authRouter = express.Router();
authRouter.post('/login',login)
authRouter.post('/loginFacebook',loginFacebook);
authRouter.post('/register',register);
authRouter.post('/forgot',forgotPass);
authRouter.post('/changePass', changePass);
authRouter.post('/logout',logout);

export default authRouter