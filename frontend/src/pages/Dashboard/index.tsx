import { useState, useEffect } from 'react';
import {
  FolderKanban,
  ClipboardList,
  AlertTriangle,
  Clock,
  Users,
  Ticket,
  TrendingUp,
  Calendar,
  PieChart as PieChartIcon,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
  Area,
  AreaChart,
} from 'recharts';
import {
  ResumoGeral,
  ProjetosPorStatus,
  EvolucaoMensal,
  DemandasPorStatus,
  DemandasPorPrioridade,
} from '../../types';
import { metricsService } from '../../services';
import styles from './styles.module.css';

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartData = Record<string, any>;

const STATUS_COLORS: Record<string, string> = {
  IDEIA: '#6b7280',
  EM_ANALISE: '#f59e0b',
  EM_DESENVOLVIMENTO: '#6366f1',
  EM_TESTES: '#8b5cf6',
  EM_PRODUCAO: '#22c55e',
  ARQUIVADO: '#374151',
};

const DEMANDA_STATUS_COLORS: Record<string, string> = {
  A_FAZER: '#6b7280',
  EM_ANDAMENTO: '#3b82f6',
  EM_VALIDACAO: '#f59e0b',
  CONCLUIDA: '#22c55e',
};

const PRIORIDADE_COLORS: Record<string, string> = {
  BAIXA: '#6b7280',
  MEDIA: '#3b82f6',
  ALTA: '#f59e0b',
  CRITICA: '#ef4444',
};

function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    IDEIA: 'Ideia',
    EM_ANALISE: 'Em Análise',
    EM_DESENVOLVIMENTO: 'Em Desenvolvimento',
    EM_TESTES: 'Em Testes',
    EM_PRODUCAO: 'Em Produção',
    ARQUIVADO: 'Arquivado',
  };
  return statusMap[status] || status.replace(/_/g, ' ');
}

function formatDemandaStatus(status: string): string {
  const statusMap: Record<string, string> = {
    A_FAZER: 'A Fazer',
    EM_ANDAMENTO: 'Em Andamento',
    EM_VALIDACAO: 'Em Validação',
    CONCLUIDA: 'Concluída',
  };
  return statusMap[status] || status.replace(/_/g, ' ');
}

function formatPrioridade(prioridade: string): string {
  const prioridadeMap: Record<string, string> = {
    BAIXA: 'Baixa',
    MEDIA: 'Média',
    ALTA: 'Alta',
    CRITICA: 'Crítica',
  };
  return prioridadeMap[prioridade] || prioridade;
}

