import { CreditCard, User, AlertTriangle, ShieldCheck, Gift } from "lucide-react";

export type FaqCategory = {
    id: string;
    label: string;
    icon: typeof CreditCard;
    color: string;
};

export type FaqItem = {
    question: string;
    answer: string;
    categoryId: string;
};

export const faqCategories: FaqCategory[] = [
    {
        id: "payment",
        label: "การชำระเงิน",
        icon: CreditCard,
        color: "from-primary to-primary/60",
    },
    {
        id: "uid",
        label: "การกรอก UID",
        icon: User,
        color: "from-secondary to-secondary/60",
    },
    {
        id: "issue",
        label: "ปัญหาเติมเงินไม่เข้า",
        icon: AlertTriangle,
        color: "from-warning to-warning/60",
    },
    {
        id: "security",
        label: "ความปลอดภัย",
        icon: ShieldCheck,
        color: "from-success to-success/60",
    },
    {
        id: "vip",
        label: "VIP & โปรโมชั่น",
        icon: Gift,
        color: "from-accent to-accent/60",
    },
];

export const faqItems: FaqItem[] = [
    // Payment
    {
        categoryId: "payment",
        question: "รองรับช่องทางการชำระเงินอะไรบ้าง?",
        answer:
            "เรารองรับหลายช่องทาง ได้แก่ PromptPay, TrueMoney Wallet, Mobile Banking, บัตรเครดิต/เดบิต, PayPal และ Cryptocurrency (USDT, Bitcoin)",
    },
    {
        categoryId: "payment",
        question: "ชำระเงินแล้วแต่ยังไม่ได้รับการยืนยัน?",
        answer:
            "กรุณารอ 1-5 นาทีหลังชำระเงิน หากยังไม่ได้รับการยืนยัน ให้ตรวจสอบยอดเงินในบัญชีว่าถูกหักหรือไม่ ถ้าถูกหักแล้วแต่ไม่ได้ไอเทม กรุณาติดต่อทีมซัพพอร์ตพร้อมแนบสลิป",
    },
    {
        categoryId: "payment",
        question: "สามารถขอคืนเงินได้หรือไม่?",
        answer:
            "เนื่องจากเป็นสินค้าดิจิทัล เราไม่สามารถคืนเงินได้หลังจากที่ไอเทมถูกส่งไปยังบัญชีผู้เล่นแล้ว กรุณาตรวจสอบ Player ID ให้ถูกต้องก่อนทำรายการ",
    },
    // UID
    {
        categoryId: "uid",
        question: "หา UID / Player ID ได้จากที่ไหน?",
        answer:
            "เข้าสู่เกมแล้วไปที่หน้า Profile หรือ Settings จะเห็น UID หรือ Player ID แสดงอยู่ โดยปกติจะเป็นตัวเลขประมาณ 8-12 หลัก อย่าสับสนกับชื่อในเกม (IGN)",
    },
    {
        categoryId: "uid",
        question: "กรอก UID ผิดแก้ไขได้ไหม?",
        answer:
            "หากยังไม่ชำระเงิน สามารถแก้ไขได้ทันที แต่หากชำระเงินแล้ว กรุณาติดต่อทีมซัพพอร์ตภายใน 5 นาที เราจะพยายามช่วยเหลือให้เร็วที่สุด",
    },
    // Issue
    {
        categoryId: "issue",
        question: "เติมเงินแล้วจะได้รับไอเทมภายในกี่นาที?",
        answer:
            "โดยปกติระบบจะดำเนินการส่งไอเทมให้ภายใน 1-5 นาที หลังจากชำระเงินสำเร็จ ในกรณีที่มีปัญหา ทีมงานจะดำเนินการให้ภายใน 24 ชั่วโมง",
    },
    {
        categoryId: "issue",
        question: "เติมเงินแล้วไม่ได้รับไอเทมต้องทำอย่างไร?",
        answer:
            "1. ตรวจสอบว่ากรอก UID ถูกต้อง\n2. ตรวจสอบว่าเงินถูกหักจากบัญชีแล้ว\n3. รอ 5-10 นาที แล้วเข้าเกมใหม่\n4. หากยังไม่ได้รับ กรุณาติดต่อทีมซัพพอร์ตพร้อมแนบหลักฐานการชำระเงินและ Order ID",
    },
    {
        categoryId: "issue",
        question: "ระบบแจ้งว่า 'Server ไม่พร้อมใช้งาน' ต้องทำอย่างไร?",
        answer:
            "อาจเป็นช่วงที่เซิร์ฟเวอร์เกมปิดปรับปรุง กรุณารอแล้วลองใหม่ภายหลัง หรือตรวจสอบประกาศจากทางเกมว่ามีกำหนดการ Maintenance หรือไม่",
    },
    // Security
    {
        categoryId: "security",
        question: "CYBERPAY ปลอดภัยหรือไม่?",
        answer:
            "เราใช้ระบบความปลอดภัยระดับสูง SSL Encryption และไม่เก็บข้อมูลการชำระเงินของคุณ ทุกรายการผ่านการยืนยันจาก Payment Gateway ที่ได้มาตรฐาน",
    },
    {
        categoryId: "security",
        question: "มีคนแอบอ้างเป็น CYBERPAY ต้องทำอย่างไร?",
        answer:
            "เราไม่เคยขอรหัสผ่านหรือ OTP จากผู้ใช้ผ่านช่องทางใดๆ หากพบบัญชีปลอม กรุณาแจ้งทีมงานผ่าน Line Official เท่านั้น อย่าคลิกลิงก์ที่ไม่น่าเชื่อถือ",
    },
    // VIP
    {
        categoryId: "vip",
        question: "แต้ม VIP คำนวณอย่างไร?",
        answer:
            "ทุกๆ 100 บาทที่เติม จะได้รับ 10 แต้ม VIP สะสมแต้มเพื่ออัพระดับและรับส่วนลดมากขึ้น ตั้งแต่ 3% ถึง 15%",
    },
    {
        categoryId: "vip",
        question: "แต้ม VIP หมดอายุไหม?",
        answer:
            "แต้ม VIP จะไม่หมดอายุตราบใดที่คุณยังมีการทำรายการภายใน 6 เดือน หากไม่มีการทำรายการเกิน 6 เดือน แต้มจะถูกรีเซ็ต",
    },
];