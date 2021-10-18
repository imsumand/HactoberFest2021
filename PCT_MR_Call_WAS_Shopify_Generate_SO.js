/**
 *              //////////     PCT SHOPIFY INTEGRATION      //////////
 * 
 *@author       Sandipan Sau
 *@NApiVersion  2.1
 *@NScriptType  MapReduceScript
 *@NModuleScope SameAccount
 *@since        2021-08-12 yyyy-MM-dd
 *@copyright    Paapri Business Technologies (India) Pvt Ltd.
 *@license      The SuiteScript 2.1 code in this page is for PCT Shopify Integration, you can redistribute
                it and/or modify it uder the terms of PCT General Public License (PCT GPL) as
                published by the Paapri's TEAM INNOVATION.

 *@description  This MapReduceScript is used to call the Workflow Action Script.
 */

define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{

    function getInputData()
    {
        log.debug({ title: "PCT-Shopify-Integration", details: "In Get Input Function" });
        var customrecord_pct_shopify_web_orderSearchObj = search.create({
            type: "customrecord_pct_shopify_web_order",
            filters:
                [
                    ["custrecord_pct_swo_nssonumber", "isempty", ""],
                    //  "AND",
                    //  ["custrecord_pct_processed", "is", "F"],
                    "AND",
                    ["custrecord_pct_swo_so_created", "is", "F"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var PCTShopify_ResultCount = customrecord_pct_shopify_web_orderSearchObj.runPaged().count;
        log.debug("PCT-Shopify-Integration", "Search Result Count : " + PCTShopify_ResultCount);
        var start = 0;
        var end = 1000;
        var shopify_weborder_array = new Array();
        do
        {
            log.debug("PCT-Shopify-Integration", "In Get Input Do");
            var PCTShopify_Result = customrecord_pct_shopify_web_orderSearchObj.run().getRange({ start: start, end: end });
            for (var getid_index = 0; getid_index < PCTShopify_ResultCount; getid_index++)
            {
                var record_id = PCTShopify_Result[getid_index].id;
                // log.debug({
                //     title: "PCT-HL-Record ID",
                //     details: "Id : " + record_id
                // })
                shopify_weborder_array.push(record_id);
            }
            start += 1000;
            end += 1000;
            PCTShopify_ResultCount -= 1000;
        }
        while (PCTShopify_ResultCount > 0);
        log.debug({ title: "PCT-Shopify-Integration", details: "Shopify Web Order Id Array Length : " + shopify_weborder_array.length + ", Shopify Web Order Id Array : [" + shopify_weborder_array + "]" });
        return shopify_weborder_array;
    }

    function map(context)
    {
        log.debug({ title: "PCT-Shopify-Integration", details: "In Map Function & MAP Context : " + context.value })
        var weborder_id = context.value;
        var shopify_weborder_load = record.load({
            type: 'customrecord_pct_shopify_web_order',
            id: weborder_id
        });
        shopify_weborder_load.setValue({ fieldId: 'custrecord_pct_processed', value: true });
        var recordId = shopify_weborder_load.save({
            enableSourcing: true,
            ignoreMandatoryFields: true
        });
        log.debug({ title: "PCT-Shopify-Integration", details: "Edited Record ID:" + recordId });
    }
    function reduce(context)
    {
        log.debug({ title: "PCT-Shopify-Integration", details: "In Reduce Function" });
        log.debug({
            title: "PCT-Shopify-Integration",
            details: "Shopify Weborder Id : " + context.key
        });
    }

    function summarize(summary)
    {
        log.debug({
            title: "PCT-Shopify-Integration",
            details: "In Summarize Function"
        })
    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
