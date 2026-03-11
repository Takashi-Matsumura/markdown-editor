"use client";

import { Document, SAMPLE_DOC_ID } from "@/lib/documents";
import { CSSProperties } from "react";

interface SidebarProps {
  documents: Document[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onCreate: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onToggle: () => void;
}

function formatDate(ts: number): string {
  const d = new Date(ts);
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${month}/${day} ${hours}:${minutes}`;
}

const overlayStyle: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  background: "rgba(0,0,0,0.4)",
  zIndex: 199,
};

const panelBase: CSSProperties = {
  position: "fixed",
  top: 0,
  left: 0,
  width: 280,
  height: "100vh",
  zIndex: 200,
  display: "flex",
  flexDirection: "column",
  transition: "transform 0.2s ease",
  borderRight: "1px solid var(--border-color)",
  background: "var(--bg-secondary)",
};

const headerStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "space-between",
  padding: "14px 16px",
  borderBottom: "1px solid var(--border-color)",
  flexShrink: 0,
};

const titleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 600,
  color: "var(--text-muted)",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const newBtnStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 6,
  padding: "6px 12px",
  background: "var(--accent)",
  border: "none",
  borderRadius: 6,
  color: "#fff",
  cursor: "pointer",
  fontSize: 12,
  fontWeight: 500,
};

const listStyle: CSSProperties = {
  flex: 1,
  overflowY: "auto",
  padding: 8,
};

const itemStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  padding: "10px 12px",
  borderRadius: 6,
  cursor: "pointer",
  gap: 8,
  transition: "background 0.1s ease",
};

const itemContentStyle: CSSProperties = {
  flex: 1,
  minWidth: 0,
};

const itemTitleStyle: CSSProperties = {
  fontSize: 13,
  fontWeight: 500,
  overflow: "hidden",
  textOverflow: "ellipsis",
  whiteSpace: "nowrap",
};

const itemDateStyle: CSSProperties = {
  fontSize: 11,
  color: "var(--text-faint)",
  marginTop: 2,
};

const deleteBtnStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 24,
  height: 24,
  background: "none",
  border: "none",
  borderRadius: 4,
  color: "var(--text-faint)",
  cursor: "pointer",
  flexShrink: 0,
  opacity: 0,
  transition: "opacity 0.1s ease",
};

const sectionLabelStyle: CSSProperties = {
  fontSize: 11,
  fontWeight: 600,
  color: "var(--text-faint)",
  padding: "12px 12px 4px",
  textTransform: "uppercase",
  letterSpacing: "0.04em",
};

const sampleIconStyle: CSSProperties = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  width: 20,
  height: 20,
  flexShrink: 0,
  color: "var(--accent)",
};

const footerStyle: CSSProperties = {
  padding: "10px 16px",
  borderTop: "1px solid var(--border-color)",
  fontSize: 11,
  color: "var(--text-faint)",
  flexShrink: 0,
};

export default function Sidebar({
  documents,
  activeId,
  onSelect,
  onCreate,
  onDelete,
  isOpen,
  onToggle,
}: SidebarProps) {
  const sampleDoc = documents.find((d) => d.id === SAMPLE_DOC_ID);
  const userDocs = documents.filter((d) => d.id !== SAMPLE_DOC_ID);

  return (
    <>
      {isOpen && <div style={overlayStyle} onClick={onToggle} />}
      <div
        style={{
          ...panelBase,
          transform: isOpen ? "translateX(0)" : "translateX(-100%)",
        }}
      >
        <div style={headerStyle}>
          <span style={titleStyle}>ドキュメント</span>
          <button
            style={newBtnStyle}
            onClick={onCreate}
            title="新規ドキュメント"
            onMouseEnter={(e) => (e.currentTarget.style.opacity = "0.85")}
            onMouseLeave={(e) => (e.currentTarget.style.opacity = "1")}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            新規作成
          </button>
        </div>
        <div style={listStyle}>
          {/* サンプルドキュメント（固定・削除不可） */}
          {sampleDoc && (
            <>
              <SampleItem
                doc={sampleDoc}
                isActive={sampleDoc.id === activeId}
                onSelect={onSelect}
              />
              {userDocs.length > 0 && (
                <div style={sectionLabelStyle}>マイドキュメント</div>
              )}
            </>
          )}

          {/* ユーザードキュメント */}
          {userDocs.map((doc) => {
            const isActive = doc.id === activeId;
            return (
              <div
                key={doc.id}
                style={{
                  ...itemStyle,
                  background: isActive ? "var(--accent)" : undefined,
                  color: isActive ? "#fff" : undefined,
                }}
                onClick={() => onSelect(doc.id)}
                onMouseEnter={(e) => {
                  if (!isActive) e.currentTarget.style.background = "var(--bg-tertiary)";
                  const delBtn = e.currentTarget.querySelector("[data-delete]") as HTMLElement;
                  if (delBtn) delBtn.style.opacity = "1";
                }}
                onMouseLeave={(e) => {
                  if (!isActive) e.currentTarget.style.background = "transparent";
                  const delBtn = e.currentTarget.querySelector("[data-delete]") as HTMLElement;
                  if (delBtn) delBtn.style.opacity = "0";
                }}
              >
                <div style={itemContentStyle}>
                  <div style={itemTitleStyle}>{doc.title}</div>
                  <div style={{ ...itemDateStyle, color: isActive ? "rgba(255,255,255,0.7)" : undefined }}>
                    {formatDate(doc.updatedAt)}
                  </div>
                </div>
                <button
                  data-delete
                  style={{
                    ...deleteBtnStyle,
                    color: isActive ? "rgba(255,255,255,0.7)" : "var(--text-faint)",
                  }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onDelete(doc.id);
                  }}
                  title="削除"
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = isActive
                      ? "rgba(255,255,255,0.15)"
                      : "rgba(220,50,50,0.15)";
                    e.currentTarget.style.color = isActive ? "#fff" : "#e05555";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none";
                    e.currentTarget.style.color = isActive ? "rgba(255,255,255,0.7)" : "var(--text-faint)";
                  }}
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
            );
          })}
        </div>
        <div style={footerStyle}>
          ブラウザのローカルストレージに保存されます
        </div>
      </div>
    </>
  );
}

/** サンプルドキュメント専用の行コンポーネント */
function SampleItem({
  doc,
  isActive,
  onSelect,
}: {
  doc: Document;
  isActive: boolean;
  onSelect: (id: string) => void;
}) {
  return (
    <div
      style={{
        ...itemStyle,
        background: isActive ? "var(--accent)" : undefined,
        color: isActive ? "#fff" : undefined,
      }}
      onClick={() => onSelect(doc.id)}
      onMouseEnter={(e) => {
        if (!isActive) e.currentTarget.style.background = "var(--bg-tertiary)";
      }}
      onMouseLeave={(e) => {
        if (!isActive) e.currentTarget.style.background = "transparent";
      }}
    >
      <div style={{
        ...sampleIconStyle,
        color: isActive ? "#fff" : "var(--accent)",
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>
      <div style={itemContentStyle}>
        <div style={itemTitleStyle}>{doc.title}</div>
        <div style={{ ...itemDateStyle, color: isActive ? "rgba(255,255,255,0.7)" : undefined }}>
          使い方ガイド（読み取り専用）
        </div>
      </div>
    </div>
  );
}
