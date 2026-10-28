import {
  DenominacionEfectivo,
  EstadoMovimiento,
  FondoCajaMenor,
  MovimientoCajaMenor,
} from '../types/cajaMenor';

export const FONDO_INICIAL_VCA: FondoCajaMenor = {
  codigoFondo: 'CM-VCA-2026-001',
  empresa: 'VIAJA CON ADRI S.A.S.',
  nitEmpresa: '901.482.319-4',
  ciudad: 'Medellín, Antioquia — Colombia',
  fechaApertura: '2026-10-01',
  actaApertura: 'ACTA-CM-001-2026',
  montoAutorizado: 2000000,
  limiteMaximoPorGasto: 300000,
  umbralReembolsoPorcentaje: 70,
  responsableCustodio: 'Adriana Gómez (Responsable Caja Menor)',
  aprobadorDesignado: 'León E. Gómez / Gerencia General',
  contadorDesignado: 'Saray Villegas Ochoa (Área Contable)',
  periodicidadCierre: 'Control y cierre mensual (con revisiones o reembolsos durante el mes)',
  entregaInformeSemanal: 'Todos los viernes antes de las 5:00 p. m. al Área Contable',
  estadoFondo: 'Activo',
};

export const DENOMINACIONES_COP_INICIALES: DenominacionEfectivo[] = [
  { valor: 100000, etiqueta: '$100.000', tipo: 'Billete', cantidad: 0 },
  { valor: 50000, etiqueta: '$50.000', tipo: 'Billete', cantidad: 0 },
  { valor: 20000, etiqueta: '$20.000', tipo: 'Billete', cantidad: 0 },
  { valor: 10000, etiqueta: '$10.000', tipo: 'Billete', cantidad: 0 },
  { valor: 5000, etiqueta: '$5.000', tipo: 'Billete', cantidad: 0 },
  { valor: 2000, etiqueta: '$2.000', tipo: 'Billete', cantidad: 0 },
  { valor: 1000, etiqueta: '$1.000', tipo: 'Moneda', cantidad: 0 },
  { valor: 500, etiqueta: '$500', tipo: 'Moneda', cantidad: 0 },
  { valor: 200, etiqueta: '$200', tipo: 'Moneda', cantidad: 0 },
  { valor: 100, etiqueta: '$100', tipo: 'Moneda', cantidad: 0 },
  { valor: 50, etiqueta: '$50', tipo: 'Moneda', cantidad: 0 },
];

export interface PasoProcedimiento {
  numero: number;
  titulo: string;
  responsable: string;
  formulario?: string;
  estadosGenerados?: string[];
  acciones: string[];
  controlSistema: string;
  fundamentoNormativo: string;
}

