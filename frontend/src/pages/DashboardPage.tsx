import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  Plus,
  ClipboardList,
  Clock3,
  CheckCircle2,
  Users,
  MapPinned,
  CalendarDays,
  MapPin,
  ArrowUpRight,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { api } from '../api';
import type { Demand, Dashboard } from '../api';
import { useAuth } from '../context/AuthContext';
import { CHART_COLORS } from '../constants';
import { Heading } from '../components/Heading';
import { Stat } from '../components/Stat';
import { DemandTable } from '../components/DemandTable';

export function DashboardPage() {
  const { user } = useAuth();
  const [data, setData] = useState<Dashboard | null>(null);
  const [demands, setDemands] = useState<Demand[]>([]);
  const [error, setError] = useState('');

  const isFarmer = user?.role === 'farmer';

  useEffect(() => {
    if (!isFarmer) {
      Promise.all([api<Dashboard>('/dashboard'), api<Demand[]>('/demands')])
        .then(([dashboard, list]) => {
          setData(dashboard);
          setDemands(list.slice(0, 5));
        })
        .catch((e) => setError(e.message));
    } else {
      api<Demand[]>('/demands')
        .then(setDemands)
        .catch((e) => setError(e.message));
    }
  }, [user]);

  return (
    <>
      <Heading
        eyebrow="PAINEL DE CONTROLE"
        title={isFarmer ? 'Olá, ' + user?.name.split(' ')[0] + '!' : 'Visão geral'}
        sub={
          isFarmer
            ? 'Acompanhe suas solicitações e registre novas necessidades.'
            : 'Acompanhe as demandas rurais e os indicadores da gestão municipal.'
        }
        action={
          <NavLink to="/new" className="btn primary">
            <Plus size={17} /> Nova demanda
          </NavLink>
        }
      />

      {error && <div className="error">{error}</div>}

      {isFarmer ? (
        <FarmerOverview demands={demands} />
      ) : (
        data && <StaffOverview data={data} demands={demands} />
      )}
    </>
  );
}

function FarmerOverview({ demands }: { demands: Demand[] }) {
  const inProgress = demands.filter((d) => !['Concluída', 'Indeferida'].includes(d.status)).length;
  const completed = demands.filter((d) => d.status === 'Concluída').length;

  return (
    <>
      <div className="stats-grid">
        <Stat icon={<ClipboardList />} label="Minhas solicitações" value={demands.length} />
        <Stat icon={<Clock3 />} label="Em andamento" value={inProgress} />
        <Stat icon={<CheckCircle2 />} label="Concluídas" value={completed} />
      </div>
      <DemandTable rows={demands} />
    </>
  );
}

function StaffOverview({ data, demands }: { data: Dashboard; demands: Demand[] }) {
  const awaiting = (data.by_status['Pendente'] || 0) + (data.by_status['Em análise'] || 0);
  const statusEntries = Object.entries(data.by_status);
  const pieData = statusEntries.map(([name, value]) => ({ name, value })).filter((x) => x.value > 0);

  return (
    <>
      <div className="stats-grid">
        <Stat icon={<ClipboardList />} label="Total de demandas" value={data.total} tone="green" />
        <Stat icon={<Clock3 />} label="Aguardando análise" value={awaiting} tone="amber" />
        <Stat
          icon={<CheckCircle2 />}
          label="Concluídas"
          value={data.by_status['Concluída'] || 0}
          tone="blue"
        />
        <Stat icon={<Users />} label="Agricultores cadastrados" value={data.farmers} tone="purple" />
      </div>

      <div className="insight-row">
        <div className="insight">
          <div className="insight-icon">
            <MapPinned />
          </div>
          <div>
            <span>Comunidades atendidas</span>
            <b>{data.communities}</b>
            <small>localidades cadastradas</small>
          </div>
        </div>
        <div className="insight">
          <div className="insight-icon">
            <CheckCircle2 />
          </div>
          <div>
            <span>Taxa de conclusão</span>
            <b>{data.completed_rate}%</b>
            <small>das solicitações registradas</small>
          </div>
        </div>
        <div className="insight">
          <div className="insight-icon">
            <CalendarDays />
          </div>
          <div>
            <span>Tempo médio de atendimento</span>
            <b>{data.average_days} dias</b>
            <small>considerando demandas concluídas</small>
          </div>
        </div>
      </div>

      <div className="charts-grid">
        <div className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>Demandas por comunidade</h3>
              <p>Distribuição das solicitações cadastradas</p>
            </div>
            <MapPin size={18} />
          </div>
          <div className="chart">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.by_community} margin={{ top: 10, right: 8, left: -22, bottom: 35 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis
                  dataKey="name"
                  angle={-25}
                  textAnchor="end"
                  interval={0}
                  tick={{ fontSize: 10 }}
                />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="total" fill="#3f8159" radius={[5, 5, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel chart-panel">
          <div className="panel-head">
            <div>
              <h3>Status das demandas</h3>
              <p>Visão geral do fluxo de atendimento</p>
            </div>
            <ClipboardList size={18} />
          </div>
          <div className="status-chart">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={58}
                  outerRadius={82}
                  paddingAngle={3}
                >
                  {statusEntries.map(([name], i) => (
                    <Cell key={name} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="legend">
              {statusEntries.map(([name, value], i) => (
                <div key={name}>
                  <i style={{ background: CHART_COLORS[i % CHART_COLORS.length] }} />
                  {name}
                  <b>{value}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="panel table-panel">
        <div className="panel-head">
          <div>
            <h3>Demandas recentes</h3>
            <p>Últimas solicitações registradas na plataforma</p>
          </div>
          <NavLink to="/demands" className="text-link">
            Ver todas <ArrowUpRight size={15} />
          </NavLink>
        </div>
        <DemandTable rows={demands} />
      </div>
    </>
  );
}
