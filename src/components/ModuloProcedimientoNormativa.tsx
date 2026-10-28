import React, { useState } from 'react';
import {
  BookOpen,
  CheckCircle2,
  ExternalLink,
  FileCheck2,
  HelpCircle,
  Scale,
  Users,
  Workflow,
} from 'lucide-react';
import {
  COMPARATIVA_NORMATIVA_COLOMBIA,
  ESTADOS_OFICIALES_TABLA,
  PASOS_PROCEDIMIENTO_VCA,
  ROLES_SISTEMA_VCA,
} from '../data/procedimientoData';

interface ModuloProcedimientoNormativaProps {
  subVistaInicial?: 'PROCEDIMIENTO' | 'NORMATIVIDAD' | 'CONSULTOR';
}

const CONSULTAS_RAPIDAS_ASISTENTE = [
  {
    id: 'autorizacion-legalizacion',
    pregunta: '¿Cómo funciona paso a paso la autorización y legalización de un gasto en Viaja con Adri?',
    respuestaTitulo: 'Procedimiento de Autorización (FOR-CM-001) y Legalización (FOR-CM-003)',
    pasos: [
      '1. Solicitud (FOR-CM-001): Antes de sacar dinero, el colaborador registra el concepto, valor estimado, fecha, categoría y justificación. El sistema valida que no supere el límite individual ($300.000 COP).',
      '2. Autorización: El Aprobador revisa que sea un gasto necesario para la agencia de viajes y que exista saldo disponible. Si aprueba, pasa a entrega; si rechaza, queda bloqueado.',
      '3. Entrega de Efectivo (FOR-CM-002): El responsable de caja menor entrega el dinero y el solicitante firma o confirma recibido. Queda en estado «Pendiente de legalización».',
      '4. Compra y Soporte: El colaborador realiza el gasto únicamente para el fin aprobado y exige Factura Electrónica a nombre de VIAJA CON ADRI S.A.S. (NIT 901.482.319-4).',
      '5. Legalización (FOR-CM-003): El colaborador registra el valor real gastado, adjunta la factura y devuelve en efectivo el dinero sobrante (vuelto) al responsable de caja menor.',
      '6. Revisión Contable: Contabilidad verifica los requisitos del Art. 617 y 771-2 del E.T., asigna la cuenta PUC y cambia el estado a «Legalizada».',
    ],
  },
  {
    id: 'arqueo-diferencias',
    pregunta: '¿Cómo se hace el arqueo de caja menor y qué pasa si sobra o falta dinero?',
    respuestaTitulo: 'Protocolo de Arqueo (FOR-CM-004) y Tratamiento de Diferencias',
    pasos: [
      '1. Conteo Físico: En presencia del responsable de caja menor y un verificador delegado, se cuentan todos los billetes y monedas disponibles en la caja.',
      '2. Suma de Soportes: Se suman las facturas/soportes de gastos ya pagados y los recibos de entregas pendientes de legalizar (FOR-CM-002).',
      '3. Fórmula de Control: Efectivo Físico + Gastos con Soporte + Anticipos Pendientes = $2.000.000 COP (Fondo Autorizado).',
      '4. Si hay FALTANTE (el total es menor a $2.000.000): Se deja constancia en el Acta FOR-CM-004. Primero se verifica si olvidaron registrar un recibo; si el faltante es real, el responsable custodio responde por el valor y Contabilidad lo registra en la cuenta 136595 (Cuentas por cobrar a trabajadores).',
      '5. Si hay SOBRANTE (el total supera $2.000.000): Se verifica si corresponde a un sobrante devuelto no registrado o a una factura pagada con dinero propio del empleado. Si no se identifica origen, se registra como partida por aclarar / ingreso no operacional.',
    ],
  },
  {
    id: 'soportes-dian',
    pregunta: '¿Qué soporte debo exigir según el tipo de compra para que Contabilidad lo acepte?',
    respuestaTitulo: 'Reglas de Soportes Válidos ante la DIAN (Arts. 615, 617 y 771-2 E.T.)',
    pasos: [
      '1. Proveedores obligados a facturar (Papelerías, supermercados, ferreterías, restaurantes con facturación): Exigir siempre FACTURA ELECTRÓNICA DE VENTA expedida a nombre de VIAJA CON ADRI S.A.S.',
      '2. Tiquetes POS: Solo son deducibles si son Documentos Equivalentes Electrónicos (POS Electrónico) con identificación del adquirente (Resolución DIAN 000165 de 2023). Un tirilla POS simple sin datos de la agencia NO es deducible en Renta.',
      '3. Personas naturales NO obligadas a facturar (ej. mensajero independiente, transporte local o plomero régimen simplificado/no responsable de IVA): Solicitar copia del RUT actualizado y elaborar el DOCUMENTO SOPORTE en adquisiciones efectuadas a sujetos no obligados a facturar.',
      '4. Gastos sin soporte: No son aceptados fiscalmente (Art. 771-2 E.T.) y generan alerta inmediata en el informe del viernes.',
    ],
  },
  {
    id: 'reembolso-cierre',
    pregunta: '¿Cuándo se pide el reembolso y qué diferencia hay con el cierre del viernes y mensual?',
    respuestaTitulo: 'Diferencia entre Informe Semanal (Viernes), Reembolso y Cierre Mensual (FOR-CM-006)',
    pasos: [
      '1. Informe Semanal (Cada Viernes): Todos los viernes se envía a Contabilidad el reporte en Excel o PDF con los movimientos de la semana, advirtiendo qué soportes están pendientes y cuál es el saldo disponible.',
      '2. Solicitud de Reembolso (Paso 10): Cuando el fondo se ha consumido cerca del 70% ($1.400.000 COP gastados) o al cierre de mes, se agrupan todos los gastos «Legalizados» y se solicita a Gerencia/Tesorería que gire ese valor exacto para que la caja vuelva a tener $2.000.000 COP.',
      '3. Cierre Mensual (FOR-CM-006): Al terminar el mes se concilian todas las entradas, salidas, reembolsos y arqueos. Como indica el manual de Viaja con Adri, el cierre mensual NO exige que la caja quede en cero pesos, sino que todos los gastos del mes queden causados y conciliados.',
    ],
  },
];

