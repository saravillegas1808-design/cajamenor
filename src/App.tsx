import React, { useState, useMemo } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardCheck,
  Database,
  Edit3,
  FileSpreadsheet,
  FileWarning,
  History,
  Plus,
  RotateCcw,
  Search,
  Settings2,
  ShieldAlert,
  Trash2,
} from 'lucide-react';
import {
  ArqueoCajaMenor,
  EstadoMovimiento,
  FondoCajaMenor,
  MovimientoCajaMenor,
  ReembolsoCajaMenor,
} from './types/cajaMenor';
import {
  FONDO_INICIAL_VCA,
  MOVIMIENTOS_DEMO_SENA,
} from './data/procedimientoData';
import { calcularResumenCaja, formatCOP } from './utils/exportUtils';
import { ModalMovimiento } from './components/ModalMovimiento';
import { ModuloArqueoReembolso } from './components/ModuloArqueoReembolso';
import { ModuloInformesViernes } from './components/ModuloInformesViernes';
import { ModuloProcedimientoNormativa } from './components/ModuloProcedimientoNormativa';

type VistaActiva =
  | 'MOVIMIENTOS'
  | 'ARQUEO_REEMBOLSO'
  | 'INFORMES_VIERNES'
  | 'PROCEDIMIENTO'
  | 'NORMATIVIDAD';

