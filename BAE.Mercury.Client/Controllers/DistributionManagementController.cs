using System;
using System.IO;
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
        protected string RenderPartialViewToString(string viewName, object model)
        {
            if (string.IsNullOrEmpty(viewName))
                viewName = ControllerContext.RouteData.GetRequiredString("action");

            ViewData.Model = model;

            using (StringWriter sw = new StringWriter())
            {
                ViewEngineResult viewResult = ViewEngines.Engines.FindPartialView(ControllerContext, viewName);
                //View view = new ViewContext(
                ViewContext viewContext = new ViewContext(ControllerContext, viewResult.View, ViewData, TempData, sw);
                viewResult.View.Render(viewContext, sw);

                return sw.GetStringBuilder().ToString();
            }
        }
        [HttpPost]
        public JsonResult GetSet(string i)
        {
            string username = User.Identity.Name;
            //parse the id
            string[] idString = i.Split('_');
            int id = Int32.Parse(idString[1]);
            int unitId = idString.Length == 3 ? Int32.Parse(idString[2]) : -1;
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            DMset set = messageStore.GetDMSet(username, id, unitId);
            string html = RenderPartialViewToString("/Views/DistributionManagement/_DMSet.cshtml", set);
            //string html = RenderPartialViewToString("/Views/DistributionManagement/_DMReference.cshtml", set);
            return Json(html);
        }
  
    }
}
