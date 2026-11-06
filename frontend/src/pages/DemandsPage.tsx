import { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { Plus, Search, Filter } from 'lucide-react';
import { api } from '../api';
import type { Demand } from '../api';
import { STATUS_OPTIONS } from '../constants';
import { Heading } from '../components/Heading';
import { DemandTable } from '../components/DemandTable';

export function DemandsPage() {
  const [rows, setRows] = useState<Demand[]>([]);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    api<Demand[]>('/demands')
      .then(setRows)
      .catch((e) => setError(e.message));
  }, []);

  const filtered = rows.filter(
    (d) =>
      (!status || d.status === status) &&
      `${d.title} ${d.protocol} ${d.community_name} ${d.category}`
        .toLowerCase()
        .includes(search.toLowerCase()),
  );

  return (
    <>
      <Heading
        eyebrow="CENTRAL DE ATENDIMENTO"
        title="Demandas rurais"
        sub="Consulte, filtre e acompanhe as solicitações das comunidades."
        action={
          <NavLink to="/new" className="btn primary">
            <Plus size={17} /> Nova demanda
          </NavLink>
        }
      />

      {error && <div className="error">{error}</div>}

      <div className="panel filters">
        <div className="search-box">
          <Search size={17} />
          <input
            placeholder="Buscar por protocolo, comunidade ou demanda..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="select-box">
          <Filter size={16} />
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="">Todos os status</option>
            {STATUS_OPTIONS.map((x) => (
              <option key={x}>{x}</option>
            ))}
          </select>
        </div>
        <span className="result-count">{filtered.length} solicitações</span>
      </div>

      <div className="panel table-panel">
        <DemandTable rows={filtered} />
      </div>
    </>
  );
}
