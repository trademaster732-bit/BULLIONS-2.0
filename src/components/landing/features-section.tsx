
'use client';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Activity, BrainCircuit, BarChartHorizontal, ShieldCheck } from 'lucide-react';

const features = [
  {
    icon: Activity,
    title: 'Live AI Signals 24/7',
    description: 'Never miss an opportunity. Our AI works around the clock, delivering profitable signals so you can trade on your schedule.',
  },
  {
    icon: BrainCircuit,
    title: 'Multi-Layered Analysis',
    description: 'Trade with confidence. Our signals are cross-validated against trend, momentum, and sentiment for higher accuracy.',
  },
  {
    icon: ShieldCheck,
    title: 'Dynamic Risk Management',
    description: 'Protect your capital automatically. Every signal includes smart Stop Loss and Take Profit levels adjusted for live market conditions.',
  },
  {
    icon: BarChartHorizontal,
    title: 'Signal Strength Indicator',
    description: 'Make smarter decisions, faster. Instantly see if a trade is strong, moderate, or risky, allowing you to manage your portfolio with precision.',
  },
];

export function FeaturesSection() {
  return (
    <section id="features" className="bg-black py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Why Choose <span className="text-primary">BULLIONS BOT</span>?
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Gain an edge in the gold market with institutional-grade tools designed for retail traders.
          </p>
        </motion.div>

        <div className="mt-16 grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full border-primary/20 bg-gray-900/50 text-white transition-all hover:border-primary/50 hover:bg-gray-900">
                <CardHeader>
                  <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10">
                    <feature.icon className="h-6 w-6 text-primary" />
                  </div>
                  <CardTitle className="font-serif text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-400">{feature.description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