export const PASOS_PROCEDIMIENTO_VCA: PasoProcedimiento[] = [
  {
    numero: 1,
    titulo: 'Apertura y configuración del fondo',
    responsable: 'Gerencia y Administrador del sistema',
    formulario: 'ACTA-CM-001 — Acta de apertura de caja menor',
    acciones: [
      'Gerencia autoriza la creación de la caja menor por $2.000.000 COP.',
      'Se elabora el acta de apertura con la fecha, el valor autorizado y el responsable del dinero.',
      'El administrador registra el fondo en el sistema (código, fecha, monto, responsable, estado).',
      'Se configuran los usuarios, permisos, categorías de gastos y límites internos.',
      'El responsable recibe el dinero y confirma su recepción.',
      'El sistema registra el saldo inicial disponible de $2.000.000 COP.',
    ],
    controlSistema:
      'Guarda código del fondo, fecha de apertura, monto autorizado ($2.000.000 COP), responsable custodio, estado y usuario que realizó el registro.',
    fundamentoNormativo:
      'Políticas internas de Viaja con Adri y normas contables aplicables: Ley 1314 de 2009 y Decreto 2420 de 2015. El monto de $2.000.000 COP es una decisión administrativa interna, no una cuantía impuesta de manera general por la ley.',
  },
  {
    numero: 2,
    titulo: 'Registro de la solicitud',
    responsable: 'Solicitante',
    formulario: 'FOR-CM-001 — Solicitud de caja menor',
    estadosGenerados: ['Pendiente de aprobación'],
    acciones: [
      'El usuario ingresa al sistema con su cuenta y selecciona «Nueva solicitud de caja menor».',
      'Registra el concepto del gasto, el valor aproximado, la fecha y la justificación.',
      'Selecciona la categoría correspondiente (papelería, transporte autorizado, materiales de oficina, etc.).',
      'Adjunta una cotización o documento previo, si corresponde.',
      'Envía la solicitud y el sistema genera un número consecutivo en estado «Pendiente de aprobación».',
    ],
    controlSistema:
      'El sistema impide el envío si faltan campos obligatorios o si el valor supera el límite máximo individual configurado por gasto.',
    fundamentoNormativo:
      'Política interna de control de la agencia. La legislación tributaria regula los soportes definitivos del gasto, mientras la empresa regula el formulario previo de solicitud.',
  },
  {
    numero: 3,
    titulo: 'Revisión y autorización',
    responsable: 'Aprobador',
    estadosGenerados: ['Aprobada', 'Rechazada'],
    acciones: [
      'El aprobador ingresa a la bandeja de solicitudes pendientes.',
      'Revisa la justificación, el valor solicitado y la categoría del gasto.',
      'Verifica que la solicitud corresponda a una necesidad operativa autorizada por Viaja con Adri.',
      'Consulta el saldo disponible en caja menor y los límites establecidos.',
      'Selecciona «Aprobar» o «Rechazar» (registrando el motivo en caso de rechazo).',
      'El sistema guarda la decisión, fecha, usuario aprobador y observaciones.',
    ],
    controlSistema:
      'Una solicitud rechazada queda bloqueada y no puede pasar a entrega de dinero. Para modificarla, el solicitante debe corregirla y enviarla nuevamente.',
    fundamentoNormativo:
      'Control interno administrativo y segregación de funciones (quien solicita no aprueba su propio desembolso).',
  },
  {
    numero: 4,
    titulo: 'Entrega del dinero',
    responsable: 'Responsable de caja menor',
    formulario: 'FOR-CM-002 — Comprobante de entrega de dinero',
    estadosGenerados: ['Dinero entregado', 'Pendiente de legalización'],
    acciones: [
      'Consulta las solicitudes en estado «Aprobada».',
      'Verifica el valor autorizado y la identidad del solicitante.',
      'Entrega el efectivo aprobado y registra el valor entregado, la fecha y el número de solicitud.',
      'El solicitante confirma la recepción del efectivo.',
      'El sistema actualiza el efectivo disponible y marca la entrega como pendiente de legalización.',
    ],
    controlSistema:
      'El sistema evita que se entregue un valor superior al autorizado sin una nueva aprobación ni que se exceda el efectivo físico disponible.',
    fundamentoNormativo:
      'Trazabilidad de custodia de efectivo y responsabilidad sobre anticipos de caja menor.',
  },
  {
    numero: 5,
    titulo: 'Realización del gasto',
    responsable: 'Solicitante',
    acciones: [
      'Utiliza el dinero exclusivamente para el propósito aprobado.',
      'Solicita al proveedor la factura electrónica, documento equivalente POS electrónico o soporte válido según la normativa DIAN.',
      'Conserva el documento que demuestra la compra o el servicio a nombre de Viaja con Adri.',
      'Devuelve el dinero sobrante en efectivo al responsable de caja menor, si lo hay.',
      'Ingresa al sistema para iniciar la legalización del gasto.',
    ],
    controlSistema:
      'Permite adjuntar o referenciar archivos legibles y asociarlos al consecutivo original de la solicitud.',
    fundamentoNormativo:
      'Artículos 615, 617 y 771-2 del Estatuto Tributario sobre exigencia de soportes idóneos para procedencia de costos y deducciones.',
  },
  {
    numero: 6,
    titulo: 'Legalización del gasto',
    responsable: 'Solicitante y Responsable de caja menor',
    formulario: 'FOR-CM-003 — Legalización de gastos',
    estadosGenerados: ['En revisión contable'],
    acciones: [
      'El solicitante abre la solicitud correspondiente y registra el valor efectivamente gastado.',
      'Adjunta o registra los datos del soporte de compra o servicio.',
      'Registra nombre/razón social del proveedor, NIT y descripción detallada del gasto.',
      'Indica el dinero sobrante, si existe, y lo reintegra físicamente al responsable de caja menor.',
      'El responsable verifica que los valores y el efectivo devuelto coincidan.',
      'El sistema calcula la diferencia entre el dinero entregado y el gasto realizado y pasa la solicitud a «En revisión contable».',
    ],
    controlSistema:
      'Calcula automáticamente el reintegro de efectivo (`Valor Entregado - Valor Gastado`) y exige identificar el tipo de soporte antes de enviar a contabilidad.',
    fundamentoNormativo:
      'Artículos 615, 617, 618 y 771-2 del Estatuto Tributario; Decreto 1625 de 2016 y resoluciones vigentes de la DIAN sobre facturación electrónica y documento soporte.',
  },
  {
    numero: 7,
    titulo: 'Revisión contable',
    responsable: 'Área contable',
    estadosGenerados: ['Legalizada', 'Devuelta para corrección'],
    acciones: [
      'Consulta las legalizaciones en estado «En revisión contable».',
      'Verifica que el soporte cumpla los requisitos fiscales y corresponda al gasto registrado.',
      'Revisa los datos del proveedor (NIT/RUT), fecha, valor e impuestos (IVA/INC) cuando correspondan.',
      'Determina la clasificación contable del gasto (cuenta PUC).',
      'Evalúa si procede practicar retenciones u otras obligaciones tributarias.',
      'Aprueba la legalización («Legalizada») o la devuelve para corrección («Devuelta para corrección»).',
    ],
    controlSistema:
      'Registra la decisión contable, la cuenta PUC asignada, las observaciones y conserva el historial de auditoría.',
    fundamentoNormativo:
      'Estatuto Tributario, regulación de facturación DIAN y marco técnico normativo contable (NIIF para PYMES — Decreto 2420 de 2015).',
  },
  {
    numero: 8,
    titulo: 'Actualización del saldo',
    responsable: 'Sistema tecnológico y Responsable de caja menor',
    acciones: [
      'El sistema registra en tiempo real las entradas (apertura/reembolsos) y salidas de efectivo.',
      'Actualiza el saldo físico estimado en caja menor.',
      'Mantiene identificadas por separado las entregas pendientes de legalización.',
      'Relaciona los gastos legalizados y los reembolsos recibidos.',
      'Verifica la ecuación de equilibrio del fondo: Efectivo Disponible + Gastos Pagados + Anticipos Pendientes = $2.000.000 COP.',
    ],
    controlSistema:
      'Cálculo automático y continuo del saldo disponible y alerta visual cuando existen gastos sin soporte o diferencias.',
    fundamentoNormativo:
      'Principio de esencia sobre forma y control interno del disponible (efectivo y equivalentes al efectivo).',
  },
  {
    numero: 9,
    titulo: 'Arqueo de caja menor',
    responsable: 'Responsable de caja menor y Persona designada para verificar',
    formulario: 'FOR-CM-004 — Arqueo de caja menor',
    acciones: [
      'Se cuenta físicamente el efectivo disponible por denominaciones de billetes y monedas.',
      'Se revisan los soportes físicos y digitales de los gastos pagados.',
      'Se identifican los anticipos o entregas pendientes de legalización.',
      'Se compara el total físico justificado con los registros del sistema.',
      'Se calcula cualquier diferencia (faltante o sobrante) y se informa al responsable autorizado.',
      'Se genera el Acta de Arqueo (FOR-CM-004) con fecha, valores, firmas y observaciones.',
    ],
    controlSistema:
      'Conserva el historial de arqueos y permite identificar quién custodiaba la caja y quién realizó la verificación independiente.',
    fundamentoNormativo:
      'Procedimiento de auditoría y control interno sobre activos líquidos.',
  },
  {
    numero: 10,
    titulo: 'Solicitud y registro del reembolso',
    responsable: 'Responsable de caja menor, Área contable y Aprobador',
    estadosGenerados: ['Reembolso solicitado', 'Reembolsada'],
    acciones: [
      'El responsable revisa los gastos legalizados y el efectivo restante.',
      'Cuando se alcanza el umbral interno (ej. 70% del fondo agotado) o al cierre, prepara la solicitud de reembolso.',
      'Adjunta la relación consolidada de gastos legalizados y sus soportes.',
      'Contabilidad verifica los valores y documentos; el aprobador/gerencia autoriza el giro.',
      'Una vez recibido el dinero de reposición, el responsable confirma la recepción y el sistema restablece el disponible a $2.000.000 COP.',
    ],
    controlSistema:
      'Agrupa únicamente gastos con soporte verificado y registra la entrada de efectivo reponiendo el fondo fijo.',
    fundamentoNormativo:
      'Política financiera interna de fondo fijo de caja menor y causación contable de gastos.',
  },
  {
    numero: 11,
    titulo: 'Cierre semanal (viernes) y cierre mensual',
    responsable: 'Área contable y Responsable de caja menor',
    formulario: 'FOR-CM-006 — Informe de cierre mensual / Informe Semanal de Viernes',
    estadosGenerados: ['Cerrada'],
    acciones: [
      'Cada viernes se genera el Informe Semanal en Excel o PDF para Contabilidad con movimientos, soportes pendientes, total gastado y saldo final.',
      'Al finalizar el mes, se genera el informe FOR-CM-006 relacionando solicitudes aprobadas, rechazadas, pendientes y gastos legalizados.',
      'Se relacionan los reembolsos efectuados, el saldo inicial, entradas, salidas y saldo final.',
      'Se incluyen los resultados de los arqueos realizados y cualquier diferencia detectada.',
    ],
    controlSistema:
      'El cierre mensual concilia y documenta todos los movimientos sin exigir que la caja quede en cero, pero bloquea el informe definitivo si faltan datos esenciales.',
    fundamentoNormativo:
      'Marco técnico contable (corte mensual de operaciones y reconocimiento en el período contable correspondiente).',
  },
  {
    numero: 12,
    titulo: 'Archivo y trazabilidad documental',
    responsable: 'Administrador del sistema y Área contable',
    acciones: [
      'Se conservan digitalmente las solicitudes (FOR-CM-001), entregas (FOR-CM-002), legalizaciones (FOR-CM-003), arqueos (FOR-CM-004) y cierres (FOR-CM-006).',
      'El sistema relaciona cada soporte con su movimiento y conserva la bitácora de quién creó, aprobó o revisó cada operación.',
      'Se garantiza la conservación durante los plazos legales exigidos en Colombia.',
    ],
    controlSistema:
      'Bitácora inmutable de auditoría por movimiento con fecha, hora, usuario, rol y formulario asociado.',
    fundamentoNormativo:
      'Artículo 632 del Estatuto Tributario (conservación de informaciones y pruebas), Art. 46 de la Ley 962 de 2005 y Ley 527 de 1999 (validez de mensajes de datos y documentos electrónicos).',
  },
];

