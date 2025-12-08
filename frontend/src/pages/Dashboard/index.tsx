import { useState, useEffect } from 'react';
import {
  FolderKanban,
  ClipboardList,
  AlertTriangle,
  Clock,
  Users,
  Ticket,
  TrendingUp,
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
  LineChart,
  Line,
  Legend,
} from 'recharts';
import {
  ResumoGeral,
  ProjetosPorStatus,
  ChamadosPorSetor,
  EvolucaoMensal,
  DemandasPorResponsavel,
} from '../../types';
import { metricsService } from '../../services';
import { useAuth } from '../../contexts';
import styles from './styles.module.css';

const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartData = Record<string, any>;

const STATUS_COLORS: Record<string, string> = {
  IDEIA: '#6b7280',
  EM_ANALISE: '#f59e0b',
  EM_DESENVOLVIMENTO: '#3b82f6',
  EM_TESTES: '#8b5cf6',
  EM_PRODUCAO: '#22c55e',
  ARQUIVADO: '#374151',
};

function formatStatus(status: string): string {
  return status.replace(/_/g, ' ');
}

function formatMes(mes: string): string {
  const [ano, mesNum] = mes.split('-');
  const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${meses[parseInt(mesNum) - 1]}/${ano.slice(2)}`;
}

export function Dashboard() {
  const { usuario } = useAuth();
  const [loading, setLoading] = useState(true);
  const [resumo, setResumo] = useState<ResumoGeral | null>(null);
  const [projetosPorStatus, setProjetosPorStatus] = useState<ProjetosPorStatus[]>([]);
  const [chamadosPorSetor, setChamadosPorSetor] = useState<ChamadosPorSetor[]>([]);
  const [evolucaoMensal, setEvolucaoMensal] = useState<EvolucaoMensal[]>([]);
  const [demandasPorResponsavel, setDemandasPorResponsavel] = useState<DemandasPorResponsavel[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      const [
        resumoData,
        projetosStatusData,
        chamadosSetorData,
        evolucaoData,
        demandasResponsavelData,
      ] = await Promise.all([
        metricsService.getResumoGeral(),
        metricsService.getProjetosPorStatus(),
        metricsService.getChamadosPorSetor(),
        metricsService.getEvolucaoMensal(6),
        metricsService.getDemandasPorResponsavel(),
      ]);

      setResumo(resumoData);
      setProjetosPorStatus(projetosStatusData);
      setChamadosPorSetor(chamadosSetorData);
      setEvolucaoMensal(evolucaoData);
      setDemandasPorResponsavel(demandasResponsavelData.slice(0, 5));
    } catch (error) {
      console.error('Erro ao carregar metricas:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return <div className={styles.loading}>Carregando metricas...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Dashboard</h1>
        <p className={styles.subtitle}>Ola, {usuario?.nome.split(' ')[0]}! Veja o resumo das metricas do sistema.</p>
      </div>

      {/* Cards de KPIs */}
      <div className={styles.stats}>
        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(139, 92, 246, 0.2)' }}>
            <FolderKanban size={24} color="#8b5cf6" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{resumo?.projetos_ativos || 0}</span>
            <span className={styles.statLabel}>Projetos Ativos</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(59, 130, 246, 0.2)' }}>
            <ClipboardList size={24} color="#3b82f6" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{resumo?.demandas_abertas || 0}</span>
            <span className={styles.statLabel}>Demandas Abertas</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(245, 158, 11, 0.2)' }}>
            <Ticket size={24} color="#f59e0b" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{resumo?.chamados_abertos || 0}</span>
            <span className={styles.statLabel}>Chamados Abertos</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(239, 68, 68, 0.2)' }}>
            <AlertTriangle size={24} color="#ef4444" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{resumo?.chamados_atrasados || 0}</span>
            <span className={styles.statLabel}>Chamados Atrasados</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(34, 197, 94, 0.2)' }}>
            <Clock size={24} color="#22c55e" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>
              {resumo?.tempo_medio_resolucao_dias !== null
                ? `${resumo?.tempo_medio_resolucao_dias}d`
                : '-'}
            </span>
            <span className={styles.statLabel}>Tempo Medio Resolucao</span>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon} style={{ background: 'rgba(6, 182, 212, 0.2)' }}>
            <Users size={24} color="#06b6d4" />
          </div>
          <div className={styles.statInfo}>
            <span className={styles.statValue}>{resumo?.usuarios_ativos || 0}</span>
            <span className={styles.statLabel}>Usuarios Ativos</span>
          </div>
        </div>
      </div>

      {/* Graficos */}
      <div className={styles.chartsGrid}>
        {/* Evolucao Mensal */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <TrendingUp size={20} color="#3b82f6" />
            <h3 className={styles.chartTitle}>Evolucao Mensal</h3>
          </div>
          <div className={styles.chartContainer}>
            {evolucaoMensal.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <LineChart data={evolucaoMensal}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="mes"
                    tickFormatter={formatMes}
                    stroke="#6b7280"
                    fontSize={12}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    labelFormatter={formatMes}
                  />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="demandas_criadas"
                    name="Demandas"
                    stroke="#3b82f6"
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="chamados_abertos"
                    name="Chamados Abertos"
                    stroke="#f59e0b"
                    strokeWidth={2}
                    dot={{ fill: '#f59e0b' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="chamados_fechados"
                    name="Chamados Fechados"
                    stroke="#22c55e"
                    strokeWidth={2}
                    dot={{ fill: '#22c55e' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>Sem dados para exibir</div>
            )}
          </div>
        </div>

        {/* Projetos por Status */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <FolderKanban size={20} color="#8b5cf6" />
            <h3 className={styles.chartTitle}>Projetos por Status</h3>
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
                    outerRadius={100}
                    label={(props) => {
                      const entry = props.payload as ProjetosPorStatus;
                      return `${formatStatus(entry.status)} (${entry.percentual}%)`;
                    }}
                    labelLine={false}
                  >
                    {projetosPorStatus.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={STATUS_COLORS[entry.status] || COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                    formatter={(value: number, name: string) => [value, formatStatus(name)]}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>Sem dados para exibir</div>
            )}
          </div>
        </div>

        {/* Chamados por Setor */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <Ticket size={20} color="#f59e0b" />
            <h3 className={styles.chartTitle}>Chamados por Setor</h3>
          </div>
          <div className={styles.chartContainer}>
            {chamadosPorSetor.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={chamadosPorSetor.slice(0, 6)} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis type="number" stroke="#6b7280" fontSize={12} />
                  <YAxis
                    type="category"
                    dataKey="setor"
                    stroke="#6b7280"
                    fontSize={11}
                    width={100}
                    tickFormatter={(value) => value.length > 15 ? `${value.slice(0, 15)}...` : value}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="abertos" name="Abertos" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                  <Bar dataKey="concluidos" name="Concluidos" fill="#22c55e" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>Sem dados para exibir</div>
            )}
          </div>
        </div>

        {/* Demandas por Responsavel */}
        <div className={styles.chartCard}>
          <div className={styles.chartHeader}>
            <Users size={20} color="#06b6d4" />
            <h3 className={styles.chartTitle}>Demandas por Responsavel</h3>
          </div>
          <div className={styles.chartContainer}>
            {demandasPorResponsavel.length > 0 ? (
              <ResponsiveContainer width="100%" height={280}>
                <BarChart data={demandasPorResponsavel}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis
                    dataKey="responsavel_nome"
                    stroke="#6b7280"
                    fontSize={11}
                    tickFormatter={(value) => value.split(' ')[0]}
                  />
                  <YAxis stroke="#6b7280" fontSize={12} />
                  <Tooltip
                    contentStyle={{
                      background: '#1f2937',
                      border: '1px solid #374151',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="a_fazer" name="A Fazer" stackId="a" fill="#6b7280" />
                  <Bar dataKey="em_andamento" name="Em Andamento" stackId="a" fill="#3b82f6" />
                  <Bar dataKey="concluidas" name="Concluidas" stackId="a" fill="#22c55e" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className={styles.emptyChart}>Sem dados para exibir</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
