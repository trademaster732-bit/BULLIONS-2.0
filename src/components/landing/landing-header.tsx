'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';

export function LandingHeader() {
  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      transition={{ duration: 0.5 }}
      className="sticky top-0 z-50 w-full bg-black/50 backdrop-blur-lg"
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
        <Link href="/" className="flex items-center gap-2">
          <Image src="/logo.png" alt="BULLIONS BOT Logo" width={160} height={40} />
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          <Link href="#features" className="text-sm font-medium text-gray-300 hover:text-primary">
            Features
          </Link>
          <Link href="#pricing" className="text-sm font-medium text-gray-300 hover:text-primary">
            Pricing
          </Link>
          <Link href="#faq" className="text-sm font-medium text-gray-300 hover:text-primary">
            FAQ
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild className="text-white hover:bg-primary/10">
            <Link href="/login">Login</Link>
          </Button>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/login">Get Started</Link>
          </Button>
        </div>
      </div>
    </motion.header>
  );
}