export const ROLES_SISTEMA_VCA = [
  {
    rol: 'Administrador del sistema',
    responsabilidad: 'Configura usuarios, permisos de acceso, límites máximos por gasto ($300.000 COP), umbral de reembolso y parámetros del fondo.',
  },
  {
    rol: 'Solicitante',
    responsabilidad: 'Registra la necesidad de dinero (FOR-CM-001), realiza la compra para el fin autorizado, exige factura electrónica y presenta los soportes (FOR-CM-003).',
  },
  {
    rol: 'Aprobador',
    responsabilidad: 'Revisa la justificación, categoría y disponibilidad del fondo; autoriza o rechaza las solicitudes antes del desembolso.',
  },
  {
    rol: 'Responsable de caja menor',
    responsabilidad: 'Custodia los $2.000.000 COP, entrega el efectivo aprobado (FOR-CM-002), recibe vueltos/sobrantes, verifica soportes preliminares y solicita el reembolso.',
  },
  {
    rol: 'Área contable',
    responsabilidad: 'Verifica la validez tributaria de las facturas/soportes ante la DIAN, asigna cuenta PUC, revisa retenciones, recibe el informe de los viernes y valida el cierre mensual (FOR-CM-006).',
  },
  {
    rol: 'Gerencia',
    responsabilidad: 'Autoriza la apertura del fondo por $2.000.000 COP mediante acta interna, aprueba los reembolsos y toma decisiones sobre diferencias o políticas.',
  },
];

