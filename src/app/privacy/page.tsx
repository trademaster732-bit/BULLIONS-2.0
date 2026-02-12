
import { LandingHeader } from '@/components/landing/landing-header';
import { LandingFooter } from '@/components/landing/landing-footer';

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-black text-white">
      <LandingHeader />
      <main className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-serif text-4xl font-bold text-primary mb-6">Privacy Policy</h1>
          <div className="space-y-6 text-gray-300 leading-relaxed">
            <p><strong>Last Updated:</strong> {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
            <p>
              BULLIONS BOT ("we", "us", "our") is committed to protecting your privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our website and services ("Service").
            </p>

            <h2 className="font-serif text-2xl text-white pt-4">1. Information We Collect</h2>
            <p>
              We may collect personal information from you in a variety of ways, including:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li><strong>Personal Data:</strong> When you register for an account, we collect your email address and password. We do not store passwords directly, but rather a secure hash of the password.</li>
              <li><strong>Payment Data:</strong> When you subscribe to our premium service, we collect information related to your payment, such as the plan selected, transaction hash, and proof of payment. We do not process or store any private keys.</li>
              <li><strong>Usage Data:</strong> We automatically collect information about how you access and use the Service, such as your IP address, browser type, pages visited, and the time and date of your visit.</li>
            </ul>

            <h2 className="font-serif text-2xl text-white pt-4">2. How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc list-inside space-y-2 pl-4">
              <li>Create and manage your account.</li>
              <li>Provide, operate, and maintain the Service.</li>
              <li>Process your subscription payments and verify transactions.</li>
              <li>Improve, personalize, and expand our Service.</li>
              <li>Communicate with you, including for customer service and to provide you with updates and other information relating to the Service.</li>
              <li>Monitor and analyze usage and trends to improve your experience.</li>
              <li>Display personalized advertisements, for example through Google AdSense.</li>
            </ul>
            
            <h2 className="font-serif text-2xl text-white pt-4">3. Cookies and Tracking Technologies</h2>
            <p>
              We use cookies and similar tracking technologies to track the activity on our Service and hold certain information. Cookies are files with a small amount of data which may include an anonymous unique identifier. Our advertising partners, such as Google AdSense, may also use cookies to serve ads based on a user's prior visits to our website or other websites. You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent.
            </p>
            <p>
                Google's use of advertising cookies enables it and its partners to serve ads to your users based on their visit to your sites and/or other sites on the Internet. Users may opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer" className="text-primary underline">Ads Settings</a>.
            </p>

            <h2 className="font-serif text-2xl text-white pt-4">4. Disclosure of Your Information</h2>
            <p>
              We do not sell, trade, or otherwise transfer your personally identifiable information to outside parties. This does not include trusted third parties who assist us in operating our website, conducting our business, or servicing you, so long as those parties agree to keep this information confidential. We may also release your information when we believe release is appropriate to comply with the law, enforce our site policies, or protect ours or others' rights, property, or safety.
            </p>

            <h2 className="font-serif text-2xl text-white pt-4">5. Data Security</h2>
            <p>
              We implement a variety of security measures to maintain the safety of your personal information. Your personal information is contained behind secured networks and is only accessible by a limited number of persons who have special access rights to such systems, and are required to keep the information confidential.
            </p>
            
            <h2 className="font-serif text-2xl text-white pt-4">6. Your Data Protection Rights (GDPR/CCPA)</h2>
            <p>
              Depending on your location, you may have the following rights regarding your personal data:
            </p>
             <ul className="list-disc list-inside space-y-2 pl-4">
                <li>The right to access – You have the right to request copies of your personal data.</li>
                <li>The right to rectification – You have the right to request that we correct any information you believe is inaccurate.</li>
                <li>The right to erasure – You have the right to request that we erase your personal data, under certain conditions.</li>
             </ul>
             <p>If you wish to exercise any of these rights, please contact us.</p>


            <h2 className="font-serif text-2xl text-white pt-4">7. Children's Privacy</h2>
            <p>
              Our Service is not intended for use by children under the age of 18. We do not knowingly collect personally identifiable information from children under 18.
            </p>

            <h2 className="font-serif text-2xl text-white pt-4">8. Changes to This Privacy Policy</h2>
            <p>
              We may update our Privacy Policy from time to time. We will notify you of any changes by posting the new Privacy Policy on this page. You are advised to review this Privacy Policy periodically for any changes.
            </p>

            <h2 className="font-serif text-2xl text-white pt-4">9. Contact Us</h2>
            <p>If you have any questions about this Privacy Policy, please contact us at support@bullions.live.</p>
          </div>
        </div>
      </main>
      <LandingFooter />
    </div>
  );
}
