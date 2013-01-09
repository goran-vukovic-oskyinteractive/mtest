/*******************************************************************************
          %name: AuditTrailController.cs %
       %version: 9 %
  %date_created: Tue Nov 27 16:13:56 2012 %
    %derived_by: LLawley %
      Copyright: Copyright 2012 BAE Systems Australia
                 All rights reserved.
********************************************************************************/

using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using BAE.Mercury.Client.Models;
using BAE.Mercury.Business;
using BAE.Mercury.Core.Business;
using BAE.Mercury.Core.MmhsModel;
//using Microsoft.Practices.Unity;
using BAE.Mercury.Client.UnityConfiguration;

namespace BAE.Mercury.Client.Controllers
{
    /// <summary>
    /// A controller class for the display of the Audit Trail page.  The Audit trail displays system events, errors and messages to system administrators.
    /// </summary>
    public class AuditTrailController : Controller
    {
        /// <summary>
        /// The AuditTrail is retrieved from the database through the Audit Trail Service.
        /// </summary>

        private readonly IAuditTrailService service;



        /// <summary>

        /// Instantiates a new instance of the AuditTrailController.

        /// </summary>

        /// <param name="service">The Audit Trail Service.</param>

        public AuditTrailController(IAuditTrailService service)

        {

            this.service = service;

        }


        /// <summary>
        /// The 'index' page.
        /// </summary>
        /// <returns>The default view.</returns>
        public ActionResult Index()
        {
            return View("Index", AuditTrail);
        }

        /// <summary>
        /// Retrieves the AuditTrail, ready for display.  This method calculates a fresh audit trail directly
        /// from the database each time, to ensure that when the user opens their browser, the trail is up-to-date.
        /// </summary>
        public IEnumerable<vmSystemAuditEntry> AuditTrail
        {
            get
            {
                IList<vmSystemAuditEntry> auditTrail = new List<vmSystemAuditEntry>();
                IEnumerable<SystemAuditEntry> messages = service.ListAll();

                foreach (SystemAuditEntry message in messages)
                {
                    auditTrail.Add(new vmSystemAuditEntry(message));
                }

                return auditTrail;
            }
        }
    }
}
