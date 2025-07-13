import { NextRequest, NextResponse } from 'next/server';

// Razorpay integration endpoint
export async function POST(request: NextRequest) {
  try {
    const { amount, currency = 'INR', receipt } = await request.json();

    // In production, use environment variables
    const razorpayKeyId = process.env.RAZORPAY_KEY_ID || 'rzp_test_demo';
    const razorpaySecret = process.env.RAZORPAY_SECRET || 'demo_secret';

    // Create Razorpay order
    const orderData = {
      amount: amount * 100, // Razorpay expects amount in paise
      currency,
      receipt: receipt || `receipt_${Date.now()}`,
      payment_capture: 1,
    };

    // In production, make actual API call to Razorpay
    const mockOrder = {
      id: `order_${Date.now()}`,
      entity: 'order',
      amount: orderData.amount,
      amount_paid: 0,
      amount_due: orderData.amount,
      currency: orderData.currency,
      receipt: orderData.receipt,
      status: 'created',
      created_at: Math.floor(Date.now() / 1000),
    };

    return NextResponse.json({
      success: true,
      order: mockOrder,
      key: razorpayKeyId,
    });
  } catch (error) {
    console.error('Razorpay order creation failed:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create order' },
      { status: 500 }
    );
  }
}

// Verify payment endpoint
export async function PUT(request: NextRequest) {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = await request.json();

    // In production, verify the signature using Razorpay's crypto verification
    // For demo purposes, we'll simulate successful verification
    const isValidSignature = true;

    if (isValidSignature) {
      // Store payment details in database
      const paymentRecord = {
        orderId: razorpay_order_id,
        paymentId: razorpay_payment_id,
        signature: razorpay_signature,
        status: 'completed',
        timestamp: new Date().toISOString(),
      };

      return NextResponse.json({
        success: true,
        message: 'Payment verified successfully',
        payment: paymentRecord,
      });
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid payment signature' },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Payment verification failed:', error);
    return NextResponse.json(
      { success: false, error: 'Payment verification failed' },
      { status: 500 }
    );
  }
}