export default function App() {
  const [vistaActiva, setVistaActiva] = useState<VistaActiva>('MOVIMIENTOS');
  const [fondo, setFondo] = useState<FondoCajaMenor>(FONDO_INICIAL_VCA);
  // Cumplimiento estricto: No inventamos movimientos ni valores por defecto; inicia con el fondo oficial de $2.000.000 COP y 0 movimientos inventados.
  const [movimientos, setMovimientos] = useState<MovimientoCajaMenor[]>([]);
  const [arqueos, setArqueos] = useState<ArqueoCajaMenor[]>([]);
  const [reembolsos, setReembolsos] = useState<ReembolsoCajaMenor[]>([]);

  // Estados de modales y filtros
  const [modalMovimientoAbierto, setModalMovimientoAbierto] = useState(false);
  const [movimientoEnEdicion, setMovimientoEnEdicion] =
    useState<MovimientoCajaMenor | null>(null);
  const [movimientoHistorialActivo, setMovimientoHistorialActivo] =
    useState<MovimientoCajaMenor | null>(null);
  const [modalConfigFondoAbierto, setModalConfigFondoAbierto] = useState(false);

  const [busqueda, setBusqueda] = useState('');
  const [filtroSoporte, setFiltroSoporte] = useState<
    'TODOS' | 'CON_SOPORTE' | 'SIN_SOPORTE' | 'EN_PROCESO'
  >('TODOS');

  const resumen = useMemo(
    () => calcularResumenCaja(fondo, movimientos, reembolsos),
    [fondo, movimientos, reembolsos]
  );

  const consecutivoSiguiente = useMemo(() => {
    const num = movimientos.length + 1;
    return `FOR-CM-001-${String(num).padStart(3, '0')}`;
  }, [movimientos.length]);

  const movimientosFiltrados = useMemo(() => {
    return movimientos.filter((m) => {
      const texto = `${m.consecutivo} ${m.descripcion} ${m.responsableSolicitante} ${m.categoria} ${m.proveedorNombre} ${m.numeroSoporte}`.toLowerCase();
      const coincideBusqueda = !busqueda.trim() || texto.includes(busqueda.toLowerCase());

      if (!coincideBusqueda) return false;

      if (filtroSoporte === 'CON_SOPORTE') {
        return m.tieneSoporte && m.tipoSoporte !== 'Sin soporte';
      }
      if (filtroSoporte === 'SIN_SOPORTE') {
        return !m.tieneSoporte || m.tipoSoporte === 'Sin soporte' || !m.numeroSoporte.trim();
      }
      if (filtroSoporte === 'EN_PROCESO') {
        return (
          m.estado === 'Pendiente de aprobación' ||
          m.estado === 'Aprobada' ||
          m.estado === 'Dinero entregado' ||
          m.estado === 'Pendiente de legalización' ||
          m.estado === 'En revisión contable'
        );
      }
      return true;
    });
  }, [movimientos, busqueda, filtroSoporte]);

  const handleGuardarMovimiento = (mov: MovimientoCajaMenor) => {
    setMovimientos((prev) => {
      const existe = prev.some((item) => item.id === mov.id);
      if (existe) {
        return prev.map((item) => (item.id === mov.id ? mov : item));
      }
      return [mov, ...prev];
    });
    setMovimientoEnEdicion(null);
  };

  const handleCambiarEstadoRapido = (
    mov: MovimientoCajaMenor,
    nuevoEstado: EstadoMovimiento,
    accionDescripcion: string,
    formularioAsociado?: string
  ) => {
    const ahora = new Date().toISOString().replace('T', ' ').slice(0, 16);
    const actualizado: MovimientoCajaMenor = {
      ...mov,
      estado: nuevoEstado,
      valorEntregado:
        nuevoEstado === 'Dinero entregado' && mov.valorEntregado === 0
          ? mov.valorSolicitado
          : mov.valorEntregado,
      historial: [
        ...mov.historial,
        {
          id: `ev-${Date.now()}`,
          fechaHora: ahora,
          usuario:
            nuevoEstado === 'Legalizada'
              ? fondo.contadorDesignado
              : nuevoEstado === 'Aprobada'
              ? fondo.aprobadorDesignado
              : fondo.responsableCustodio,
          rol:
            nuevoEstado === 'Legalizada'
              ? 'Área contable'
              : nuevoEstado === 'Aprobada'
              ? 'Aprobador'
              : 'Responsable de caja menor',
          accion: accionDescripcion,
          formulario: formularioAsociado,
        },
      ],
    };
    handleGuardarMovimiento(actualizado);
  };

  const handleEliminarMovimiento = (id: string) => {
    setMovimientos((prev) => prev.filter((m) => m.id !== id));
  };

  const handleRegistrarArqueo = (nuevoArqueo: ArqueoCajaMenor) => {
    setArqueos((prev) => [nuevoArqueo, ...prev]);
  };

  const handleEjecutarReembolso = (
    nuevoReembolso: ReembolsoCajaMenor,
    idsReembolsados: string[]
  ) => {
    const ahora = new Date().toISOString().replace('T', ' ').slice(0, 16);
    setReembolsos((prev) => [nuevoReembolso, ...prev]);
    setMovimientos((prev) =>
      prev.map((m) =>
        idsReembolsados.includes(m.id)
          ? {
              ...m,
              estado: 'Reembolsada',
              reembolsoId: nuevoReembolso.id,
              historial: [
                ...m.historial,
                {
                  id: `ev-${Date.now()}-${m.id}`,
                  fechaHora: ahora,
                  usuario: fondo.responsableCustodio,
                  rol: 'Responsable de caja menor',
                  accion: `Gasto repuesto en Reembolso ${nuevoReembolso.consecutivo}`,
                },
              ],
            }
          : m
      )
    );
  };

  const handleCargarDatosDemoSena = () => {
    setMovimientos(MOVIMIENTOS_DEMO_SENA);
  };

  const handleReiniciarCajaLimpia = () => {
    setMovimientos([]);
    setArqueos([]);
    setReembolsos([]);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* TOP BAR CONTRACT: 1 row, 3 zones separated by gap-8 */}
      <header className="flex items-center justify-between gap-8 px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-30 no-print">
        {/* Zone 1: Single text element wordmark */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setVistaActiva('MOVIMIENTOS');
          }}
          className="text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
        >
          Viaja con Adri
        </a>

        {/* Zone 2: 5 concise single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600">
          <button
            type="button"
            onClick={() => setVistaActiva('MOVIMIENTOS')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              vistaActiva === 'MOVIMIENTOS'
                ? 'border-teal-700 text-slate-900 font-semibold'
                : 'border-transparent'
            }`}
          >
            Movimientos y Saldos
          </button>
          <button
            type="button"
            onClick={() => setVistaActiva('ARQUEO_REEMBOLSO')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              vistaActiva === 'ARQUEO_REEMBOLSO'
                ? 'border-teal-700 text-slate-900 font-semibold'
                : 'border-transparent'
            }`}
          >
            Arqueo y Reembolso
          </button>
          <button
            type="button"
            onClick={() => setVistaActiva('INFORMES_VIERNES')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              vistaActiva === 'INFORMES_VIERNES'
                ? 'border-teal-700 text-slate-900 font-semibold'
                : 'border-transparent'
            }`}
          >
            Informe Viernes
          </button>
          <button
            type="button"
            onClick={() => setVistaActiva('PROCEDIMIENTO')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              vistaActiva === 'PROCEDIMIENTO'
                ? 'border-teal-700 text-slate-900 font-semibold'
                : 'border-transparent'
            }`}
          >
            Procedimiento 12 Pasos
          </button>
          <button
            type="button"
            onClick={() => setVistaActiva('NORMATIVIDAD')}
            className={`hover:text-slate-900 transition-colors whitespace-nowrap shrink-0 py-1 border-b-2 ${
              vistaActiva === 'NORMATIVIDAD'
                ? 'border-teal-700 text-slate-900 font-semibold'
                : 'border-transparent'
            }`}
          >
            Normatividad Colombia
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => {
              setMovimientoEnEdicion(null);
              setModalMovimientoAbierto(true);
            }}
            className="px-4 py-2 text-xs font-medium text-white bg-teal-700 rounded-lg hover:bg-teal-800 transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            Registrar Gasto
          </button>
        </div>
      </header>

      {/* Navegación móvil compacta */}
      <div className="md:hidden flex items-center gap-2 overflow-x-auto px-4 py-2.5 bg-white border-b border-slate-200 text-xs no-print">
        <button
          type="button"
          onClick={() => setVistaActiva('MOVIMIENTOS')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap shrink-0 ${
            vistaActiva === 'MOVIMIENTOS' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Movimientos
        </button>
        <button
          type="button"
          onClick={() => setVistaActiva('ARQUEO_REEMBOLSO')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap shrink-0 ${
            vistaActiva === 'ARQUEO_REEMBOLSO' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Arqueo y Reembolso
        </button>
        <button
          type="button"
          onClick={() => setVistaActiva('INFORMES_VIERNES')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap shrink-0 ${
            vistaActiva === 'INFORMES_VIERNES' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Informe Viernes
        </button>
        <button
          type="button"
          onClick={() => setVistaActiva('PROCEDIMIENTO')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap shrink-0 ${
            vistaActiva === 'PROCEDIMIENTO' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Procedimiento
        </button>
        <button
          type="button"
          onClick={() => setVistaActiva('NORMATIVIDAD')}
          className={`px-3 py-1.5 rounded-md font-medium whitespace-nowrap shrink-0 ${
            vistaActiva === 'NORMATIVIDAD' ? 'bg-slate-900 text-white' : 'text-slate-600'
          }`}
        >
          Normatividad
        </button>
      </div>

      {/* CONTENEDOR PRINCIPAL DE TRABAJO */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {/* Encabezado Contextual y Banda de KPIs Contables */}
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6 no-print">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 font-mono">
                <span>{fondo.empresa}</span>
                <span aria-hidden="true">·</span>
                <span>Fondo {fondo.codigoFondo}</span>
                <span aria-hidden="true">·</span>
                <span>{fondo.actaApertura}</span>
                <span aria-hidden="true">·</span>
                <span>Custodio: {fondo.responsableCustodio}</span>
              </div>
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
                Plataforma Administrativa y Contable de Caja Menor
              </h1>
              <p className="text-sm text-slate-600 max-w-3xl">
                Control de movimientos, verificación de facturas electrónicas y documentos soporte (DIAN), arqueos físicos (FOR-CM-004), reembolsos e informes semanales de los viernes para Contabilidad.
              </p>
            </div>

            {/* Controles del entorno de trabajo */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setModalConfigFondoAbierto(true)}
                className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Settings2 className="w-3.5 h-3.5" />
                Parámetros del Fondo (Paso 1)
              </button>

              {movimientos.length === 0 ? (
                <button
                  type="button"
                  onClick={handleCargarDatosDemoSena}
                  className="px-3 py-2 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <Database className="w-3.5 h-3.5" />
                  Cargar Escenario Demostrativo SENA (3 Gastos)
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleReiniciarCajaLimpia}
                  className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  Reiniciar a $2.000.000 Sin Movimientos
                </button>
              )}
            </div>
          </div>

          {/* 4-Column Financial KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-2 border-t border-slate-100">
            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="text-xs text-slate-500 block">
                Fondo Inicial Autorizado (Paso 1)
              </span>
              <span className="text-xl font-mono tabular-nums font-bold text-slate-900 mt-1 block">
                {formatCOP(resumen.fondoAutorizado)}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                Límite máx. por gasto: <span className="font-mono">{formatCOP(fondo.limiteMaximoPorGasto)}</span>
              </span>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="text-xs text-slate-500 block">
                Total Gastos y Entregas del Período
              </span>
              <span className="text-xl font-mono tabular-nums font-bold text-slate-900 mt-1 block">
                {formatCOP(resumen.totalEgresosActivos)}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                Con soporte: <span className="font-mono">{formatCOP(resumen.totalGastosLegalizadosYEnRevision)}</span> · Ejecución: <span className="font-mono">{resumen.porcentajeEjecucion}%</span>
              </span>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="text-xs text-slate-500 block">
                Saldo Disponible en Caja Menor
              </span>
              <span
                className={`text-xl font-mono tabular-nums font-bold mt-1 block ${
                  resumen.saldoDisponibleEfectivo < fondo.montoAutorizado * 0.3
                    ? 'text-amber-700'
                    : 'text-teal-800'
                }`}
              >
                {formatCOP(resumen.saldoDisponibleEfectivo)}
              </span>
              <span className="text-xs text-slate-500 mt-1 block">
                {resumen.requiereReembolsoAlerta
                  ? 'Umbral alcanzado: Solicitar reembolso'
                  : `Umbral de reembolso al ${fondo.umbralReembolsoPorcentaje}%`}
              </span>
            </div>

            <div className="p-4 rounded-lg border border-slate-200 bg-slate-50/60">
              <span className="text-xs text-slate-500 block">
                Verificación de Facturas y Soportes
              </span>
              {resumen.movimientosSinSoporteValido.length === 0 ? (
                <>
                  <span className="text-base font-semibold text-emerald-800 mt-1.5 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                    0 Soportes Pendientes
                  </span>
                  <span className="text-xs text-slate-500 mt-1 block">
                    Todos los egresos tienen soporte válido
                  </span>
                </>
              ) : (
                <>
                  <span className="text-base font-semibold text-amber-800 mt-1.5 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                    {resumen.movimientosSinSoporteValido.length} Gasto(s) Sin Soporte
                  </span>
                  <span className="text-xs text-amber-800 mt-1 block font-mono">
                    Por legalizar: {formatCOP(resumen.totalAnticiposPendientesLegalizar)}
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Alerta proactiva si existen gastos sin soporte o si se requiere reembolso */}
          {(resumen.movimientosSinSoporteValido.length > 0 ||
            resumen.requiereReembolsoAlerta) && (
            <div className="p-3.5 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
                <span>
                  {resumen.movimientosSinSoporteValido.length > 0 && (
                    <>
                      <strong>Alerta de Auditoría Contable:</strong> Hay{' '}
                      <strong>{resumen.movimientosSinSoporteValido.length} movimiento(s)</strong> sin factura electrónica o documento soporte válido.{' '}
                    </>
                  )}
                  {resumen.requiereReembolsoAlerta && (
                    <>
                      <strong>Aviso de Liquidez:</strong> Se ha consumido el{' '}
                      <strong>{resumen.porcentajeEjecucion}%</strong> del fondo autorizado; proceda a solicitar reembolso en la pestaña Arqueo y Reembolso.
                    </>
                  )}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setVistaActiva('INFORMES_VIERNES')}
                className="font-semibold text-teal-900 underline whitespace-nowrap shrink-0"
              >
                Revisar en Informe de Viernes →
              </button>
            </div>
          )}
        </section>

        {/* VISTA 1: LIBRO DE MOVIMIENTOS Y VERIFICACIÓN DE SOPORTES */}
        {vistaActiva === 'MOVIMIENTOS' && (
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            {/* Barra de filtros y búsqueda */}
            <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-200 pb-4">
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
                <button
                  type="button"
                  onClick={() => setFiltroSoporte('TODOS')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    filtroSoporte === 'TODOS'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Todos los movimientos ({movimientos.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroSoporte('CON_SOPORTE')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    filtroSoporte === 'CON_SOPORTE'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Con Soporte Válido
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroSoporte('SIN_SOPORTE')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    filtroSoporte === 'SIN_SOPORTE'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Sin Soporte / Alerta ({resumen.movimientosSinSoporteValido.length})
                </button>
                <button
                  type="button"
                  onClick={() => setFiltroSoporte('EN_PROCESO')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    filtroSoporte === 'EN_PROCESO'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  En Flujo de Legalización
                </button>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-64">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={busqueda}
                    onChange={(e) => setBusqueda(e.target.value)}
                    placeholder="Buscar por concepto, responsable, factura..."
                    className="w-full pl-8 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setVistaActiva('INFORMES_VIERNES')}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5" />
                  Informe Viernes
                </button>
              </div>
            </div>

            {/* Tabla o Estado Vacío Transparente */}
            {movimientos.length === 0 ? (
              <div className="py-12 px-6 text-center border border-dashed border-slate-300 rounded-xl bg-slate-50/50 max-w-2xl mx-auto my-4 space-y-4">
                <div className="space-y-1.5">
                  <p className="text-xs font-mono text-teal-800 font-semibold">
                    FONDO ABIERTO POR $2.000.000 COP · SIN MOVIMIENTOS REGISTRADOS AÚN
                  </p>
                  <h3 className="text-lg font-semibold text-slate-900">
                    Comience registrando los gastos reales de la caja menor de Viaja con Adri
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    Para mantener una caja menor transparente, organizada y confiable, el sistema <strong>no inventa movimientos, valores ni soportes</strong>. Ingrese cada gasto con su fecha, descripción, valor, responsable y factura, o cargue el escenario demostrativo de la evidencia SENA si desea explorar un ejemplo práctico.
                  </p>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      setMovimientoEnEdicion(null);
                      setModalMovimientoAbierto(true);
                    }}
                    className="px-4 py-2.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    Registrar Primer Gasto de Caja Menor
                  </button>
                  <button
                    type="button"
                    onClick={handleCargarDatosDemoSena}
                    className="px-4 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
                  >
                    <Database className="w-4 h-4" />
                    Cargar Ejemplo Demostrativo SENA (3 Movimientos)
                  </button>
                </div>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-3 pr-3 font-medium">Consecutivo / Fecha</th>
                      <th className="py-3 px-3 font-medium">Descripción y Categoría</th>
                      <th className="py-3 px-3 font-medium">Responsable</th>
                      <th className="py-3 px-3 font-medium">Verificación de Soporte (DIAN)</th>
                      <th className="py-3 px-3 font-medium">Estado del Ciclo</th>
                      <th className="py-3 px-3 font-medium text-right">Valor (COP)</th>
                      <th className="py-3 pl-3 font-medium text-right">Acciones Contables</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {movimientosFiltrados.map((m) => {
                      const soporteOk =
                        m.tieneSoporte &&
                        m.tipoSoporte !== 'Sin soporte' &&
                        m.numeroSoporte.trim().length > 0;

                      return (
                        <tr key={m.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 pr-3 align-top whitespace-nowrap">
                            <div className="font-mono font-semibold text-slate-900">
                              {m.consecutivo}
                            </div>
                            <div className="font-mono text-slate-500 mt-0.5">{m.fecha}</div>
                          </td>

                          <td className="py-3.5 px-3 align-top max-w-xs">
                            <div className="font-medium text-slate-900">{m.descripcion}</div>
                            <div className="text-slate-500 mt-0.5">
                              {m.categoria}
                              {m.cuentaContablePuc ? ` · ${m.cuentaContablePuc}` : ''}
                            </div>
                          </td>

                          <td className="py-3.5 px-3 align-top whitespace-nowrap">
                            <div className="font-medium text-slate-900">
                              {m.responsableSolicitante}
                            </div>
                            <div className="text-slate-500 mt-0.5">{m.cargoSolicitante}</div>
                          </td>

                          <td className="py-3.5 px-3 align-top">
                            {soporteOk ? (
                              <div className="space-y-0.5">
                                <div className="inline-flex items-center gap-1 font-medium text-emerald-800">
                                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-700 shrink-0" />
                                  <span>{m.tipoSoporte}</span>
                                </div>
                                <div className="font-mono text-slate-600">
                                  N° {m.numeroSoporte} · {m.proveedorNombre || 'Proveedor'} (NIT{' '}
                                  {m.proveedorNit || 'N/A'})
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-0.5">
                                <div className="inline-flex items-center gap-1 font-semibold text-amber-800">
                                  <FileWarning className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                                  <span>Soporte Pendiente / Sin Factura</span>
                                </div>
                                <div className="text-amber-700">
                                  Exigir factura electrónica o doc. soporte antes del viernes
                                </div>
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-3 align-top whitespace-nowrap">
                            <div className="font-medium text-slate-900">{m.estado}</div>
                            {m.valorReintegradoSobrante > 0 && (
                              <div className="text-teal-700 font-mono mt-0.5">
                                Vuelto devuelto: {formatCOP(m.valorReintegradoSobrante)}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 px-3 align-top text-right font-mono tabular-nums whitespace-nowrap">
                            <div className="font-semibold text-slate-900 text-sm">
                              {formatCOP(m.valorGastado || m.valorEntregado || m.valorSolicitado)}
                            </div>
                            {m.valorEntregado > 0 && m.valorEntregado !== m.valorGastado && (
                              <div className="text-slate-500">
                                Entregado: {formatCOP(m.valorEntregado)}
                              </div>
                            )}
                          </td>

                          <td className="py-3.5 pl-3 align-top text-right whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              {m.estado === 'Pendiente de aprobación' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCambiarEstadoRapido(
                                      m,
                                      'Aprobada',
                                      'Solicitud revisada y aprobada (Paso 3)'
                                    )
                                  }
                                  className="px-2 py-1 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded transition-colors"
                                >
                                  Aprobar
                                </button>
                              )}

                              {m.estado === 'Aprobada' && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCambiarEstadoRapido(
                                      m,
                                      'Pendiente de legalización',
                                      'Entrega física de efectivo realizada (FOR-CM-002)',
                                      'FOR-CM-002'
                                    )
                                  }
                                  className="px-2 py-1 text-xs font-medium text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded transition-colors"
                                >
                                  Entregar Efectivo
                                </button>
                              )}

                              {m.estado === 'En revisión contable' && soporteOk && (
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleCambiarEstadoRapido(
                                      m,
                                      'Legalizada',
                                      'Soporte y clasificación PUC validados por Contabilidad (Paso 7)',
                                      'FOR-CM-003'
                                    )
                                  }
                                  className="px-2 py-1 text-xs font-medium text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition-colors inline-flex items-center gap-1"
                                >
                                  <ClipboardCheck className="w-3 h-3" />
                                  Validar Contabilidad
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => {
                                  setMovimientoEnEdicion(m);
                                  setModalMovimientoAbierto(true);
                                }}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                title="Editar o adjuntar soporte (FOR-CM-003)"
                              >
                                <Edit3 className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => setMovimientoHistorialActivo(m)}
                                className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded transition-colors"
                                title="Ver trazabilidad de auditoría (Paso 12)"
                              >
                                <History className="w-3.5 h-3.5" />
                              </button>

                              <button
                                type="button"
                                onClick={() => handleEliminarMovimiento(m.id)}
                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded transition-colors"
                                title="Eliminar registro"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* VISTA 2: ARQUEO DE CAJA MENOR (FOR-CM-004) Y REEMBOLSO (PASO 10) */}
        {vistaActiva === 'ARQUEO_REEMBOLSO' && (
          <ModuloArqueoReembolso
            fondo={fondo}
            movimientos={movimientos}
            resumen={resumen}
            arqueos={arqueos}
            reembolsos={reembolsos}
            onRegistrarArqueo={handleRegistrarArqueo}
            onEjecutarReembolso={handleEjecutarReembolso}
            onEditarMovimiento={(mov) => {
              setMovimientoEnEdicion(mov);
              setModalMovimientoAbierto(true);
            }}
          />
        )}

        {/* VISTA 3: INFORME SEMANAL DE VIERNES Y CIERRE MENSUAL (FOR-CM-006) */}
        {vistaActiva === 'INFORMES_VIERNES' && (
          <ModuloInformesViernes
            fondo={fondo}
            movimientos={movimientos}
            resumen={resumen}
            ultimoArqueo={arqueos[0] || null}
            onAbrirNuevoMovimiento={() => {
              setMovimientoEnEdicion(null);
              setModalMovimientoAbierto(true);
            }}
            onEditarMovimiento={(mov) => {
              setMovimientoEnEdicion(mov);
              setModalMovimientoAbierto(true);
            }}
          />
        )}

        {/* VISTA 4: PROCEDIMIENTO PASO A PASO Y FLUJOGRAMA */}
        {vistaActiva === 'PROCEDIMIENTO' && (
          <ModuloProcedimientoNormativa subVistaInicial="PROCEDIMIENTO" />
        )}

        {/* VISTA 5: NORMATIVIDAD COLOMBIANA Y ORIENTADOR CONTABLE */}
        {vistaActiva === 'NORMATIVIDAD' && (
          <ModuloProcedimientoNormativa subVistaInicial="NORMATIVIDAD" />
        )}
      </main>

      {/* FOOTER SOBRIO Y FUNCIONAL */}
      <footer className="bg-white border-t border-slate-200 px-6 py-4 mt-12 no-print">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            <span>{fondo.empresa} · Manejo Administrativo y Contable de Caja Menor</span>
            <span className="mx-2" aria-hidden="true">·</span>
            <span>Evidencia SENA Medellín — Aprendiz: Saray Villegas Ochoa (Ficha 3278193)</span>
          </div>
          <div className="font-mono">
            Fondo autorizado: {formatCOP(fondo.montoAutorizado)} · Saldo disponible: {formatCOP(resumen.saldoDisponibleEfectivo)}
          </div>
        </div>
      </footer>

      {/* MODAL DE REGISTRO / EDICIÓN DE MOVIMIENTO */}
      <ModalMovimiento
        abierto={modalMovimientoAbierto}
        onCerrar={() => {
          setModalMovimientoAbierto(false);
          setMovimientoEnEdicion(null);
        }}
        onGuardar={handleGuardarMovimiento}
        movimientoEditar={movimientoEnEdicion}
        fondo={fondo}
        saldoDisponible={resumen.saldoDisponibleEfectivo}
        consecutivoSugerido={consecutivoSiguiente}
      />

      {/* MODAL DE TRAZABILIDAD Y BITÁCORA (PASO 12) */}
      {movimientoHistorialActivo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-xl w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <p className="text-xs font-mono text-slate-500">
                  Paso 12 · Trazabilidad y Conservación Documental (Art. 632 E.T.)
                </p>
                <h3 className="text-base font-semibold text-slate-900">
                  Bitácora de Auditoría — {movimientoHistorialActivo.consecutivo}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setMovimientoHistorialActivo(null)}
                className="text-xs font-medium text-slate-600 hover:text-slate-900"
              >
                Cerrar
              </button>
            </div>

            <div className="space-y-2.5 max-h-80 overflow-y-auto">
              {movimientoHistorialActivo.historial.map((ev) => (
                <div
                  key={ev.id}
                  className="p-3 rounded-lg bg-slate-50 border border-slate-200 text-xs space-y-1"
                >
                  <div className="flex items-center justify-between font-mono text-slate-500">
                    <span>{ev.fechaHora}</span>
                    {ev.formulario && <span className="font-semibold text-teal-800">{ev.formulario}</span>}
                  </div>
                  <div className="font-medium text-slate-900">{ev.accion}</div>
                  <div className="text-slate-600">
                    Usuario: <strong>{ev.usuario}</strong> ({ev.rol})
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE CONFIGURACIÓN DE APERTURA DEL FONDO (PASO 1) */}
      {modalConfigFondoAbierto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4">
          <div className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-6 space-y-4">
            <div className="border-b border-slate-200 pb-3">
              <p className="text-xs font-mono text-slate-500">
                Paso 1 del Procedimiento · Apertura y Configuración del Fondo
              </p>
              <h3 className="text-base font-semibold text-slate-900">
                Parámetros Autorizados del Fondo de Caja Menor
              </h3>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Monto del Fondo Inicial Autorizado por Gerencia (COP)
                </label>
                <input
                  type="number"
                  min={100000}
                  step={50000}
                  value={fondo.montoAutorizado}
                  onChange={(e) =>
                    setFondo({ ...fondo, montoAutorizado: Number(e.target.value) || 2000000 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Límite Máximo Individual por Gasto (FOR-CM-001) (COP)
                </label>
                <input
                  type="number"
                  min={10000}
                  step={10000}
                  value={fondo.limiteMaximoPorGasto}
                  onChange={(e) =>
                    setFondo({ ...fondo, limiteMaximoPorGasto: Number(e.target.value) || 300000 })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono tabular-nums"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Responsable Custodio de Caja Menor
                </label>
                <input
                  type="text"
                  value={fondo.responsableCustodio}
                  onChange={(e) =>
                    setFondo({ ...fondo, responsableCustodio: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-700 mb-1">
                  Responsable Área Contable (Recepción Informe Viernes)
                </label>
                <input
                  type="text"
                  value={fondo.contadorDesignado}
                  onChange={(e) =>
                    setFondo({ ...fondo, contadorDesignado: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-slate-200">
              <button
                type="button"
                onClick={() => setModalConfigFondoAbierto(false)}
                className="px-4 py-2 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors"
              >
                Guardar Parámetros del Fondo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
