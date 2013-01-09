/*******************************************************************************
          %name: SicController.cs %
       %version: 2.1.8 %
  %date_created: Thu Dec 13 11:06:28 2012 %
    %derived_by: DSaustin %
      Copyright: Copyright 2012 BAE Systems Australia
                 All rights reserved.
********************************************************************************/
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using BAE.Mercury.Core.Business;
using BAE.Mercury.Core.MmhsModel;
using BAE.Mercury.Client.Models;

namespace BAE.Mercury.Client.Controllers
{

    /// <summary>
    /// Controller class for handling the request for SIC-related views and/or data
    /// </summary>
    public class SicController : Controller
    {
        private readonly IAddressBookService addressBookService;

        /// <summary>
        /// DI constructor
        /// </summary>
        /// <param name="addressBookService"></param>
        public SicController(IAddressBookService addressBookService)
        {
            this.addressBookService = addressBookService;
        }

        /// <summary>
        /// Returns the default Sic view 
        /// </summary>
        /// <returns></returns>
        public ActionResult Index()
        {
            return View();
        }


        /// <summary>
        /// Returns root-level Sic information in Json format
        /// </summary>
        /// <returns></returns>
        public JsonResult GetRootNodesAsJson()
        {
            var rootSicNodes = addressBookService.GetRootSicNodes();

            //g.v. commented out
            //var sicNodeViewModel = new vmSicTreeNodes(rootSicNodes);

            //return Json(sicNodeViewModel.SicNodesJson, JsonRequestBehavior.AllowGet);
            return null;
        }

        /// <summary>
        /// Returns child Sic information for the given sic in Json format
        /// </summary>        
        /// <param name="sicId">sic identifier</param>
        /// <returns></returns>
        public JsonResult GetChildrenAsJson(string sicId)
        {
            var childSicNodes = addressBookService.GetChildSicNodes(sicId);

            var sicNodeViewModel = new vmSicTreeNodes(childSicNodes);

            return Json(sicNodeViewModel.SicNodesJson, JsonRequestBehavior.AllowGet);
        }

        /// <summary>
        /// Returns the SIC address book view. Returns the partial view when SIC book is meant to be displayed in a modal window.
        /// </summary>
        /// <returns>SIC address book view.</returns>
        public ActionResult OpenSicBook()
        {
            // If the request is an ajax one, return the partial view
            if (Request.IsAjaxRequest())
			{
                return PartialView("Index");
			}

            // Else return the normal view
            return View();
        }

        /// <summary>
        /// Check SIC against repository of valid SICs
        /// </summary>
        /// <param name="sic">String SIC to be validated</param>
        /// <returns>boolean result</returns>
        public bool ValidateSic(string sic)
        {
            MessageSic test = null;//g.v. commentedt this out addressBookService.GetSic(sic);
            if (test != null)
            {
                return true;
            }
            return false;
        }

        /// <summary>
        /// returns autocomplete search results for jquery auto-complete plug-in
        /// </summary>
        /// <param name="term">string search parameter. NOTE** this name is mandatory---DO NOT CHANGE</param>
        /// <returns>JSON string </returns>
        public ActionResult SicSearch(string term) //must use parameter "term"
        {
            //test data
            var searchresults = new List<string> {  "A2B",   "B3E", "CAD",   "C2E",   "C2R", "F2A",   "F2E",   "F2T",   "M3G",   "TAR" };

            var model = searchresults
                .Take(10)
                .Where(r => r.StartsWith(term.ToUpper()))
                .Select(r => new { label = r });

            return Json(model, JsonRequestBehavior.AllowGet);
        }

    }
}