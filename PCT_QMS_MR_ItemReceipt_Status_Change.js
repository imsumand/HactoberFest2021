/**
 *@NApiVersion 2.1
 *@NScriptType MapReduceScript
 */
define(['N/log', 'N/record', 'N/runtime', 'N/file', 'N/format', 'N/search'], function (log, record, runtime, file, format, search)
{

    function getInputData()
    {
        log.debug({ title: "PCT-QMS-GetInput", details: "In Get Input Function" })
        var itemreceiptSearchObj = search.create({
            type: "itemreceipt",
            filters:
                [
                    ["type", "anyof", "ItemRcpt"],
                    "AND",
                    ["mainline", "is", "T"]
                ],
            columns:
                [
                    search.createColumn({ name: "internalid", label: "Internal ID" })
                ]
        });
        var itemReceiptCount = itemreceiptSearchObj.runPaged().count;
        log.debug("PCT-QMS", "Item Receipt Result Count : " + itemReceiptCount);
        var itemReceiptResult = itemreceiptSearchObj.run().getRange({ start: 0, end: itemReceiptCount });
        var itemReceiptArray = new Array();
        for (var ir_index = 0; ir_index < itemReceiptCount; ir_index++)
        {
            var iRId = itemReceiptResult[ir_index].id;
            itemReceiptArray.push(iRId);
        }
        log.debug({
            title: "PCT HL",
            details: "Id Array Length : " + itemReceiptArray.length + ", Array Element : [ " + itemReceiptArray + " ]"
        })
        return itemReceiptArray;
    }

    function map(context)
    {
        log.debug({ title: "PCT-QMS-MAP", details: "In Map Function" })
        try
        {
            var iRid = context.value;
            log.debug({
                title: "PCT-QMS",
                details: "Item Receipt Id : " + iRid
            })
            var itemReceiptload = record.load({
                type: 'itemreceipt',
                id: iRid
            });
            var item_count = itemReceiptload.getLineCount({ sublistId: 'item' });
            log.debug({
                title: "PCT-QMS",
                details: "Item Count" + item_count
            })
            for (ir_index = 0; ir_index < item_count; ir_index++)
            {
                itemReceiptload.setSublistValue({
                    sublistId: 'item',
                    fieldId: 'custcol_pct_pp_item_existing',
                    line: ir_index,
                    value: false
                });
            }
            itemReceiptload.setText({ fieldId: 'custbody_pct_pp_item_recipt_status', text: "Pending" });
            itemReceiptload.save();
            log.debug({
                title: "PCT-QMS",
                details: "Record Change"
            })
        }
        catch {

        }
    }

    function reduce(context)
    {

    }

    function summarize(summary)
    {

    }

    return {
        getInputData: getInputData,
        map: map,
        reduce: reduce,
        summarize: summarize
    }
});
