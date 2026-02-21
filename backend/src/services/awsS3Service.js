const { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const fs = require('fs');
const path = require('path');

class AWSS3Service {
  constructor() {
    this.s3Client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1',
      credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      },
    });
    
    this.bucketName = process.env.AWS_S3_BUCKET_NAME;
    this.bucketRegion = process.env.AWS_REGION || 'us-east-1';
  }

  // Subir archivo a S3
  async uploadFile(filePath, fileName, folder = 'invoices') {
    try {
      // Leer el archivo
      const fileContent = fs.readFileSync(filePath);
      
      // Crear key única para el archivo
      const key = `${folder}/${Date.now()}-${fileName}`;
      
      // Configurar comando de subida
      const uploadCommand = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: fileContent,
        ContentType: 'application/pdf',
        // ACL removido porque el bucket no permite ACLs
      });

      // Subir archivo
      await this.s3Client.send(uploadCommand);
      
      // Generar presigned URL para acceso temporal
      const getObjectCommand = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });
      
      const presignedUrl = await getSignedUrl(this.s3Client, getObjectCommand, { expiresIn: 3600 }); // 1 hora
      
      console.log(`✅ Archivo subido a S3 con presigned URL: ${presignedUrl}`);
      
      return {
        success: true,
        url: presignedUrl,
        key: key
      };
      
    } catch (error) {
      console.error('❌ Error subiendo archivo a S3:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Eliminar archivo de S3
  async deleteFile(key) {
    try {
      const deleteCommand = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3Client.send(deleteCommand);
      console.log(`✅ Archivo eliminado de S3: ${key}`);
      
      return { success: true };
      
    } catch (error) {
      console.error('❌ Error eliminando archivo de S3:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // Verificar configuración
  isConfigured() {
    return !!(this.bucketName && process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY);
  }

  // Obtener configuración
  getConfig() {
    return {
      bucketName: this.bucketName,
      bucketRegion: this.bucketRegion,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID ? '✅ Configurado' : '❌ No configurado',
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY ? '✅ Configurado' : '❌ No configurado',
      bucket: this.bucketName ? '✅ Configurado' : '❌ No configurado'
    };
  }
}

module.exports = new AWSS3Service();
