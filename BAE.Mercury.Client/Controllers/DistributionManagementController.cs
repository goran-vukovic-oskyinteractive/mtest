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
        private JsonResult ErrorResponse(string response)
        {
            Response.StatusCode = 1001;
            Response.Write(response);
            return null;
        }
        [HttpPost]
        public void SetLock(string i, bool l)
        {
            string username = User.Identity.Name;
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            DMidParser parser = new DMidParser(i);
            DMset.EnLockType lockType = messageStore.LockType(username, parser.SetId);
            if (l & lockType == DMset.EnLockType.LockedByCurrent)
            {
                //trying to lock a set locked by himself
                ErrorResponse("The set is already locked by you");
            }
            else if (l & lockType == DMset.EnLockType.LockedByOthers)
            {
                //trying to lock a set locked by others
                ErrorResponse("The set is locked by somebody else");
            }
            else if (l & lockType == DMset.EnLockType.Unlocked)
            {
                //trying to lock an un-locked set, OK
                messageStore.LockSet(User.Identity.Name, parser.SetId, l);
            }

            else if (!l & lockType == DMset.EnLockType.LockedByCurrent)
            {
                //trying to unlock a set locked by himself, OK
                messageStore.LockSet(User.Identity.Name, parser.SetId, l);
            }
            else if (!l & lockType == DMset.EnLockType.LockedByOthers)
            {
                //trying to unlock a set locked by others, OK
                messageStore.LockSet(User.Identity.Name, parser.SetId, l);
            }
            else if (!l & lockType == DMset.EnLockType.Unlocked)
            {
                //trying to unlock an unlocked set
                ErrorResponse("The set is already unlocked.");
            }
            else
            {
                throw new ApplicationException("invalid lock state");
            }
        }


        [HttpPost]
        public JsonResult SetActivate(string i)
        {
            string username = User.Identity.Name;
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            DMidParser parser = new DMidParser(i);
            messageStore.SetActivate(User.Identity.Name, parser.SetId);
            DistributionManagement distributionManagement = messageStore.GetDistributionManagement(username);
            string html = RenderPartialViewToString("~/Views/DistributionManagement/_DMSets.cshtml", distributionManagement);
            return Json(html);
        }
        [HttpPost]
        public void SetSave(string data)
        {
            string username = User.Identity.Name;
            RetChangeList changeList = (RetChangeList)Newtonsoft.Json.JsonConvert.DeserializeObject(data, typeof(RetChangeList));
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            DMidParser parser = new DMidParser(changeList.Id);
            DMset.EnLockType lockType = messageStore.LockType(username, parser.SetId);
            switch (lockType)
            {
                case DMset.EnLockType.LockedByOthers:
                    ErrorResponse("The set is locked by sombody else and cannot be saved.");
                    break;
                case DMset.EnLockType.LockedByCurrent:
                    if (messageStore.IsSetChanged(parser.SetId, changeList.Ticks))
                        ErrorResponse("The set was changed in the mean time by somebody else and cannot be saved.");
                    else
                    {
                        //update the set
                        messageStore.SetSave(username, changeList);
                        messageStore.SetTimestamp(username, parser.SetId);
                        //messageStore.LockSet(username, parser.SetId, false);
                    }
                    break;
                default://if (lockType == DMset.LockType.Unlocked)
                    //a bug
                    throw new ApplicationException("invalid state for saving a set");
            }
        }
        [HttpPost]
        public JsonResult SetAdd(string n)
        {
            string username = User.Identity.Name;
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();

            int add = //messageStore.UpdateSet(User.Identity.Name, parser.SetId, n);
                    messageStore.AddSet(User.Identity.Name, n);
            if (add == 0)
            {
                DistributionManagement distributionManagement = messageStore.GetDistributionManagement(username);
                string html = RenderPartialViewToString("~/Views/DistributionManagement/_DMSets.cshtml", distributionManagement);
                return Json(html);
            }
            else
            {
                if (add == 1)
                {
                    ErrorResponse("There is already a set with that name.");
                    return null; // Json(String.Empty);
                }
                else
                    throw new ApplicationException("unknown result saving a set name");

            }


            //messageStore.AddSet(User.Identity.Name, n);
            //DistributionManagement distributionManagement = messageStore.GetDistributionManagement(username);
            //string html = RenderPartialViewToString("~/Views/DistributionManagement/_DMSets.cshtml", distributionManagement);
            //return Json(html);
        }
        [HttpPost]
        public JsonResult SetEdit(string i, string n)
        {
            string username = User.Identity.Name;
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            DMidParser parser = new DMidParser(i);
            DMset.EnLockType lockType = messageStore.LockType(username, parser.SetId);
            switch (lockType)
            {
                case DMset.EnLockType.LockedByOthers:
                    return ErrorResponse("The set is locked by sombody else and cannot be changed.");
                case DMset.EnLockType.LockedByCurrent:
                    return ErrorResponse("The set is locked by you and cannot be changed.");
                case DMset.EnLockType.Unlocked:
                    int update = messageStore.UpdateSet(User.Identity.Name, parser.SetId, n);
                    if (update == 0)
                    {
                        DistributionManagement distributionManagement = messageStore.GetDistributionManagement(username);
                        string html = RenderPartialViewToString("~/Views/DistributionManagement/_DMSets.cshtml", distributionManagement);
                        return Json(html);
                    }
                    else
                    {
                        if (update == 1)
                        {
                            ErrorResponse("There is already a set with that name.");
                            return null; // Json(String.Empty);
                        }
                        else
                            throw new ApplicationException("unknown result saving a set name");

                    }
                default:
                    //a bug
                    throw new ApplicationException("invalid state for editing a set");
            }
        }
        [HttpPost]
        public JsonResult SetDelete(string i)
        {
            string username = User.Identity.Name;
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            DMidParser parser = new DMidParser(i);
            DMset.EnLockType lockType = messageStore.LockType(username, parser.SetId);
            switch (lockType)
            {
                case DMset.EnLockType.LockedByOthers:
                    return ErrorResponse("The set is locked by sombody else and cannot be deleted.");
                case DMset.EnLockType.LockedByCurrent:
                    return ErrorResponse("The set is locked by you and cannot be deleted.");
                case DMset.EnLockType.Unlocked:
                    messageStore.DeleteSet(User.Identity.Name, parser.SetId);
                    DistributionManagement distributionManagement = messageStore.GetDistributionManagement(username);
                    string html = RenderPartialViewToString("~/Views/DistributionManagement/_DMSets.cshtml", distributionManagement);
                    return Json(html);
                default:
                    //a bug
                    throw new ApplicationException("invalid state for deleting a set");
            }

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
            private DMset.EnLockType lockType;
            private long ticks;
            private bool isUnit;
            private List<UnitAppointments> listUnitAppointments;
            public SetAndLists(string id, DMset.EnLockType lockType, long ticks, bool isUnit, string setHtml, string unitListHtml, List<UnitAppointments> listUnitAppointments) //, string appointmentListHtml)
            {
                this.id = id;
                this.lockType = lockType;
                this.ticks = ticks;
                this.isUnit = isUnit;
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
            public DMset.EnLockType LockType
            {
                get
                {
                    return lockType;
                }

            }
            public long Ticks
            {
                get
                {
                    return ticks;
                }
            }
            public bool IsUnit
            {
                get
                {
                    return isUnit;
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
            DMset.EnLockType lockType = messageStore.LockType(userName, parser.SetId);
            if (lockType == DMset.EnLockType.LockedByCurrent)
                messageStore.LockSet(userName, parser.SetId, false);
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
            SetAndLists setAndList = new SetAndLists(i, set.LockType, set.Ticks, parser.UnitId != -1, setHtml, unitListHtml, listUnitAppointments);
            return Json(setAndList);
        }

  
    }
}
