const express = require('express');
const { handleBuyNow, handlePlaceOrderFromCart, handleGetUserOrders, handleGetSingleOrderDetails, handleBuyNowFromGreenPoint } = require('../../controllers/orderController/orderController');
const router = express.Router();

router.post('/order/buy-now',  handleBuyNow);
router.post('/order/buy-now-from-green-point',  handleBuyNowFromGreenPoint);
router.post('/order/place-order-from-cart', handlePlaceOrderFromCart);
router.get('/my-orders',  handleGetUserOrders);
router.get('/my-orders/:orderId',  handleGetSingleOrderDetails);

module.exports = router;
