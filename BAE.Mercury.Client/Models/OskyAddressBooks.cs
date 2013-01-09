using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BAE.Mercury.Client.Models;

namespace BAE.Mercury.Client.Models
{
    public class AddressBookSession
    {
        private int id, 
            status;
        private string annotation;
        private DateTime effectiveDate;
        private DateTime expirationDate;

        public AddressBookSession(int id, int status, string annotation, DateTime effectiveDate, DateTime expirationDate)
        {
            // TODO: Complete member initialization
            this.id = id;
            this.status = status;
            this.annotation = annotation;
            this.effectiveDate = effectiveDate;
            this.expirationDate = expirationDate;
        }
        public int Id
        {
            get
            {
                return id;
            }
        }
        public string Status
        {
            get
            {
                switch(status)
                {
                    case 1:
                        return "Editing";
                    case 2:
                        return "Pending Publication";
                    case 3:
                        return "Published";
                    default:
                        throw new ApplicationException("invalid address book session status");
                }
            }
        }
        public string Annotattion
        {
            get
            {
                return annotation;
            }
        }
        public DateTime EffectiveDate
        {
            get
            {
                return effectiveDate;
            }
        }
        public DateTime ExpirationDate
        {
            get
            {
                return expirationDate;
            }
        }

    }
    public class OskyAddressBooks
    {
        public List<AddressBookSession> addressBookSessions = new List<AddressBookSession>();

    }
}