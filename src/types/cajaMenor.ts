export type EstadoMovimiento =
  | 'Pendiente de aprobación'
  | 'Aprobada'
  | 'Rechazada'
  | 'Dinero entregado'
  | 'Pendiente de legalización'
  | 'En revisión contable'
  | 'Devuelta para corrección'
  | 'Legalizada'
  | 'Reembolso solicitado'
  | 'Reembolsada'
  | 'Cerrada';

export type CategoriaGasto =
  | 'Papelería y útiles'
  | 'Transporte urbano y mensajería'
  | 'Materiales de oficina'
  | 'Cafetería y atención a clientes'
  | 'Elementos de aseo'
  | 'Trámites y autenticaciones'
  | 'Imprevistos operativos';

export type TipoSoporte =
  | 'Factura Electrónica de Venta (DIAN)'
  | 'Documento Soporte (No obligados a facturar)'
  | 'Documento Equivalente POS Electrónico'
  | 'Recibo Provisional (Pendiente soporte definitivo)'
  | 'Sin soporte';

export type RolSistema =
  | 'Administrador del sistema'
  | 'Solicitante'
  | 'Aprobador'
  | 'Responsable de caja menor'
  | 'Área contable'
  | 'Gerencia';

export interface EventoTrazabilidad {
  id: string;
  fechaHora: string;
  usuario: string;
  rol: RolSistema;
  accion: string;
  formulario?: string;
}

export interface MovimientoCajaMenor {
  id: string;
  consecutivo: string;
  fecha: string;
  descripcion: string;
  justificacion: string;
  categoria: CategoriaGasto;
  responsableSolicitante: string;
  cargoSolicitante: string;
  valorSolicitado: number;
  valorEntregado: number;
  valorGastado: number;
  valorReintegradoSobrante: number;
  estado: EstadoMovimiento;
  tieneSoporte: boolean;
  tipoSoporte: TipoSoporte;
  numeroSoporte: string;
  proveedorNombre: string;
  proveedorNit: string;
  nombreArchivoSoporte?: string;
  cuentaContablePuc?: string;
  impuestoIva?: number;
  retencionAplicada?: number;
  observaciones?: string;
  reembolsoId?: string;
  historial: EventoTrazabilidad[];
}

export interface FondoCajaMenor {
  codigoFondo: string;
  empresa: string;
  nitEmpresa: string;
  ciudad: string;
  fechaApertura: string;
  actaApertura: string;
  montoAutorizado: number;
  limiteMaximoPorGasto: number;
  umbralReembolsoPorcentaje: number;
  responsableCustodio: string;
  aprobadorDesignado: string;
  contadorDesignado: string;
  periodicidadCierre: string;
  entregaInformeSemanal: string;
  estadoFondo: 'Activo' | 'En revisión de arqueo' | 'Cerrado';
}

export interface DenominacionEfectivo {
  valor: number;
  etiqueta: string;
  tipo: 'Billete' | 'Moneda';
  cantidad: number;
}

export interface ArqueoCajaMenor {
  id: string;
  consecutivo: string; // FOR-CM-004-xxx
  fechaHora: string;
  responsableCaja: string;
  verificadorDesignado: string;
  cargoVerificador: string;
  fondoAutorizado: number;
  efectivoFisicoContado: number;
  totalGastosConSoporte: number;
  totalGastosSinSoporte: number;
  totalAnticiposPendientes: number;
  saldoTeoricoSistema: number;
  totalJustificado: number;
  diferencia: number; // 0 = exacto, < 0 = faltante, > 0 = sobrante
  estadoConciliacion: 'Cuadre exacto' | 'Faltante detectado' | 'Sobrante detectado';
  observaciones: string;
  denominaciones: DenominacionEfectivo[];
}

export interface ReembolsoCajaMenor {
  id: string;
  consecutivo: string;
  fechaSolicitud: string;
  fechaAprobacion?: string;
  solicitadoPor: string;
  aprobadoPor: string;
  revisadoContabilidadPor: string;
  valorReembolso: number;
  cantidadMovimientos: number;
  movimientosIds: string[];
  estado: 'Reembolso solicitado' | 'Reembolsada';
  observaciones: string;
}
