// =================================================
//          %name: vmMessageList.cs %
//       %version: 3 %
//      Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// =================================================   
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BAE.Mercury.Client.Properties;
using BAE.Mercury.Core;
using BAE.Mercury.Core.MmhsModel;

namespace BAE.Mercury.Client.Models
{
    public class vmMessageList
    {
        public List<vmMessageListItem> MessageItems { get; set; }
        public int ListCount { get; set; }
        public int PageCount { get; set; }
        public int RecordsPerPage { get; set; }
        
        private List<string> _groupNames = new List<string>();
        public List<string> GroupNames { get { return _groupNames; } set { _groupNames = value; } }

        // Page Layout Properties
        public string InitGroupHeader { get; set; }
        public bool AddGroupHeader { get; set; }
        public string VertAlign { get; set; }
        public bool IsFirstPage { get; set; }

        public string NoRecordsMessage { get; set; }

        //TODO: Empty constructor. remove.
        public vmMessageList()
        {
            return;
        }

        /// <summary>
        /// Constructor does Domain to View Model conversion of Message results
        /// </summary>
        /// <param name="pagedDomainMessages"></param>
        public vmMessageList(Paged<Message> pagedDomainMessages) : this(pagedDomainMessages, false, string.Empty, 0, 0)
        {
            return;
        }

        public vmMessageList(Paged<Message> pagedDomainMessages, bool isReverseScroll, string currentGroupName, int groupIndex, int count)
        {
            List<vmMessageListItem> messageItems = new List<vmMessageListItem>();
            MessageItems = messageItems;

            if (pagedDomainMessages == null)
            {
                //NoRecordsMessage = ErrorMessages.MessageListUnableToLoadMessages;
                return;
            }

            if (pagedDomainMessages.RowCount == 0)
            {
                //NoRecordsMessage = ErrorMessages.MessageListNoMessagesFound;                
                return;
            }



            foreach (Message domainMessage in pagedDomainMessages.Result)
            {
                messageItems.Add(new vmMessageListItem
                                        {                                      
                                            Id = domainMessage.Id,
                                            MessageId = domainMessage.Id,
                                            Subject = domainMessage.Subject,
                                            Sender = "Sender1",  //TODO: use the field domainMessage.OriginatingAddressee.Name,                                            
                                            ReceivedTime = domainMessage.ReceivedTime,
                                            SentTime = domainMessage.ReceivedTime
                                        });
            }

            ApplyGroupsToItems(messageItems);
            SetListCounts(pagedDomainMessages);
            SetAvailableGroupNames(messageItems);
            //SetPageLayoutFields(messageItems, pagedDomainMessages, isReverseScroll, groupIndex, count);
            MessageItems = messageItems;            
        }

        private void ApplyGroupsToItems(IEnumerable<vmMessageListItem> messageItems)
        {
            DateTime now = DateTime.Now;

            foreach (var domainMessage in messageItems)
            {
                string group = "Today";

                if (domainMessage.ReceivedTime.AddDays(1) < now)//TODO: This isn't right.
                {                    
                    group = "Yesterday";
                }
                else if (domainMessage.ReceivedTime.AddDays(2) < now)
                {
                    group = "Tuesday"; //TODO: This isn't right. Need to set it to whatever the day was two days ago..
                    //TODO: This logic should be if receivedTime less than yesterday and also not as far back as snday of last week, 
                    // then specify the day...
                }
                else if (domainMessage.ReceivedTime.AddDays(3) < now)
                {
                    group = "Monday"; //TODO: This isn't right. Need to set it to whatever the day was three days ago..
                }
                else if (domainMessage.ReceivedTime.AddDays(4) < now)
                {
                    group = "Last Week";
                }
                else if (domainMessage.ReceivedTime.AddDays(4) < now)
                {
                    group = "Two Weeks Ago";
                }
                domainMessage.Group = group;
            }
        }




        /// <summary>
        /// Logic of message and page counts
        /// </summary>
        /// <param name="pagedDomainMessages">List of Message domain objects </param>
        private void SetListCounts(Paged<Message> pagedDomainMessages)
        {
            PageCount = pagedDomainMessages.RowCount / pagedDomainMessages.RecordsPerPage(0);
            if (pagedDomainMessages.RowCount % pagedDomainMessages.RecordsPerPage(0) > 0)
            {
                PageCount += 1;
            }

            RecordsPerPage = pagedDomainMessages.RecordsPerPage(0);
            ListCount = pagedDomainMessages.RowCount;
        }

        private void SetAvailableGroupNames(IEnumerable<vmMessageListItem> messageItems)
        {
            List<string> groups = messageItems.Select(m => m.Group).Distinct().ToList();
            GroupNames = groups;
        }

        private void SetPageLayoutFields(List<vmMessageListItem> messageItems, Paged<Message> pagedDomainMessages, 
            bool isReverseScroll, int groupIndex, int count)
        {
            if (messageItems.Any())
            {
                InitGroupHeader = messageItems.First().Group;
            }
            else
            {
                InitGroupHeader = string.Empty;
            }

            if (pagedDomainMessages.PageNumber == 1)
            {
                IsFirstPage = true;
            }
            if (isReverseScroll)
            {
                VertAlign = "bottom";
            }
            else
            {
                VertAlign = "top";
            }

            AddGroupHeader = false;

            if (groupIndex > 0 && count == 0) //first page of a new group 
            {
                AddGroupHeader = true;
            }
        }
    }
}