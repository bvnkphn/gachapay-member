// src/components/PaymentPage.tsx
/**
 * Payment Page Component - Complete Payment Flow
 * Manages payment method selection, processing, and results
 * จัดการการเลือกช่องทางชำระเงิน ประมวลผล และผลลัพธ์
 */

'use client';

import React, { useEffect, useState } from 'react';
import { ChevronLeft, Loader2 } from 'lucide-react';
import { prepareOrderForPayment, PaymentOrderData } from '@/lib/payment-api';
import PaymentMethodSelector, { PaymentMethod } from './PaymentMethodSelector';
import GachaWalletPayment from './GachaWalletPayment';
import QRCodeDisplay from './QRCodeDisplay';
import PaymentProcessing from './PaymentProcessing';
import PaymentSuccess from './PaymentSuccess';
import PaymentFailed from './PaymentFailed';

interface PaymentPageProps {
    orderId: number;
    userId: number;
    onPaymentSuccess?: (orderId: number) => void;
    onPaymentCancel?: () => void;
}

type PaymentStep = 'method_selection' | 'wallet_payment' | 'qr_payment' | 'processing' | 'success' | 'failed';

interface PaymentState {
    step: PaymentStep;
    selectedMethod: PaymentMethod | null;
    walletBalance: number;
    qrCode?: string;
    referenceNumber?: string;
    failureReason?: string;
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
    
    const [paymentState, setPaymentState] = useState<PaymentState>({
        step: 'method_selection',
        selectedMethod: null,
        walletBalance: 0,
    });

    // Load order data for payment
    useEffect(() => {
        const loadOrderData = async () => {
            setLoading(true);
            setError(null);

            const response = await prepareOrderForPayment(orderId, userId);

            if (response.success && response.data) {
                setOrderData(response.data);
                // Fetch wallet balance
                await fetchWalletBalance();
            } else {
                setError(response.message || 'Failed to load order data');
            }

            setLoading(false);
        };

        loadOrderData();
    }, [orderId, userId]);

    const fetchWalletBalance = async () => {
        try {
            const response = await fetch('/api/wallets/balance');
            const data = await response.json();
            if (data.success) {
                setPaymentState((prev) => ({
                    ...prev,
                    walletBalance: data.data?.balance || 0,
                }));
            }
        } catch (err) {
            console.error('Failed to fetch wallet balance:', err);
        }
    };

    const handleMethodSelect = async (method: PaymentMethod) => {
        setPaymentState((prev) => ({
            ...prev,
            selectedMethod: method,
        }));

        if (method === 'gacha_wallet') {
            setPaymentState((prev) => ({
                ...prev,
                step: 'wallet_payment',
            }));
        } else {
            // Fetch QR code for QR-based payments
            await generateQRCode(method);
        }
    };

