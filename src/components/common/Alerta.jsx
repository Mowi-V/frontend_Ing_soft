import './Alerta.css';

export default function Alerta({ tipo = 'error', mensaje, onClose }) {
    if (!mensaje) return null;

    return (
        <div className={`alerta-box alerta-${tipo}`}>
            <span className="alerta-icono">
                {tipo === 'exito' ? '✓' : tipo === 'advertencia' ? '⚠' : '✕'}
            </span>
            <span className="alerta-texto">{mensaje}</span>
            {onClose && (
                <button type="button" onClick={onClose} className="alerta-btn-cerrar" aria-label="Cerrar">
                    ×
                </button>
            )}
        </div>
    );
}