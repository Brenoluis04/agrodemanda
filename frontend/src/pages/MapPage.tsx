import { useEffect, useState } from 'react';
import { MapPinned, MapPin, ArrowUpRight } from 'lucide-react';
import { api } from '../api';
import type { Demand } from '../api';
import { osmUrl } from '../constants';
import { Heading } from '../components/Heading';

export function MapPage() {
  const [rows, setRows] = useState<Demand[]>([]);

  useEffect(() => {
    api<Demand[]>('/demands').then(setRows);
  }, []);

  const located = rows.filter((d) => d.latitude && d.longitude);

  return (
    <>
      <Heading
        eyebrow="VISÃO TERRITORIAL"
        title="Mapa de demandas"
        sub="Localize solicitações que possuem coordenadas informadas."
      />

      <div className="panel map-info">
        <MapPinned size={20} />
        <div>
          <b>{located.length} demandas com localização</b>
          <span>Demandas sem coordenadas continuam disponíveis na listagem e nos relatórios.</span>
        </div>
      </div>

      <div className="panel map-panel">
        <div className="map-placeholder">
          <MapPinned size={42} />
          <h3>Distribuição geográfica</h3>
          <p>
            O mapa utiliza as coordenadas registradas em cada solicitação. Abra um ponto para
            visualizar sua localização no OpenStreetMap.
          </p>

          {located.length > 0 ? (
            located.map((d) => (
              <a
                key={d.id}
                className="map-row"
                target="_blank"
                rel="noreferrer"
                href={osmUrl(d.latitude!, d.longitude!)}
              >
                <MapPin size={17} />
                <span>
                  <b>{d.title}</b>
                  <small>
                    {d.community_name} · {d.protocol}
                  </small>
                </span>
                <ArrowUpRight size={16} />
              </a>
            ))
          ) : (
            <div className="empty">Nenhuma demanda possui coordenadas cadastradas até o momento.</div>
          )}
        </div>
      </div>
    </>
  );
}