export const ModuloProcedimientoNormativa: React.FC<ModuloProcedimientoNormativaProps> = ({
  subVistaInicial = 'PROCEDIMIENTO',
}) => {
  const [subVista, setSubVista] = useState<'PROCEDIMIENTO' | 'NORMATIVIDAD' | 'CONSULTOR'>(
    subVistaInicial
  );
  const [pasoSeleccionado, setPasoSeleccionado] = useState<number>(1);
  const [consultaActivaId, setConsultaActivaId] = useState<string>(
    CONSULTAS_RAPIDAS_ASISTENTE[0].id
  );

  const pasoActualObj =
    PASOS_PROCEDIMIENTO_VCA.find((p) => p.numero === pasoSeleccionado) ||
    PASOS_PROCEDIMIENTO_VCA[0];

  const consultaActivaObj =
    CONSULTAS_RAPIDAS_ASISTENTE.find((c) => c.id === consultaActivaId) ||
    CONSULTAS_RAPIDAS_ASISTENTE[0];

  return (
    <div className="space-y-6">
      {/* Barra de conmutación interna */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg overflow-x-auto">
          <button
            type="button"
            onClick={() => setSubVista('PROCEDIMIENTO')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              subVista === 'PROCEDIMIENTO'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Workflow className="w-3.5 h-3.5" />
            Procedimiento 12 Pasos y Flujograma
          </button>
          <button
            type="button"
            onClick={() => setSubVista('NORMATIVIDAD')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              subVista === 'NORMATIVIDAD'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Scale className="w-3.5 h-3.5" />
            Normatividad Colombiana (Privadas vs. Públicas)
          </button>
          <button
            type="button"
            onClick={() => setSubVista('CONSULTOR')}
            className={`px-3.5 py-2 text-xs font-medium rounded-md transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0 ${
              subVista === 'CONSULTOR'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Guía Práctica de Autorización, Arqueo y Soportes
          </button>
        </div>

        <a
          href="/assets/aistudio/Evidencia-Plataforma_caja_menor_789b5980.pdf"
          target="_blank"
          rel="noopener noreferrer"
          className="px-3.5 py-2 text-xs font-medium text-teal-800 bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-lg transition-colors inline-flex items-center gap-1.5 whitespace-nowrap shrink-0"
        >
          <BookOpen className="w-3.5 h-3.5" />
          Ver Documento Oficial SENA (PDF)
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {/* SUBVISTA 1: LOS 12 PASOS DEL PROCEDIMIENTO Y FLUJOGRAMA */}
      {subVista === 'PROCEDIMIENTO' && (
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-xs font-mono text-slate-500">
                Manual Oficial de Caja Menor · Fondo Inicial $2.000.000 COP · SENA Medellín (Ficha 3278193)
              </p>
              <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
                Flujograma y Procedimiento Paso a Paso (12 Etapas de Control)
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                Seleccione cualquiera de las 12 etapas del ciclo de caja menor de Viaja con Adri para consultar sus pasos operativos, el formulario exigido, el control del sistema y el soporte legal.
              </p>
            </div>

            {/* Selector visual de los 12 pasos */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
              {PASOS_PROCEDIMIENTO_VCA.map((p) => {
                const activo = p.numero === pasoSeleccionado;
                return (
                  <button
                    key={p.numero}
                    type="button"
                    onClick={() => setPasoSeleccionado(p.numero)}
                    className={`p-3 rounded-lg border text-left transition-colors ${
                      activo
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    <span
                      className={`text-xs font-mono block ${
                        activo ? 'text-teal-300' : 'text-slate-500'
                      }`}
                    >
                      Paso {String(p.numero).padStart(2, '0')}
                    </span>
                    <span className="text-xs font-semibold mt-1 block line-clamp-2">
                      {p.titulo}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Detalle del paso seleccionado */}
            <div className="border border-slate-200 rounded-xl p-6 bg-slate-50/60 space-y-4">
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-200 pb-4">
                <div>
                  <span className="text-xs font-mono font-semibold text-teal-800">
                    ETAPA {String(pasoActualObj.numero).padStart(2, '0')} DE 12 · RESPONSABLE: {pasoActualObj.responsable}
                  </span>
                  <h3 className="text-lg font-bold text-slate-900 mt-1">
                    Paso {pasoActualObj.numero}. {pasoActualObj.titulo}
                  </h3>
                </div>
                {pasoActualObj.formulario && (
                  <div className="text-xs font-mono text-slate-700 bg-white border border-slate-200 px-3 py-1.5 rounded-lg">
                    Formulario: <strong>{pasoActualObj.formulario}</strong>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-7 space-y-2">
                  <h4 className="text-xs font-semibold text-slate-700">
                    Secuencia de Actividades Paso a Paso:
                  </h4>
                  <ol className="space-y-2 text-sm text-slate-800">
                    {pasoActualObj.acciones.map((acc, idx) => (
                      <li
                        key={idx}
                        className="flex items-start gap-2.5 bg-white p-3 rounded-lg border border-slate-200/80"
                      >
                        <span className="font-mono text-xs font-semibold text-teal-800 mt-0.5 shrink-0">
                          {pasoActualObj.numero}.{idx + 1}
                        </span>
                        <span>{acc}</span>
                      </li>
                    ))}
                  </ol>
                </div>

                <div className="lg:col-span-5 space-y-4">
                  <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1.5">
                    <h4 className="text-xs font-semibold text-slate-900">
                      Control Obligatorio del Sistema
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {pasoActualObj.controlSistema}
                    </p>
                  </div>

                  <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1.5">
                    <h4 className="text-xs font-semibold text-slate-900">
                      Fundamento Contable y Normativo
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed">
                      {pasoActualObj.fundamentoNormativo}
                    </p>
                  </div>

                  {pasoActualObj.estadosGenerados && (
                    <div className="p-4 bg-white border border-slate-200 rounded-lg space-y-1.5">
                      <h4 className="text-xs font-semibold text-slate-900">
                        Estados del Sistema en esta Etapa
                      </h4>
                      <p className="text-xs font-mono text-teal-800">
                        {pasoActualObj.estadosGenerados.join(' · ')}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </section>

          {/* Tabla de Roles y Tabla de Estados Oficiales */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-teal-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Responsables y Roles del Sistema (Sección 2)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 pr-3 font-medium">Rol</th>
                      <th className="py-2 pl-3 font-medium">Funciones y Alcance en Caja Menor</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ROLES_SISTEMA_VCA.map((r) => (
                      <tr key={r.rol}>
                        <td className="py-2.5 pr-3 font-semibold text-slate-900 whitespace-nowrap align-top">
                          {r.rol}
                        </td>
                        <td className="py-2.5 pl-3 text-slate-700">{r.responsabilidad}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-center gap-2">
                <FileCheck2 className="w-4 h-4 text-teal-700" />
                <h3 className="text-base font-semibold text-slate-900">
                  Estados Oficiales del Sistema (Sección 5)
                </h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-2 pr-3 font-medium">Estado</th>
                      <th className="py-2 px-3 font-medium">Significado</th>
                      <th className="py-2 pl-3 font-medium">Etapa</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {ESTADOS_OFICIALES_TABLA.map((e) => (
                      <tr key={e.estado}>
                        <td className="py-2 pr-3 font-mono font-medium text-slate-900 whitespace-nowrap">
                          {e.estado}
                        </td>
                        <td className="py-2 px-3 text-slate-700">{e.significado}</td>
                        <td className="py-2 pl-3 text-slate-500 whitespace-nowrap">{e.etapa}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>
        </div>
      )}

      {/* SUBVISTA 2: NORMATIVIDAD COLOMBIANA (EMPRESAS PRIVADAS VS. ENTIDADES PÚBLICAS) */}
      {subVista === 'NORMATIVIDAD' && (
        <div className="space-y-6">
          <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-5">
            <div className="border-b border-slate-200 pb-4">
              <p className="text-xs font-mono text-slate-500">
                Marco Legal y Tributario Colombiano Aplicable al Manejo de Caja Menor
              </p>
              <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
                Diferencias Normativas: Empresas Privadas (Viaja con Adri) vs. Entidades Públicas
              </h2>
              <p className="text-sm text-slate-600 mt-1">
                En Colombia, aunque tanto el sector privado como el público utilizan fondos de caja menor para gastos urgentes de baja cuantía, sus obligaciones legales, presupuestales y disciplinarias tienen fundamentos jurídicos distintos.
              </p>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-50 border-b border-slate-200 text-slate-700">
                    <th className="py-3 px-4 font-semibold w-1/5">Criterio / Aspecto Legal</th>
                    <th className="py-3 px-4 font-semibold w-2/5 text-teal-900">
                      Empresas Privadas (Caso: VIAJA CON ADRI S.A.S.)
                    </th>
                    <th className="py-3 px-4 font-semibold w-2/5 text-slate-900">
                      Entidades Públicas (Estado Colombiano)
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {COMPARATIVA_NORMATIVA_COLOMBIA.map((fila) => (
                    <tr key={fila.aspecto} className="hover:bg-slate-50/60">
                      <td className="py-3.5 px-4 font-semibold text-slate-900 align-top">
                        {fila.aspecto}
                      </td>
                      <td className="py-3.5 px-4 text-slate-800 leading-relaxed align-top bg-teal-50/20">
                        {fila.empresasPrivadas}
                      </td>
                      <td className="py-3.5 px-4 text-slate-700 leading-relaxed align-top">
                        {fila.entidadesPublicas}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Resumen de normas clave de Viaja con Adri */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
              <div className="p-4 border border-slate-200 rounded-lg space-y-1.5">
                <span className="text-xs font-mono text-teal-800 font-semibold">
                  Ley 1314 de 2009 y Decreto 2420 de 2015
                </span>
                <h4 className="text-sm font-semibold text-slate-900">
                  Marco Técnico Contable (NIIF PYMES)
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Regula el reconocimiento contable del efectivo y equivalentes al efectivo (Cuenta 110510) y la causación de los gastos en el período en que ocurren. El monto de $2.000.000 COP es fijado por política interna de la agencia.
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg space-y-1.5">
                <span className="text-xs font-mono text-teal-800 font-semibold">
                  Arts. 615, 617, 618 y 771-2 E.T. · Dec. 1625/2016
                </span>
                <h4 className="text-sm font-semibold text-slate-900">
                  Soportes Fiscales y Facturación DIAN
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Establece que ningún gasto de caja menor será deducible en el Impuesto de Renta si no está respaldado por Factura Electrónica de Venta, Documento Equivalente POS Electrónico o Documento Soporte para no obligados a facturar.
                </p>
              </div>

              <div className="p-4 border border-slate-200 rounded-lg space-y-1.5">
                <span className="text-xs font-mono text-teal-800 font-semibold">
                  Art. 632 Estatuto Tributario y Ley 527 de 1999
                </span>
                <h4 className="text-sm font-semibold text-slate-900">
                  Conservación y Mensajes de Datos
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed">
                  Obliga a conservar los comprobantes, facturas electrónicas, actas de arqueo (FOR-CM-004) y cierres (FOR-CM-006) garantizando su integridad, autenticidad y disponibilidad para futuras revisiones de la DIAN.
                </p>
              </div>
            </div>
          </section>
        </div>
      )}

      {/* SUBVISTA 3: CONSULTOR PRÁCTICO PASO A PASO */}
      {subVista === 'CONSULTOR' && (
        <section className="bg-white border border-slate-200 rounded-xl p-6 space-y-6">
          <div className="border-b border-slate-200 pb-4">
            <p className="text-xs font-mono text-slate-500">
              Orientación Administrativa y Contable para Colaboradores de Viaja con Adri
            </p>
            <h2 className="text-xl font-semibold text-slate-900 mt-0.5">
              Guía Paso a Paso de Procedimientos y Solución de Dudas Frecuentes
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Seleccione una consulta frecuente para ver el procedimiento exacto que debe aplicar según las políticas de Viaja con Adri y las normas contables colombianas.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-5 space-y-2.5">
              {CONSULTAS_RAPIDAS_ASISTENTE.map((item) => {
                const activa = item.id === consultaActivaId;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setConsultaActivaId(item.id)}
                    className={`w-full text-left p-4 rounded-lg border text-xs font-medium transition-colors ${
                      activa
                        ? 'bg-slate-900 border-slate-900 text-white'
                        : 'bg-slate-50 border-slate-200 text-slate-800 hover:bg-slate-100'
                    }`}
                  >
                    {item.pregunta}
                  </button>
                );
              })}
            </div>

            <div className="lg:col-span-7 border border-slate-200 rounded-xl p-6 bg-slate-50/50 space-y-4">
              <h3 className="text-base font-bold text-slate-900">
                {consultaActivaObj.respuestaTitulo}
              </h3>
              <div className="space-y-2.5">
                {consultaActivaObj.pasos.map((pasoTexto, i) => (
                  <div
                    key={i}
                    className="p-3.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 leading-relaxed flex items-start gap-2.5"
                  >
                    <CheckCircle2 className="w-4 h-4 text-teal-700 shrink-0 mt-0.5" />
                    <span>{pasoTexto}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>
      )}
    </div>
  );
};
