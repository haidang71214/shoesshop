import bcrypt from "bcrypt";
import { users } from "../config/model/DE170023.js";
import { createRefTokenAsyncKey, createTokenAsyncKey } from "../config/jwt.js";
import transporter from "../config/transporter.js";



// login bất đối xứng
const login = async (req, res) => {
   try{
      const {email,password} = req.body;
      const checkUser = await users.findOne({
         $where:{
            email,
         }
      })
      if(!checkUser){
         res.status(500).json({message:"Hong tồn tại users trong hệ thống"})
      }
      const checkPassword = bcrypt.compareSync(password,checkUser.password);
      // lấy thằng pass cũ so với thằng pass hiện tại ha
      if(!checkPassword){
         res.status(400).json({message:"Hong đúng mật khẩu"})
      }
      let accessToken = await createTokenAsyncKey({id:checkUser._id});
      let refToken = await createRefTokenAsyncKey({id:checkUser._id});
      console.log(refToken);
      await users.findOneAndUpdate(
         checkUser._id,
         {
            refresh_token: refToken,
      })
      res.cookie('refreshToken',refToken,{
         httpOnly: true,
         secure: false,
         sameSite: "Lax",
         maxAge: 7 * 24 * 60 * 60 * 1000, // em để 7 ngày ạ
      });
      if(!accessToken){
         console.log('token fail');
         res.status(500).json({message:"Token fail"})
      }
      res.status(200).json({message:'login success'})
   }catch(error) {
      res.status(500).jso({message:error})
   }
}


const register = async(req,res) => {
   try {
      const {email,userName,password,role}= req.body
      const findUser = await users.findOne({email});
      if(findUser){
         res.status(400).json({message:"email đã có trong hệ thống"});
      }
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
          return res.status(400).json({ message: "Email không hợp lệ" });
      }
      const newUser = await users.create({
         email,
         userName,
         password: bcrypt.hashSync(password,10),
         // thiếu role, nhma mình sẽ tạo role admin ở chỗ mongo luôn
      })
      const mailOption = {
         from: "dangpnhde170023@fpt.edu.vn",
         to: email,
         subject: "Welcome to our service",
         text: "best regart",
      }
      transporter.sendMail(mailOption,(err,info) =>{
         if(err) {
            return res.status(400).json({message:"sending mail error"})
         }
         res.status(200).json({message:'sending mail success'})
      })
      return res.status(200).json({
         message:"Đăng kí thành công",
         data:newUser
      })
   } catch (error) {
      res.status(500).json({message:error})
   }
} 


const loginFacebook  = async(req,res) => {

}
const extendToken = async(req,res) =>{
   try {
      
   } catch (error) {
      
   }
}
const forgotPass = async(req,res) =>{
   const {email} = req.body;
   try {
      const findUser = await users.findOne({email})
      if(!findUser){
         res.status(400).json({message:"User không tồn tại"}) 
      }
      const craeteToken = 
   } catch (error) {
      res.status(500).json({message:error})
   }
}

export { login,loginFacebook,register };
