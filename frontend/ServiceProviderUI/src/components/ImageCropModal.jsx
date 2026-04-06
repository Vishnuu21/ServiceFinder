// src/components/ImageCropModal.jsx
import { useState, useRef, useEffect, useCallback } from "react";

const SIZE = 320;

export default function ImageCropModal({ imageSrc, onConfirm, onCancel }) {
  const canvasRef = useRef(null);
  const [imgEl, setImgEl] = useState(null);
  const [transform, setTransform] = useState({ x: 0, y: 0, scale: 1 });
  const drag = useRef(null);
  const lastPinch = useRef(null);
  const imgRef = useRef(null);

  useEffect(() => {
    const img = new Image();
    img.onload = () => {
      imgRef.current = img;
      setImgEl(img);
      const scale = Math.max(SIZE / img.width, SIZE / img.height);
      setTransform({
        x: (SIZE - img.width * scale) / 2,
        y: (SIZE - img.height * scale) / 2,
        scale,
      });
    };
    img.src = imageSrc;
  }, [imageSrc]);

  const clamp = (img, { x, y, scale }) => {
    if (!img) return { x, y, scale };
    const minScale = Math.max(SIZE / img.width, SIZE / img.height);
    scale = Math.max(minScale, Math.min(scale, minScale * 4));
    const iw = img.width * scale;
    const ih = img.height * scale;
    x = Math.min(0, Math.max(SIZE - iw, x));
    y = Math.min(0, Math.max(SIZE - ih, y));
    return { x, y, scale };
  };

  const draw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas || !imgEl) return;
    try {
      const ctx = canvas.getContext("2d");
      ctx.clearRect(0, 0, SIZE, SIZE);
      const { x, y, scale } = transform;
      if (!scale || isNaN(x) || isNaN(y) || isNaN(scale)) return;
      const iw = imgEl.width * scale;
      const ih = imgEl.height * scale;
      ctx.fillStyle = "#1e1e1e";
      ctx.fillRect(0, 0, SIZE, SIZE);
      ctx.drawImage(imgEl, x, y, iw, ih);
      ctx.strokeStyle = "white";
      ctx.lineWidth = 2;
      ctx.strokeRect(4, 4, SIZE - 8, SIZE - 8);
      const c = 16;
      ctx.lineWidth = 3;
      [[4,4,c,0,0,c],[SIZE-4,4,-c,0,0,c],[4,SIZE-4,c,0,0,-c],[SIZE-4,SIZE-4,-c,0,0,-c]].forEach(([x1,y1,dx1,dy1,dx2,dy2]) => {
        ctx.beginPath(); ctx.moveTo(x1+dx1,y1+dy1); ctx.lineTo(x1,y1); ctx.lineTo(x1+dx2,y1+dy2); ctx.stroke();
      });
    } catch(err) {
      console.error("Draw error:", err);
    }
  }, [imgEl, transform]);

  useEffect(() => { draw(); }, [draw]);

  // non-passive wheel listener using ref to avoid re-attaching
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const handler = (e) => {
      e.preventDefault();
      const delta = e.deltaY < 0 ? 1.08 : 0.93;
      setTransform(t => clamp(imgRef.current, { ...t, scale: t.scale * delta }));
    };
    canvas.addEventListener("wheel", handler, { passive: false });
    return () => canvas.removeEventListener("wheel", handler);
  }, []);

  const getXY = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const s = SIZE / rect.width;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return { x: (clientX - rect.left) * s, y: (clientY - rect.top) * s };
  };

  const onDown = (e) => {
    e.preventDefault();
    if (e.touches?.length === 2) return;
    const { x, y } = getXY(e);
    drag.current = { startX: x, startY: y, startTx: transform.x, startTy: transform.y };
  };

  const onMove = (e) => {
    e.preventDefault();
    if (e.touches?.length === 2) {
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.hypot(dx, dy);
      if (lastPinch.current) setTransform(t => clamp(imgRef.current, { ...t, scale: t.scale * (dist / lastPinch.current) }));
      lastPinch.current = dist;
      return;
    }
    if (!drag.current) return;
    const { x, y } = getXY(e);
    const dx = x - drag.current.startX;
    const dy = y - drag.current.startY;
    const startTx = drag.current.startTx;
    const startTy = drag.current.startTy;
    setTransform(t => clamp(imgRef.current, { ...t, x: startTx + dx, y: startTy + dy }));
  };

  const onUp = () => { drag.current = null; lastPinch.current = null; };

  const handleConfirm = () => {
    if (!imgEl) return;
    const out = document.createElement("canvas");
    out.width = 300;
    out.height = 300;
    const ctx = out.getContext("2d");
    const { x, y, scale } = transform;
    const ratio = 300 / SIZE;
    ctx.drawImage(imgEl, -x / scale, -y / scale, imgEl.width, imgEl.height, 0, 0, imgEl.width * scale * ratio, imgEl.height * scale * ratio);
    onConfirm(out.toDataURL("image/jpeg", 0.88));
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/70 backdrop-blur-sm px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
        <h3 className="text-lg font-extrabold text-[var(--color-text)] mb-1">Crop Photo</h3>
        <p className="text-xs text-[var(--color-text-secondary)] mb-4">Drag to reposition · Scroll or pinch to zoom</p>
        <canvas
          ref={canvasRef}
          width={SIZE}
          height={SIZE}
          className="w-full rounded-xl cursor-grab active:cursor-grabbing touch-none select-none"
          onMouseDown={onDown}
          onMouseMove={onMove}
          onMouseUp={onUp}
          onMouseLeave={onUp}
          onTouchStart={onDown}
          onTouchMove={onMove}
          onTouchEnd={onUp}
        />
        <div className="flex gap-3 mt-4">
          <button onClick={onCancel} className="flex-1 py-3 rounded-2xl border-2 border-[var(--color-border)] text-[var(--color-text-secondary)] font-bold text-sm hover:bg-[var(--color-muted)] transition-all">Cancel</button>
          <button onClick={handleConfirm} className="flex-1 py-3 rounded-2xl bg-[var(--color-brand)] text-white font-bold text-sm hover:bg-[var(--color-brand-dark)] transition-all">Apply</button>
        </div>
      </div>
    </div>
  );
}
