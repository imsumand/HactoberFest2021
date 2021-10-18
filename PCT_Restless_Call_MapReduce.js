/**
* Module Description
*
* Version       Date            		Author           Remarks
* 2.00          09 April 2021    	    Sandipan Sau
*
*
 *@NApiVersion 2.1
 *@NScriptType Restlet
 */

/**********************************************************************************************************************************************

Script Name:        PCT_RESTlet_Call_MapReduce
Developer:          Sandipan Sau
Development Head:   Mr.Kunal Das
Company Name:       Paapri Business Technologies (India) Pvt Ltd
Purpose: 			Script which will call map reduce script of sales order generate

© Copyright All Rights Reserved

***********************************************************************************************************************************************/
/******************************************************** Included Function & Update ************************************************************
/**********************************************************************************************************************************************

Function Name:             			                                Purpose:                                                                    Developer:
_get()							                                Call Map Reduce Script                  		   		                        Sandipan Sau


/**********************************************************************************************************************************************

Update Log

Date                   Developer Name              Requester                     Change Summary


***********************************************************************************************************************************************/
define(['N/task', 'N/record', 'N/error', 'N/log', 'N/format', 'N/search'],
    function (task, record, error, log, format, search)
    {

        function _get(context)
        {
            try
            {
                var job = task.create({
                    taskType: task.TaskType.MAP_REDUCE,
                    scriptId: 'customscript_pct_shopify_mr_generate_so',
                    deploymentId: 'customdeploy_pct_shopify_mr_generate_so'
                });
                var myTaskId = job.submit();
                var taskStatus = task.checkStatus({
                    taskId: myTaskId
                });
                log.debug({
                    title: 'PCT-HL',
                    details: 'Call Success'
                });
                return JSON.stringify({ status: 200, message: taskStatus.status.toString() });
            }
            catch (err)
            {
                return JSON.stringify({ status: 500, message: err.message });
            }

        }
        return {
            get: _get
        }
    });
