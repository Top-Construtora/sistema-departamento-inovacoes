import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FolderKanban, Users, Calendar } from 'lucide-react';
import { Projeto, StatusProjeto } from '../../types';
import { projetoService } from '../../services';
import styles from './styles.module.css';

const statusLabels: Record<StatusProjeto, string> = {
  IDEIA: 'Ideia',
  EM_ANALISE: 'Em Analise',
  EM_DESENVOLVIMENTO: 'Em Desenvolvimento',
  EM_TESTES: 'Em Testes',
  EM_PRODUCAO: 'Em Producao',
  ARQUIVADO: 'Arquivado',
};

const statusColors: Record<StatusProjeto, string> = {
  IDEIA: '#6b7280',
  EM_ANALISE: '#8b5cf6',
  EM_DESENVOLVIMENTO: '#3b82f6',
  EM_TESTES: '#f59e0b',
  EM_PRODUCAO: '#22c55e',
  ARQUIVADO: '#374151',
};

export function Projetos() {
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadProjetos();
  }, []);

  async function loadProjetos() {
    try {
      const data = await projetoService.listar();
      setProjetos(data);
    } catch (error) {
      console.error('Erro ao carregar projetos:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className={styles.loading}>Carregando...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Projetos</h1>
        <p className={styles.subtitle}>{projetos.length} projetos ativos</p>
      </div>

      <div className={styles.grid}>
        {projetos.map((projeto) => (
          <div
            key={projeto.id}
            className={styles.card}
            onClick={() => navigate(`/projetos/${projeto.id}`)}
          >
            <div className={styles.cardHeader}>
              <div className={styles.cardIcon}>
                <FolderKanban size={20} />
              </div>
              <span
                className={styles.cardStatus}
                style={{ background: statusColors[projeto.status] }}
              >
                {statusLabels[projeto.status]}
              </span>
            </div>

            <h3 className={styles.cardTitle}>{projeto.nome}</h3>

            {projeto.descricao && (
              <p className={styles.cardDescricao}>
                {projeto.descricao.substring(0, 100)}
                {projeto.descricao.length > 100 ? '...' : ''}
              </p>
            )}

            <div className={styles.cardMeta}>
              {projeto.lider && (
                <div className={styles.cardMetaItem}>
                  <Users size={14} />
                  <span>{projeto.lider.nome}</span>
                </div>
              )}

              {projeto.data_inicio && (
                <div className={styles.cardMetaItem}>
                  <Calendar size={14} />
                  <span>{new Date(projeto.data_inicio).toLocaleDateString('pt-BR')}</span>
                </div>
              )}
            </div>

            {projeto.tags && projeto.tags.length > 0 && (
              <div className={styles.cardTags}>
                {projeto.tags.slice(0, 3).map((tag) => (
                  <span key={tag} className={styles.tag}>{tag}</span>
                ))}
                {projeto.tags.length > 3 && (
                  <span className={styles.tagMore}>+{projeto.tags.length - 3}</span>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
