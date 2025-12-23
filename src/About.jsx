import React from "react";

export default function About() {
  return (
    <div className="legal-page">
      <div className="container">
        <div className="legal-content">
          <h1>About Image Compressor</h1>
          
          <section>
            <h2>Privacy-First Image Compression</h2>
            <p>
              Image Compressor is a free, privacy-focused tool that helps you reduce image file sizes 
              without compromising quality. Built with modern web technologies, everything happens 
              directly in your browser—no uploads, no servers, complete privacy.
            </p>
          </section>

          <section>
            <h2>Why We Built This</h2>
            <p>
              In an era where privacy concerns grow daily, we wanted to create a tool that respects 
              your data while providing professional-grade image compression. Most online compressors 
              require uploading your photos to unknown servers. We believe you shouldn't have to 
              sacrifice privacy for convenience.
            </p>
          </section>

          <section>
            <h2>Key Features</h2>
            <div className="features-grid">
              <div className="feature-card">
                <h3>🔒 Complete Privacy</h3>
                <p>Your images never leave your device. All processing happens locally in your browser.</p>
              </div>
              <div className="feature-card">
                <h3>⚡ Lightning Fast</h3>
                <p>Modern browser APIs ensure smooth, efficient compression without external dependencies.</p>
              </div>
              <div className="feature-card">
                <h3>🎯 Smart Presets</h3>
                <p>Optimized settings for Instagram, WhatsApp, Shopify, and general web use.</p>
              </div>
              <div className="feature-card">
                <h3>📱 Works Everywhere</h3>
                <p>Compatible with all modern browsers on desktop, tablet, and mobile devices.</p>
              </div>
              <div className="feature-card">
                <h3>🔧 Advanced Options</h3>
                <p>Fine-tune quality, dimensions, and format conversion to meet your exact needs.</p>
              </div>
              <div className="feature-card">
                <h3>📦 Batch Processing</h3>
                <p>Compress multiple images at once with progress tracking and ZIP download.</p>
              </div>
            </div>
          </section>

          <section>
            <h2>Technology Stack</h2>
            <p>Built with cutting-edge web technologies for optimal performance:</p>
            <ul>
              <li><strong>React 19:</strong> Modern UI with concurrent features</li>
              <li><strong>Vite:</strong> Lightning-fast build tool and development server</li>
              <li><strong>Canvas API:</strong> Native browser image processing</li>
              <li><strong>Web Workers:</strong> Non-blocking compression for smooth UX</li>
              <li><strong>EXIF Handling:</strong> Automatic orientation correction</li>
              <li><strong>Modern Formats:</strong> WebP, AVIF, and legacy JPEG/PNG support</li>
            </ul>
          </section>

          <section>
            <h2>Open Source & Transparent</h2>
            <p>
              We believe in transparency. Our codebase is open source and available for review. 
              This ensures you can verify our privacy claims and contribute to improvements.
            </p>
            <p>
              <a 
                href="https://github.com/xavip1299/compressor-images" 
                target="_blank" 
                rel="noopener"
                className="btn primary"
              >
                View Source Code
              </a>
            </p>
          </section>

          <section>
            <h2>Sustainability</h2>
            <p>
              As a free service, we're sustained through:</p>
            <ul>
              <li><strong>Ethical Advertising:</strong> Relevant, non-intrusive ads from Google AdSense</li>
              <li><strong>Affiliate Partnerships:</strong> Recommendations for tools we genuinely use</li>
              <li><strong>Pro Version:</strong> Advanced features for power users</li>
            </ul>
            <p>
              These revenue streams allow us to keep the core service free while continuing 
              development and server maintenance.
            </p>
          </section>

          <section>
            <h2>Browser Compatibility</h2>
            <p>Image Compressor works best with modern browsers that support:</p>
            <ul>
              <li>HTML5 Canvas API</li>
              <li>File API and FileReader</li>
              <li>Blob and URL.createObjectURL</li>
              <li>ES6+ JavaScript features</li>
            </ul>
            <p>
              <strong>Recommended browsers:</strong> Chrome 90+, Firefox 88+, Safari 14+, Edge 90+
            </p>
          </section>

          <section>
            <h2>Performance Benchmarks</h2>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-number">&lt; 1s</div>
                <div className="stat-label">Initial Load Time</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">90%</div>
                <div className="stat-label">Average Size Reduction</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">100+</div>
                <div className="stat-label">Images per Batch</div>
              </div>
              <div className="stat-card">
                <div className="stat-number">0</div>
                <div className="stat-label">Data Uploaded</div>
              </div>
            </div>
          </section>

          <section>
            <h2>Contact & Support</h2>
            <p>We're here to help and always improving based on user feedback:</p>
            <ul>
              <li><strong>Email:</strong> hello@imagecompressor.pro</li>
              <li><strong>Feature Requests:</strong> github.com/xavip1299/compressor-images/issues</li>
              <li><strong>Twitter:</strong> @imagecompressor</li>
            </ul>
          </section>

          <section>
            <h2>Credits & Acknowledgments</h2>
            <p>Special thanks to the open-source community and these projects:</p>
            <ul>
              <li>React team for the excellent framework</li>
              <li>Vite for blazing-fast development experience</li>
              <li>JSZip for client-side archive creation</li>
              <li>FileSaver.js for cross-browser file downloads</li>
              <li>Plausible for privacy-friendly analytics</li>
            </ul>
          </section>
        </div>
      </div>
    </div>
  );
}
