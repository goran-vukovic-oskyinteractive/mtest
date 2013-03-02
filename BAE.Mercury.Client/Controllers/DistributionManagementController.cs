using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using BAE.Mercury.Client.Models;

namespace BAE.Mercury.Client.Controllers
{
    public class DistributionManagementController : Controller
    {
        //
        // GET: /DistributionManagement/

        public ActionResult Index()
        {
            string username = User.Identity.Name;
            username = "ken.ong";
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            DistributionManagement distributionManagement = messageStore.GetDistributionManagement(username);
            return View("Index", distributionManagement);
        }
        [HttpPost]
        public JsonResult ZZZ()
        {
            return Json(String.Empty);
        }
  
    }
}
