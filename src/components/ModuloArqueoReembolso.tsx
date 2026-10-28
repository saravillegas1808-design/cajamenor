import React, { useState } from 'react';
import {
  AlertTriangle,
  Calculator,
  CheckCircle2,
  Printer,
  RefreshCw,
  Scale,
  ShieldAlert,
} from 'lucide-react';
import {
  ArqueoCajaMenor,
  DenominacionEfectivo,
  FondoCajaMenor,
  MovimientoCajaMenor,
  ReembolsoCajaMenor,
} from '../types/cajaMenor';
import { DENOMINACIONES_COP_INICIALES } from '../data/procedimientoData';
import { ResumenFinancieroCaja, formatCOP } from '../utils/exportUtils';

interface ModuloArqueoReembolsoProps {
  fondo: FondoCajaMenor;
  movimientos: MovimientoCajaMenor[];
  resumen: ResumenFinancieroCaja;
  arqueos: ArqueoCajaMenor[];
  reembolsos: ReembolsoCajaMenor[];
  onRegistrarArqueo: (arqueo: ArqueoCajaMenor) => void;
  onEjecutarReembolso: (reembolso: ReembolsoCajaMenor, idsReembolsados: string[]) => void;
  onEditarMovimiento: (movimiento: MovimientoCajaMenor) => void;
}

