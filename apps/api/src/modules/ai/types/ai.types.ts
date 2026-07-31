import { AIJobStatus, AIProvider } from '@prisma/client';

export type AIJobType =
  | 'video-analysis'
  | 'image-analysis'
  | 'barcode-analysis'
  | 'ocr-analysis'
  | 'evidence-validation'
  | 'report-generation';

export interface AIJobMetadata {
  uploadId?: string;
  recordingId?: string;
  evidenceId?: string;
  orderId?: string;
  companyId?: string;
  warehouseId?: string;
  fileName?: string;
  mimeType?: string;
  checksum?: string;
  hash?: string;
  [key: string]: unknown;
}

export interface AIProviderRequest {
  provider: AIProvider;
  model?: string;
  prompt?: string;
  input?: unknown;
  metadata?: AIJobMetadata;
}

export interface AIProviderResponse {
  success: boolean;

  provider: AIProvider;

  model?: string;

  result?: unknown;

  data?: unknown;

  confidence: number;

  processingTime: number;

  tokensUsed?: number;

  usage?: {
    promptTokens?: number;
    completionTokens?: number;
    totalTokens?: number;
  };

  error?: string;
}

export interface OCRTextBlock {
  text: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface OCRResult {
  text: string;
  blocks: OCRTextBlock[];
}

export interface BarcodeDetection {
  format: string;
  value: string;
  confidence: number;
}

export interface DetectedObject {
  label: string;
  confidence: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VideoAnalysisResult {
  objects: DetectedObject[];
  barcodes: BarcodeDetection[];
  ocr: OCRResult;
  summary: string;
}

export interface AIReport {
  title: string;
  summary: string;
  findings: string[];
  recommendations: string[];
  confidence: number;
}

export interface AIJobResult {
  status: AIJobStatus;
  report: AIReport;
  rawResponse: unknown;
}

export interface AIWorkerPayload {
  jobId: string;
  provider: AIProvider;
  type: AIJobType;
}