export const ESTADOS_OFICIALES_TABLA: Array<{ estado: EstadoMovimiento; significado: string; etapa: string }> = [
  { estado: 'Pendiente de aprobación', significado: 'La solicitud fue enviada y espera revisión del aprobador.', etapa: 'Paso 2 — Solicitud (FOR-CM-001)' },
  { estado: 'Aprobada', significado: 'El responsable aprobador autorizó el gasto.', etapa: 'Paso 3 — Autorización' },
  { estado: 'Rechazada', significado: 'La solicitud no fue autorizada (no puede pasar a entrega de dinero).', etapa: 'Paso 3 — Autorización' },
  { estado: 'Dinero entregado', significado: 'Se registró la entrega física del efectivo al solicitante.', etapa: 'Paso 4 — Entrega (FOR-CM-002)' },
  { estado: 'Pendiente de legalización', significado: 'Falta presentar o completar la factura o soporte válido del gasto.', etapa: 'Paso 4 y 5 — Ejecución' },
  { estado: 'En revisión contable', significado: 'Se presentaron los soportes y Contabilidad está verificando los documentos.', etapa: 'Paso 6 — Legalización (FOR-CM-003)' },
  { estado: 'Devuelta para corrección', significado: 'Faltan datos del proveedor, el soporte es ilegible o hay inconsistencias.', etapa: 'Paso 7 — Revisión Contable' },
  { estado: 'Legalizada', significado: 'El gasto y su soporte fueron revisados y aceptados por Contabilidad.', etapa: 'Paso 7 — Revisión Contable' },
  { estado: 'Reembolso solicitado', significado: 'Se presentó la relación de gastos legalizados para reponer el fondo.', etapa: 'Paso 10 — Reembolso' },
  { estado: 'Reembolsada', significado: 'El dinero de reposición fue recibido y registrado en el disponible.', etapa: 'Paso 10 — Reembolso' },
  { estado: 'Cerrada', significado: 'La operación o el período mensual fue conciliado, revisado y cerrado.', etapa: 'Paso 11 — Cierre (FOR-CM-006)' },
];

