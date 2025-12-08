import { supabase } from '../config/database.js';
import {
  ResumoGeral,
  ChamadosPorSetor,
  ProjetosPorStatus,
  ProjetosPorTipo,
  TempoMedioResolucao,
  DemandasPorResponsavel,
  DemandasPorPrioridade,
  ChamadosPorCategoria,
  ChamadosPorStatus,
  EvolucaoMensal,
  TopProjetos,
} from '../types/index.js';

// Database record types for queries
interface ChamadoResolvidoRecord {
  data_abertura: string;
  data_fechamento: string | null;
}

interface ChamadoSetorRecord {
  setor_solicitante: string | null;
  status: string;
}

interface ProjetoStatusRecord {
  status: string;
}

interface ProjetoTipoRecord {
  tipo: string;
}

interface DemandaResponsavelRecord {
  responsavel_id: string | null;
  status: string;
  responsavel: { nome: string }[] | null;
}

interface DemandaPrioridadeRecord {
  prioridade: string;
}

interface ChamadoCategoriaRecord {
  categoria: string;
}

interface ChamadoStatusRecord {
  status: string;
}

interface ProjetoDataRecord {
  data_criacao: string;
}

interface DemandaDataRecord {
  data_criacao: string;
}

interface ChamadoEvolucaoRecord {
  data_abertura: string;
  data_fechamento: string | null;
  status: string;
}

interface ProjetoBasicoRecord {
  id: string;
  nome: string;
}

