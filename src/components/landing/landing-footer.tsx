'use client';
import Link from "next/link";
import Image from "next/image";

export function LandingFooter() {
  return (
    <footer className="bg-gray-900/50 border-t border-primary/10">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Company Info */}
          <div className="space-y-4 md:col-span-2">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="BULLIONS BOT Logo" width={160} height={40} />
            </Link>
            <p className="text-gray-400 text-sm max-w-md">
              BULLIONS BOT offers AI-powered gold trading signals for the modern trader, focusing on data-driven decisions to navigate the XAU/USD market effectively.
            </p>
          </div>

          {/* Links */}
          <div className="grid grid-cols-2 gap-8 md:col-span-2">
            <div>
              <h3 className="font-semibold text-white">Product</h3>
              <ul className="mt-4 space-y-2">
                <li>
                  <Link href="#features" className="text-sm text-gray-400 hover:text-primary">
                    Features
                  </Link>
                </li>
                <li>
                  <Link href="#pricing" className="text-sm text-gray-400 hover:text-primary">
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href="#how-it-works" className="text-sm text-gray-400 hover:text-primary">
                    How It Works
                  </Link>
                </li>
                 <li>
                  <Link href="#faq" className="text-sm text-gray-400 hover:text-primary">
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-white">Company</h3>
              <ul className="mt-4 space-y-2">
                 <li>
                  <Link href="/about" className="text-sm text-gray-400 hover:text-primary">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="text-sm text-gray-400 hover:text-primary">
                    Contact Us
                  </Link>
                </li>
                 <li>
                  <Link href="/terms" className="text-sm text-gray-400 hover:text-primary">
                    Terms of Service
                  </Link>
                </li>
                 <li>
                  <Link href="/privacy" className="text-sm text-gray-400 hover:text-primary">
                    Privacy Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mt-12 border-t border-primary/20 pt-8 text-center text-xs text-gray-500">
            <p>Disclaimer: Trading involves substantial risk and is not suitable for all investors. Past performance is not indicative of future results. The signals provided by BULLIONS BOT are for informational purposes only and do not constitute financial advice. All investment decisions are your own.</p>
             <p className="mt-4">© {new Date().getFullYear()} BULLIONS BOT. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
