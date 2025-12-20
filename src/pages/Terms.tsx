import { Link } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";

const Terms = () => {
  return (
    <>
      <Seo
        title="Terms of Service | Ringster AI"
        description="Read Ringster's Terms of Service to understand your rights and responsibilities when using our AI-powered calling platform."
      />
      <main className="min-h-screen bg-background pt-32 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-2">Terms of Service</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 20, 2024</p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Acceptance of Terms</h2>
              <p className="text-muted-foreground">
                By accessing or using Ringster's services, website, or applications (collectively, the "Service"), 
                you agree to be bound by these Terms of Service ("Terms"). If you do not agree to these Terms, 
                you may not access or use the Service. These Terms apply to all visitors, users, and others 
                who access or use the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. Description of Service</h2>
              <p className="text-muted-foreground">
                Ringster provides an AI-powered calling platform that enables businesses to automate phone 
                communications, including but not limited to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>AI voice agents for inbound and outbound calls</li>
                <li>Automated call scheduling and management</li>
                <li>Call recording and transcription services</li>
                <li>Calendar booking integrations</li>
                <li>Campaign management for outbound calling</li>
                <li>Analytics and reporting on call performance</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. User Accounts</h2>
              <p className="text-muted-foreground">
                To access certain features of the Service, you must register for an account. You agree to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Provide accurate, current, and complete information during registration</li>
                <li>Maintain and promptly update your account information</li>
                <li>Maintain the security of your password and account</li>
                <li>Accept responsibility for all activities that occur under your account</li>
                <li>Notify us immediately of any unauthorized use of your account</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. Acceptable Use Policy</h2>
              <p className="text-muted-foreground">You agree not to use the Service to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Violate any applicable laws, including telecommunications regulations (TCPA, GDPR, etc.)</li>
                <li>Make calls without proper consent from recipients</li>
                <li>Engage in harassment, fraud, or deceptive practices</li>
                <li>Transmit spam, phishing, or malicious content</li>
                <li>Impersonate any person or entity</li>
                <li>Interfere with or disrupt the Service or servers</li>
                <li>Attempt to gain unauthorized access to any part of the Service</li>
                <li>Use the Service for any illegal or unauthorized purpose</li>
                <li>Make robocalls or telemarketing calls in violation of applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">5. Telecommunications Compliance</h2>
              <p className="text-muted-foreground">
                You are solely responsible for ensuring your use of the Service complies with all applicable 
                telecommunications laws and regulations, including but not limited to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>The Telephone Consumer Protection Act (TCPA) in the United States</li>
                <li>Do-Not-Call Registry requirements</li>
                <li>State-specific telemarketing laws</li>
                <li>International calling regulations</li>
                <li>GDPR and data protection requirements for EU residents</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                You must obtain all necessary consents before using the Service to contact any individual. 
                Ringster is not responsible for any violations of telecommunications laws resulting from your use of the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">6. Call Recording Disclosure</h2>
              <p className="text-muted-foreground">
                If you enable call recording features, you are responsible for:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Providing required disclosures to call recipients</li>
                <li>Obtaining consent where required by law</li>
                <li>Complying with all-party or one-party consent requirements based on jurisdiction</li>
                <li>Maintaining appropriate records of consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">7. Payment Terms</h2>
              <p className="text-muted-foreground">
                Certain features of the Service require payment. By subscribing to a paid plan, you agree to:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Pay all fees in accordance with the pricing and billing terms</li>
                <li>Provide accurate billing information</li>
                <li>Authorize recurring charges for subscription plans</li>
                <li>Accept that fees are non-refundable except as required by law</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We reserve the right to modify pricing with 30 days' notice. Continued use after price changes 
                constitutes acceptance of new pricing.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">8. Intellectual Property</h2>
              <p className="text-muted-foreground">
                The Service and its original content, features, and functionality are owned by Ringster and are 
                protected by international copyright, trademark, patent, trade secret, and other intellectual 
                property laws. You may not:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Copy, modify, or distribute the Service without permission</li>
                <li>Reverse engineer or attempt to extract source code</li>
                <li>Use our trademarks without written consent</li>
                <li>Remove any copyright or proprietary notices</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">9. User Content</h2>
              <p className="text-muted-foreground">
                You retain ownership of content you create or upload to the Service ("User Content"). 
                By using the Service, you grant Ringster a worldwide, non-exclusive, royalty-free license 
                to use, process, and store User Content solely for the purpose of providing the Service.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">10. Disclaimer of Warranties</h2>
              <p className="text-muted-foreground">
                THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EITHER 
                EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO IMPLIED WARRANTIES OF MERCHANTABILITY, 
                FITNESS FOR A PARTICULAR PURPOSE, NON-INFRINGEMENT, OR COURSE OF PERFORMANCE.
              </p>
              <p className="text-muted-foreground mt-4">
                Ringster does not warrant that the Service will be uninterrupted, secure, or error-free, 
                or that defects will be corrected.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">11. Limitation of Liability</h2>
              <p className="text-muted-foreground">
                TO THE MAXIMUM EXTENT PERMITTED BY LAW, RINGSTER SHALL NOT BE LIABLE FOR ANY INDIRECT, 
                INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF PROFITS OR REVENUES, 
                WHETHER INCURRED DIRECTLY OR INDIRECTLY, OR ANY LOSS OF DATA, USE, GOODWILL, OR OTHER 
                INTANGIBLE LOSSES, RESULTING FROM:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Your use or inability to use the Service</li>
                <li>Any unauthorized access to or alteration of your data</li>
                <li>Statements or conduct of any third party on the Service</li>
                <li>Any other matter relating to the Service</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                Our total liability shall not exceed the greater of $100 or the amount paid by you in the 
                past 12 months.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">12. Indemnification</h2>
              <p className="text-muted-foreground">
                You agree to indemnify and hold harmless Ringster, its officers, directors, employees, and 
                agents from any claims, damages, losses, or expenses (including reasonable attorneys' fees) 
                arising from:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Your use of the Service</li>
                <li>Your violation of these Terms</li>
                <li>Your violation of any third-party rights, including telecommunications laws</li>
                <li>Any claims from recipients of calls made using the Service</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">13. Termination</h2>
              <p className="text-muted-foreground">
                We may terminate or suspend your account and access to the Service immediately, without prior 
                notice or liability, for any reason, including breach of these Terms. Upon termination:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Your right to use the Service will immediately cease</li>
                <li>We may delete your account and data</li>
                <li>All provisions that should survive termination will survive</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">14. Governing Law</h2>
              <p className="text-muted-foreground">
                These Terms shall be governed by and construed in accordance with the laws of the State of 
                Delaware, United States, without regard to its conflict of law provisions. Any disputes 
                arising under these Terms shall be subject to the exclusive jurisdiction of the courts 
                located in Delaware.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">15. Changes to Terms</h2>
              <p className="text-muted-foreground">
                We reserve the right to modify or replace these Terms at any time. We will provide at least 
                30 days' notice before any material changes take effect. Continued use of the Service after 
                changes become effective constitutes acceptance of the new Terms.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">16. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about these Terms, please contact us at:
              </p>
              <ul className="list-none mt-2 space-y-1 text-muted-foreground">
                <li>Email: legal@ringster.ai</li>
                <li>Website: <Link to="/contact" className="text-primary hover:underline">Contact Form</Link></li>
              </ul>
            </section>

            <section className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                By using Ringster, you acknowledge that you have read, understood, and agree to be bound 
                by these Terms of Service. See also our{" "}
                <Link to="/privacy" className="text-primary hover:underline">Privacy Policy</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default Terms;
