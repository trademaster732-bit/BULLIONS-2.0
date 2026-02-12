'use client';

import { motion } from 'framer-motion';
import { ScanSearch, Bot, Target } from 'lucide-react';

const steps = [
  {
    icon: ScanSearch,
    name: 'Market Analysis',
    description: 'Our AI scans market data across multiple timeframes, analyzing trends, volatility, and sentiment.',
  },
  {
    icon: Bot,
    name: 'Signal Generation',
    description: 'When a high-probability setup is detected, a signal is generated with clear entry and exit points.',
  },
  {
    icon: Target,
    name: 'Execute with Confidence',
    description: 'Receive the signal on your dashboard and make your trade, backed by data-driven analysis.',
  },
];

export function HowItWorksSection() {
  return (
    <section id="how-it-works" className="py-20 sm:py-32 bg-gray-900/50">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto mb-16 max-w-2xl text-center"
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Simple Steps to <span className="text-primary">Smarter Trading</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            We demystify the market so you can focus on what matters.
          </p>
        </motion.div>
        
        <div className="relative">
          <div className="absolute left-1/2 top-10 hidden h-px w-2/3 -translate-x-1/2 bg-gradient-to-r from-transparent via-primary/50 to-transparent md:block" aria-hidden="true"></div>
          <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
            {steps.map((step, index) => (
              <motion.div
                key={step.name}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.2 }}
                viewport={{ once: true }}
                className="relative text-center"
              >
                <div className="relative z-10 mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-gray-800 ring-4 ring-primary/30">
                  <step.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="mt-6 font-serif text-xl font-semibold text-white">{step.name}</h3>
                <p className="mt-2 text-gray-400">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
