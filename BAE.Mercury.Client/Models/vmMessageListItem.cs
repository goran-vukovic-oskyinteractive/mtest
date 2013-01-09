// =================================================
//          %name: <filename>%
//       %version: <revision>%
//      Copyright: Copyright 2012 BAE Systems Australia
//                 All rights reserved.
// =================================================                
using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BAE.Mercury.Common.DataTypes;
using BAE.Mercury.Core.MmhsModel;

namespace BAE.Mercury.Client.Models
{
    public class vmMessageListItem
    {
        public int Id { get; set; }
        public int MessageId { get; set; }
        public string Sender { get; set; }
        public string Subject { get; set; }
        public DateTime SentTime;
        public string SentDtg { get { return SentTime.ToShortDateString(); } }
        public bool HasAttachment { get; set; }

        public string State { get { return "action"; } } //TODO: this needs to use the correct state value

        public string Precedence { get { return "priority"; } } //TODO: this needs to use the correct priority value
        public DateTime ReceivedTime { get; set; }

        public string Group { get; set; }         
        public int GroupIndex { get; set; }



    }
}