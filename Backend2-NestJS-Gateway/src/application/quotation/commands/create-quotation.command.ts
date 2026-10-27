export interface CreateQuotationCommand {
  clientId: string;
  photoUrl?: string;
  items: {
    description: string;
    furnitureType: string;
    woodType: string;
    quantity: number;
    unitPrice: number;
    dimensions?: { lengthM: number; widthM: number; heightM: number };
    finish?: string;
  }[];
  /** Si true, llama al ai-service para clasificar/estimar (CU3 IA). */
  requestEstimate?: boolean;
}
