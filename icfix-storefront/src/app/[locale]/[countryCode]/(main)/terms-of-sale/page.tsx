export async function generateStaticParams() {
  return [
    { locale: "en", countryCode: "vn" },
    { locale: "vi", countryCode: "vn" },
  ];
}

import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Terms of Sale",
  description: "Terms of Sale for ICFix Store",
}

export default function TermsOfSale() {
  return (
    <div className="content-container py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl-semi text-gry-900 mb-8">Terms of Sale</h1>
        
        <div className="prose prose-lg max-w-none">
          <p className="text-base-regular text-gray-700 mb-6">
            <strong>Last updated:</strong> {new Date().toLocaleDateString()}
          </p>

          <section className="mb-8">
            <h2 className="text-xl-semi text-gray-900 mb-4">Acceptance of Terms</h2>
            <p className="text-base-regular text-gray-700 mb-4">
              By placing an order with ICFix, you agree to be bound by these Terms of Sale. 
              If you do not agree to these terms, please do not place an order.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl-semi text-gray-900 mb-4">Products and Pricing</h2>
            <p className="text-base-regular text-gray-700 mb-4">
              All product descriptions, images, and prices are subject to change without notice. 
              We reserve the right to correct any errors in pricing or product information.
            </p>
            <ul className="list-disc pl-6 text-base-regular text-gray-700 mb-4">
              <li>Prices are displayed in the currency of your selected region</li>
              <li>All prices include applicable taxes unless otherwise stated</li>
              <li>Product availability is subject to stock levels</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl-semi text-gray-900 mb-4">Orders and Payment</h2>
            <p className="text-base-regular text-gray-700 mb-4">
              When you place an order:
            </p>
            <ul className="list-disc pl-6 text-base-regular text-gray-700 mb-4">
              <li>You will receive an order confirmation email</li>
              <li>Payment is processed at the time of order placement</li>
              <li>We accept major credit cards and other payment methods as displayed</li>
              <li>All payments are processed securely through our payment partners</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl-semi text-gray-900 mb-4">Shipping and Delivery</h2>
            <p className="text-base-regular text-gray-700 mb-4">
              Shipping terms:
            </p>
            <ul className="list-disc pl-6 text-base-regular text-gray-700 mb-4">
              <li>Delivery times are estimates and not guaranteed</li>
              <li>Risk of loss transfers to you upon delivery</li>
              <li>You are responsible for providing accurate shipping information</li>
              <li>Additional charges may apply for international shipping</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl-semi text-gray-900 mb-4">Returns and Refunds</h2>
            <p className="text-base-regular text-gray-700 mb-4">
              Our return policy:
            </p>
            <ul className="list-disc pl-6 text-base-regular text-gray-700 mb-4">
              <li>Returns must be initiated within 30 days of delivery</li>
              <li>Items must be in original condition with tags attached</li>
              <li>Refunds will be processed to the original payment method</li>
              <li>Shipping costs for returns are the customer's responsibility</li>
            </ul>
          </section>

          <section className="mb-8">
            <h2 className="text-xl-semi text-gray-900 mb-4">Warranties and Disclaimers</h2>
            <p className="text-base-regular text-gray-700 mb-4">
              Products are sold "as is" without any warranties, express or implied. 
              We disclaim all warranties including merchantability and fitness for a particular purpose.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl-semi text-gray-900 mb-4">Limitation of Liability</h2>
            <p className="text-base-regular text-gray-700 mb-4">
              Our liability is limited to the purchase price of the products. We are not liable for 
              any indirect, incidental, or consequential damages.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl-semi text-gray-900 mb-4">Governing Law</h2>
            <p className="text-base-regular text-gray-700 mb-4">
              These terms are governed by the laws of [Your Jurisdiction] and any disputes 
              will be resolved in the courts of [Your Jurisdiction].
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-xl-semi text-gray-900 mb-4">Contact Information</h2>
            <p className="text-base-regular text-gray-700 mb-4">
              For questions about these Terms of Sale, please contact us at:
            </p>
            <p className="text-base-regular text-gray-700">
              Email: legal@icfix.com<br />
              Address: [Your Company Address]
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
