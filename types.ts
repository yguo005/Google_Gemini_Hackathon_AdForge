export interface Campaign {
  audience: string;
  script: string;
  imagePrompt: string;
  imageUrl?: string;
  imageError?: string;
  isGeneratingImage?: boolean;
}

export interface GeneratedScript {
  audience: string;
  script: string;
  imagePrompt: string;
}

export interface GeneratedScriptsResponse {
  campaigns: GeneratedScript[];
}