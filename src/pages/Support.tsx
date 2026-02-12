import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageCircle,
  Send,
  Phone,
  Mail,
  Facebook,
  MessageSquare,
  HelpCircle,
  ExternalLink,
  PlayCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import PageTransition from "@/components/PageTransition";
import { useToast } from "@/hooks/use-toast";
import { faqCategories, faqItems } from "@/data/supportFaqs";
import { cn } from "@/lib/utils";

const contactChannels = [
  {
    name: "Line Official",
    icon: MessageSquare,
    url: "#",
    description: "แชทกับเจ้าหน้าที่ตลอด 24 ชม.",
    gradient: "from-[hsl(142,76%,36%)] to-[hsl(142,76%,28%)]",
  },
  {
    name: "Facebook",
    icon: Facebook,
    url: "#",
    description: "ส่งข้อความผ่าน Messenger",
    gradient: "from-[hsl(220,80%,50%)] to-[hsl(220,80%,38%)]",
  },
  {
    name: "อีเมล",
    icon: Mail,
    url: "mailto:support@cyberpay.com",
    description: "support@cyberpay.com",
    gradient: "from-primary to-primary/70",
  },
  {
    name: "โทรศัพท์",
    icon: Phone,
    url: "tel:+6621234567",
    description: "02-123-4567 (9:00-21:00)",
    gradient: "from-secondary to-secondary/70",
  },
];

const Support = () => {
  const { toast } = useToast();
  const [activeCategoryId, setActiveCategoryId] = useState<string>("all");
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const filteredFaqs =
    activeCategoryId === "all"
      ? faqItems
      : faqItems.filter((f) => f.categoryId === activeCategoryId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      toast({
        title: "กรุณากรอกข้อมูลให้ครบ",
        description: "ชื่อ, อีเมล และข้อความ เป็นข้อมูลที่จำเป็น",
        variant: "destructive",
      });
      return;
    }
    toast({
      title: "ส่งข้อความสำเร็จ! ✉️",
      description: "ทีมงานจะติดต่อกลับภายใน 24 ชั่วโมง",
    });
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  return (
    <PageTransition>
      <div className="min-h-screen pt-20 pb-24">
        <div className="container mx-auto px-4 max-w-3xl">
          {/* Header */}
          <div className="text-center mb-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-cyber mb-4"
            >
              <HelpCircle className="w-10 h-10 text-foreground" />
            </motion.div>
            <h1 className="text-2xl font-bold">ศูนย์ช่วยเหลือ</h1>
            <p className="text-muted-foreground mt-1">
              ค้นหาคำตอบด้วยตนเอง หรือติดต่อทีมงานได้ตลอด 24 ชม.
            </p>
          </div>

          {/* FAQ Section with Categories */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-8"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <MessageCircle className="w-5 h-5 text-primary" />
              คำถามที่พบบ่อย (FAQ)
            </h2>

            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-5">
              <button
                onClick={() => setActiveCategoryId("all")}
                className={cn(
                  "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border",
                  activeCategoryId === "all"
                    ? "bg-primary/20 text-primary border-primary/40"
                    : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                )}
              >
                ทั้งหมด
              </button>
              {faqCategories.map((cat) => {
                const Icon = cat.icon;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategoryId(cat.id)}
                    className={cn(
                      "px-3 py-1.5 rounded-lg text-xs font-medium transition-all border flex items-center gap-1.5",
                      activeCategoryId === cat.id
                        ? "bg-primary/20 text-primary border-primary/40"
                        : "bg-muted/50 text-muted-foreground border-border hover:bg-muted"
                    )}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    {cat.label}
                  </button>
                );
              })}
            </div>

            {/* FAQ Accordion */}
            <div className="glass-card rounded-xl p-5">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeCategoryId}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.2 }}
                >
                  <Accordion type="single" collapsible className="w-full">
                    {filteredFaqs.map((faq, index) => (
                      <AccordionItem key={index} value={`faq-${index}`}>
                        <AccordionTrigger className="text-left hover:text-primary text-sm">
                          {faq.question}
                        </AccordionTrigger>
                        <AccordionContent className="text-muted-foreground text-sm whitespace-pre-line">
                          {faq.answer}
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  {filteredFaqs.length === 0 && (
                    <p className="text-center text-muted-foreground py-6 text-sm">
                      ไม่พบคำถามในหมวดนี้
                    </p>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.section>

          {/* Video Tutorials Placeholder */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-8"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <PlayCircle className="w-5 h-5 text-secondary" />
              วิดีโอแนะนำการใช้งาน
            </h2>
            <div className="glass-card rounded-xl p-8 flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-muted/60 flex items-center justify-center mb-3">
                <PlayCircle className="w-8 h-8 text-muted-foreground" />
              </div>
              <p className="text-muted-foreground text-sm">
                วิดีโอแนะนำขั้นตอนการเติมเงินและใช้งานระบบ — เร็วๆ นี้
              </p>
            </div>
          </motion.section>

          {/* Contact Channels */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Phone className="w-5 h-5 text-primary" />
              ช่องทางติดต่อเจ้าหน้าที่
            </h2>
            <p className="text-muted-foreground text-sm mb-4">
              หาก FAQ ไม่สามารถแก้ปัญหาได้ สามารถติดต่อทีมงานผ่านช่องทางด้านล่าง
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {contactChannels.map((ch, i) => (
                <motion.a
                  key={ch.name}
                  href={ch.url}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.3 + i * 0.08 }}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="glass-card rounded-xl p-4 flex items-center gap-4 group hover:border-primary/30 transition-colors"
                >
                  <div
                    className={cn(
                      "w-11 h-11 rounded-xl bg-gradient-to-br flex items-center justify-center shrink-0",
                      ch.gradient
                    )}
                  >
                    <ch.icon className="w-5 h-5 text-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-medium text-sm flex items-center gap-1">
                      {ch.name}
                      <ExternalLink className="w-3 h-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                    </p>
                    <p className="text-muted-foreground text-xs truncate">
                      {ch.description}
                    </p>
                  </div>
                </motion.a>
              ))}
            </div>
          </motion.section>

          {/* Contact Form */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <div className="glass-card rounded-xl p-6">
              <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Send className="w-5 h-5 text-primary" />
                ส่งข้อความถึงทีมงาน
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">ชื่อ *</Label>
                    <Input
                      id="name"
                      placeholder="ชื่อของคุณ"
                      value={formData.name}
                      onChange={(e) =>
                        setFormData({ ...formData, name: e.target.value })
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">อีเมล *</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="email@example.com"
                      value={formData.email}
                      onChange={(e) =>
                        setFormData({ ...formData, email: e.target.value })
                      }
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">หัวข้อ</Label>
                  <Input
                    id="subject"
                    placeholder="หัวข้อที่ต้องการสอบถาม"
                    value={formData.subject}
                    onChange={(e) =>
                      setFormData({ ...formData, subject: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="message">ข้อความ *</Label>
                  <Textarea
                    id="message"
                    placeholder="รายละเอียดปัญหาหรือข้อสงสัยของคุณ..."
                    rows={4}
                    value={formData.message}
                    onChange={(e) =>
                      setFormData({ ...formData, message: e.target.value })
                    }
                  />
                </div>
                <Button type="submit" className="w-full bg-gradient-cyber">
                  <Send className="w-4 h-4 mr-2" />
                  ส่งข้อความ
                </Button>
              </form>
            </div>
          </motion.section>
        </div>
      </div>
    </PageTransition>
  );
};

export default Support;