export const COMPARATIVA_NORMATIVA_COLOMBIA = [
  {
    aspecto: 'Acto de Creación y Cuantía del Fondo',
    empresasPrivadas:
      'Se constituye mediante Acta de Gerencia o Reglamento Interno de Caja Menor. La cuantía (ej. $2.000.000 COP en Viaja con Adri) y los límites por gasto son una decisión autónoma de la administración según su flujo operativo.',
    entidadesPublicas:
      'Se constituye obligatoriamente mediante Resolución del Jefe del Órgano o Representante Legal para cada vigencia fiscal (Decreto 1068 de 2015), previa expedición del Certificado de Disponibilidad Presupuestal (CDP) y sujeta a topes máximos en SMLMV según el presupuesto de la entidad.',
  },
  {
    aspecto: 'Marco Técnico Contable',
    empresasPrivadas:
      'Ley 1314 de 2009 y Decreto Único Reglamentario 2420 de 2015 (NIIF Plenas o NIIF para PYMES — Grupo 2/3). El fondo se registra en Efectivo y Equivalentes al Efectivo (Cuenta 110510 — Cajas Menores).',
    entidadesPublicas:
      'Régimen de Contabilidad Pública (RCP) expedido por la Contaduría General de la Nación (CGN) y normas de ejecución presupuestal del Estatuto Orgánico del Presupuesto.',
  },
  {
    aspecto: 'Soportes Tributarios y Deducción de Gastos (DIAN)',
    empresasPrivadas:
      'Rige el Estatuto Tributario (Arts. 615, 617, 618 y 771-2), Decreto 1625 de 2016 y Resolución DIAN 000165 de 2023. Para que el gasto sea deducible en el Impuesto de Renta, debe estar respaldado por Factura Electrónica de Venta, Documento Equivalente POS Electrónico o Documento Soporte Electrónico en adquisiciones a no obligados a facturar.',
    entidadesPublicas:
      'Además de exigir factura electrónica o documento soporte y practicar retenciones de ley (Renta, IVA, ICA, Estampillas), deben verificar el rubro presupuestal autorizado. No buscan deducibilidad en renta comercial, sino legalidad del gasto público.',
  },
  {
    aspecto: 'Periodicidad, Reembolsos y Cierre de Vigencia',
    empresasPrivadas:
      'En Viaja con Adri: informe semanal todos los viernes para Contabilidad y cierre de conciliación mensual (FOR-CM-006). El cierre mensual no exige que el efectivo quede en cero, sino que todos los movimientos estén conciliados y causados en el mes.',
    entidadesPublicas:
      'Principio de Anualidad Presupuestal: antes del cierre de diciembre de cada año, toda caja menor pública debe legalizarse al 100% y reintegrar el efectivo sobrante al Tesoro o cuenta oficial; no puede pasar saldo sin legalizar de una vigencia fiscal a otra.',
  },
  {
    aspecto: 'Responsabilidad sobre Diferencias (Faltantes y Sobrantes)',
    empresasPrivadas:
      'Regulada por el Código Sustantivo del Trabajo y el acta de responsabilidad firmada por el custodio. Un faltante se registra como cuenta por cobrar al responsable (previo debido proceso y autorización escrita para descuento); un sobrante se registra como ingreso no operacional o partida por aclarar.',
    entidadesPublicas:
      'Genera responsabilidad fiscal (Ley 610 de 2000 ante la Contraloría), disciplinaria (Código General Disciplinario ante la Procuraduría/Control Interno) y penal (peculado por culpa o apropiación). El reintegro de faltantes debe ser inmediato.',
  },
  {
    aspecto: 'Conservación de Documentos y Trazabilidad',
    empresasPrivadas:
      'Artículo 632 del Estatuto Tributario, Art. 46 Ley 962 de 2005 (5 años para efectos tributarios desde el 1 de enero del año siguiente, o 10 años comercial según Art. 28 Ley 962 de 2005) y Ley 527 de 1999 para soportes electrónicos.',
    entidadesPublicas:
      'Ley General de Archivos (Ley 594 de 2000) y Tablas de Retención Documental (TRD) aprobadas por el Archivo General de la Nación (AGN).',
  },
];

