import React, { useState } from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  Download,
  FileSpreadsheet,
  FileText,
  Plus,
  Printer,
  ShieldAlert,
} from 'lucide-react';
import {
  ArqueoCajaMenor,
  FondoCajaMenor,
  MovimientoCajaMenor,
} from '../types/cajaMenor';
import {
  ResumenFinancieroCaja,
  exportarInformeCSV,
  exportarInformeExcelXLS,
  formatCOP,
} from '../utils/exportUtils';

interface ModuloInformesViernesProps {
  fondo: FondoCajaMenor;
  movimientos: MovimientoCajaMenor[];
  resumen: ResumenFinancieroCaja;
  ultimoArqueo: ArqueoCajaMenor | null;
  onAbrirNuevoMovimiento: () => void;
  onEditarMovimiento: (movimiento: MovimientoCajaMenor) => void;
}

export const ModuloInformesViernes: React.FC<ModuloInformesViernesProps> = ({
  fondo,
  movimientos,
  resumen,
  ultimoArqueo,
  onAbrirNuevoMovimiento,
  onEditarMovimiento,
}) => {
  const [tipoReporte, setTipoReporte] = useState<'SEMANAL_VIERNES' | 'MENSUAL_FOR_CM_006'>(
    'SEMANAL_VIERNES'
  );
  const [semanaCorte, setSemanaCorte] = useState<string>('Semana del 26 al 30 de Octubre de 2026 (Entrega Viernes)');
  const [observacionesEntrega, setObservacionesEntrega] = useState<string>(
    'Se hace entrega de la relación de movimientos de caja menor y sus respectivos soportes al Área Contable para verificación y causación.'
  );
  const [alertaIntentoDefinitivo, setAlertaIntentoDefinitivo] = useState<string | null>(null);

  const sinMovimientosRegistrados = movimientos.length === 0;
  const tieneIncompletos = resumen.movimientosConDatosIncompletos.length > 0;
  const listoParaInformeDefinitivo = !sinMovimientosRegistrados && !tieneIncompletos;

  const handleExportarDefinitivoExcel = () => {
    if (!listoParaInformeDefinitivo) {
      setAlertaIntentoDefinitivo(
        sinMovimientosRegistrados
          ? 'No se puede generar un Informe Definitivo sin movimientos reales registrados. El sistema no inventa valores ni soportes: por favor registre los gastos reales de la semana primero.'
          : `Atención: Existen ${resumen.movimientosConDatosIncompletos.length} movimiento(s) con información o soportes faltantes. Por favor complete los datos señalados abajo antes de emitir el Informe Definitivo para Contabilidad, o descargue un Borrador Preliminar.`
      );
      return;
    }
    setAlertaIntentoDefinitivo(null);
    exportarInformeExcelXLS(fondo, movimientos, resumen, ultimoArqueo, tipoReporte, false);
  };

  const handleExportarBorradorExcel = () => {
    exportarInformeExcelXLS(fondo, movimientos, resumen, ultimoArqueo, tipoReporte, true);
  };

  const handleImprimirPDF = () => {
    if (!listoParaInformeDefinitivo) {
      setAlertaIntentoDefinitivo(
        sinMovimientosRegistrados
          ? 'Atención: Está imprimiendo el formato en blanco sin movimientos. Registre primero los movimientos reales de la semana si desea el Informe Definitivo.'
          : 'Atención: El documento impreso en PDF incluirá la marca de soportes pendientes por legalizar hasta que se completen los datos faltantes.'
      );
    }
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Barra de configuración y exportación del informe (No se imprime) */}
      <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5 no-print">
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
          <div>
            <p className="text-xs font-mono text-slate-500">
              Entregable Contable de los Viernes · Formulario FOR-CM-006
            </p>
            <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
              Generador de Informe Semanal (Viernes) y Cierre Mensual (Excel / PDF)
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              El sistema verifica que no falten fechas, valores, responsables ni soportes antes de emitir el informe definitivo para Contabilidad.
            </p>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              type="button"
              onClick={() => setTipoReporte('SEMANAL_VIERNES')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                tipoReporte === 'SEMANAL_VIERNES'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Informe Semanal (Viernes)
            </button>
            <button
              type="button"
              onClick={() => setTipoReporte('MENSUAL_FOR_CM_006')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                tipoReporte === 'MENSUAL_FOR_CM_006'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              FOR-CM-006 Cierre Mensual
            </button>
          </div>
        </div>

        {/* Estado de validación previa al informe definitivo */}
        {sinMovimientosRegistrados ? (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-2">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-2 font-semibold text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
                <span>Solicitud de Información Antes de Generar Informe Definitivo</span>
              </div>
              <button
                type="button"
                onClick={onAbrirNuevoMovimiento}
                className="px-3 py-1.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                Registrar Primer Gasto Real
              </button>
            </div>
            <p>
              Siguiendo la política de transparencia contable de <strong>Viaja con Adri</strong>, el asistente <strong>no inventa movimientos, valores ni facturas</strong>. Para generar el informe definitivo del viernes, por favor ingrese los gastos reales realizados con su fecha, descripción, valor, responsable y número de soporte.
            </p>
          </div>
        ) : tieneIncompletos ? (
          <div className="p-4 rounded-lg bg-amber-50 border border-amber-200 text-amber-950 text-xs space-y-3">
            <div className="flex items-center gap-2 font-semibold text-sm">
              <ShieldAlert className="w-4 h-4 text-amber-700 shrink-0" />
              <span>
                Información Faltante Detectada en {resumen.movimientosConDatosIncompletos.length} Movimiento(s)
              </span>
            </div>
            <p>
              Antes de emitir el <strong>Informe Definitivo Validado</strong> para Contabilidad, complete los siguientes soportes o datos pendientes:
            </p>
            <div className="space-y-2">
              {resumen.movimientosConDatosIncompletos.map(({ movimiento, camposFaltantes }) => (
                <div
                  key={movimiento.id}
                  className="bg-white border border-amber-200 rounded-lg p-3 flex flex-wrap items-center justify-between gap-3"
                >
                  <div className="space-y-0.5">
                    <div className="font-medium text-slate-900">
                      <span className="font-mono">{movimiento.consecutivo}</span> · {movimiento.fecha} · {movimiento.descripcion} ({movimiento.responsableSolicitante})
                    </div>
                    <div className="text-amber-800">
                      <strong>Falta completar:</strong> {camposFaltantes.join(' · ')}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => onEditarMovimiento(movimiento)}
                    className="px-3 py-1.5 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
                  >
                    Completar soporte / datos →
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="p-4 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-950 text-xs flex items-center justify-between flex-wrap gap-3">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>
                <strong>Validación Contable Exitosa:</strong> Todos los movimientos registrados cuentan con fecha, responsable, NIT de proveedor y soporte válido. El Informe Definitivo está listo para exportar.
              </span>
            </div>
          </div>
        )}

        {alertaIntentoDefinitivo && (
          <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-red-900 text-xs flex items-center justify-between gap-3">
            <span>{alertaIntentoDefinitivo}</span>
            <button
              type="button"
              onClick={() => setAlertaIntentoDefinitivo(null)}
              className="text-xs font-semibold underline shrink-0"
            >
              Entendido
            </button>
          </div>
        )}

        {/* Parámetros del encabezado del informe y botones de descarga */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Período / Semana de Corte del Informe
            </label>
            <input
              type="text"
              value={semanaCorte}
              onChange={(e) => setSemanaCorte(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Nota de Entrega para el Área Contable
            </label>
            <input
              type="text"
              value={observacionesEntrega}
              onChange={(e) => setObservacionesEntrega(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-700"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2">
          <button
            type="button"
            onClick={handleExportarDefinitivoExcel}
            className="px-4 py-2.5 text-xs font-medium text-white bg-teal-700 hover:bg-teal-800 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <FileSpreadsheet className="w-4 h-4" />
            Descargar Informe Definitivo Excel (.xls)
          </button>

          {!listoParaInformeDefinitivo && (
            <button
              type="button"
              onClick={handleExportarBorradorExcel}
              className="px-4 py-2.5 text-xs font-medium text-amber-900 bg-amber-100 hover:bg-amber-200 border border-amber-300 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Download className="w-4 h-4" />
              Descargar Borrador con Soportes Pendientes (.xls)
            </button>
          )}

          <button
            type="button"
            onClick={() => exportarInformeCSV(fondo, movimientos, resumen)}
            className="px-4 py-2.5 text-xs font-medium text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <FileText className="w-4 h-4" />
            Exportar Datos Planos (.csv)
          </button>

          <button
            type="button"
            onClick={handleImprimirPDF}
            className="px-4 py-2.5 text-xs font-medium text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-300 rounded-lg transition-colors inline-flex items-center gap-2 whitespace-nowrap shrink-0"
          >
            <Printer className="w-4 h-4" />
            Imprimir / Guardar como PDF Oficial
          </button>
        </div>
      </section>

      {/* VISTA PREVIA OFICIAL E IMPRIMIBLE DEL INFORME (SEMANAL VIERNES / FOR-CM-006) */}
      <section className="bg-white border border-slate-200 rounded-xl p-8 space-y-6 print:border-0 print:p-0">
        {/* Encabezado Formal del Documento Contable */}
        <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-300 pb-5">
          <div>
            <p className="text-xs font-mono text-teal-800 font-semibold">
              {tipoReporte === 'SEMANAL_VIERNES'
                ? 'REPORTE CONTABLE SEMANAL DE VIERNES · CONTROL DE CAJA MENOR'
                : 'FORMULARIO OFICIAL FOR-CM-006 · INFORME DE CIERRE MENSUAL DE CAJA MENOR'}
            </p>
            <h3 className="text-2xl font-bold text-slate-900 mt-1">
              {fondo.empresa}
            </h3>
            <p className="text-xs text-slate-600 mt-0.5">
              NIT: <span className="font-mono">{fondo.nitEmpresa}</span> · {fondo.ciudad} · Código del Fondo:{' '}
              <span className="font-mono font-medium">{fondo.codigoFondo}</span> ({fondo.actaApertura})
            </p>
          </div>
          <div className="text-right text-xs space-y-1 font-mono">
            <div>
              <span className="text-slate-500">Período: </span>
              <strong className="text-slate-900">{semanaCorte}</strong>
            </div>
            <div>
              <span className="text-slate-500">Estado del Informe: </span>
              <strong className={listoParaInformeDefinitivo ? 'text-emerald-700' : 'text-amber-700'}>
                {listoParaInformeDefinitivo
                  ? 'DEFINITIVO VALIDADO'
                  : 'PRELIMINAR (CON SOPORTES PENDIENTES)'}
              </strong>
            </div>
            <div>
              <span className="text-slate-500">Responsable Custodio: </span>
              <span className="text-slate-800">{fondo.responsableCustodio}</span>
            </div>
          </div>
        </div>

        {/* 1. Resumen de Saldos de Caja Menor */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-900">
            1. Conciliación Financiera del Fondo de Caja Menor
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-3.5 border border-slate-200 rounded-lg">
              <span className="text-xs text-slate-500 block">Fondo Inicial Autorizado</span>
              <span className="text-base font-mono tabular-nums font-semibold text-slate-900 mt-1 block">
                {formatCOP(resumen.fondoAutorizado)}
              </span>
            </div>
            <div className="p-3.5 border border-slate-200 rounded-lg">
              <span className="text-xs text-slate-500 block">Total Gastos Con Soporte</span>
              <span className="text-base font-mono tabular-nums font-semibold text-slate-900 mt-1 block">
                {formatCOP(resumen.totalGastosLegalizadosYEnRevision)}
              </span>
            </div>
            <div className="p-3.5 border border-slate-200 rounded-lg">
              <span className="text-xs text-slate-500 block">Entregas Pendientes de Soporte</span>
              <span className="text-base font-mono tabular-nums font-semibold text-amber-800 mt-1 block">
                {formatCOP(resumen.totalAnticiposPendientesLegalizar)}
              </span>
            </div>
            <div className="p-3.5 border border-slate-200 rounded-lg bg-slate-50">
              <span className="text-xs text-slate-600 font-medium block">
                Saldo Final Disponible
              </span>
              <span className="text-base font-mono tabular-nums font-bold text-teal-800 mt-1 block">
                {formatCOP(resumen.saldoDisponibleEfectivo)}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Relación de Movimientos de la Semana / Mes */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-900">
            2. Relación Detallada de Movimientos Registrados ({movimientos.length})
          </h4>
          <div className="overflow-x-auto border border-slate-200 rounded-lg">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-slate-600">
                  <th className="py-2.5 px-3 font-medium">Código</th>
                  <th className="py-2.5 px-3 font-medium">Fecha</th>
                  <th className="py-2.5 px-3 font-medium">Concepto / Descripción</th>
                  <th className="py-2.5 px-3 font-medium">Responsable</th>
                  <th className="py-2.5 px-3 font-medium">Proveedor / NIT</th>
                  <th className="py-2.5 px-3 font-medium">Soporte / Factura</th>
                  <th className="py-2.5 px-3 font-medium">Estado</th>
                  <th className="py-2.5 px-3 font-medium text-right">Valor Gastado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {movimientos.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500">
                      No se han registrado movimientos en este período.
                    </td>
                  </tr>
                ) : (
                  movimientos.map((m) => (
                    <tr key={m.id}>
                      <td className="py-2.5 px-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                        {m.consecutivo}
                      </td>
                      <td className="py-2.5 px-3 font-mono text-slate-600 whitespace-nowrap">
                        {m.fecha}
                      </td>
                      <td className="py-2.5 px-3 text-slate-900">
                        <div className="font-medium">{m.descripcion}</div>
                        <div className="text-slate-500">
                          {m.categoria} {m.cuentaContablePuc ? `· ${m.cuentaContablePuc}` : ''}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 text-slate-700">{m.responsableSolicitante}</td>
                      <td className="py-2.5 px-3 text-slate-700">
                        <div>{m.proveedorNombre || 'Sin proveedor'}</div>
                        <div className="font-mono text-slate-500">{m.proveedorNit || 'Sin NIT'}</div>
                      </td>
                      <td className="py-2.5 px-3">
                        <div className="text-slate-800">{m.tipoSoporte}</div>
                        <div className="font-mono text-slate-500">
                          {m.numeroSoporte || 'SOPORTE PENDIENTE'}
                        </div>
                      </td>
                      <td className="py-2.5 px-3 font-medium text-slate-800">{m.estado}</td>
                      <td className="py-2.5 px-3 font-mono tabular-nums text-right font-semibold text-slate-900 whitespace-nowrap">
                        {formatCOP(m.valorGastado || m.valorEntregado)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
              {movimientos.length > 0 && (
                <tfoot>
                  <tr className="bg-slate-50 border-t border-slate-300 font-semibold text-slate-900">
                    <td colSpan={7} className="py-2.5 px-3 text-right">
                      TOTAL COMPROMETIDO / GASTADO EN EL PERÍODO:
                    </td>
                    <td className="py-2.5 px-3 font-mono tabular-nums text-right">
                      {formatCOP(resumen.totalEgresosActivos)}
                    </td>
                  </tr>
                </tfoot>
              )}
            </table>
          </div>
        </div>

        {/* 3. Relación de Soportes Pendientes */}
        <div className="space-y-2">
          <h4 className="text-sm font-semibold text-slate-900">
            3. Control de Soportes Pendientes y Advertencias para Contabilidad
          </h4>
          {resumen.movimientosSinSoporteValido.length === 0 ? (
            <div className="p-3.5 border border-slate-200 rounded-lg text-xs text-slate-700">
              No existen gastos con soportes pendientes. Todos los movimientos activos cuentan con su respectiva factura electrónica o documento soporte equivalente.
            </div>
          ) : (
            <div className="border border-amber-300 bg-amber-50/50 rounded-lg p-4 space-y-2 text-xs">
              <p className="font-semibold text-amber-950">
                Se advierte a Contabilidad sobre {resumen.movimientosSinSoporteValido.length} movimiento(s) cuyo soporte definitivo está pendiente de entrega:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-amber-900">
                {resumen.movimientosSinSoporteValido.map((m) => (
                  <li key={m.id}>
                    <span className="font-mono font-semibold">{m.consecutivo}</span> ({m.fecha}) —{' '}
                    <strong>{m.descripcion}</strong> · Responsable: {m.responsableSolicitante} · Valor:{' '}
                    <span className="font-mono font-semibold">
                      {formatCOP(m.valorGastado || m.valorEntregado)}
                    </span>{' '}
                    · Estado actual: {m.tipoSoporte}.
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* 4. Observaciones y Firmas de Entrega de los Viernes */}
        <div className="pt-4 border-t border-slate-200 space-y-6 print-break-inside-avoid">
          <p className="text-xs text-slate-600">
            <strong>Observaciones de entrega:</strong> {observacionesEntrega}
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-6 text-xs">
            <div className="border-t border-slate-400 pt-2">
              <p className="font-semibold text-slate-900">{fondo.responsableCustodio}</p>
              <p className="text-slate-500">Entrega: Responsable de Caja Menor</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-semibold text-slate-900">{fondo.contadorDesignado}</p>
              <p className="text-slate-500">Recibe y Verifica: Área Contable (Viernes)</p>
            </div>
            <div className="border-t border-slate-400 pt-2">
              <p className="font-semibold text-slate-900">{fondo.aprobadorDesignado}</p>
              <p className="text-slate-500">Aprueba: Gerencia General — Viaja con Adri</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
