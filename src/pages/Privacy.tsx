
const Privacy = () => {
  return (
    <main className="min-h-screen bg-white pt-32 pb-16">
      <div className="container mx-auto px-6">
        <h1 className="text-4xl font-bold text-[#1A1F2C] mb-8">Privacy Policy</h1>
        
        <div className="prose max-w-none space-y-6 text-[#403E43]">
          <section>
            <h2 className="text-2xl font-semibold text-[#1A1F2C] mt-8 mb-4">Introduction</h2>
            <p>
              At Ringster, we take your privacy seriously. This Privacy Policy explains how we collect, use, 
              disclose, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1A1F2C] mt-8 mb-4">Information We Collect</h2>
            <p>
              We collect information that you provide directly to us, including but not limited to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Contact information (name, email address, phone number)</li>
              <li>Account credentials</li>
              <li>Communication preferences</li>
              <li>Usage data and analytics</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1A1F2C] mt-8 mb-4">How We Use Your Information</h2>
            <p>
              We use the information we collect to:
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Provide and maintain our service</li>
              <li>Improve user experience</li>
              <li>Send you important updates and notifications</li>
              <li>Respond to your inquiries and support requests</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1A1F2C] mt-8 mb-4">Data Security</h2>
            <p>
              We implement appropriate technical and organizational measures to maintain the security of your 
              personal information. However, no method of transmission over the Internet or electronic storage 
              is 100% secure.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold text-[#1A1F2C] mt-8 mb-4">Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              Email: privacy@ringster.ai
            </p>
          </section>
        </div>
      </div>
    </main>
  );
};

export default Privacy;
