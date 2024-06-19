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

                    if (method == 'getDataUser') {

                        // Obtener area
                        let { area } = objHelper.getDataUser(solicitado_por_id);

                        // Respuesta
                        response = {
                            code: '200',
                            status: 'success',
                            method: method,
                            area: area
                        };
                    } else if (method == 'emitidoPor' && bomrevisionRecord) {

                        // Setear datos al record
                        bomrevisionRecord.setValue('custrecord_bio_rlm_usu_fir_emitido_por', user.id);
                        bomrevisionRecord.setValue('custrecord_bio_rlm_fec_fir_emitido_por', datetime);
                        let bomrevisionId = bomrevisionRecord.save();
                        log.debug('', bomrevisionId);

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
                            // objHelper.sendEmail_SolicitarAprobacion(proyectoRecord, user);

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

                    // Respuesta
                    scriptContext.response.setHeader('Content-type', 'application/json');
                    scriptContext.response.write(JSON.stringify(response));
                }
            }
        }

        return { onRequest }

    });
