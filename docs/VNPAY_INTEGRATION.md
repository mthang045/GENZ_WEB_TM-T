# VNPay Integration Guide

## Overview

VNPay payment integration allows customers to pay for their orders using VNPay gateway. This implementation includes:

- Payment URL creation
- Payment verification and validation
- IPN (Instant Payment Notification) handling
- Payment status tracking

## Setup

### 1. Environment Variables

Add the following to your `.env` file:

```env
VNP_TMN_CODE=your_merchant_code
VNP_SECURE_SECRET=your_secure_secret
VNP_HOST=https://sandbox.vnpayment.vn  # or https://api.vnpayment.vn for production
FRONTEND_URL=http://localhost:5173
```

### 2. Get VNPay Credentials

1. Register at [VNPay Merchant Portal](https://merchant.vnpayment.vn)
2. Get your Merchant Code (TMN Code) and Secure Secret
3. Use sandbox for testing and production endpoint for live

## API Endpoints

### 1. Create Payment

**POST** `/api/vnpay/create-payment`

Creates a VNPay payment URL for an order.

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
Content-Type: application/json
```

**Request Body:**
```json
{
  "orderId": "order_mongodb_id",
  "amount": 100000,
  "orderDescription": "Payment for order",
  "returnUrl": "http://localhost:5173/checkout/success"
}
```

**Response:**
```json
{
  "success": true,
  "paymentUrl": "https://sandbox.vnpayment.vn/paygate?...",
  "message": "Payment URL created successfully",
  "paymentId": "payment_mongodb_id"
}
```

### 2. Return Callback

**GET** `/api/vnpay/return`

VNPay redirects the user to this URL after payment completion.

**Query Parameters:**
- `vnp_Amount`: Amount in VND × 100
- `vnp_BankCode`: Bank code
- `vnp_BankTranNo`: Bank transaction number
- `vnp_CardType`: Card type
- `vnp_OrderInfo`: Order information
- `vnp_PayDate`: Payment date
- `vnp_ResponseCode`: Response code (00 = success)
- `vnp_SecureHash`: Secure hash for verification
- `vnp_TmnCode`: Merchant code
- `vnp_TransactionNo`: VNPay transaction number
- `vnp_TxnRef`: Transaction reference (Order ID)

### 3. IPN Notification

**POST** `/api/vnpay/ipn`

VNPay sends server-to-server notification to this endpoint.

**Response Format:**
```json
{
  "RspCode": "00",
  "Message": "Confirm received"
}
```

Response Codes:
- `00`: Confirm success
- `01`: Order not found
- `02`: Order already confirmed
- `04`: Invalid amount
- `97`: Invalid signature
- `99`: Internal server error

### 4. Get Payment Status

**GET** `/api/vnpay/status/:txnRef`

Get the status of a specific payment.

**Request Headers:**
```
Authorization: Bearer <JWT_TOKEN>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "txnRef": "order_id",
    "status": "completed|failed|pending",
    "amount": 100000,
    "transactionNo": "24101500001234",
    "bankCode": "NCB",
    "payDate": "20241015120000",
    "createdAt": "2024-10-15T12:00:00Z",
    "updatedAt": "2024-10-15T12:05:00Z"
  }
}
```

## Frontend Integration

### 1. Create Order

First, create an order via the `/api/orders` endpoint:

```javascript
const orderResponse = await fetch('/api/orders', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    items: [...],
    customerInfo: {...},
    totalAmount: 100000,
    paymentMethod: 'vnpay'
  })
});

const { data: order } = await orderResponse.json();
```

### 2. Create Payment URL

```javascript
const paymentResponse = await fetch('/api/vnpay/create-payment', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    orderId: order._id,
    amount: order.totalAmount,
    orderDescription: `Payment for order ${order.orderId}`,
    returnUrl: `${window.location.origin}/checkout/success`
  })
});

const { paymentUrl } = await paymentResponse.json();
```

### 3. Redirect to VNPay

```javascript
// Redirect user to payment gateway
window.location.href = paymentUrl;
```

### 4. Handle Return

Create a page at `/checkout/success` to handle the return:

```typescript
// Extract query parameters
const searchParams = new URLSearchParams(window.location.search);
const status = searchParams.get('status');
const txnRef = searchParams.get('txnRef');

if (status === 'completed') {
  // Payment successful - show success message
  // Optionally fetch order details to confirm
  const orderResponse = await fetch(`/api/vnpay/status/${txnRef}`, {
    headers: {
      'Authorization': `Bearer ${token}`
    }
  });
  const paymentData = await orderResponse.json();
  // Display success message
} else {
  // Payment failed
  // Show error message and allow retry
}
```

## Database Schema

### Payments Collection

```javascript
{
  _id: ObjectId,
  orderId: ObjectId,      // Reference to orders collection
  txnRef: string,         // Order ID (transaction reference)
  amount: number,         // Amount in VND
  status: string,         // 'pending' | 'completed' | 'failed'
  paymentUrl: string,     // VNPay payment URL
  transactionNo: string,  // VNPay transaction number
  bankCode: string,       // Bank code (e.g., 'NCB', 'VIETCOM')
  payDate: string,        // Payment date from VNPay
  responseCode: string,   // VNPay response code
  createdAt: Date,
  updatedAt: Date
}
```

## Testing

### Sandbox Testing

1. Use merchant account: `TMNCODE` (sandbox)
2. Secure Secret: `SECRETKEY` (sandbox)
3. Test card numbers:
   - `9704198526191432198` (Valid card)
   - `9704198526191432200` (Locked card)

### Test Procedures

1. Create an order
2. Get payment URL
3. Redirect to VNPay
4. Use test card to complete payment
5. Check IPN logs and database updates

## Security Considerations

1. **Hash Verification**: All requests are verified using SHA512 hash with secure secret
2. **Amount Verification**: IPN verifies that the amount matches the original order
3. **Transaction Deduplication**: Prevents processing the same transaction twice
4. **HTTPS Only**: Always use HTTPS in production
5. **Secret Key Protection**: Never expose `VNP_SECURE_SECRET` in frontend code

## Troubleshooting

### IPN Not Received

- Check VNPay merchant settings for correct IPN URL
- Verify firewall/network allows VNPay to connect
- Check server logs for errors
- Ensure endpoint is publicly accessible

### Hash Verification Failed

- Verify `VNP_SECURE_SECRET` is correct
- Check that secure secret matches VNPay settings
- Ensure all parameters are included in hash

### Payment Stuck in Pending

- Check IPN logs in VNPay admin
- Verify database transaction was updated
- Check for network connectivity issues
- Try manual verification via status endpoint

## References

- [VNPay Documentation](https://docs.vnpayment.vn)
- [VNPay Integration Guide](https://merchant.vnpayment.vn/docs)
- [vnpay npm package](https://www.npmjs.com/package/vnpay)
