import { supabase } from '../config/database.js';
import {
  IdentidadeVisual,
  Logo,
  PaletaCor,
  FonteTipografica,
  TemplateArquivo,
  UpdateIdentidadeVisualDTO,
  CreateLogoDTO,
  CreatePaletaCorDTO,
  CreateFonteDTO,
  CreateTemplateDTO,
} from '../types/identidadeVisual.js';

export class IdentidadeVisualService {
  // Configuracao geral
  async buscarIdentidade(): Promise<IdentidadeVisual | null> {
    const { data, error } = await supabase
      .from('identidade_visual')
      .select(`
        *,
        atualizado_por:usuarios!identidade_visual_atualizado_por_id_fkey(id, nome, email, perfil)
      `)
      .single();

    if (error || !data) {
      return null;
    }

    return {
      ...data,
      atualizado_por: Array.isArray(data.atualizado_por)
        ? data.atualizado_por[0]
        : data.atualizado_por,
    } as IdentidadeVisual;
  }

  async atualizarIdentidade(dados: UpdateIdentidadeVisualDTO, usuarioId: string): Promise<IdentidadeVisual | null> {
    // Buscar o registro existente
    const identidade = await this.buscarIdentidade();

    if (!identidade) {
      // Criar se nao existir
      const { error } = await supabase
        .from('identidade_visual')
        .insert({
          ...dados,
          atualizado_por_id: usuarioId,
        });

      if (error) {
        throw new Error(`Erro ao criar identidade visual: ${error.message}`);
      }
    } else {
      // Atualizar existente
      const { error } = await supabase
        .from('identidade_visual')
        .update({
          ...dados,
          atualizado_por_id: usuarioId,
          data_atualizacao: new Date().toISOString(),
        })
        .eq('id', identidade.id);

      if (error) {
        throw new Error(`Erro ao atualizar identidade visual: ${error.message}`);
      }
    }

    return this.buscarIdentidade();
  }

  // Logos
  async listarLogos(): Promise<Logo[]> {
    const { data, error } = await supabase
      .from('logos')
      .select(`
        *,
        criado_por:usuarios!logos_criado_por_id_fkey(id, nome, email, perfil)
      `)
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    if (error) {
      throw new Error(`Erro ao listar logos: ${error.message}`);
    }

    return (data || []).map((item) => ({
      ...item,
      criado_por: Array.isArray(item.criado_por) ? item.criado_por[0] : item.criado_por,
    })) as Logo[];
  }

  async criarLogo(dados: CreateLogoDTO, usuarioId: string): Promise<Logo> {
    const { data, error } = await supabase
      .from('logos')
      .insert({
        ...dados,
        criado_por_id: usuarioId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar logo: ${error.message}`);
    }

    return data as Logo;
  }

  async excluirLogo(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('logos')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir logo: ${error.message}`);
    }

    return true;
  }

  // Paleta de Cores
  async listarCores(): Promise<PaletaCor[]> {
    const { data, error } = await supabase
      .from('paleta_cores')
      .select(`
        *,
        criado_por:usuarios!paleta_cores_criado_por_id_fkey(id, nome, email, perfil)
      `)
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    if (error) {
      throw new Error(`Erro ao listar cores: ${error.message}`);
    }

    return (data || []).map((item) => ({
      ...item,
      criado_por: Array.isArray(item.criado_por) ? item.criado_por[0] : item.criado_por,
    })) as PaletaCor[];
  }

  async criarCor(dados: CreatePaletaCorDTO, usuarioId: string): Promise<PaletaCor> {
    const { data, error } = await supabase
      .from('paleta_cores')
      .insert({
        ...dados,
        criado_por_id: usuarioId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar cor: ${error.message}`);
    }

    return data as PaletaCor;
  }

  async atualizarCor(id: string, dados: Partial<CreatePaletaCorDTO>): Promise<PaletaCor | null> {
    const { data, error } = await supabase
      .from('paleta_cores')
      .update(dados)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao atualizar cor: ${error.message}`);
    }

    return data as PaletaCor;
  }

  async excluirCor(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('paleta_cores')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir cor: ${error.message}`);
    }

    return true;
  }

  // Fontes
  async listarFontes(): Promise<FonteTipografica[]> {
    const { data, error } = await supabase
      .from('fontes_tipograficas')
      .select(`
        *,
        criado_por:usuarios!fontes_tipograficas_criado_por_id_fkey(id, nome, email, perfil)
      `)
      .eq('ativo', true)
      .order('ordem', { ascending: true });

    if (error) {
      throw new Error(`Erro ao listar fontes: ${error.message}`);
    }

    return (data || []).map((item) => ({
      ...item,
      criado_por: Array.isArray(item.criado_por) ? item.criado_por[0] : item.criado_por,
    })) as FonteTipografica[];
  }

  async criarFonte(dados: CreateFonteDTO, usuarioId: string): Promise<FonteTipografica> {
    const { data, error } = await supabase
      .from('fontes_tipograficas')
      .insert({
        ...dados,
        criado_por_id: usuarioId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar fonte: ${error.message}`);
    }

    return data as FonteTipografica;
  }

  async excluirFonte(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('fontes_tipograficas')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir fonte: ${error.message}`);
    }

    return true;
  }

  // Templates
  async listarTemplates(): Promise<TemplateArquivo[]> {
    const { data, error } = await supabase
      .from('templates_arquivos')
      .select(`
        *,
        criado_por:usuarios!templates_arquivos_criado_por_id_fkey(id, nome, email, perfil)
      `)
      .eq('ativo', true)
      .order('tipo', { ascending: true })
      .order('ordem', { ascending: true });

    if (error) {
      throw new Error(`Erro ao listar templates: ${error.message}`);
    }

    return (data || []).map((item) => ({
      ...item,
      criado_por: Array.isArray(item.criado_por) ? item.criado_por[0] : item.criado_por,
    })) as TemplateArquivo[];
  }

  async criarTemplate(dados: CreateTemplateDTO, usuarioId: string): Promise<TemplateArquivo> {
    const { data, error } = await supabase
      .from('templates_arquivos')
      .insert({
        ...dados,
        criado_por_id: usuarioId,
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Erro ao criar template: ${error.message}`);
    }

    return data as TemplateArquivo;
  }

  async registrarDownload(id: string): Promise<void> {
    const { error } = await supabase.rpc('increment_downloads', { template_id: id });

    // Se a funcao RPC nao existir, fazer manualmente
    if (error) {
      const { data: template } = await supabase
        .from('templates_arquivos')
        .select('downloads')
        .eq('id', id)
        .single();

      if (template) {
        await supabase
          .from('templates_arquivos')
          .update({ downloads: (template.downloads || 0) + 1 })
          .eq('id', id);
      }
    }
  }

  async excluirTemplate(id: string): Promise<boolean> {
    const { error } = await supabase
      .from('templates_arquivos')
      .update({ ativo: false })
      .eq('id', id);

    if (error) {
      throw new Error(`Erro ao excluir template: ${error.message}`);
    }

    return true;
  }

  // Buscar tudo de uma vez (para a pagina principal)
  async buscarTudo() {
    const [identidade, logos, cores, fontes, templates] = await Promise.all([
      this.buscarIdentidade(),
      this.listarLogos(),
      this.listarCores(),
      this.listarFontes(),
      this.listarTemplates(),
    ]);

    return {
      identidade,
      logos,
      cores,
      fontes,
      templates,
    };
  }
}

export const identidadeVisualService = new IdentidadeVisualService();
