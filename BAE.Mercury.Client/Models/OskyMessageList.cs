using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BAE.Mercury.Core.MmhsModel;

namespace BAE.Mercury.Client.Models
{
    public class OskyMessageList
    {

        private List<BAE.Mercury.Core.MmhsModel.Message> messages;
        private DateTime lastReceivedTime;
        private DateTime currentClientTime;

        public OskyMessageList(List<Message> messages, DateTime lastReceivedTime, DateTime currentClientTime)
        {
            // TODO: Complete member initialization
            this.messages = messages;
            this.lastReceivedTime = lastReceivedTime;
            this.currentClientTime = currentClientTime;
        }
        public string DateChange(DateTime receivedTime)
        {
            //is there a change in date
            //Note: this demands messages are sorted by received date descending 
            if (lastReceivedTime.Date != receivedTime.Date)
            {
                lastReceivedTime = receivedTime;
                //the date change, did we already flag it
                if (currentClientTime.Date == receivedTime.Date)
                {
                    return "Today";
                }
                else
                {
                    return receivedTime.ToString("D");
                }                                
            }
            //no change
            return null;
        }
        //public string toDTG (DateTime dt)
        //{
        //    return dt.ToString("ddHHmmZ MMM yyyy");
        //}
        //properties
        public List<Message> Messages
        {
            get
            {
                return messages;

            }
        }


    }
}