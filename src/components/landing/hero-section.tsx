
'use client';

import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, BarChart, CheckCircle, Shield } from 'lucide-react';
import Link from 'next/link';
import { HeroBackground } from './hero-background';

const logos = ['Forbes', 'Bloomberg', 'Yahoo Finance', 'MarketWatch'];

const logoContainerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.2,
      delayChildren: 0.8,
    },
  },
};

const logoItemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
    },
  },
};

const sentence = {
  hidden: { opacity: 1 },
  visible: {
    opacity: 1,
    transition: {
      delay: 0.5,
      staggerChildren: 0.08,
    },
  },
};

const letter = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
  },
};

const line1 = "Trade Gold Smarter, ";
const line2 = "Not Harder.";


export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-transparent pt-20 md:pt-32 pb-12 md:pb-24">
      <HeroBackground />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <motion.h1
            className="font-serif text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl"
            variants={sentence}
            initial="hidden"
            animate="visible"
          >
            {line1.split("").map((char, index) => (
              <motion.span key={char + "-" + index} variants={letter}>
                {char}
              </motion.span>
            ))}
            <span className="text-primary">
              {line2.split("").map((char, index) => (
                <motion.span key={char + "-" + index} variants={letter}>
                  {char}
                </motion.span>
              ))}
            </span>
          </motion.h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-300 md:text-xl">
            Leverage our advanced AI to get real-time, high-accuracy XAU/USD signals. Stop trading on emotion, start trading on data.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row"
        >
          <Button asChild size="lg" className="w-full bg-primary text-primary-foreground hover:bg-primary/90 sm:w-auto">
            <Link href="/login">
              Start Your Free Trial <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline" className="w-full border-primary/50 text-white hover:bg-primary/10 hover:text-white sm:w-auto">
            <Link href="#features">
              Explore Features
            </Link>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="mt-16 flex flex-wrap justify-center gap-x-8 gap-y-6 text-base text-gray-400"
        >
          <div className="flex items-center gap-3">
            <CheckCircle className="h-5 w-5 text-green-500" />
            <span className="font-medium">AI-Powered Signals</span>
          </div>
          <div className="flex items-center gap-3">
            <BarChart className="h-5 w-5 text-green-500" />
            <span className="font-medium">80%+ Accuracy</span>
          </div>
          <div className="flex items-center gap-3">
            <Shield className="h-5 w-5 text-green-500" />
            <span className="font-medium">Risk-Managed Trades</span>
          </div>
        </motion.div>

        <motion.div
            initial="hidden"
            animate="visible"
            variants={logoContainerVariants}
            className="mt-20"
        >
            <p className="text-sm uppercase tracking-wider text-gray-500">
                As Mentioned In
            </p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-x-8 gap-y-4">
              {logos.map((logo) => (
                <motion.span
                  key={logo}
                  variants={logoItemVariants}
                  className="font-serif text-2xl font-bold text-gray-600 transition-colors hover:text-gray-400"
                >
                  {logo}
                </motion.span>
              ))}
            </div>
        </motion.div>
      </div>
    </section>
  );
}
