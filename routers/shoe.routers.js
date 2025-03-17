import express from 'express';
import { craeteSize, createColor, createShoe, deleteShoe, deleteSize, deleteVariants, filterByShoePriceAndSize } from '../controllers/shoes.controller.js';
import { middlewareTokenAsyncKey } from '../config/jwt.js';
import { uploadCloud } from '../config/uploadCloud.js';
const shoeRouter = express.Router();
shoeRouter.post('/create',middlewareTokenAsyncKey,createShoe);
// dựa theo id của giày
shoeRouter.post('/createColor/:id',middlewareTokenAsyncKey,uploadCloud.single('shoeimage'),createColor);
// theo id của màu
shoeRouter.post('/createSize/:id',middlewareTokenAsyncKey, craeteSize);

shoeRouter.delete('/deleteSize/:id',middlewareTokenAsyncKey,deleteSize);
shoeRouter.delete('/deleleColor/:id',middlewareTokenAsyncKey,deleteVariants);
shoeRouter.delete('/deleteShoe',middlewareTokenAsyncKey,deleteShoe);
shoeRouter.get('/filter',filterByShoePriceAndSize);
export default shoeRouter