// Metrics Types

export interface ResumoGeral {
  projetos_ativos: number;
  projetos_total: number;
  demandas_abertas: number;
  demandas_total: number;
  chamados_abertos: number;
  chamados_total: number;
  chamados_atrasados: number;
  usuarios_ativos: number;
  tempo_medio_resolucao_dias: number | null;
}

export interface ChamadosPorSetor {
  setor: string;
  total: number;
  abertos: number;
  concluidos: number;
}

export interface ProjetosPorStatus {
  status: string;
  total: number;
  percentual: number;
}

export interface ProjetosPorTipo {
  tipo: string;
  total: number;
  percentual: number;
}

export interface TempoMedioResolucao {
  periodo: string;
  tempo_medio_horas: number;
  tempo_medio_dias: number;
  total_resolvidos: number;
}

export interface DemandasPorResponsavel {
  responsavel_id: string | null;
  responsavel_nome: string;
  total: number;
  a_fazer: number;
  em_andamento: number;
  concluidas: number;
}

export interface DemandasPorPrioridade {
  prioridade: string;
  total: number;
  percentual: number;
}

export interface ChamadosPorCategoria {
  categoria: string;
  total: number;
  percentual: number;
}

export interface ChamadosPorStatus {
  status: string;
  total: number;
  percentual: number;
}

export interface EvolucaoMensal {
  mes: string;
  ano: number;
  projetos_criados: number;
  demandas_criadas: number;
  chamados_abertos: number;
  chamados_fechados: number;
}

export interface TopProjetos {
  projeto_id: string;
  projeto_nome: string;
  total_demandas: number;
  demandas_concluidas: number;
  percentual_conclusao: number;
}
