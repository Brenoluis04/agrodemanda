import { NavLink } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';
import type { Demand } from '../api';
import { Status } from './Status';

export function DemandTable({ rows }: { rows: Demand[] }) {
  return (
    <div className="table-scroll">
      <table>
        <thead>
          <tr>
            <th>Solicitação</th>
            <th>Comunidade</th>
            <th>Categoria</th>
            <th>Data</th>
            <th>Status</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {rows.map((d) => (
            <tr key={d.id}>
              <td>
                <NavLink to={`/demands/${d.id}`} className="demand-link">
                  <b>{d.title}</b>
                  <small>{d.protocol}</small>
                </NavLink>
              </td>
              <td>{d.community_name}</td>
              <td>{d.category}</td>
              <td>{new Date(d.created_at).toLocaleDateString('pt-BR')}</td>
              <td>
                <Status value={d.status} />
              </td>
              <td>
                <NavLink to={`/demands/${d.id}`} className="arrow-link">
                  <ChevronRight size={18} />
                </NavLink>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length === 0 && <div className="empty">Nenhuma solicitação encontrada.</div>}
    </div>
  );
}
