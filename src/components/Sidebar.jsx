import React, { useState, useEffect, useRef } from 'react';

export default function Sidebar({
  items,
  setItems,
  results,
  onClearResults,
  onOpenBgModal,
  removeWinner,
  setRemoveWinner,
}) {
  const [activeTab, setActiveTab] = useState('items');
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isAdvanced, setIsAdvanced] = useState(false);
  const [textValue, setTextValue] = useState(items.join('\n'));
  const [quickInput, setQuickInput] = useState('');

  // Flag đánh dấu người dùng đang trực tiếp gõ bàn phím
  const isTypingRef = useRef(false);

  // Chỉ đồng bộ textValue từ items khi thay đổi đến từ bên ngoài (sort, shuffle, reset, remove winner)
  useEffect(() => {
    if (isTypingRef.current) {
      isTypingRef.current = false;
      return;
    }
    setTextValue(items.join('\n'));
  }, [items]);

  // Khi người dùng gõ vào textarea -> cập nhật ngay trên wheel mà không làm mất dòng trống/nhảy con trỏ
  const handleTextChange = (e) => {
    const val = e.target.value;
    isTypingRef.current = true;
    setTextValue(val);
    const parsed = val.split('\n').map((s) => s.trim()).filter(Boolean);
    setItems(parsed);
  };

  // Quick Add
  const handleQuickAdd = () => {
    const val = quickInput.trim();
    if (!val) return;
    const newItems = [...items, val];
    setItems(newItems);
    setQuickInput('');
  };

  const handleQuickKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleQuickAdd();
    }
  };

  // Shuffle
  const handleShuffle = () => {
    const shuffled = [...items];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    setItems(shuffled);
  };

  // Sort
  const handleSort = () => {
    const sorted = [...items];
    sorted.sort((a, b) => a.localeCompare(b, 'vi', { numeric: true }));
    setItems(sorted);
  };

  // Add Empty Line
  const handleAddEmptyLine = () => {
    isTypingRef.current = true;
    setTextValue((prev) => prev.trimEnd() + '\n');
  };

  return (
    <div className={`sidebar-panel ${isCollapsed ? 'collapsed' : ''}`}>
      {/* Header with Tabs and Collapse Toggle */}
      <div className="panel-header">
        <button
          className="collapse-toggle-btn"
          title="Thu gọn/Mở rộng"
          onClick={() => {
            setIsCollapsed(!isCollapsed);
            setTimeout(() => window.dispatchEvent(new Event('resize')), 300);
          }}
        >
          {isCollapsed ? '❮' : '❯'}
        </button>
        <div className="panel-tabs">
          <button
            className={`tab-btn ${activeTab === 'items' ? 'active' : ''}`}
            onClick={() => setActiveTab('items')}
          >
            Mục <span className="tab-badge">{items.length}</span>
          </button>
          <button
            className={`tab-btn ${activeTab === 'results' ? 'active' : ''}`}
            onClick={() => setActiveTab('results')}
          >
            Kết quả <span className="tab-badge">{results.length}</span>
          </button>
        </div>
      </div>

      <div className="panel-content">
        {/* Tab 1: Danh sách mục */}
        <div className={`tab-page ${activeTab === 'items' ? 'active' : ''}`}>
          <div className="panel-toolbar">
            <button className="tool-btn" onClick={handleShuffle} title="Xáo trộn thứ tự các mục">
              🔀 Xáo trộn
            </button>
            <button className="tool-btn" onClick={handleSort} title="Sắp xếp theo Alphabet">
              ⇅ Sắp xếp
            </button>
            <button className="tool-btn" onClick={onOpenBgModal} title="Đổi hình nền">
              🖼️ Đổi hình nền
            </button>
          </div>

          <div className="options-bar">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isAdvanced}
                onChange={(e) => setIsAdvanced(e.target.checked)}
              />
              <span>Nâng cao</span>
            </label>
            {isAdvanced && (
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={removeWinner}
                  onChange={(e) => setRemoveWinner(e.target.checked)}
                />
                <span>Xóa mục khi trúng</span>
              </label>
            )}
          </div>

          {/* Textarea với khả năng gõ đến đâu cập nhật ngay đến đó mà không bị nuốt dòng trống */}
          <div className="editor-wrapper">
            <textarea
              value={textValue}
              onChange={handleTextChange}
              placeholder="Nhập mỗi mục trên 1 dòng...&#10;Gõ đến đâu cập nhật ngay đến đó!"
              spellCheck="false"
            />
          </div>

          {/* Thêm mục nhanh */}
          <div className="quick-add-row">
            <input
              type="text"
              value={quickInput}
              onChange={(e) => setQuickInput(e.target.value)}
              onKeyDown={handleQuickKeyDown}
              placeholder="Nhập tên mục rồi bấm Thêm..."
            />
            <button onClick={handleQuickAdd}>Thêm</button>
          </div>

          <div className="panel-footer">
            <button className="footer-action-btn" onClick={handleAddEmptyLine}>
              ＋ Thêm dòng trống
            </button>
          </div>
        </div>

        {/* Tab 2: Lịch sử kết quả */}
        <div className={`tab-page ${activeTab === 'results' ? 'active' : ''}`}>
          <div className="results-list">
            {results.length === 0 ? (
              <div className="empty-state">Chưa có kết quả nào. Hãy quay bánh xe!</div>
            ) : (
              results.map((r, i) => (
                <div className="result-card" key={i}>
                  <span className="idx">#{i + 1}</span>
                  <span className="title">{r.val}</span>
                  <span className="time">{r.time}</span>
                </div>
              ))
            )}
          </div>
          <div className="panel-footer">
            <button className="footer-action-btn" onClick={onClearResults}>
              🗑️ Xóa toàn bộ lịch sử
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
