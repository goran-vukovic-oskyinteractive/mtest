using System;
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

    }
}
