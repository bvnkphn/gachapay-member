// src/components/PaymentPage.tsx
/**
 * Payment Page Component
 * Displays order details and payment information before checkout
 * แสดงรายละเอียดคำสั่งซื้อและข้อมูลการชำระเงิน
 */

'use client';

import React, { useEffect, useState } from 'react';
import { prepareOrderForPayment, PaymentOrderData } from '@/lib/payment-api';

interface PaymentPageProps {
    orderId: number;
    userId: number;
    onPaymentSuccess?: (orderId: number) => void;
    onPaymentCancel?: () => void;
}

export default function PaymentPage({
    orderId,
    userId,
    onPaymentSuccess,
    onPaymentCancel,
}: PaymentPageProps) {
    const [orderData, setOrderData] = useState<PaymentOrderData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [processing, setProcessing] = useState(false);

    // Load order data for payment
    useEffect(() => {
        const loadOrderData = async () => {
            setLoading(true);
            setError(null);

            const response = await prepareOrderForPayment(orderId, userId);

            if (response.success && response.data) {
                setOrderData(response.data);
            } else {
                setError(response.message || 'Failed to load order data');
            }

            setLoading(false);
        };

        loadOrderData();
    }, [orderId, userId]);

    const handlePaymentClick = async () => {
        setProcessing(true);
        try {
            // TODO: Integrate with actual payment gateway (Stripe, PayPal, 2C2P, etc.)
            // ประกาศใช้งานกับ Payment Gateway จริง

            console.log('Processing payment for order:', orderId);

            // Simulate payment processing
            await new Promise((resolve) => setTimeout(resolve, 2000));

            // Call success callback
            if (onPaymentSuccess) {
                onPaymentSuccess(orderId);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    const handleCancelPayment = () => {
        if (onPaymentCancel) {
            onPaymentCancel();
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">กำลังโหลดข้อมูลการชำระเงิน...</p>
                    <p className="text-sm text-gray-500">Loading payment information...</p>
                </div>
            </div>
        );
    }

    if (error || !orderData) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="max-w-2xl mx-auto px-4">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                        <h2 className="text-xl font-bold text-red-700 mb-4">ข้อผิดพลาด | Error</h2>
                        <p className="text-red-600 mb-6">{error || 'Order not found'}</p>
                        <button
                            onClick={handleCancelPayment}
                            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            กลับไป | Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-2xl mx-auto px-4 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">ชำระเงิน | Payment</h1>
                    <p className="text-gray-600 mt-2">Order #{orderData.orderId}</p>
                </div>

                {/* Order Details Section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-blue-600 text-white px-6 py-4">
                        <h2 className="text-xl font-bold">รายละเอียดคำสั่งซื้อ | Order Details</h2>
                    </div>

                    <div className="p-6 space-y-4">
                        {/* Game and Package Info */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                เกม | Game
                            </label>
                            <p className="text-lg font-semibold text-gray-900">
                                {orderData.orderDetails.gameName}
                            </p>
                        </div>

                        <div className="border-t pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                แพ็กเกจ | Package
                            </label>
                            <p className="text-lg font-semibold text-gray-900">
                                {orderData.orderDetails.packageName}
                            </p>
                            {orderData.orderDetails.packageDescription && (
                                <p className="text-sm text-gray-600 mt-1">
                                    {orderData.orderDetails.packageDescription}
                                </p>
                            )}
                        </div>

                        {/* Status */}
                        <div className="border-t pt-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                สถานะ | Status
                            </label>
                            <p className="text-lg font-semibold text-blue-600">{orderData.status}</p>
                            <p className="text-sm text-gray-600 mt-1">
                                {new Date(orderData.createdAt).toLocaleString('th-TH')}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Player Information Section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-green-600 text-white px-6 py-4">
                        <h2 className="text-xl font-bold">ข้อมูลผู้เล่น | Player Information</h2>
                    </div>

                    <div className="p-6 space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                อีเมล | Email
                            </label>
                            <p className="text-lg text-gray-900">{orderData.email}</p>
                        </div>

                        {orderData.playerInformation.gameUid && (
                            <div className="border-t pt-4">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Game UID / Player ID
                                </label>
                                <p className="text-lg font-mono text-gray-900">
                                    {orderData.playerInformation.gameUid}
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Price Section */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-purple-600 text-white px-6 py-4">
                        <h2 className="text-xl font-bold">ราคาและส่วนลด | Price Breakdown</h2>
                    </div>

                    <div className="p-6 space-y-3">
                        {/* Original Price */}
                        <div className="flex justify-between items-center pb-3 border-b">
                            <span className="text-gray-700">ราคาเดิม | Original Price</span>
                            <span className="text-lg font-semibold text-gray-900">
                                ฿{orderData.amounts.originalPrice.toFixed(2)}
                            </span>
                        </div>

                        {/* Discount */}
                        {orderData.amounts.discountAmount > 0 && (
                            <div className="flex justify-between items-center pb-3 border-b">
                                <div>
                                    <span className="text-gray-700">ส่วนลด | Discount</span>
                                    {orderData.couponCode && (
                                        <p className="text-sm text-green-600">Code: {orderData.couponCode}</p>
                                    )}
                                </div>
                                <span className="text-lg font-semibold text-green-600">
                                    -฿{orderData.amounts.discountAmount.toFixed(2)}
                                </span>
                            </div>
                        )}

                        {/* Final Price */}
                        <div className="flex justify-between items-center pt-3 bg-gray-50 p-3 rounded-lg">
                            <span className="text-lg font-bold text-gray-900">
                                ราคาสุดท้าย | Final Price
                            </span>
                            <span className="text-3xl font-bold text-blue-600">
                                ฿{orderData.amounts.finalPrice.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Payment Methods Section (Placeholder) */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="bg-indigo-600 text-white px-6 py-4">
                        <h2 className="text-xl font-bold">
                            วิธีการชำระเงิน | Payment Method
                        </h2>
                    </div>

                    <div className="p-6">
                        <div className="space-y-3">
                            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition">
                                <input
                                    type="radio"
                                    name="payment-method"
                                    value="2c2p"
                                    defaultChecked
                                    className="mr-3"
                                />
                                <span className="font-medium">2C2P (บัตรเครดิต/เดบิต)</span>
                            </label>

                            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition opacity-50">
                                <input
                                    type="radio"
                                    name="payment-method"
                                    value="stripe"
                                    disabled
                                    className="mr-3"
                                />
                                <span className="font-medium text-gray-500">
                                    Stripe (Coming Soon)
                                </span>
                            </label>

                            <label className="flex items-center p-4 border rounded-lg cursor-pointer hover:bg-gray-50 transition opacity-50">
                                <input
                                    type="radio"
                                    name="payment-method"
                                    value="paypal"
                                    disabled
                                    className="mr-3"
                                />
                                <span className="font-medium text-gray-500">
                                    PayPal (Coming Soon)
                                </span>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-4">
                    <button
                        onClick={handleCancelPayment}
                        className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition"
                    >
                        ยกเลิก | Cancel
                    </button>

                    <button
                        onClick={handlePaymentClick}
                        disabled={processing}
                        className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
                    >
                        {processing ? 'กำลังประมวลผล...' : 'ชำระเงิน'} | {processing ? 'Processing...' : 'Pay Now'}
                    </button>
                </div>

                {/* Footer Note */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-700">
                        💳 ข้อมูลของคุณปลอดภัย | Your payment information is secure
                    </p>
                </div>
            </div>
        </div>
    );
}
