'use client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function FinalCtaSection() {
  return (
    <section className="bg-primary/5 py-20 sm:py-24">
      <div className="container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Start Your Gold Trading Journey Today
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-lg text-gray-400">
            Join hundreds of traders who are using data, not drama, to navigate the gold market.
          </p>
          <div className="mt-8">
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90">
              <Link href="/login">Get Your First Signal Now</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
