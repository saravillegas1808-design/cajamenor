import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  FileText,
  ShieldAlert,
  X,
} from 'lucide-react';
import {
  CategoriaGasto,
  EstadoMovimiento,
  FondoCajaMenor,
  MovimientoCajaMenor,
  TipoSoporte,
} from '../types/cajaMenor';
import { formatCOP } from '../utils/exportUtils';

interface ModalMovimientoProps {
  abierto: boolean;
  onCerrar: () => void;
  onGuardar: (movimiento: MovimientoCajaMenor) => void;
  movimientoEditar?: MovimientoCajaMenor | null;
  fondo: FondoCajaMenor;
  saldoDisponible: number;
  consecutivoSugerido: string;
}

const CATEGORIAS: CategoriaGasto[] = [
  'Papelería y útiles',
  'Transporte urbano y mensajería',
  'Materiales de oficina',
  'Cafetería y atención a clientes',
  'Elementos de aseo',
  'Trámites y autenticaciones',
  'Imprevistos operativos',
];

const TIPOS_SOPORTE: TipoSoporte[] = [
  'Factura Electrónica de Venta (DIAN)',
  'Documento Soporte (No obligados a facturar)',
  'Documento Equivalente POS Electrónico',
  'Recibo Provisional (Pendiente soporte definitivo)',
  'Sin soporte',
];

const CUENTAS_PUC_SUGERIDAS: Record<CategoriaGasto, string> = {
  'Papelería y útiles': '519530 — Útiles, papelería y fotocopias',
  'Transporte urbano y mensajería': '513550 — Transporte, fletes y acarreos',
  'Materiales de oficina': '519595 — Otros gastos operativos de oficina',
  'Cafetería y atención a clientes': '519525 — Elementos de aseo y cafetería',
  'Elementos de aseo': '519525 — Elementos de aseo y cafetería',
  'Trámites y autenticaciones': '514010 — Registro mercantil y trámites legales',
  'Imprevistos operativos': '519595 — Otros gastos menores agencia',
};

