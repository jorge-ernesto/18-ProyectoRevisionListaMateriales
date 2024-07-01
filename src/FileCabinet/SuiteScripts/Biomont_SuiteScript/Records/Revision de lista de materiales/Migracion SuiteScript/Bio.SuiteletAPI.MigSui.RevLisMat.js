// Notas del archivo:
// - Secuencia de comando:
//      - Biomont SL API Mig Sui Rev Lis Mat (customscript_bio_sl_api_migsui_revlismat)

/**
 * @NApiVersion 2.1
 * @NScriptType Suitelet
 */
define(['./lib/Bio.Library.Helper', 'N'],

    function (objHelper, N) {

        const { log, record, runtime, format, url } = N;

        /******************/

        /**
         * Defines the Suitelet script trigger point.
         * @param {Object} scriptContext
         * @param {ServerRequest} scriptContext.request - Incoming request
         * @param {ServerResponse} scriptContext.response - Suitelet response
         * @since 2015.2
         */
        function onRequest(scriptContext) {
            // Debug
            // scriptContext.response.setHeader('Content-type', 'application/json');
            // scriptContext.response.write(JSON.stringify(scriptContext));
            // return;

            // Debug
            // log.debug('method', scriptContext.request.method);
            // log.debug('parameters', scriptContext.request.parameters);
            // log.debug('body', scriptContext.body);
            // return;

            if (scriptContext.request.method == 'POST') {

                // Obtener datos enviados por peticion HTTP
                let data = JSON.parse(scriptContext.request.body);
                let method = data._method || null;

                if (method) {

                    // Obtener datos
                    let bomrevision_id = data._bomrevision_id || null;

                    // Obtener el record del proyecto
                    let bomrevisionRecord = bomrevision_id ? record.load({ type: 'bomrevision', id: bomrevision_id }) : null;

                    // Obtener el usuario logueado
                    let user = runtime.getCurrentUser();

                    // Obtener fecha y hora actual
                    var now = new Date();
                    var datetime = format.format({ value: now, type: format.Type.DATETIME });

                    // Respuesta
                    let response = {
                        code: '400',
                        status: 'error',
                        method: method
                    };

                    // El control de errores comienza aca para tener acceso a method y response
                    try {
                        // Debug
                        // objHelper.error_log('test err', response);

                        if (method == 'getDataUser') {

                            // Obtener area
                            let { centro_costo } = objHelper.getDataUser(user.id);

                            // Respuesta
                            response = {
                                code: '200',
                                status: 'success',
                                method: method,
                                centro_costo: centro_costo
                            };
                        } else if (method == 'getDataConfiguracionEmpleadosPermisosBasicos') {

                            // Obtener datos
                            let { empleados_perm_fir_log_array, empleados_perm_fir_invdes_array, empleados_perm_fir_opepla_array, empleados_email_array } = objHelper.getConfiguracionEmpleadosPermisosBasicos();

                            // Validar que encontro configuracion de empleados permisos
                            if (empleados_perm_fir_log_array || empleados_perm_fir_invdes_array || empleados_perm_fir_opepla_array || empleados_email_array) {

                                // Respuesta
                                response = {
                                    code: '200',
                                    status: 'success',
                                    method: method,
                                    arrayEmpleadosPermisosBasicos: { empleados_perm_fir_log_array, empleados_perm_fir_invdes_array, empleados_perm_fir_opepla_array, empleados_email_array }
                                };
                            }
                        } else if (method == 'getDataConfiguracionEmpleadosPermisosSuperiores') {

                            // Obtener datos
                            let { empleados_perm_gua_array, empleados_perm_eli_fir_array } = objHelper.getConfiguracionEmpleadosPermisosSuperiores();

                            // Validar que encontro configuracion de empleados permisos
                            if (empleados_perm_gua_array || empleados_perm_eli_fir_array) {

                                // Respuesta
                                response = {
                                    code: '200',
                                    status: 'success',
                                    method: method,
                                    arrayEmpleadosPermisosSuperiores: { empleados_perm_gua_array, empleados_perm_eli_fir_array }
                                };
                            }
                        } else if (method == 'emitidoPor' && bomrevisionRecord) {

                            // Setear datos al record
                            bomrevisionRecord.setValue('custrecord_bio_rlm_usu_fir_emitido_por', user.id);
                            bomrevisionRecord.setText('custrecord_bio_rlm_fec_fir_emitido_por', datetime);
                            let bomrevisionId = bomrevisionRecord.save();
                            log.debug('emitidoPor', bomrevisionId);

                            if (bomrevisionId) {
                                // Obtener url del Record
                                let urlRecord = url.resolveRecord({
                                    recordType: 'bomrevision',
                                    recordId: bomrevision_id,
                                    params: {
                                        _status: 'PROCESS_SIGNATURE'
                                    }
                                })

                                // Enviar email
                                objHelper.sendEmail(bomrevisionRecord, user, method='emitidoPor');

                                // Respuesta
                                response = {
                                    code: '200',
                                    status: 'success',
                                    method: method,
                                    bomrevisionRecord: bomrevisionRecord,
                                    bomrevisionId: bomrevisionId,
                                    urlRecord: urlRecord
                                };
                            }
                        } else if (method == 'aprobarRevisadoPor' && bomrevisionRecord) {

                            // Setear datos al record
                            bomrevisionRecord.setValue('custrecord_bio_rlm_usu_fir_revisado_por', user.id);
                            bomrevisionRecord.setText('custrecord_bio_rlm_fec_fir_revisado_por', datetime);
                            let bomrevisionId = bomrevisionRecord.save();
                            log.debug('aprobarRevisadoPor', bomrevisionId);

                            if (bomrevisionId) {
                                // Obtener url del Record
                                let urlRecord = url.resolveRecord({
                                    recordType: 'bomrevision',
                                    recordId: bomrevision_id,
                                    params: {
                                        _status: 'PROCESS_SIGNATURE'
                                    }
                                })

                                // Enviar email
                                objHelper.sendEmail(bomrevisionRecord, user, method='aprobarRevisadoPor');

                                // Respuesta
                                response = {
                                    code: '200',
                                    status: 'success',
                                    method: method,
                                    bomrevisionRecord: bomrevisionRecord,
                                    bomrevisionId: bomrevisionId,
                                    urlRecord: urlRecord
                                };
                            }
                        } else if (method == 'rechazarRevisadoPor' && bomrevisionRecord) {

                            // Setear datos al record
                            // Firma (Emitido por)
                            bomrevisionRecord.setValue('custrecord_bio_rlm_usu_fir_emitido_por', '');
                            bomrevisionRecord.setText('custrecord_bio_rlm_fec_fir_emitido_por', '');
                            // Firma (Revisado por)
                            bomrevisionRecord.setValue('custrecord_bio_rlm_usu_fir_revisado_por', '');
                            bomrevisionRecord.setText('custrecord_bio_rlm_fec_fir_revisado_por', '');
                            let bomrevisionId = bomrevisionRecord.save();
                            log.debug('rechazarRevisadoPor', bomrevisionId);

                            if (bomrevisionId) {
                                // Obtener url del Record
                                let urlRecord = url.resolveRecord({
                                    recordType: 'bomrevision',
                                    recordId: bomrevision_id,
                                    params: {
                                        _status: 'PROCESS_SIGNATURE'
                                    }
                                })

                                // Enviar email
                                objHelper.sendEmail(bomrevisionRecord, user, method='rechazarRevisadoPor');

                                // Respuesta
                                response = {
                                    code: '200',
                                    status: 'success',
                                    method: method,
                                    bomrevisionRecord: bomrevisionRecord,
                                    bomrevisionId: bomrevisionId,
                                    urlRecord: urlRecord
                                };
                            }
                        } else if (method == 'aprobarAprobadoPor' && bomrevisionRecord) {

                            // Setear datos al record
                            bomrevisionRecord.setValue('custrecord_bio_rlm_usu_fir_aprobado_por', user.id);
                            bomrevisionRecord.setText('custrecord_bio_rlm_fec_fir_aprobado_por', datetime);
                            let bomrevisionId = bomrevisionRecord.save();
                            log.debug('aprobarAprobadoPor', bomrevisionId);

                            if (bomrevisionId) {
                                // Obtener url del Record
                                let urlRecord = url.resolveRecord({
                                    recordType: 'bomrevision',
                                    recordId: bomrevision_id,
                                    params: {
                                        _status: 'PROCESS_SIGNATURE'
                                    }
                                })

                                // Enviar email
                                objHelper.sendEmail(bomrevisionRecord, user, method='aprobarAprobadoPor');

                                // Respuesta
                                response = {
                                    code: '200',
                                    status: 'success',
                                    method: method,
                                    bomrevisionRecord: bomrevisionRecord,
                                    bomrevisionId: bomrevisionId,
                                    urlRecord: urlRecord
                                };
                            }
                        } else if ((method == 'rechazarAprobadoPor' || method == 'eliminarFirmas') && bomrevisionRecord) {

                            // Setear datos al record
                            // Firma (Emitido por)
                            bomrevisionRecord.setValue('custrecord_bio_rlm_usu_fir_emitido_por', '');
                            bomrevisionRecord.setText('custrecord_bio_rlm_fec_fir_emitido_por', '');
                            // Firma (Revisado por)
                            bomrevisionRecord.setValue('custrecord_bio_rlm_usu_fir_revisado_por', '');
                            bomrevisionRecord.setText('custrecord_bio_rlm_fec_fir_revisado_por', '');
                            // Firma (Aprobado por)
                            bomrevisionRecord.setValue('custrecord_bio_rlm_usu_fir_aprobado_por', '');
                            bomrevisionRecord.setText('custrecord_bio_rlm_fec_fir_aprobado_por', '');

                            if (method == 'eliminarFirmas') {
                                // Setear datos al record
                                // Firma (Emitido por) - String
                                bomrevisionRecord.setValue('custrecord211', '');
                                bomrevisionRecord.setText('custrecord212', '');
                                // Firma (Revisado por) - String
                                bomrevisionRecord.setValue('custrecord213', '');
                                bomrevisionRecord.setText('custrecord214', '');
                                // Firma (Aprobado por) - String
                                bomrevisionRecord.setValue('custrecord215', '');
                                bomrevisionRecord.setText('custrecord216', '');
                            }

                            let bomrevisionId = bomrevisionRecord.save();
                            log.debug('rechazarAprobadoPor, eliminarFirmas', bomrevisionId);

                            if (bomrevisionId) {
                                // Obtener url del Record
                                let urlRecord = url.resolveRecord({
                                    recordType: 'bomrevision',
                                    recordId: bomrevision_id,
                                    params: {
                                        _status: 'PROCESS_SIGNATURE'
                                    }
                                })

                                // Enviar email
                                if (method == 'rechazarAprobadoPor') {
                                    objHelper.sendEmail(bomrevisionRecord, user, method='rechazarAprobadoPor');
                                }

                                // Respuesta
                                response = {
                                    code: '200',
                                    status: 'success',
                                    method: method,
                                    bomrevisionRecord: bomrevisionRecord,
                                    bomrevisionId: bomrevisionId,
                                    urlRecord: urlRecord
                                };
                            }
                        }
                    } catch (err) {
                        // Respuesta
                        response = {
                            code: '400',
                            status: 'error',
                            method: method,
                            err: err
                        };
                    }

                    // Respuesta
                    scriptContext.response.setHeader('Content-type', 'application/json');
                    scriptContext.response.write(JSON.stringify(response));
                }
            }
        }

        return { onRequest }

    });
