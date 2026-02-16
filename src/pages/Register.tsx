import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, Mail, Lock, User, Gamepad2, Loader2, Check, X, Facebook } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/useAuth';
import PageTransition from '@/components/PageTransition';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [showTerms, setShowTerms] = useState(false);
  const { signUp, signInWithGoogle } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  // Password validation
  const passwordChecks = {
    length: password.length >= 8,
    uppercase: /[A-Z]/.test(password),
    lowercase: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[!@#$%^&*(),.?":{}|<>-]/.test(password), // เช็คอักขระพิเศษ
    match: password === confirmPassword && confirmPassword !== "" // เช็ครหัสผ่านตรงกัน
  };

  const isPasswordValid = Object.values(passwordChecks).every(Boolean);
  const doPasswordsMatch = password === confirmPassword && confirmPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password || !confirmPassword) {
      toast({
        title: 'กรุณากรอกข้อมูล',
        description: 'กรุณากรอกข้อมูลให้ครบทุกช่อง',
        variant: 'destructive',
      });
      return;
    }

    if (!acceptedTerms) {
      toast({
        title: 'กรุณายอมรับข้อกำหนด',
        description: 'กรุณายอมรับข้อกำหนดในการให้บริการและนโยบายความเป็นส่วนตัว',
        variant: 'destructive',
      });
      return;
    }

    if (!isPasswordValid) {
      toast({
        title: 'รหัสผ่านไม่ถูกต้อง',
        description: 'กรุณาตั้งรหัสผ่านตามเงื่อนไขที่กำหนด',
        variant: 'destructive',
      });
      return;
    }

    if (!doPasswordsMatch) {
      toast({
        title: 'รหัสผ่านไม่ตรงกัน',
        description: 'กรุณากรอกรหัสผ่านให้ตรงกัน',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    const { error } = await signUp(email, password);
    setIsLoading(false);

    if (error) {
      toast({
        title: 'สมัครสมาชิกไม่สำเร็จ',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'สมัครสมาชิกสำเร็จ!',
        description: 'ยินดีต้อนรับสู่ CYBERPAY',
      });
      navigate('/');
    }
  };

  const handleGoogleSignUp = async () => {
    setIsLoading(true);
    const { error } = await signInWithGoogle();

    if (error) {
      setIsLoading(false);
      toast({
        title: 'สมัครสมาชิกไม่สำเร็จ',
        description: error.message,
        variant: 'destructive',
      });
    }
    // Note: If successful, user will be redirected to Google OAuth
  };

  const handleFacebookSignUp = async () => {
    // TODO: Implement Facebook Sign Up
    toast({
      title: 'ยังใช้ไม่ได้',
      description: 'Facebook Sign Up ยังใช้ไม่ได้',
      variant: 'destructive',
    });
  };

  const PasswordCheck = ({ valid, text }: { valid: boolean; text: string }) => (
    <div
      className={`flex items-center gap-2 text-xs transition-all duration-300 ${valid ? 'opacity-100' : 'text-muted-foreground opacity-70'
        }`}
      style={{ color: valid ? '#26FF95' : undefined }}
    >
      {valid ? (
        <Check
          className="w-3.5 h-3.5"
          style={{ filter: 'drop-shadow(0 0 2px #26FF95)' }}
        />
      ) : (
        <X className="w-3.5 h-3.5 opacity-50" />
      )}
      <span className={valid ? "font-medium" : ""}>
        {text}
      </span>
    </div>
  );

  return (
    <PageTransition>
      <div className="min-h-screen flex items-center justify-center px-4 py-12 pb-24">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8 pt-[5vh]">
            {/* Logo */}
            <div className="text-center mb-8">
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
                className="inline-flex items-center gap-3 mb-4"
              >
                <div className="w-12 h-12 rounded-xl bg-gradient-cyber flex items-center justify-center glow-primary">
                  <Gamepad2 className="w-7 h-7 text-background" />
                </div>
                <span className="text-3xl font-bold text-glow">CYBERPAY</span>
              </motion.div>
              <p className="text-muted-foreground">สมัครสมาชิกเพื่อรับสิทธิพิเศษ</p>
            </div>
          </div>
          <Card className="glass-card border-border/50">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center">สมัครสมาชิก</CardTitle>
              <CardDescription className="text-center">
                สร้างบัญชีใหม่เพื่อเริ่มต้นใช้งาน
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Email Input */}
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="your@email.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 bg-muted/50 border-border/50 focus:border-primary"
                      disabled={isLoading}
                    />
                  </div>
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 bg-muted/50 border-border/50 focus:border-primary"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                </div>

                {/* Confirm Password Input */}
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">ยืนยัน Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className={`pl-10 pr-10 bg-muted/50 border-border/50 focus:border-primary ${confirmPassword && !doPasswordsMatch ? 'border-destructive' : ''
                        }`}
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>

                  {/* ส่วนแจ้งเตือน Error */}
                  {/* {confirmPassword && !doPasswordsMatch && (
                    <p className="text-xs text-destructive">รหัสผ่านไม่ตรงกัน</p>
                  )} */}

                  {/* Password Requirements */}
                  {/* Password Requirements */}
                  <div className="flex flex-col gap-1 pt-2">
                    <div>
                      <PasswordCheck
                        valid={passwordChecks.uppercase && passwordChecks.lowercase}
                        text="ตัวอักษรพิมพ์ใหญ่ (A-Z) และ ตัวอักษรพิมพ์เล็ก (a-z)" />
                      <PasswordCheck
                        valid={passwordChecks.number}
                        text="ตัวเลข (0-9) อย่างน้อย 1 ตัว" />
                      <PasswordCheck
                        valid={passwordChecks.special}
                        text="อักขระพิเศษ อย่างน้อย 1 ตัว" />
                      <PasswordCheck
                        valid={passwordChecks.length}
                        text="ความยาวอย่างน้อย8 ตัวขึ้นไป" />
                      <PasswordCheck
                        valid={passwordChecks.match}
                        text="รหัสผ่านตรงกัน" />
                    </div>

                    {/* แถวที่ 2: ตัวเลข และ อักขระพิเศษ */}
                    <div className="flex flex-wrap gap-x-4">

                    </div>

                    {/* แถวที่ 3: เช็ครหัสผ่านตรงกัน */}

                  </div>
                </div>

                {/* Terms and Conditions Checkbox */}
                <div className="flex items-start space-x-2 pt-2">
                  <Checkbox
                    id="terms"
                    checked={acceptedTerms}
                    onCheckedChange={(checked) => setAcceptedTerms(checked as boolean)}
                    disabled={isLoading}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <label
                      htmlFor="terms"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
                    >
                      ฉันยอมรับ{' '}
                      <button
                        type="button"
                        onClick={() => setShowTerms(true)}
                        className="text-primary hover:underline"
                      >
                        ข้อกำหนดในการให้บริการและนโยบายความเป็นส่วนตัว
                      </button>
                    </label>
                  </div>
                </div>

                {/* Register Button */}
                <Button
                  type="submit"
                  className="w-full bg-gradient-cyber hover:opacity-90 text-background font-semibold h-11 pulse-glow"
                  disabled={isLoading || !isPasswordValid || !doPasswordsMatch || !acceptedTerms}
                >
                  {isLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    'สมัครสมาชิก'
                  )}
                </Button>

              </form>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border/50"></span>
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground">OR</span>
                </div>
              </div>

              {/* 3. กลุ่มปุ่ม Social Login (Google, Facebook) */}
              <div className="space-y-3">
                {/* ปุ่ม Google */}
                <Button
                  variant="outline"
                  className="w-full bg-background hover:bg-muted/50"
                  onClick={handleGoogleSignUp}
                  disabled={isLoading}
                >
                  <FcGoogle className="mr-2 h-5 w-5" />
                  Google
                </Button>

                {/* ปุ่ม Facebook */}
                <Button
                  variant="outline"
                  className="w-full bg-[#1877F2]/10 border-[#1877F2]/30 text-[#1877F2] hover:bg-[#1877F2]/20"
                  onClick={handleFacebookSignUp}
                  disabled={isLoading}
                >
                  <Facebook className="mr-2 h-5 w-5 fill-current" />
                  Facebook
                </Button>
              </div>

              {/* Login Link */}
              <p className="text-center text-sm text-muted-foreground mt-6">
                มีบัญชีอยู่แล้ว?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  เข้าสู่ระบบ
                </Link>
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* Terms Dialog */}
      <Dialog open={showTerms} onOpenChange={setShowTerms}>
        <DialogContent className="max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>ข้อกำหนดในการให้บริการ และนโยบายความเป็นส่วนตัว</DialogTitle>
          </DialogHeader>
          <DialogDescription asChild>
            <div className="space-y-4 text-sm text-muted-foreground">
              <h3 className="font-semibold text-foreground">ข้อกำหนดในการให้บริการ</h3>
              <p>1. ผู้ใช้งานต้องให้ข้อมูลที่ถูกต้องและเป็นปัจจุบันในการสมัครสมาชิก</p>
              <p>2. ห้ามใช้บัญชีผู้อื่นในการทำธุรกรรม</p>
              <p>3. การเติมเงินทุกรายการจะไม่สามารถขอคืนเงินได้หลังจากดำเนินการสำเร็จ</p>
              <p>4. ทีมงานขอสงวนสิทธิ์ในการระงับบัญชีที่มีพฤติกรรมผิดปกติ</p>

              <h3 className="font-semibold text-foreground pt-2">นโยบายความเป็นส่วนตัว</h3>
              <p>1. เราเก็บรวบรวมข้อมูลส่วนบุคคลเท่าที่จำเป็นสำหรับการให้บริการ</p>
              <p>2. ข้อมูลของคุณจะไม่ถูกเปิดเผยต่อบุคคลที่สามโดยไม่ได้รับความยินยอม</p>
              <p>3. คุณสามารถขอลบข้อมูลส่วนบุคคลได้ตลอดเวลา</p>
              <p>4. เราใช้มาตรการรักษาความปลอดภัยเพื่อปกป้องข้อมูลของคุณ</p>
            </div>
          </DialogDescription>
        </DialogContent>
      </Dialog>
    </PageTransition>
  );


};


export default Register;