export const ModalMovimiento: React.FC<ModalMovimientoProps> = ({
  abierto,
  onCerrar,
  onGuardar,
  movimientoEditar,
  fondo,
  saldoDisponible,
  consecutivoSugerido,
}) => {
  const hoy = new Date().toISOString().slice(0, 10);

  const [modoRegistro, setModoRegistro] = useState<'DIRECTO' | 'FLUJO_ETAPAS'>('DIRECTO');
  const [fecha, setFecha] = useState(hoy);
  const [descripcion, setDescripcion] = useState('');
  const [justificacion, setJustificacion] = useState('');
  const [categoria, setCategoria] = useState<CategoriaGasto>('Papelería y útiles');
  const [responsableSolicitante, setResponsableSolicitante] = useState('');
  const [cargoSolicitante, setCargoSolicitante] = useState('Asesor(a) Agencia Viaja con Adri');
  const [valorSolicitado, setValorSolicitado] = useState<number>(0);
  const [valorEntregado, setValorEntregado] = useState<number>(0);
  const [valorGastado, setValorGastado] = useState<number>(0);
  const [estado, setEstado] = useState<EstadoMovimiento>('Legalizada');
  const [tipoSoporte, setTipoSoporte] = useState<TipoSoporte>('Factura Electrónica de Venta (DIAN)');
  const [numeroSoporte, setNumeroSoporte] = useState('');
  const [proveedorNombre, setProveedorNombre] = useState('');
  const [proveedorNit, setProveedorNit] = useState('');
  const [nombreArchivoSoporte, setNombreArchivoSoporte] = useState('');
  const [cuentaContablePuc, setCuentaContablePuc] = useState(
    CUENTAS_PUC_SUGERIDAS['Papelería y útiles']
  );
  const [observaciones, setObservaciones] = useState('');
  const [erroresValidacion, setErroresValidacion] = useState<string[]>([]);

  useEffect(() => {
    if (movimientoEditar) {
      setFecha(movimientoEditar.fecha);
      setDescripcion(movimientoEditar.descripcion);
      setJustificacion(movimientoEditar.justificacion || '');
      setCategoria(movimientoEditar.categoria);
      setResponsableSolicitante(movimientoEditar.responsableSolicitante);
      setCargoSolicitante(movimientoEditar.cargoSolicitante || 'Colaborador Viaja con Adri');
      setValorSolicitado(movimientoEditar.valorSolicitado);
      setValorEntregado(movimientoEditar.valorEntregado);
      setValorGastado(movimientoEditar.valorGastado);
      setEstado(movimientoEditar.estado);
      setTipoSoporte(movimientoEditar.tipoSoporte);
      setNumeroSoporte(movimientoEditar.numeroSoporte);
      setProveedorNombre(movimientoEditar.proveedorNombre);
      setProveedorNit(movimientoEditar.proveedorNit);
      setNombreArchivoSoporte(movimientoEditar.nombreArchivoSoporte || '');
      setCuentaContablePuc(
        movimientoEditar.cuentaContablePuc || CUENTAS_PUC_SUGERIDAS[movimientoEditar.categoria]
      );
      setObservaciones(movimientoEditar.observaciones || '');
      setErroresValidacion([]);
    } else {
      setFecha(hoy);
      setDescripcion('');
      setJustificacion('');
      setCategoria('Papelería y útiles');
      setResponsableSolicitante('');
      setCargoSolicitante('Asesor(a) Agencia Viaja con Adri');
      setValorSolicitado(0);
      setValorEntregado(0);
      setValorGastado(0);
      setEstado('Legalizada');
      setTipoSoporte('Factura Electrónica de Venta (DIAN)');
      setNumeroSoporte('');
      setProveedorNombre('');
      setProveedorNit('');
      setNombreArchivoSoporte('');
      setCuentaContablePuc(CUENTAS_PUC_SUGERIDAS['Papelería y útiles']);
      setObservaciones('');
      setErroresValidacion([]);
    }
  }, [movimientoEditar, abierto, hoy]);

  if (!abierto) return null;

  const handleCategoriaChange = (nuevaCat: CategoriaGasto) => {
    setCategoria(nuevaCat);
    setCuentaContablePuc(CUENTAS_PUC_SUGERIDAS[nuevaCat]);
  };

  const valorEfectivoReferencia =
    modoRegistro === 'DIRECTO'
      ? valorGastado
      : estado === 'Pendiente de aprobación' || estado === 'Aprobada'
      ? valorSolicitado
      : valorGastado > 0
      ? valorGastado
      : valorEntregado;

  const sobranteCalculado =
    valorEntregado > valorGastado && valorGastado > 0 ? valorEntregado - valorGastado : 0;

  const tieneSoporteValido =
    tipoSoporte !== 'Sin soporte' &&
    tipoSoporte !== 'Recibo Provisional (Pendiente soporte definitivo)' &&
    numeroSoporte.trim().length > 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errores: string[] = [];

    if (!fecha) errores.push('La fecha del movimiento es obligatoria.');
    if (!descripcion.trim()) errores.push('La descripción o concepto del gasto es obligatoria.');
    if (!responsableSolicitante.trim())
      errores.push('El nombre del responsable o solicitante es obligatorio.');

    const montoEvaluar = modoRegistro === 'DIRECTO' ? valorGastado : valorSolicitado || valorGastado;

    if (montoEvaluar <= 0) {
      errores.push('El valor del movimiento debe ser mayor a $0 COP.');
    }

    if (montoEvaluar > fondo.limiteMaximoPorGasto) {
      errores.push(
        `Control FOR-CM-001: El valor (${formatCOP(montoEvaluar)}) supera el límite máximo permitido por gasto individual en Viaja con Adri (${formatCOP(fondo.limiteMaximoPorGasto)}).`
      );
    }

    const saldoPrevioAjustado = movimientoEditar
      ? saldoDisponible + (movimientoEditar.valorGastado || movimientoEditar.valorEntregado || 0)
      : saldoDisponible;

    if (montoEvaluar > saldoPrevioAjustado && estado !== 'Rechazada') {
      errores.push(
        `Control FOR-CM-002: El monto (${formatCOP(montoEvaluar)}) supera el saldo disponible en caja menor (${formatCOP(saldoPrevioAjustado)}).`
      );
    }

    if (
      modoRegistro === 'FLUJO_ETAPAS' &&
      valorEntregado > valorSolicitado &&
      valorSolicitado > 0
    ) {
      errores.push(
        'Control FOR-CM-002: No se puede entregar un valor superior al autorizado en la solicitud sin una nueva aprobación.'
      );
    }

    if (estado === 'Legalizada' && !tieneSoporteValido) {
      errores.push(
        'Control Contable FOR-CM-003: Un gasto no puede marcarse como «Legalizada» si no tiene factura o documento soporte válido con su número consecutivo. Seleccione «Pendiente de legalización» o registre el soporte.'
      );
    }

    if (errores.length > 0) {
      setErroresValidacion(errores);
      return;
    }

    const valorFinalGastado = modoRegistro === 'DIRECTO' ? valorGastado : valorGastado;
    const valorFinalSolicitado =
      modoRegistro === 'DIRECTO' ? valorGastado : valorSolicitado || valorGastado;
    const valorFinalEntregado =
      modoRegistro === 'DIRECTO'
        ? valorGastado
        : estado === 'Pendiente de aprobación' || estado === 'Aprobada' || estado === 'Rechazada'
        ? 0
        : valorEntregado || valorFinalSolicitado;

    const estadoFinal: EstadoMovimiento =
      modoRegistro === 'DIRECTO'
        ? tieneSoporteValido
          ? 'Legalizada'
          : 'Pendiente de legalización'
        : estado;

    const ahoraStr = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const nuevoEvento = {
      id: `ev-${Date.now()}`,
      fechaHora: ahoraStr,
      usuario: responsableSolicitante.trim(),
      rol: 'Responsable de caja menor' as const,
      accion: movimientoEditar
        ? `Actualización de movimiento (${estadoFinal}) — Valor: ${formatCOP(valorFinalGastado || valorFinalSolicitado)}`
        : `Registro en sistema (${estadoFinal}) — Valor: ${formatCOP(valorFinalGastado || valorFinalSolicitado)}`,
      formulario:
        estadoFinal === 'Pendiente de aprobación'
          ? 'FOR-CM-001'
          : estadoFinal === 'Dinero entregado' || estadoFinal === 'Pendiente de legalización'
          ? 'FOR-CM-002'
          : 'FOR-CM-003',
    };

    const nuevoMovimiento: MovimientoCajaMenor = {
      id: movimientoEditar ? movimientoEditar.id : `mov-${Date.now()}`,
      consecutivo: movimientoEditar ? movimientoEditar.consecutivo : consecutivoSugerido,
      fecha,
      descripcion: descripcion.trim(),
      justificacion:
        justificacion.trim() || 'Gasto operativo autorizado para operación de Viaja con Adri.',
      categoria,
      responsableSolicitante: responsableSolicitante.trim(),
      cargoSolicitante: cargoSolicitante.trim(),
      valorSolicitado: valorFinalSolicitado,
      valorEntregado: valorFinalEntregado,
      valorGastado: valorFinalGastado,
      valorReintegradoSobrante:
        valorFinalEntregado > valorFinalGastado && valorFinalGastado > 0
          ? valorFinalEntregado - valorFinalGastado
          : 0,
      estado: estadoFinal,
      tieneSoporte: tieneSoporteValido,
      tipoSoporte,
      numeroSoporte: numeroSoporte.trim(),
      proveedorNombre: proveedorNombre.trim(),
      proveedorNit: proveedorNit.trim(),
      nombreArchivoSoporte: nombreArchivoSoporte.trim() || undefined,
      cuentaContablePuc,
      observaciones: observaciones.trim(),
      historial: movimientoEditar
        ? [...movimientoEditar.historial, nuevoEvento]
        : [nuevoEvento],
    };

    onGuardar(nuevoMovimiento);
    onCerrar();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 overflow-y-auto">
      <div className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-slate-50">
          <div>
            <p className="text-xs font-mono text-slate-500">
              {movimientoEditar ? movimientoEditar.consecutivo : consecutivoSugerido} · Límite máx. por gasto: {formatCOP(fondo.limiteMaximoPorGasto)}
            </p>
            <h2 className="text-lg font-semibold text-slate-900">
              {movimientoEditar
                ? 'Editar / Legalizar Movimiento de Caja Menor'
                : 'Registrar Movimiento de Caja Menor — Viaja con Adri'}
            </h2>
          </div>
          <button
            type="button"
            onClick={onCerrar}
            className="p-2 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-200/60 transition-colors"
            aria-label="Cerrar formulario"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Selector de modo */}
        <div className="px-6 pt-4 pb-2 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setModoRegistro('DIRECTO')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                modoRegistro === 'DIRECTO'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Registro Directo de Gasto
            </button>
            <button
              type="button"
              onClick={() => setModoRegistro('FLUJO_ETAPAS')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                modoRegistro === 'FLUJO_ETAPAS'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Flujo Completo SENA (FOR-CM-001 a 003)
            </button>
          </div>
          <div className="text-xs text-slate-600 font-mono tabular-nums">
            Disponible actual: <strong className="text-slate-900">{formatCOP(saldoDisponible)}</strong>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[78vh] overflow-y-auto">
          {erroresValidacion.length > 0 && (
            <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs space-y-1.5">
              <div className="flex items-center gap-2 font-semibold text-red-800">
                <ShieldAlert className="w-4 h-4 shrink-0" />
                <span>Validación de Control Interno y Contable:</span>
              </div>
              <ul className="list-disc pl-5 space-y-1">
                {erroresValidacion.map((err, idx) => (
                  <li key={idx}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Bloque 1: Datos básicos obligatorios */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Fecha del movimiento *
              </label>
              <input
                type="date"
                value={fecha}
                onChange={(e) => setFecha(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700 font-mono"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Categoría del gasto *
              </label>
              <select
                value={categoria}
                onChange={(e) => handleCategoriaChange(e.target.value as CategoriaGasto)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700 bg-white"
              >
                {CATEGORIAS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Responsable / Solicitante *
              </label>
              <input
                type="text"
                placeholder="Ej. Camila Restrepo"
                value={responsableSolicitante}
                onChange={(e) => setResponsableSolicitante(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Descripción detallada del gasto (Concepto) *
              </label>
              <input
                type="text"
                placeholder="Ej. Compra de papelería para entrega de tiquetes y vouchers"
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Justificación operativa (FOR-CM-001)
              </label>
              <input
                type="text"
                placeholder="Ej. Atención presencial a viajeros corporativos"
                value={justificacion}
                onChange={(e) => setJustificacion(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
              />
            </div>
          </div>

          {/* Bloque 2: Valores y Estado según modo */}
          {modoRegistro === 'DIRECTO' ? (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Valor del gasto en pesos colombianos (COP) *
                </label>
                <input
                  type="number"
                  min={0}
                  step={100}
                  value={valorGastado || ''}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setValorGastado(val);
                    setValorSolicitado(val);
                    setValorEntregado(val);
                  }}
                  placeholder="Ej. 45000"
                  className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
                  required
                />
                <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
                  Monto formateado: {formatCOP(valorGastado)}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Clasificación contable sugerida (PUC)
                </label>
                <input
                  type="text"
                  value={cuentaContablePuc}
                  onChange={(e) => setCuentaContablePuc(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-700 font-mono"
                />
                <p className="mt-1 text-xs text-slate-500">
                  Estado automático según soporte:{' '}
                  <strong className="text-slate-800">
                    {tieneSoporteValido ? 'Legalizada' : 'Pendiente de legalización'}
                  </strong>
                </p>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Estado del flujo SENA *
                  </label>
                  <select
                    value={estado}
                    onChange={(e) => setEstado(e.target.value as EstadoMovimiento)}
                    className="w-full px-2.5 py-2 text-xs border border-slate-300 rounded-lg bg-white font-medium"
                  >
                    <option value="Pendiente de aprobación">1. Pendiente de aprobación (FOR-CM-001)</option>
                    <option value="Aprobada">2. Aprobada por responsable</option>
                    <option value="Rechazada">3. Rechazada</option>
                    <option value="Dinero entregado">4. Dinero entregado (FOR-CM-002)</option>
                    <option value="Pendiente de legalización">5. Pendiente de legalización</option>
                    <option value="En revisión contable">6. En revisión contable (FOR-CM-003)</option>
                    <option value="Devuelta para corrección">7. Devuelta para corrección</option>
                    <option value="Legalizada">8. Legalizada y validada</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Valor solicitado (FOR-CM-001)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={valorSolicitado || ''}
                    onChange={(e) => setValorSolicitado(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Efectivo entregado (FOR-CM-002)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={valorEntregado || ''}
                    onChange={(e) => setValorEntregado(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Valor real gastado (FOR-CM-003)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={100}
                    value={valorGastado || ''}
                    onChange={(e) => setValorGastado(Number(e.target.value))}
                    className="w-full px-3 py-2 text-sm font-mono tabular-nums border border-slate-300 rounded-lg bg-white"
                  />
                </div>
              </div>

              {sobranteCalculado > 0 && (
                <div className="text-xs text-teal-800 bg-teal-50 border border-teal-200 rounded-lg px-3 py-2 font-mono tabular-nums">
                  Control Paso 6 (FOR-CM-003): El solicitante debe devolver en efectivo un sobrante de{' '}
                  <strong>{formatCOP(sobranteCalculado)}</strong> al responsable de caja menor.
                </div>
              )}
            </div>
          )}

          {/* Bloque 3: Verificación de Factura / Soporte Tributario (DIAN) */}
          <div className="border border-slate-200 rounded-lg p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-slate-700" />
                <h3 className="text-sm font-semibold text-slate-900">
                  Verificación de Factura o Soporte Contable (Arts. 615, 617 y 771-2 E.T.)
                </h3>
              </div>
              {tieneSoporteValido ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-emerald-700">
                  <CheckCircle2 className="w-4 h-4" />
                  Soporte tributario completo
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-medium text-amber-700">
                  <AlertTriangle className="w-4 h-4" />
                  Advertencia: Gasto sin soporte definitivo
                </span>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Tipo de soporte presentado *
                </label>
                <select
                  value={tipoSoporte}
                  onChange={(e) => setTipoSoporte(e.target.value as TipoSoporte)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
                >
                  {TIPOS_SOPORTE.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Número de Factura / Documento Soporte
                </label>
                <input
                  type="text"
                  placeholder={
                    tipoSoporte === 'Sin soporte'
                      ? 'Sin número de soporte'
                      : 'Ej. FEVP-48921 o DSE-00194'
                  }
                  value={numeroSoporte}
                  onChange={(e) => setNumeroSoporte(e.target.value)}
                  disabled={tipoSoporte === 'Sin soporte'}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700 disabled:bg-slate-100"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Nombre o Razón Social del Proveedor
                </label>
                <input
                  type="text"
                  placeholder="Ej. Papelería Panamericana S.A."
                  value={proveedorNombre}
                  onChange={(e) => setProveedorNombre(e.target.value)}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  NIT o Cédula del Proveedor
                </label>
                <input
                  type="text"
                  placeholder="Ej. 860.002.190-1"
                  value={proveedorNit}
                  onChange={(e) => setProveedorNit(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Archivo digital del soporte (PDF/Imagen)
                </label>
                <input
                  type="file"
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setNombreArchivoSoporte(file.name);
                    }
                  }}
                  className="w-full text-xs text-slate-600 file:mr-2 file:py-1.5 file:px-3 file:rounded-md file:border file:border-slate-300 file:text-xs file:font-medium file:bg-slate-50 file:text-slate-700 hover:file:bg-slate-100"
                />
                {nombreArchivoSoporte && (
                  <p className="mt-1 text-xs text-teal-700 font-mono truncate">
                    Adjunto: {nombreArchivoSoporte}
                  </p>
                )}
              </div>
            </div>

            {!tieneSoporteValido && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900">
                <strong>Advertencia Contable:</strong> Este movimiento quedará registrado con alerta de{' '}
                <span className="underline">Soporte Pendiente</span>. Recuerde que según el Artículo 771-2 del
                Estatuto Tributario, los gastos sin factura electrónica o documento soporte válido no son
                deducibles para Viaja con Adri y deben subsanarse antes del cierre del viernes.
              </div>
            )}
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Observaciones o notas de auditoría
            </label>
            <input
              type="text"
              placeholder="Opcional: indique detalles de entrega, retenciones o motivos de urgencia"
              value={observaciones}
              onChange={(e) => setObservaciones(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
            <button
              type="button"
              onClick={onCerrar}
              className="px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-medium text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors whitespace-nowrap shrink-0"
            >
              {movimientoEditar ? 'Guardar Cambios del Movimiento' : 'Registrar Movimiento en Caja Menor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
