export async function generateStaticParams() {
  return [
    { locale: "en", countryCode: "vn" },
    { locale: "vi", countryCode: "vn" },
  ];
}

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "Privacy Policy for ICFix Store",
}

export default function PrivacyPolicy() {
  return (
    <div className="content-container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl-semi text-gry-900 mb-8">Privacy Policy</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-base-regular text-gray-700 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-xl-semi text-gray-900 mb-4">Information We Collect</h2>
            <p className="text-base-regular text-gray-700 mb-4">
              We collect information you provide directly to us, such as when you create an account, 
              make a purchase, or contact us for support.
            </p>
            <ul className="list-disc pl-6 text-base-regular text-gray-700 mb-4">
              <li>Personal information (name, email address, phone number)</li>
              <li>Billing and shipping addresses</li>
              <li>Payment information (processed securely through our payment partners)</li>
              <li>Account credentials and preferences</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl-semi text-gray-900 mb-4">How We Use Your Information</h2>
            <p className="text-base-regular text-gray-700 mb-4">
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 text-base-regular text-gray-700 mb-4">
              <li>Process and fulfill your orders</li>
              <li>Provide customer support</li>
              <li>Send you important updates about your orders</li>
              <li>Improve our products and services</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl-semi text-gray-900 mb-4">Information Sharing</h2>
            <p className="text-base-regular text-gray-700 mb-4">
              We do not sell, trade, or otherwise transfer your personal information to third parties 
              except as described in this policy. We may share your information with:
            </p>
            <ul className="list-disc pl-6 text-base-regular text-gray-700 mb-4">
              <li>Service providers who assist us in operating our website and conducting our business</li>
              <li>Payment processors to process your transactions</li>
              <li>Shipping carriers to deliver your orders</li>
              <li>Legal authorities when required by law</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl-semi text-gray-900 mb-4">Data Security</h2>
            <p className="text-base-regular text-gray-700 mb-4">
              We implement appropriate security measures to protect your personal information against 
              unauthorized access, alteration, disclosure, or destruction. However, no method of 
              transmission over the internet is 100% secure.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl-semi text-gray-900 mb-4">Your Rights</h2>
            <p className="text-base-regular text-gray-700 mb-4">
              You have the right to:
            </p>
            <ul className="list-disc pl-6 text-base-regular text-gray-700 mb-4">
              <li>Access your personal information</li>
              <li>Correct inaccurate information</li>
              <li>Request deletion of your information</li>
              <li>Opt out of marketing communications</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl-semi text-gray-900 mb-4">Contact Us</h2>
            <p className="text-base-regular text-gray-700 mb-4">
              If you have any questions about this Privacy Policy, please contact us at:
            </p>
            <p className="text-base-regular text-gray-700">
              Email: privacy@icfix.com<br />
              Address: [Your Company Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
