import express from 'express';
import { createUser, deleteUser, detailSelf, getAlluser, getDetailUser, updateSelf, updateUser } from '../controllers/users.controller.js';
import { middlewareTokenAsyncKey } from '../config/jwt.js';
import { uploadCloud } from '../config/uploadCloud.js';

const userRouter = express.Router()
// thục ra thì create cũng phải là quyền admin ạ, nhma em để vậy trước cho dễ tạo
userRouter.post('/create',createUser)
userRouter.get('/get',middlewareTokenAsyncKey,getAlluser)
userRouter.get('/get/:id',getDetailUser)
userRouter.delete('/delete/:id',middlewareTokenAsyncKey,deleteUser)
userRouter.put(
   '/updateSelf',
   middlewareTokenAsyncKey, 
   uploadCloud.single('avatar'), 
   updateSelf 
 );
userRouter.put('/updateUser/:id',middlewareTokenAsyncKey,updateUser)
userRouter.get('/getdetailSelf',middlewareTokenAsyncKey,detailSelf)
export default userRouter;