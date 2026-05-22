"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import ChatBot from "@/components/ChatBot";
import FileUpload from "@/components/FileUpload";
import TagBadge from "@/components/TagBadge";
import { api } from "@/lib/api";

export default function AnalyzePage() {
  const [tags, setTags] = useState<string[]>([]);
  const [pdfResult, setPdfResult] = useState("");
  const [pdfLoading, setPdfLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [saveError, setSaveError] = useState("");

  const handlePdf = async (file: File) => {
    setPdfLoading(true);
    setPdfResult("");
    try {
      const fd = new FormData();
      fd.append("file", file);
      const res = await api.postForm<{ response: string }>("/api/analyze/upload-pdf", fd);
      setPdfResult(res.response);
    } catch (e: unknown) {
      setPdfResult("오류: " + (e instanceof Error ? e.message : "알 수 없는 오류"));
    } finally {
      setPdfLoading(false);
    }
  };

  const saveTags = async () => {
    if (!tags.length) return;
    setSaving(true);
    setSaveError("");
    try {
      await api.post("/api/users/me/tags", { tags });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      const msg = e instanceof Error ? e.message : "저장 실패";
      if (msg.includes("401") || msg.includes("토큰") || msg.includes("유효하지")) {
        setSaveError("로그인이 만료됐습니다. 다시 로그인해주세요.");
      } else {
        setSaveError(msg);
      }
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">AI 분석</h1>
        <p className="text-muted-foreground text-sm mt-1">
          챗봇과 대화하거나 PDF를 업로드해 관심사 태그를 생성하세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Chatbot */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">AI 챗봇</CardTitle>
          </CardHeader>
          <CardContent>
            <ChatBot onTagsGenerated={setTags} />
          </CardContent>
        </Card>

        {/* Right column */}
        <div className="flex flex-col gap-4">
          {/* PDF Upload */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">PDF 업로드</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <FileUpload onFileSelect={handlePdf} />
              {pdfLoading && (
                <p className="text-sm text-muted-foreground animate-pulse">AI가 분석 중입니다…</p>
              )}
              {pdfResult && (
                <div className="text-sm text-foreground bg-muted/40 rounded-lg p-4 whitespace-pre-wrap leading-relaxed max-h-48 overflow-y-auto">
                  {pdfResult}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Generated tags */}
          {tags.length > 0 && (
            <Card className="border-primary/30 bg-primary/5">
              <CardHeader className="pb-3">
                <CardTitle className="text-base">AI 생성 태그</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <TagBadge key={tag} tag={tag} aiGenerated />
                  ))}
                </div>
                <Button onClick={saveTags} disabled={saving} size="sm">
                  {saved ? "저장 완료 ✓" : saving ? "저장 중…" : "내 프로필에 저장"}
                </Button>
                {saveError && (
                  <p className="text-xs text-destructive bg-destructive/10 px-3 py-2 rounded-md">
                    {saveError}
                  </p>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
