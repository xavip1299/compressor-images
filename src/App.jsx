import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import "./styles.css";
import { AdBanner, RecommendedTools } from "./AdBanner.jsx"; // named exports

// ---------- utils ----------
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
function dataURLtoBlob(dataUrl) {
  const [h, b] = dataUrl.split(",");
  const mime = h.match(/:(.*?);/)[1];
  const bin = atob(b);
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: mime });
}

// ---------- presets ----------
const PRESETS = [
  { key: "instagram", label: "Instagram", w: 1080, h: 1350, q: 0.82, fmt: "image/jpeg" },
  { key: "whatsapp",  label: "WhatsApp",  w: 1280, h: 1280, q: 0.8,  fmt: "image/webp" },
  { key: "shopify",   label: "Shopify",   w: 2048, h: 2048, q: 0.85, fmt: "image/webp" },
  { key: "website",   label: "Website",   w: 1600, h: 900,  q: 0.78, fmt: "image/webp" },
];

export default function App() {
  // files & results
  const [files, setFiles] = useState([]); // File[]
  const [results, setResults] = useState([]); // [{name, blob, previewUrl, originalSize, newSize, width, height, type}]

  // processing
  const [processing, setProcessing] = useState(false);
  const [cancelRequested, setCancelRequested] = useState(false);
  const [progress, setProgress] = useState({ done: 0, total: 0, start: 0 });

  // controls
  const [presetKey, setPresetKey] = useState("website");
  const [maxWidth, setMaxWidth] = useState(1600);
  const [maxHeight, setMaxHeight] = useState(900);
  const [quality, setQuality] = useState(0.78);
  const [format, setFormat] = useState("image/webp");

  // refs
  const fileInputRef = useRef(null);
  const dropRef = useRef(null);

  // apply preset when changed
  useEffect(() => {
    const p = PRESETS.find((p) => p.key === presetKey);
    if (!p) return;
    setMaxWidth(p.w);
    setMaxHeight(p.h);
    setQuality(p.q);
    setFormat(p.fmt);
  }, [presetKey]);

  // paste from clipboard
  useEffect(() => {
    const onPaste = (e) => {
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

  // dropzone ring
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

  // convenience
  const onPickFiles = useCallback(() => fileInputRef.current?.click(), []);
  const onSelect = useCallback((e) => {
    const list = Array.from(e.target.files || []).filter((f) => f.type.startsWith("image/"));
    if (list.length) setFiles((prev) => [...prev, ...list]);
    e.target.value = "";
  }, []);
  const onDrop = useCallback((e) => {
    e.preventDefault();
    const list = Array.from(e.dataTransfer.files || []).filter((f) => f.type.startsWith("image/"));
    if (list.length) setFiles((prev) => [...prev, ...list]);
  }, []);

  // ETA
  const eta = useMemo(() => {
    const { done, total, start } = progress;
    if (!start || !total || !done) return "";
    const elapsed = (Date.now() - start) / 1000;
    const rate = done / Math.max(1, elapsed);
    const remaining = total - done;
    return `${Math.max(1, Math.round(remaining / Math.max(0.001, rate)))}s left`;
  }, [progress]);

  // core processor
  async function processOne(file, opts) {
    const img = await createImageBitmap(file, { imageOrientation: "from-image" }); // EXIF fix
    const ratio = Math.min(opts.maxWidth / img.width, opts.maxHeight / img.height, 1);
    const w = Math.max(1, Math.round(img.width * ratio));
    const h = Math.max(1, Math.round(img.height * ratio));

    const canvas = document.createElement("canvas");
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d");
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

    const base = file.name.replace(/\.[^.]+$/, "");
    const ext = mime === "image/png" ? "png" : mime === "image/webp" ? "webp" : "jpg";
    const name = `${base}-${w}x${h}.${ext}`;
    const previewUrl = URL.createObjectURL(blob);

    return { name, blob, previewUrl, originalSize: file.size, newSize: blob.size, width: w, height: h, type: mime };
  }

  const handleProcess = useCallback(async () => {
    if (!files.length) return;
    setCancelRequested(false);
    setProcessing(true);
    setProgress({ done: 0, total: files.length, start: Date.now() });
    const opts = { maxWidth, maxHeight, quality, format };
    const out = [];

    for (let i = 0; i < files.length; i++) {
      if (cancelRequested) break;
      try {
        out.push(await processOne(files[i], opts));
      } catch (err) {
        console.error("Failed to process", files[i]?.name, err);
      }
      setProgress((p) => ({ ...p, done: Math.min(p.done + 1, p.total) }));
      await new Promise((r) => requestAnimationFrame(r)); // yield to keep UI responsive
    }

    setResults((prev) => {
      prev.forEach((r) => URL.revokeObjectURL(r.previewUrl));
      return out;
    });
    setProcessing(false);
  }, [files, maxWidth, maxHeight, quality, format, cancelRequested]);

  const clearAll = useCallback(() => {
    setFiles([]);
    setResults((prev) => {
      prev.forEach((r) => URL.revokeObjectURL(r.previewUrl));
      return [];
    });
    setProgress({ done: 0, total: 0, start: 0 });
  }, []);

  const totalSaved = useMemo(() => {
    const orig = results.reduce((s, r) => s + (r.originalSize || 0), 0);
    const now = results.reduce((s, r) => s + (r.newSize || 0), 0);
    return { orig, now, saved: Math.max(0, orig - now) };
  }, [results]);

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

  const downloadOne = useCallback((r) => {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(r.blob);
    a.download = r.name;
    a.click();
    URL.revokeObjectURL(a.href);
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="logo">IC</div>
        <h1>Image Compressor</h1>
        <nav className="nav">
          <a href="#how-it-works">How it works</a>
          <a href="#faq">FAQ</a>
          <a href="#pro" className="btn-pro">Pro</a>
        </nav>
      </header>

      {/* Main */}
      <main className="container">
        <section className="layout">
          {/* LEFT */}
          <div className="left">
            <p className="lead">
              Reduce image size directly in your browser. Private, fast, and no uploads.
            </p>

            {/* Presets */}
            <div className="preset-row">
              {PRESETS.map((p) => (
                <button
                  key={p.key}
                  onClick={() => setPresetKey(p.key)}
                  className={`chip ${presetKey === p.key ? "chip-active" : ""}`}
                  aria-pressed={presetKey === p.key}
                >
                  {p.label}
                </button>
              ))}
              <button
                onClick={() => setPresetKey("custom")}
                className={`chip ${presetKey === "custom" ? "chip-active" : ""}`}
              >
                Custom
              </button>
            </div>

            {/* Dropzone */}
            <div
              ref={dropRef}
              className="dropzone"
              aria-label="Drag & drop zone"
              onClick={onPickFiles}
              onDragOver={(e) => e.preventDefault()}
              onDrop={onDrop}
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") onPickFiles();
              }}
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
              <div className="dz-sub">
                or click to select · you can also <strong>paste</strong> (Ctrl/Cmd+V)
              </div>
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
                  <option value="image/webp">WEBP</option>
                  <option value="image/jpeg">JPEG</option>
                  <option value="image/png">PNG</option>
                </select>
              </label>
            </div>

            {/* Action bar */}
            <div className="action-row">
              <button
                className="btn primary"
                disabled={!files.length || processing}
                onClick={handleProcess}
              >
                {processing ? "Processing…" : `Compress ${files.length ? `(${files.length})` : ""}`}
              </button>
              <button className="btn" onClick={() => setCancelRequested(true)} disabled={!processing}>
                Cancel
              </button>
              <button className="btn" onClick={clearAll}>Clear</button>
              <button className="btn" onClick={downloadAllZip} disabled={!results.length}>
                Download ZIP
              </button>
              {!!results.length && (
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
                        progress.total
                          ? Math.round((progress.done / progress.total) * 100)
                          : 0
                      }%`,
                    }}
                  />
                </div>
                <div className="muted small">
                  {progress.done}/{progress.total} · {eta}
                </div>
              </div>
            )}

            {/* Mid-page ad */}
            <div style={{ margin: "24px 0", textAlign: "center" }}>
              <AdBanner />
            </div>

            {/* Results */}
            {!!results.length && (
              <section className="results">
                <h2 className="section-title">Results</h2>
                <div className="results-grid">
                  {results.map((r, i) => (
                    <div key={i} className="result-card">
                      <img className="thumb" src={r.previewUrl} alt={r.name} />
                      <div className="result-meta">
                        <div className="name" title={r.name}>{r.name}</div>
                        <div className="compression-info">
                          {formatBytes(r.newSize)} (before {formatBytes(r.originalSize)}){" "}
                          <span className="savings">
                            -{Math.max(0, Math.round((1 - r.newSize / r.originalSize) * 100))}%
                          </span>
                        </div>
                        <div className="buttons">
                          <button className="btn" onClick={() => downloadOne(r)}>Download</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>

          {/* RIGHT (sidebar) */}
          <div className="right">
            <AdBanner />
            <div className="card">
              <h3 className="card-title">Tips</h3>
              <ul className="list">
                <li>Use WEBP for best size/quality.</li>
                <li>Lower width for faster websites/social.</li>
                <li>Everything runs locally (privacy-friendly).</li>
              </ul>
            </div>
            <RecommendedTools />
            <a href="#pro" className="cta-pro">Unlock Pro</a>
            <AdBanner />
          </div>
        </section>

        {/* Pro pitch */}
        <section id="pro" className="card pro">
          <h3 className="card-title">Pro Version (concept)</h3>
          <ul className="list">
            <li>Unlimited batch processing</li>
            <li>AVIF/HEIC → WEBP/JPEG</li>
            <li>Saved user presets</li>
            <li>Strip EXIF/metadata</li>
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
            <p>No. Everything happens in your browser (you can even go offline).</p>
          </details>
          <details className="qa">
            <summary>What’s the best format?</summary>
            <p>WEBP is usually smallest with good quality. JPEG is great for photos; PNG for graphics/transparency.</p>
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
    </div>
  );
}