export const metricsService = {
  async getResumoGeral(): Promise<ResumoGeral> {
    // Projetos ativos (não arquivados)
    const { count: projetosAtivos } = await supabase
      .from('projetos')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)
      .neq('status', 'ARQUIVADO');

    const { count: projetosTotal } = await supabase
      .from('projetos')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true);

    // Demandas abertas (não concluídas)
    const { count: demandasAbertas } = await supabase
      .from('demandas')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)
      .neq('status', 'CONCLUIDA');

    const { count: demandasTotal } = await supabase
      .from('demandas')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true);

    // Chamados abertos
    const { count: chamadosAbertos } = await supabase
      .from('chamados')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)
      .not('status', 'in', '("CONCLUIDO","CANCELADO")');

    const { count: chamadosTotal } = await supabase
      .from('chamados')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true);

    // Chamados atrasados (SLA > 48h sem resolução)
    const dataLimite = new Date();
    dataLimite.setHours(dataLimite.getHours() - 48);

    const { count: chamadosAtrasados } = await supabase
      .from('chamados')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true)
      .not('status', 'in', '("CONCLUIDO","CANCELADO")')
      .lt('data_abertura', dataLimite.toISOString());

    // Usuários ativos
    const { count: usuariosAtivos } = await supabase
      .from('usuarios')
      .select('*', { count: 'exact', head: true })
      .eq('ativo', true);

    // Tempo médio de resolução (chamados concluídos nos últimos 30 dias)
    const trintaDiasAtras = new Date();
    trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

    const { data: chamadosResolvidos } = await supabase
      .from('chamados')
      .select('data_abertura, data_fechamento')
      .eq('ativo', true)
      .eq('status', 'CONCLUIDO')
      .not('data_fechamento', 'is', null)
      .gte('data_fechamento', trintaDiasAtras.toISOString());

    let tempoMedioResolucaoDias: number | null = null;
    if (chamadosResolvidos && chamadosResolvidos.length > 0) {
      const totalHoras = (chamadosResolvidos as ChamadoResolvidoRecord[]).reduce(
        (acc: number, chamado: ChamadoResolvidoRecord) => {
          const abertura = new Date(chamado.data_abertura);
          const fechamento = new Date(chamado.data_fechamento!);
          const diffMs = fechamento.getTime() - abertura.getTime();
          return acc + diffMs / (1000 * 60 * 60);
        },
        0
      );
      tempoMedioResolucaoDias = Math.round((totalHoras / chamadosResolvidos.length / 24) * 10) / 10;
    }

    return {
      projetos_ativos: projetosAtivos || 0,
      projetos_total: projetosTotal || 0,
      demandas_abertas: demandasAbertas || 0,
      demandas_total: demandasTotal || 0,
      chamados_abertos: chamadosAbertos || 0,
      chamados_total: chamadosTotal || 0,
      chamados_atrasados: chamadosAtrasados || 0,
      usuarios_ativos: usuariosAtivos || 0,
      tempo_medio_resolucao_dias: tempoMedioResolucaoDias,
    };
  },

  async getChamadosPorSetor(): Promise<ChamadosPorSetor[]> {
    const { data: chamados } = await supabase
      .from('chamados')
      .select('setor_solicitante, status')
      .eq('ativo', true);

    if (!chamados) return [];

    const setoresMap = new Map<string, { total: number; abertos: number; concluidos: number }>();

    (chamados as ChamadoSetorRecord[]).forEach((chamado: ChamadoSetorRecord) => {
      const setor = chamado.setor_solicitante || 'Não informado';
      if (!setoresMap.has(setor)) {
        setoresMap.set(setor, { total: 0, abertos: 0, concluidos: 0 });
      }
      const stats = setoresMap.get(setor)!;
      stats.total++;
      if (chamado.status === 'CONCLUIDO') {
        stats.concluidos++;
      } else if (chamado.status !== 'CANCELADO') {
        stats.abertos++;
      }
    });

    return Array.from(setoresMap.entries())
      .map(([setor, stats]) => ({
        setor,
        ...stats,
      }))
      .sort((a, b) => b.total - a.total);
  },

  async getProjetosPorStatus(): Promise<ProjetosPorStatus[]> {
    const { data: projetos } = await supabase
      .from('projetos')
      .select('status')
      .eq('ativo', true);

    if (!projetos || projetos.length === 0) return [];

    const statusMap = new Map<string, number>();
    (projetos as ProjetoStatusRecord[]).forEach((projeto: ProjetoStatusRecord) => {
      const status = projeto.status;
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const total = projetos.length;
    return Array.from(statusMap.entries())
      .map(([status, count]) => ({
        status,
        total: count,
        percentual: Math.round((count / total) * 100 * 10) / 10,
      }))
      .sort((a, b) => b.total - a.total);
  },

  async getProjetosPorTipo(): Promise<ProjetosPorTipo[]> {
    const { data: projetos } = await supabase
      .from('projetos')
      .select('tipo')
      .eq('ativo', true);

    if (!projetos || projetos.length === 0) return [];

    const tipoMap = new Map<string, number>();
    (projetos as ProjetoTipoRecord[]).forEach((projeto: ProjetoTipoRecord) => {
      const tipo = projeto.tipo;
      tipoMap.set(tipo, (tipoMap.get(tipo) || 0) + 1);
    });

    const total = projetos.length;
    return Array.from(tipoMap.entries())
      .map(([tipo, count]) => ({
        tipo,
        total: count,
        percentual: Math.round((count / total) * 100 * 10) / 10,
      }))
      .sort((a, b) => b.total - a.total);
  },

  async getTempoMedioResolucao(meses: number = 6): Promise<TempoMedioResolucao[]> {
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - meses);

    const { data: chamados } = await supabase
      .from('chamados')
      .select('data_abertura, data_fechamento')
      .eq('ativo', true)
      .eq('status', 'CONCLUIDO')
      .not('data_fechamento', 'is', null)
      .gte('data_fechamento', dataInicio.toISOString());

    if (!chamados || chamados.length === 0) return [];

    // Agrupar por mês
    const mesesMap = new Map<string, { totalHoras: number; count: number }>();

    (chamados as ChamadoResolvidoRecord[]).forEach((chamado: ChamadoResolvidoRecord) => {
      const fechamento = new Date(chamado.data_fechamento!);
      const periodo = `${fechamento.getFullYear()}-${String(fechamento.getMonth() + 1).padStart(2, '0')}`;

      const abertura = new Date(chamado.data_abertura);
      const diffMs = fechamento.getTime() - abertura.getTime();
      const diffHoras = diffMs / (1000 * 60 * 60);

      if (!mesesMap.has(periodo)) {
        mesesMap.set(periodo, { totalHoras: 0, count: 0 });
      }
      const stats = mesesMap.get(periodo)!;
      stats.totalHoras += diffHoras;
      stats.count++;
    });

    return Array.from(mesesMap.entries())
      .map(([periodo, stats]) => ({
        periodo,
        tempo_medio_horas: Math.round((stats.totalHoras / stats.count) * 10) / 10,
        tempo_medio_dias: Math.round((stats.totalHoras / stats.count / 24) * 10) / 10,
        total_resolvidos: stats.count,
      }))
      .sort((a, b) => a.periodo.localeCompare(b.periodo));
  },

  async getDemandasPorResponsavel(): Promise<DemandasPorResponsavel[]> {
    const { data: demandas } = await supabase
      .from('demandas')
      .select(`
        responsavel_id,
        status,
        responsavel:usuarios!demandas_responsavel_id_fkey(nome)
      `)
      .eq('ativo', true);

    if (!demandas) return [];

    const responsavelMap = new Map<string | null, {
      nome: string;
      total: number;
      a_fazer: number;
      em_andamento: number;
      concluidas: number;
    }>();

    (demandas as DemandaResponsavelRecord[]).forEach((demanda: DemandaResponsavelRecord) => {
      const id = demanda.responsavel_id;
      const responsavelArray = demanda.responsavel;
      const nome = responsavelArray?.[0]?.nome || 'Não atribuído';

      if (!responsavelMap.has(id)) {
        responsavelMap.set(id, {
          nome,
          total: 0,
          a_fazer: 0,
          em_andamento: 0,
          concluidas: 0,
        });
      }
      const stats = responsavelMap.get(id)!;
      stats.total++;

      switch (demanda.status) {
        case 'A_FAZER':
          stats.a_fazer++;
          break;
        case 'EM_ANDAMENTO':
        case 'EM_VALIDACAO':
          stats.em_andamento++;
          break;
        case 'CONCLUIDA':
          stats.concluidas++;
          break;
      }
    });

    return Array.from(responsavelMap.entries())
      .map(([id, stats]) => ({
        responsavel_id: id,
        responsavel_nome: stats.nome,
        total: stats.total,
        a_fazer: stats.a_fazer,
        em_andamento: stats.em_andamento,
        concluidas: stats.concluidas,
      }))
      .sort((a, b) => b.total - a.total);
  },

  async getDemandasPorPrioridade(): Promise<DemandasPorPrioridade[]> {
    const { data: demandas } = await supabase
      .from('demandas')
      .select('prioridade')
      .eq('ativo', true);

    if (!demandas || demandas.length === 0) return [];

    const prioridadeMap = new Map<string, number>();
    (demandas as DemandaPrioridadeRecord[]).forEach((demanda: DemandaPrioridadeRecord) => {
      const prioridade = demanda.prioridade;
      prioridadeMap.set(prioridade, (prioridadeMap.get(prioridade) || 0) + 1);
    });

    const total = demandas.length;
    const ordem = ['CRITICA', 'ALTA', 'MEDIA', 'BAIXA'];

    return Array.from(prioridadeMap.entries())
      .map(([prioridade, count]) => ({
        prioridade,
        total: count,
        percentual: Math.round((count / total) * 100 * 10) / 10,
      }))
      .sort((a, b) => ordem.indexOf(a.prioridade) - ordem.indexOf(b.prioridade));
  },

  async getChamadosPorCategoria(): Promise<ChamadosPorCategoria[]> {
    const { data: chamados } = await supabase
      .from('chamados')
      .select('categoria')
      .eq('ativo', true);

    if (!chamados || chamados.length === 0) return [];

    const categoriaMap = new Map<string, number>();
    (chamados as ChamadoCategoriaRecord[]).forEach((chamado: ChamadoCategoriaRecord) => {
      const categoria = chamado.categoria;
      categoriaMap.set(categoria, (categoriaMap.get(categoria) || 0) + 1);
    });

    const total = chamados.length;
    return Array.from(categoriaMap.entries())
      .map(([categoria, count]) => ({
        categoria,
        total: count,
        percentual: Math.round((count / total) * 100 * 10) / 10,
      }))
      .sort((a, b) => b.total - a.total);
  },

  async getChamadosPorStatus(): Promise<ChamadosPorStatus[]> {
    const { data: chamados } = await supabase
      .from('chamados')
      .select('status')
      .eq('ativo', true);

    if (!chamados || chamados.length === 0) return [];

    const statusMap = new Map<string, number>();
    (chamados as ChamadoStatusRecord[]).forEach((chamado: ChamadoStatusRecord) => {
      const status = chamado.status;
      statusMap.set(status, (statusMap.get(status) || 0) + 1);
    });

    const total = chamados.length;
    return Array.from(statusMap.entries())
      .map(([status, count]) => ({
        status,
        total: count,
        percentual: Math.round((count / total) * 100 * 10) / 10,
      }))
      .sort((a, b) => b.total - a.total);
  },

  async getEvolucaoMensal(meses: number = 6): Promise<EvolucaoMensal[]> {
    const dataInicio = new Date();
    dataInicio.setMonth(dataInicio.getMonth() - meses);
    dataInicio.setDate(1);
    dataInicio.setHours(0, 0, 0, 0);

    const [projetos, demandas, chamados] = await Promise.all([
      supabase
        .from('projetos')
        .select('data_criacao')
        .eq('ativo', true)
        .gte('data_criacao', dataInicio.toISOString()),
      supabase
        .from('demandas')
        .select('data_criacao')
        .eq('ativo', true)
        .gte('data_criacao', dataInicio.toISOString()),
      supabase
        .from('chamados')
        .select('data_abertura, data_fechamento, status')
        .eq('ativo', true)
        .gte('data_abertura', dataInicio.toISOString()),
    ]);

    // Criar mapa de meses
    const mesesMap = new Map<string, EvolucaoMensal>();
    const hoje = new Date();

    for (let i = 0; i <= meses; i++) {
      const data = new Date(hoje.getFullYear(), hoje.getMonth() - i, 1);
      const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      mesesMap.set(key, {
        mes: key,
        ano: data.getFullYear(),
        projetos_criados: 0,
        demandas_criadas: 0,
        chamados_abertos: 0,
        chamados_fechados: 0,
      });
    }

    // Contar projetos
    (projetos.data as ProjetoDataRecord[] | null)?.forEach((p: ProjetoDataRecord) => {
      const data = new Date(p.data_criacao);
      const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      if (mesesMap.has(key)) {
        mesesMap.get(key)!.projetos_criados++;
      }
    });

    // Contar demandas
    (demandas.data as DemandaDataRecord[] | null)?.forEach((d: DemandaDataRecord) => {
      const data = new Date(d.data_criacao);
      const key = `${data.getFullYear()}-${String(data.getMonth() + 1).padStart(2, '0')}`;
      if (mesesMap.has(key)) {
        mesesMap.get(key)!.demandas_criadas++;
      }
    });

    // Contar chamados
    (chamados.data as ChamadoEvolucaoRecord[] | null)?.forEach((c: ChamadoEvolucaoRecord) => {
      const dataAbertura = new Date(c.data_abertura);
      const keyAbertura = `${dataAbertura.getFullYear()}-${String(dataAbertura.getMonth() + 1).padStart(2, '0')}`;
      if (mesesMap.has(keyAbertura)) {
        mesesMap.get(keyAbertura)!.chamados_abertos++;
      }

      if (c.data_fechamento && c.status === 'CONCLUIDO') {
        const dataFechamento = new Date(c.data_fechamento);
        const keyFechamento = `${dataFechamento.getFullYear()}-${String(dataFechamento.getMonth() + 1).padStart(2, '0')}`;
        if (mesesMap.has(keyFechamento)) {
          mesesMap.get(keyFechamento)!.chamados_fechados++;
        }
      }
    });

    return Array.from(mesesMap.values()).sort((a, b) => a.mes.localeCompare(b.mes));
  },

  async getTopProjetos(limit: number = 5): Promise<TopProjetos[]> {
    const { data: projetos } = await supabase
      .from('projetos')
      .select('id, nome')
      .eq('ativo', true)
      .neq('status', 'ARQUIVADO');

    if (!projetos || projetos.length === 0) return [];

    const results: TopProjetos[] = [];

    for (const projeto of projetos) {
      const { count: totalDemandas } = await supabase
        .from('demandas')
        .select('*', { count: 'exact', head: true })
        .eq('projeto_id', projeto.id)
        .eq('ativo', true);

      const { count: demandasConcluidas } = await supabase
        .from('demandas')
        .select('*', { count: 'exact', head: true })
        .eq('projeto_id', projeto.id)
        .eq('ativo', true)
        .eq('status', 'CONCLUIDA');

      const total = totalDemandas || 0;
      const concluidas = demandasConcluidas || 0;

      results.push({
        projeto_id: projeto.id,
        projeto_nome: projeto.nome,
        total_demandas: total,
        demandas_concluidas: concluidas,
        percentual_conclusao: total > 0 ? Math.round((concluidas / total) * 100) : 0,
      });
    }

    return results
      .filter(p => p.total_demandas > 0)
      .sort((a, b) => b.total_demandas - a.total_demandas)
      .slice(0, limit);
  },
};
