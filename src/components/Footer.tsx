
import { useLanguage } from "./language-context";

const Footer = () => {
  const { t } = useLanguage();
  return (
    <footer className="bg-background border-t border-border/30 py-10 mt-8">
      <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8 text-sm text-muted-foreground">
        {/* About Us */}
        <div>
          <h4 className="font-semibold text-foreground mb-2">{t.footerAboutUs}</h4>
          <p>{t.footerAboutDesc}</p>
        </div>
        {/* Contact */}
        <div>
          <h4 className="font-semibold text-foreground mb-2">{t.footerContact}</h4>
          <ul className="space-y-1">
            <li>{t.footerEmailLabel}: <a href="mailto:support@cyberpay.com" className="hover:underline text-primary">support@cyberpay.com</a></li>
            <li>{t.footerTelLabel}: <a href="tel:021234567" className="hover:underline text-primary">02-123-4567</a></li>
          </ul>
        </div>
        {/* Payment Methods */}
        <div>
          <h4 className="font-semibold text-foreground mb-2">{t.footerPaymentMethods}</h4>
          <ul className="space-y-1">
            <li>{t.footerBankTransfer}</li>
            <li>{t.footerTrueMoney}</li>
            <li>{t.footerPromptPay}</li>
            <li>{t.footerCreditCard}</li>
          </ul>
        </div>
        {/* Terms & Social */}
        <div>
          <h4 className="font-semibold text-foreground mb-2">{t.footerLegalSocial}</h4>
          <ul className="space-y-1 mb-3">
            <li><a href="/terms-privacy/terms" className="hover:underline text-primary">{t.footerTerms }</a></li>
            <li><a href="/terms-privacy/privacy" className="hover:underline text-primary">{t.footerPrivacy}</a></li>
          </ul>
          <div className="flex gap-3">
            <a href="https://facebook.com" target="_blank" rel="noopener" aria-label="Facebook" className="hover:text-primary"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M22.675 0h-21.35C.595 0 0 .592 0 1.326v21.348C0 23.408.595 24 1.325 24h11.495v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.797.143v3.24l-1.918.001c-1.504 0-1.797.715-1.797 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116C23.406 24 24 23.408 24 22.674V1.326C24 .592 23.406 0 22.675 0"/></svg></a>
            <a href="https://twitter.com" target="_blank" rel="noopener" aria-label="Twitter" className="hover:text-primary"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M24 4.557a9.83 9.83 0 0 1-2.828.775 4.932 4.932 0 0 0 2.165-2.724c-.951.564-2.005.974-3.127 1.195a4.916 4.916 0 0 0-8.38 4.482C7.691 8.095 4.066 6.13 1.64 3.161c-.542.929-.856 2.01-.857 3.17 0 2.188 1.115 4.117 2.823 5.247a4.904 4.904 0 0 1-2.229-.616c-.054 2.281 1.581 4.415 3.949 4.89a4.936 4.936 0 0 1-2.224.084c.627 1.956 2.444 3.377 4.6 3.417A9.867 9.867 0 0 1 0 21.543a13.94 13.94 0 0 0 7.548 2.209c9.058 0 14.009-7.513 14.009-14.009 0-.213-.005-.425-.014-.636A10.012 10.012 0 0 0 24 4.557z"/></svg></a>
            <a href="https://instagram.com" target="_blank" rel="noopener" aria-label="Instagram" className="hover:text-primary"><svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 1.366.062 2.633.334 3.608 1.308.974.974 1.246 2.241 1.308 3.608.058 1.266.069 1.646.069 4.85s-.012 3.584-.07 4.85c-.062 1.366-.334 2.633-1.308 3.608-.974.974-2.241 1.246-3.608 1.308-1.266.058-1.646.069-4.85.069s-3.584-.012-4.85-.07c-1.366-.062-2.633-.334-3.608-1.308-.974-.974-1.246-2.241-1.308-3.608C2.175 15.647 2.163 15.267 2.163 12s.012-3.584.07-4.85c.062-1.366.334-2.633 1.308-3.608.974-.974 2.241-1.246 3.608-1.308C8.416 2.175 8.796 2.163 12 2.163zm0-2.163C8.741 0 8.332.013 7.052.072 5.775.131 4.602.425 3.635 1.392 2.668 2.359 2.374 3.532 2.315 4.808 2.256 6.088 2.243 6.497 2.243 12c0 5.503.013 5.912.072 7.192.059 1.276.353 2.449 1.32 3.416.967.967 2.14 1.261 3.416 1.32 1.28.059 1.689.072 7.192.072s5.912-.013 7.192-.072c1.276-.059 2.449-.353 3.416-1.32.967-.967 1.261-2.14 1.32-3.416.059-1.28.072-1.689.072-7.192s-.013-5.912-.072-7.192c-.059-1.276-.353-2.449-1.32-3.416C19.449.425 18.276.131 17 .072 15.72.013 15.311 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zm0 10.162a3.999 3.999 0 1 1 0-7.998 3.999 3.999 0 0 1 0 7.998zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z"/></svg></a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
