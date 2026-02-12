'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Sparkles } from 'lucide-react';

export function FreeTrialSection() {
  return (
    <section className="bg-primary/10 py-20 sm:py-24">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="relative"
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl pt-12">
            Try BULLIONS BOT Premium, Risk-Free
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Experience the full power of our AI trading signals with a 7-day free trial. No credit card required.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/login">Start Your Free Trial</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
