import React, { useState } from 'react';
import './styles.css';

export default function App() {
  const [files, setFiles] = useState([]);
  
  return (
    <div className="app">
      <header className="app-header">
        <div className="logo">IC</div>
        <h1>Image Compressor</h1>
        <nav className="nav">
          <a href="#faq">FAQ</a>
          <a href="#about">About</a>
          <button className="btn-pro">Pro Version</button>
        </nav>
      </header>

      <main className="container">
        <section className="layout">
          <div className="left">
            <p className="lead">
              Reduce image size directly in your browser. Private, fast, and no uploads.
            </p>

            <div className="dropzone" style={{ 
              border: '2px dashed #ccc', 
              padding: '40px', 
              textAlign: 'center',
              borderRadius: '8px',
              backgroundColor: '#f9f9f9'
            }}>
              <div className="dz-title">Drag & drop images here</div>
              <div className="dz-sub">or click to select files</div>
              <input type="file" multiple accept="image/*" style={{ marginTop: '20px' }} />
            </div>

            <div style={{ marginTop: '20px' }}>
              <button className="btn primary" style={{
                backgroundColor: '#2563eb',
                color: 'white',
                padding: '12px 24px',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}>
                Compress Images
              </button>
            </div>
          </div>

          <div className="right">
            <div className="card" style={{
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '20px',
              backgroundColor: 'white'
            }}>
              <h3 className="card-title">💡 Tips</h3>
              <ul className="list">
                <li>Use WEBP for better compression without noticeable quality loss.</li>
                <li>Reduce width for websites/social networks to speed up loading.</li>
                <li>Everything is processed locally — full privacy.</li>
                <li>Batch process multiple images for efficiency.</li>
              </ul>
            </div>
          </div>
        </section>
      </main>

      <footer className="footer" style={{
        textAlign: 'center',
        padding: '20px',
        borderTop: '1px solid #e5e7eb',
        marginTop: '40px'
      }}>
        <div>© {new Date().getFullYear()} Image Compressor — Privacy: we do not upload your images.</div>
      </footer>
    </div>
  );
}
