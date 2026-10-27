import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

export interface AiEstimate {
  furnitureType: string;
  confidence: number;
  estimatedPrice: number;
}

/** Adaptador OUT — llama al ai-service (Python REST) para CU3. */
@Injectable()
export class AiServiceAdapter {
  private readonly log = new Logger(AiServiceAdapter.name);
  private readonly baseUrl: string;
  private readonly internalSecret: string;

  constructor(config: ConfigService) {
    this.baseUrl = config.get<string>('AI_SERVICE_URL', 'http://localhost:8100');
    this.internalSecret = config.get<string>('INTERNAL_SECRET', 'carpinteria-internal-dev');
  }

  async estimateQuotation(input: {
    description?: string;
    furnitureType?: string;
    woodType?: string;
    dimensions?: { lengthM: number; widthM: number; heightM: number };
    imageBase64?: string;
  }): Promise<AiEstimate | null> {
    try {
      const res = await fetch(`${this.baseUrl}/ai/estimate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-internal-secret': this.internalSecret,
        },
        body: JSON.stringify(input),
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) throw new Error(`AI ${res.status}`);
      return (await res.json()) as AiEstimate;
    } catch (err) {
      this.log.warn(`ai-service no disponible: ${(err as Error).message}`);
      return null;
    }
  }
}