    const generateQRCode = async (method: PaymentMethod) => {
        try {
            const response = await fetch('/api/payments/generate-qr', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    orderId,
                    amount: orderData?.amounts.finalPrice,
                    method,
                }),
            });

            const data = await response.json();
            if (data.success) {
                setPaymentState((prev) => ({
                    ...prev,
                    qrCode: data.data?.qrCode,
                    referenceNumber: data.data?.referenceNumber,
                    step: 'qr_payment',
                }));
            } else {
                throw new Error(data.message || 'Failed to generate QR code');
            }
        } catch (err) {
            const errorMsg = err instanceof Error ? err.message : 'Failed to generate QR code';
            setError(errorMsg);
            setPaymentState((prev) => ({
                ...prev,
                step: 'method_selection',
                selectedMethod: null,
            }));
        }
    };

    const handleWalletPaymentSuccess = () => {
        setPaymentState((prev) => ({
            ...prev,
            step: 'processing',
        }));

        // After processing completes
        setTimeout(() => {
            setPaymentState((prev) => ({
                ...prev,
                step: 'success',
            }));
            if (onPaymentSuccess) {
                onPaymentSuccess(orderId);
            }
        }, 2000);
    };

    const handleWalletPaymentFail = (error: string) => {
        setPaymentState((prev) => ({
            ...prev,
            step: 'failed',
            failureReason: 'insufficient_balance',
        }));
    };

    const handleQRPaymentCancel = () => {
        setPaymentState((prev) => ({
            ...prev,
            step: 'method_selection',
            selectedMethod: null,
        }));
    };

    const handlePaymentComplete = (success: boolean, message: string) => {
        if (success) {
            setPaymentState((prev) => ({
                ...prev,
                step: 'success',
            }));
            if (onPaymentSuccess) {
                onPaymentSuccess(orderId);
            }
        } else {
            setPaymentState((prev) => ({
                ...prev,
                step: 'failed',
                failureReason: 'timeout',
            }));
        }
    };

    const handleRetryPayment = () => {
        setPaymentState((prev) => ({
            ...prev,
            step: 'method_selection',
            selectedMethod: null,
        }));
    };

    const handleChangePaymentMethod = () => {
        setPaymentState((prev) => ({
            ...prev,
            step: 'method_selection',
            selectedMethod: null,
        }));
    };

    const handleGoHome = () => {
        window.location.href = '/';
    };

    const handleViewOrder = () => {
        window.location.href = `/history/${orderId}`;
    };

    const handleContactSupport = () => {
        window.location.href = `/support?orderId=${orderId}`;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <Loader2 className="w-12 h-12 animate-spin text-blue-600 mx-auto" />
                    <p className="mt-4 text-gray-600 font-medium">กำลังโหลดข้อมูลการชำระเงิน...</p>
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
                            onClick={onPaymentCancel}
                            className="w-full py-2 px-4 bg-red-600 text-white rounded-lg hover:bg-red-700 transition"
                        >
                            กลับไป | Go Back
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // Render Payment Step Container
    const renderPaymentStep = () => {
        switch (paymentState.step) {
            case 'method_selection':
                return (
                    <PaymentMethodSelector
                        selectedMethod={paymentState.selectedMethod}
                        onMethodSelect={handleMethodSelect}
                        walletBalance={paymentState.walletBalance}
                        finalPrice={orderData?.amounts.finalPrice || 0}
                        disabled={false}
                    />
                );

            case 'wallet_payment':
                return (
                    <GachaWalletPayment
                        walletBalance={paymentState.walletBalance}
                        finalPrice={orderData?.amounts.finalPrice || 0}
                        orderId={orderId}
                        onPaymentSuccess={handleWalletPaymentSuccess}
                        onPaymentFail={handleWalletPaymentFail}
                        onCancel={handleQRPaymentCancel}
                    />
                );

            case 'qr_payment':
                return (
                    <QRCodeDisplay
                        orderId={orderId}
                        amount={orderData?.amounts.finalPrice || 0}
                        paymentMethod={paymentState.selectedMethod as 'promptpay' | 'truemoney'}
                        qrCodeUrl={paymentState.qrCode || ''}
                        referenceNumber={paymentState.referenceNumber || ''}
                        expiryTime={180}
                        onCancel={handleQRPaymentCancel}
                        onReportIssue={handleContactSupport}
                    />
                );

            case 'processing':
                return (
                    <PaymentProcessing
                        orderId={orderId}
                        paymentMethod={paymentState.selectedMethod || 'gacha_wallet'}
                        amount={orderData?.amounts.finalPrice || 0}
                        onComplete={handlePaymentComplete}
                    />
                );

            case 'success':
                return (
                    <PaymentSuccess
                        orderId={orderId}
                        gameName={orderData?.orderDetails.gameName || ''}
                        packageName={orderData?.orderDetails.packageName || ''}
                        amount={orderData?.amounts.finalPrice || 0}
                        paymentMethod={paymentState.selectedMethod || 'gacha_wallet'}
                        createdAt={orderData?.createdAt || new Date().toISOString()}
                        onGoHome={handleGoHome}
                        onViewOrder={handleViewOrder}
                    />
                );

            case 'failed':
                return (
                    <PaymentFailed
                        orderId={orderId}
                        gameName={orderData?.orderDetails.gameName || ''}
                        packageName={orderData?.orderDetails.packageName || ''}
                        amount={orderData?.amounts.finalPrice || 0}
                        paymentMethod={paymentState.selectedMethod || 'gacha_wallet'}
                        failureReason={paymentState.failureReason || 'unknown'}
                        onRetry={handleRetryPayment}
                        onChangeMethod={handleChangePaymentMethod}
                        onContactSupport={handleContactSupport}
                        onGoBack={() => window.history.back()}
                    />
                );

            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 space-y-6">
                {/* Back Button */}
                {(paymentState.step === 'method_selection' || paymentState.step === 'wallet_payment' || paymentState.step === 'qr_payment') && (
                    <button
                        onClick={onPaymentCancel}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        ย้อนกลับ | Back
                    </button>
                )}

                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">ชำระเงิน | Payment</h1>
                    <p className="text-gray-600 mt-2">Order #{orderData?.orderId}</p>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                        <p className="text-red-700">❌ {error}</p>
                    </div>
                )}

                {/* Main Payment Section */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Payment Processor */}
                    <div className="lg:col-span-2 bg-white rounded-lg shadow-md p-6">
                        {renderPaymentStep()}
                    </div>

                    {/* Order Summary Sidebar */}
                    <div className="space-y-4">
                        {/* Order Summary Card */}
                        <div className="bg-white rounded-lg shadow-md p-6 sticky top-8">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">สรุปคำสั่งซื้อ | Order Summary</h3>

                            <div className="space-y-4">
                                {/* Game Info */}
                                <div className="pb-4 border-b">
                                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">เกม</p>
                                    <p className="font-semibold text-gray-900">
                                        {orderData?.orderDetails.gameName}
                                    </p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {orderData?.orderDetails.packageName}
                                    </p>
                                </div>

                                {/* Price Breakdown */}
                                <div className="pb-4 border-b">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-gray-700">ราคาเดิม</span>
                                        <span className="font-semibold text-gray-900">
                                            ฿{orderData?.amounts.originalPrice.toFixed(2)}
                                        </span>
                                    </div>

                                    {orderData?.amounts.discountAmount > 0 && (
                                        <div className="flex justify-between items-center mb-2 text-green-600">
                                            <span>ส่วนลด</span>
                                            <span className="font-semibold">
                                                -฿{orderData.amounts.discountAmount.toFixed(2)}
                                            </span>
                                        </div>
                                    )}

                                    {orderData?.couponCode && (
                                        <div className="flex justify-between items-center mb-2 text-sm text-gray-600">
                                            <span>คูปอง: {orderData.couponCode}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Total */}
                                <div className="bg-blue-50 p-3 rounded-lg">
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-gray-900">ยอดชำระสุทธิ</span>
                                        <span className="text-2xl font-bold text-blue-600">
                                            ฿{orderData?.amounts.finalPrice.toFixed(2)}
                                        </span>
                                    </div>
                                </div>

                                {/* Player Info */}
                                <div className="pt-4 border-t text-sm">
                                    <p className="text-xs text-gray-600 uppercase tracking-wide mb-1">อีเมล</p>
                                    <p className="text-gray-900 break-all">{orderData?.email}</p>
                                </div>
                            </div>
                        </div>

                        {/* Support Info */}
                        {(paymentState.step === 'failed' || paymentState.step === 'processing') && (
                            <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                                <p className="text-sm text-amber-700">
                                    💬 หากมีปัญหา กรุณา <button
                                        onClick={handleContactSupport}
                                        className="underline font-semibold hover:no-underline"
                                    >
                                        ติดต่อสนับสนุน
                                    </button>
                                </p>
                            </div>
                        )}
                    </div>
                </div>

                {/* Terms and Conditions */}
                <div className="text-center text-xs text-gray-500">
                    <p>
                        โดยการชำระเงิน แสดงว่าคุณยอมรับ{' '}
                        <a href="/terms" className="underline hover:no-underline">
                            ข้อกำหนดและเงื่อนไข
                        </a>
                    </p>
                </div>
            </div>
        </div>
    );
}
