﻿// ================================================================================
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
            if (pageId.HasValue) { pageId = pageId.Value + 1; }  //TODO: Check that it's possible to have a null pageId parameter. If not, then we can use a notmal int.                                     
            else pageId = 1;


            bool isReverse = (reverse == 1);

            vmMessageList messageListViewModel = null;

            return View("OskyMessageList"); //we redirect Index to MessageList

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
        private class OskyMessageListResult
        {
            string html;
            int lastId;
            string lastTime;
            public OskyMessageListResult(string html, int lastId, string lastTime)
            {
                // TODO: Complete member initialization
                this.html = html;
                this.lastId = lastId;
                this.lastTime = lastTime;
            }

            public string Html
            {
                get
                {
                    return html;
                }
            }
            public int LastId
            {
                get
                {
                    return lastId;
                }
            }
            public string LastTime
            {
                get
                {
                    return lastTime;
                }
            }
        }
        [HttpPost]
        public JsonResult MessageFolder(string fid, int i, int c,  string tl, string tc, int o)
        {
            _logger.Info("Message controller fired");

            //int accountNo = -1;
            ////if id is generic
            //switch (fid)
            //{
            //    case "inbox":

            //}
            //user identity if needed
            string username = User.Identity.Name;

            //process the recived parameters
            if (i < 0)
                i = Int32.MaxValue;
            DateTime last = (tl.Length > 0) ? DateTime.Parse(tl) : DateTime.MaxValue; //tl initially ""
            DateTime current = DateTime.Parse(tc);

            //get the message list
            MessageStore messageStore = new MessageStore();
            int f = 0;
            List<Message> messages =  messageStore.GetMessages(username, fid, i, c, o);
            OskyMessageList oskyMessageList = new OskyMessageList(messages, last, current);
            string html = RenderPartialViewToString("/Views/Message/_OskyMessageList.cshtml", oskyMessageList);
            int lastId = (messages.Count > 0) ? messages[messages.Count - 1].Id : i;
            string lastTime = (messages.Count > 0) ? messages[messages.Count - 1].ReceivedTime.ToString("yyyy-MMM-dd HH:mm:ss") : tl ;

                       

            //pack the result into Json
            OskyMessageListResult oskyMessageListResult = new OskyMessageListResult(html, lastId, lastTime);
            return Json(oskyMessageListResult);
        }
        //[HttpPost]
        //public ActionResult MessageList2(int s, int c, int f)
        //{
        //    //user identity
        //    String Username = User.Identity.Name;
        //    string test = RenderPartialViewToString("~/Views/Message/_test.cshtml");
        //    return Content(test, "application/json");
        //    //Note: MS provide JsonResult but do unwanted things such as escaping quotes or producing JSON format that is unsuitable...we do not need that
        //    MessageStore messageStore = new MessageStore();
        //    //messageStore.GetMessages();
        //    string json = "[";
        //    DateTime Jan1970 = new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
        //    foreach (Message message in messageStore.GetMessages(s, c))
        //    {
        //        if (json.EndsWith("}"))
        //            json += ",";
        //        json += "{";
        //        json += AddJsonMessageProperty("title", message.Subject);
        //        json += "," + AddJsonMessageProperty("content", message.Content);
        //        json += "," + AddJsonMessageProperty("from", message.OriginatingAddressee.Name);
        //        long ticks = ToJavaScriptMilliseconds(DateTime.Now);
        //        TimeSpan javaSpan = //message.ReceivedTime
        //            DateTime.Now - Jan1970;
        //        long newticks =  (long) javaSpan.TotalMilliseconds;
        //        json += "," + AddJsonMessageProperty("received", ticks); //1356790971);
        //        json += "," + AddJsonMessageProperty("dtg", "679107D DEC 2012");
        //        //ToDo: attachments
        //        json += "," + AddJsonMessageProperty("private", 0);
        //        json += "," + AddJsonMessageProperty("read", 0);
        //        json += "," + AddJsonMessageProperty("action", "action");
        //        json += "," + AddJsonMessageProperty("precedence", "flash");

        //        json += "}";
        //    }
        //    json += "]";

        //    return Content(json, "application/json");
        //}
        //[HttpPost]
        //public JsonResult MessageList1()
        //{
        //    //StreamReader sr = new StreamReader(@"D:\VS2010Projects\WebSites\BAE.Mercury\BAE.Mercury.Client\test\data.json");
        //    StreamReader sr = new StreamReader(@"D:\VS2010Projects\WebSites\BAE.Mercury\BAE.Mercury.Client\test\data1.json");

        //    //D:\trash\jsoncheck
        //    string jsonOriginal = sr.ReadToEnd();
        //    sr.Close();
        //    JsonResult jsonResult = new JsonResult();
        //    jsonResult.Data = jsonOriginal;
        //    Response.Write("aaaaa");
        //    return jsonResult; // Json(jsonOriginal);//, "application/json", System.Text.Encoding.UTF8); // Json(messageStore.GetMessages());

        //    //we could use native MS Json functions but we want complete control and processing on the server
        //    //    JsonResult jsonResult = new JsonResult();
        //    //    string json = "[";
        //    //    MessageStore messageStore = new MessageStore();
        //    //    //messageStore.GetMessages();
        //    //    foreach (Message message in messageStore.GetMessages())
        //    //    {
        //    //        if (json.EndsWith("}"))
        //    //            json += ",";
        //    //        json += "{";
        //    //        //private string _ActionAddressees;
        //    ////private string[] _Attachments;
        //    ////private string _ClassificationName;
        //    ////private string _content;
        //    ////private DateTime _ExpiryTime;
        //    ////private int _Id;
        //    ////private OriginatingAddresseeClass _OriginatingAddressee;
        //    ////private DateTime _ReceivedTime;
        //    ////private string _Subject;       
        //    ////private PrecedenceClass _Precedence;
        //    //        //string format = "{'ActionAddressees' : '{0}' }";
        //    //        json += AddJsonMessageProperty("title", message.Subject);
        //    //        json += "," + AddJsonMessageProperty("content", message.Content);
        //    //        json += "," + AddJsonMessageProperty("from", message.OriginatingAddressee.Name);
        //    //        json += "," + AddJsonMessageProperty("received", message.ReceivedTime.Ticks);
        //    //        json += "," + AddJsonMessageProperty("dtg", "679107D DEC 2012");
        //    //        //ToDo: attachments
        //    //        json += "," + AddJsonMessageProperty("private", 0);
        //    //        json += "," + AddJsonMessageProperty("read", 0);
        //    //        json += "," + AddJsonMessageProperty("action", "action");
        //    //        json += "," + AddJsonMessageProperty("precedence", "flash");

        //    //        json += "}";





        //    //        //json += String.Format("{{\"title\" : \"{0}\"}}", EscapeJson(message.Content));
        //    //        //json += String.Format("{\"content\" : \"{0}\"}", EscapeJson(message.Content));
        //    //        //json += String.Format("{\"from\" : \"{0}\"}", EscapeJson(message.OriginatingAddressee.Name));
        //    //        //json += String.Format("{\"received\" : \"{0}\"}", message.ReceivedTime.Ticks);
        //    //        //json += String.Format("{\"dtg\" : \"{0}\"}", "679107D DEC 2012");
        //    //        ////ToDo: attachments
        //    //        ////private
        //    //        //json += String.Format("{\"private\" : \"{0}\"}", 0);
        //    //        //json += String.Format("{\"read\" : \"{0}\"}", 0);
        //    //        //json += String.Format("{\"action\" : \"{0}\"}", "action");
        //    //        //json += String.Format("{\"precedence\" : \"{0}\"}", "flash");
        //    //        ////json += String.Format("{\"ActionAddressees\" : \"{0}\"}", EscapeJson(message.ActionAddressees));
        //    //        ////json += String.Format("{\"Classification\" : \"{0}\"}", EscapeJson(message.ClassificationName));
        //    //        ////json += String.Format("{\"ExpiryTime\" : \"{0}\"}", message.ExpiryTime.Ticks);

        //    //    }
        //    //    json += "]";

        //    //    jsonResult.Data = json;
        //    //    StreamWriter sw = new StreamWriter(@"D:\trash\jsoncheck.txt");
        //    //    sw.Write(json);
        //    //    sw.Close();
        //    //    return jsonResult; // Json(messageStore.GetMessages());

        //}

        //private string AddJsonMessageProperty(string name, object value)
        //{
        //    Type type = value.GetType();
        //    if (type == typeof(string))
        //        return String.Format("\"{0}\" : \"{1}\"", name, ((string)value).Replace("\"", "\\\"").Replace(@"\", "\\"));
        //    else if (type == typeof(int) || type == typeof(long))
        //        return String.Format("\"{0}\" : {1}", name, value);
        //    else
        //        throw new ApplicationException("undefined type for JSON conversion");
        //}

        //private string EscapeJson(string s)
        //{
        //    return s.Replace("\"", "\\\"");
        //}
    }
}

