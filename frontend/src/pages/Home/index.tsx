import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  FolderKanban,
  FileText,
  Ticket,
  Palette,
  Server,
  Briefcase,
  ArrowRight,
  Sparkles,
  Zap,
  Target,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import styles from './styles.module.css';

interface CarouselSlide {
  id: number;
  image: string;
  title: string;
  description: string;
}

export function Home() {
  const navigate = useNavigate();
  const { usuario } = useAuth();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [currentSlide, setCurrentSlide] = useState(0);

  const carouselSlides: CarouselSlide[] = [
    {
      id: 1,
      image: '/images/carousel/slide1.jpg',
      title: 'Inovação e Tecnologia',
      description: 'Transformando ideias em soluções digitais',
    },
    {
      id: 2,
      image: '/images/carousel/slide2.jpg',
      title: 'Gestão de Projetos',
      description: 'Acompanhe o progresso de todas as iniciativas',
    },
    {
      id: 3,
      image: '/images/carousel/slide3.jpg',
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

  function getGreeting(): string {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  }

  function getFirstName(): string {
    return usuario?.nome?.split(' ')[0] || 'Usuário';
  }

  const quickActions = [
    {
      title: 'Dashboard',
      description: 'Visualize métricas e indicadores',
      icon: LayoutDashboard,
      path: '/dashboard',
      color: '#6366f1',
    },
    {
      title: 'Projetos',
      description: 'Gerencie projetos em andamento',
      icon: FolderKanban,
      path: '/projetos',
      color: '#8b5cf6',
    },
    {
      title: 'Demandas',
      description: 'Acompanhe demandas do setor',
      icon: FileText,
      path: '/demandas',
      color: '#3b82f6',
    },
    {
      title: 'Chamados',
      description: 'Atenda chamados de suporte',
      icon: Ticket,
      path: '/chamados',
      color: '#f59e0b',
    },
  ];

  const resources = [
    {
      title: 'Portfólio',
      description: 'Projetos concluídos e seus impactos',
      icon: Briefcase,
      path: '/portfolio',
      color: '#22c55e',
    },
    {
      title: 'Sistemas & Acessos',
      description: 'Catálogo de sistemas e credenciais',
      icon: Server,
      path: '/sistemas-acesso',
      color: '#06b6d4',
    },
    {
      title: 'Identidade Visual',
      description: 'Marca, cores, fontes e templates',
      icon: Palette,
      path: '/identidade-visual',
      color: '#ec4899',
    },
  ];

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

      {/* Quick Actions */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrapper}>
            <Zap size={20} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Acesso Rápido</h2>
          </div>
          <p className={styles.sectionSubtitle}>Navegue para as principais funcionalidades</p>
        </div>

        <div className={styles.actionsGrid}>
          {quickActions.map((action) => (
            <button
              key={action.path}
              className={styles.actionCard}
              onClick={() => navigate(action.path)}
              style={{ '--action-color': action.color } as React.CSSProperties}
            >
              <div className={styles.actionIcon} style={{ background: `${action.color}20`, color: action.color }}>
                <action.icon size={24} />
              </div>
              <div className={styles.actionContent}>
                <h3 className={styles.actionTitle}>{action.title}</h3>
                <p className={styles.actionDescription}>{action.description}</p>
              </div>
              <ArrowRight size={18} className={styles.actionArrow} />
            </button>
          ))}
        </div>
      </section>

      {/* Resources */}
      <section className={styles.section}>
        <div className={styles.sectionHeader}>
          <div className={styles.sectionTitleWrapper}>
            <Target size={20} className={styles.sectionIcon} />
            <h2 className={styles.sectionTitle}>Recursos</h2>
          </div>
          <p className={styles.sectionSubtitle}>Acesse informações e configurações do departamento</p>
        </div>

        <div className={styles.resourcesGrid}>
          {resources.map((resource) => (
            <button
              key={resource.path}
              className={styles.resourceCard}
              onClick={() => navigate(resource.path)}
              style={{ '--resource-color': resource.color } as React.CSSProperties}
            >
              <div className={styles.resourceIcon} style={{ background: `${resource.color}15`, color: resource.color }}>
                <resource.icon size={28} />
              </div>
              <h3 className={styles.resourceTitle}>{resource.title}</h3>
              <p className={styles.resourceDescription}>{resource.description}</p>
              <div className={styles.resourceFooter}>
                <span>Acessar</span>
                <ArrowRight size={14} />
              </div>
            </button>
          ))}
        </div>
      </section>

    </div>
  );
}
