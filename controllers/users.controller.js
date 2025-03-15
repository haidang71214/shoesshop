import { users } from "../config/model/DE170023.js";
import bcrypt from "bcrypt";

const createUser = async (req, res) => {
   try {
       const { userName, password, role, email } = req.body;

       // Kiểm tra email hợp lệ bằng Regex
       const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
       if (!emailRegex.test(email)) {
           return res.status(400).json({ message: "Email không hợp lệ" });
       }

       // Kiểm tra email đã tồn tại chưa
       const checkUser = await users.findOne({ email });
       if (checkUser) {
           return res.status(400).json({ message: "User đã tồn tại trong hệ thống" });
       }

       // Hash mật khẩu và tạo user mới
       const newUser = await users.create({
           userName,
           password: bcrypt.hashSync(password, 10),
           email,
           role
       });

       res.status(201).json({ message: "Tạo user thành công", user: newUser });
   } catch (error) {
       res.status(500).json({ message: "Lỗi server", error: error.message });
   }
};


// thay đổi user theo id của user đó
const updateUser = async(req,res) =>{
   const {id} = req.params;
   const{userName,password}= req.body
   console.log(id);
   try {
      await users.findByIdAndUpdate(id,{
         userName,
         password:bcrypt.hashSync(password,10)
      })
      res.status(200).json({message:'Update thành công'})
   } catch (error) {
      res.status(500).json({message:error})
   }
}
const updateSelf = async (req, res) => {
   try {
      const userId = req.user.id; 
      const { userName, password } = req.body;
      const file = req.file;
      const findUser = await users.findById(userId);
      if (!findUser) {
         return res.status(404).json({ message: "Người dùng không tồn tại." });
      }
      const updatedUser = await users.findByIdAndUpdate(
         userId,
         {
            userName: userName || findUser.userName, 
            password: password ? bcrypt.hashSync(password, 10) : findUser.password,
            avartar: file ? file.path : findUser.avartar, 
         },
         { new: true } // trả về user mới
      );
      return res.status(200).json({ message: "Cập nhật thành công", user: updatedUser });
   } catch (error) {
      console.error("Lỗi khi cập nhật thông tin:", error);
      return res.status(500).json({ message: "Có lỗi xảy ra." });
   }
};


// xoá theo id của user đó
const deleteUser = async (req, res) => {
   const { id } = req.params;
   try {
     const findUser = await users.findById(id);
     if (!findUser) {
       return res.status(404).json({ message: "Không tìm thấy user" });
     }
     await users.findByIdAndDelete(id);
     res.status(200).json({ message: `Xóa thành công user ${findUser.userName}` });
   } catch (error) {
     res.status(500).json({ message: "Lỗi server" });
   }
 };


export {
   createUser,
   updateUser,
   updateSelf,
   deleteUser
}