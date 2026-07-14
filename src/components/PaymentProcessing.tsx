'use client';

import React, { useEffect, useState } from 'react';
import { Loader2, Clock, AlertCircle } from 'lucide-react';

interface PaymentProcessingProps {
    orderId: number;
    paymentMethod: string;
    amount: number;
    onComplete: (success: boolean, message: string) => void;
}

export default function PaymentProcessing({
    orderId,
    paymentMethod,
    amount,
    onComplete,
}: PaymentProcessingProps) {
    const [timeElapsed, setTimeElapsed] = useState(0);
    const [status, setStatus] = useState<'checking' | 'processing' | 'timeout'>('checking');

    let methodLabel = paymentMethod;
    if (paymentMethod === 'promptpay') {
        methodLabel = 'PromptPay';
    } else if (paymentMethod === 'truemoney') {
        methodLabel = 'TrueMoney';
    }

    // Poll for payment status
    useEffect(() => {
        let pollCount = 0;
        const maxPolls = 180; // 3 minutes / 1 second = 180 polls
        const elapsedInterval = setInterval(() => {
            setTimeElapsed((prev) => prev + 1);
        }, 1000);

        const pollPaymentStatus = async () => {
            try {
                const response = await fetch(`/api/payments/check-status?orderId=${orderId}`);
                const data = await response.json();

                if (data.success && data.status === 'completed') {
                    clearInterval(elapsedInterval);
                    setStatus('processing');
                    // Wait 1 second before showing completion
                    setTimeout(() => {
                        onComplete(true, 'Payment completed successfully');
                    }, 1000);
                    return;
                }

                pollCount++;
                if (pollCount >= maxPolls) {
                    clearInterval(elapsedInterval);
                    setStatus('timeout');
                    setTimeout(() => {
                        onComplete(false, 'Payment verification timeout');
                    }, 2000);
                }
            } catch (error) {
                console.error('Error checking payment status:', error);
            }
        };

        const pollInterval = setInterval(pollPaymentStatus, 1000);

        return () => {
            clearInterval(elapsedInterval);
            clearInterval(pollInterval);
        };
    }, [orderId, onComplete]);

    return (
        <div className="space-y-6 py-8">
            {/* Loading Animation */}
            <div className="flex justify-center">
                <div className="relative w-24 h-24">
                    <Loader2 className="w-24 h-24 text-blue-600 animate-spin" />
                    <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-2xl">💳</div>
                    </div>
                </div>
            </div>

            {/* Status Text */}
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold text-gray-900">
                    {status === 'timeout' ? 'การตรวจสอบหมดเวลา' : 'กำลังประมวลผลการชำระเงิน'}
                </h2>
                <p className="text-gray-600">Processing {methodLabel} payment...</p>
            </div>

            {/* Status Card */}
            <div className="p-6 rounded-lg bg-blue-50 border border-blue-200 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">ช่องทาง</p>
                        <p className="font-semibold text-gray-900">{methodLabel}</p>
                    </div>
                    <div className="p-3 bg-white rounded-lg">
                        <p className="text-xs text-gray-600 mb-1">จำนวนเงิน</p>
                        <p className="font-semibold text-gray-900">฿{amount.toFixed(2)}</p>
                    </div>
                </div>

                <div className="p-3 bg-white rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">หมายเลขคำสั่งซื้อ</p>
                    <p className="font-mono font-semibold text-gray-900">{orderId}</p>
                </div>

                {/* Time Elapsed */}
                <div className="flex items-center gap-2 text-sm">
                    <Clock className="w-4 h-4 text-blue-600" />
                    <span className="text-gray-700">
                        เวลาที่ใช้: <span className="font-mono font-semibold">{timeElapsed}s</span>
                    </span>
                </div>
            </div>

            {/* Info Box */}
            <div className="p-4 rounded-lg bg-amber-50 border border-amber-200">
                <div className="flex gap-3">
                    <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                    <div className="text-sm text-amber-700">
                        <p className="font-medium mb-1">โปรดอย่ายิบยั้งหน้านี้</p>
                        <p className="text-amber-600">
                            ระบบกำลังตรวจสอบสถานะการชำระเงินของคุณ โปรดรอสักครู่
                        </p>
                    </div>
                </div>
            </div>

            {/* Timeout Warning */}
            {status === 'timeout' && (
                <div className="p-4 rounded-lg bg-red-50 border border-red-200">
                    <div className="flex gap-3">
                        <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                        <div className="text-sm text-red-700">
                            <p className="font-medium mb-1">การตรวจสอบหมดเวลา</p>
                            <p className="text-red-600">
                                ไม่สามารถยืนยันสถานะการชำระเงินได้ โปรดตรวจสอบข้อมูลคำสั่งซื้อของคุณ
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Fallback Message */}
            <div className="text-center text-sm text-gray-600">
                {paymentMethod === 'promptpay'
                    ? 'สำหรับ PromptPay อาจใช้เวลาสูงสุด 5 นาทีในการยืนยัน'
                    : 'โปรดรอเพื่อให้ระบบตรวจสอบสถานะการชำระเงิน'}
            </div>
        </div>
    );
}
