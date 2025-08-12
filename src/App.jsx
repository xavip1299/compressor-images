import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import "./styles.css";

// ► Image Compressor & Resizer – single-file React app (client-side only)
// Features:
// - Presets (Instagram, WhatsApp, Shopify, Website) + custom
// - Correct EXIF orientation (createImageBitmap with imageOrientation)
// - Paste images from clipboard (Ctrl/Cmd+V)
// - Progress bar + ETA + cancel
// - Accessibility (keyboard/focus/ARIA) + dark-mode friendly
// - Results grid with total bytes saved
// - ZIP download (dynamic imports for smaller initial bundle)
// - Monetization placeholders (AdSlot, Pro CTA)
// - No backend needed (deploy free on Vercel/Netlify/GitHub Pages)

function formatBytes(bytes) {
  if (!Number.isFinite(bytes) || bytes <= 0) return "0 B";
  const units = ["B", "KB", "MB", "GB", "TB"];
  let i = 0;
  while (bytes >= 1024 && i < units.length - 1) {
    bytes /= 1024;
    i++;
  }
  return `${bytes.toFixed(bytes >= 100 ? 0 : bytes >= 10 ? 1 : 2)} ${units[i]}`;
}

function AdSlot({ label = "Ad" }) {
  return (
    <div
      role="complementary"
      aria-label={label}
      className="adslot"
    >
      {label} — Replace with AdSense/affiliate snippet
    </div>
  );
}

const DEFAULT_PRESETS = [
  { key: "instagram", name: "Instagram", w: 1080, h: 1350, q: 0.82, fmt: "image/jpeg" },
  { key: "whatsapp", name: "WhatsApp", w: 1280, h: 1280, q: 0.8, fmt: "image/webp" },
  { key: "shopify", name: "Shopify", w: 2048, h: 2048, q: 0.85, fmt: "image/webp" },
  { key: "website", name: "Website", w: 1600, h: 900, q: 0.78, fmt: "image/webp" },
];

