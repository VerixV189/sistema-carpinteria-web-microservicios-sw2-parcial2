import { Controller, Get, Logger, ServiceUnavailableException, UseGuards } from '@nestjs/common';
import { createHash } from 'crypto';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

/**
 * Uploads — firma Cloudinary para upload directo desde el frontend.
 * El navegador pide la firma aquí (con JWT) y sube la imagen a Cloudinary
 * sin exponer el API secret.
 */
@Controller('api/uploads')
@UseGuards(JwtAuthGuard)
export class UploadsController {
  private readonly log = new Logger(UploadsController.name);

  @Get('cloudinary-signature')
  cloudinarySignature() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException('Cloudinary no configurado');
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'carpinteria/quotations';
    // Cloudinary: sha1 de "param=valor&..." (orden alfabético) + api_secret
    const signature = createHash('sha1')
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');
    this.log.log(`Firma Cloudinary emitida (folder=${folder})`);
    return { cloudName, apiKey, timestamp, signature, folder };
  }
}
