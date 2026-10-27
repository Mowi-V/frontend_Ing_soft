import './EstadoBadge.css';

const CONFIG_ESTADOS = {
    P: { label: 'Pendiente', className: 'estado-pendiente' },
    A: { label: 'Aceptada', className: 'estado-aceptada' },
    S: { label: 'Sugerida', className: 'estado-sugerida' },
    R: { label: 'Rechazada', className: 'estado-rechazada' },
    C: { label: 'Cancelada', className: 'estado-cancelada' },
    F: { label: 'Finalizada', className: 'estado-finalizada' }
};

export default function EstadoBadge({ estado }) {
    const config = CONFIG_ESTADOS[estado] || { label: estado || 'Desconocido', className: 'estado-desconocido' };

    return (
        <span className={`estado-badge-pill ${config.className}`}>
            <span className="badge-bullet">●</span> {config.label}
        </span>
    );
}