export default function App() {
  const [files, setFiles] = useState([]); // File[]
  const [processing, setProcessing] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, startedAt: 0 });
  const [results, setResults] = useState([]); // {name, blob, originalSize, newSize, previewUrl, width, height, type}

  const [maxWidth, setMaxWidth] = useState(1920);
  const [maxHeight, setMaxHeight] = useState(1080);
  const [quality, setQuality] = useState(0.8);
  const [format, setFormat] = useState("image/jpeg");
  const [preset, setPreset] = useState("website");

  const [toast, setToast] = useState("");
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // derive presets
  const presets = useMemo(() => DEFAULT_PRESETS, []);
  useEffect(() => {
    const p = presets.find((p) => p.key === preset);
    if (!p) return;
    setMaxWidth(p.w);
    setMaxHeight(p.h);
    setQuality(p.q);
    setFormat(p.fmt);
  }, [preset, presets]);

  // paste from clipboard
  useEffect(() => {
    const onPaste = async (e) => {
      if (!e.clipboardData) return;
      const items = Array.from(e.clipboardData.items || [])
        .map((it) => (it.kind === "file" ? it.getAsFile() : null))
        .filter(Boolean)
        .filter((f) => f.type?.startsWith("image/"));
      if (items.length) setFiles((prev) => [...prev, ...items]);
    };
    window.addEventListener("paste", onPaste);
    return () => window.removeEventListener("paste", onPaste);
  }, []);

  const onPickFiles = useCallback(() => fileInputRef.current?.click(), []);

  const onDrop = useCallback((e) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
    if (list.length) setFiles((prev) => [...prev, ...list]);
  }, []);

  const onSelect = useCallback((e) => {
    const list = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    if (list.length) setFiles((prev) => [...prev, ...list]);
    e.target.value = "";
  }, []);

  const clearAll = useCallback(() => {
    setFiles([]);
    setResults((prev) => {
      prev.forEach((r) => URL.revokeObjectURL(r.previewUrl));
      return [];
    });
    setProgress({ done: 0, total: 0, startedAt: 0 });
  }, []);

  const estimateEta = useMemo(() => {
    const { done, total, startedAt } = progress;
    if (!startedAt || !total || done === 0) return "";
    const elapsed = (Date.now() - startedAt) / 1000;
    const rate = done / Math.max(1, elapsed);
    const remaining = total - done;
    const eta = remaining / Math.max(0.001, rate);
    return `${Math.max(1, Math.round(eta))}s left`;
  }, [progress]);

  async function processOne(file, opts) {
    // Correct EXIF orientation
    const img = await createImageBitmap(file, { imageOrientation: "from-image" });
    const ratio = Math.min(opts.maxWidth / img.width, opts.maxHeight / img.height, 1);
    const w = Math.max(1, Math.round(img.width * ratio));
    const h = Math.max(1, Math.round(img.height * ratio));

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = w;
    canvas.height = h;
    ctx.drawImage(img, 0, 0, w, h);

    const mime = opts.format;
    const blob = await new Promise((res) => {
      try {
        canvas.toBlob(
          (b) => res(b || dataURLtoBlob(canvas.toDataURL(mime, opts.quality))),
          mime,
          opts.quality
        );
      } catch {
        res(dataURLtoBlob(canvas.toDataURL(mime, opts.quality)));
      }
    });

    const nameNoExt = file.name.replace(/\.[^.]+$/, "");
    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const finalName = `${nameNoExt}-${w}x${h}.${ext}`;
    const previewUrl = URL.createObjectURL(blob);
    return {
      name: finalName,
      blob,
      previewUrl,
      originalSize: file.size,
      newSize: blob.size,
      width: w,
      height: h,
      type: mime,
    };
  }

  function dataURLtoBlob(dataUrl) {
    const arr = dataUrl.split(",");
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) u8arr[n] = bstr.charCodeAt(n);
    return new Blob([u8arr], { type: mime });
  }

  const handleProcess = useCallback(async () => {
    if (!files.length) return;
    setCancelRequested(false);
    setProcessing(true);
    setProgress({ done: 0, total: files.length, startedAt: Date.now() });

    const opts = { maxWidth, maxHeight, quality, format };
    const out = [];

    for (let i = 0; i < files.length; i++) {
      if (cancelRequested) break;
      const f = files[i];
      try {
        const r = await processOne(f, opts);
        out.push(r);
      } catch (err) {
        console.error("Failed to process", f.name, err);
        setToast(`Failed: ${f.name}`);
      }
      setProgress((p) => ({ ...p, done: Math.min(p.done + 1, p.total) }));
      // yield to the browser to keep UI smooth
      await new Promise((r) => requestAnimationFrame(() => r()));
    }

    setResults((prev) => {
      prev.forEach((r) => URL.revokeObjectURL(r.previewUrl));
      return out;
    });
    setProcessing(false);
  }, [files, maxWidth, maxHeight, quality, format, cancelRequested]);

  const totalSaved = useMemo(() => {
    const orig = results.reduce((sum, r) => sum + (r.originalSize || 0), 0);
    const now = results.reduce((sum, r) => sum + (r.newSize || 0), 0);
    return { orig, now, saved: Math.max(0, orig - now) };
  }, [results]);

  const downloadOne = useCallback((r) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(r.blob);
    a.download = r.name;
    a.click();
    URL.revokeObjectURL(a.href);
  }, []);

  const downloadAllZip = useCallback(async () => {
    if (!results.length) return;
    const { default: JSZip } = await import("jszip");
    const { saveAs } = await import("file-saver");
    const zip = new JSZip();
    const folder = zip.folder("images");
    results.forEach((r) => folder.file(r.name, r.blob));
    const blob = await zip.generateAsync({ type: "blob" });
    saveAs(blob, `compressed-${Date.now()}.zip`);
  }, [results]);

  // Dropzone focus ring while dragging
  useEffect(() => {
    const dz = dropRef.current;
    if (!dz) return;
    const onEnter = () => dz.classList.add("dz-ring");
    const onLeave = () => dz.classList.remove("dz-ring");
    dz.addEventListener("dragenter", onEnter);
    dz.addEventListener("dragleave", onLeave);
    dz.addEventListener("drop", onLeave);
    return () => {
      dz.removeEventListener("dragenter", onEnter);
      dz.removeEventListener("dragleave", onLeave);
      dz.removeEventListener("drop", onLeave);
    };
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2459527561207315"
     crossorigin="anonymous"></script>  
        <div className="logo">IC</div>
        <h1>Image Compressor</h1>
        <nav className="nav">
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
          <a href="#pro" className="btn-pro">Pro Version</a>
        </nav>
      </header>

      {/* Hero / Controls */}
      <main className="container">
        <section className="layout">
          <div className="left">
            <p className="lead">
              Reduce image size directly in your browser. Private, fast, and no uploads.
            </p>

            {/* Presets */}
            <div className="preset-row">
              {presets.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPreset(p.key)}
                  className={`chip ${preset === p.key ? "chip-active" : ""}`}
                  aria-pressed={preset === p.key}
                >
                  {p.name}
                </button>
              ))}
              <button
                onClick={() => setPreset("custom")}
                className={`chip ${preset === "custom" ? "chip-active" : ""}`}
              >
                Custom
              </button>
            </div>

            {/* Dropzone */}
            <div
              ref={dropRef}
              aria-label="Drag & drop zone"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onPickFiles();
              }}
              onDrop={onDrop}
              onDragOver={(e) => e.preventDefault()}
              className="dropzone"
              onClick={onPickFiles}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden-input"
                onChange={onSelect}
              />
              <div className="dz-title">Drag & drop images here</div>
              <div className="dz-sub">or click to select · you can also <strong>paste</strong> (Ctrl/Cmd+V)</div>
            </div>

            {/* Controls */}
            <div className="controls-grid">
              <label className="control">
                <span>Max width (px)</span>
                <input
                  type="number"
                  min={1}
                  value={maxWidth}
                  onChange={(e) => setMaxWidth(parseInt(e.target.value || 1))}
                />
              </label>
              <label className="control">
                <span>Max height (px)</span>
                <input
                  type="number"
                  min={1}
                  value={maxHeight}
                  onChange={(e) => setMaxHeight(parseInt(e.target.value || 1))}
                />
              </label>
              <label className="control">
                <span>Quality</span>
                <input
                  aria-label="Compression quality"
                  type="range"
                  min={0.1}
                  max={1}
                  step={0.05}
                  value={quality}
                  onChange={(e) => setQuality(parseFloat(e.target.value))}
                />
                <span className="muted">{Math.round(quality * 100)}%</span>
              </label>
              <label className="control">
                <span>Format</span>
                <select value={format} onChange={(e) => setFormat(e.target.value)}>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/webp">WEBP</option>
                  <option value="image/png">PNG</option>
                </select>
              </label>
            </div>

            {/* Action bar */}
            <div className="action-row">
              <button
                onClick={handleProcess}
                disabled={!files.length || processing}
                className="btn primary"
              >
                {processing ? "Processing…" : `Compress ${files.length ? `(${files.length})` : ""}`}
              </button>
              <button
                onClick={() => setCancelRequested(true)}
                disabled={!processing}
                className="btn"
              >
                Cancel
              </button>
              <button onClick={clearAll} className="btn">Clear</button>
              <button onClick={downloadAllZip} disabled={!results.length} className="btn">
                Download ZIP
              </button>

              {results.length > 0 && (
                <div className="muted">
                  <strong>Total saved:</strong> {formatBytes(totalSaved.saved)} (from{" "}
                  {formatBytes(totalSaved.orig)} to {formatBytes(totalSaved.now)})
                </div>
              )}
            </div>

            {/* Progress */}
            {processing && (
              <div className="progress-wrap">
                <div className="progress-bar">
                  <div
                    className="progress"
                    style={{
                      width: `${
                        progress.total ? Math.round((progress.done / progress.total) * 100) : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="muted small">
                  {progress.done}/{progress.total} · {estimateEta}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="right">
            <AdSlot label="Top Ad" />
            <div className="card">
              <h3 className="card-title">Tips</h3>
              <ul className="list">
                <li>Use WEBP for better compression without noticeable quality loss.</li>
                <li>Reduce width for websites/social networks to speed up loading.</li>
                <li>Everything is processed locally — full privacy.</li>
              </ul>
            </div>
            <div className="card">
              <h3 className="card-title">Useful affiliates</h3>
              <div className="links">
                <a href="#" rel="nofollow">Cloud storage</a>
                <a href="#" rel="nofollow">Stock photos</a>
                <a href="#" rel="nofollow">Image CDN</a>
              </div>
            </div>
            <a href="#pro" className="cta-pro">Unlock Pro</a>
            <AdSlot label="Side Ad" />
          </div>
        </section>

        {/* Results grid */}
        {!!results.length && (
          <section className="results">
            <h2 className="section-title">Results</h2>
            <div className="results-grid">
              {results.map((r, idx) => (
                <div key={idx} className="result-card">
                  <img src={r.previewUrl} alt={r.name} className="thumb" />
                  <div className="result-meta">
                    <div className="name" title={r.name}>{r.name}</div>
                    <div className="muted">
                      {formatBytes(r.newSize)} (before {formatBytes(r.originalSize)})
                    </div>
                    <div className="buttons">
                      <button onClick={() => downloadOne(r)} className="btn">Download</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pro pitch */}
        <section id="pro" className="card pro">
          <h3 className="card-title">Pro Version (concept)</h3>
          <ul className="list">
            <li>Unlimited batch processing</li>
            <li>AVIF/HEIC → WEBP/JPEG conversion (lightweight worker/lib)</li>
            <li>Saved user presets (localStorage)</li>
            <li>Strip EXIF/metadata for even smaller files</li>
          </ul>
          <div className="action-row">
            <a href="#" className="btn">Learn more</a>
            <a href="#" className="btn primary">Buy Pro</a>
          </div>
        </section>

        {/* FAQ */}
        <section id="faq" className="faq">
          <h3 className="card-title">Frequently Asked Questions</h3>
          <details className="qa">
            <summary>Do my images upload?</summary>
            <p>No. Everything happens in your browser. You can even turn off the internet and it still works.</p>
          </details>
          <details className="qa">
            <summary>What’s the best format?</summary>
            <p>WEBP usually gives the smallest size while keeping quality. JPEG is great for photos. PNG is best for graphics with transparency.</p>
          </details>
        </section>
      </main>

      {/* Footer */}
      <footer className="footer">
        <div>© {new Date().getFullYear()} IC — Privacy: we do not upload your images.</div>
        <div className="footer-links">
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
          <a href="#pro">Pro</a>
        </div>
      </footer>

      {/* Toast */}
      {toast && (
        <div
          role="status"
          onAnimationEnd={() => setToast("")}
          className="toast"
        >
          {toast}
        </div>
      )}
    </div>
  );
}
