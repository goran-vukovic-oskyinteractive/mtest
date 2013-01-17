// ================================================================================
//          %name: MessageController.cs %
//       %version: 27 %
//  %date_created: Mon Dec 10 14:18:19 2012 %
//    %derived_by: DSaustin %
//      Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// ================================================================================

using System;
using System.Globalization;
using System.IO;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using BAE.Mercury.Client.Models;
using BAE.Mercury.Client.Client.SpellCheck;
using BAE.Mercury.Client.Properties;
using BAE.Mercury.Core;
using BAE.Mercury.Core.MmhsModel;
using BAE.Mercury.Core.Business;
using System.Transactions;

using BAE.Mercury.Client.Infrastructure.Logging;


namespace BAE.Mercury.Client.Controllers
{


    public class MessageController : Controller
    {
        private static DateTime DatetimeMinTime = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);

        private readonly ISpellCheckManager spellCheckManager;
        private readonly IMessageService messageService;
        private readonly ISpellCheckItemParser spellCheckItemParser;
        const int RECORDS_PER_PAGE = 5;
        // int totalPages;
        private readonly ILogger _logger;

        private long ToJavaScriptMilliseconds(DateTime dt)
        {
            return (long)((dt.ToUniversalTime().Ticks - DatetimeMinTime.Ticks) / 10000);
        }
        private DateTime FromJavaScriptMilliseconds(long miliseconds)
        {
            return DatetimeMinTime.AddMilliseconds(miliseconds);
        }

        //public MessageController()
        //{

        // //   _logger = logger;
        //    int a = 5;

        //}
        public MessageController(ILogger logger)
        {
            this.spellCheckManager = new SpellCheckerManager();
            this.messageService = new MessageService();
            this.spellCheckItemParser = new SpellCheckItemParser();
            _logger = logger;
        }
        /// <summary>
        /// DI Constructor
        /// </summary>
        /// <param name="spellCheckManager"></param>
        /// <param name="messageService"></param>
        /// <param name="spellCheckItemParser"></param>
        public MessageController(ISpellCheckManager spellCheckManager, IMessageService messageService, ISpellCheckItemParser spellCheckItemParser)
        {
            this.spellCheckManager = spellCheckManager;
            this.messageService = messageService;
            this.spellCheckItemParser = spellCheckItemParser;
        }



        /// <summary>
        /// Default ActionResult of MessageController. If page load, it returns the index view to build the MWC main page
        /// If Ajax call, it loads partial view of a set of messages to be appended to the list
        /// </summary>
        /// <param name="pageId">page of records to be added to folder's list view</param>
        /// <param name="listId">folder to be loaded from folder tree</param>
        /// <param name="reverse"> </param>
        /// <param name="groupIndex"> </param>
        /// <param name="count"> </param>
        /// <param name="group"> </param>
        /// <returns>ActionResult View </returns>
        public ActionResult Index(int? pageId, int? listId, int reverse = 0, int groupIndex = 0, int count = 0, string @group = "")
        {
            throw new ApplicationException("this contoller index should not be used");
            if (pageId.HasValue) { pageId = pageId.Value + 1; }  //TODO: Check that it's possible to have a null pageId parameter. If not, then we can use a notmal int.                                     
            else pageId = 1;


            bool isReverse = (reverse == 1);

            vmMessageList messageListViewModel = null;

            return View("OskyMessageFolder"); //we redirect Index to MessageList

            if (Request != null && Request.IsAjaxRequest())
            {
                //ViewBag.GroupBy = "Received"; //this must be replaced by passed in variable when sorting is added (not currently used)

                try
                {
                    using (TransactionScope tx = new TransactionScope(TransactionScopeOption.RequiresNew))
                    {
                        Paged<Message> pagedMessages = this.messageService.GetMessagesByFolderPaged(listId.Value, null, pageId.Value, RECORDS_PER_PAGE, string.Empty);
                        messageListViewModel = new vmMessageList(pagedMessages);

                        // Adam. Prefer these are set inside the viewmodel as it's populated, but need to revert logic a bit to see what's wrong
                        messageListViewModel.InitGroupHeader = string.Empty;
                        if (messageListViewModel.MessageItems.Any())
                        {
                            messageListViewModel.InitGroupHeader = messageListViewModel.MessageItems.First().Group;
                        }
                        if (pageId == 1)
                        {
                            ViewBag.FirstPage = true;
                        }
                        if (isReverse)
                        {
                            messageListViewModel.VertAlign = "bottom";
                        }
                        else
                        {
                            messageListViewModel.VertAlign = "top";
                        }

                        messageListViewModel.AddGroupHeader = false;
                        if (groupIndex > 0 && count == 0) //first page of a new group 
                        {
                            messageListViewModel.AddGroupHeader = true;
                        }
                        //tx.Complete();               
                    }
                }
                catch (Exception ex)
                {
                    messageListViewModel = new vmMessageList(null);
                    //TODO: Logger.Log(ex);
                }

                return PartialView("_MessageList", messageListViewModel);
            }
            else
            {
                try
                {
                    using (TransactionScope tx = new TransactionScope(TransactionScopeOption.RequiresNew))
                    {
                        Paged<Message> pagedMessages = this.messageService.GetMessagesByFolderPaged(1, null, pageId.Value, RECORDS_PER_PAGE, string.Empty);
                        messageListViewModel = new vmMessageList(pagedMessages);

                        //tx.Complete();               
                    }
                }
                catch (Exception ex)
                {
                    messageListViewModel = new vmMessageList(null);
                    //TODO: Logger.Log(ex);
                }


                //load main MWC page structure
                return View("Index", messageListViewModel);
            }


        }

