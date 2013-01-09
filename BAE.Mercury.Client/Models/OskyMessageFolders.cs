using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using BAE.Mercury.Core.MmhsModel;




namespace BAE.Mercury.Client.Models
{
    //public class ActionAddresseesList : IEnumerable
    //{


    //}
    //public class Folder
    //{
    //}
    public class Account
    {
    }
    public class MailBox
    {
        private string account, name;
        private int id, count;

        public MailBox(int id, string account, string name, int count)
        {
            // TODO: Complete member initialization
            this.id = id;
            this.name = name;
            this.count = count;
            this.account = account;
        }
        public string Account
        {
            get
            {
                return account;
            }
        }
        public string Name
        {
            get
            {
                return name;
            }
        }
        public int Count
        {
            get
            {
                return count;
            }
        }
        public int Id
        {
            get
            {
                return id;
            }
        }
    }

    public class OskyMessageFolders
    {
        public List<MailBox>
            inbox = new List<MailBox>(),
            sent = new List<MailBox>(),
            discard = new List<MailBox>(),
            templates = new List<MailBox>(),
            objective = new List<MailBox>(),
            draft = new List<MailBox>(),
        folder = new List<MailBox>();
        private List<Folder> folders;
        public OskyMessageFolders()
        {
            //this.mailBoxes = mailBoxes;
            //this.folders = folders;
        }
        public int Sum(List<MailBox> mailBoxes)
        {
            int sum = 0;
            foreach (MailBox mailBox in mailBoxes)
                sum += mailBox.Count;
            return sum;
        }


    }
}