// Escenario demostrativo opcional (NUNCA se carga por defecto para cumplir la regla de no inventar movimientos sin autorización del usuario)
export const MOVIMIENTOS_DEMO_SENA: MovimientoCajaMenor[] = [
  {
    id: 'demo-1',
    consecutivo: 'FOR-CM-001-001',
    fecha: '2026-10-26',
    descripcion: 'Compra de resmas de papel ecológico, carpetas corporativas y bolígrafos para entrega de vouchers de viaje',
    justificacion: 'Reposición de papelería urgente para atención presencial de pasajeros internacionales en la oficina de Medellín.',
    categoria: 'Papelería y útiles',
    responsableSolicitante: 'Camila Restrepo',
    cargoSolicitante: 'Asesora de Viajes Senior',
    valorSolicitado: 95000,
    valorEntregado: 95000,
    valorGastado: 88500,
    valorReintegradoSobrante: 6500,
    estado: 'Legalizada',
    tieneSoporte: true,
    tipoSoporte: 'Factura Electrónica de Venta (DIAN)',
    numeroSoporte: 'FEVP-48921',
    proveedorNombre: 'Papelería Panamericana S.A.',
    proveedorNit: '860.002.190-1',
    nombreArchivoSoporte: 'FEVP-48921_Panamericana.pdf',
    cuentaContablePuc: '519530 — Útiles, papelería y fotocopias',
    impuestoIva: 14130,
    retencionAplicada: 0,
    observaciones: 'Se devolvieron $6.500 COP en efectivo al custodio de caja menor. Factura electrónica validada en portal DIAN.',
    historial: [
      {
        id: 'h-1',
        fechaHora: '2026-10-26 09:15',
        usuario: 'Camila Restrepo',
        rol: 'Solicitante',
        accion: 'Registro de solicitud inicial por $95.000 COP',
        formulario: 'FOR-CM-001',
      },
      {
        id: 'h-2',
        fechaHora: '2026-10-26 09:40',
        usuario: 'León E. Gómez',
        rol: 'Aprobador',
        accion: 'Solicitud aprobada para compra de papelería',
      },
      {
        id: 'h-3',
        fechaHora: '2026-10-26 10:00',
        usuario: 'Adriana Gómez',
        rol: 'Responsable de caja menor',
        accion: 'Entrega de efectivo por $95.000 COP',
        formulario: 'FOR-CM-002',
      },
      {
        id: 'h-4',
        fechaHora: '2026-10-26 15:20',
        usuario: 'Camila Restrepo',
        rol: 'Solicitante',
        accion: 'Legalización por $88.500 COP y devolución de sobrante de $6.500 COP',
        formulario: 'FOR-CM-003',
      },
      {
        id: 'h-5',
        fechaHora: '2026-10-27 11:10',
        usuario: 'Saray Villegas Ochoa',
        rol: 'Área contable',
        accion: 'Revisión contable aprobada — Cuenta PUC 519530',
        formulario: 'FOR-CM-003',
      },
    ],
  },
  {
    id: 'demo-2',
    consecutivo: 'FOR-CM-001-002',
    fecha: '2026-10-27',
    descripcion: 'Servicio de mensajería expresa al Consulado para radicación de pasaportes y documentos de visado corporativo',
    justificacion: 'Envío prioritario de documentación de clientes corporativos con cita consular programada.',
    categoria: 'Transporte urbano y mensajería',
    responsableSolicitante: 'Mateo Londoño',
    cargoSolicitante: 'Coordinador de Operaciones Turísticas',
    valorSolicitado: 48000,
    valorEntregado: 48000,
    valorGastado: 48000,
    valorReintegradoSobrante: 0,
    estado: 'En revisión contable',
    tieneSoporte: true,
    tipoSoporte: 'Documento Soporte (No obligados a facturar)',
    numeroSoporte: 'DSE-00194',
    proveedorNombre: 'Juan Carlos Pérez — Mensajería Expresa',
    proveedorNit: '71.384.920-5',
    nombreArchivoSoporte: 'DSE-00194_Mensajeria_RUT.pdf',
    cuentaContablePuc: '513550 — Transporte, fletes y acarreos',
    impuestoIva: 0,
    retencionAplicada: 0,
    observaciones: 'Incluye copia del RUT del prestador no obligado a facturar.',
    historial: [
      {
        id: 'h-21',
        fechaHora: '2026-10-27 08:30',
        usuario: 'Mateo Londoño',
        rol: 'Solicitante',
        accion: 'Registro de solicitud por $48.000 COP',
        formulario: 'FOR-CM-001',
      },
      {
        id: 'h-22',
        fechaHora: '2026-10-27 08:50',
        usuario: 'León E. Gómez',
        rol: 'Aprobador',
        accion: 'Solicitud aprobada',
      },
      {
        id: 'h-23',
        fechaHora: '2026-10-27 09:05',
        usuario: 'Adriana Gómez',
        rol: 'Responsable de caja menor',
        accion: 'Entrega de efectivo por $48.000 COP',
        formulario: 'FOR-CM-002',
      },
      {
        id: 'h-24',
        fechaHora: '2026-10-27 16:45',
        usuario: 'Mateo Londoño',
        rol: 'Solicitante',
        accion: 'Soporte registrado, enviado a revisión contable',
        formulario: 'FOR-CM-003',
      },
    ],
  },
  {
    id: 'demo-3',
    consecutivo: 'FOR-CM-001-003',
    fecha: '2026-10-28',
    descripcion: 'Compra de café especial, aromáticas y botellones de agua para sala de atención a viajeros',
    justificacion: 'Atención a clientes en cierre de paquetes turísticos familiares de fin de año.',
    categoria: 'Cafetería y atención a clientes',
    responsableSolicitante: 'Valeria Salazar',
    cargoSolicitante: 'Recepción y Experiencia al Viajero',
    valorSolicitado: 65000,
    valorEntregado: 65000,
    valorGastado: 65000,
    valorReintegradoSobrante: 0,
    estado: 'Pendiente de legalización',
    tieneSoporte: false,
    tipoSoporte: 'Sin soporte',
    numeroSoporte: '',
    proveedorNombre: 'Pendiente por reportar',
    proveedorNit: '',
    observaciones: 'ALERTA: Se entregó el efectivo hoy a las 10:00 a. m. Falta adjuntar la Factura Electrónica antes del cierre del viernes.',
    historial: [
      {
        id: 'h-31',
        fechaHora: '2026-10-28 09:30',
        usuario: 'Valeria Salazar',
        rol: 'Solicitante',
        accion: 'Registro de solicitud por $65.000 COP',
        formulario: 'FOR-CM-001',
      },
      {
        id: 'h-32',
        fechaHora: '2026-10-28 09:45',
        usuario: 'León E. Gómez',
        rol: 'Aprobador',
        accion: 'Solicitud aprobada',
      },
      {
        id: 'h-33',
        fechaHora: '2026-10-28 10:00',
        usuario: 'Adriana Gómez',
        rol: 'Responsable de caja menor',
        accion: 'Entrega de efectivo por $65.000 COP — Pendiente presentar factura electrónica',
        formulario: 'FOR-CM-002',
      },
    ],
  },
];