        /// <summary>
        /// Load partial view of initial records for list from folder tree click 
        /// or from End or Home key press to reload list
        /// </summary>
        /// <param name="listId">Int id of list to be loaded from folder tree</param>
        /// <param name="reverse">Int 0 or 1 to reverse intial page load to end of list</param>
        /// <returns>ActionResult Partial View </returns>
        public ActionResult LoadListFromFolder(int listId, int reverse = 0)
        {
            bool isReverse = (reverse == 1);
            Paged<Message> pagedMessages = null;
            vmMessageList messageListViewModel = null;

            using (TransactionScope tx = new TransactionScope(TransactionScopeOption.RequiresNew))
            {

                if (isReverse)
                {
                    // Load the last page of messages                
                    pagedMessages = GetMessagesByFolderLastPage(listId);
                    messageListViewModel = new vmMessageList(pagedMessages);

                    // Adam. Prefer these are set inside the viewmodel as it's populated, but need to revert logic a bit to see what's wrong
                    if (messageListViewModel.MessageItems.Any())
                    {
                        messageListViewModel.InitGroupHeader = messageListViewModel.MessageItems.First().Group;
                    }

                    messageListViewModel.VertAlign = "bottom";
                }
                else
                {
                    // Load the first page of messages                    
                    pagedMessages = this.messageService.GetMessagesByFolderPaged(listId, null, 1, RECORDS_PER_PAGE, string.Empty);

                    // Adam. Prefer these are set inside the viewmodel as it's populated, but need to revert logic a bit to see what's wrong
                    messageListViewModel = new vmMessageList(pagedMessages);
                    messageListViewModel.InitGroupHeader = string.Empty;
                    messageListViewModel.VertAlign = "top";
                }

                //tx.Complete();
            }

            return PartialView("_ReloadMessageList", messageListViewModel);
        }



        /// <summary>
        /// Returns partial view of message details for a given messageID
        /// </summary>
        /// <param name="messageId">Int recordID of record to retrieve</param>
        /// <returns>ActionResult Partial View </returns>
        public ActionResult Details(int id)
        {
            if (id == 0)
            {
                return null;
            }

            vmMessageDetails messageDetailsViewModel = null;
            try
            {
                using (TransactionScope tx = new TransactionScope(TransactionScopeOption.RequiresNew))
                {
                    //var message = messageService.GetMessageById(id);
                    //messageDetailsViewModel = new vmMessageDetails(message);

                    //                    if (message == null)
                    {
                        //messageDetailsViewModel.ErrorMessage = ErrorMessages.MessageDetailsUnableToLoadMessageDetails;
                        //TODO: Logger.Log(string.Format("No message found for id {0}", id));
                    }

                    //tx.Complete();
                }
            }
            catch (Exception ex)
            {
                messageDetailsViewModel = new vmMessageDetails(null);
                //messageDetailsViewModel.ErrorMessage = ErrorMessages.MessageDetailsUnableToLoadMessageDetails;
                //TODO: Logger.Log(ex);
            }

            return PartialView("_MessageDetails", messageDetailsViewModel);
        }

        public ActionResult DateTimePicker(string id)
        {
            return PartialView("_DateTimePicker", id);
        }

