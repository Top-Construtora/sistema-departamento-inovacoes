import { useState, useEffect, useMemo, FormEvent } from 'react';
import {
  Palette,
  Image,
  Type,
  FileText,
  Download,
  Plus,
  Copy,
  Check,
  Trash2,
  ExternalLink,
} from 'lucide-react';
import { Button, Input, Select, Modal } from '../../components/ui';
import type {
  IdentidadeVisualCompleta,
  TemplateArquivo,
  CreateLogoDTO,
  CreateCorDTO,
  CreateFonteDTO,
  CreateTemplateDTO,
} from '../../types';
import {
  TipoLogo,
  UsoFonte,
  TipoTemplate,
} from '../../types';
import { identidadeVisualService } from '../../services';
import styles from './styles.module.css';

const tipoLogoLabels: Record<TipoLogo, string> = {
  PRINCIPAL: 'Principal',
  HORIZONTAL: 'Horizontal',
  VERTICAL: 'Vertical',
  ICONE: 'Icone',
  MONOCROMATICO: 'Monocromatico',
  PB: 'Preto e Branco',
  NEGATIVO: 'Negativo',
  SIMPLIFICADO: 'Simplificado',
};

const usoFonteLabels: Record<UsoFonte, string> = {
  TITULO: 'Titulo',
  SUBTITULO: 'Subtitulo',
  CORPO: 'Corpo',
  DESTAQUE: 'Destaque',
  CODIGO: 'Codigo',
  DECORATIVO: 'Decorativo',
};

const tipoTemplateLabels: Record<TipoTemplate, string> = {
  SLIDE: 'Slide/Apresentacao',
  DOCUMENTO: 'Documento',
  ASSINATURA_EMAIL: 'Assinatura de Email',
  PAPEL_TIMBRADO: 'Papel Timbrado',
  CARTAO_VISITA: 'Cartao de Visita',
  BANNER: 'Banner',
  POST_SOCIAL: 'Post para Redes Sociais',
  RELATORIO: 'Relatorio',
  OUTRO: 'Outro',
};

