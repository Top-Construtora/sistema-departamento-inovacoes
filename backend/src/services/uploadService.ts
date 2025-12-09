import { supabase } from '../config/database.js';
import { v4 as uuidv4 } from 'uuid';

const BUCKET_NAME = 'identidade-visual';

export const uploadService = {
  /**
   * Faz upload de um arquivo para o Supabase Storage
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    mimeType: string,
    folder: string = 'logos'
  ): Promise<string> {
    // Gera um nome unico para o arquivo
    const extension = fileName.split('.').pop() || 'png';
    const uniqueName = `${folder}/${uuidv4()}.${extension}`;

    // Faz o upload para o Supabase Storage
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .upload(uniqueName, fileBuffer, {
        contentType: mimeType,
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Erro no upload:', error);
      throw new Error(`Erro ao fazer upload: ${error.message}`);
    }

    // Retorna a URL publica do arquivo
    const { data: publicUrlData } = supabase.storage
      .from(BUCKET_NAME)
      .getPublicUrl(uniqueName);

    return publicUrlData.publicUrl;
  },

  /**
   * Remove um arquivo do Supabase Storage
   */
  async deleteFile(fileUrl: string): Promise<void> {
    // Extrai o path do arquivo da URL
    const bucketUrl = `${BUCKET_NAME}/`;
    const urlParts = fileUrl.split(bucketUrl);

    if (urlParts.length < 2) {
      console.warn('URL de arquivo invalida para exclusao:', fileUrl);
      return;
    }

    const filePath = urlParts[1];

    const { error } = await supabase.storage
      .from(BUCKET_NAME)
      .remove([filePath]);

    if (error) {
      console.error('Erro ao excluir arquivo:', error);
      throw new Error(`Erro ao excluir arquivo: ${error.message}`);
    }
  },

  /**
   * Lista arquivos de uma pasta
   */
  async listFiles(folder: string = 'logos'): Promise<string[]> {
    const { data, error } = await supabase.storage
      .from(BUCKET_NAME)
      .list(folder);

    if (error) {
      console.error('Erro ao listar arquivos:', error);
      throw new Error(`Erro ao listar arquivos: ${error.message}`);
    }

    return data.map((file) => {
      const { data: publicUrlData } = supabase.storage
        .from(BUCKET_NAME)
        .getPublicUrl(`${folder}/${file.name}`);
      return publicUrlData.publicUrl;
    });
  },
};
