'use client';
import { motion } from 'framer-motion';
import { Check } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

const tiers = [
  {
    name: 'Monthly Trader',
    price: '$99',
    priceSuffix: '/ month',
    features: [
      'Unlimited AI Signal Generation',
      'Live Signal Monitoring & P/L',
      'Complete Trade History & Analytics',
      'Dynamic SL/TP levels',
      'Signal Strength Indicators',
      'Priority Support',
    ],
    cta: 'Choose Monthly',
    href: '/upgrade',
    isPrimary: false,
  },
  {
    name: 'Annual Pro',
    price: '$299',
    priceSuffix: '/ year',
    features: [
      'Everything in Monthly, plus:',
      'Save over 75% vs Monthly',
      'Highest Priority Support',
      'Early Access to New Features',
      'Exclusive Strategy Insights',
      'Billed once annually',
    ],
    cta: 'Choose Annual',
    href: '/upgrade',
    isPrimary: true,
  },
];

export function PricingSection() {
  return (
    <section id="pricing" className="bg-black py-20 sm:py-32">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true }}
          className="mx-auto max-w-2xl text-center"
        >
          <h2 className="font-serif text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Choose Your <span className="text-primary">Trading Edge</span>
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Simple, transparent pricing. Cancel anytime.
          </p>
        </motion.div>

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-2">
          {tiers.map((tier, index) => (
            <motion.div
              key={tier.name}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              <Card
                className={cn(
                  'flex h-full flex-col border-primary/20 bg-gray-900/50 text-white',
                  tier.isPrimary && 'ring-2 ring-primary'
                )}
              >
                <CardHeader className="text-center">
                  <CardTitle className="font-serif text-2xl">{tier.name}</CardTitle>
                  <CardDescription className="mt-2 text-gray-400">
                    <span className="text-4xl font-bold text-white">{tier.price}</span>
                    <span className="text-gray-400">{tier.priceSuffix}</span>
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex-1">
                  <ul className="space-y-4">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-start">
                        <Check className="mr-3 h-6 w-6 flex-shrink-0 text-green-500" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
                <CardFooter>
                  <Button
                    asChild
                    className={cn(
                      'w-full',
                      tier.isPrimary
                        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                        : 'bg-white/10 hover:bg-white/20'
                    )}
                    size="lg"
                  >
                    <Link href={tier.href}>{tier.cta}</Link>
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          ))}
        </div>
         <div className="mt-8 text-center text-sm text-gray-500">
            <p>* 7-Day free trial is available on request after signing up for a free account.</p>
        </div>
      </div>
    </section>
  );
}
