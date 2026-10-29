import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Model } from 'mongoose';
import { MongodbConfig } from '../../../../config/mongodb.config';

export interface MarketplaceProduct {
  id: string;
  name: string;
  category: string;
  woodType: string;
  dimensions: string;
  price: number;
  estimatedDays: number;
  stock: number;
  description: string;
  iconName: string;
  imageUrl?: string;
  carpenterEmail?: string;
  carpenterName?: string;
  createdByRole?: 'ADMIN' | 'CARPENTER';
  createdAt: string;
  updatedAt: string;
}

const DEFAULT_IMG = (name: string) =>
  `https://res.cloudinary.com/dwerzrgya/image/upload/c_fill,w_800,h_500,q_auto,f_auto/carpinteria/catalog/catalog-${name}.jpg`;

const INITIAL_PRODUCTS: MarketplaceProduct[] = [
  {
    id: 'P-001',
    name: 'Mesa de Comedor Imperial (6-8 Personas)',
    category: 'Mesas',
    woodType: 'Roble',
    dimensions: '200 x 100 x 76 cm',
    price: 2200,
    estimatedDays: 12,
    stock: 4,
    description:
      'Mesa de comedor principal trabajada en madera roble estacionada, acabado en poliuretano mate resistente a humedad y calor.',
    iconName: 'table_restaurant',
    imageUrl: DEFAULT_IMG('table'),
    carpenterEmail: 'carpintero@carpinteria.com',
    carpenterName: 'Maestro Carpintero Taller',
    createdByRole: 'CARPENTER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'P-002',
    name: 'Juego de Sillas Tapizadas (Set x6)',
    category: 'Sillas',
    woodType: 'Mara',
    dimensions: '48 x 52 x 98 cm c/u',
    price: 2100,
    estimatedDays: 10,
    stock: 5,
    description:
      'Sillas reforzadas con espiga y caja, tapizado en lino antimanchas de alta densidad y barnizado natural en mara.',
    iconName: 'chair',
    imageUrl: DEFAULT_IMG('chair'),
    carpenterEmail: 'carpintero@carpinteria.com',
    carpenterName: 'Maestro Carpintero Taller',
    createdByRole: 'CARPENTER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'P-003',
    name: 'Ropero 3 Puertas con Espejo y Cajones',
    category: 'Roperos',
    woodType: 'Cedro',
    dimensions: '220 x 65 x 235 cm',
    price: 3800,
    estimatedDays: 15,
    stock: 3,
    description:
      'Ropero piso a techo con rieles telescópicos de cierre suave, cajonera interna, maletero superior y espejo central.',
    iconName: 'door_sliding',
    imageUrl: DEFAULT_IMG('wardrobe'),
    carpenterEmail: 'carpintero@carpinteria.com',
    carpenterName: 'Maestro Carpintero Taller',
    createdByRole: 'CARPENTER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'P-004',
    name: 'Puerta Principal Tablero Rebajado',
    category: 'Puertas',
    woodType: 'Roble',
    dimensions: '95 x 215 x 4.5 cm',
    price: 1950,
    estimatedDays: 8,
    stock: 6,
    description:
      'Puerta maciza para exterior con marco cajón, tratamiento antilluvia, filtro UV y preparación para chapa de seguridad.',
    iconName: 'door_front_door',
    imageUrl: DEFAULT_IMG('door'),
    carpenterEmail: 'carpintero@carpinteria.com',
    carpenterName: 'Maestro Carpintero Taller',
    createdByRole: 'CARPENTER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'P-005',
    name: 'Mueble de Cocina Modular + Estantería',
    category: 'Cocina',
    woodType: 'Melamina',
    dimensions: '320 cm lineales',
    price: 4600,
    estimatedDays: 18,
    stock: 2,
    description:
      'Módulos de cocina resistentes a humedad con bisagras cierre lento, pistones a gas y división de cubiertos.',
    iconName: 'countertops',
    imageUrl: DEFAULT_IMG('kitchen'),
    carpenterEmail: 'carpintero@carpinteria.com',
    carpenterName: 'Maestro Carpintero Taller',
    createdByRole: 'CARPENTER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'P-006',
    name: 'Escritorio Ejecutivo con Cajonera (3 Gavetas)',
    category: 'Mesas',
    woodType: 'Pino',
    dimensions: '150 x 70 x 76 cm',
    price: 1400,
    estimatedDays: 9,
    stock: 4,
    description:
      'Escritorio gerencial con pasacables oculto, 3 gavetas con llave y acabado satinado de alta durabilidad.',
    iconName: 'desk',
    imageUrl: DEFAULT_IMG('desk'),
    carpenterEmail: 'carpintero@carpinteria.com',
    carpenterName: 'Maestro Carpintero Taller',
    createdByRole: 'CARPENTER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'P-007',
    name: 'Biblioteca y Estantería Modular Piso a Techo',
    category: 'Roperos',
    woodType: 'Cedro',
    dimensions: '180 x 35 x 220 cm',
    price: 1650,
    estimatedDays: 10,
    stock: 3,
    description:
      'Biblioteca con repisas regulables y compartimento inferior con puertas para sala u oficina.',
    iconName: 'door_sliding',
    imageUrl: DEFAULT_IMG('bookshelf'),
    carpenterEmail: 'carpintero@carpinteria.com',
    carpenterName: 'Maestro Carpintero Taller',
    createdByRole: 'CARPENTER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'P-008',
    name: 'Cama King con Cabecera Tallada y 2 Veladores',
    category: 'Roperos',
    woodType: 'Mara',
    dimensions: '200 x 200 x 115 cm',
    price: 2950,
    estimatedDays: 14,
    stock: 3,
    description:
      'Cama reforzada en madera mara con parrilla ortopédica maciza, cabecera trabajada y par de mesas de noche.',
    iconName: 'chair',
    imageUrl: DEFAULT_IMG('bed'),
    carpenterEmail: 'carpintero@carpinteria.com',
    carpenterName: 'Maestro Carpintero Taller',
    createdByRole: 'CARPENTER',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

@Injectable()
export class MongoProductRepository implements OnModuleInit {
  private readonly log = new Logger(MongoProductRepository.name);
  private model!: Model<Record<string, unknown>>;
  private readonly memoryFallback = new Map<string, MarketplaceProduct>();

  constructor(private readonly mongo: MongodbConfig) {
    for (const p of INITIAL_PRODUCTS) {
      this.memoryFallback.set(p.id, { ...p });
    }
  }

  async onModuleInit(): Promise<void> {
    this.model = this.mongo.productsModel();
    try {
      const count = await this.model.countDocuments();
      if (count === 0) {
        for (const p of INITIAL_PRODUCTS) {
          await this.model.updateOne(
            { _id: p.id },
            { $set: { ...p, _id: p.id } },
            { upsert: true },
          );
        }
        this.log.log(`Semilla inicial de Marketplace creada (${INITIAL_PRODUCTS.length} muebles)`);
      } else {
        const docs = await this.model.find({}).lean();
        this.memoryFallback.clear();
        for (const d of docs) {
          const prod = this.fromDoc(d as Record<string, unknown>);
          this.memoryFallback.set(prod.id, prod);
        }
      }
    } catch (e) {
      this.log.warn(`Usando catálogo Marketplace en memoria (${(e as Error).message})`);
    }
  }

  private fromDoc(doc: Record<string, unknown>): MarketplaceProduct {
    return {
      id: String(doc._id ?? doc.id),
      name: String(doc.name ?? ''),
      category: String(doc.category ?? 'Mesas'),
      woodType: String(doc.woodType ?? 'Roble'),
      dimensions: String(doc.dimensions ?? 'Estándar'),
      price: Number(doc.price ?? 0),
      estimatedDays: Number(doc.estimatedDays ?? 10),
      stock: Number(doc.stock ?? 0),
      description: String(doc.description ?? ''),
      iconName: String(doc.iconName ?? 'chair'),
      imageUrl: doc.imageUrl ? String(doc.imageUrl) : undefined,
      carpenterEmail: doc.carpenterEmail ? String(doc.carpenterEmail) : undefined,
      carpenterName: doc.carpenterName ? String(doc.carpenterName) : undefined,
      createdByRole: (doc.createdByRole as 'ADMIN' | 'CARPENTER') ?? 'CARPENTER',
      createdAt: String(doc.createdAt ?? new Date().toISOString()),
      updatedAt: String(doc.updatedAt ?? new Date().toISOString()),
    };
  }

  async findAll(): Promise<MarketplaceProduct[]> {
    try {
      const docs = await this.model.find({}).sort({ createdAt: -1 }).lean();
      if (docs.length > 0) {
        return docs.map((d) => this.fromDoc(d as Record<string, unknown>));
      }
    } catch {
      // Fallback a memoria
    }
    return Array.from(this.memoryFallback.values());
  }

  async findById(id: string): Promise<MarketplaceProduct | null> {
    try {
      const doc = await this.model.findById(id).lean();
      if (doc) return this.fromDoc(doc as Record<string, unknown>);
    } catch {
      // Fallback
    }
    return this.memoryFallback.get(id) ?? null;
  }

  async save(product: MarketplaceProduct): Promise<MarketplaceProduct> {
    product.updatedAt = new Date().toISOString();
    this.memoryFallback.set(product.id, { ...product });
    try {
      await this.model.updateOne(
        { _id: product.id },
        { $set: { ...product, _id: product.id } },
        { upsert: true },
      );
    } catch (e) {
      this.log.warn(`Save product en memoria (${(e as Error).message})`);
    }
    return product;
  }

  async delete(id: string): Promise<boolean> {
    const existed = this.memoryFallback.delete(id);
    try {
      const res = await this.model.deleteOne({ _id: id });
      return (res.deletedCount ?? 0) > 0 || existed;
    } catch {
      return existed;
    }
  }
}
