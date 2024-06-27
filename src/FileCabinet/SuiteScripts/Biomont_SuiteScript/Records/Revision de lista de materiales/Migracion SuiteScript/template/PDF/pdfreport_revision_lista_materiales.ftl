<#-- CONFIGURACION FREEMARKER -->
<#setting locale = "computer">
<#setting number_format = "computer">

<#assign params = input.data?eval>
<?xml version="1.0"?>
<!DOCTYPE pdf PUBLIC "-//big.faceless.org//report" "report-1.1.dtd">
<pdf>
    <head>
        <style>
            body {
                font-family: sans-serif;
            }

            .bold {
                font-weight: bold;
            }

            .center {
                text-align: center;
                margin: 0 auto;
            }

            .left {
                text-align: left;
            }

            .pb1 {
                padding-bottom: 1px;
            }

            .fs18 {
                font-size: 18px;
            }

            .fs15 {
                font-size: 15px;
            }

            .fs12 {
                font-size: 12px;
            }

            .fs10 {
                font-size: 10px;
            }

            .fs9 {
                font-size: 9px;
            }

            .fs8 {
                font-size: 8px;
            }

            .fs7 {
                font-size: 7px;
            }

            .border-collapse {
                border-collapse: collapse; /* Asegura que los bordes de las celdas se fusionen correctamente */
            }

            .tbody {
                border-collapse: collapse;
                width: 100%;
            }

            .tbody th,
            .tbody td {
                border: 0.1mm solid #000000;
                text-align: center;
                padding: 3px;
            }

            img {
                width: 120px;
                height: 40px;
            }
        </style>

        <macrolist>
            <macro id="nlfooter">

                <table width="100%" class="fs9 border-collapse">
                    <tfoot>
                        <tr>
                            <td colspan="5" align="right">Página <pagenumber/> / <totalpages/></td>
                        </tr>
                    </tfoot>
                </table>

            </macro>
        </macrolist>
    </head>

    <body size="A4" footer="nlfooter">

        <!-- <img src='https://www.biomont.com.pe/storage/img/logo.png'></img> -->

        <table width="100%" class="fs9 border-collapse" cellpadding="1">
            <thead>
                <tr>
					<th rowspan="4" colspan="1" align="left" valign="middle">
						<img src='${params.img_base64}'></img>
						<b>Laboratorios Biomont S.A.</b>
					</th>
					<th colspan="5" align="right" valign="middle">
						<span class="fs15"><b>F-LOG.004.06</b></span>
					</th>
				</tr>
                <tr>
                    <th colspan="5" align="right" valign="middle">
						<span class="fs18"><b>${params.bomrevision_data.titulo_pdf}</b></span>
					</th>
                </tr>
                <tr>
                    <th colspan="5" align="right" valign="middle">
						<span class="fs12"><b>ID INTERNO:</b> ${params.bomrevision_data.id_interno}</span>
					</th>
                </tr>
                <tr>
                    <th colspan="5"></th>
                </tr>
            </thead>
        </table>

        <!-- ORDEN DE TRABAJO -->
        <table width="100%" class="fs9 border-collapse" style="margin-top: 10px; border: 0.1mm solid #000000;" cellpadding="3">
            <tr>
                <th colspan="1" align="right"><b>Revisión/Producto:</b></th>
                <th colspan="1">${params.bomrevision_data.revision}</th>
                <th colspan="1" align="right"><b>Fecha creación:</b></th>
                <th colspan="1">${params.bomrevision_data.fecha_creacion}</th>
                <th colspan="1"></th>
            </tr>
            <tr>
                <th colspan="1" align="right"><b>Producto Bulk/Linea:</b></th>
                <th colspan="1">${params.bomrevision_data.memo}</th>
                <th colspan="1"></th>
                <th colspan="1"></th>
                <th colspan="1"></th>
            </tr>
            <tr>
                <th colspan="1" align="right"><b>Fórmula:</b></th>
                <th colspan="1">${params.bomrevision_data.lista}</th>
                <th colspan="1"></th>
                <th colspan="1"></th>
                <th colspan="1"></th>
            </tr>
            <tr>
                <th colspan="1" align="right"><b>Principio Activo:</b></th>
                <th colspan="1">
                    <div style='margin: 0px; padding: 0px; width: 19px; height: 9px; background-color: #D6DBDF; color: #D6DBDF;'></div>
                </th>
                <th colspan="1"></th>
                <th colspan="1"></th>
                <th colspan="1"></th>
            </tr>
        </table>

        <!-- ORDEN DE TRABAJO -->
        <table width="100%" class="fs9 border-collapse tbody" style="margin-top: 15px;" cellpadding="3">
            <tbody>
                <tr>
                    <td colspan="1" align="center"><b>Código</b></td>
                    <td colspan="1" align="center"><b>Descripción</b></td>
                    <td colspan="1" align="center"><b>Rendimiento</b></td>
                    <td colspan="1" align="center"><b>Cantidad</b></td>
                    <td colspan="1" align="center"><b>UND</b></td>
                </tr>
                <#list params.bomrevision_data.dataDetalleRevisionListaMateriales as detrlm>
                <tr>
                    <td colspan="1" align="center" <#if detrlm.principio_activo = true>style="background-color: #D6DBDF; color: #000000"</#if>>${detrlm.articulo.codigo}</td>
                    <td colspan="1" <#if detrlm.principio_activo = true>style="background-color: #D6DBDF; color: #000000"</#if>>${detrlm.articulo.descripcion}</td>
                    <td colspan="1" align="center" <#if detrlm.principio_activo = true>style="background-color: #D6DBDF; color: #000000"</#if>>${detrlm.rendimiento_componentes?string("#,##0.00")} %</td> <!-- ?string("#,##0.00") -->
                    <td colspan="1" align="center" <#if detrlm.principio_activo = true>style="background-color: #D6DBDF; color: #000000"</#if>>${detrlm.cantidad_bom?string("#,##0.00000")}</td> <!-- ?string("#,##0.00000") -->
                    <td colspan="1" align="center" <#if detrlm.principio_activo = true>style="background-color: #D6DBDF; color: #000000"</#if>>${detrlm.units}</td>
                </tr>
                </#list>
            </tbody>
        </table>

        <!-- ORDEN DE TRABAJO -->
        <table width="100%" class="fs9 border-collapse tbody" style="margin-top: 10px;" cellpadding="3">
            <tbody>
                <tr>
                    <td colspan="3" align="left" style="border: none;"><b>Emisión, Revisión y Aprobación</b></td>
                </tr>
                <tr>
                    <td colspan="1" align="center"><b>Emitido por</b></td>
                    <td colspan="1" align="center"><b>Revisado por</b></td>
                    <td colspan="1" align="center"><b>Aprobado por</b></td>
                </tr>
                <tr>
                    <td colspan="1" align="center" valign="middle" style="height: 60px;">
                        <p align="center" style="margin-top: 0px; margin-bottom: 0px;"><b>${params.bomrevision_data.usuario_firma_emitido_por}</b></p>
                        <p align="center" style="margin-top: 0px; margin-bottom: 0px;"><b>${params.bomrevision_data.fecha_firma_emitido_por}</b></p>
                    </td>
                    <td colspan="1" align="center" valign="middle" style="height: 60px;">
                        <p align="center" style="margin-top: 0px; margin-bottom: 0px;"><b>${params.bomrevision_data.usuario_firma_revisado_por}</b></p>
                        <p align="center" style="margin-top: 0px; margin-bottom: 0px;"><b>${params.bomrevision_data.fecha_firma_revisado_por}</b></p>
                    </td>
                    <td colspan="1" align="center" valign="middle" style="height: 60px;">
                        <p align="center" style="margin-top: 0px; margin-bottom: 0px;"><b>${params.bomrevision_data.usuario_firma_aprobado_por}</b></p>
                        <p align="center" style="margin-top: 0px; margin-bottom: 0px;"><b>${params.bomrevision_data.fecha_firma_aprobado_por}</b></p>
                    </td>
                </tr>
                <tr>
                    <td colspan="1" align="center"><b>Logística</b></td>
                    <td colspan="1" align="center"><b>Desarrollo Farmacéutico</b></td>
                    <td colspan="1" align="center"><b>Operaciones y Planta</b></td>
                </tr>
            </tbody>
        </table>

    </body>
</pdf>