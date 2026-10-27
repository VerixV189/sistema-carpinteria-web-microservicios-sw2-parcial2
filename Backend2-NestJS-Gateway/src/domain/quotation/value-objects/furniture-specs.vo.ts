/** Value Object — especificaciones del mueble a cotizar. */
export class FurnitureSpecs {
  constructor(
    public readonly furnitureType: string,
    public readonly woodType: string,
    public readonly dimensions?: { lengthM: number; widthM: number; heightM: number },
    public readonly finish?: string,
  ) {}

  get volumeM3(): number {
    if (!this.dimensions) return 0;
    return this.dimensions.lengthM * this.dimensions.widthM * this.dimensions.heightM;
  }
}