export function IdentidadeVisual() {
  const [dados, setDados] = useState<IdentidadeVisualCompleta | null>(null);
  const [loading, setLoading] = useState(true);
  const [copiadoCor, setCopiadoCor] = useState<string | null>(null);

  // Modal states
  const [modalLogo, setModalLogo] = useState(false);
  const [modalCor, setModalCor] = useState(false);
  const [modalFonte, setModalFonte] = useState(false);
  const [modalTemplate, setModalTemplate] = useState(false);

  // Form states
  const [formLogo, setFormLogo] = useState<CreateLogoDTO>({
    nome: '',
    tipo: TipoLogo.PRINCIPAL,
    arquivo_url: '',
  });
  const [formCor, setFormCor] = useState<CreateCorDTO>({
    nome: '',
    codigo_hex: '#000000',
  });
  const [formFonte, setFormFonte] = useState<CreateFonteDTO>({
    nome: '',
    uso: UsoFonte.CORPO,
  });
  const [formTemplate, setFormTemplate] = useState<CreateTemplateDTO>({
    nome: '',
    tipo: TipoTemplate.DOCUMENTO,
    arquivo_url: '',
  });
  const [formLoading, setFormLoading] = useState(false);

  useEffect(() => {
    loadDados();
  }, []);

  async function loadDados() {
    try {
      setLoading(true);
      const data = await identidadeVisualService.buscarTudo();
      setDados(data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }

  // Estatisticas
  const stats = useMemo(() => {
    return {
      logos: dados?.logos.length || 0,
      cores: dados?.cores.length || 0,
      fontes: dados?.fontes.length || 0,
      templates: dados?.templates.length || 0,
    };
  }, [dados]);

  // Agrupar templates por tipo
  const templatesPorTipo = useMemo(() => {
    return (dados?.templates || []).reduce((acc, t) => {
      if (!acc[t.tipo]) acc[t.tipo] = [];
      acc[t.tipo].push(t);
      return acc;
    }, {} as Record<TipoTemplate, TemplateArquivo[]>);
  }, [dados?.templates]);

  async function handleCopiarCor(codigo: string) {
    await navigator.clipboard.writeText(codigo);
    setCopiadoCor(codigo);
    setTimeout(() => setCopiadoCor(null), 2000);
  }

  async function handleDownloadTemplate(template: TemplateArquivo) {
    try {
      await identidadeVisualService.registrarDownload(template.id);
      window.open(template.arquivo_url, '_blank');
    } catch (error) {
      console.error('Erro ao registrar download:', error);
      window.open(template.arquivo_url, '_blank');
    }
  }

  // Submit handlers
  async function handleSubmitLogo(e: FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    try {
      await identidadeVisualService.criarLogo(formLogo);
      setModalLogo(false);
      setFormLogo({ nome: '', tipo: TipoLogo.PRINCIPAL, arquivo_url: '' });
      loadDados();
    } catch (error) {
      console.error('Erro ao criar logo:', error);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleSubmitCor(e: FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    try {
      await identidadeVisualService.criarCor(formCor);
      setModalCor(false);
      setFormCor({ nome: '', codigo_hex: '#000000' });
      loadDados();
    } catch (error) {
      console.error('Erro ao criar cor:', error);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleSubmitFonte(e: FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    try {
      await identidadeVisualService.criarFonte(formFonte);
      setModalFonte(false);
      setFormFonte({ nome: '', uso: UsoFonte.CORPO });
      loadDados();
    } catch (error) {
      console.error('Erro ao criar fonte:', error);
    } finally {
      setFormLoading(false);
    }
  }

  async function handleSubmitTemplate(e: FormEvent) {
    e.preventDefault();
    setFormLoading(true);
    try {
      await identidadeVisualService.criarTemplate(formTemplate);
      setModalTemplate(false);
      setFormTemplate({ nome: '', tipo: TipoTemplate.DOCUMENTO, arquivo_url: '' });
      loadDados();
    } catch (error) {
      console.error('Erro ao criar template:', error);
    } finally {
      setFormLoading(false);
    }
  }

  // Delete handlers
  async function handleExcluirLogo(id: string) {
    if (!confirm('Excluir este logo?')) return;
    try {
      await identidadeVisualService.excluirLogo(id);
      loadDados();
    } catch (error) {
      console.error('Erro ao excluir logo:', error);
    }
  }

  async function handleExcluirCor(id: string) {
    if (!confirm('Excluir esta cor?')) return;
    try {
      await identidadeVisualService.excluirCor(id);
      loadDados();
    } catch (error) {
      console.error('Erro ao excluir cor:', error);
    }
  }

  async function handleExcluirFonte(id: string) {
    if (!confirm('Excluir esta fonte?')) return;
    try {
      await identidadeVisualService.excluirFonte(id);
      loadDados();
    } catch (error) {
      console.error('Erro ao excluir fonte:', error);
    }
  }

  async function handleExcluirTemplate(id: string) {
    if (!confirm('Excluir este template?')) return;
    try {
      await identidadeVisualService.excluirTemplate(id);
      loadDados();
    } catch (error) {
      console.error('Erro ao excluir template:', error);
    }
  }

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>
          <div className={styles.loadingSpinner} />
          <span className={styles.loadingText}>Carregando identidade visual...</span>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Identidade Visual</h1>
            <p className={styles.subtitle}>
              Marca, cores, fontes e templates do departamento
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} ${styles.statCardLogos}`}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Image size={20} />
              </div>
            </div>
            <span className={styles.statValue}>{stats.logos}</span>
            <span className={styles.statLabel}>Logos</span>
          </div>

          <div className={`${styles.statCard} ${styles.statCardCores}`}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Palette size={20} />
              </div>
            </div>
            <span className={styles.statValue}>{stats.cores}</span>
            <span className={styles.statLabel}>Cores</span>
          </div>

          <div className={`${styles.statCard} ${styles.statCardFontes}`}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <Type size={20} />
              </div>
            </div>
            <span className={styles.statValue}>{stats.fontes}</span>
            <span className={styles.statLabel}>Fontes</span>
          </div>

          <div className={`${styles.statCard} ${styles.statCardTemplates}`}>
            <div className={styles.statHeader}>
              <div className={styles.statIcon}>
                <FileText size={20} />
              </div>
            </div>
            <span className={styles.statValue}>{stats.templates}</span>
            <span className={styles.statLabel}>Templates</span>
          </div>
        </div>
      </div>

      {/* Logos */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <Image size={24} />
            <h2>Logos</h2>
            <span className={styles.sectionCount}>{stats.logos}</span>
          </div>
          <Button size="sm" onClick={() => setModalLogo(true)}>
            <Plus size={16} />
            Adicionar
          </Button>
        </div>

        {dados?.logos.length === 0 ? (
          <div className={styles.empty}>
            <Image size={32} />
            <p>Nenhum logo cadastrado</p>
          </div>
        ) : (
          <div className={styles.logosGrid}>
            {dados?.logos.map((logo) => (
              <div key={logo.id} className={styles.logoCard}>
                <div className={styles.logoPreview}>
                  <img src={logo.arquivo_url} alt={logo.nome} />
                </div>
                <div className={styles.logoInfo}>
                  <span className={styles.logoNome}>{logo.nome}</span>
                  <span className={styles.logoTipo}>{tipoLogoLabels[logo.tipo]}</span>
                </div>
                <div className={styles.logoActions}>
                  <a href={logo.arquivo_url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink size={16} />
                  </a>
                  <button onClick={() => handleExcluirLogo(logo.id)}>
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Paleta de Cores */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <Palette size={24} />
            <h2>Paleta de Cores</h2>
            <span className={styles.sectionCount}>{stats.cores}</span>
          </div>
          <Button size="sm" onClick={() => setModalCor(true)}>
            <Plus size={16} />
            Adicionar
          </Button>
        </div>

        {dados?.cores.length === 0 ? (
          <div className={styles.empty}>
            <Palette size={32} />
            <p>Nenhuma cor cadastrada</p>
          </div>
        ) : (
          <div className={styles.coresGrid}>
            {dados?.cores.map((cor) => (
              <div key={cor.id} className={styles.corCard}>
                <div
                  className={styles.corPreview}
                  style={{ background: cor.codigo_hex }}
                />
                <div className={styles.corInfo}>
                  <span className={styles.corNome}>{cor.nome}</span>
                  <div className={styles.corCodigos}>
                    <button
                      className={styles.corCodigo}
                      onClick={() => handleCopiarCor(cor.codigo_hex)}
                    >
                      <code>{cor.codigo_hex}</code>
                      {copiadoCor === cor.codigo_hex ? (
                        <Check size={14} />
                      ) : (
                        <Copy size={14} />
                      )}
                    </button>
                  </div>
                  {cor.descricao && (
                    <span className={styles.corDescricao}>{cor.descricao}</span>
                  )}
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleExcluirCor(cor.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Fontes */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <Type size={24} />
            <h2>Fontes Tipograficas</h2>
            <span className={styles.sectionCount}>{stats.fontes}</span>
          </div>
          <Button size="sm" onClick={() => setModalFonte(true)}>
            <Plus size={16} />
            Adicionar
          </Button>
        </div>

        {dados?.fontes.length === 0 ? (
          <div className={styles.empty}>
            <Type size={32} />
            <p>Nenhuma fonte cadastrada</p>
          </div>
        ) : (
          <div className={styles.fontesGrid}>
            {dados?.fontes.map((fonte) => (
              <div key={fonte.id} className={styles.fonteCard}>
                <div className={styles.fonteHeader}>
                  <span className={styles.fonteNome}>{fonte.nome}</span>
                  <span className={styles.fonteUso}>{usoFonteLabels[fonte.uso]}</span>
                </div>
                <div
                  className={styles.fonteExemplo}
                  style={{ fontFamily: fonte.fonte_google || fonte.familia || 'inherit' }}
                >
                  {fonte.exemplo || 'Aa Bb Cc 123'}
                </div>
                {fonte.fonte_google && (
                  <a
                    href={`https://fonts.google.com/specimen/${fonte.fonte_google.replace(' ', '+')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.fonteLink}
                  >
                    Google Fonts
                    <ExternalLink size={12} />
                  </a>
                )}
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleExcluirFonte(fonte.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Templates */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitle}>
            <FileText size={24} />
            <h2>Templates</h2>
            <span className={styles.sectionCount}>{stats.templates}</span>
          </div>
          <Button size="sm" onClick={() => setModalTemplate(true)}>
            <Plus size={16} />
            Adicionar
          </Button>
        </div>

        {dados?.templates.length === 0 ? (
          <div className={styles.empty}>
            <FileText size={32} />
            <p>Nenhum template cadastrado</p>
          </div>
        ) : (
          <div className={styles.templatesContainer}>
            {Object.entries(templatesPorTipo).map(([tipo, templates]) => (
              <div key={tipo} className={styles.templateGrupo}>
                <h3>{tipoTemplateLabels[tipo as TipoTemplate]}</h3>
                <div className={styles.templatesGrid}>
                  {templates.map((template) => (
                    <div key={template.id} className={styles.templateCard}>
                      {template.preview_url ? (
                        <div className={styles.templatePreview}>
                          <img src={template.preview_url} alt={template.nome} />
                        </div>
                      ) : (
                        <div className={styles.templatePreview}>
                          <div className={styles.templatePlaceholder}>
                            <FileText size={32} />
                            <span>Sem preview</span>
                          </div>
                        </div>
                      )}
                      <div className={styles.templateInfo}>
                        <span className={styles.templateNome}>{template.nome}</span>
                        {template.descricao && (
                          <span className={styles.templateDescricao}>
                            {template.descricao}
                          </span>
                        )}
                        <span className={styles.templateDownloads}>
                          <Download size={12} />
                          {template.downloads} downloads
                        </span>
                      </div>
                      <div className={styles.templateActions}>
                        <Button
                          size="sm"
                          onClick={() => handleDownloadTemplate(template)}
                        >
                          <Download size={16} />
                          Baixar
                        </Button>
                        <button
                          className={styles.deleteBtn}
                          onClick={() => handleExcluirTemplate(template.id)}
                          style={{ position: 'relative', opacity: 1 }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Modal Logo */}
      <Modal isOpen={modalLogo} onClose={() => setModalLogo(false)} title="Novo Logo">
        <form onSubmit={handleSubmitLogo} className={styles.form}>
          <Input
            label="Nome"
            value={formLogo.nome}
            onChange={(e) => setFormLogo({ ...formLogo, nome: e.target.value })}
            required
          />
          <Select
            label="Tipo"
            value={formLogo.tipo}
            onChange={(e) => setFormLogo({ ...formLogo, tipo: e.target.value as TipoLogo })}
            options={Object.entries(tipoLogoLabels).map(([v, l]) => ({ value: v, label: l }))}
          />
          <Input
            label="URL do Arquivo"
            value={formLogo.arquivo_url}
            onChange={(e) => setFormLogo({ ...formLogo, arquivo_url: e.target.value })}
            placeholder="https://..."
            required
          />
          <Input
            label="Descricao"
            value={formLogo.descricao || ''}
            onChange={(e) => setFormLogo({ ...formLogo, descricao: e.target.value })}
          />
          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => setModalLogo(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={formLoading}>Adicionar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Cor */}
      <Modal isOpen={modalCor} onClose={() => setModalCor(false)} title="Nova Cor">
        <form onSubmit={handleSubmitCor} className={styles.form}>
          <Input
            label="Nome"
            value={formCor.nome}
            onChange={(e) => setFormCor({ ...formCor, nome: e.target.value })}
            placeholder="Ex: Azul Primario"
            required
          />
          <div className={styles.colorInputWrapper}>
            <label>Cor</label>
            <div className={styles.colorInput}>
              <input
                type="color"
                value={formCor.codigo_hex}
                onChange={(e) => setFormCor({ ...formCor, codigo_hex: e.target.value })}
              />
              <input
                type="text"
                value={formCor.codigo_hex}
                onChange={(e) => setFormCor({ ...formCor, codigo_hex: e.target.value })}
                pattern="^#[0-9A-Fa-f]{6}$"
              />
            </div>
          </div>
          <Input
            label="Categoria"
            value={formCor.categoria || ''}
            onChange={(e) => setFormCor({ ...formCor, categoria: e.target.value })}
            placeholder="Ex: Primaria, Secundaria, Neutra..."
          />
          <Input
            label="Descricao"
            value={formCor.descricao || ''}
            onChange={(e) => setFormCor({ ...formCor, descricao: e.target.value })}
          />
          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => setModalCor(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={formLoading}>Adicionar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Fonte */}
      <Modal isOpen={modalFonte} onClose={() => setModalFonte(false)} title="Nova Fonte">
        <form onSubmit={handleSubmitFonte} className={styles.form}>
          <Input
            label="Nome"
            value={formFonte.nome}
            onChange={(e) => setFormFonte({ ...formFonte, nome: e.target.value })}
            placeholder="Ex: Inter"
            required
          />
          <Select
            label="Uso"
            value={formFonte.uso}
            onChange={(e) => setFormFonte({ ...formFonte, uso: e.target.value as UsoFonte })}
            options={Object.entries(usoFonteLabels).map(([v, l]) => ({ value: v, label: l }))}
          />
          <Input
            label="Familia"
            value={formFonte.familia || ''}
            onChange={(e) => setFormFonte({ ...formFonte, familia: e.target.value })}
            placeholder="Ex: sans-serif"
          />
          <Input
            label="Google Fonts"
            value={formFonte.fonte_google || ''}
            onChange={(e) => setFormFonte({ ...formFonte, fonte_google: e.target.value })}
            placeholder="Nome exato no Google Fonts"
          />
          <Input
            label="Descricao"
            value={formFonte.descricao || ''}
            onChange={(e) => setFormFonte({ ...formFonte, descricao: e.target.value })}
          />
          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => setModalFonte(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={formLoading}>Adicionar</Button>
          </div>
        </form>
      </Modal>

      {/* Modal Template */}
      <Modal isOpen={modalTemplate} onClose={() => setModalTemplate(false)} title="Novo Template">
        <form onSubmit={handleSubmitTemplate} className={styles.form}>
          <Input
            label="Nome"
            value={formTemplate.nome}
            onChange={(e) => setFormTemplate({ ...formTemplate, nome: e.target.value })}
            required
          />
          <Select
            label="Tipo"
            value={formTemplate.tipo}
            onChange={(e) => setFormTemplate({ ...formTemplate, tipo: e.target.value as TipoTemplate })}
            options={Object.entries(tipoTemplateLabels).map(([v, l]) => ({ value: v, label: l }))}
          />
          <Input
            label="URL do Arquivo"
            value={formTemplate.arquivo_url}
            onChange={(e) => setFormTemplate({ ...formTemplate, arquivo_url: e.target.value })}
            placeholder="https://..."
            required
          />
          <Input
            label="URL da Preview (opcional)"
            value={formTemplate.preview_url || ''}
            onChange={(e) => setFormTemplate({ ...formTemplate, preview_url: e.target.value })}
            placeholder="Imagem de preview..."
          />
          <Input
            label="Descricao"
            value={formTemplate.descricao || ''}
            onChange={(e) => setFormTemplate({ ...formTemplate, descricao: e.target.value })}
          />
          <div className={styles.formActions}>
            <Button type="button" variant="ghost" onClick={() => setModalTemplate(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={formLoading}>Adicionar</Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
