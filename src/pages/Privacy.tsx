import { Link } from "react-router-dom";
import { Seo } from "@/components/seo/Seo";

const Privacy = () => {
  return (
    <>
      <Seo
        title="Privacy Policy | Ringster AI"
        description="Learn how Ringster collects, uses, and protects your personal information. Our privacy policy covers data collection, cookies, your rights, and more."
      />
      <main className="min-h-screen bg-background pt-32 pb-16">
        <div className="container mx-auto px-6 max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: December 20, 2024</p>

          <div className="prose prose-slate dark:prose-invert max-w-none space-y-8">
            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">1. Introduction</h2>
              <p className="text-muted-foreground">
                Ringster ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
                explains how we collect, use, disclose, and safeguard your information when you use our 
                AI-powered calling platform and related services (collectively, the "Service").
              </p>
              <p className="text-muted-foreground mt-4">
                Please read this Privacy Policy carefully. By using the Service, you consent to the collection 
                and use of your information in accordance with this policy.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">2. Company Information</h2>
              <p className="text-muted-foreground">
                Ringster is the data controller responsible for your personal information. You can contact us at:
              </p>
              <ul className="list-none mt-2 space-y-1 text-muted-foreground">
                <li>Email: privacy@ringster.ai</li>
                <li>Website: <Link to="/contact" className="text-primary hover:underline">Contact Form</Link></li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">3. Information We Collect</h2>
              
              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">3.1 Information You Provide</h3>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li><strong>Account Information:</strong> Name, email address, phone number, company name, organization size</li>
                <li><strong>Profile Information:</strong> Username, bio, avatar, website</li>
                <li><strong>Payment Information:</strong> Billing address, payment method details (processed by Stripe)</li>
                <li><strong>Communication:</strong> Messages you send us, support requests, feedback</li>
                <li><strong>AI Agent Content:</strong> Scripts, greetings, descriptions you create for AI agents</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">3.2 Information Collected Automatically</h3>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li><strong>Usage Data:</strong> Pages visited, features used, actions taken, timestamps</li>
                <li><strong>Device Information:</strong> IP address, browser type, operating system, device identifiers</li>
                <li><strong>Cookies and Tracking:</strong> See our Cookie Policy section below</li>
              </ul>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">3.3 Call-Related Information</h3>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li><strong>Call Logs:</strong> Phone numbers, call duration, call status, timestamps</li>
                <li><strong>Call Recordings:</strong> Audio recordings of calls (when enabled by user)</li>
                <li><strong>Transcripts:</strong> AI-generated transcriptions of recorded calls</li>
                <li><strong>Campaign Data:</strong> Contact lists, call outcomes, scheduling information</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">4. How We Use Your Information</h2>
              <p className="text-muted-foreground">We use the information we collect to:</p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Provide, maintain, and improve the Service</li>
                <li>Process transactions and send related information</li>
                <li>Send administrative messages, updates, and security alerts</li>
                <li>Respond to your comments, questions, and support requests</li>
                <li>Monitor and analyze usage trends and preferences</li>
                <li>Detect, investigate, and prevent fraudulent or unauthorized activity</li>
                <li>Comply with legal obligations</li>
                <li>With your consent, send marketing communications</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">5. Legal Basis for Processing (GDPR)</h2>
              <p className="text-muted-foreground">
                If you are in the European Economic Area (EEA), our legal bases for processing your information include:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li><strong>Contract Performance:</strong> Processing necessary to provide the Service</li>
                <li><strong>Legitimate Interests:</strong> Improving and securing our Service, fraud prevention</li>
                <li><strong>Consent:</strong> Marketing communications, non-essential cookies</li>
                <li><strong>Legal Obligations:</strong> Compliance with applicable laws</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">6. Cookie Policy</h2>
              <p className="text-muted-foreground">
                We use cookies and similar tracking technologies to collect and track information about your 
                browsing activity. You can control cookie preferences through our cookie consent banner.
              </p>

              <h3 className="text-xl font-medium text-foreground mt-6 mb-3">Types of Cookies We Use</h3>
              
              <div className="mt-4 space-y-4">
                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-foreground">Essential Cookies</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    Required for the website to function. Include authentication tokens, security features, 
                    and session management. These cannot be disabled.
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-foreground">Analytics Cookies</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Google Analytics (G-YB77QZJ6T9):</strong> Helps us understand how visitors interact 
                    with our website by collecting anonymous usage data.
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Google Tag Manager (GTM-P5M6SM65):</strong> Manages and deploys marketing tags 
                    on our website.
                  </p>
                </div>

                <div className="p-4 bg-muted/30 rounded-lg">
                  <h4 className="font-medium text-foreground">Marketing Cookies</h4>
                  <p className="text-sm text-muted-foreground mt-1">
                    <strong>Meta (Facebook) Pixel:</strong> Used to measure and optimize ad campaigns, 
                    track conversions, and build audiences for advertising.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">7. Third-Party Services</h2>
              <p className="text-muted-foreground">
                We share information with third-party service providers who help us operate the Service:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li><strong>Supabase:</strong> Database hosting and authentication</li>
                <li><strong>Twilio:</strong> Phone number provisioning and calling infrastructure</li>
                <li><strong>VAPI:</strong> AI voice agent technology</li>
                <li><strong>ElevenLabs:</strong> Text-to-speech voice synthesis</li>
                <li><strong>Stripe:</strong> Payment processing</li>
                <li><strong>Google:</strong> Analytics and calendar integrations</li>
                <li><strong>Meta:</strong> Advertising measurement</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                These providers may process your data in accordance with their own privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">8. Data Retention</h2>
              <p className="text-muted-foreground">
                We retain your information for as long as necessary to provide the Service and fulfill the 
                purposes described in this policy. Specific retention periods:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li><strong>Account Data:</strong> Until you delete your account</li>
                <li><strong>Call Recordings:</strong> 90 days, or as configured by user</li>
                <li><strong>Call Logs:</strong> 2 years for analytics purposes</li>
                <li><strong>Cookie Consent:</strong> 12 months from consent date</li>
                <li><strong>Legal Records:</strong> As required by law (typically 7 years)</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">9. Your Rights</h2>
              <p className="text-muted-foreground">
                Depending on your location, you may have the following rights:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li><strong>Access:</strong> Request a copy of your personal data</li>
                <li><strong>Correction:</strong> Request correction of inaccurate data</li>
                <li><strong>Deletion:</strong> Request deletion of your data ("right to be forgotten")</li>
                <li><strong>Portability:</strong> Receive your data in a portable format</li>
                <li><strong>Restriction:</strong> Request restriction of processing</li>
                <li><strong>Objection:</strong> Object to processing based on legitimate interests</li>
                <li><strong>Withdraw Consent:</strong> Withdraw consent at any time for consent-based processing</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                To exercise these rights, contact us at privacy@ringster.ai. We will respond within 30 days.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">10. California Privacy Rights (CCPA/CPRA)</h2>
              <p className="text-muted-foreground">
                If you are a California resident, you have additional rights under the California Consumer 
                Privacy Act (CCPA) and California Privacy Rights Act (CPRA):
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li><strong>Right to Know:</strong> What personal information we collect and how it's used</li>
                <li><strong>Right to Delete:</strong> Request deletion of your personal information</li>
                <li><strong>Right to Opt-Out:</strong> Opt out of the sale or sharing of personal information</li>
                <li><strong>Right to Non-Discrimination:</strong> Equal service regardless of privacy choices</li>
                <li><strong>Right to Correct:</strong> Request correction of inaccurate information</li>
                <li><strong>Right to Limit:</strong> Limit use of sensitive personal information</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                We do not sell personal information. To exercise your rights, contact privacy@ringster.ai 
                or call our designated toll-free number.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">11. International Data Transfers</h2>
              <p className="text-muted-foreground">
                Your information may be transferred to and processed in countries other than your own. 
                We ensure appropriate safeguards are in place, including:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Standard Contractual Clauses approved by the European Commission</li>
                <li>Data Processing Agreements with all service providers</li>
                <li>Encryption of data in transit and at rest</li>
              </ul>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">12. Data Security</h2>
              <p className="text-muted-foreground">
                We implement appropriate technical and organizational measures to protect your information:
              </p>
              <ul className="list-disc pl-6 mt-2 space-y-2 text-muted-foreground">
                <li>Encryption of data in transit (TLS/SSL) and at rest</li>
                <li>Row-level security on all database tables</li>
                <li>Regular security audits and vulnerability assessments</li>
                <li>Access controls and authentication requirements</li>
                <li>Employee training on data protection</li>
              </ul>
              <p className="text-muted-foreground mt-4">
                However, no method of transmission over the Internet is 100% secure. We cannot guarantee 
                absolute security.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">13. Children's Privacy</h2>
              <p className="text-muted-foreground">
                The Service is not intended for children under 16 years of age. We do not knowingly collect 
                personal information from children under 16. If you believe we have collected information 
                from a child under 16, please contact us immediately at privacy@ringster.ai.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">14. Changes to This Policy</h2>
              <p className="text-muted-foreground">
                We may update this Privacy Policy from time to time. We will notify you of any material 
                changes by posting the new policy on this page and updating the "Last updated" date. 
                For significant changes, we may send you an email notification.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-semibold text-foreground mt-8 mb-4">15. Contact Us</h2>
              <p className="text-muted-foreground">
                If you have any questions about this Privacy Policy or our data practices, please contact us:
              </p>
              <ul className="list-none mt-2 space-y-1 text-muted-foreground">
                <li>Email: privacy@ringster.ai</li>
                <li>Website: <Link to="/contact" className="text-primary hover:underline">Contact Form</Link></li>
              </ul>
              <p className="text-muted-foreground mt-4">
                For EU residents: You have the right to lodge a complaint with your local data protection 
                authority if you believe we have not complied with applicable data protection laws.
              </p>
            </section>

            <section className="pt-8 border-t border-border">
              <p className="text-sm text-muted-foreground">
                See also our{" "}
                <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>.
              </p>
            </section>
          </div>
        </div>
      </main>
    </>
  );
};

export default Privacy;
