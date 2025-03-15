import multer from "multer";
//  để v2 vì nó có nhiều version á, v1 v2 v3, ỗi cái scos 1 cách dùng khá nhau
import {v2 as cloudinary} from 'cloudinary';
import {CloudinaryStorage} from 'multer-storage-cloudinary';
import dotenv from 'dotenv';
dotenv.config();
cloudinary.config({
   cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
   api_key: process.env.CLOUDINARY_API_KEY,
   api_secret :process.env.CLOUDINARY_API_SECRET
});
const storage = new CloudinaryStorage({
   cloudinary,
   params:{
      folder:"shoefile", 
      format: async (req, file) => {
         const validImgFormat = ['png', 'webp', 'heic', 'gif', 'jpeg'];
         const fileFormat = file.mimetype.split('/')[1];
         if (validImgFormat.includes(fileFormat)) {
             return fileFormat;
         }
         return 'png';
     },
     
      //  define tên ảnh
      public_id : (req,file) =>file.originalname.split(".")[0]
   }
}); // đằng trên là setup mọi thứ định nghĩa bla bla
// khởi tạo multer với cloudinary storage
   export const uploadCloud = multer({storage})
// imginstagramsfile