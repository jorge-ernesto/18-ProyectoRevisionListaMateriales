function deshabilitarCamposSublista(recordContext, mode) {

    let recordObj = recordContext;

    // Obtener columna y deshabilitarla
    // https://6462530-sb1.app.netsuite.com/app/help/helpcenter.nl?fid=section_158618597707.html
    var sublistObj = recordObj.getSublist({
        sublistId: 'component'
    });
    var columnItemDisplay = sublistObj.getColumn({
        fieldId: 'item_display'
    });
    var columnComponentYield = sublistObj.getColumn({
        fieldId: 'componentyield'
    });
    var columnPrincipioActivo = sublistObj.getColumn({
        fieldId: 'custrecord184'
    });
    var columnBomQuantity = sublistObj.getColumn({
        fieldId: 'bomquantity'
    });
    var columnUnits = sublistObj.getColumn({
        fieldId: 'units'
    });
    var columnBioCamAdicionalOp = sublistObj.getColumn({
        fieldId: 'custrecord183'
    });
    var columnIssuedStep = sublistObj.getColumn({
        fieldId: 'custpage_member_process'
    });
    var columnAutoIssue = sublistObj.getColumn({
        fieldId: 'custpage_member_autoissue'
    });

    // Deshabilitar campos
    columnItemDisplay.isDisabled = true;
    columnComponentYield.isDisabled = true;
    columnPrincipioActivo.isDisabled = true;
    columnBomQuantity.isDisabled = true;
    columnUnits.isDisabled = true;
    columnBioCamAdicionalOp.isDisabled = true;
    columnIssuedStep.isDisabled = true;
    columnAutoIssue.isDisabled = true;
}
