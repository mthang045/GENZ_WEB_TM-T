import { Router, Request, Response } from 'express';
import { VNPay, ignoreLogger, ProductCode, VnpLocale, dateFormat } from 'vnpay';
import { ObjectId } from 'mongodb';
import { db } from '../app';
import { authMiddleware } from '../middleware/auth';

const router = Router();

// Initialize VNPay
const vnpay = new VNPay({
  tmnCode: process.env.VNP_TMN_CODE || 'TMNCODE',
  secureSecret: process.env.VNP_SECURE_SECRET || 'secret',
  vnpayHost: process.env.VNP_HOST || 'https://sandbox.vnpayment.vn',
  testMode: true,
  enableLog: false,
  loggerFn: ignoreLogger,
});

// Create VNPay payment (chưa tạo order)
router.post('/vnpay/create-payment', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { orderId, orderDescription, returnUrl }: { orderId?: string; orderDescription?: string; returnUrl: string } = req.body;

    if (!returnUrl) {
      return res.status(400).json({ error: 'Missing required field: returnUrl' });
    }

    // Nếu có orderId, lấy amount từ order hiện tại
    // Nếu không, frontend gửi amount
    let amount: number;
    
    if (orderId) {
      const ordersCollection = db.collection('orders');
      const order = await ordersCollection.findOne({ _id: new ObjectId(orderId) });
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }
      amount = order.totalAmount;
    } else {
      return res.status(400).json({ error: 'orderId is required' });
    }

    // Generate transaction ID nếu chưa có payment
    const txnRef = orderId;

    // Create payment URL
    const paymentUrl = vnpay.buildPaymentUrl({
      vnp_Amount: amount,
      vnp_IpAddr: req.ip || '127.0.0.1',
      vnp_Locale: VnpLocale.VN,
      vnp_OrderInfo: orderDescription || `Payment for order ${orderId}`,
      vnp_ReturnUrl: returnUrl,
      vnp_TxnRef: txnRef,
      vnp_CreateDate: dateFormat(new Date()),
    });

    // Save pending payment record
    const paymentsCollection = db.collection('payments');
    const paymentRecord = {
      orderId: new ObjectId(orderId),
      txnRef,
      amount,
      status: 'pending',
      paymentUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await paymentsCollection.updateOne(
      { txnRef },
      { $set: paymentRecord },
      { upsert: true }
    );

    res.json({
      success: true,
      paymentUrl,
      message: 'Payment URL created successfully',
    });
  } catch (error) {
    console.error('Error creating VNPay payment:', error);
    res.status(500).json({ error: 'Failed to create payment URL' });
  }
});

// Handle VNPay return callback (user returned from VNPay gateway)
router.get('/vnpay/return', async (req: Request, res: Response) => {
  try {
    const vnp_Params: any = req.query;
    const secureHash = vnp_Params.vnp_SecureHash as string;
    delete vnp_Params.vnp_SecureHash;
    delete vnp_Params.vnp_SecureHashType;
    const isValid = vnpay.verifyReturnUrl({
      ...vnp_Params,
      vnp_SecureHash: secureHash,
    });
    if (!isValid) {
      return res.status(400).json({
        success: false,
        message: 'Invalid signature',
      });
    }
    const txnRef = vnp_Params.vnp_TxnRef as string;
    const responseCode = vnp_Params.vnp_ResponseCode as string;
    const transactionNo = vnp_Params.vnp_TransactionNo as string;
    const bankCode = vnp_Params.vnp_BankCode as string;
    const payDate = vnp_Params.vnp_PayDate as string;
    const paymentsCollection = db.collection('payments');
    const ordersCollection = db.collection('orders');
    const payment = await paymentsCollection.findOne({ txnRef });
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment not found',
      });
    }
    const paymentStatus = responseCode === '00' ? 'completed' : 'failed';
    await paymentsCollection.updateOne(
      { txnRef },
      {
        $set: {
          status: paymentStatus,
          transactionNo,
          bankCode,
          payDate,
          responseCode,
          updatedAt: new Date(),
        },
      }
    );
    console.log(`[VNPay Return] txnRef: ${txnRef}, status: ${paymentStatus}, orderId: ${payment.orderId}`);
    // Cập nhật trạng thái đơn hàng
    if (paymentStatus === 'completed') {
      await ordersCollection.updateOne(
        { _id: payment.orderId },
        {
          $set: {
            paymentStatus: 'completed',
            paymentMethod: 'vnpay',
            status: 'confirmed',
            updatedAt: new Date(),
          },
        }
      );
      
      // Giảm inventory khi thanh toán VNPay thành công
      const order = await ordersCollection.findOne({ _id: payment.orderId });
      if (order && order.items) {
        const productsCollection = db.collection('products');
        for (const item of order.items) {
          try {
            const productId = new ObjectId(item.productId);
            const product = await productsCollection.findOne({ _id: productId });
            
            if (product && product.stock) {
              // Tìm stock variant (color + size) và giảm quantity
              const stockVariant = product.stock.find(
                (s: any) => s.color === item.color && s.size === item.size
              );
              
              if (stockVariant) {
                const newQuantity = Math.max(0, stockVariant.quantity - item.quantity);
                
                // Update stock array
                await productsCollection.updateOne(
                  { _id: productId, 'stock.color': item.color, 'stock.size': item.size },
                  { $set: { 'stock.$.quantity': newQuantity, updatedAt: new Date() } }
                );
                
                console.log(`[VNPay Inventory] Reduced ${item.productName} (${item.color}/${item.size}): ${stockVariant.quantity} → ${newQuantity}`);
              }
            }
          } catch (err) {
            console.error(`[VNPay Inventory Error] Failed to update product ${item.productId}:`, err);
          }
        }
      }
    } else {
      // Nếu thanh toán thất bại, xóa order
      console.log(`[VNPay Return] Deleting order: ${payment.orderId}`);
      const deleteResult = await ordersCollection.deleteOne({ _id: payment.orderId });
      console.log(`[VNPay Return] Delete result: ${deleteResult.deletedCount}`);
    }
    // Return response (typically redirect to frontend with status)
    const frontendReturnUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
    const redirectUrl = `${frontendReturnUrl}/checkout/success?status=${paymentStatus}&txnRef=${txnRef}&transactionNo=${transactionNo}`;

    res.redirect(redirectUrl);
  } catch (error) {
    console.error('Error processing VNPay return:', error);
    res.status(500).json({ error: 'Failed to process payment return' });
  }
});

// Get payment status
router.get('/vnpay/status/:txnRef', authMiddleware, async (req: Request, res: Response) => {
  try {
    const { txnRef } = req.params;

    const paymentsCollection = db.collection('payments');
    const payment = await paymentsCollection.findOne({ txnRef });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found' });
    }

    res.json({
      success: true,
      data: {
        txnRef: payment.txnRef,
        status: payment.status,
        amount: payment.amount,
        transactionNo: payment.transactionNo,
        bankCode: payment.bankCode,
        payDate: payment.payDate,
        createdAt: payment.createdAt,
        updatedAt: payment.updatedAt,
      },
    });
  } catch (error) {
    console.error('Error fetching payment status:', error);
    res.status(500).json({ error: 'Failed to fetch payment status' });
  }
});

export default router;