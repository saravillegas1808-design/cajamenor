import {
  ArqueoCajaMenor,
  FondoCajaMenor,
  MovimientoCajaMenor,
  ReembolsoCajaMenor,
} from '../types/cajaMenor';

export function formatCOP(valor: number): string {
  const rounded = Math.round(valor || 0);
  const formatted = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
  return `${formatted} COP`;
}

export function formatCOPShort(valor: number): string {
  const rounded = Math.round(valor || 0);
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(rounded);
}

export interface ResumenFinancieroCaja {
  fondoAutorizado: number;
  totalGastosLegalizadosYEnRevision: number;
  totalAnticiposPendientesLegalizar: number;
  totalEgresosActivos: number;
  saldoDisponibleEfectivo: number;
  porcentajeEjecucion: number;
  requiereReembolsoAlerta: boolean;
  movimientosSinSoporteValido: MovimientoCajaMenor[];
  movimientosConDatosIncompletos: Array<{
    movimiento: MovimientoCajaMenor;
    camposFaltantes: string[];
  }>;
  solicitudesPendientesAprobacion: MovimientoCajaMenor[];
  totalHistoricoReembolsado: number;
}

export function calcularResumenCaja(
  fondo: FondoCajaMenor,
  movimientos: MovimientoCajaMenor[],
  reembolsos: ReembolsoCajaMenor[]
): ResumenFinancieroCaja {
  // Movimientos que afectan el efectivo actual (no rechazados, no pendientes de aprobación, y aún no reembolsados)
  const movimientosActivosCaja = movimientos.filter(
    (m) =>
      m.estado !== 'Rechazada' &&
      m.estado !== 'Pendiente de aprobación' &&
      m.estado !== 'Aprobada' &&
      m.estado !== 'Reembolsada'
  );

  const totalGastosLegalizadosYEnRevision = movimientosActivosCaja
    .filter(
      (m) =>
        m.estado === 'Legalizada' ||
        m.estado === 'En revisión contable' ||
        m.estado === 'Reembolso solicitado' ||
        m.estado === 'Cerrada'
    )
    .reduce((acc, m) => acc + (m.valorGastado || 0), 0);

  const totalAnticiposPendientesLegalizar = movimientosActivosCaja
    .filter(
      (m) =>
        m.estado === 'Dinero entregado' ||
        m.estado === 'Pendiente de legalización' ||
        m.estado === 'Devuelta para corrección'
    )
    .reduce((acc, m) => acc + (m.valorGastado > 0 ? m.valorGastado : m.valorEntregado || 0), 0);

  const totalEgresosActivos =
    totalGastosLegalizadosYEnRevision + totalAnticiposPendientesLegalizar;

  const saldoDisponibleEfectivo = fondo.montoAutorizado - totalEgresosActivos;
  const porcentajeEjecucion =
    fondo.montoAutorizado > 0
      ? Math.min(100, Math.round((totalEgresosActivos / fondo.montoAutorizado) * 1000) / 10)
      : 0;

  const requiereReembolsoAlerta =
    porcentajeEjecucion >= fondo.umbralReembolsoPorcentaje;

  const movimientosSinSoporteValido = movimientos.filter(
    (m) =>
      m.estado !== 'Rechazada' &&
      m.estado !== 'Pendiente de aprobación' &&
      (!m.tieneSoporte ||
        m.tipoSoporte === 'Sin soporte' ||
        m.tipoSoporte === 'Recibo Provisional (Pendiente soporte definitivo)' ||
        !m.numeroSoporte.trim())
  );

  const movimientosConDatosIncompletos = movimientos
    .filter((m) => m.estado !== 'Rechazada')
    .map((movimiento) => {
      const camposFaltantes: string[] = [];
      if (!movimiento.fecha) camposFaltantes.push('Fecha del gasto');
      if (!movimiento.descripcion.trim()) camposFaltantes.push('Descripción / Concepto');
      if (!movimiento.responsableSolicitante.trim()) camposFaltantes.push('Responsable');
      if (
        movimiento.estado !== 'Pendiente de aprobación' &&
        movimiento.estado !== 'Aprobada' &&
        movimiento.valorGastado <= 0
      ) {
        camposFaltantes.push('Valor efectivamente gastado');
      }
      if (
        movimiento.estado !== 'Pendiente de aprobación' &&
        movimiento.estado !== 'Aprobada'
      ) {
        if (!movimiento.tieneSoporte || movimiento.tipoSoporte === 'Sin soporte') {
          camposFaltantes.push('Factura o Documento Soporte válido');
        }
        if (!movimiento.numeroSoporte.trim()) {
          camposFaltantes.push('Número de factura / soporte');
        }
        if (!movimiento.proveedorNombre.trim() || movimiento.proveedorNombre === 'Pendiente por reportar') {
          camposFaltantes.push('Nombre o Razón Social del Proveedor');
        }
        if (!movimiento.proveedorNit.trim()) {
          camposFaltantes.push('NIT o Cédula del Proveedor');
        }
      }
      return { movimiento, camposFaltantes };
    })
    .filter((item) => item.camposFaltantes.length > 0);

  const solicitudesPendientesAprobacion = movimientos.filter(
    (m) => m.estado === 'Pendiente de aprobación' || m.estado === 'Aprobada'
  );

  const totalHistoricoReembolsado = reembolsos
    .filter((r) => r.estado === 'Reembolsada')
    .reduce((acc, r) => acc + r.valorReembolso, 0);

  return {
    fondoAutorizado: fondo.montoAutorizado,
    totalGastosLegalizadosYEnRevision,
    totalAnticiposPendientesLegalizar,
    totalEgresosActivos,
    saldoDisponibleEfectivo,
    porcentajeEjecucion,
    requiereReembolsoAlerta,
    movimientosSinSoporteValido,
    movimientosConDatosIncompletos,
    solicitudesPendientesAprobacion,
    totalHistoricoReembolsado,
  };
}

