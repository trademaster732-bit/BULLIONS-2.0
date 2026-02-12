
import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function TermsOfServicePage() {
  return (
    <div className="bg-black text-white">
      <LandingHeader />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl font-bold text-primary mb-6">Terms of Service</h1>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>

            <h2 className="font-serif text-2xl text-white pt-4">1. Acceptance of Terms</h2>
            <p>
              By accessing or using the BULLIONS BOT website and services ("Service"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree to all of these terms, do not use this Service. We may modify these Terms at any time, and such modifications shall be effective immediately upon posting.
            </p>

            <h2 className="font-serif text-2xl text-white pt-4">2. Description of Service</h2>
            <p>
              BULLIONS BOT provides AI-generated trading signals and analysis for the Gold/USD (XAU/USD) market for informational and educational purposes only. The Service is not a trading platform and does not execute trades. You are responsible for all trading decisions and actions you take in your own brokerage account.
            </p>

            <h2 className="font-serif text-2xl text-white pt-4">3. No Financial Advice</h2>
            <p>
              The information provided by BULLIONS BOT, including signals, analysis, and commentary, does not constitute financial, investment, or trading advice. It is general in nature and not specific to you or your financial situation. Trading financial markets, especially with leverage, involves a high level of risk and may not be suitable for all investors. You could lose some, all, or more than your initial investment. You should seek independent financial advice from a professional in connection with, or independently research and verify, any information that you find on our Service and wish to rely upon.
            </p>

            <h2 className="font-serif text-2xl text-white pt-4">4. User Accounts and Responsibilities</h2>
            <p>
              You must register for an account to access the Service. You are responsible for maintaining the confidentiality of your password and are fully responsible for all activities that occur under your account. You agree to immediately notify us of any unauthorized use of your account. You must be at least 18 years of age to use this Service.
            </p>

            <h2 className="font-serif text-2xl text-white pt-4">5. Subscription and Payments</h2>
            <p>
              Premium features of the Service are available through a paid subscription. Payments are processed via cryptocurrency as described on our upgrade page. All payments are final and non-refundable. It is your responsibility to ensure timely payment to maintain access. We reserve the right to change subscription fees at any time.
            </p>

            <h2 className="font-serif text-2xl text-white pt-4">6. Intellectual Property</h2>
            <p>
              All content on the Service, including the AI-generated signals, text, graphics, logos, and software, is the property of BULLIONS BOT and is protected by copyright and other intellectual property laws. You may not reproduce, distribute, or create derivative works from any content without our express written permission.
            </p>

            <h2 className="font-serif text-2xl text-white pt-4">7. Disclaimer of Warranties</h2>
            <p>
              The Service is provided "as is" and "as available" without any warranties of any kind. We do not warrant that the Service will be uninterrupted, error-free, or secure. We make no guarantees regarding the accuracy, completeness, or reliability of any signals or information provided. Past performance is not indicative of future results.
            </p>

            <h2 className="font-serif text-2xl text-white pt-4">8. Limitation of Liability</h2>
            <p>
              In no event shall BULLIONS BOT, its owners, or employees be liable for any direct, indirect, incidental, special, or consequential damages arising out of or in any way connected with your use of or inability to use the Service, including but not limited to losses incurred from any trading decisions made based on the information provided.
            </p>
            
            <h2 className="font-serif text-2xl text-white pt-4">9. Third-Party Links & Ads</h2>
            <p>
              Our Service may contain links to third-party websites or services, and may display advertisements (such as from Google AdSense) that are not owned or controlled by BULLIONS BOT. We have no control over, and assume no responsibility for, the content, privacy policies, or practices of any third-party websites or services.
            </p>
            
            <h2 className="font-serif text-2xl text-white pt-4">10. Governing Law</h2>
            <p>
              These Terms shall be governed by and construed in accordance with the laws of the jurisdiction in which the company is based, without regard to its conflict of law provisions.
            </p>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
