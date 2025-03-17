import bcrypt from "bcrypt";
import crypto from "crypto";
import { users } from "../config/model/DE170023.js";
import { createRefTokenAsyncKey, createTokenAsyncKey } from "../config/jwt.js";
import transporter from "../config/transporter.js";

const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
const hashPassword = (password) => bcrypt.hashSync(password, 12);

const authResponse = async (res, user) => {
  const accessToken = await createTokenAsyncKey({ id: user._id });
  const refreshToken = await createRefTokenAsyncKey({ id: user._id });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
  return res.status(200).json({
    message: "Success",
    data: {
      accessToken :accessToken,
      user: {
        id: user._id,
        email: user.email,
        userName: user.userName,
        role: user.role,
      },
    },
  });
};

// Đăng nhập
const login = async (req, res) => {
  try {
    const { email, password } = req.body;  
    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }
    const user = await users.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "Tài khoản không tồn tại" });
    }
    if (!bcrypt.compareSync(password, user.password)) {
      return res.status(401).json({ message: "Mật khẩu không chính xác" });
    }

    await users.findByIdAndUpdate(user._id, { 
      refresh_token: createRefTokenAsyncKey({ id: user._id }) 
    });

    return authResponse(res, user);
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ message: "Lỗi hệ thống" });
  }
};

const loginFacebook = async (req, res) => {
  try {
    const { id, name, email } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    let user = await users.findOne({ email });

    if (user) {
      if (!user.facebook_id) {
        user = await users.findByIdAndUpdate(
          user._id,
          { facebook_id: id },
          { new: true }
        );
      }
    } else {
      user = await users.create({
        email,
        userName: name,
        facebook_id: id,
        password: hashPassword(crypto.randomBytes(16).toString("hex")),
        role: "user",
      });
    }
    await users.findByIdAndUpdate(user._id, {
      refresh_token: createRefTokenAsyncKey({ id: user._id }),
    });
    return authResponse(res, user);
  } catch (error) {
    console.error("Facebook Login Error:", error);
    return res.status(500).json({ message: "Lỗi xác thực Facebook" });
  }
};

const register = async (req, res) => {
  try {
    const { email, userName, password } = req.body;

    if (!validateEmail(email)) {
      return res.status(400).json({ message: "Email không hợp lệ" });
    }

    if (await users.findOne({ email })) {
      return res.status(409).json({ message: "Email đã được đăng ký" });
    }
    const newUser = await users.create({
      email,
      userName,
      password: hashPassword(password),
      role: "user",
    });
    const mailOptions = {
      from: `"Hệ Thống" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "Đăng ký thành công",
      html: `<p>Xin chào ${userName},</p>
           <p>Tài khoản của bạn đã được tạo thành công!</p>`,
    };

    await transporter.sendMail(mailOptions);

    return authResponse(res, newUser);
  } catch (error) {
    console.error("Registration Error:", error);
    return res.status(500).json({ message: "Lỗi đăng ký" });
  }
};


const forgotPass = async(req,res) =>{
   const {email} = req.body;
   try {
      const findUser = await users.findOne({email})
      if(!findUser){
         res.status(400).json({message:"User không tồn tại"}) 
      }
      let randomCode = crypto.randomBytes(5).toString("hex");
      await users.findByIdAndUpdate(
         findUser._id
         ,{
            expried_code: randomCode
         })
      const mailOption = {
         from: "dangpnhde170023@fpt.edu.vn",
         to: email,
         subject: `Reset Token : ${randomCode}`,
         text: "best regart",
      }; 
      transporter.sendMail(mailOption, (err, info) => {
         if (err) {
            return res.status(500).json({ message: "sending mail error" });
         }
         return res.status(200).json({ message: "sending mail success", data: user });
      });
   } catch (error) {
      res.status(500).json({message:error})
   }
}
// check quên xong thì phải update pass chớ
const changePass = async (req, res) => {
   try {
       const { token, newPassword } = req.body;
       if (!token || !newPassword) {
           return res.status(400).json({ message: "Thiếu thông tin bắt buộc" });
       }

       const user = await users.findOne({
           resetToken: token,
       });

       if (!user) {
           return res.status(400).json({ message: "Token không hợp lệ hoặc đã hết hạn" });
       }

       // Hash mật khẩu mới
       const hashedPassword = await bcrypt.hash(newPassword, 12);

       // Cập nhật và xóa token
       await users.findByIdAndUpdate(user._id, {
           password: hashedPassword,
           resetToken: undefined,
       });

       res.status(200).json({ message: "Đặt lại mật khẩu thành công" });

   } catch (error) {
       console.error('Lỗi changePass:', error);
       res.status(500).json({ message: "Lỗi server" });
   }
};
// cái logout thì mình kiếm từ cái middleware ha
const logout = async(req,res) =>{
const userId = req.user.id
   try {
      await users.findByIdAndUpdate(userId,{
            refresh_token:null
      });
      // clear cokkie
      res.clearCookie("refreshToken", {
         httpOnly: true,
         secure: false,
         sameSite: "Lax",
      });
      
      return res.status(200).json({ message: "logout thành công" });
   } catch(error) {
      res.status(500).json({message:error})
   }
}

export { login, loginFacebook, register, forgotPass, changePass,logout };