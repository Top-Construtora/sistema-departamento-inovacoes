import { useEffect, useState, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  ArrowRight,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
  AlertCircle,
  CircleDot,
  Calendar,
  FolderKanban,
  Plus,
  Zap,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { demandaService, projetoService } from '../../services';
import { Demanda, StatusDemanda, PrioridadeDemanda, Projeto } from '../../types';
import styles from './styles.module.css';

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  description: string;
}

const statusLabels: Record<StatusDemanda, string> = {
  A_FAZER: 'A Fazer',
  EM_ANDAMENTO: 'Em Andamento',
  EM_VALIDACAO: 'Em Validação',
  CONCLUIDA: 'Concluída',
};

const prioridadeLabels: Record<PrioridadeDemanda, string> = {
  BAIXA: 'Baixa',
  MEDIA: 'Média',
  ALTA: 'Alta',
  CRITICA: 'Crítica',
};

export function Home() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSlide, setCurrentSlide] = useState(0);
  const [demandas, setDemandas] = useState<Demanda[]>([]);
  const [loadingDemandas, setLoadingDemandas] = useState(true);
  const [projetos, setProjetos] = useState<Projeto[]>([]);
  const [loadingProjetos, setLoadingProjetos] = useState(true);

  const carouselSlides: CarouselSlide[] = [
    {
      id: 1,
      image: '/images/carousel/slide1.png',
      title: 'Inovação e Tecnologia',
      description: 'Transformando ideias em soluções digitais',
    },
    {
      id: 2,
      image: '/images/carousel/slide2.png',
      title: 'Gestão de Projetos',
      description: 'Acompanhe o progresso de todas as iniciativas',
    },
    {
      id: 3,
      image: '/images/carousel/slide3.png',
      title: 'Suporte Integrado',
      description: 'Atendimento rápido e eficiente para sua equipe',
    },
  ];

  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % carouselSlides.length);
  }, [carouselSlides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + carouselSlides.length) % carouselSlides.length);
  }, [carouselSlides.length]);

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  // Auto-play do carrossel
  useEffect(() => {
    const interval = setInterval(nextSlide, 5000);
    return () => clearInterval(interval);
  }, [nextSlide]);

  // Carregar demandas do usuário
  useEffect(() => {
    async function loadDemandas() {
      if (!usuario) return;
      try {
        setLoadingDemandas(true);
        const data = await demandaService.listar({ responsavel_id: usuario.id });
        setDemandas(data);
      } catch (error) {
        console.error('Erro ao carregar demandas:', error);
      } finally {
        setLoadingDemandas(false);
      }
    }
    loadDemandas();
  }, [usuario]);

  // Carregar projetos recentes
  useEffect(() => {
    async function loadProjetos() {
      try {
        setLoadingProjetos(true);
        const data = await projetoService.listar();
        setProjetos(data.slice(0, 2));
      } catch (error) {
        console.error('Erro ao carregar projetos:', error);
      } finally {
        setLoadingProjetos(false);
      }
    }
    loadProjetos();
  }, []);

  // Estatísticas das demandas
  const stats = useMemo(() => {
    const aFazer = demandas.filter(d => d.status === 'A_FAZER').length;
    const emAndamento = demandas.filter(d => d.status === 'EM_ANDAMENTO').length;
    const emValidacao = demandas.filter(d => d.status === 'EM_VALIDACAO').length;
    const concluidas = demandas.filter(d => d.status === 'CONCLUIDA').length;
    return { aFazer, emAndamento, emValidacao, concluidas, total: demandas.length };
  }, [demandas]);

  // Demandas recentes (não concluídas, ordenadas por prazo)
  const demandasRecentes = useMemo(() => {
    return demandas
      .filter(d => d.status !== 'CONCLUIDA')
      .sort((a, b) => {
        if (a.prazo && b.prazo) {
          return new Date(a.prazo).getTime() - new Date(b.prazo).getTime();
        }
        if (a.prazo) return -1;
        if (b.prazo) return 1;
        return new Date(b.data_criacao).getTime() - new Date(a.data_criacao).getTime();
      })
      .slice(0, 2);
  }, [demandas]);

  // Próximos prazos (para o calendário)
  const proximosPrazos = useMemo(() => {
    return demandas
      .filter(d => d.prazo && d.status !== 'CONCLUIDA')
      .sort((a, b) => new Date(a.prazo!).getTime() - new Date(b.prazo!).getTime())
      .slice(0, 4);
  }, [demandas]);

  // Gerar dias do calendário do mês atual
  const calendarData = useMemo(() => {
    const hoje = new Date();
    const ano = hoje.getFullYear();
    const mes = hoje.getMonth();

    const primeiroDia = new Date(ano, mes, 1);
    const ultimoDia = new Date(ano, mes + 1, 0);

    const diasDoMes: { dia: number; mesAtual: boolean; isHoje: boolean; temEvento: boolean }[] = [];

    // Dias do mês anterior para preencher a primeira semana
    const diaDaSemana = primeiroDia.getDay();
    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
    for (let i = diaDaSemana - 1; i >= 0; i--) {
      diasDoMes.push({
        dia: ultimoDiaMesAnterior - i,
        mesAtual: false,
        isHoje: false,
        temEvento: false,
      });
    }

    // Dias do mês atual - verificar se o prazo é realmente neste mês/ano
    const prazosDoMes = demandas
      .filter(d => {
        if (!d.prazo || d.status === 'CONCLUIDA') return false;
        const prazoDate = new Date(d.prazo);
        return prazoDate.getMonth() === mes && prazoDate.getFullYear() === ano;
      })
      .map(d => new Date(d.prazo!).getDate());

    for (let dia = 1; dia <= ultimoDia.getDate(); dia++) {
      diasDoMes.push({
        dia,
        mesAtual: true,
        isHoje: dia === hoje.getDate(),
        temEvento: prazosDoMes.includes(dia),
      });
    }

    // Dias do próximo mês para completar
    const diasRestantes = 42 - diasDoMes.length;
    for (let i = 1; i <= diasRestantes; i++) {
      diasDoMes.push({
        dia: i,
        mesAtual: false,
        isHoje: false,
        temEvento: false,
      });
    }

    return {
      dias: diasDoMes,
      mesNome: hoje.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' }),
    };
  }, [demandas]);

  function getEventPriority(prazo: string): 'urgent' | 'warning' | 'normal' {
    const prazoDate = new Date(prazo);
    const hoje = new Date();
    const diffDays = Math.ceil((prazoDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'urgent';
    if (diffDays <= 3) return 'warning';
    return 'normal';
  }

  function isPrazoAtrasado(prazo: string): boolean {
    return new Date(prazo) < new Date();
  }

  function isPrazoProximo(prazo: string): boolean {
    const prazoDate = new Date(prazo);
    const hoje = new Date();
    const diffDays = Math.ceil((prazoDate.getTime() - hoje.getTime()) / (1000 * 60 * 60 * 24));
    return diffDays >= 0 && diffDays <= 3;
  }

  function getStatusIcon(status: StatusDemanda) {
    switch (status) {
      case 'A_FAZER':
        return <CircleDot size={14} />;
      case 'EM_ANDAMENTO':
        return <Clock size={14} />;
      case 'EM_VALIDACAO':
        return <AlertCircle size={14} />;
      case 'CONCLUIDA':
        return <CheckCircle2 size={14} />;
      default:
        return <CircleDot size={14} />;
    }
  }

  function getGreeting(): string {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  function getFirstName(): string {
    return usuario?.nome?.split(' ')[0] || 'Usuário';
  }

  return (
    <div className={styles.container}>
      {/* Carousel Hero Section */}
      <section className={styles.carouselSection}>
        <div className={styles.carousel}>
          <div
            className={styles.carouselTrack}
            style={{ transform: `translateX(-${currentSlide * 100}%)` }}
          >
            {carouselSlides.map((slide) => (
              <div key={slide.id} className={styles.carouselSlide}>
                <img
                  src={slide.image}
                  alt={slide.title}
                  className={styles.carouselImage}
                />
                <div className={styles.carouselOverlay}>
                  <div className={styles.carouselContent}>
                    <div className={styles.greeting}>
                      <Sparkles className={styles.greetingIcon} size={20} />
                      <span>{getGreeting()}, {getFirstName()}!</span>
                    </div>
                    <h2 className={styles.carouselTitle}>{slide.title}</h2>
                    <p className={styles.carouselDescription}>{slide.description}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Navigation Arrows */}
          <button
            className={`${styles.carouselArrow} ${styles.carouselArrowLeft}`}
            onClick={prevSlide}
            aria-label="Slide anterior"
          >
            <ChevronLeft size={24} />
          </button>
          <button
            className={`${styles.carouselArrow} ${styles.carouselArrowRight}`}
            onClick={nextSlide}
            aria-label="Próximo slide"
          >
            <ChevronRight size={24} />
          </button>

          {/* Indicators */}
          <div className={styles.carouselIndicators}>
            {carouselSlides.map((_, index) => (
              <button
                key={index}
                className={`${styles.carouselIndicator} ${index === currentSlide ? styles.active : ''}`}
                onClick={() => goToSlide(index)}
                aria-label={`Ir para slide ${index + 1}`}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Content Grid - Two Columns */}
      <div className={styles.contentGrid}>
        {/* Main Column - Demandas */}
        <div className={styles.mainColumn}>
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <FileText size={20} className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Minhas Demandas</h2>
              </div>
              <button className={styles.viewAllButton} onClick={() => navigate('/demandas')}>
                Ver todas
                <ArrowRight size={14} />
              </button>
            </div>

            {/* Barra de Progresso */}
            <div className={styles.progressSection}>
              <div className={styles.progressBar}>
                {stats.total > 0 ? (
                  <>
                    {stats.aFazer > 0 && (
                      <div
                        className={styles.progressSegment}
                        style={{
                          width: `${(stats.aFazer / stats.total) * 100}%`,
                          background: '#6b7280',
                        }}
                        title={`A Fazer: ${stats.aFazer}`}
                      />
                    )}
                    {stats.emAndamento > 0 && (
                      <div
                        className={styles.progressSegment}
                        style={{
                          width: `${(stats.emAndamento / stats.total) * 100}%`,
                          background: '#3b82f6',
                        }}
                        title={`Em Andamento: ${stats.emAndamento}`}
                      />
                    )}
                    {stats.emValidacao > 0 && (
                      <div
                        className={styles.progressSegment}
                        style={{
                          width: `${(stats.emValidacao / stats.total) * 100}%`,
                          background: '#f59e0b',
                        }}
                        title={`Em Validação: ${stats.emValidacao}`}
                      />
                    )}
                    {stats.concluidas > 0 && (
                      <div
                        className={styles.progressSegment}
                        style={{
                          width: `${(stats.concluidas / stats.total) * 100}%`,
                          background: '#22c55e',
                        }}
                        title={`Concluídas: ${stats.concluidas}`}
                      />
                    )}
                  </>
                ) : (
                  <div className={styles.progressEmpty} />
                )}
              </div>
              <div className={styles.progressLegend}>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#6b7280' }} />
                  A Fazer ({stats.aFazer})
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#3b82f6' }} />
                  Em Andamento ({stats.emAndamento})
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#f59e0b' }} />
                  Em Validação ({stats.emValidacao})
                </span>
                <span className={styles.legendItem}>
                  <span className={styles.legendDot} style={{ background: '#22c55e' }} />
                  Concluídas ({stats.concluidas})
                </span>
              </div>
            </div>

            {/* Lista de Demandas */}
            {loadingDemandas ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner} />
                <span>Carregando demandas...</span>
              </div>
            ) : demandasRecentes.length === 0 ? (
              <div className={styles.emptyState}>
                <FileText size={32} className={styles.emptyIcon} />
                <p>Nenhuma demanda pendente</p>
              </div>
            ) : (
              <div className={styles.demandaList}>
                {demandasRecentes.map((demanda) => (
                  <button
                    key={demanda.id}
                    className={styles.demandaCard}
                    onClick={() => navigate('/demandas')}
                  >
                    <div className={styles.demandaMain}>
                      <div className={styles.demandaHeader}>
                        <span className={`${styles.demandaStatus} ${styles[`status${demanda.status}`]}`}>
                          {getStatusIcon(demanda.status)}
                          {statusLabels[demanda.status]}
                        </span>
                        <span className={`${styles.demandaPrioridade} ${styles[`prioridade${demanda.prioridade}`]}`}>
                          {prioridadeLabels[demanda.prioridade]}
                        </span>
                      </div>
                      <h4 className={styles.demandaTitulo}>{demanda.titulo}</h4>
                      {demanda.projeto && (
                        <span className={styles.demandaProjeto}>
                          <FolderKanban size={12} />
                          {demanda.projeto.nome}
                        </span>
                      )}
                    </div>
                    {demanda.prazo && (
                      <div
                        className={`${styles.demandaPrazo} ${
                          isPrazoAtrasado(demanda.prazo)
                            ? styles.prazoAtrasado
                            : isPrazoProximo(demanda.prazo)
                            ? styles.prazoProximo
                            : ''
                        }`}
                      >
                        <Calendar size={14} />
                        {new Date(demanda.prazo).toLocaleDateString('pt-BR')}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </section>

          {/* Projetos Recentes */}
          <section className={styles.section}>
            <div className={styles.sectionHeader}>
              <div className={styles.sectionTitleWrapper}>
                <FolderKanban size={20} className={styles.sectionIcon} />
                <h2 className={styles.sectionTitle}>Projetos Recentes</h2>
              </div>
              <button className={styles.viewAllButton} onClick={() => navigate('/projetos')}>
                Ver todos
                <ArrowRight size={14} />
              </button>
            </div>

            {loadingProjetos ? (
              <div className={styles.loadingContainer}>
                <div className={styles.loadingSpinner} />
                <span>Carregando projetos...</span>
              </div>
            ) : projetos.length === 0 ? (
              <div className={styles.emptyState}>
                <FolderKanban size={32} className={styles.emptyIcon} />
                <p>Nenhum projeto encontrado</p>
              </div>
            ) : (
              <div className={styles.projetosGrid}>
                {projetos.map((projeto) => (
                  <button
                    key={projeto.id}
                    className={styles.projetoCard}
                    onClick={() => navigate('/projetos')}
                  >
                    <div className={styles.projetoHeader}>
                      <span className={`${styles.projetoStatus} ${styles[`projetoStatus${projeto.status}`]}`}>
                        {projeto.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                    <h4 className={styles.projetoNome}>{projeto.nome}</h4>
                    {projeto.descricao && (
                      <p className={styles.projetoDescricao}>{projeto.descricao}</p>
                    )}
                    <div className={styles.projetoFooter}>
                      <span className={styles.projetoTipo}>
                        <BarChart3 size={12} />
                        {projeto.tipo.replace(/_/g, ' ')}
                      </span>
                      {projeto.lider && (
                        <span className={styles.projetoLider}>
                          {projeto.lider.nome.split(' ')[0]}
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </section>
        </div>

        {/* Side Column - Atalhos + Calendário */}
        <div className={styles.sideColumn}>
          {/* Atalhos Rápidos */}
          <div className={styles.quickActionsCard}>
            <h3 className={styles.quickActionsTitle}>
              <Zap size={16} />
              Atalhos Rápidos
            </h3>
            <div className={styles.quickActionsGrid}>
              <button className={styles.quickActionBtn} onClick={() => navigate('/demandas')}>
                <Plus size={20} />
                Nova Demanda
              </button>
              <button className={styles.quickActionBtn} onClick={() => navigate('/projetos')}>
                <FolderKanban size={20} />
                Projetos
              </button>
            </div>
          </div>

          {/* Mini Calendário */}
          <div className={styles.calendarCard}>
            <div className={styles.calendarHeader}>
              <h3 className={styles.calendarTitle}>
                <Calendar size={16} />
                Agenda
              </h3>
              <span className={styles.calendarMonth}>{calendarData.mesNome}</span>
            </div>

            <div className={styles.calendarGrid}>
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map((dia) => (
                <div key={dia} className={styles.calendarDayHeader}>{dia}</div>
              ))}
              {calendarData.dias.map((dia, index) => (
                <div
                  key={index}
                  className={`${styles.calendarDay} ${dia.isHoje ? styles.today : ''} ${!dia.mesAtual ? styles.otherMonth : ''} ${dia.temEvento ? styles.hasEvent : ''}`}
                >
                  {dia.dia}
                </div>
              ))}
            </div>

            <div className={styles.upcomingEvents}>
              <h4 className={styles.upcomingTitle}>Próximos Prazos</h4>
              {proximosPrazos.length === 0 ? (
                <p className={styles.noEvents}>Nenhum prazo pendente</p>
              ) : (
                proximosPrazos.map((demanda) => (
                  <button
                    key={demanda.id}
                    className={styles.eventItem}
                    onClick={() => navigate('/demandas')}
                  >
                    <span className={`${styles.eventDot} ${styles[getEventPriority(demanda.prazo!)]}`} />
                    <div className={styles.eventInfo}>
                      <span className={styles.eventName}>{demanda.titulo}</span>
                      <span className={styles.eventDate}>
                        {new Date(demanda.prazo!).toLocaleDateString('pt-BR')}
                      </span>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
