export interface Config {
  id: string;
  configName: string;
  creatorsCategory: string;
  analysisInstruction: string;
  newConceptsInstruction: string;
  ctaText?: string;
  websiteUrl?: string;
  currentOfferName?: string;
  bookingLink?: string;
  urgencyLine?: string;
}

export interface Creator {
  id: string;
  username: string;
  category: string;
  profilePicUrl: string;
  followers: number;
  reelsCount30d: number;
  avgViews30d: number;
  lastScrapedAt: string;
}

export interface Video {
  id: string;
  link: string;
  thumbnail: string;
  creator: string;
  views: number;
  likes: number;
  comments: number;
  analysis: string;
  newConcepts: string;
  datePosted: string;
  dateAdded: string;
  configName: string;
  starred: boolean;
}

export interface CarouselSlide {
  slideNumber: number;
  type: "hook" | "body" | "summary" | "cta";
  headline: string;
  body: string;
  imagePrompt: string;
}

export interface Carousel {
  id: string;
  topic: string;
  pillar: string;
  sourceVideoId: string;
  slides: string;           // JSON-stringified CarouselSlide[]
  thumbnailPrompts: string; // JSON-stringified string[]
  dateCreated: string;
}

export interface PipelineParams {
  configName: string;
  maxVideos: number;
  topK: number;
  nDays: number;
}

export interface ActiveTask {
  id: string;
  creator: string;
  step: string;
  views?: number;
}

export interface PipelineProgress {
  status: "idle" | "running" | "completed" | "error";
  phase: "scraping" | "analyzing" | "done";
  activeTasks: ActiveTask[];
  creatorsCompleted: number;
  creatorsTotal: number;
  creatorsScraped: number;
  videosAnalyzed: number;
  videosTotal: number;
  errors: string[];
  log: string[];
}
