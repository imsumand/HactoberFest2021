/**
 *              //////////     PMC QMS 2.1 | Doc Item Details Page    //////////
 * 
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  Suitelet
 *@NModuleScope SameAccount
 *@since        2021-03-25 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.0 code in this page is for PMC CRM, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This Suitelet is used to render login page Html template.
 */
define(['N/file', 'N/render', 'N/search', 'N/log', 'N/redirect', 'N/record', 'N/format', 'N/email', 'N/runtime', 'N/url'],
    function (file, render, search, log, redirect, record, format, email, runtime, url)
    {
        /**
             * Definition of the Suitelet script trigger point.
             * 
             * @param {Object} context 
             * @param {ServerRequest} context.request - Encapsulation of the incoming request
             * @param {Serverresponse} context.response - Encapsulation of the Suitelet response
             */
        function onRequest(context)
        {
            var request = context.request;
            var response = context.response;
            if (request.method == 'GET')
            {
                var documentType = request.parameters.documentType;
                var documentNumber = request.parameters.documentNumber;
                var custparam_userName = request.parameters.custparam_userName;
                var documentStatus = request.parameters.documentStatus;
                log.debug({ title: 'PCT-QMS', details: "User Name : " + custparam_userName + ", Document Type : " + documentType + ", Document Number : " + documentNumber + ", Document Status : " + documentStatus });

                var faviconUrl = GetFaviconImgUrl();
                var bodyImgUrl = GetPaapriFullImgUrl();
                // Assemble Data Source for Home Page
                var dataSource = {
                    faviconUrl: faviconUrl,
                    bodyImgUrl: bodyImgUrl,
                    isHidden: 'hidden',
                    custparam_userName: custparam_userName,
                    documentType: documentType,
                    documentNumber: documentNumber,
                };
                // Load Login HTML Template
                var templateFile = file.load({ id: '../HTML Files/pct_qms_itemDetails_page.html' });
                // Rendering Login Page
                var pageRenderer = render.create();
                pageRenderer.templateContent = templateFile.getContents();
                // Adding Data Source to the page renderer
                pageRenderer.addCustomDataSource({
                    format: render.DataSource.OBJECT,
                    alias: 'ds',
                    data: dataSource
                });
                // documentType = 'assemblybuild';
                var table_html = '';
                var list_dropdown = '';

                //-------------------------------------- Search for Assembly Build Item Get ----------------------------------
                if (documentType == 'assemblybuild')
                {
                    var assemblybuildSearchObj = search.create({
                        type: "assemblybuild",
                        filters:
                            [
                                ["type", "anyof", "Build"],
                                "AND",
                                ["numbertext", "is", documentNumber],
                                "AND",
                                ["mainline", "is", "T"]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "item", label: "Item" }),
                                search.createColumn({ name: "serialnumbers", label: "Serial/Lot Numbers" })
                            ]
                    });
                    var assemblybuildCount = assemblybuildSearchObj.runPaged().count;
                    log.debug("PCT-QMS", "Assembly Build Result Count : " + assemblybuildCount);
                    var assemblybuildResult = assemblybuildSearchObj.run().getRange({ start: 0, end: assemblybuildCount });
                    for (var assemblybuild_index = 0; assemblybuild_index < assemblybuildCount; assemblybuild_index++)
                    {
                        var itemId = assemblybuildResult[assemblybuild_index].getValue('item');
                        //-------------------- Search for get Item Name ---------------------
                        var itemName = ItemNameSearch(itemId);
                        var serialNumber = assemblybuildResult[assemblybuild_index].getValue('serialnumbers');
                        log.debug("PCT-QMS", "Item Id : " + itemId + ", Item Name : " + itemName + ", Serial Number : " + serialNumber);
                        table_html +=
                            '<tr>' +
                            '<td>' + (assemblybuild_index + 1) + '</td>' +
                            '<td>' + itemName + '</td>' +
                            '<td>' + serialNumber + '</td>' +
                            '<td>' + "-NA-" + '</td>' +
                            '<td>' + "-NA-" + '</td>' +
                            '<td>' + "-NA-" + '</td>' +
                            ' </tr > ';
                        list_dropdown +=
                            '<option >' + itemName + '</option>';
                    }
                }
                //-------------------------------------- Serach for Item Receipt Item Get ----------------------------------

                else if (documentType == 'itemreceipt')
                {
                    var filterArray = [];
                    filterArray.push(["type", "anyof", "ItemRcpt"]);
                    filterArray.push("AND");
                    filterArray.push(["mainline", "is", "F"]);
                    filterArray.push("AND");
                    filterArray.push(["numbertext", "is", documentNumber]);
                    filterArray.push("AND");
                    filterArray.push(["account", "anyof", "112"]);
                    filterArray.push("AND");
                    if (documentStatus == "Pending")
                    {
                        filterArray.push(["custcol_pct_pp_item_existing", "is", "F"]);
                    }
                    else if (documentStatus == "Existing")
                    {
                        filterArray.push(["custcol_pct_pp_item_existing", "is", "T"]);
                    }

                    var itemreceiptSearchObj = search.create({
                        type: "itemreceipt",
                        filters:
                            [
                                filterArray
                                // ["type", "anyof", "ItemRcpt"],
                                // "AND",
                                // ["mainline", "is", "F"],
                                // "AND",
                                // ["numbertext", "is", documentNumber],
                                // "AND",
                                // ["account", "anyof", "112"],
                                // "AND",
                                // ["custcol_pct_pp_item_existing", "is", "F"]
                            ],
                        columns:
                            [
                                search.createColumn({ name: "item", label: "Item" }),
                                search.createColumn({ name: "serialnumbers", label: "Serial/Lot Numbers" }),
                                search.createColumn({ name: "custbody_in_eway_vehicle_no", label: "Vehicle No." }),
                                search.createColumn({ name: "entity", label: "Name" }),
                                search.createColumn({
                                    name: "internalid",
                                    join: "item",
                                    label: "Internal ID"
                                }),
                                search.createColumn({ name: "custcol_pct_pp_item_existing", label: "Item Existing" })
                            ]
                    });
                    var itemReceiptCount = itemreceiptSearchObj.runPaged().count;
                    log.debug("PCT-QMS", "Item Receipt Result Count : " + itemReceiptCount);
                    var itemReceiptResult = itemreceiptSearchObj.run().getRange({ start: 0, end: itemReceiptCount });
                    for (var itemReceipt_index = 0; itemReceipt_index < itemReceiptCount; itemReceipt_index++)
                    {
                        var itemId = itemReceiptResult[itemReceipt_index].getValue({ name: "internalid", join: "item" });
                        log.debug("PCT-QMS", "Item Receipt Item Id : " + itemId);
                        //-------------------- Search for get Item Name ---------------------
                        var itemName = ItemNameSearch(itemId);
                        var serialNumber = itemReceiptResult[itemReceipt_index].getValue('serialnumbers');
                        var name = itemReceiptResult[itemReceipt_index].getText('entity');
                        var vehicleNo = itemReceiptResult[itemReceipt_index].getValue('custbody_in_eway_vehicle_no');
                        var itemStatus = itemReceiptResult[itemReceipt_index].getValue({ name: "custcol_pct_pp_item_existing" });
                        log.debug("PCT-QMS", "Item Id : " + itemId + ", Item Name : " + itemName + ", Serial Number : " + serialNumber + ", Vehicle No : " + vehicleNo + "Party :" + name);
                        table_html +=
                            '<tr>' +
                            '<td>' + (itemReceipt_index + 1) + '</td>' +
                            '<td>' + itemName + '</td>' +
                            '<td>' + serialNumber + '</td>' +
                            '<td>' + name + '</td>' +
                            '<td>' + vehicleNo + '</td>' +
                            '<td>' + itemStatus + '</td>' +
                            ' </tr > ';
                        list_dropdown +=
                            '<option >' + itemName + '</option>';

                    }
                }
                // Replacing in rendered Login Page
                var renderedPage = pageRenderer.renderAsString();
                renderedPage = renderedPage.replace('#TABLE-CONTENTS#', table_html);
                renderedPage = renderedPage.replace('#DROPDOWN-CONTENTS#', list_dropdown);
                response.write(renderedPage);

            }
            else
            {
                log.debug({ title: "PCT-QMS", details: 'In Post Method' });
                var documentType = request.parameters.documentType;
                var documentNumber = request.parameters.documentNumber;
                var documentStatus = request.parameters.documentStatus;
                log.debug({ title: 'PCT-QMS', details: "Document Type : " + documentType + ", Document Number : " + documentNumber + ", Document Status : " + documentStatus });

                var productName = request.parameters.productName;
                var qmsForm = request.parameters.qmsForm;
                var custparam_userName = request.parameters.custparam_userName;
                log.debug({ title: 'PCT-QMS', details: "User Name : " + custparam_userName + ", Product Name : " + productName + ", Form : " + qmsForm });
                if (qmsForm == "fillerForm")
                {
                    log.debug("PCT-QMS", "Redirect to Filler Form");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_filler_standing',
                        deploymentId: 'customdeploy_pct_qms_filler_standing',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': custparam_userName,
                            'documentType': documentType,
                            'documentNumber': documentNumber,
                            'documentStatus': documentStatus,
                            'productName': productName,
                            'qmsForm': qmsForm,
                        }
                    });
                }
                else if (qmsForm == "standardForm")
                {
                    log.debug("PCT-QMS", "Redirect to Standard Form");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_qms_standard_form',
                        deploymentId: 'customdeploy_pct_qms_qms_standard_form',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': custparam_userName,
                            'documentType': documentType,
                            'documentNumber': documentNumber,
                            'documentStatus': documentStatus,
                            'productName': productName,
                            'qmsForm': qmsForm,
                        }
                    });
                }
                else if (qmsForm == "pasteForm")
                {
                    log.debug("PCT-QMS", "Redirect to Paste Form");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_paste_testing',
                        deploymentId: 'customdeploy_pct_qms_paste_testing',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': custparam_userName,
                            'documentType': documentType,
                            'documentNumber': documentNumber,
                            'documentStatus': documentStatus,
                            'productName': productName,
                            'qmsForm': qmsForm,
                        }
                    });
                }
                else if (qmsForm == "additivesForm")
                {
                    log.debug("PCT-QMS", "Redirect to Additives Form");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_additives_testing',
                        deploymentId: 'customdeploy_pct_qms_additives_testing',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': custparam_userName,
                            'documentType': documentType,
                            'documentNumber': documentNumber,
                            'documentStatus': documentStatus,
                            'productName': productName,
                            'qmsForm': qmsForm,
                        }
                    });
                }
                else if (qmsForm == "powderForm")
                {
                    log.debug("PCT-QMS", "Redirect to Powder Form");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_powder_base_testing',
                        deploymentId: 'customdeploy_pct_qms_powder_base_testing',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': custparam_userName,
                            'documentType': documentType,
                            'documentNumber': documentNumber,
                            'documentStatus': documentStatus,
                            'productName': productName,
                            'qmsForm': qmsForm,
                        }
                    });
                }
                else if (qmsForm == "alkydForm")
                {
                    log.debug("PCT-QMS", "Redirect to Powder Form");
                    redirect.toSuitelet({
                        scriptId: 'customscript_pct_qms_alkyd_resin_testing',
                        deploymentId: 'customdeploy_pct_qms_alkyd_resin_testing',
                        isExternal: true,
                        parameters: {
                            'custparam_userName': custparam_userName,
                            'documentType': documentType,
                            'documentNumber': documentNumber,
                            'documentStatus': documentStatus,
                            'productName': productName,
                            'qmsForm': qmsForm,
                        }
                    });
                }




            }
        }
        //------------------------------------------- Custom Function ----------------------------------

        // This method is used to get the paapri favicon url
        function GetFaviconImgUrl()
        {
            var fileObj = file.load({
                id: '../Images/PCT logo.png'
            });
            return fileObj.url;
        }
        // This method is used to get the paapri full image url
        function GetPaapriFullImgUrl()
        {
            var fileObj = file.load({
                id: '../Images/PCT logo with name.png'
            });
            return fileObj.url;
        }
        function ItemNameSearch(itemId)
        {
            var itemSearchObj = search.create({
                type: "item",
                filters:
                    [
                        ["internalidnumber", "equalto", itemId]
                    ],
                columns:
                    [
                        search.createColumn({
                            name: "itemid",
                            sort: search.Sort.ASC,
                            label: "Name"
                        })
                    ]
            });
            var itemCount = itemSearchObj.runPaged().count;
            var itemResult = itemSearchObj.run().getRange({ start: 0, end: itemCount });
            var itemName = itemResult[0].getValue('itemid');
            return itemName;
        }

        return {
            onRequest: onRequest
        }
    });
