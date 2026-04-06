"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  LayoutGrid,
  Sparkles,
  Copy,
  Check,
  Loader2,
  Image as ImageIcon,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import type { Video, CarouselSlide } from "@/lib/types";

const PILLARS = ["TEACH", "PROVE", "INSPIRE", "SELL"];

const slideTypeColors: Record<string, string> = {
  hook: "bg-amber-500/20 text-amber-400 border-amber-500/30",
  body: "bg-purple-500/20 text-purple-400 border-purple-500/30",
  summary: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  cta: "bg-orange-500/20 text-orange-400 border-orange-500/30",
};

interface GeneratedCarousel {
  id: string;
  topic: string;
  pillar: string;
  slides: CarouselSlide[];
  thumbnailPrompts: string[];
  dateCreated: string;
}

export default function CarouselPage() {
  const [topic, setTopic] = useState("");
  const [pillar, setPillar] = useState("TEACH");
  const [sourceMode, setSourceMode] = useState<"freetext" | "video">("freetext");
  const [videos, setVideos] = useState<Video[]>([]);
  const [selectedVideoId, setSelectedVideoId] = useState("");
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState<GeneratedCarousel | null>(null);
  const [error, setError] = useState("");
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [previousCarousels, setPreviousCarousels] = useState<GeneratedCarousel[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);

  useEffect(() => {
    fetch("/api/videos")
      .then((r) => r.json())
      .then((vids: Video[]) => {
        const starred = vids.filter((v) => v.starred);
        setVideos(starred.length > 0 ? starred : vids.slice(0, 50));
      })
      .catch(() => {});

    fetch("/api/carousel")
      .then((r) => r.json())
      .then((carousels: GeneratedCarousel[]) => {
        const parsed = carousels.map((c) => ({
          ...c,
          slides: typeof c.slides === "string" ? JSON.parse(c.slides) : c.slides,
          thumbnailPrompts: typeof c.thumbnailPrompts === "string" ? JSON.parse(c.thumbnailPrompts) : c.thumbnailPrompts,
        }));
        setPreviousCarousels(parsed.reverse());
      })
      .catch(() => {});
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    setError("");
    setResult(null);

    let finalTopic = topic;
    let sourceVideoId = "";

    if (sourceMode === "video" && selectedVideoId) {
      const video = videos.find((v) => v.id === selectedVideoId);
      if (video) {
        finalTopic = video.newConcepts || video.analysis || topic;
        sourceVideoId = video.id;
      }
    }

    if (!finalTopic.trim()) {
      setError("Enter a topic or select a video concept.");
      setGenerating(false);
      return;
    }

    try {
      const res = await fetch("/api/carousel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          topic: finalTopic,
          pillar,
          sourceVideoId,
        }),
      });

      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.error || "Failed to generate carousel");
      }

      const data = await res.json();
      setResult(data);
      setPreviousCarousels((prev) => [data, ...prev]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setGenerating(false);
    }
  };

  const copyToClipboard = async (text: string, idx: number) => {
    await navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Carousel Builder</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Generate branded 8-12 slide Instagram carousels with thumbnail prompts
        </p>
      </div>

      {/* Input Section */}
      <div className="glass rounded-2xl p-6 space-y-5">
        {/* Source Toggle */}
        <div className="flex gap-2">
          <Button
            variant={sourceMode === "freetext" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSourceMode("freetext")}
            className={`rounded-xl ${sourceMode === "freetext" ? "bg-gradient-to-r from-purple-500 to-indigo-600 border-0" : ""}`}
          >
            Free Text
          </Button>
          <Button
            variant={sourceMode === "video" ? "default" : "ghost"}
            size="sm"
            onClick={() => setSourceMode("video")}
            className={`rounded-xl ${sourceMode === "video" ? "bg-gradient-to-r from-purple-500 to-indigo-600 border-0" : ""}`}
          >
            From Video Concept
          </Button>
        </div>

        {sourceMode === "freetext" ? (
          <div>
            <Label className="text-xs text-muted-foreground">Topic or concept</Label>
            <Textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. 5 Claude features that save corporate teams 10+ hours a week"
              rows={3}
              className="mt-1.5 rounded-xl glass border-white/[0.08] font-mono text-xs leading-relaxed"
            />
          </div>
        ) : (
          <div>
            <Label className="text-xs text-muted-foreground">Select a video concept</Label>
            <Select value={selectedVideoId} onValueChange={setSelectedVideoId}>
              <SelectTrigger className="mt-1.5 rounded-xl glass border-white/[0.08] h-11">
                <SelectValue placeholder="Choose a video..." />
              </SelectTrigger>
              <SelectContent className="max-h-60">
                {videos.map((v) => (
                  <SelectItem key={v.id} value={v.id}>
                    <span className="text-xs">
                      @{v.creator} — {v.views.toLocaleString()} views
                      {v.starred ? " ★" : ""}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* Pillar */}
        <div>
          <Label className="text-xs text-muted-foreground">Content Pillar</Label>
          <Select value={pillar} onValueChange={setPillar}>
            <SelectTrigger className="mt-1.5 rounded-xl glass border-white/[0.08] h-11 w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PILLARS.map((p) => (
                <SelectItem key={p} value={p}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Generate Button */}
        <Button
          onClick={handleGenerate}
          disabled={generating}
          className="rounded-xl h-11 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 border-0 gap-2"
        >
          {generating ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4" />
              Generate Carousel
            </>
          )}
        </Button>

        {error && (
          <p className="text-sm text-red-400">{error}</p>
        )}
      </div>

      {/* Result Section */}
      {result && (
        <div className="space-y-6">
          {/* Slides */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <LayoutGrid className="h-4 w-4 text-purple-400" />
              Slides ({result.slides.length})
            </h2>
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              {result.slides.map((slide, i) => (
                <div key={i} className="glass rounded-2xl p-4 space-y-3 transition-all duration-300 hover:bg-white/[0.05]">
                  <div className="flex items-center justify-between">
                    <Badge
                      variant="outline"
                      className={`text-[10px] rounded-md ${slideTypeColors[slide.type] || ""}`}
                    >
                      {slide.type.toUpperCase()}
                    </Badge>
                    <span className="text-[10px] text-muted-foreground">
                      Slide {slide.slideNumber}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold leading-snug">
                    {slide.headline}
                  </h3>
                  {slide.body && (
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {slide.body}
                    </p>
                  )}
                  <div className="rounded-lg bg-black/30 border border-white/[0.04] p-2.5">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[9px] font-medium text-purple-400 uppercase tracking-wider flex items-center gap-1">
                        <ImageIcon className="h-2.5 w-2.5" />
                        Image Prompt
                      </span>
                      <button
                        onClick={() => copyToClipboard(slide.imagePrompt, i)}
                        className="text-muted-foreground hover:text-foreground transition-colors"
                      >
                        {copiedIdx === i ? (
                          <Check className="h-3 w-3 text-emerald-400" />
                        ) : (
                          <Copy className="h-3 w-3" />
                        )}
                      </button>
                    </div>
                    <p className="text-[10px] text-muted-foreground leading-relaxed line-clamp-3">
                      {slide.imagePrompt}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Thumbnail Prompts */}
          <div>
            <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
              <ImageIcon className="h-4 w-4 text-orange-400" />
              Thumbnail Prompts
            </h2>
            <div className="grid gap-3 md:grid-cols-3">
              {result.thumbnailPrompts.map((prompt, i) => (
                <div key={i} className="glass rounded-2xl p-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="text-[10px] rounded-md bg-orange-500/20 text-orange-400 border-orange-500/30">
                      {i === 0 ? "TEXT" : i === 1 ? "SUBJECT" : "DATA"}
                    </Badge>
                    <button
                      onClick={() => copyToClipboard(prompt, 1000 + i)}
                      className="text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {copiedIdx === 1000 + i ? (
                        <Check className="h-3.5 w-3.5 text-emerald-400" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {prompt}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Previous Carousels */}
      {previousCarousels.length > 0 && (
        <div>
          <button
            onClick={() => setHistoryOpen(!historyOpen)}
            className="flex items-center gap-2 text-sm font-semibold text-muted-foreground hover:text-foreground transition-colors"
          >
            {historyOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
            Previous Carousels ({previousCarousels.length})
          </button>
          {historyOpen && (
            <div className="mt-3 grid gap-3">
              {previousCarousels.map((c) => (
                <div
                  key={c.id}
                  className="glass rounded-2xl p-4 flex items-center justify-between cursor-pointer hover:bg-white/[0.05] transition-all"
                  onClick={() => setResult(c)}
                >
                  <div>
                    <p className="text-sm font-medium truncate max-w-md">
                      {c.topic.slice(0, 80)}{c.topic.length > 80 ? "..." : ""}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge variant="secondary" className="text-[10px] rounded-md bg-white/[0.05] border border-white/[0.06]">
                        {c.pillar}
                      </Badge>
                      <span className="text-[11px] text-muted-foreground">
                        {c.dateCreated}
                      </span>
                      <span className="text-[11px] text-muted-foreground">
                        {c.slides.length} slides
                      </span>
                    </div>
                  </div>
                  <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!result && previousCarousels.length === 0 && (
        <div className="glass rounded-2xl p-12 text-center">
          <LayoutGrid className="mx-auto h-10 w-10 text-muted-foreground/30" />
          <h3 className="mt-4 font-semibold">No carousels yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Enter a topic above to generate your first carousel.
          </p>
        </div>
      )}
    </div>
  );
}