export function exportarInformeExcelXLS(
  fondo: FondoCajaMenor,
  movimientos: MovimientoCajaMenor[],
  resumen: ResumenFinancieroCaja,
  ultimoArqueo: ArqueoCajaMenor | null,
  tipoInforme: 'SEMANAL_VIERNES' | 'MENSUAL_FOR_CM_006',
  esBorrador: boolean
) {
  const fechaEmision = new Date().toISOString().slice(0, 10);
  const tituloReporte =
    tipoInforme === 'SEMANAL_VIERNES'
      ? 'INFORME SEMANAL DE CAJA MENOR (ENTREGA VIERNES A CONTABILIDAD)'
      : 'FOR-CM-006 — INFORME DE CIERRE MENSUAL DE CAJA MENOR';

  const filasMovimientos = movimientos
    .map(
      (m) => `
      <tr>
        <td style="border:1px solid #cbd5e1;padding:6px;">${m.consecutivo}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;">${m.fecha}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;">${m.categoria}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;">${m.descripcion}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;">${m.responsableSolicitante}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;">${m.proveedorNombre || 'SIN REGISTRAR'}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;">${m.proveedorNit || 'SIN NIT'}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;">${m.tipoSoporte}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;">${m.numeroSoporte || 'PENDIENTE'}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;">${m.estado}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">${m.valorEntregado}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">${m.valorGastado}</td>
        <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">${m.valorReintegradoSobrante}</td>
      </tr>`
    )
    .join('');

  const htmlExcel = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <meta charset="UTF-8" />
      <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Caja Menor Viaja con Adri</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
    </head>
    <body style="font-family:Arial,sans-serif;font-size:12px;color:#0f172a;">
      <h2 style="margin-bottom:4px;">${fondo.empresa} — NIT ${fondo.nitEmpresa}</h2>
      <h3 style="margin-top:0;color:#0f766e;">${tituloReporte} ${esBorrador ? '(BORRADOR CON ADVERTENCIAS)' : '(DEFINITIVO VALIDADO)'}</h3>
      <p><strong>Código del Fondo:</strong> ${fondo.codigoFondo} | <strong>Acta de Apertura:</strong> ${fondo.actaApertura} | <strong>Fecha de Corte:</strong> ${fechaEmision}</p>
      <p><strong>Responsable Caja Menor:</strong> ${fondo.responsableCustodio} | <strong>Área Contable:</strong> ${fondo.contadorDesignado}</p>

      <h4>1. RESUMEN FINANCIERO Y CONCILIACIÓN DEL FONDO</h4>
      <table style="border-collapse:collapse;margin-bottom:16px;">
        <tr>
          <th style="border:1px solid #94a3b8;background:#f1f5f9;padding:6px;text-align:left;">Concepto</th>
          <th style="border:1px solid #94a3b8;background:#f1f5f9;padding:6px;text-align:right;">Valor (COP)</th>
        </tr>
        <tr>
          <td style="border:1px solid #cbd5e1;padding:6px;">Fondo Fijo Inicial Autorizado</td>
          <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;font-weight:bold;">${resumen.fondoAutorizado}</td>
        </tr>
        <tr>
          <td style="border:1px solid #cbd5e1;padding:6px;">(-) Total Gastos Legalizados y En Revisión Contable</td>
          <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">${resumen.totalGastosLegalizadosYEnRevision}</td>
        </tr>
        <tr>
          <td style="border:1px solid #cbd5e1;padding:6px;">(-) Total Entregas / Anticipos Pendientes de Legalización</td>
          <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">${resumen.totalAnticiposPendientesLegalizar}</td>
        </tr>
        <tr>
          <td style="border:1px solid #cbd5e1;padding:6px;">(=) Total Gastado / Comprometido en el Período</td>
          <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;font-weight:bold;">${resumen.totalEgresosActivos}</td>
        </tr>
        <tr>
          <td style="border:1px solid #cbd5e1;padding:6px;background:#f0fdf4;font-weight:bold;">(=) SALDO DISPONIBLE EN CAJA MENOR</td>
          <td style="border:1px solid #cbd5e1;padding:6px;background:#f0fdf4;text-align:right;font-weight:bold;">${resumen.saldoDisponibleEfectivo}</td>
        </tr>
        <tr>
          <td style="border:1px solid #cbd5e1;padding:6px;">Soportes Pendientes o Incompletos Detectados</td>
          <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">${resumen.movimientosSinSoporteValido.length}</td>
        </tr>
        ${
          ultimoArqueo
            ? `<tr>
                <td style="border:1px solid #cbd5e1;padding:6px;">Último Arqueo Físico (${ultimoArqueo.consecutivo}) — Diferencia Detectada</td>
                <td style="border:1px solid #cbd5e1;padding:6px;text-align:right;">${ultimoArqueo.diferencia} (${ultimoArqueo.estadoConciliacion})</td>
              </tr>`
            : ''
        }
      </table>

      <h4>2. RELACIÓN DETALLADA DE MOVIMIENTOS DE CAJA MENOR</h4>
      <table style="border-collapse:collapse;width:100%;">
        <thead>
          <tr style="background:#f1f5f9;">
            <th style="border:1px solid #94a3b8;padding:6px;">Consecutivo</th>
            <th style="border:1px solid #94a3b8;padding:6px;">Fecha</th>
            <th style="border:1px solid #94a3b8;padding:6px;">Categoría</th>
            <th style="border:1px solid #94a3b8;padding:6px;">Descripción del Gasto</th>
            <th style="border:1px solid #94a3b8;padding:6px;">Responsable</th>
            <th style="border:1px solid #94a3b8;padding:6px;">Proveedor</th>
            <th style="border:1px solid #94a3b8;padding:6px;">NIT / CC</th>
            <th style="border:1px solid #94a3b8;padding:6px;">Tipo de Soporte</th>
            <th style="border:1px solid #94a3b8;padding:6px;">N° Factura / Soporte</th>
            <th style="border:1px solid #94a3b8;padding:6px;">Estado</th>
            <th style="border:1px solid #94a3b8;padding:6px;">Valor Entregado</th>
            <th style="border:1px solid #94a3b8;padding:6px;">Valor Gastado</th>
            <th style="border:1px solid #94a3b8;padding:6px;">Sobrante Reintegrado</th>
          </tr>
        </thead>
        <tbody>
          ${
            filasMovimientos ||
            `<tr><td colspan="13" style="border:1px solid #cbd5e1;padding:10px;text-align:center;">Sin movimientos registrados en el período.</td></tr>`
          }
        </tbody>
      </table>
    </body>
    </html>
  `;

  const blob = new Blob(['\ufeff', htmlExcel], {
    type: 'application/vnd.ms-excel;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  const prefijo =
    tipoInforme === 'SEMANAL_VIERNES'
      ? 'Informe_Semanal_Viernes_CajaMenor_ViajaConAdri'
      : 'FOR-CM-006_Cierre_Mensual_ViajaConAdri';
  link.download = `${prefijo}_${fechaEmision}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function exportarInformeCSV(
  fondo: FondoCajaMenor,
  movimientos: MovimientoCajaMenor[],
  resumen: ResumenFinancieroCaja
) {
  const fechaEmision = new Date().toISOString().slice(0, 10);
  const encabezados = [
    'Consecutivo',
    'Fecha',
    'Categoria',
    'Descripcion',
    'Responsable',
    'Proveedor',
    'NIT_Proveedor',
    'Tipo_Soporte',
    'Numero_Soporte',
    'Tiene_Soporte_Valido',
    'Estado',
    'Valor_Entregado_COP',
    'Valor_Gastado_COP',
    'Sobrante_Reintegrado_COP',
  ];

  const escaparCSV = (texto: string | number) => {
    const str = String(texto ?? '').replace(/"/g, '""');
    return `"${str}"`;
  };

  const lineas = [
    `"EMPRESA";"${fondo.empresa}";"NIT";"${fondo.nitEmpresa}";"CODIGO FONDO";"${fondo.codigoFondo}"`,
    `"FONDO AUTORIZADO";"${resumen.fondoAutorizado}";"TOTAL GASTADO";"${resumen.totalEgresosActivos}";"SALDO DISPONIBLE";"${resumen.saldoDisponibleEfectivo}"`,
    `"SOPORTES PENDIENTES";"${resumen.movimientosSinSoporteValido.length}";"FECHA CORTE";"${fechaEmision}"`,
    '',
    encabezados.map(escaparCSV).join(';'),
    ...movimientos.map((m) =>
      [
        m.consecutivo,
        m.fecha,
        m.categoria,
        m.descripcion,
        m.responsableSolicitante,
        m.proveedorNombre || 'PENDIENTE',
        m.proveedorNit || 'PENDIENTE',
        m.tipoSoporte,
        m.numeroSoporte || 'SIN NUMERO',
        m.tieneSoporte && m.tipoSoporte !== 'Sin soporte' ? 'SI' : 'NO',
        m.estado,
        m.valorEntregado,
        m.valorGastado,
        m.valorReintegradoSobrante,
      ]
        .map(escaparCSV)
        .join(';')
    ),
  ];

  const blob = new Blob(['\ufeff' + lineas.join('\r\n')], {
    type: 'text/csv;charset=utf-8;',
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `Caja_Menor_ViajaConAdri_${fechaEmision}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
