// src/app/checkout/page.tsx
/**
 * Checkout Page - Complete Payment Flow
 * ขั้นตอนการเติมเกมและชำระเงิน
 * 
 * Flow:
 * 1. Validate Top-up Data
 * 2. Apply Coupon (Optional)
 * 3. Create Order
 * 4. Navigate to Payment Page
 */

'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import CouponValidator from '@/components/CouponValidator';
import PaymentPage from '@/components/PaymentPage';
import { CouponValidationResponse } from '@/lib/coupon-api';
import { validateTopup, createOrderWithValidation } from '@/lib/payment-api';

type CheckoutStep = 'validate' | 'payment' | 'complete';

interface TopupFormData {
    gameId: number;
    packageId: number;
    email: string;
    playerFields: Array<{ key: string; value: string }>;
}

export default function CheckoutPage() {
    const router = useRouter();
    const userId = 1; // Get from auth context
    const gameId = 1; // From selected game
    const packageId = 1; // From selected package
    const baseAmount = 399.00; // Package price

    const [currentStep, setCurrentStep] = useState<CheckoutStep>('validate');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [, setAppliedCoupon] = useState<CouponValidationResponse | null>(null);
    const [createdOrderId, setCreatedOrderId] = useState<number | null>(null);

    const [formData, setFormData] = useState<TopupFormData>({
        gameId,
        packageId,
        email: '',
        playerFields: [
            { key: 'player_id', value: '' },
            { key: 'server_id', value: '' },
        ],
    });

    const [validationResult, setValidationResult] = useState<any | null>(null);

    // Calculate final price
    const finalPrice = useMemo(() => {
        if (validationResult?.data?.couponApplied) {
            return validationResult.data.estimatedPrice;
        }
        return baseAmount;
    }, [validationResult, baseAmount]);

    const discountAmount = useMemo(() => {
        return baseAmount - finalPrice;
    }, [baseAmount, finalPrice]);

    // Handle form input changes
    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;

        if (name.startsWith('playerField_')) {
            const fieldKey = name.replace('playerField_', '');
            setFormData((prev) => ({
                ...prev,
                playerFields: prev.playerFields.map((f) =>
                    f.key === fieldKey ? { ...f, value } : f
                ),
            }));
        } else {
            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    // Handle coupon validation
    const handleCouponValid = (response: CouponValidationResponse) => {
        setAppliedCoupon(response);
        console.log('✅ Coupon applied:', response.data?.code);
    };

    const handleCouponInvalid = (response: CouponValidationResponse) => {
        setAppliedCoupon(response);
        console.log('❌ Coupon invalid:', response.message);
    };

    // Step 1: Validate Top-up Data
    const handleValidateTopup = async () => {
        setLoading(true);
        setError(null);

        const response = await validateTopup(userId, formData);

        if (response.success && response.data) {
            setValidationResult(response);
            console.log('✅ Validation successful:', response.data);
        } else {
            setError(response.message || 'Validation failed');
            console.error('❌ Validation failed:', response.errors);
        }

        setLoading(false);
    };

    // Step 2: Create Order and Proceed to Payment
    const handleCreateOrder = async () => {
        setLoading(true);
        setError(null);

        const response = await createOrderWithValidation(userId, formData);

        if (response.success && response.data?.gameId) {
            const array = new Uint32Array(1);
            if (typeof window !== "undefined" && window.crypto) {
                window.crypto.getRandomValues(array);
            } else {
                array[0] = Date.now();
            }
            const orderId = (array[0] % 10000) + 1000;
            setCreatedOrderId(orderId);
            setCurrentStep('payment');
            console.log('✅ Order created:', orderId);
        } else {
            setError(response.message || 'Order creation failed');
            console.error('❌ Order creation failed:', response.errors);
        }

        setLoading(false);
    };

    // Handle successful payment
    const handlePaymentSuccess = (orderId: number) => {
        setCurrentStep('complete');
        setTimeout(() => {
            router.push(`/history/${orderId}`);
        }, 2000);
    };

    // Handle payment cancellation
    const handlePaymentCancel = () => {
        setCurrentStep('validate');
        setCreatedOrderId(null);
    };

    return renderCheckoutStep(
        currentStep,
        userId,
        gameId,
        packageId,
        baseAmount,
        formData,
        finalPrice,
        discountAmount,
        error,
        validationResult,
        loading,
        handleInputChange,
        handleCouponValid,
        handleCouponInvalid,
        handleValidateTopup,
        handleCreateOrder,
        router,
        createdOrderId,
        handlePaymentSuccess,
        handlePaymentCancel
    );
}

interface RenderCheckoutStepProps {
    currentStep: CheckoutStep;
    userId: number;
    gameId: number;
    packageId: number;
    baseAmount: number;
    formData: TopupFormData;
    finalPrice: number;
    discountAmount: number;
    error: string | null;
    validationResult: any | null;
    loading: boolean;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCouponValid: (response: CouponValidationResponse) => void;
    handleCouponInvalid: (response: CouponValidationResponse) => void;
    handleValidateTopup: () => Promise<void>;
    handleCreateOrder: () => Promise<void>;
    router: any;
    createdOrderId: number | null;
    handlePaymentSuccess: (orderId: number) => void;
    handlePaymentCancel: () => void;
}

function renderCheckoutStep(
    currentStep: CheckoutStep,
    userId: number,
    gameId: number,
    packageId: number,
    baseAmount: number,
    formData: TopupFormData,
    finalPrice: number,
    discountAmount: number,
    error: string | null,
    validationResult: any | null,
    loading: boolean,
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void,
    handleCouponValid: (response: CouponValidationResponse) => void,
    handleCouponInvalid: (response: CouponValidationResponse) => void,
    handleValidateTopup: () => Promise<void>,
    handleCreateOrder: () => Promise<void>,
    router: any,
    createdOrderId: number | null,
    handlePaymentSuccess: (orderId: number) => void,
    handlePaymentCancel: () => void
): React.ReactNode {
    if (currentStep === 'validate') {
        return (
            <ValidateStep
                userId={userId}
                gameId={gameId}
                packageId={packageId}
                baseAmount={baseAmount}
                formData={formData}
                finalPrice={finalPrice}
                discountAmount={discountAmount}
                error={error}
                validationResult={validationResult}
                loading={loading}
                handleInputChange={handleInputChange}
                handleCouponValid={handleCouponValid}
                handleCouponInvalid={handleCouponInvalid}
                handleValidateTopup={handleValidateTopup}
                handleCreateOrder={handleCreateOrder}
                router={router}
            />
        );
    }

    if (currentStep === 'payment' && createdOrderId !== null) {
        return (
            <PaymentPage
                orderId={createdOrderId}
                userId={userId}
                onPaymentSuccess={handlePaymentSuccess}
                onPaymentCancel={handlePaymentCancel}
            />
        );
    }

    if (currentStep === 'complete') {
        return <CompleteStep />;
    }

    return null;
}


interface ValidateStepProps {
    userId: number;
    gameId: number;
    packageId: number;
    baseAmount: number;
    formData: any;
    finalPrice: number;
    discountAmount: number;
    error: string | null;
    validationResult: any;
    loading: boolean;
    handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleCouponValid: (response: CouponValidationResponse) => void;
    handleCouponInvalid: (response: CouponValidationResponse) => void;
    handleValidateTopup: () => void;
    handleCreateOrder: () => void;
    router: any;
}

function ValidateStep({
    userId,
    gameId,
    packageId,
    baseAmount,
    formData,
    finalPrice,
    discountAmount,
    error,
    validationResult,
    loading,
    handleInputChange,
    handleCouponValid,
    handleCouponInvalid,
    handleValidateTopup,
    handleCreateOrder,
    router,
}: ValidateStepProps) {
    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 space-y-6">
                {/* Header */}
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">เติมเกม | Top-up Game</h1>
                    <p className="text-gray-600 mt-2">
                        กรุณากรอกข้อมูลเพื่อตรวจสอบ | Please fill in the information
                    </p>
                </div>

                {/* Validation Form */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <div className="space-y-6">
                        {/* Email Field */}
                        <div>
                            <label htmlFor="checkout-email" className="block text-sm font-medium text-gray-700 mb-2">
                                อีเมล | Email
                            </label>
                            <input
                                id="checkout-email"
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleInputChange}
                                placeholder="your@email.com"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            />
                        </div>

                        {/* Player Fields */}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                ข้อมูลผู้เล่น | Player Information
                            </h3>
                            <div className="space-y-4">
                                {formData.playerFields.map((field: any) => (
                                    <div key={field.key}>
                                        <label htmlFor={`player-field-${field.key}`} className="block text-sm font-medium text-gray-700 mb-2">
                                            {field.key.split('_').join(' ').toUpperCase()}
                                        </label>
                                        <input
                                            id={`player-field-${field.key}`}
                                            type="text"
                                            name={`playerField_${field.key}`}
                                            value={field.value}
                                            onChange={handleInputChange}
                                            placeholder={`Enter ${field.key}`}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                            required
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Coupon Section */}
                        <div className="border-t pt-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4">
                                ใช้คูปอง (ไม่บังคับ) | Apply Coupon (Optional)
                            </h3>
                            <CouponValidator
                                userId={userId}
                                gameId={gameId}
                                packageId={packageId}
                                amount={baseAmount}
                                onCouponValid={handleCouponValid}
                                onCouponInvalid={handleCouponInvalid}
                            />
                        </div>
                    </div>
                </div>

                {/* Price Summary */}
                <div className="bg-white rounded-lg shadow-md p-6">
                    <h2 className="text-xl font-bold mb-4">สรุปราคา | Price Summary</h2>
                    <div className="space-y-3">
                        <div className="flex justify-between py-2 border-b">
                            <span>ราคาเดิม | Base Price</span>
                            <span className="font-semibold">฿{baseAmount.toFixed(2)}</span>
                        </div>

                        {discountAmount > 0 && (
                            <div className="flex justify-between py-2 border-b text-green-600">
                                <span>ส่วนลด | Discount</span>
                                <span className="font-semibold">-฿{discountAmount.toFixed(2)}</span>
                            </div>
                        )}

                        <div className="flex justify-between py-3 bg-gray-50 px-3 rounded-lg">
                            <span className="font-bold text-lg">ราคาสุดท้าย | Total</span>
                            <span className="font-bold text-2xl text-blue-600">
                                ฿{finalPrice.toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Error Message */}
                {error && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <p className="text-red-700">❌ {error}</p>
                    </div>
                )}

                {/* Validation Result */}
                {validationResult && (
                    <div
                        className={`rounded-lg p-4 ${
                            validationResult.success
                                ? 'bg-green-50 border border-green-200'
                                : 'bg-red-50 border border-red-200'
                        }`}
                    >
                        <p className={validationResult.success ? 'text-green-700' : 'text-red-700'}>
                            {validationResult.success ? '✅' : '❌'} {validationResult.message}
                        </p>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="flex-1 py-3 px-4 border-2 border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-100 transition cursor-pointer"
                    >
                        ยกเลิก | Cancel
                    </button>

                    <button
                        type="button"
                        onClick={
                            validationResult?.success ? handleCreateOrder : handleValidateTopup
                        }
                        disabled={loading}
                        className="flex-1 py-3 px-4 bg-blue-600 text-white font-bold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition cursor-pointer"
                    >
                        {loading
                            ? 'กำลังประมวลผล... | Processing...'
                            : validationResult?.success
                              ? 'ไปยังชำระเงิน | Proceed to Payment'
                              : 'ตรวจสอบข้อมูล | Validate'}
                    </button>
                </div>
            </div>
        </div>
    );
}

function CompleteStep() {
    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center py-8">
            <div className="max-w-md mx-auto px-4 text-center">
                <div className="bg-white rounded-lg shadow-lg p-8 space-y-6">
                    <div className="text-6xl">✅</div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        การชำระเงินสำเร็จ | Payment Successful
                    </h1>
                    <p className="text-gray-600">
                        ありがとうございました! ขอบคุณที่ใช้บริการ | Thank you for your purchase!
                    </p>
                    <p className="text-sm text-gray-500">
                        กำลังไปยังหน้าประวัติการสั่งซื้อ... | Redirecting to order history...
                    </p>
                </div>
            </div>
        </div>
    );
}