        ///<summary>
        /// Get pages of records for infinite list loading
        ///</summary>
        ///<param name="page">page of records to be added to list</param>
        ///<param name="listId">Int id of list to be loaded from folder tree</param>
        ///<param name="firstload">boolean Is first load of list</param>
        ///<param name="reverse">bool reverse to control size of page to be loaded</param>
        ///<returns></returns>
        //private Paged<Message> GetMessagesByFolderPaged(int page = 1, int folderId = 1, bool firstload = false)
        //{
        //    Paged<Message> pagedMessages = null;

        //    pagedMessages = this.messageService.GetMessagesByFolderPaged(1, null, page, RECORDS_PER_PAGE, string.Empty);

        //    return pagedMessages;
        //}

        /// <summary>
        /// Returns the last available page of messages.
        /// </summary>
        /// <param name="listId">Identifies the folders to which messages belong. Not currently being used.</param>
        /// <param name="pageSize"></param>
        /// <returns></returns>
        private Paged<Message> GetMessagesByFolderLastPage(int folderId)
        {
            //need to load last two pages to ensure that scrolling works correctly (there may only be one record on last page)
            var pageSize = 2 * RECORDS_PER_PAGE;
            Paged<Message> pagedMessages = this.messageService.GetMessagesByFolderLastPage(1, null, pageSize, string.Empty);

            //pagedMessages.PageSize = RECORDS_PER_PAGE;

            //return pagedMessages;
            return null;
        }

        /// <summary>
        /// Action for first load of new message page, returns page for blank message
        /// </summary>
        /// <returns></returns>
        public ActionResult Create()
        {
            return View(new vmNewMessage());
        }
        /// <summary>
        /// Action for postback of created new message for validation and send/save
        /// </summary>
        /// <param name="newMessage">vmNewMessage object with new data added</param>
        /// <returns></returns>
        [HttpPost]
        public ActionResult Create(vmNewMessage newMessage)
        {
            if (ModelState.IsValid) //determine if message is valid at server (client checking already done)
            {
                //This is the development and test action---to be replaced by logic to save of send message
                return View(newMessage);
            }
            else
            {
                return View(newMessage); //re-present page with error messages from validation attributes
            }
        }

        /// <summary>
        /// Checks the spelling of those words given in a specific Json format or provides suggestions
        /// for a single word given, again, in a specific Json format.
        /// </summary>
        /// <returns>Json containing the words that were deemed misspelled, 
        /// or spelling suggestions</returns>
        [HttpPost]
        public JsonResult CheckSpelling()
        {

            //SpellCheckResultsJson result = null;

            //try
            //{
            //    // Parsing the Request ourselves because the default MVC Model Binder cannot 
            //    // correctly resolve the params field of the spellchecker Json object in the Request.

            //    SpellCheckItem spellCheckItem = spellCheckItemParser.ParseSpellCheckItemFromHttpRequest(Request);

            //    result = spellCheckManager.HandleCheck(spellCheckItem);

            //}
            //catch (Exception ex)
            //{
            //    result = new SpellCheckResultsJson
            //    {
            //        error = new SpellCheckResultsJson.SpellCheckResultsJsonError(ErrorMessages.CheckSpellingFailure)
            //    };

            //    //TODO: Logger.Log(ex)
            //}

            //return Json(result);
            return null;

        }
        private class JsonNetResult : JsonResult
        {
            public JsonNetResult()
            {
                this.ContentType = "application/json";
            }

            public JsonNetResult(JsonResult existing)
            {
                this.ContentEncoding = existing.ContentEncoding;
                this.ContentType = !string.IsNullOrWhiteSpace(existing.ContentType) ? existing.ContentType : "application/json";
                this.Data = existing.Data;
                this.JsonRequestBehavior = existing.JsonRequestBehavior;
            }

            public override void ExecuteResult(ControllerContext context)
            {
                if (context == null)
                {
                    throw new ArgumentNullException("context");
                }
                if ((this.JsonRequestBehavior == JsonRequestBehavior.DenyGet) && string.Equals(context.HttpContext.Request.HttpMethod, "GET", StringComparison.OrdinalIgnoreCase))
                {
                    base.ExecuteResult(context);                            // Delegate back to allow the default exception to be thrown
                }

                System.Web.HttpResponseBase response = context.HttpContext.Response;
                response.ContentType = this.ContentType;

                if (this.ContentEncoding != null)
                {
                    response.ContentEncoding = this.ContentEncoding;
                }

                if (this.Data != null)
                {
                    // Replace with your favourite serializer.  
                    new Newtonsoft.Json.JsonSerializer().Serialize(response.Output, this.Data);
                }
            }
        }

    }
 
}

