import React from "react";

function AdBanner({ type = "banner", label = "Advertisement", className = "" }) {
  // Placeholder para anúncios - AdSense será adicionado após aprovação
  return (
    <div
      role="complementary"
      aria-label={label}
      className={`adslot ${className}`}
      style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        padding: '20px',
        borderRadius: '8px',
        textAlign: 'center',
        color: 'white',
        marginBottom: '20px'
      }}
    >
      <div className="ad-label" style={{ fontSize: '12px', opacity: 0.8, marginBottom: '10px' }}>Espaço Publicitário</div>
      <div className="ad-placeholder" style={{ fontSize: '14px', fontWeight: '500' }}>
        💡 Aguardando aprovação do Google AdSense
      </div>
    </div>
  );
}

function RecommendedTools({ onAffiliateClick }) {
  const tools = [
    {
      name: "Vercel Pro",
      description: "Deploy your websites instantly with zero configuration",
      url: "https://vercel.com/signup?utm_source=imagecompressor&utm_medium=affiliate",
      category: "hosting"
    },
    {
      name: "Unsplash+",
      description: "Premium stock photos for your projects",
      url: "https://unsplash.com/plus?utm_source=imagecompressor&utm_medium=affiliate", 
      category: "stock-photos"
    },
    {
      name: "Figma Pro",
      description: "Professional design tool for teams",
      url: "https://figma.com/pricing?utm_source=imagecompressor&utm_medium=affiliate",
      category: "design"
    },
    {
      name: "Cloudinary",
      description: "Image and video management in the cloud",
      url: "https://cloudinary.com/pricing?utm_source=imagecompressor&utm_medium=affiliate",
      category: "cdn"
    }
  ];

  const handleAffiliateClick = (tool) => {
    // Track affiliate clicks
    if (typeof window !== 'undefined' && window.plausible) {
      window.plausible('Affiliate Click', { 
        props: { 
          tool: tool.name, 
          category: tool.category 
        } 
      });
    }
    if (onAffiliateClick) {
      onAffiliateClick(tool);
    }
  };

  return (
    <div className="card recommended-tools">
      <h3 className="card-title">🛠️ Recommended Tools</h3>
      <p className="tools-subtitle">Professional tools we use and recommend</p>
      <div className="tools-grid">
        {tools.slice(0, 2).map((tool, idx) => (
          <a
            key={idx}
            href={tool.url}
            target="_blank"
            rel="nofollow sponsored"
            className="tool-card"
            onClick={() => handleAffiliateClick(tool)}
          >
            <div className="tool-name">{tool.name}</div>
            <div className="tool-description">{tool.description}</div>
            <div className="tool-cta">Learn more →</div>
          </a>
        ))}
      </div>
      <details className="more-tools">
        <summary>Show more tools</summary>
        <div className="tools-grid">
          {tools.slice(2).map((tool, idx) => (
            <a
              key={idx + 2}
              href={tool.url}
              target="_blank"
              rel="nofollow sponsored"
              className="tool-card"
              onClick={() => handleAffiliateClick(tool)}
            >
              <div className="tool-name">{tool.name}</div>
              <div className="tool-description">{tool.description}</div>
              <div className="tool-cta">Learn more →</div>
            </a>
          ))}
        </div>
      </details>
    </div>
  );
}

export { AdBanner, RecommendedTools };
