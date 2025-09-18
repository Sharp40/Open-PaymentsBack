import {getProduct, getProducts} from '../controllers/products.controller.js';
import { Router } from 'express';

const router = Router();

router.get('/products', getProducts);
router.get('/products/:id', getProduct);

export default router;