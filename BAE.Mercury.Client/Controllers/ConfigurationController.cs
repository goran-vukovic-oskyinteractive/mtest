/*******************************************************************************
          %name: ConfigurationController.cs %
       %version: 8 %
  %date_created: Thu Dec  6 12:33:51 2012 %
    %derived_by: LLawley %
      Copyright: Copyright 2012 BAE Systems Australia
                 All rights reserved.
********************************************************************************/
using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Web;
using System.Web.Mvc;
using System.Transactions;
using BAE.Mercury.Client.Models;
using BAE.Mercury.Core.Configuration;
using BAE.Mercury.Core.DataTypes;
using BAE.Mercury.Core.Logging;
using BAE.Mercury.Core.MmhsModel;

namespace BAE.Mercury.Client.Controllers
{
    /// <summary>
    /// This is the controller class for the page where configuration parameters are updated
    /// </summary>
    public class ConfigurationController : Controller
    {
        /// <summary>
        /// Object used to get and set configuration parameters
        /// </summary>
        private readonly IConfigurationParameters configParams;

        /// <summary>
        /// Instantiates a new instance of the ConfigurationController.
        /// </summary>
        /// <param name="configParams">The common class for accessing configuration parameters</param>
        public ConfigurationController(IConfigurationParameters configParams)
        {
            this.configParams = configParams;
        }

        #region Http Request/Response

        /// <summary>
        /// Get the default Configuration view, containing all the configuration tabs
        /// </summary>
        /// <returns></returns>
        public ActionResult Index()
        {
            return View("Index");
        }

        /// <summary>
        /// Get the Site Configuration view
        /// </summary>
        /// <returns></returns>
        public ActionResult SiteConfiguration()
        {
            // Transaction is not needed but top layer always has a transaction now
            using (TransactionScope tx = new TransactionScope(TransactionScopeOption.RequiresNew))
            {
                vmSiteConfiguration config = GetSiteConfigurations();
                tx.Complete();
                return PartialView("SiteConfiguration", config);
            }
        }

        /// <summary>
        /// Get the Switch Configuration view
        /// </summary>
        /// <returns></returns>
        public ActionResult SwitchConfiguration()
        {
            return PartialView("SwitchConfiguration");
        }

        /// <summary>
        /// Get the User Group Configuration view
        /// </summary>
        /// <returns></returns>
        public ActionResult UserGroupConfiguration()
        {
            return PartialView("UserGroupConfiguration");
        }

        /// <summary>
        /// Get the User Group Configuration view
        /// </summary>
        /// <returns></returns>
        //public ActionResult ArchiveConfiguration()
        //{
        //    // Transaction is not needed but it's good practice to have one.
        //    using (TransactionScope tx = new TransactionScope(TransactionScopeOption.RequiresNew))
        //    {
        //        vmArchiveConfiguration config = GetArchiveConfiguration();
        //        tx.Complete();
        //        return PartialView("ArchiveConfiguration", config);
        //    }
        //}


        /// <summary>
        /// Update the site configuration
        /// </summary>
        /// <param name="siteConfiguration"></param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult UpdateSiteConfiguration(vmSiteConfiguration siteConfiguration)
        {
            using (TransactionScope tx = new TransactionScope(TransactionScopeOption.RequiresNew))
            {
                //g.v. commented out
                //configParams.UpdateAll(siteConfiguration.ConfigurationList());
                tx.Complete();
            }

            // Note: an exception getting thrown out of here gets handled correctly, javascript function for failure is invoked
            return null;
        }

        /// <summary>
        /// Updates the archive settings.
        /// </summary>
        /// <param name="archiveConfiguration">The newly updated archive configuration.</param>
        /// <returns>Nothing.</returns>
        [HttpPost]
        //public ActionResult UpdateArchiveConfiguration(vmArchiveConfiguration archiveConfiguration)
        //{
        //    using (TransactionScope tx = new TransactionScope(TransactionScopeOption.RequiresNew))
        //    {
        //        // The update all method only updates those parameters that have actually changed, so there shouldn't be a problem with 
        //        // sending them all through.
        //        //configParams.UpdateAll(archiveConfiguration.ConfigurationList());
        //        tx.Complete();
        //    }

        //    // Note: an exception getting thrown out of here gets handled correctly, javascript function for failure is invoked
        //    return null;
        //}

        #endregion

        #region Model Conversion

        /// <summary>
        /// Retrieve the list of site configurations as view models
        /// </summary>
        /// <returns></returns>
        private vmSiteConfiguration GetSiteConfigurations()
        {
            // Convert entity model to view model
            //return vmSiteConfiguration.SiteConfiguration(configParams.GetAll());
            return null;
        }

        /// <summary>
        /// Retrieve the list of archive configurations as view models
        /// </summary>
        /// <returns></returns>
        //private vmArchiveConfiguration GetArchiveConfiguration()
        //{
        //    // Convert entity model to view model
        //    //return vmArchiveConfiguration.ArchiveConfiguration(configParams.GetAll());
        //    return null;
        //}

        #endregion
    }
}
