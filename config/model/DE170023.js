import mongoose from "mongoose";
import bcrypt from 'bcrypt';
const {Schema} = mongoose;
const user = new Schema({
   email:{
      type:String,
      required:true
   },
   userName:{
      type:String,
      required:[true,"Name can not be null"],
      trim:true,
      unique:true
   },
   password:{
      type:String,
      required:true
   },
   role:{
      type:String,
      enum :["user","admin"],
      default:"user"
   },
   facebook_id:{
      type:String,
      required:false
   },
   // avartar có thể có có thể không ha
   avartar:{
      type:String,
      required:false
   }
})
const sizeSchema = new Schema({
   size: { type: Number, required: true }, // VD: 38, 39, 40
   stock: { type: Number, required: true, default: 0 } // Số lượng tồn kho của size đó
 });

const variantSchema = new Schema({
  color: {
    name: { type: String, required: true }, // VD: "Red"
    code: { type: String, required: true }  // VD: "#FF0000"
  },
  sizes: [sizeSchema], // Danh sách size + số lượng tồn kho
  images: [{ type: String, required: true }] // Ảnh theo màu
});

const shoe = new Schema({
   name:{
      type:String,
      required:true
   },
   price:{
      type:Number,
      required:true
   },
   brand:{
      type:String,
      enum: [
         "Nike", "Adidas", "Puma", "Converse", "Vans", 
         "New Balance", "Balenciaga", 
         "Biti’s", "Thượng Đình", "Vina Giày", "Ananas", "Asia Sport" 
      ],
   },
   category:{
      type:String,
      enum:[ "Giày thể thao", 
         "Giày thời trang", 
         "Giày công sở", 
         "Giày sneaker", 
         "Giày boot", 
         "Giày sandal", 
         "Giày slip-on"],
      required:true
   },

},{ timestamps: true })

const banner =  new Schema({
   image:{
      type:String,
      required:true
   },
   description:{
      type:String
   }
})

const contact = new Schema({
   name:{
      type:String,
      required:true
   },
   email:{
      type:String,
      required:true
   },
   contact:{
      type:String,
      required:true
   }
})


// nhớ mã hóa ở chiều tạo và giải mã ở đầu chiều mở

const users = mongoose.model('users',user )
const shoes = mongoose.model('shoes',shoe)
const sizes = mongoose.model('sizes', sizeSchema )
const colors = mongoose.model('colorShoes', variantSchema)
const banners = mongoose.model('banners',banner)
const contacts = mongoose.model('contacts', contact)

export {users, contacts,shoes,sizes,colors,banners}