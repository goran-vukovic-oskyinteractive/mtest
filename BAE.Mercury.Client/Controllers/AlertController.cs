/*******************************************************************************
          %name: AlertController.cs %
       %version: 3 %
 %date_created: Tue Dec  4 16:22:38 2012 %
    %derived_by: chrisn %
      Copyright: Copyright 2012 BAE Systems Australia
                 All rights reserved.
********************************************************************************/

using System;
using System.Collections;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using BAE.Mercury.Client.Models;
using BAE.Mercury.Core.DataTypes;
using BAE.Mercury.Core.Logging;
using BAE.Mercury.Core.Business;

namespace BAE.Mercury.Client.Controllers
{

    public class AlertController : Controller
    {
        // Alert service to manipulate alerts
        private IAlertService alertService;

        /// <summary>
        /// Main Constructer
        /// </summary>
        /// <param name="alertService"></param>
        public AlertController(IAlertService alertService)
        {
            this.alertService = alertService;
        }

        /// <summary>
        /// Render the alert popup
        /// </summary>
        /// <returns></returns>
        public ActionResult AlertsPopup()
        {
            return PartialView("AlertPopup");
        }

        /// <summary>
        /// Render the main alert page listing all the current alerts
        /// </summary>
        /// <returns></returns>
        public ActionResult Alerts()
        {
            return View("Alerts", GetAlerts());
        }

        /// <summary>
        /// Render a partial view of the alerts. Only alerts with ID greater than supplied will be rendered.
        /// </summary>
        /// <param name="lastAlertId">The last alert ID that has been rendered</param>
        /// <returns></returns>
        public ActionResult AlertList(int lastAlertId = -1)
        {
            IEnumerable<vmAlert> alerts = GetAlerts();
            return PartialView("AlertList", alerts.Where(a => a.Id > lastAlertId));
        }
        /// <summary>
        /// Render a partial view of the alerts. Only alerts with ID greater than supplied will be rendered.
        /// </summary>
        /// <param name="lastAlertId">The last alert ID that has been rendered</param>
        /// <returns>[JSON] Alert List and Counts : 
        /// { 
        ///     MaxAlertId : string,    - The maximum alert Id in the repository
        ///     TotalAlertCount : int,  - The total number of alerts in the repository
        ///     View : string           - The new alerts HTML string
        /// }</returns>
        public ActionResult AlertListJSON(int lastAlertId = -1)
        {
            IList<vmAlert> newAlerts = GetNewAlerts(lastAlertId);
            string viewString = ControllerContext.RenderViewToString("AlertList", newAlerts);

            var jsonObject = new
            {
                MaxAlertId = newAlerts.Any() ? newAlerts.Max(alert => alert.Id) : lastAlertId,
                TotalAlertCount = alertService.Count(),
                View = viewString
            };
            return Json(jsonObject, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Get a list of all the new alerts based on the last alert id supplied
        /// </summary>
        /// <param name="lastAlertId">ALerts with id greater than this will be retrieved</param>
        /// <returns>The new alerts</returns>
        private IList<vmAlert> GetNewAlerts(int lastAlertId)
        {
            return GetAlerts()
                    .Where(alert => alert.Id > lastAlertId)
                    .OrderByDescending(alert => alert.Id)
                    .ToList();
        }
        
        /// <summary>
        /// REST method to return an alert summary
        /// </summary>
        /// <returns>[JSON] Alert summary : { AlertMessage : string,  AlertCount : int}</returns>
        [AcceptVerbs(HttpVerbs.Get)]
        public JsonResult AlertSummary()
        {
            int count = alertService.GetAlerts().Count();
            var messageObject = new
            {
                AlertMessage = string.Format("There {0} {1} alert{2}.", count == 1 ? "is" : "are", count, count == 1 ? "" : "s"), 
                AlertCount = count
            };
            return Json(messageObject, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// REST method to delete a specific alert
        /// </summary>
        /// <param name="id">The ID of the alert to delete</param>
        /// <returns>[JSON] Success Object: { Success : bool }</returns>
        [AcceptVerbs(HttpVerbs.Get)]
        public JsonResult RemoveAlert(int id)
        {
            //g.v. commented out
            //alertService.RemoveAlert(id);
            return Json(new { Success = true }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// REST method to delete all alerts
        /// </summary>
        /// <returns>[JSON] Success Object: { Success : bool }</returns>
        [AcceptVerbs(HttpVerbs.Get)]
        public JsonResult RemoveAllAlerts()
        {
            //alertService.RemoveAllAlerts();
            return Json(new { Success = true }, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Helper method to retrieve all alerts as view model objects.
        /// </summary>
        /// <returns></returns>
        private IEnumerable<vmAlert> GetAlerts()
        {
            return vmAlert.Alerts(alertService.GetAlerts().OrderByDescending(alert => alert.Id));
        }

    }

}
