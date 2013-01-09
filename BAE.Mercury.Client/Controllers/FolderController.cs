// ================================================================================
//          %name: FolderController.cs %
//          %version: 14 %
//          %date_created: Mon Nov 26 14:47:26 2012 %
//          %derived_by: LLawley %
//          Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// ================================================================================

using System.Collections.Generic;
using System.Web.Mvc;
using BAE.Mercury.Client.Models;
using BAE.Mercury.Core.Business;
using BAE.Mercury.Client;
using BAE.Mercury.Core.MmhsModel;


namespace BAE.Mercury.Client.Controllers
{
    public class FolderController : Controller
    {


        public ActionResult Index()

        {
            //user identity if needed
            string username = User.Identity.Name;
            username = "ken.ong";
            BAE.Mercury.Client.MessageStore messageStore = new MessageStore();
            //messageStore.GetMailBoxes(username);
            OskyMessageFolders oskyMessageFolder = messageStore.GetMessageFolders(username);
            return View("OskyMessageFolders", oskyMessageFolder);
        }
        public ActionResult MessageFolders()
        {
            //######################################################## for testing #################################
            List<vmFolder> folders = vmFolder.UserFolders();
            //#########################################################################################
            //
        //    var folders = vmFolder.FolderList(messageService.FoldersForUser ( messageService.RecipientById( 1 ).RecipientId ));

            return PartialView("_MessageFolders", folders);
        }


    }
}
