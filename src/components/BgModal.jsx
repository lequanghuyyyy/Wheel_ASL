import React, { useState, useRef } from 'react';
import { PRESETS, compressImageFile } from '../constants';

export default function BgModal({ isOpen, onClose, bgSettings, setBgSettings }) {
  const [urlInput, setUrlInput] = useState('');
  const fileInputRef = useRef(null);

  if (!isOpen) return null;

  // File Upload với nén ảnh chống tràn localStorage
  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file);
        setBgSettings((prev) => ({ ...prev, type: 'data', value: compressed }));
      } catch {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (evt.target?.result) {
            setBgSettings((prev) => ({ ...prev, type: 'data', value: evt.target.result }));
          }
        };
        reader.readAsDataURL(file);
      }
    }
    e.target.value = '';
  };

  // URL apply
  const handleApplyUrl = () => {
    const trimmed = urlInput.trim();
    if (trimmed) {
      setBgSettings((prev) => ({ ...prev, type: 'url', value: trimmed }));
    }
  };

  // Reset Default
  const handleReset = () => {
    setUrlInput('');
    setBgSettings({ type: 'preset', value: 'default', dim: 50 });
  };

  return (
    <div className="modal-backdrop show" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-dialog">
        <div className="modal-header">
          <h3>🎨 Tùy chỉnh hình nền</h3>
          <button className="modal-close-icon" onClick={onClose}>
            &times;
          </button>
        </div>

        <div className="modal-body">
          {/* 1. Tải ảnh từ máy */}
          <div className="form-group">
            <label>📁 Tải ảnh từ máy tính (Tự động tối ưu dung lượng)</label>
            <div className="file-drop-area" onClick={() => fileInputRef.current?.click()}>
              <p>📷 Bấm vào đây để chọn ảnh nền từ thiết bị</p>
              <small style={{ color: 'var(--text-secondary)', marginTop: '4px', display: 'block' }}>
                (Hỗ trợ PNG, JPG, WebP, GIF - tự động nén chống tràn bộ nhớ)
              </small>
              <input
                type="file"
                ref={fileInputRef}
                style={{ display: 'none' }}
                accept="image/*"
                onChange={handleFileChange}
              />
            </div>
          </div>

          {/* 2. Nhập URL */}
          <div className="form-group">
            <label>🔗 Hoặc dán link ảnh trực tuyến (URL)</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                type="text"
                className="text-input-full"
                value={urlInput}
                onChange={(e) => setUrlInput(e.target.value)}
                placeholder="https://example.com/wallpaper.jpg"
              />
              <button className="btn-primary" onClick={handleApplyUrl}>
                Áp dụng
              </button>
            </div>
          </div>

          {/* 3. Presets từ constants.js */}
          <div className="form-group">
            <label>✨ Chọn hình nền có sẵn</label>
            <div className="preset-grid">
              {PRESETS.map((p) => (
                <div
                  key={p.id}
                  className={`preset-card ${bgSettings.value === p.id ? 'active' : ''}`}
                  style={p.isGradient ? { background: p.url } : { backgroundImage: `url('${p.url}')` }}
                  onClick={() => setBgSettings((prev) => ({ ...prev, type: 'preset', value: p.id }))}
                >
                  <span>{p.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Overlay Dim Slider */}
          <div className="form-group">
            <label>🌓 Độ làm tối hình nền: {bgSettings.dim ?? 50}%</label>
            <div className="range-slider-wrapper">
              <input
                type="range"
                min="0"
                max="90"
                value={bgSettings.dim ?? 50}
                onChange={(e) =>
                  setBgSettings((prev) => ({ ...prev, dim: parseInt(e.target.value, 10) }))
                }
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleReset}>
            Khôi phục mặc định
          </button>
          <button className="btn-primary" onClick={onClose}>
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
