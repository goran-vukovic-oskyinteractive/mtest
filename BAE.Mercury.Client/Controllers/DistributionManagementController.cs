using System;
using System.Diagnostics;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using BAE.Mercury.Client.Models;
using System.Web.Script.Serialization;

namespace BAE.Mercury.Client.Controllers
{
    public class DistributionManagementController : Controller
    {
        [HttpPost]
        public void SetLock(string i, bool l)
        {
            string username = User.Identity.Name;
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            DMidParser parser = new DMidParser(i);
            messageStore.LockSet(User.Identity.Name, parser.SetId, l);
        }



        [HttpPost]
        public JsonResult SetSet(string i, bool a)
        {
            string username = User.Identity.Name;
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            DMidParser parser = new DMidParser(i);
            messageStore.SetSet(User.Identity.Name, parser.SetId, a);
            DistributionManagement distributionManagement = messageStore.GetDistributionManagement(username);
            string html = RenderPartialViewToString("~/Views/DistributionManagement/_DMSets.cshtml", distributionManagement);
            return Json(html);
        }
        [HttpPost]
        public void SetSave(string data)
        {
            Debug.WriteLine(data);
            RetChangeList changeList = (RetChangeList)Newtonsoft.Json.JsonConvert.DeserializeObject(data, typeof(RetChangeList));
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            messageStore.SaveSet(User.Identity.Name, changeList);
        }
        [HttpPost]
        public JsonResult SetAdd(string n)
        {
            string username = User.Identity.Name;
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            messageStore.AddSet(User.Identity.Name, n);
            DistributionManagement distributionManagement = messageStore.GetDistributionManagement(username);
            string html = RenderPartialViewToString("~/Views/DistributionManagement/_DMSets.cshtml", distributionManagement);
            return Json(html);
        }
        [HttpPost]
        public JsonResult SetDelete(string i)
        {
            string username = User.Identity.Name;
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            DMidParser parser = new DMidParser(i);
            messageStore.DeleteSet(User.Identity.Name, parser.SetId);
            DistributionManagement distributionManagement = messageStore.GetDistributionManagement(username);
            string html = RenderPartialViewToString("~/Views/DistributionManagement/_DMSets.cshtml", distributionManagement);
            return Json(html);

        }
        [HttpPost]
        public JsonResult SetEdit(string i, string n)
        {
            string username = User.Identity.Name;
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            DMidParser parser = new DMidParser(i);
            messageStore.UpdateSet(User.Identity.Name, parser.SetId, n);
            DistributionManagement distributionManagement = messageStore.GetDistributionManagement(username);
            string html = RenderPartialViewToString("~/Views/DistributionManagement/_DMSets.cshtml", distributionManagement);
            return Json(html);
        }
        [HttpPost]
        public JsonResult SetCopy(string i)
        {
            string username = User.Identity.Name;
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            DMidParser parser = new DMidParser(i);
            messageStore.CloneSet(User.Identity.Name, parser.SetId);
            DistributionManagement distributionManagement = messageStore.GetDistributionManagement(username);
            string html = RenderPartialViewToString("~/Views/DistributionManagement/_DMSets.cshtml", distributionManagement);
            return Json(html);

            
        }

        public ActionResult Index()
        {

            //string username = User.Identity.Name;
            //username = "ken.ong";
            //BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            //DistributionManagement distributionManagement = messageStore.GetDistributionManagement(username);
            //return View("Index", distributionManagement);
            return View("Index", null);
        }
        protected string RenderPartialViewToString(string viewName, object model)
        {
            if (string.IsNullOrEmpty(viewName))
                viewName = ControllerContext.RouteData.GetRequiredString("action");

            ViewData.Model = model;

            using (StringWriter sw = new StringWriter())
            {
                try
                {
                    //throw new Exception("my test");
                    ViewEngineResult viewResult = ViewEngines.Engines.FindPartialView(ControllerContext, viewName);
                    //View view = new ViewContext(
                    ViewContext viewContext = new ViewContext(ControllerContext, viewResult.View, ViewData, TempData, sw);
                    viewResult.View.Render(viewContext, sw);

                    return sw.GetStringBuilder().ToString();
                }
                catch(Exception ex)
                {
                    return ex.Message;
                }
            }
        }
        [HttpPost]
        public JsonResult SetsGet()
        {
            string username = User.Identity.Name;
            username = "ken.ong";
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            DistributionManagement distributionManagement = messageStore.GetDistributionManagement(username);
            string html = RenderPartialViewToString("~/Views/DistributionManagement/_DMSets.cshtml", distributionManagement);
            return Json(html);
        }

        [HttpPost]
        public JsonResult SetGet(string i)
        {
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            DMidParser parser = new DMidParser(i);
            DMset set = messageStore.GetDMSet(User.Identity.Name, parser.SetId, parser.UnitId);
            string html = RenderPartialViewToString("~/Views/DistributionManagement/_DMSet.cshtml", set);
            return Json(html);
        }
  
    }
}
