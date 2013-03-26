using System;
using System.Text;
using System.Diagnostics;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using BAE.Mercury.Client.Models;
using System.Web.Script.Serialization;
using Newtonsoft.Json;

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
        private class UnitAppointments
        {
            private string unitId, appointmentListHtml;
            public UnitAppointments(DMunit unit)
            {
                unitId = String.Format("un_{0}_{1}", unit.Parent.Id, unit.Id);
                StringBuilder sb = new StringBuilder(ListOption("Please select", String.Empty));
                foreach (DMappointment appointment in unit.Children)
                {
                    string appointmentId = String.Format("dw_{0}_{1}_{2}", unit.Parent.Id, unit.Id, appointment.Id);
                    //sb.Append(String.Format("<option value='{0}'>{1}</option>", appointmentId, appointment.Name));
                    sb.Append(ListOption(appointment.Name, appointmentId));
                }
                appointmentListHtml = sb.ToString();
            }
            public string UnitId
            {
                get
                {
                    return unitId;
                }
            }
            public string AppointmentListHtml
            {
                get
                {
                    return appointmentListHtml;
                }
            }

        }
        private class SetAndLists
        {
            private string id, setHtml, unitListHtml;
            private bool locked;
            private List<UnitAppointments> listUnitAppointments;
            public SetAndLists(string id, bool locked, string setHtml, string unitListHtml, List<UnitAppointments> listUnitAppointments) //, string appointmentListHtml)
            {
                this.id = id;
                this.locked = locked;
                this.setHtml = setHtml;
                this.unitListHtml = unitListHtml;
                this.listUnitAppointments = listUnitAppointments;
            }
            public string Id
            {
                get
                {
                    return id;
                }
            }
            public bool Locked
            {
                get
                {
                    return locked;
                }

            }
            public string SetHtml
            {
                get
                {
                    return setHtml;
                }
            }
            public string UnitListHtml
            {
                get
                {
                    return unitListHtml;
                }
            }
            public List<UnitAppointments> ListUnitAppointments
            {
                get
                {
                    return listUnitAppointments;
                }
            }
        }
        private static string ListOption(string option, string value)
        {
            return String.Format("<option value='{1}'>{0}</option>", option, value);
        }
        [HttpPost]
        public JsonResult SetGet(string i)
        {
            string userName = User.Identity.Name;
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            DMidParser parser = new DMidParser(i);
            DMset set = messageStore.GetDMSet(userName, parser.SetId, parser.UnitId);
            string setHtml = RenderPartialViewToString("~/Views/DistributionManagement/_DMSet.cshtml", set);
            StringBuilder sb = new StringBuilder(ListOption("Please select", String.Empty));
            List<UnitAppointments> listUnitAppointments = new List<UnitAppointments>();
            foreach (DMunit unit in set.Children)
            {
                string unitId = String.Format("un_{0}_{1}", set.Id, unit.Id);
                UnitAppointments unitAppointments = new UnitAppointments(unit);
                listUnitAppointments.Add(unitAppointments);
                sb.Append(ListOption(unit.Name, unitId));
            }
            string unitListHtml = sb.ToString();
            //string unitListHtml = RenderPartialViewToString("~/Views/DistributionManagement/_DMunitList.cshtml", set);
            //string appointmentListHtml = RenderPartialViewToString("~/Views/DistributionManagement/_DMappointmentList.cshtml", set);
            SetAndLists setAndList = new SetAndLists(i, set.Locked, setHtml, unitListHtml, listUnitAppointments);
            return Json(setAndList);
        }

  
    }
}
