// Notas del archivo:
// - Secuencia de comando:
//      - Biomont CS Mig Sui Rev Lis Mat (customscript_bio_cs_migsui_revlismat)
// - Registro:
//      - Revisión de lista de materiales (bomrevision)

// Validación como la usa LatamReady:
// - ClientScript                   : No se ejecuta en modo ver. Solo se ejecuta en modo crear, copiar o editar.
// - En modo crear, copiar o editar : Validamos por el formulario.
// - En modo ver                    : Validamos por el pais de la subsidiaria.

/**
 * @NApiVersion 2.1
 * @NScriptType ClientScript
 * @NModuleScope SameAccount
 */
define(['./lib/Bio.Library.Helper', 'N'],

    function (objHelper, N) {

        const { log, currentRecord, url, https, http } = N;

        const scriptId = 'customscript_bio_sl_api_migsui_revlismat';
        const deployId = 'customdeploy_bio_sl_api_migsui_revlismat';

        const scriptDownloadId = 'customscript_bio_sl_migsui_rlm_des_arc';
        const deployDownloadId = 'customdeploy_bio_sl_migsui_rlm_des_arc';

        /**
         * Formularios
         *
         * 353: BIO_FRM_REVISION_LISTA_MATERIALES
         */
        const forms = [353];

        /******************/

        /**
         * Function to be executed after page is initialized.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @param {string} scriptContext.mode - The mode in which the record is being accessed (create, copy, or edit)
         *
         * @since 2015.2
         */
        function pageInit(scriptContext) {

            // Obtener el currentRecord y mode
            let recordContext = scriptContext.currentRecord;
            let mode = scriptContext.mode;

            // Obtener datos
            let form_id = recordContext.getValue('customform') || null;

            // DEBUG
            // SIEMPRE SE EJECUTA
            console.log('pageInit!!!', scriptContext);

            // Modo crear, editar, copiar y formularios
            if ((mode == 'create' || mode == 'edit' || mode == 'copy') && forms.includes(Number(form_id))) {

                // Deshabilitar campos firmas
                deshabilitarCamposFirmas(recordContext, mode);
            }
        }

        /**
         * Validation function to be executed when record is saved.
         *
         * @param {Object} scriptContext
         * @param {Record} scriptContext.currentRecord - Current form record
         * @returns {boolean} Return true if record is valid
         *
         * @since 2015.2
         */
        function saveRecord(scriptContext) {

            // Obtener el currentRecord y mode
            let recordContext = scriptContext.currentRecord;
            let mode = recordContext.getValue('id') ? 'edit' : 'create';

            // Obtener datos
            let form_id = recordContext.getValue('customform') || null;

            // DEBUG
            console.log('saveRecord!!!', scriptContext);

            // Modo crear, editar, copiar y formularios
            if ((mode == 'create' || mode == 'edit' || mode == 'copy') && forms.includes(Number(form_id))) {

                // Validar campos firmas
                if (!validarCamposFirmas(recordContext, mode)) {
                    return false;
                }
            }

            return true;
        }

        /****************** Funcionalidad en campos ******************/

        function deshabilitarCamposFirmas(recordContext, mode) {

            // Obtener campo y deshabilitarlo
            // https://6462530-sb1.app.netsuite.com/app/help/helpcenter.nl?fid=section_4625600928.html

            // Deshabilitar campos
            // Formulario "BIO_FRM_REVISION_LISTA_MATERIALES"
            if (recordContext.getField('custrecord_bio_rlm_usu_fir_emitido_por')) recordContext.getField('custrecord_bio_rlm_usu_fir_emitido_por').isDisabled = true;  // Se deshabilita
            if (recordContext.getField('custrecord_bio_rlm_fec_fir_emitido_por')) recordContext.getField('custrecord_bio_rlm_fec_fir_emitido_por').isDisabled = true;  // Se deshabilita
            if (recordContext.getField('custrecord_bio_rlm_usu_fir_revisado_por')) recordContext.getField('custrecord_bio_rlm_usu_fir_revisado_por').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custrecord_bio_rlm_fec_fir_revisado_por')) recordContext.getField('custrecord_bio_rlm_fec_fir_revisado_por').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custrecord_bio_rlm_usu_fir_aprobado_por')) recordContext.getField('custrecord_bio_rlm_usu_fir_aprobado_por').isDisabled = true; // Se deshabilita
            if (recordContext.getField('custrecord_bio_rlm_fec_fir_aprobado_por')) recordContext.getField('custrecord_bio_rlm_fec_fir_aprobado_por').isDisabled = true; // Se deshabilita
        }

        function validarCamposFirmas(recordContext, mode) {

            // Modo editar
            if (mode == 'edit') {

                let firmaEmitidoPor = recordContext.getValue('custrecord_bio_rlm_usu_fir_emitido_por');

                // Validar campo con data - que se haya firmado
                if (firmaEmitidoPor) {

                    // Cargar Sweet Alert
                    loadSweetAlertLibrary().then(function () {

                        // Ejecutar validacion
                        Swal.fire({
                            icon: "error",
                            title: "Oops...",
                            text: "La revisión de lista de materiales se emitió. No se puede guardar el registro",
                        });
                    });

                    return false;
                }
            }

            return true;
        }

        /****************** Solicitud HTTP ******************/

        function loadSweetAlertLibrary() {
            return new Promise(function (resolve, reject) {
                var sweetAlertScript = document.createElement('script');
                sweetAlertScript.src = 'https://cdn.jsdelivr.net/npm/sweetalert2@11';
                sweetAlertScript.onload = resolve;
                document.head.appendChild(sweetAlertScript);
            });
        }

        function getUrlSuitelet() {

            // Obtener url del Suitelet mediante ID del Script y ID del Despliegue
            let suitelet = url.resolveScript({
                deploymentId: deployId,
                scriptId: scriptId
            });

            return suitelet;
        }

        function sendRequestWrapper({ method, title = '¿Está seguro?' }) {

            // Cargar Sweet Alert
            loadSweetAlertLibrary().then(function () {

                // Ejecutar confirmacion
                Swal.fire({
                    title: title,
                    text: "¡Debe confirmar la acción!",
                    icon: "warning",
                    showCancelButton: true,
                    confirmButtonColor: "#3085d6",
                    cancelButtonColor: "#d33",
                    confirmButtonText: "Enviar"
                }).then((result) => {
                    if (result.isConfirmed) {

                        // Ejecutar peticion
                        let responseData = sendRequest({ method, title });
                        if (responseData.status == 'success' && responseData.urlRecord) {
                            refreshPage(responseData);
                        }
                    }
                });
            });
        }

        function sendRequest({ method, title = '¿Está seguro?' }) {

            // Obtener el id interno de la revision de lista de materiales
            let recordContext = currentRecord.get();
            let bomrevision_id = recordContext.getValue('id');

            // Obtener url del Suitelet mediante ID del Script y ID del Despliegue
            let suitelet = getUrlSuitelet();

            // Solicitud HTTP
            let response = https.post({
                url: suitelet,
                body: JSON.stringify({
                    _method: method,
                    _bomrevision_id: bomrevision_id
                })
            });
            let responseData = JSON.parse(response.body);
            console.log('responseData', responseData);

            return responseData;
        }

        function refreshPage(responseData) {

            // Evitar que aparezca el mensaje 'Estas seguro que deseas salir de la pantalla'
            setWindowChanged(window, false);

            // Redirigir a la url
            window.location.href = responseData.urlRecord;
        }

        /****************** Mostrar botones ******************/

        function emitidoPor() {

            sendRequestWrapper({ method: 'emitidoPor' });
        }

        function revisadoPor() {

            loadSweetAlertLibrary().then(function () {

                // Aprobar Revisado Por / No Aprobar Revisado Por
                Swal.fire({
                    title: "Revisado Por",
                    showDenyButton: true,
                    showCancelButton: true,
                    confirmButtonText: "Aprobar",
                    denyButtonText: `Rechazar`
                }).then((result) => {
                    if (result.isConfirmed) {

                        // Ejecutar peticion
                        sendRequestWrapper({ method: 'aprobarRevisadoPor' });

                    } else if (result.isDenied) {

                        // Ejecutar peticion
                        sendRequestWrapper({ method: 'rechazarRevisadoPor', title: '¡Este proceso eliminara las firmas! ¿Está seguro?' });
                    }
                });
            });
        }

        function aprobadoPor() {

            loadSweetAlertLibrary().then(function () {

                // Aprobar Revisado Por / No Aprobar Revisado Por
                Swal.fire({
                    title: "Aprobado Por",
                    showDenyButton: true,
                    showCancelButton: true,
                    confirmButtonText: "Aprobar",
                    denyButtonText: `Rechazar`
                }).then((result) => {
                    if (result.isConfirmed) {

                        // Ejecutar peticion
                        sendRequestWrapper({ method: 'aprobarAprobadoPor' });

                    } else if (result.isDenied) {

                        // Ejecutar peticion
                        sendRequestWrapper({ method: 'rechazarAprobadoPor', title: '¡Este proceso eliminara las firmas! ¿Está seguro?' });
                    }
                });
            });
        }

        function eliminarFirmas() {

            sendRequestWrapper({ method: 'eliminarFirmas' });
        }

        function descargarPDF() {

            // Obtener el id interno del record proyecto
            let recordContext = currentRecord.get();
            let bomrevision_id = recordContext.getValue('id');

            // Obtener url del Suitelet mediante ID del Script y ID del Despliegue
            let suitelet = url.resolveScript({
                deploymentId: deployDownloadId,
                scriptId: scriptDownloadId,
                params: {
                    _button: 'pdf',
                    _bomrevision_id: bomrevision_id
                }
            });

            // Evitar que aparezca el mensaje 'Estas seguro que deseas salir de la pantalla'
            setWindowChanged(window, false);

            // Abrir url
            window.open(suitelet);
        }

        return {
            pageInit: pageInit,
            saveRecord: saveRecord,
            emitidoPor: emitidoPor,
            revisadoPor: revisadoPor,
            aprobadoPor: aprobadoPor,
            eliminarFirmas: eliminarFirmas,
            descargarPDF: descargarPDF
        };

    });
