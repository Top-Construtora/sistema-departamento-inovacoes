import { supabase } from '../config/database.js';
import {
  Nota,
  NotaComRelacoes,
  NotaAnexo,
  CreateNotaDTO,
  UpdateNotaDTO,
} from '../types/nota.js';

export class NotaService {
  async listar(offset = 0, limit = 100): Promise<NotaComRelacoes[]> {
    const { data: notas, error } = await supabase
      .from('notas')
      .select(`
        *,
        autor:usuarios(id, nome, email, perfil),
        anexos:nota_anexos(id, nome_arquivo, tipo_arquivo, tamanho_bytes, url, data_upload)
      `)
      .eq('ativo', true)
      .order('data_envio', { ascending: true })
      .range(offset, offset + limit - 1);

    if (error) {
      throw new Error(`Erro ao listar notas: ${error.message}`);
    }

    return (notas || []) as NotaComRelacoes[];
  }

  async buscarPorId(id: string): Promise<NotaComRelacoes | null> {
    const { data: nota, error } = await supabase
      .from('notas')
      .select(`
        *,
        autor:usuarios(id, nome, email, perfil),
        anexos:nota_anexos(id, nome_arquivo, tipo_arquivo, tamanho_bytes, url, data_upload)
      `)
      .eq('id', id)
      .single();

    if (error || !nota) {
      return null;
    }

    return nota as NotaComRelacoes;
  }

  async criar(data: CreateNotaDTO, autorId: string): Promise<NotaComRelacoes> {
    const { data: nota, error } = await supabase
      .from('notas')
      .insert({
        autor_id: autorId,
        conteudo: data.conteudo,
      })
      .select(`
        *,
        autor:usuarios(id, nome, email, perfil)
      `)
      .single();

    if (error) {
      throw new Error(`Erro ao criar nota: ${error.message}`);
    }

    return nota as NotaComRelacoes;
  }

  async atualizar(id: string, data: UpdateNotaDTO, autorId: string): Promise<NotaComRelacoes | null> {
    // Verificar se e o autor da nota
    const notaExistente = await this.buscarPorId(id);
    if (!notaExistente) {
      return null;
    }

    if (notaExistente.autor_id !== autorId) {
      throw new Error('Apenas o autor pode editar a nota');
    }

    const { error } = await supabase
      .from('notas')
      .update({
        conteudo: data.conteudo,
        editada: true,
      })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao atualizar nota: ${error.message}`);
    }

    return this.buscarPorId(id);
  }

  async excluir(id: string, autorId: string): Promise<boolean> {
    // Verificar se e o autor da nota
    const notaExistente = await this.buscarPorId(id);
    if (!notaExistente) {
      return false;
    }

    if (notaExistente.autor_id !== autorId) {
      throw new Error('Apenas o autor pode excluir a nota');
    }

    const { error } = await supabase
      .from('notas')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir nota: ${error.message}`);
    }

    return true;
  }

  async adicionarAnexo(notaId: string, arquivo: { nome: string; tipo: string; tamanho: number; url: string }): Promise<NotaAnexo> {
    const { data: anexo, error } = await supabase
      .from('nota_anexos')
      .insert({
        nota_id: notaId,
        nome_arquivo: arquivo.nome,
        tipo_arquivo: arquivo.tipo,
        tamanho_bytes: arquivo.tamanho,
        url: arquivo.url,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao adicionar anexo: ${error.message}`);
    }

    return anexo as NotaAnexo;
  }
}

export const notaService = new NotaService();
