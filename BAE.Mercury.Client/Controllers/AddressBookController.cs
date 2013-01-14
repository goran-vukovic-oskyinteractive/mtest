using System;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;
using BAE.Mercury.Client.Models;

namespace BAE.Mercury.Client.Controllers
{
    public class AddressBookController : Controller
    {
        //
        // GET: /AddressBookManagement/

        public ActionResult Index()
        {
            string username = User.Identity.Name;
            username = "ken.ong";
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            //messageStore.GetMailBoxes(username);
            OskyAddressBooks oskyAddressBooks = messageStore.GetAddressBooks(username);

            return View("OskyAddressBook", oskyAddressBooks);
        }
        protected string RenderPartialViewToString()
        {
            return RenderPartialViewToString(null, null);
        }

        protected string RenderPartialViewToString(string viewName)
        {
            return RenderPartialViewToString(viewName, null);
        }

        protected string RenderPartialViewToString(object model)
        {
            return RenderPartialViewToString(null, model);
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
        public JsonResult SessionData(int sid, string sort_by_dtg, string sort)
        {
            string username = User.Identity.Name;
            username = "ken.ong";
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            OskyAddressBookAppointments oskyAddressBookAppointments = messageStore.GetAddressBookAppointments(username, sid);
            string html = RenderPartialViewToString("/Views/AddressBook/_AppointmentList.cshtml", oskyAddressBookAppointments);
            //int lastId = (messages.Count > 0) ? messages[messages.Count - 1].Id : i;
            //string lastTime = (messages.Count > 0) ? messages[messages.Count - 1].ReceivedTime.ToString("yyyy-MMM-dd HH:mm:ss") : tl;

            AppointmentResult appointmentResult = new AppointmentResult(html);

            //pack the result into Json
//            OskyMessageListResult oskyMessageListResult = new OskyMessageListResult(html, lastId, lastTime);

            return Json(appointmentResult);
        }

    }
}