export const ModuloArqueoReembolso: React.FC<ModuloArqueoReembolsoProps> = ({
  fondo,
  movimientos,
  resumen,
  arqueos,
  reembolsos,
  onRegistrarArqueo,
  onEjecutarReembolso,
  onEditarMovimiento,
}) => {
  const [modoConteo, setModoConteo] = useState<'DENOMINACIONES' | 'MONTO_DIRECTO'>('DENOMINACIONES');
  const [denominaciones, setDenominaciones] = useState<DenominacionEfectivo[]>(
    DENOMINACIONES_COP_INICIALES
  );
  const [efectivoManual, setEfectivoManual] = useState<number>(resumen.saldoDisponibleEfectivo);
  const [verificadorDesignado, setVerificadorDesignado] = useState<string>(
    'Saray Villegas Ochoa'
  );
  const [cargoVerificador, setCargoVerificador] = useState<string>(
    'Delegada Área Contable / Auditoría Interna'
  );
  const [observacionesArqueo, setObservacionesArqueo] = useState<string>('');
  const [mensajeConfirmacion, setMensajeConfirmacion] = useState<string | null>(null);

  // Cálculo del efectivo físico contado
  const totalPorDenominaciones = denominaciones.reduce(
    (acc, d) => acc + d.valor * (d.cantidad || 0),
    0
  );

  const efectivoFisicoContado =
    modoConteo === 'DENOMINACIONES' ? totalPorDenominaciones : efectivoManual || 0;

  // Ecuación de conciliación del arqueo (Paso 9 del procedimiento SENA)
  const saldoTeoricoSistema = resumen.saldoDisponibleEfectivo;
  const diferenciaEfectivo = efectivoFisicoContado - saldoTeoricoSistema;
  const totalJustificado =
    efectivoFisicoContado +
    resumen.totalGastosLegalizadosYEnRevision +
    resumen.totalAnticiposPendientesLegalizar;

  const estadoConciliacion: ArqueoCajaMenor['estadoConciliacion'] =
    diferenciaEfectivo === 0
      ? 'Cuadre exacto'
      : diferenciaEfectivo < 0
      ? 'Faltante detectado'
      : 'Sobrante detectado';

  const handleCantidadDenominacion = (valorDenom: number, cantidadStr: string) => {
    const cant = Math.max(0, parseInt(cantidadStr || '0', 10) || 0);
    setDenominaciones((prev) =>
      prev.map((d) => (d.valor === valorDenom ? { ...d, cantidad: cant } : d))
    );
  };

  const handleAutocompletarEfectivoTeorico = () => {
    let restante = Math.max(0, resumen.saldoDisponibleEfectivo);
    const nuevas = DENOMINACIONES_COP_INICIALES.map((d) => {
      if (restante >= d.valor) {
        const cant = Math.floor(restante / d.valor);
        restante = restante - cant * d.valor;
        return { ...d, cantidad: cant };
      }
      return { ...d, cantidad: 0 };
    });
    setDenominaciones(nuevas);
    setEfectivoManual(resumen.saldoDisponibleEfectivo);
  };

  const handleLimpiarConteo = () => {
    setDenominaciones(DENOMINACIONES_COP_INICIALES.map((d) => ({ ...d, cantidad: 0 })));
    setEfectivoManual(0);
  };

  const handleGuardarActaArqueo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!verificadorDesignado.trim()) return;

    const numeroConsecutivo = `FOR-CM-004-${String(arqueos.length + 1).padStart(3, '0')}`;
    const ahora = new Date().toISOString().replace('T', ' ').slice(0, 16);

    const nuevoArqueo: ArqueoCajaMenor = {
      id: `arq-${Date.now()}`,
      consecutivo: numeroConsecutivo,
      fechaHora: ahora,
      responsableCaja: fondo.responsableCustodio,
      verificadorDesignado: verificadorDesignado.trim(),
      cargoVerificador: cargoVerificador.trim(),
      fondoAutorizado: fondo.montoAutorizado,
      efectivoFisicoContado,
      totalGastosConSoporte: resumen.totalGastosLegalizadosYEnRevision,
      totalGastosSinSoporte: resumen.movimientosSinSoporteValido.reduce(
        (acc, m) => acc + (m.valorGastado || m.valorEntregado || 0),
        0
      ),
      totalAnticiposPendientes: resumen.totalAnticiposPendientesLegalizar,
      saldoTeoricoSistema,
      totalJustificado,
      diferencia: diferenciaEfectivo,
      estadoConciliacion,
      observaciones:
        observacionesArqueo.trim() ||
        (diferenciaEfectivo === 0
          ? 'Arqueo físico conciliado sin diferencias respecto al sistema.'
          : diferenciaEfectivo < 0
          ? `Se detecta faltante de efectivo por ${formatCOP(Math.abs(diferenciaEfectivo))}. Se solicita descargo y reintegro al custodio.`
          : `Se detecta sobrante de efectivo por ${formatCOP(diferenciaEfectivo)}. Pendiente verificar factura o vuelto no registrado.`),
      denominaciones: [...denominaciones],
    };

    onRegistrarArqueo(nuevoArqueo);
    setMensajeConfirmacion(
      `Acta de Arqueo ${numeroConsecutivo} registrada correctamente (${estadoConciliacion}).`
    );
    setTimeout(() => setMensajeConfirmacion(null), 5000);
  };

  // Movimientos aptos para reembolso (Paso 10: Legalizados y con soporte válido)
  const movimientosAptosReembolso = movimientos.filter(
    (m) =>
      (m.estado === 'Legalizada' || m.estado === 'En revisión contable') &&
      m.tieneSoporte &&
      m.tipoSoporte !== 'Sin soporte'
  );

  const valorTotalReembolsable = movimientosAptosReembolso.reduce(
    (acc, m) => acc + (m.valorGastado || 0),
    0
  );

  const handleConfirmarReembolso = () => {
    if (movimientosAptosReembolso.length === 0) return;

    const consecutivoReemb = `REEMB-CM-${String(reembolsos.length + 1).padStart(3, '0')}`;
    const hoy = new Date().toISOString().slice(0, 10);

    const nuevoReembolso: ReembolsoCajaMenor = {
      id: `reemb-${Date.now()}`,
      consecutivo: consecutivoReemb,
      fechaSolicitud: hoy,
      fechaAprobacion: hoy,
      solicitadoPor: fondo.responsableCustodio,
      revisadoContabilidadPor: fondo.contadorDesignado,
      aprobadoPor: fondo.aprobadorDesignado,
      valorReembolso: valorTotalReembolsable,
      cantidadMovimientos: movimientosAptosReembolso.length,
      movimientosIds: movimientosAptosReembolso.map((m) => m.id),
      estado: 'Reembolsada',
      observaciones: `Reposición de fondo autorizada por ${formatCOP(valorTotalReembolsable)} correspondiente a ${movimientosAptosReembolso.length} gastos con soporte validado.`,
    };

    onEjecutarReembolso(
      nuevoReembolso,
      movimientosAptosReembolso.map((m) => m.id)
    );
    setMensajeConfirmacion(
      `Reembolso ${consecutivoReemb} por ${formatCOP(valorTotalReembolsable)} aplicado. El efectivo disponible de la caja menor ha sido repuesto.`
    );
    setTimeout(() => setMensajeConfirmacion(null), 6000);
  };

  return (
    <div className="space-y-8">
      {mensajeConfirmacion && (
        <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>{mensajeConfirmacion}</span>
          </div>
          <button
            type="button"
            onClick={() => setMensajeConfirmacion(null)}
            className="text-xs font-medium underline"
          >
            Cerrar
          </button>
        </div>
      )}

      {/* SECCIÓN 1: FOR-CM-004 ARQUEO DE CAJA MENOR */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-mono text-slate-500">
              Paso 9 del Procedimiento · Formulario Oficial FOR-CM-004
            </p>
            <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
              Arqueo Físico de Caja Menor y Detección de Diferencias
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Compare el conteo físico de billetes y monedas en custodia frente al saldo registrado en el sistema para identificar sobrantes o faltantes.
            </p>
          </div>
          <div className="flex items-center gap-2 no-print">
            <button
              type="button"
              onClick={handleAutocompletarEfectivoTeorico}
              className="px-3 py-2 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Simular Conteo Exacto ({formatCOP(resumen.saldoDisponibleEfectivo)})
            </button>
            <button
              type="button"
              onClick={handleLimpiarConteo}
              className="px-3 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              Reiniciar Conteo a $0
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Columna izquierda: Conteo de billetes y monedas */}
          <div className="lg:col-span-7 border border-slate-200 rounded-lg p-4 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Calculator className="w-4 h-4 text-teal-700" />
                <h3 className="text-sm font-semibold text-slate-900">
                  1. Conteo Físico de Efectivo (COP)
                </h3>
              </div>
              <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
                <button
                  type="button"
                  onClick={() => setModoConteo('DENOMINACIONES')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    modoConteo === 'DENOMINACIONES'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Por Billetes y Monedas
                </button>
                <button
                  type="button"
                  onClick={() => setModoConteo('MONTO_DIRECTO')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                    modoConteo === 'MONTO_DIRECTO'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Ingreso Valor Total
                </button>
              </div>
            </div>

            {modoConteo === 'DENOMINACIONES' ? (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 text-xs text-slate-500">
                      <th className="py-2 pr-3 font-medium">Denominación</th>
                      <th className="py-2 px-3 font-medium">Tipo</th>
                      <th className="py-2 px-3 font-medium">Cantidad Física</th>
                      <th className="py-2 pl-3 font-medium text-right">Subtotal (COP)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 text-xs">
                    {denominaciones.map((d) => (
                      <tr key={d.valor} className="hover:bg-slate-50/80">
                        <td className="py-2 pr-3 font-mono font-medium text-slate-900">
                          {d.etiqueta}
                        </td>
                        <td className="py-2 px-3 text-slate-500">{d.tipo}</td>
                        <td className="py-1.5 px-3">
                          <input
                            type="number"
                            min={0}
                            value={d.cantidad || ''}
                            placeholder="0"
                            onChange={(e) =>
                              handleCantidadDenominacion(d.valor, e.target.value)
                            }
                            className="w-24 px-2.5 py-1 text-xs font-mono tabular-nums border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-700"
                          />
                        </td>
                        <td className="py-2 pl-3 font-mono tabular-nums text-right font-medium text-slate-900">
                          {formatCOP(d.valor * (d.cantidad || 0))}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-lg border border-slate-200 space-y-2">
                <label className="block text-xs font-medium text-slate-700">
                  Total efectivo físico contado en caja (COP):
                </label>
                <input
                  type="number"
                  min={0}
                  step={50}
                  value={efectivoManual}
                  onChange={(e) => setEfectivoManual(Number(e.target.value))}
                  className="w-full px-3 py-2 text-base font-mono tabular-nums border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-teal-700"
                />
                <p className="text-xs text-slate-500 font-mono">
                  Equivalente: {formatCOP(efectivoManual)}
                </p>
              </div>
            )}
          </div>

          {/* Columna derecha: Conciliación, Diferencias y Acta FOR-CM-004 */}
          <form
            onSubmit={handleGuardarActaArqueo}
            className="lg:col-span-5 border border-slate-200 rounded-lg p-5 space-y-4 bg-slate-50/60"
          >
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-700" />
              <h3 className="text-sm font-semibold text-slate-900">
                2. Conciliación del Fondo ({fondo.codigoFondo})
              </h3>
            </div>

            <div className="space-y-2.5 text-xs border-b border-slate-200 pb-4">
              <div className="flex items-center justify-between text-slate-600">
                <span>Fondo Fijo Autorizado por Gerencia:</span>
                <span className="font-mono tabular-nums font-semibold text-slate-900">
                  {formatCOP(fondo.montoAutorizado)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>(-) Gastos con soporte en sistema:</span>
                <span className="font-mono tabular-nums text-slate-900">
                  {formatCOP(resumen.totalGastosLegalizadosYEnRevision)}
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>(-) Anticipos / entregas pendientes de legalizar:</span>
                <span className="font-mono tabular-nums text-amber-800">
                  {formatCOP(resumen.totalAnticiposPendientesLegalizar)}
                </span>
              </div>
              <div className="flex items-center justify-between pt-2 border-t border-slate-200 font-semibold text-slate-900">
                <span>(=) Saldo Teórico de Efectivo en Sistema:</span>
                <span className="font-mono tabular-nums text-sm">
                  {formatCOP(saldoTeoricoSistema)}
                </span>
              </div>
              <div className="flex items-center justify-between font-semibold text-teal-900 bg-white p-2.5 rounded-lg border border-slate-200">
                <span>Efectivo Físico Contado Hoy:</span>
                <span className="font-mono tabular-nums text-sm">
                  {formatCOP(efectivoFisicoContado)}
                </span>
              </div>
            </div>

            {/* Resultado de diferencia */}
            <div
              className={`p-3.5 rounded-lg border text-xs space-y-1.5 ${
                diferenciaEfectivo === 0
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  : diferenciaEfectivo < 0
                  ? 'bg-red-50 border-red-200 text-red-950'
                  : 'bg-amber-50 border-amber-200 text-amber-950'
              }`}
            >
              <div className="flex items-center justify-between font-semibold">
                <span className="flex items-center gap-1.5">
                  {diferenciaEfectivo === 0 ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  ) : (
                    <ShieldAlert className="w-4 h-4 text-red-700 shrink-0" />
                  )}
                  Estado: {estadoConciliacion}
                </span>
                <span className="font-mono tabular-nums text-sm">
                  {diferenciaEfectivo > 0 ? '+' : ''}
                  {formatCOP(diferenciaEfectivo)}
                </span>
              </div>

              {diferenciaEfectivo === 0 && (
                <p>
                  El efectivo físico más los soportes y entregas registradas suman exactamente{' '}
                  <strong className="font-mono">{formatCOP(fondo.montoAutorizado)}</strong>. No existen diferencias en caja menor.
                </p>
              )}

              {diferenciaEfectivo < 0 && (
                <div className="space-y-1">
                  <p>
                    <strong>Alerta de Faltante ({formatCOP(Math.abs(diferenciaEfectivo))}):</strong> Hay menos dinero físico que el registrado en el sistema.
                  </p>
                  <p className="text-red-900/90">
                    <strong>Orientación Contable:</strong> 1) Verifique si existe algún recibo o factura pagada que no haya sido digitada; 2) De confirmarse el faltante, déjelo en el Acta FOR-CM-004 y contabilice una Cuenta por Cobrar a Trabajadores (PUC 136595) a cargo del custodio para su reintegro.
                  </p>
                </div>
              )}

              {diferenciaEfectivo > 0 && (
                <div className="space-y-1">
                  <p>
                    <strong>Alerta de Sobrante (+{formatCOP(diferenciaEfectivo)}):</strong> Hay más efectivo físico en la caja que el saldo esperado.
                  </p>
                  <p className="text-amber-900/90">
                    <strong>Orientación Contable:</strong> Verifique si un colaborador devolvió un sobrante de compra sin registrarlo en el formulario FOR-CM-003 o si falta entregar un vuelto.
                  </p>
                </div>
              )}
            </div>

            {resumen.movimientosSinSoporteValido.length > 0 && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                <div>
                  <strong>Advertencia de Soportes en el Arqueo:</strong> Existen{' '}
                  <strong>{resumen.movimientosSinSoporteValido.length} movimiento(s)</strong> sin factura o soporte válido. Solicite la factura electrónica antes de aprobar el reembolso.
                </div>
              </div>
            )}

            {/* Datos de firma del arqueo */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Persona designada que verifica *
                </label>
                <input
                  type="text"
                  value={verificadorDesignado}
                  onChange={(e) => setVerificadorDesignado(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cargo del verificador
                </label>
                <input
                  type="text"
                  value={cargoVerificador}
                  onChange={(e) => setCargoVerificador(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Observaciones del Acta de Arqueo (FOR-CM-004)
              </label>
              <input
                type="text"
                placeholder="Ej. Arqueo semanal de viernes realizado en presencia del custodio"
                value={observacionesArqueo}
                onChange={(e) => setObservacionesArqueo(e.target.value)}
                className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
              />
            </div>

            <div className="flex items-center gap-2 pt-2 no-print">
              <button
                type="submit"
                className="w-full px-4 py-2.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors whitespace-nowrap"
              >
                Firmar y Guardar Acta de Arqueo (FOR-CM-004)
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="px-3 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir Acta
              </button>
            </div>
          </form>
        </div>

        {/* Historial de Arqueos FOR-CM-004 */}
        {arqueos.length > 0 && (
          <div className="pt-4 border-t border-slate-200 space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">
              Historial de Actas de Arqueo Registradas (FOR-CM-004)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-500">
                    <th className="py-2 pr-3 font-medium">Acta</th>
                    <th className="py-2 px-3 font-medium">Fecha y Hora</th>
                    <th className="py-2 px-3 font-medium">Responsable Caja</th>
                    <th className="py-2 px-3 font-medium">Verificador</th>
                    <th className="py-2 px-3 font-medium text-right">Saldo Sistema</th>
                    <th className="py-2 px-3 font-medium text-right">Efectivo Físico</th>
                    <th className="py-2 px-3 font-medium text-right">Diferencia</th>
                    <th className="py-2 pl-3 font-medium">Resultado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {arqueos.map((a) => (
                    <tr key={a.id} className="hover:bg-slate-50">
                      <td className="py-2.5 pr-3 font-mono font-medium text-slate-900">
                        {a.consecutivo}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600">{a.fechaHora}</td>
                      <td className="py-2.5 px-3 text-slate-700">{a.responsableCaja}</td>
                      <td className="py-2.5 px-3 text-slate-700">{a.verificadorDesignado}</td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right">
                        {formatCOP(a.saldoTeoricoSistema)}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right font-medium">
                        {formatCOP(a.efectivoFisicoContado)}
                      </td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right font-semibold">
                        {formatCOP(a.diferencia)}
                      </td>
                      <td className="py-2.5 pl-3 font-medium text-slate-800">
                        {a.estadoConciliacion}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </section>

      {/* SECCIÓN 2: PASO 10 — SOLICITUD Y REGISTRO DE REEMBOLSO DE CAJA MENOR */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-mono text-slate-500">
              Paso 10 del Procedimiento · Reposición del Fondo Fijo ($2.000.000 COP)
            </p>
            <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
              Solicitud y Registro de Reembolso de Caja Menor
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Reintegre el efectivo consumido únicamente sobre los gastos que cuentan con soporte tributario verificado.
            </p>
          </div>
          <div className="text-right font-mono tabular-nums">
            <span className="text-xs text-slate-500 block">
              Ejecución actual del fondo (Umbral: {fondo.umbralReembolsoPorcentaje}%)
            </span>
            <span className="text-base font-semibold text-slate-900">
              {resumen.porcentajeEjecucion}% consumido ({formatCOP(resumen.totalEgresosActivos)})
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
            <span className="text-xs text-slate-500 block">
              Gastos Con Soporte Aptos para Reembolso
            </span>
            <span className="text-lg font-mono tabular-nums font-semibold text-slate-900 mt-1 block">
              {formatCOP(valorTotalReembolsable)}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              {movimientosAptosReembolso.length} movimiento(s) legalizado(s)
            </span>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50">
            <span className="text-xs text-slate-500 block">
              Retenidos por Falta de Soporte / Factura
            </span>
            <span className="text-lg font-mono tabular-nums font-semibold text-amber-800 mt-1 block">
              {formatCOP(resumen.totalAnticiposPendientesLegalizar)}
            </span>
            <span className="text-xs text-slate-500 mt-1 block">
              {resumen.movimientosSinSoporteValido.length} movimiento(s) pendiente(s) de soporte
            </span>
          </div>

          <div className="p-4 rounded-lg border border-slate-200 bg-slate-50 flex flex-col justify-between">
            <div>
              <span className="text-xs text-slate-500 block">
                Saldo tras aplicar el reembolso
              </span>
              <span className="text-lg font-mono tabular-nums font-semibold text-teal-800 mt-1 block">
                {formatCOP(resumen.saldoDisponibleEfectivo + valorTotalReembolsable)}
              </span>
            </div>
            <button
              type="button"
              disabled={movimientosAptosReembolso.length === 0}
              onClick={handleConfirmarReembolso}
              className="mt-3 w-full px-4 py-2 text-xs font-medium text-white bg-slate-900 hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed rounded-lg transition-colors inline-flex items-center justify-center gap-1.5 whitespace-nowrap"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              Autorizar y Registrar Reembolso ({formatCOP(valorTotalReembolsable)})
            </button>
          </div>
        </div>

        {resumen.movimientosSinSoporteValido.length > 0 && (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-xs text-amber-950 space-y-2">
            <p className="font-semibold">
              Control Paso 10: Movimientos excluidos del reembolso por falta de factura o soporte válido:
            </p>
            <div className="space-y-1.5">
              {resumen.movimientosSinSoporteValido.map((m) => (
                <div
                  key={m.id}
                  className="flex flex-wrap items-center justify-between gap-2 bg-white px-3 py-2 rounded border border-amber-200"
                >
                  <span>
                    <strong className="font-mono">{m.consecutivo}</strong> · {m.fecha} · {m.descripcion} ({m.responsableSolicitante}) —{' '}
                    <strong className="font-mono">{formatCOP(m.valorGastado || m.valorEntregado)}</strong>
                  </span>
                  <button
                    type="button"
                    onClick={() => onEditarMovimiento(m)}
                    className="text-xs font-semibold text-teal-800 hover:underline whitespace-nowrap shrink-0"
                  >
                    Adjuntar factura / Legalizar →
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
