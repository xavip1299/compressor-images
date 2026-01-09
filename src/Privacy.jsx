import React from "react";

export default function Privacy() {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-content">
          <div style={{ marginBottom: '2rem' }}>
            <a href="/" onClick={(e) => { e.preventDefault(); window.history.back(); }} style={{ color: '#0066cc', textDecoration: 'none', fontSize: '1rem' }}>
              ← Back to Compressor
            </a>
          </div>
          <h1>Privacy Policy</h1>
          <p className="last-updated">Last updated: August 13, 2025</p>
          
          <section>
            <h2>Your Privacy is Our Priority</h2>
            <p>
              At Image Compressor, we believe in complete transparency about how we handle your data. 
              This privacy policy explains our practices regarding the collection, use, and protection of your information.
            </p>
          </section>

          <section>
            <h2>Data We Don't Collect</h2>
            <ul>
              <li><strong>Your Images:</strong> All image processing happens directly in your browser. We never upload, store, or have access to your images.</li>
              <li><strong>Personal Information:</strong> We don't require accounts, emails, or personal details to use our service.</li>
              <li><strong>File Contents:</strong> Your photos and documents remain completely private on your device.</li>
            </ul>
          </section>

          <section>
            <h2>Analytics Data We Collect</h2>
            <p>We use Plausible Analytics (privacy-focused) to understand how our service is used:</p>
            <ul>
              <li>Page views and basic navigation patterns</li>
              <li>General geographic location (country/region level only)</li>
              <li>Device type and browser information</li>
              <li>Referral sources (which websites link to us)</li>
            </ul>
            <p>This data is:</p>
            <ul>
              <li>Completely anonymous and aggregated</li>
              <li>Cannot be used to identify individuals</li>
              <li>Stored in the EU with GDPR compliance</li>
              <li>Not shared with third parties</li>
            </ul>
          </section>

          <section>
            <h2>Cookies and Local Storage</h2>
            <p>We use minimal browser storage for:</p>
            <ul>
              <li><strong>User Preferences:</strong> Saving your compression settings (quality, format, dimensions)</li>
              <li><strong>Analytics:</strong> Plausible uses a simple cookie-free tracking approach</li>
            </ul>
            <p>You can clear this data anytime through your browser settings.</p>
          </section>

          <section>
            <h2>Third-Party Services</h2>
            <h3>Plausible Analytics</h3>
            <p>
              We use Plausible Analytics for privacy-friendly website analytics. Unlike Google Analytics, 
              Plausible doesn't use cookies, doesn't track users across websites, and is fully GDPR compliant.
              <br />
              <a href="https://plausible.io/privacy" target="_blank" rel="noopener noreferrer">View Plausible's Privacy Policy</a>
            </p>

            <h3>Google AdSense</h3>
            <p>
              Our website displays advertisements through Google AdSense to support this free service. 
              Third parties, including Google, use cookies to serve ads based on a user's prior visits to this website or other websites.
            </p>
            <p>
              Google's use of advertising cookies enables it and its partners to serve ads to you based on your visit 
              to this site and/or other sites on the Internet. Users may opt out of personalized advertising by visiting 
              <a href="https://www.google.com/settings/ads" target="_blank" rel="noopener noreferrer">Ads Settings</a>.
            </p>
            <p>
              For more information about how Google uses data when you use our site, please visit: <br />
              <a href="https://policies.google.com/technologies/partner-sites" target="_blank" rel="noopener noreferrer">
                How Google uses information from sites or apps that use our services
              </a>
            </p>
            <p>
              Additional resources:
            </p>
            <ul>
              <li><a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a></li>
              <li><a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer">How Google uses cookies in advertising</a></li>
            </ul>

            <h3>Affiliate Links</h3>
            <p>
              Some links on our site are affiliate links. When you click these links, we may earn a small commission 
              at no cost to you. This helps support the free service we provide.
            </p>
          </section>

          <section>
            <h2>How We Protect Your Privacy</h2>
            <ul>
              <li><strong>Client-Side Processing:</strong> All image compression happens in your browser</li>
              <li><strong>No Server Upload:</strong> Your files never leave your device</li>
              <li><strong>HTTPS Encryption:</strong> All communication is encrypted</li>
              <li><strong>No User Accounts:</strong> No registration or personal data required</li>
              <li><strong>Open Source:</strong> Our code is transparent and auditable</li>
            </ul>
          </section>

          <section>
            <h2>Your Rights</h2>
            <p>Since we don't collect personal data, there's minimal data to manage. However, you can:</p>
            <ul>
              <li>Clear your browser's local storage to remove saved preferences</li>
              <li>Use ad blockers to prevent advertising cookies</li>
              <li>Contact us with any privacy concerns</li>
            </ul>
          </section>

          <section>
            <h2>Children's Privacy</h2>
            <p>
              Our service doesn't knowingly collect any information from children under 13. 
              Since no personal data is collected, children can safely use our image compression tool.
            </p>
          </section>

          <section>
            <h2>Changes to This Policy</h2>
            <p>
              We may update this privacy policy occasionally. Changes will be posted on this page with 
              the updated date. Continued use of our service constitutes acceptance of any changes.
            </p>
          </section>

          <section>
            <h2>Contact Us</h2>
            <p>
              If you have questions about this privacy policy, please contact us:
            </p>
            <ul>
              <li>Email: privacy@imagecompressor.pro</li>
              <li>Website: <a href="/">imagecompressor.pro</a></li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
