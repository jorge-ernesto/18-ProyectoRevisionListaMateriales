/**
 * @NApiVersion 2.1
 * @NModuleScope SameAccount
 */
define(['N'],

    function (N) {

        const { log, runtime, record, search, url, email } = N;

        function getUser() {
            let user = runtime.getCurrentUser();
            return { user };
        }

        function error_log(title, data) {
            throw `${title} -- ${JSON.stringify(data)}`;
        }

        function error_message(message) {
            throw new Error(`${message}`);
        }

        /****************** Validacion ******************/

        function getCountrySubsidiary(subsidiaryId) {
            // Cargar el registro de la subsidiaria
            var subsidiaryRecord = record.load({
                type: record.Type.SUBSIDIARY,
                id: subsidiaryId
            });

            // Obtener el pais del registro de la subsidiaria
            var countrySubsidiary = subsidiaryRecord.getValue('country');

            return countrySubsidiary;
        }

        /****************** Records personalizados ******************/

        function getConfiguracionEmpleados() {

            // Crear un array para almacenar los valores
            var empleadosArray = [];

            // Crear una búsqueda para obtener los registros
            var searchObj = search.create({
                type: 'customrecord_bio_conf_rlm_emp',
                columns: [
                    'custrecord_bio_rlm_emp_subsidiaria',
                    'custrecord_bio_rlm_emp_centro_costo',
                    'custrecord_bio_rlm_emp_empleado',
                    'custrecord_bio_rlm_emp_perm_firmar'
                ],
                filters: [
                    search.createFilter({
                        name: 'isinactive',
                        operator: search.Operator.IS,
                        values: 'F' // F para registros activos
                    })
                ]
            });

            // Ejecutar la búsqueda y recorrer los resultados
            searchObj.run().each(function (result) {
                // Obtener informacion
                let { columns } = result;
                let subsidiaria_id_interno = result.getValue(columns[0]);
                let subsidiaria_nombre = result.getText(columns[0]);
                let centro_costo_id_interno = result.getValue(columns[1]);
                let centro_costo_nombre = result.getText(columns[1]);
                let empleado_id_interno = result.getValue(columns[2]);
                let empleado_nombre = result.getText(columns[2]);
                let permiso_firmar = result.getValue(columns[3]);

                // Insertar informacion en array
                empleadosArray.push({
                    subsidiaria: { id_interno: subsidiaria_id_interno, nombre: subsidiaria_nombre },
                    centro_costo: { id_interno: centro_costo_id_interno, nombre: centro_costo_nombre },
                    empleado: { id_interno: empleado_id_interno, nombre: empleado_nombre },
                    permiso_firmar: permiso_firmar
                });
                return true;
            });

            // Obtener empleados
            /**
             * Subsidiaria: BIOMONT
             * Centro de Costo: 1501 Logística
             * Permisor Firmar: Si
             */
            let empleados_perm_log_array = empleadosArray.filter(registro => registro.subsidiaria.id_interno == '2' && registro.centro_costo.id_interno == '5' && registro.permiso_firmar == true);
            empleados_perm_log_array = empleados_perm_log_array.map(registro => Number(registro.empleado.id_interno));
            empleados_perm_log_array = [...new Set(empleados_perm_log_array)];

            /**
             * Subsidiaria: BIOMONT
             * Centro de Costo: 5501 Investigación y Desarrollo
             * Permisor Firmar: Si
             */
            let empleados_perm_invdes_array = empleadosArray.filter(registro => registro.subsidiaria.id_interno == '2' && registro.centro_costo.id_interno == '26' && registro.permiso_firmar == true);
            empleados_perm_invdes_array = empleados_perm_invdes_array.map(registro => Number(registro.empleado.id_interno));
            empleados_perm_invdes_array = [...new Set(empleados_perm_invdes_array)];

            /**
             * Subsidiaria: BIOMONT
             * Centro de Costo: 1001 Operaciones y Planta
             * Permisor Firmar: Si
             */
            let empleados_perm_opepla_array = empleadosArray.filter(registro => registro.subsidiaria.id_interno == '2' && registro.centro_costo.id_interno == '1' && registro.permiso_firmar == true);
            empleados_perm_opepla_array = empleados_perm_opepla_array.map(registro => Number(registro.empleado.id_interno));
            empleados_perm_opepla_array = [...new Set(empleados_perm_opepla_array)];

            /**
             * Subsidiaria: BIOMONT
             * Centro de Costo: Todos
             * Permisor Firmar: Todos
             */
            // Obtener empleados -- Subsidiaria: BIOMONT, Todos los centros de costo
            let empleados_email_array = empleadosArray.filter(registro => registro.subsidiaria.id_interno == '2');
            empleados_email_array = empleados_email_array.map(registro => Number(registro.empleado.id_interno));
            empleados_email_array = [...new Set(empleados_email_array)];

            // error_log('getConfiguracionEmpleados', { empleados_perm_log_array, empleados_perm_invdes_array, empleados_perm_opepla_array, empleados_email_array });
            return { empleados_perm_log_array, empleados_perm_invdes_array, empleados_perm_opepla_array, empleados_email_array };
        }

        /****************** Data ******************/

        /****************** Email ******************/

        function getUrlRecord(bomrevisionId) {

            let urlRecord = url.resolveRecord({
                recordType: 'bomrevision',
                recordId: bomrevisionId,
            })

            return { urlRecord };
        }

        function sendEmail(bomrevisionRecord, user, method) {

            // Obtener datos
            let lista = bomrevisionRecord.getText('billofmaterials');
            let revision = bomrevisionRecord.getText('name');

            // Obtener url
            let { urlRecord } = getUrlRecord(bomrevisionRecord.getValue('id'));

            // Obtener empleados
            let recipients = [];
            let { empleados_email_array } = getConfiguracionEmpleados();
            recipients = recipients.concat(empleados_email_array);

            // Validar regla "Se permite un máximo de 10 destinatarios ( options.recipients+ options.cc+ ).options.bcc"
            let groups_recipients = [];
            while (recipients.length > 0) {
                groups_recipients.push(recipients.splice(0, 10));
            }

            if (method == 'emitidoPor') {
                groups_recipients.forEach(recipients => {

                    // Enviar email
                    if (Object.keys(recipients).length > 0) {
                        email.send({
                            author: 22147, // Usuario 'NOTIFICACIONES NETSUITE'
                            recipients: recipients,
                            subject: `[Revisión de lista de materiales] Notificación de NetSuite`,
                            body: `
                                El usuario <b>"${user.name}"</b> ha emitido la <b>Revisión de lista de materiales</b> en el sistema NetSuite.
                                Concepto: Revisión de lista de materiales.<br /><br />
                                Lista: ${lista}<br /><br />
                                Revisión: ${revision}<br /><br />
                                Link: <a href="${urlRecord}">${urlRecord}</a>
                            `
                        });
                    }
                });
            } else if (method == 'aprobarRevisadoPor') {
                groups_recipients.forEach(recipients => {

                    // Enviar email
                    if (Object.keys(recipients).length > 0) {
                        email.send({
                            author: 22147, // Usuario 'NOTIFICACIONES NETSUITE'
                            recipients: recipients,
                            subject: `[Revisión de lista de materiales] Notificación de NetSuite`,
                            body: `
                                El usuario <b>"${user.name}"</b> ha revisado la <b>Revisión de lista de materiales</b> en el sistema NetSuite.
                                Concepto: Revisión de lista de materiales.<br /><br />
                                Lista: ${lista}<br /><br />
                                Revisión: ${revision}<br /><br />
                                Link: <a href="${urlRecord}">${urlRecord}</a>
                            `
                        });
                    }
                });
            } else if (method == 'rechazarRevisadoPor') {
                groups_recipients.forEach(recipients => {

                    // Enviar email
                    if (Object.keys(recipients).length > 0) {
                        email.send({
                            author: 22147, // Usuario 'NOTIFICACIONES NETSUITE'
                            recipients: recipients,
                            subject: `[Revisión de lista de materiales] Notificación de NetSuite`,
                            body: `
                                El usuario <b>"${user.name}"</b> ha rechazado la <b>Revisión de lista de materiales</b> en el sistema NetSuite.
                                Concepto: Revisión de lista de materiales.<br /><br />
                                Lista: ${lista}<br /><br />
                                Revisión: ${revision}<br /><br />
                                Link: <a href="${urlRecord}">${urlRecord}</a>
                            `
                        });
                    }
                });
            } else if (method == 'aprobarAprobadoPor') {
                groups_recipients.forEach(recipients => {

                    // Enviar email
                    if (Object.keys(recipients).length > 0) {
                        email.send({
                            author: 22147, // Usuario 'NOTIFICACIONES NETSUITE'
                            recipients: recipients,
                            subject: `[Revisión de lista de materiales] Notificación de NetSuite`,
                            body: `
                                El usuario <b>"${user.name}"</b> ha aprobado la <b>Revisión de lista de materiales</b> en el sistema NetSuite.
                                Concepto: Revisión de lista de materiales.<br /><br />
                                Lista: ${lista}<br /><br />
                                Revisión: ${revision}<br /><br />
                                Link: <a href="${urlRecord}">${urlRecord}</a>
                            `
                        });
                    }
                });
            } else if (method == 'rechazarAprobadoPor') {
                groups_recipients.forEach(recipients => {

                    // Enviar email
                    if (Object.keys(recipients).length > 0) {
                        email.send({
                            author: 22147, // Usuario 'NOTIFICACIONES NETSUITE'
                            recipients: recipients,
                            subject: `[Revisión de lista de materiales] Notificación de NetSuite`,
                            body: `
                                El usuario <b>"${user.name}"</b> ha rechazado la <b>Revisión de lista de materiales</b> en el sistema NetSuite.
                                Concepto: Revisión de lista de materiales.<br /><br />
                                Lista: ${lista}<br /><br />
                                Revisión: ${revision}<br /><br />
                                Link: <a href="${urlRecord}">${urlRecord}</a>
                            `
                        });
                    }
                });
            }
        }

        return {
            getUser,
            error_log,
            error_message,
            // Revisión de lista de materiales - Validacion
            getCountrySubsidiary,
            // Revisión de lista de materiales - Records personalizados
            getConfiguracionEmpleados,
            // Revisión de lista de materiales - Email
            sendEmail
        }

    });
