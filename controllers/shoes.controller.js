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
const shoeDeltail = async(req,res) =>{
  const {id} = req.params
  try {
    const findShoe = await shoes.findOne({_id:id}).populate('colorShoes').populate('sizes');
    res.status(200).json({findShoe})
  } catch (error) {
    res.status(500).json({message:error})
  }
}
// tí check lại cái này
//http://localhost:8080/shoes/filter?minPrice=100&maxPrice=500&size=40&color=red&page=1&limit=10

const filterByShoePriceAndSize = async (req, res) => {
  const { minPrice, maxPrice, size, color, page = 1, limit = 10 } = req.query;

  try {
    let query = {};

    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = Number(minPrice);
      if (maxPrice) query.price.$lte = Number(maxPrice);
    }

    // Kết hợp điều kiện size và color trong cùng một variant bằng $elemMatch
    if (size || color) {
      query.variants = {
        $elemMatch: {}
      };
      if (size) {
        query.variants.$elemMatch["sizes.size"] = Number(size);
      }
      if (color) {
        query.variants.$elemMatch["color.name"] = color;
      }
    }

    // Phân trang và thực hiện truy vấn (không cần populate vì variants là embedded document)
    const shoesList = await shoes
      .find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.status(200).json({ shoes: shoesList });
  } catch (error) {
    res.status(500).json({ message: "Lỗi server", error: error.message });
  }
};


 export {createShoe,createColor,craeteSize,deleteSize,deleteVariants,deleteShoe,shoeDeltail,filterByShoePriceAndSize}