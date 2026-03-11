"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import CodeMirrorEditor from "./CodeMirrorEditor";
import MarkdownPreview from "./MarkdownPreview";
import Toolbar from "./Toolbar";
import Sidebar from "./Sidebar";
import {
  Document,
  SAMPLE_DOC_ID,
  getSampleDocument,
  loadDocuments,
  saveDocuments,
  loadActiveDocId,
  saveActiveDocId,
  createDocument,
  extractTitle,
} from "@/lib/documents";

type ViewMode = "live" | "source" | "split";
type Theme = "dark" | "light";

export default function Editor() {
  const [documents, setDocuments] = useState<Document[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("live");
  const [theme, setTheme] = useState<Theme>("dark");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // スクロール同期用
  const editorScrollRef = useRef<HTMLElement | null>(null);
  const previewScrollRef = useRef<HTMLDivElement | null>(null);
  const scrollSourceRef = useRef<"editor" | "preview" | null>(null);

  // Load from localStorage on mount
  useEffect(() => {
    const userDocs = loadDocuments();
    const activeDocId = loadActiveDocId();
    const allDocs = [getSampleDocument(), ...userDocs];

    setDocuments(allDocs);
    setActiveId(
      activeDocId && allDocs.find((d) => d.id === activeDocId)
        ? activeDocId
        : SAMPLE_DOC_ID
    );
    setMounted(true);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  // スクロール同期のセットアップ
  useEffect(() => {
    const editorEl = editorScrollRef.current;
    const previewEl = previewScrollRef.current;
    if (!editorEl || !previewEl) return;

    let rafId: number | null = null;

    const syncScroll = (source: "editor" | "preview") => {
      if (scrollSourceRef.current && scrollSourceRef.current !== source) return;
      scrollSourceRef.current = source;

      if (rafId) cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        const from = source === "editor" ? editorEl : previewEl;
        const to = source === "editor" ? previewEl : editorEl;

        const maxFrom = from.scrollHeight - from.clientHeight;
        if (maxFrom <= 0) {
          scrollSourceRef.current = null;
          return;
        }

        const ratio = from.scrollTop / maxFrom;
        const maxTo = to.scrollHeight - to.clientHeight;
        to.scrollTop = ratio * maxTo;

        // ロック解除を少し遅らせて、同期先のscrollイベントが再トリガーしないようにする
        requestAnimationFrame(() => {
          scrollSourceRef.current = null;
        });
      });
    };

    const onEditorScroll = () => syncScroll("editor");
    const onPreviewScroll = () => syncScroll("preview");

    editorEl.addEventListener("scroll", onEditorScroll, { passive: true });
    previewEl.addEventListener("scroll", onPreviewScroll, { passive: true });

    return () => {
      editorEl.removeEventListener("scroll", onEditorScroll);
      previewEl.removeEventListener("scroll", onPreviewScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [viewMode, activeId]);

  const handleEditorScrollDom = useCallback((el: HTMLElement | null) => {
    editorScrollRef.current = el;
  }, []);

  const activeDoc = documents.find((d) => d.id === activeId) || null;

  const persistDocuments = useCallback((docs: Document[]) => {
    setDocuments(docs);
    saveDocuments(docs);
  }, []);

  const handleChange = useCallback(
    (content: string) => {
      if (activeId === SAMPLE_DOC_ID) return;

      setDocuments((prev) => {
        const updated = prev.map((d) =>
          d.id === activeId
            ? { ...d, content, title: extractTitle(content) || d.title, updatedAt: Date.now() }
            : d
        );
        if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
        saveTimerRef.current = setTimeout(() => {
          saveDocuments(updated);
        }, 500);
        return updated;
      });
    },
    [activeId]
  );

  const handleCreate = useCallback(() => {
    const doc = createDocument("無題");
    const sample = documents.find((d) => d.id === SAMPLE_DOC_ID);
    const userDocs = documents.filter((d) => d.id !== SAMPLE_DOC_ID);
    const updated = [sample!, doc, ...userDocs];
    persistDocuments(updated);
    setActiveId(doc.id);
    saveActiveDocId(doc.id);
    setSidebarOpen(false);
  }, [documents, persistDocuments]);

  const handleSelect = useCallback(
    (id: string) => {
      if (id === activeId) {
        setSidebarOpen(false);
        return;
      }
      saveDocuments(documents);
      setActiveId(id);
      saveActiveDocId(id);
      setSidebarOpen(false);
    },
    [activeId, documents]
  );

  const handleDelete = useCallback(
    (id: string) => {
      if (id === SAMPLE_DOC_ID) return;

      const remaining = documents.filter((d) => d.id !== id);
      persistDocuments(remaining);
      if (id === activeId) {
        const userDocs = remaining.filter((d) => d.id !== SAMPLE_DOC_ID);
        const nextId = userDocs.length > 0 ? userDocs[0].id : SAMPLE_DOC_ID;
        setActiveId(nextId);
        saveActiveDocId(nextId);
      }
    },
    [documents, activeId, persistDocuments]
  );

  if (!mounted || !activeDoc) {
    return (
      <div className="editor-container">
        <div className="editor-loading">読み込み中...</div>
      </div>
    );
  }

  const isLivePreview = viewMode === "live";
  const showPreview = viewMode === "split";
  const isReadOnly = activeDoc.readOnly === true;

  return (
    <div className="editor-container">
      <Sidebar
        documents={documents}
        activeId={activeId}
        onSelect={handleSelect}
        onCreate={handleCreate}
        onDelete={handleDelete}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
      />
      <Toolbar
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        theme={theme}
        onThemeChange={setTheme}
        title={activeDoc.title}
        onSidebarToggle={() => setSidebarOpen(!sidebarOpen)}
        sidebarOpen={sidebarOpen}
      />
      <div className={`editor-content ${showPreview ? "split" : ""}`}>
        <div className="editor-pane">
          <CodeMirrorEditor
            docId={activeDoc.id}
            initialDoc={activeDoc.content}
            onChange={handleChange}
            livePreview={isLivePreview}
            readOnly={isReadOnly}
            onScrollDom={handleEditorScrollDom}
          />
        </div>
        {showPreview && (
          <div
            className="preview-container"
            ref={previewScrollRef}
          >
            <MarkdownPreview content={activeDoc.content} />
          </div>
        )}
      </div>
    </div>
  );
}
