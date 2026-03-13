import {
    Coins,
    CreditCard,
    Shield,
    Gift,
    HelpCircle,
    AlertCircle,
} from "lucide-react";

export const faqCategories = [
    {
        id: "topup",
        icon: Coins,
    },
    {
        id: "payment",
        icon: CreditCard,
    },
    {
        id: "security",
        icon: Shield,
    },
    {
        id: "vip",
        icon: Gift,
    },
    {
        id: "problem",
        icon: AlertCircle,
    },
    {
        id: "general",
        icon: HelpCircle,
    },
];

export const faqItems = [
    // การเติมเงิน / Top-up
    {
        categoryId: "topup",
        question: {
            th: "เติมเกมแล้วจะได้รับไอเทมภายในกี่นาที?",
            en: "How long does it take to receive items after top-up?"
        },
        answer: {
            th: "โดยปกติระบบจะดำเนินการส่งไอเทมให้ภายใน 1-5 นาที หลังจากชำระเงินสำเร็จ\n\nในกรณีที่มีปัญหา ทีมงานจะดำเนินการให้ภายใน 24 ชั่วโมง",
            en: "Normally, the system will deliver items within 1-5 minutes after successful payment.\n\nIn case of issues, our team will process within 24 hours."
        }
    },
    {
        categoryId: "topup",
        question: {
            th: "สามารถเติมเงินให้เพื่อนได้หรือไม่?",
            en: "Can I top up for my friend?"
        },
        answer: {
            th: "ได้ครับ คุณสามารถเติมเงินให้เพื่อนได้โดยใส่ Player ID ของเพื่อนในขั้นตอนการเติมเงิน\n\nกรุณาตรวจสอบ Player ID ให้ถูกต้องก่อนทำรายการ เพราะเราไม่สามารถคืนเงินหรือโอนย้ายไอเทมได้",
            en: "Yes, you can top up for your friend by entering their Player ID during the top-up process.\n\nPlease verify the Player ID before proceeding, as we cannot refund or transfer items."
        }
    },
    {
        categoryId: "topup",
        question: {
            th: "มีขั้นต่ำในการเติมเงินหรือไม่?",
            en: "Is there a minimum top-up amount?"
        },
        answer: {
            th: "ขึ้นอยู่กับแต่ละเกม โดยทั่วไปจะเริ่มต้นที่ 20 บาท\n\nคุณสามารถดูรายละเอียดแพ็คเกจของแต่ละเกมได้ในหน้าเกมนั้นๆ",
            en: "It depends on each game. Generally, it starts from 20 baht.\n\nYou can view package details for each game on their respective pages."
        }
    },

    // การชำระเงิน / Payment
    {
        categoryId: "payment",
        question: {
            th: "รองรับช่องทางการชำระเงินอะไรบ้าง?",
            en: "What payment methods are supported?"
        },
        answer: {
            th: "เรารองรับหลายช่องทาง ได้แก่:\n\n• PromptPay (QR Code)\n• TrueMoney Wallet\n• Mobile Banking (ทุกธนาคาร)\n• บัตรเครดิต/เดบิต (Visa, Mastercard)\n• PayPal\n• Cryptocurrency (USDT, Bitcoin)",
            en: "We support multiple channels:\n\n• PromptPay (QR Code)\n• TrueMoney Wallet\n• Mobile Banking (All banks)\n• Credit/Debit Cards (Visa, Mastercard)\n• PayPal\n• Cryptocurrency (USDT, Bitcoin)"
        }
    },
    {
        categoryId: "payment",
        question: {
            th: "ชำระเงินแล้วแต่สถานะยังไม่เปลี่ยน ต้องทำอย่างไร?",
            en: "Payment completed but status hasn't changed, what should I do?"
        },
        answer: {
            th: "กรุณารอสักครู่ ระบบอาจใช้เวลาประมวลผล 1-5 นาที\n\nหากเกิน 10 นาทีแล้วยังไม่ได้รับ กรุณาติดต่อทีมซัพพอร์ตพร้อมแนบหลักฐานการชำระเงิน (สลิป) และ Order ID",
            en: "Please wait a moment. The system may take 1-5 minutes to process.\n\nIf you haven't received it after 10 minutes, please contact support with payment proof (slip) and Order ID."
        }
    },
    {
        categoryId: "payment",
        question: {
            th: "สามารถขอใบเสร็จได้หรือไม่?",
            en: "Can I request a receipt?"
        },
        answer: {
            th: "ได้ครับ คุณสามารถดาวน์โหลดใบเสร็จได้จากหน้า 'ประวัติการเติมเงิน'\n\nหรือติดต่อทีมงานเพื่อขอใบเสร็จอิเล็กทรอนิกส์ส่งทางอีเมล",
            en: "Yes, you can download receipts from the 'Top-up History' page.\n\nOr contact our team to request an electronic receipt via email."
        }
    },

    // ความปลอดภัย / Security
    {
        categoryId: "security",
        question: {
            th: "CYBERPAY ปลอดภัยหรือไม่?",
            en: "Is CYBERPAY safe?"
        },
        answer: {
            th: "เราใช้ระบบความปลอดภัยระดับสูง:\n\n• SSL Encryption สำหรับการส่งข้อมูล\n• ไม่เก็บข้อมูลบัตรเครดิตของคุณ\n• ทุกรายการผ่านการยืนยันจาก Payment Gateway ที่ได้มาตรฐาน PCI DSS\n• ระบบตรวจจับการทำธุรกรรมผิดปกติ",
            en: "We use high-level security systems:\n\n• SSL Encryption for data transmission\n• We don't store your credit card information\n• All transactions verified by PCI DSS certified Payment Gateway\n• Fraud detection system"
        }
    },
    {
        categoryId: "security",
        question: {
            th: "ข้อมูลส่วนตัวของฉันจะถูกเก็บอย่างไร?",
            en: "How is my personal information stored?"
        },
        answer: {
            th: "เราเก็บเฉพาะข้อมูลที่จำเป็นต่อการให้บริการเท่านั้น\n\nข้อมูลทั้งหมดถูกเข้ารหัสและเก็บอย่างปลอดภัย ไม่มีการนำไปขายหรือแชร์กับบุคคลที่สาม\n\nอ่านเพิ่มเติมได้ที่ นโยบายความเป็นส่วนตัว",
            en: "We only store information necessary for service provision.\n\nAll data is encrypted and stored securely. We don't sell or share with third parties.\n\nRead more in our Privacy Policy."
        }
    },

    // VIP & โปรโมชั่น / VIP & Promotions
    {
        categoryId: "vip",
        question: {
            th: "แต้ม VIP คำนวณอย่างไร?",
            en: "How are VIP points calculated?"
        },
        answer: {
            th: "ทุกๆ 100 บาทที่เติม = 10 แต้ม VIP\n\nสะสมแต้มเพื่ออัพระดับและรับส่วนลด:\n• VIP 1: ส่วนลด 3%\n• VIP 2: ส่วนลด 5%\n• VIP 3: ส่วนลด 8%\n• VIP 4: ส่วนลด 12%\n• VIP 5: ส่วนลด 15%",
            en: "Every 100 baht top-up = 10 VIP points\n\nCollect points to level up and get discounts:\n• VIP 1: 3% discount\n• VIP 2: 5% discount\n• VIP 3: 8% discount\n• VIP 4: 12% discount\n• VIP 5: 15% discount"
        }
    },
    {
        categoryId: "vip",
        question: {
            th: "แต้ม VIP หมดอายุหรือไม่?",
            en: "Do VIP points expire?"
        },
        answer: {
            th: "แต้ม VIP จะไม่หมดอายุตราบใ่คุณยังใช้งานบัญชี\n\nหากไม่มีการเติมเงินเกิน 1 ปี ระดับ VIP อาจถูกปรับลดลง แต่แต้มที่สะสมไว้จะยังคงอยู่",
            en: "VIP points don't expire as long as you use your account.\n\nIf there's no top-up for over 1 year, VIP level may be reduced, but accumulated points remain."
        }
    },
    {
        categoryId: "vip",
        question: {
            th: "มีโปรโมชั่นอะไรบ้าง?",
            en: "What promotions are available?"
        },
        answer: {
            th: "เรามีโปรโมชั่นหมุนเวียนตลอดทั้งปี:\n\n• โปรโมชั่นสมาชิกใหม่\n• โปรโมชั่นเติมครั้งแรกของเกม\n• โปรโมชั่นวันเกิด\n• โปรโมชั่นช่วงเทศกาล\n\nติดตามได้ที่หน้า VIP หรือ Facebook Page",
            en: "We have rotating promotions year-round:\n\n• New member promotions\n• First-time game top-up promotions\n• Birthday promotions\n• Seasonal promotions\n\nFollow on VIP page or Facebook Page"
        }
    },

    // แก้ปัญหา / Troubleshooting
    {
        categoryId: "problem",
        question: {
            th: "ถ้าเติมเงินแล้วไม่ได้รับไอเทมต้องทำอย่างไร?",
            en: "What should I do if I don't receive items after top-up?"
        },
        answer: {
            th: "กรุณาติดต่อทีมซัพพอร์ตทันทีพร้อมข้อมูลดังนี้:\n\n1. Order ID (เลขที่คำสั่งซื้อ)\n2. หลักฐานการชำระเงิน (สลิป)\n3. Player ID ที่ใช้เติม\n4. ชื่อเกมและแพ็คเกจที่เติม\n\nทีมงานจะตรวจสอบและแก้ไขให้ภายใน 24 ชั่วโมง",
            en: "Please contact support immediately with the following information:\n\n1. Order ID\n2. Payment proof (slip)\n3. Player ID used for top-up\n4. Game name and package\n\nOur team will investigate and resolve within 24 hours."
        }
    },
    {
        categoryId: "problem",
        question: {
            th: "เติมผิด Player ID ทำอย่างไร?",
            en: "What if I topped up with wrong Player ID?"
        },
        answer: {
            th: "ขออภัยครับ เนื่องจากไอเทมถูกส่งไปยังบัญชีที่ระบุแล้ว เราไม่สามารถโอนย้ายหรือคืนเงินได้\n\nกรุณาตรวจสอบ Player ID ให้ถูกต้องก่อนยืนยันการชำระเงินทุกครั้ง",
            en: "We apologize, but since items have been sent to the specified account, we cannot transfer or refund.\n\nPlease verify Player ID before confirming payment every time."
        }
    },
    {
        categoryId: "problem",
        question: {
            th: "ลืมรหัสผ่าน ทำอย่างไร?",
            en: "What if I forgot my password?"
        },
        answer: {
            th: "คุณสามารถรีเซ็ตรหัสผ่านได้ที่หน้า Login\n\n1. คลิก 'ลืมรหัสผ่าน?'\n2. กรอกอีเมลที่ลงทะเบียนไว้\n3. ตรวจสอบอีเมลและคลิกลิงก์รีเซ็ตรหัสผ่าน\n4. ตั้งรหัสผ่านใหม่",
            en: "You can reset your password on the Login page:\n\n1. Click 'Forgot password?'\n2. Enter your registered email\n3. Check email and click reset link\n4. Set new password"
        }
    },

    // ทั่วไป / General
    {
        categoryId: "general",
        question: {
            th: "สามารถขอคืนเงินได้หรือไม่?",
            en: "Can I request a refund?"
        },
        answer: {
            th: "ขออภัยครับ เนื่องจากเป็นสินค้าดิจิทัล เราไม่สามารถคืนเงินได้หลังจากที่ไอเทมถูกส่งไปยังบัญชีผู้เล่นแล้ว\n\nกรุณาตรวจสอบข้อมูลให้ถูกต้องก่อนทำรายการทุกครั้ง",
            en: "We apologize, but as digital goods, we cannot refund after items have been delivered to the player's account.\n\nPlease verify information before proceeding with transactions."
        }
    },
    {
        categoryId: "general",
        question: {
            th: "ต้องสมัครสมาชิกก่อนเติมเงินหรือไม่?",
            en: "Do I need to register before top-up?"
        },
        answer: {
            th: "ไม่จำเป็นครับ คุณสามารถเติมเงินได้โดยไม่ต้องสมัครสมาชิก\n\nแต่หากสมัครสมาชิก คุณจะได้รับสิทธิประโยชน์:\n• ติดตามประวัติการเติมเงิน\n• สะสมแต้ม VIP\n• รับโปรโมชั่นพิเศษ\n• เติมเงินได้เร็วขึ้น",
            en: "Not required. You can top up without registration.\n\nBut if you register, you'll get benefits:\n• Track top-up history\n• Collect VIP points\n• Receive special promotions\n• Faster top-up process"
        }
    },
    {
        categoryId: "general",
        question: {
            th: "ติดต่อทีมงานได้ที่ไหน?",
            en: "How can I contact the team?"
        },
        answer: {
            th: "คุณสามารถติดต่อเราได้หลายช่องทาง:\n\n• Line Official: @cyberpay (แนะนำ - ตอบเร็วที่สุด)\n• Facebook Messenger\n• อีเมล: support@cyberpay.com\n• โทรศัพท์: 02-123-4567 (9:00-21:00)\n\nทีมงานพร้อมให้บริการตลอด 24 ชั่วโมง",
            en: "You can contact us through multiple channels:\n\n• Line Official: @cyberpay (Recommended - Fastest response)\n• Facebook Messenger\n• Email: support@cyberpay.com\n• Phone: 02-123-4567 (9:00-21:00)\n\nOur team is available 24/7"
        }
    },
];
