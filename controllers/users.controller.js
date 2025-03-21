import { users } from "../config/model/DE170023.js";
import bcrypt from "bcrypt";

export const checkAdmin = async (userId) => {
   try {
     const user = await users.findById(userId);
     if (!user) {
       throw new Error("Người dùng không tồn tại.");
     }
     return user.role === 'admin';
   } catch (error) {
     console.error("Lỗi khi kiểm tra quyền admin:", error.message);
     return false;
   }
 };

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
           password: bcrypt.hashSync(password, 12),
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
   // check admin
   const {id} = req.params;
   const{userName,password}= req.body
   console.log(id);
   const userId = req.user.id
   try {
      const isAdmin = await checkAdmin(userId);
    if (!isAdmin) {
      return res.status(403).json({ message: "Bạn không có quyền thực hiện thao tác này." });
    }

      await users.findByIdAndUpdate(id,{
         userName,
         password:bcrypt.hashSync(password,12)
      })
      res.status(200).json({message:'Update thành công'})
   } catch (error) {
      res.status(500).json({message:error})
   }
}
// nhớ file ảnh
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
            password: password ? bcrypt.hashSync(password,12) : findUser.password,
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
   // check admin
   const userId = req.user.id
   const { id } = req.params;
   try {
   const isAdmin = await checkAdmin(userId);
    if (!isAdmin) {
      return res.status(403).json({ message: "Bạn không có quyền thực hiện thao tác này." });
    }

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




const getAlluser = async(req,res) => {
   const userId = req.user.id
   try {
      const isAdmin = await checkAdmin(userId);
    if (!isAdmin) {
      return res.status(403).json({ message: "Bạn không có quyền thực hiện thao tác này." });
    }

   const user = await users.find();
         res.status(200).json({user})
   } catch (error) {
      res.status(500).json({message:error})
   }
}

const getDetailUser = async(req,res) =>{
   const {id} = req.params;
   try {
      const data = await users.findById(id);
      res.status(200).json({data})
   } catch (error) {
      res.status(500).json({message:error})
   }
}
const detailSelf = async(req,res) =>{
   const userId = req.user.id;
   try {
      const findUser = await users.findById(userId)
      res.status(200).json({findUser})
   } catch (error) {
      res.status(500).json({message:error})
   }
}
export {
   createUser,
   updateUser,
   updateSelf,
   deleteUser,
   getAlluser,
   getDetailUser,
   detailSelf
}