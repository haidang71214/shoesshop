import mongoose from "mongoose";
import bcrypt from 'bcrypt';
const {Schema} = mongoose;
const user = new Schema({
   userName:{
      type:String,
      require:[true,"Name can not be null"],
      trim:true,
      unique:true
   },
   password:{
      type:String,
      require:true
   },
   role:{
      type:String,
      enum :["user","admin"],
      default:"user"
     },
})
 mongoose.model('users',user )
export {user }