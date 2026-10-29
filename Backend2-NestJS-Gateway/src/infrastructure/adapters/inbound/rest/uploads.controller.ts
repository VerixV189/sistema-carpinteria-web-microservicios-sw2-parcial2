import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Logger,
  NotFoundException,
  Param,
  Post,
  Req,
  Res,
  ServiceUnavailableException,
  UseGuards,
} from '@nestjs/common';
import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { createHash, createHmac } from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import type { Request, Response } from 'express';
import { JwtAuthGuard } from '../../../../auth/jwt-auth.guard';

class UploadS3Dto {
  @IsOptional() @IsString() fileName?: string;
  @IsOptional() @IsString() mimeType?: string;
  @IsString() @IsNotEmpty() base64!: string;
  @IsOptional() @IsString() folder?: string;
}

/**
 * Uploads — Sube imágenes directamente al bucket AWS S3 (con firma AWS SigV4)
 * y expone una ruta pública de lectura (/api/uploads/file/:folder/:filename)
 * para que las etiquetas <img> en Web y Móvil carguen sin errores de CORS ni
 * bloqueos de Block Public Access en S3.
 */
@Controller('api/uploads')
export class UploadsController {
  private readonly log = new Logger(UploadsController.name);
  private readonly localDir = path.resolve(process.cwd(), 'uploads');

  private getS3Config() {
    const bucket =
      process.env.AWS_S3_BUCKET ||
      process.env.S3_BUCKET ||
      process.env.AWS_BUCKET ||
      process.env.MINIO_BUCKET_PHOTOS ||
      '';
    const region = process.env.AWS_REGION || 'us-east-1';
    const accessKey = process.env.AWS_ACCESS_KEY_ID || '';
    const secretKey = process.env.AWS_SECRET_ACCESS_KEY || '';
    const enabled =
      Boolean(bucket && accessKey && secretKey) &&
      accessKey !== 'local' &&
      !accessKey.startsWith('PEGA_AQUI');
    return { bucket, region, accessKey, secretKey, enabled };
  }

  private hmac(key: Buffer | string, data: string): Buffer {
    return createHmac('sha256', key).update(data, 'utf8').digest();
  }

  private sha256Hex(data: Buffer | string): string {
    return createHash('sha256').update(data).digest('hex');
  }

  /** Firma petición PUT o GET hacia AWS S3 usando AWS Signature Version 4. */
  private buildS3SignedHeaders(
    method: 'PUT' | 'GET',
    bucket: string,
    region: string,
    key: string,
    accessKey: string,
    secretKey: string,
    payload: Buffer,
    contentType?: string,
  ): { url: string; headers: Record<string, string> } {
    const host = `${bucket}.s3.${region}.amazonaws.com`;
    const now = new Date();
    const amzDate = now.toISOString().replace(/[:-]|\.\d{3}/g, '');
    const dateStamp = amzDate.slice(0, 8);
    const payloadHash = this.sha256Hex(payload);

    const encodedKey = key
      .split('/')
      .map((seg) => encodeURIComponent(seg))
      .join('/');

    const canonicalHeaders =
      `host:${host}\n` +
      `x-amz-content-sha256:${payloadHash}\n` +
      `x-amz-date:${amzDate}\n`;
    const signedHeaders = 'host;x-amz-content-sha256;x-amz-date';

    const canonicalRequest = [
      method,
      `/${encodedKey}`,
      '',
      canonicalHeaders,
      signedHeaders,
      payloadHash,
    ].join('\n');

    const credentialScope = `${dateStamp}/${region}/s3/aws4_request`;
    const stringToSign = [
      'AWS4-HMAC-SHA256',
      amzDate,
      credentialScope,
      this.sha256Hex(canonicalRequest),
    ].join('\n');

    const kDate = this.hmac(`AWS4${secretKey}`, dateStamp);
    const kRegion = this.hmac(kDate, region);
    const kService = this.hmac(kRegion, 's3');
    const kSigning = this.hmac(kService, 'aws4_request');
    const signature = createHmac('sha256', kSigning).update(stringToSign, 'utf8').digest('hex');

    const authorization =
      `AWS4-HMAC-SHA256 Credential=${accessKey}/${credentialScope}, ` +
      `SignedHeaders=${signedHeaders}, Signature=${signature}`;

    const headers: Record<string, string> = {
      Authorization: authorization,
      'x-amz-content-sha256': payloadHash,
      'x-amz-date': amzDate,
    };
    if (contentType) {
      headers['Content-Type'] = contentType;
    }
    return {
      url: `https://${host}/${encodedKey}`,
      headers,
    };
  }