function formatMes(mes: string): string {
  const [ano, mesNum] = mes.split('-');
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${meses[parseInt(mesNum) - 1]}/${ano.slice(2)}`;
}

function formatDate(): string {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  };
  const formatted = now.toLocaleDateString('pt-BR', options);
  return formatted.charAt(0).toUpperCase() + formatted.slice(1);
}


// Custom Tooltip Component
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function CustomTooltip({ active, payload, label, formatter }: any) {
  if (active && payload && payload.length) {
    return (
      <div
        style={{
          background: 'rgba(17, 24, 39, 0.95)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          borderRadius: '12px',
          padding: '12px 16px',
          boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
        }}
      >
        <p style={{ color: '#9ca3af', fontSize: '12px', marginBottom: '8px' }}>
          {formatter ? formatter(label) : label}
        </p>
        {payload.map((entry: { name: string; value: number; color: string }, index: number) => (
          <div
            key={index}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginTop: '4px',
            }}
          >
            <span
              style={{
                width: '10px',
                height: '10px',
                borderRadius: '3px',
                background: entry.color,
              }}
            />
            <span style={{ color: '#e5e7eb', fontSize: '13px' }}>
              {entry.name}: <strong>{entry.value}</strong>
            </span>
          </div>
        ))}
      </div>
    );
  }
  return null;
}

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState<ResumoGeral | null>(null);
  const [projetosPorStatus, setProjetosPorStatus] = useState<ProjetosPorStatus[]>([]);
  const [evolucaoMensal, setEvolucaoMensal] = useState<EvolucaoMensal[]>([]);
  const [demandasPorStatus, setDemandasPorStatus] = useState<DemandasPorStatus[]>([]);
  const [demandasPorPrioridade, setDemandasPorPrioridade] = useState<DemandasPorPrioridade[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [
        resumoData,
        projetosStatusData,
        evolucaoData,
        demandasStatusData,
        demandasPrioridadeData,
      ] = await Promise.all([
        metricsService.getResumoGeral(),
        metricsService.getProjetosPorStatus(),
        metricsService.getEvolucaoMensal(6),
        metricsService.getDemandasPorStatus(),
        metricsService.getDemandasPorPrioridade(),
      ]);

      setResumo(resumoData);
      setProjetosPorStatus(projetosStatusData);
      setEvolucaoMensal(evolucaoData);
      setDemandasPorStatus(demandasStatusData);
      setDemandasPorPrioridade(demandasPrioridadeData);
    } catch (error) {
      console.error('Erro ao carregar métricas:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingSpinner} />
        <span className={styles.loadingText}>Carregando métricas...</span>
      </div>
    );
  }

  const totalProjetos = projetosPorStatus.reduce((acc, curr) => acc + curr.total, 0);

  return (
    <div className={styles.container}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerTop}>
          <div className={styles.headerInfo}>
            <h1 className={styles.title}>Dashboard</h1>
            <p className={styles.subtitle}>
              Acompanhe as metricas e indicadores do departamento de Inovacoes e Tecnologia
            </p>
          </div>
          <div className={styles.headerDate}>
            <Calendar size={16} />
            <span>{formatDate()}</span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
            <FolderKanban size={24} color="#8b5cf6" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{resumo?.projetos_ativos || 0}</span>
            <span className={styles.statLabel}>Projetos Ativos</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
            <ClipboardList size={24} color="#6366f1" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{resumo?.demandas_abertas || 0}</span>
            <span className={styles.statLabel}>Demandas Abertas</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
            <Ticket size={24} color="#f59e0b" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{resumo?.chamados_abertos || 0}</span>
            <span className={styles.statLabel}>Chamados Abertos</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.15)' }}>
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{resumo?.chamados_atrasados || 0}</span>
            <span className={styles.statLabel}>Chamados Atrasados</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.15)' }}>
            <Clock size={24} color="#22c55e" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {resumo?.tempo_medio_resolucao_dias !== null
                ? `${resumo?.tempo_medio_resolucao_dias}d`
                : '-'}
            </span>
            <span className={styles.statLabel}>Tempo Médio</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(6, 182, 212, 0.15)' }}>
            <Users size={24} color="#06b6d4" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{resumo?.usuarios_ativos || 0}</span>
            <span className={styles.statLabel}>Usuários Ativos</span>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className={styles.chartsGrid}>
        {/* Evolução Mensal */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartHeaderLeft}>
              <div className={styles.chartIconWrapper} style={{ background: 'rgba(99, 102, 241, 0.15)' }}>
                <TrendingUp size={20} color="#6366f1" />
              </div>
              <div>
                <h3 className={styles.chartTitle}>Evolução Mensal</h3>
                <p className={styles.chartSubtitle}>Últimos 6 meses</p>
              </div>
            </div>
          </div>
          <div className={styles.chartContainer}>
            {evolucaoMensal.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <AreaChart data={evolucaoMensal}>
                  <defs>
                    <linearGradient id="colorDemandas" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorChamadosAbertos" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorChamadosFechados" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="mes"
                    tickFormatter={formatMes}
                    stroke="#4b5563"
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                  <Tooltip content={<CustomTooltip formatter={formatMes} />} />
                  <Legend
                    wrapperStyle={{ paddingTop: '20px' }}
                    formatter={(value) => <span style={{ color: '#9ca3af', fontSize: '12px' }}>{value}</span>}
                  />
                  <Area
                    type="monotone"
                    dataKey="demandas_criadas"
                    name="Demandas"
                    stroke="#6366f1"
                    strokeWidth={2}
                    fill="url(#colorDemandas)"
                  />
                  <Area
                    type="monotone"
                    dataKey="chamados_abertos"
                    name="Chamados Abertos"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    fill="url(#colorChamadosAbertos)"
                  />
                  <Area
                    type="monotone"
                    dataKey="chamados_fechados"
                    name="Chamados Fechados"
                    stroke="#22c55e"
                    strokeWidth={2}
                    fill="url(#colorChamadosFechados)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>
                <div className={styles.emptyChartIcon}>
                  <TrendingUp size={24} />
                </div>
                <span className={styles.emptyChartText}>Sem dados para exibir</span>
              </div>
            )}
          </div>
        </div>

        {/* Projetos por Status */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartHeaderLeft}>
              <div className={styles.chartIconWrapper} style={{ background: 'rgba(139, 92, 246, 0.15)' }}>
                <PieChartIcon size={20} color="#8b5cf6" />
              </div>
              <div>
                <h3 className={styles.chartTitle}>Projetos por Status</h3>
                <p className={styles.chartSubtitle}>{totalProjetos} projetos no total</p>
              </div>
            </div>
          </div>
          <div className={styles.chartContainer}>
            {projetosPorStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={projetosPorStatus as ChartData[]}
                    dataKey="total"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {projetosPorStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as ProjetosPorStatus;
                        return (
                          <div
                            style={{
                              background: 'rgba(17, 24, 39, 0.95)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                            }}
                          >
                            <p style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 600 }}>
                              {formatStatus(data.status)}
                            </p>
                            <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                              {data.total} projetos ({data.percentual}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>
                <div className={styles.emptyChartIcon}>
                  <PieChartIcon size={24} />
                </div>
                <span className={styles.emptyChartText}>Sem dados para exibir</span>
              </div>
            )}
            {projetosPorStatus.length > 0 && (
              <div className={styles.legendWrapper}>
                {projetosPorStatus.map((entry, index) => (
                  <div key={index} className={styles.legendItem}>
                    <span
                      className={styles.legendDot}
                      style={{ background: STATUS_COLORS[entry.status] || COLORS[index % COLORS.length] }}
                    />
                    <span>{formatStatus(entry.status)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Demandas por Status */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartHeaderLeft}>
              <div className={styles.chartIconWrapper} style={{ background: 'rgba(59, 130, 246, 0.15)' }}>
                <ClipboardList size={20} color="#3b82f6" />
              </div>
              <div>
                <h3 className={styles.chartTitle}>Demandas por Status</h3>
                <p className={styles.chartSubtitle}>Distribuicao atual</p>
              </div>
            </div>
          </div>
          <div className={styles.chartContainer}>
            {demandasPorStatus.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <PieChart>
                  <Pie
                    data={demandasPorStatus as ChartData[]}
                    dataKey="total"
                    nameKey="status"
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={2}
                  >
                    {demandasPorStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={DEMANDA_STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as DemandasPorStatus;
                        return (
                          <div
                            style={{
                              background: 'rgba(17, 24, 39, 0.95)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                            }}
                          >
                            <p style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 600 }}>
                              {formatDemandaStatus(data.status)}
                            </p>
                            <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                              {data.total} demandas ({data.percentual}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>
                <div className={styles.emptyChartIcon}>
                  <ClipboardList size={24} />
                </div>
                <span className={styles.emptyChartText}>Sem dados para exibir</span>
              </div>
            )}
            {demandasPorStatus.length > 0 && (
              <div className={styles.legendWrapper}>
                {demandasPorStatus.map((entry, index) => (
                  <div key={index} className={styles.legendItem}>
                    <span
                      className={styles.legendDot}
                      style={{ background: DEMANDA_STATUS_COLORS[entry.status] || COLORS[index % COLORS.length] }}
                    />
                    <span>{formatDemandaStatus(entry.status)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Demandas por Prioridade */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <div className={styles.chartHeaderLeft}>
              <div className={styles.chartIconWrapper} style={{ background: 'rgba(245, 158, 11, 0.15)' }}>
                <AlertTriangle size={20} color="#f59e0b" />
              </div>
              <div>
                <h3 className={styles.chartTitle}>Demandas por Prioridade</h3>
                <p className={styles.chartSubtitle}>Distribuicao por urgencia</p>
              </div>
            </div>
          </div>
          <div className={styles.chartContainer}>
            {demandasPorPrioridade.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={demandasPorPrioridade} layout="vertical" barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis type="number" stroke="#4b5563" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis
                    type="category"
                    dataKey="prioridade"
                    stroke="#4b5563"
                    fontSize={11}
                    width={80}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={formatPrioridade}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload as DemandasPorPrioridade;
                        return (
                          <div
                            style={{
                              background: 'rgba(17, 24, 39, 0.95)',
                              border: '1px solid rgba(255, 255, 255, 0.1)',
                              borderRadius: '12px',
                              padding: '12px 16px',
                              boxShadow: '0 10px 40px rgba(0, 0, 0, 0.3)',
                            }}
                          >
                            <p style={{ color: '#e5e7eb', fontSize: '13px', fontWeight: 600 }}>
                              {formatPrioridade(data.prioridade)}
                            </p>
                            <p style={{ color: '#9ca3af', fontSize: '12px', marginTop: '4px' }}>
                              {data.total} demandas ({data.percentual}%)
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Bar
                    dataKey="total"
                    name="Demandas"
                    radius={[0, 6, 6, 0]}
                    barSize={24}
                  >
                    {demandasPorPrioridade.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={PRIORIDADE_COLORS[entry.prioridade] || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>
                <div className={styles.emptyChartIcon}>
                  <AlertTriangle size={24} />
                </div>
                <span className={styles.emptyChartText}>Sem dados para exibir</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
