// ================================================================================
//          %name: AddressController.cs %
//       %version: 5 %
//      Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// ================================================================================

using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using BAE.Mercury.Core.Business;
 

namespace BAE.Mercury.Client.Controllers
{
    /// <summary>
    /// MVC controller for address validation, auto-complete
    /// </summary>
    public class AddressController : Controller
    {
        private readonly IAddressBookService addressBookService;

        /// <summary>
        /// DI constructor, instantiates addressBookService for testing from IAddressBookService
        /// </summary>
        /// <param name="addressBookService"></param>
        public AddressController(IAddressBookService addressBookService)
        {
            this.addressBookService = addressBookService;
        }

        /// <summary>
        /// Check addressee against list of valid resolvable addresses
        /// </summary>
        /// <param name="address">String address to be validated</param>
        /// <returns>boolean result</returns>
        public bool ValidateAddress(string address)
        {
            bool isValid = addressBookService.ResolveAddressee(address);
            return isValid;
        }

        /// <summary>
        /// returns autocomplete search results for jquery auto-complete plug-in
        /// </summary>
        /// <param name="term">string search parameter. NOTE** this name is mandatory---DO NOT CHANGE</param>
        /// <returns>JSON string </returns>
        public ActionResult AddressSearch(string term) //must use parameter "term"
        {
            //test data
            var searchresults = new List<string> { term + " alternative 1", term + " alternative 2", term 
                + " alternative 3", term + " alternative 4", term + " alternative 5", term 
                + " alternative 6", term + " alternative 7", term + " alternative 8", term 
                + " alternative 9", term + " alternative 10" };

            var model = searchresults
                .Take(10)
                .Where(r => r.StartsWith(term))
                .Select(r => new {label = r});

            return Json(model, JsonRequestBehavior.AllowGet);
        }

        public ActionResult Index()
        {
            return null;

        }


    }
}