  /** Subida de imagen a AWS S3 (con copia en caché local del Gateway). */
  @Post('s3')
  @UseGuards(JwtAuthGuard)
  async uploadToS3(@Body() dto: UploadS3Dto, @Req() req: Request) {
    const cleanBase64 = dto.base64.includes(',')
      ? dto.base64.split(',')[1]
      : dto.base64;
    const buffer = Buffer.from(cleanBase64, 'base64');
    if (!buffer.length || buffer.length > 12 * 1024 * 1024) {
      throw new BadRequestException('Imagen inválida o supera el límite de 12 MB');
    }

    const folder = (dto.folder || 'marketplace').replace(/[^a-zA-Z0-9_-]/g, '');
    const mime = dto.mimeType || 'image/jpeg';
    const ext = mime.includes('png')
      ? 'png'
      : mime.includes('webp')
        ? 'webp'
        : 'jpg';
    const baseName = (dto.fileName || 'mueble')
      .replace(/\.[^.]+$/, '')
      .replace(/[^a-zA-Z0-9_-]/g, '_')
      .slice(0, 40);
    const fileName = `${Date.now()}-${baseName}.${ext}`;
    const s3Key = `${folder}/${fileName}`;

    // 1. Guardar copia en caché local para entrega inmediata por HTTPS
    const targetFolder = path.join(this.localDir, folder);
    fs.mkdirSync(targetFolder, { recursive: true });
    fs.writeFileSync(path.join(targetFolder, fileName), buffer);

    // 2. Subir al bucket AWS S3 si las credenciales están configuradas
    const s3 = this.getS3Config();
    let s3Uploaded = false;
    let s3ObjectUrl: string | null = null;
    if (s3.enabled) {
      try {
        const signed = this.buildS3SignedHeaders(
          'PUT',
          s3.bucket,
          s3.region,
          s3Key,
          s3.accessKey,
          s3.secretKey,
          buffer,
          mime,
        );
        const res = await fetch(signed.url, {
          method: 'PUT',
          headers: signed.headers,
          body: new Uint8Array(buffer),
        });
        if (res.ok) {
          s3Uploaded = true;
          s3ObjectUrl = signed.url;
          this.log.log(`Imagen subida a AWS S3: s3://${s3.bucket}/${s3Key}`);
        } else {
          const errText = await res.text().catch(() => '');
          this.log.warn(`AWS S3 PUT devolvió ${res.status}: ${errText.slice(0, 180)}`);
        }
      } catch (e) {
        this.log.warn(`No se pudo subir a S3 (${(e as Error).message}), sirviendo desde almacenamiento local`);
      }
    }

    const forwardedProto = (req.headers['x-forwarded-proto'] as string)?.split(',')[0]?.trim();
    const host = req.get('host') || 'localhost:3000';
    const proto = forwardedProto || (host.includes('ramio.tech') ? 'https' : req.protocol || 'http');
    const publicUrl = `${proto}://${host}/api/uploads/file/${folder}/${fileName}`;

    return {
      url: publicUrl,
      s3Url: s3ObjectUrl,
      s3Bucket: s3.enabled ? s3.bucket : null,
      s3Uploaded,
      key: s3Key,
    };
  }

  /** Sirve una imagen desde caché local o descargándola desde AWS S3. */
  @Get('file/:folder/:filename')
  async serveFile(
    @Param('folder') folder: string,
    @Param('filename') filename: string,
    @Res() res: Response,
  ) {
    const safeFolder = folder.replace(/[^a-zA-Z0-9_-]/g, '');
    const safeFile = filename.replace(/[^a-zA-Z0-9._-]/g, '');
    const filePath = path.join(this.localDir, safeFolder, safeFile);

    const ext = path.extname(safeFile).toLowerCase();
    const contentType =
      ext === '.png'
        ? 'image/png'
        : ext === '.webp'
          ? 'image/webp'
          : 'image/jpeg';

    if (fs.existsSync(filePath)) {
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000');
      return res.sendFile(filePath);
    }

    // Si no está en disco local, intentar recuperarlo de AWS S3
    const s3 = this.getS3Config();
    if (s3.enabled) {
      try {
        const s3Key = `${safeFolder}/${safeFile}`;
        const signed = this.buildS3SignedHeaders(
          'GET',
          s3.bucket,
          s3.region,
          s3Key,
          s3.accessKey,
          s3.secretKey,
          Buffer.alloc(0),
        );
        const s3Res = await fetch(signed.url, { method: 'GET', headers: signed.headers });
        if (s3Res.ok) {
          const buf = Buffer.from(await s3Res.arrayBuffer());
          fs.mkdirSync(path.join(this.localDir, safeFolder), { recursive: true });
          fs.writeFileSync(filePath, buf);
          res.setHeader('Content-Type', contentType);
          res.setHeader('Cache-Control', 'public, max-age=31536000');
          return res.send(buf);
        }
      } catch (e) {
        this.log.warn(`Error leyendo ${safeFolder}/${safeFile} desde S3: ${(e as Error).message}`);
      }
    }

    throw new NotFoundException('Imagen no encontrada');
  }

  @Get('cloudinary-signature')
  @UseGuards(JwtAuthGuard)
  cloudinarySignature() {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!cloudName || !apiKey || !apiSecret) {
      throw new ServiceUnavailableException('Usa /api/uploads/s3 para subir imágenes al bucket S3');
    }
    const timestamp = Math.floor(Date.now() / 1000);
    const folder = 'carpinteria/quotations';
    const signature = createHash('sha1')
      .update(`folder=${folder}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');
    return { cloudName, apiKey, timestamp, signature, folder };
  }
}
