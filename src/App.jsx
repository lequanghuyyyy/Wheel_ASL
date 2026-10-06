import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Wheel from './components/Wheel';
import Sidebar from './components/Sidebar';
import BgModal from './components/BgModal';
import WinnerModal from './components/WinnerModal';

export default function App() {
  // Load State from LocalStorage
  const [items, setItems] = useState(() => {
    try {
      const saved = localStorage.getItem('won_items');
      return saved !== null ? saved.split('\n').map((s) => s.trim()).filter(Boolean) : ['15', '17'];
    } catch {
      return ['15', '17'];
    }
  });

  const [results, setResults] = useState(() => {
    try {
      const saved = localStorage.getItem('won_results');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [bgSettings, setBgSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('won_bg');
      return saved ? JSON.parse(saved) : { type: 'preset', value: 'default', dim: 50 };
    } catch {
      return { type: 'preset', value: 'default', dim: 50 };
    }
  });

  const [removeWinner, setRemoveWinner] = useState(() => {
    try {
      return localStorage.getItem('won_remove_winner') === 'true';
    } catch {
      return false;
    }
  });

  const [isSpinning, setIsSpinning] = useState(false);
  const [isBgModalOpen, setIsBgModalOpen] = useState(false);
  const [winnerData, setWinnerData] = useState(null);

  // Auto-sync state to localStorage (Bọc try-catch độc lập cho từng mục để tránh lỗi domino)
  useEffect(() => {
    try {
      localStorage.setItem('won_items', items.join('\n'));
    } catch {}

    try {
      localStorage.setItem('won_results', JSON.stringify(results));
    } catch {}

    try {
      localStorage.setItem('won_bg', JSON.stringify(bgSettings));
    } catch {}

    try {
      localStorage.setItem('won_remove_winner', removeWinner);
    } catch {}
  }, [items, results, bgSettings, removeWinner]);

  // Handle Quick Upload from Header button next to Wheel of Names
  const handleQuickUploadBg = (dataUrl) => {
    setBgSettings((prev) => ({
      ...prev,
      type: 'data',
      value: dataUrl,
    }));
  };

  // Handle Spin Finished
  const handleSpinFinish = (winner, winIndex) => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;

    setResults((prev) => [{ val: winner, time: timeStr }, ...prev]);
    setWinnerData({ winner, winIndex });

    if (removeWinner) {
      handleRemoveItem(winIndex);
    }
  };

  // Remove Item
  const handleRemoveItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  // Reset items
  const handleResetItems = () => {
    if (window.confirm('Bạn có chắc muốn làm mới danh sách bánh xe về mặc định?')) {
      setItems(['15', '17']);
    }
  };

  // Clear results
  const handleClearResults = () => {
    setResults([]);
  };

  // Save manual
  const handleSave = () => {
    alert('Đã lưu cấu hình danh sách và hình nền thành công!');
  };

  return (
    <>
      {/* Component Header với nút thêm file ảnh nền ngay cạnh Wheel of Names */}
      <Header
        onOpenBgModal={() => setIsBgModalOpen(true)}
        onResetItems={handleResetItems}
        onSave={handleSave}
        onQuickUploadBg={handleQuickUploadBg}
      />

      {/* Main Container */}
      <div className="main-wrapper">
        <Wheel
          items={items}
          bgSettings={bgSettings}
          onOpenBgModal={() => setIsBgModalOpen(true)}
          onSpinFinish={handleSpinFinish}
          isSpinning={isSpinning}
          setIsSpinning={setIsSpinning}
        />

        <Sidebar
          items={items}
          setItems={setItems}
          results={results}
          onClearResults={handleClearResults}
          onOpenBgModal={() => setIsBgModalOpen(true)}
          removeWinner={removeWinner}
          setRemoveWinner={setRemoveWinner}
        />
      </div>

      {/* Modals */}
      <BgModal
        isOpen={isBgModalOpen}
        onClose={() => setIsBgModalOpen(false)}
        bgSettings={bgSettings}
        setBgSettings={setBgSettings}
      />

      <WinnerModal
        winnerData={winnerData}
        onClose={() => setWinnerData(null)}
        onRemoveWinner={handleRemoveItem}
        removeWinner={removeWinner}
      />
    </>
  );
}
