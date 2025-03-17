import { colors, shoes, sizes } from "../config/model/DE170023.js";
import { checkAdmin } from "./users.controller.js";
const createShoe = async (req, res) => {
   const { name, price, brand, category, description } = req.body;
   const file = req.file; 
   try {
     if (!name || !price || !brand || !category) {
       return res.status(400).json({ 
         message: "Thiếu thông tin bắt buộc (name, price, brand, category)" 
       });
     }
     if (!file) {
       return res.status(400).json({ message: "Vui lòng upload ảnh sản phẩm" });
     }
 

     const newShoe = new Shoe({
       name,
       price: Number(price),
       brand,
       category,
       description: description || "", 
       image_url: file.path 
     });
     await newShoe.save();
     res.status(201).json({
       message: "Tạo sản phẩm thành công",
       shoe: newShoe
     });
 
   } catch (error) {
     console.error("Lỗi khi tạo giày:", error);
     if (error.name === 'ValidationError') {
       return res.status(400).json({
         message: "Dữ liệu không hợp lệ",
         errors: Object.values(error.errors).map(e => e.message)
       });
     }
     res.status(500).json({ 
       message: "Lỗi server", 
       error: error.message 
     });
   }
 };
 // chỗ này cho mỗi màu mỗi code
 const createColor = async(req,res)=>{
  // lấy id giày 
  const {id} = req.params;
  const userId = req.user.id;
  const {name} = req.body;
  const file = req.file;
   try {
      const check = await checkAdmin(userId);
      if(!check){
        res.status(400).json({message:"Không có quyền"})
      }
      if(!name || !file){
        res.status(400).json({message:"Phải có cẩ 2 fields"})
      }
      const newColor = await colors.create({
          color:{
            name,
          },
          images:file.path
      })
      await shoes.findByIdAndUpdate(
        id
        ,{
          variants:newColor._id
        }) 
        res.status(200).json({message:'Create success'})
   } catch (error) {
      res.status(500).json({message:error})
   }
 }
 // size có match tới màu
 const craeteSize = async(req,res) =>{
    const {size,stock} = req.body;
    const userId = req.user.id
    const {id} = req.params;
    try {
      const check = await checkAdmin(userId);
      if(!check){
        res.status(400).json({message:'Không xác thực'})
      }
      const newSize = await sizes.create({
        size,
        stock
      })
      await colors.findByIdAndUpdate(
        id
        ,{
          sizes:newSize._id
        })
      res.status(200).json({message:newSize})
    } catch (error) {
      res.status(500).json({message:error})
    }
 }

//
 const deleteSize = async(req,res) =>{
  const userId = req.user.id ;
  const {id} = req.params;
  try {
    const check = await checkAdmin(userId);
    if(!check){
      res.status(400).json({message:"Kh xác thực"})
    }
    //
    const findSize = await sizes.findByIdAndDelete({id});
    
    if(!findSize){
      res.status(400).json({message:"404 not found"})
    }
    res.status(200).json({message:"delete successful"})
  } catch (error) {
    res.status(500).json({message:error})
  }
 }

 const deleteVariants = async(req,res) =>{
 const userId = req.user.id ;
  const {id} = req.params;
  try {
    const check = await checkAdmin(userId);
    if(!check){
      res.status(400).json({message:"Kh xác thực"})
    }
    // chú ý chỗ deletemany
    const findVariants = await colors.findById(id);
    await sizes.deleteMany({_id:{$in:findVariants.sizes}})
    await colors.findByIdAndDelete(id)
    res.status(200).json({message:"delete successful"})
  } catch (error) {
    res.status(500).json({message:error})
  }
 }
 const deleteShoe = async(req,res)=>{
  const userId = req.user.id ;
  const {id} = req.params;
  try {
    const check = await checkAdmin(userId);
    if(!check){
      res.status(400).json({message:"Kh xác thực"})
    }
    const findShoe = await shoes.findById(id);
    // kiếm màu trong cái shoe
    const findVariants = await colors.findById(findShoe.variants);
    // xóa size trước
    const findSize = await sizes.deleteMany({_id:findVariants.sizes})
    await colors.deleteMany({_id:findShoe.variants});
    await shoes.deleteOne({_id:id})
    res.status(200).json({message:"Delete success"})
  }catch(error){
    res.status(500).json({message:error})
  }
 }

 export {createShoe,createColor,craeteSize,deleteSize,deleteVariants,deleteShoe}