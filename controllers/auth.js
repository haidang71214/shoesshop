
import { createRefTokenAsyncKey, createTokenAsyncKey } from "../config/jwt.js";
import bcrypt from 'bcrypt'
// thay thế, à mà thôi
import user from "../config/model/DE170023.js";


const login = async (req, res) => {
   const { userName, password } = req.body;
   try {
      const findUser = await user.findOne({userName:userName});
      if(!findUser){
         return res.status(401).json({message:"user not found"});
      }
      
      const isMatch = await bcrypt.compare(password,findUser.password);
      if(!isMatch){
         return res.status(401).json({message:"invailid password"});
      }

      const accessToken = await createTokenAsyncKey({ id: findUser._id, role: findUser.role });
      const refToken = await createRefTokenAsyncKey({id:findUser._id,role:findUser.role});

      findUser.refresToken = refToken;
    findUser.expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 ngày
    await findUser.save();

      res.cookie('refreshToken', refToken, {
         httpOnly: true,
         secure: process.env.NODE_ENV === 'production',
         maxAge: 7 * 24 * 60 * 60 * 1000 // 7 ngày
       });

      res.status(200).json({message:accessToken})
   } catch (error) {
      console.log(error);
      res.status(500).json({message:error})
   }

 };

 export {login}