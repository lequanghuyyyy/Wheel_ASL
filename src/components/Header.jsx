import React, { useRef } from 'react';
import { compressImageFile } from '../constants';

export default function Header({ onOpenBgModal, onResetItems, onSave, onQuickUploadBg }) {
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const file = e.target.files?.[0];
    if (file) {
      try {
        const compressed = await compressImageFile(file);
        onQuickUploadBg(compressed);
      } catch {
        const reader = new FileReader();
        reader.onload = (evt) => {
          if (evt.target?.result) {
            onQuickUploadBg(evt.target.result);
          }
        };
        reader.readAsDataURL(file);
      }
    }
    e.target.value = '';
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  return (
    <header className="app-header">
      {/* Brand Section: Logo + Text + Nút thêm file ảnh nền kế bên */}
      <div className="brand-section">
        <div className="brand" title="Wheel of Names">
          <svg viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="48" fill="#2563eb" />
            <path d="M50 50 L50 2 A48 48 0 0 1 98 50 Z" fill="#ec4899" />
            <path d="M50 50 L98 50 A48 48 0 0 1 50 98 Z" fill="#10b981" />
            <path d="M50 50 L50 98 A48 48 0 0 1 2 50 Z" fill="#f59e0b" />
            <path d="M50 50 L2 50 A48 48 0 0 1 50 2 Z" fill="#dc2626" />
            <circle cx="50" cy="50" r="14" fill="#ffffff" />
          </svg>
          <span>Wheel of Names</span>
        </div>

        {/* Nút thêm file ảnh vào background ngay cạnh Wheel of Names */}
        <button
          className="brand-bg-upload-btn"
          title="Chọn file ảnh trực tiếp từ máy tính làm hình nền"
          onClick={() => fileInputRef.current?.click()}
        >
          📷 <span>Thêm ảnh nền</span>
        </button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="image/*"
          onChange={handleFileChange}
        />
      </div>

      {/* Nav Actions */}
      <div className="nav-actions">
        <button className="nav-btn primary" onClick={onOpenBgModal} title="Tùy chỉnh hình nền & cài đặt">
          🎨 <span>Tùy chỉnh</span>
        </button>
        <button className="nav-btn" onClick={onResetItems} title="Làm mới danh sách">
          📄 <span>Mới</span>
        </button>
        <button className="nav-btn" onClick={onSave} title="Lưu danh sách">
          💾 <span>Lưu</span>
        </button>
        <button className="nav-btn" onClick={toggleFullscreen} title="Toàn màn hình">
          ⛶ <span>Toàn màn hình</span>
        </button>
        <button className="nav-btn" style={{ color: '#60a5fa' }} title="Ngôn ngữ">
          🌐 <span>Tiếng Việt</span>
        </button>
      </div>
    </header>
  );
}
