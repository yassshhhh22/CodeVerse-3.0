import Razorpay from "razorpay";
import crypto from "crypto";
import logger from "../config/logger.js";

// Initialize Razorpay instance
export const razorpayInstance = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});

/**
 * Create Razorpay order
 * @param {number} amount - Amount in smallest currency unit (paise for INR)
 * @param {string} currency - Currency code (default: INR)
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Order object
 */
export const createOrder = async (amount, currency = "INR", options = {}) => {
  try {
    const orderOptions = {
      amount: amount * 100, // Convert to paise
      currency,
      receipt: `receipt_${Date.now()}`,
      ...options,
    };

    const order = await razorpayInstance.orders.create(orderOptions);
    logger.info(`Razorpay order created: ${order.id}`);
    return order;
  } catch (error) {
    logger.error("Razorpay order creation failed:", error);
    throw error;
  }
};

/**
 * Verify Razorpay payment signature
 * @param {string} orderId - Order ID
 * @param {string} paymentId - Payment ID
 * @param {string} signature - Razorpay signature
 * @returns {boolean} True if signature is valid
 */
export const verifyPaymentSignature = (orderId, paymentId, signature) => {
  try {
    const generatedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${orderId}|${paymentId}`)
      .digest("hex");

    const isValid = generatedSignature === signature;

    if (isValid) {
      logger.info(`Payment verified successfully: ${paymentId}`);
    } else {
      logger.warn(`Payment verification failed: ${paymentId}`);
    }

    return isValid;
  } catch (error) {
    logger.error("Payment verification error:", error);
    return false;
  }
};

/**
 * Get payment details
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Object>} Payment details
 */
export const getPaymentDetails = async (paymentId) => {
  try {
    const payment = await razorpayInstance.payments.fetch(paymentId);
    return payment;
  } catch (error) {
    logger.error("Failed to fetch payment details:", error);
    throw error;
  }
};

/**
 * Capture payment
 * @param {string} paymentId - Payment ID
 * @param {number} amount - Amount to capture in smallest currency unit
 * @param {string} currency - Currency code
 * @returns {Promise<Object>} Captured payment details
 */
export const capturePayment = async (paymentId, amount, currency = "INR") => {
  try {
    const payment = await razorpayInstance.payments.capture(
      paymentId,
      amount * 100,
      currency
    );
    logger.info(`Payment captured: ${paymentId}`);
    return payment;
  } catch (error) {
    logger.error("Payment capture failed:", error);
    throw error;
  }
};

/**
 * Create refund
 * @param {string} paymentId - Payment ID
 * @param {number} amount - Amount to refund (optional, full refund if not provided)
 * @returns {Promise<Object>} Refund details
 */
export const createRefund = async (paymentId, amount = null) => {
  try {
    const refundOptions = { payment_id: paymentId };
    if (amount) {
      refundOptions.amount = amount * 100;
    }

    const refund = await razorpayInstance.payments.refund(
      paymentId,
      refundOptions
    );
    logger.info(`Refund created: ${refund.id} for payment: ${paymentId}`);
    return refund;
  } catch (error) {
    logger.error("Refund creation failed:", error);
    throw error;
  }
};

/**
 * Get all refunds for a payment
 * @param {string} paymentId - Payment ID
 * @returns {Promise<Array>} List of refunds
 */
export const getRefunds = async (paymentId) => {
  try {
    const refunds = await razorpayInstance.payments.fetchMultipleRefund(
      paymentId
    );
    return refunds.items;
  } catch (error) {
    logger.error("Failed to fetch refunds:", error);
    throw error;
  }
};

/**
 * Get order details
 * @param {string} orderId - Order ID
 * @returns {Promise<Object>} Order details
 */
export const getOrderDetails = async (orderId) => {
  try {
    const order = await razorpayInstance.orders.fetch(orderId);
    return order;
  } catch (error) {
    logger.error("Failed to fetch order details:", error);
    throw error;
  }
};

/**
 * Get all payments for an order
 * @param {string} orderId - Order ID
 * @returns {Promise<Array>} List of payments
 */
export const getOrderPayments = async (orderId) => {
  try {
    const payments = await razorpayInstance.orders.fetchPayments(orderId);
    return payments.items;
  } catch (error) {
    logger.error("Failed to fetch order payments:", error);
    throw error;
  }
};

export default {
  razorpayInstance,
  createOrder,
  verifyPaymentSignature,
  getPaymentDetails,
  capturePayment,
  createRefund,
  getRefunds,
  getOrderDetails,
  getOrderPayments,
};
