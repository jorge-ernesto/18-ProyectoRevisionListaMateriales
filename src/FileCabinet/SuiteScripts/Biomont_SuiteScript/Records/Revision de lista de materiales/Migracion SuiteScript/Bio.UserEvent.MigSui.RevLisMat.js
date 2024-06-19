// Notas del archivo:
// - Secuencia de comando:
//      - Biomont UE Mig Sui Rev Lis Mat (customscript_bio_ue_migsui_revlismat)
// - Registro:
//      - Revisión de lista de materiales (bomrevision)
// - Contexto de Localizacion:
//      - Peru

// Validación como la usa LatamReady:
// - ClientScript                   : No se ejecuta en modo ver. Solo se ejecuta en modo crear, copiar o editar.
// - En modo crear, copiar o editar : Validamos por el formulario.
// - En modo ver                    : Validamos por el pais de la subsidiaria.

/**
 * @NApiVersion 2.1
 * @NScriptType UserEventScript
 */
define(['./lib/Bio.Library.Helper', 'N'],

    function (objHelper, N) {

        const { log } = N;
        const { serverWidget, message } = N.ui;

        /**
         * Formularios
         *
         * 353: BIO_FRM_REVISION_LISTA_MATERIALES
         */
        const forms = [353];

        /******************/

        /**
         * Defines the function definition that is executed before record is loaded.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @param {Form} scriptContext.form - Current form
         * @param {ServletRequest} scriptContext.request - HTTP request information sent from the browser for a client action only.
         * @since 2015.2
         */
        function beforeLoad(scriptContext) {

            // Obtener el newRecord y type
            let { newRecord, type } = scriptContext;

            // Obtener datos
            let form_id = newRecord.getValue('customform') || null;

            // Modo ver y pais de subsidiaria "PE"
            if (type == 'view') {

                cargarPagina(scriptContext);
            }
        }

        /**
         * Defines the function definition that is executed before record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        function beforeSubmit(scriptContext) {

        }

        /**
         * Defines the function definition that is executed after record is submitted.
         * @param {Object} scriptContext
         * @param {Record} scriptContext.newRecord - New record
         * @param {Record} scriptContext.oldRecord - Old record
         * @param {string} scriptContext.type - Trigger type; use values from the context.UserEventType enum
         * @since 2015.2
         */
        function afterSubmit(scriptContext) {

        }

        function cargarPagina(scriptContext) {

            // Obtener el newRecord y type
            let { newRecord, type, form } = scriptContext;

            // Asociar ClientScript al formulario
            form.clientScriptModulePath = './Bio.Client.MigSui.RevLisMat.js';

            // Obtener datos
            let status = scriptContext.request.parameters['_status'];

            /****************** Mostrar mensajes ******************/
            if (status?.includes('PROCESS_SIGNATURE')) {
                form.addPageInitMessage({
                    type: message.Type.INFORMATION,
                    message: `Se firmo correctamente`,
                    duration: 25000 // 25 segundos
                });
            }

            /****************** Mostrar botones para firmar ******************/
            form.addButton({
                id: 'custpage_button_emitido_por',
                label: 'Firmar Emitido Por',
                functionName: 'emitidoPor()'
            });

            form.addButton({
                id: 'custpage_button_revisado_por',
                label: 'Firmar Revisado Por',
                functionName: 'revisadoPor()'
            });

            form.addButton({
                id: 'custpage_button_aprobado_por',
                label: 'Firmar Aprobado Por',
                functionName: 'aprobadoPor()'
            });
        }

        return { beforeLoad, beforeSubmit, afterSubmit };

    });
