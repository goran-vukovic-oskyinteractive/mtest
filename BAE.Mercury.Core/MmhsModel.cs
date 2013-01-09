using System;
using System.Collections;
using System.Collections.Generic;
using System.Linq;
using System.Text;
//using BAE.Mercury.Client.Models;

namespace BAE.Mercury.Core.MmhsModel
{
    public class PrecedenceClass
    {
        int precedence;
        public PrecedenceClass(int precedence)
        {
            this.precedence = precedence;
        }
        public string Name
        {
            get
            {
                switch (precedence)
                {
                    case 1:
                        return "AAAA";
                    case 2:
                        return "BBBB";
                    case 3:
                        return "CCC";
                    case 4:
                        return "DDD";
                    default:
                        throw new ApplicationException("invalid precedence no");
                }
            }
        }
    }

    //pub
    public class OriginatingAddresseeClass
    {
        public OriginatingAddresseeClass(string name)
        {
            this._name = name;
        }

        public OriginatingAddresseeClass(int originatingAddressee)
        {
            // TODO: Complete member initialization
            this.originatingAddressee = originatingAddressee;
        }

        string _name = "Undefined";
        private int originatingAddressee;
        public string Name
        {
            get
            {
                return _name;
            }
            set
            {
                _name = value;
            }
        }
        public DateTime ExpiryTime
        {
            get
            {
                return DateTime.Now;
            }
        }

        //ActionAddressees = message.ActionAddressees.ToList();
        //InfoAddressees = message.InfoAddressees.ToList();
        //Sics = message.Sics.ToList();

    }

    public class Message
    {
        private string actionAddressees;
        private string attachments;
        private int classification;
        private string content;
        private DateTime expiryTime;
        private int id;
        private OriginatingAddresseeClass originatingAddressee;
        private DateTime receivedTime;
        private string subject;
        private int precedence;

        public Message()
        {
        }

        public OriginatingAddresseeClass OriginatingAddressee
        {
            get
            {
                return originatingAddressee;
            }

        }
        public PrecedenceClass Precedence
        {
            get
            {
                return new PrecedenceClass(precedence);
            }
        }

        public DateTime ExpiryTime
        {
            get
            {
                return expiryTime;
            }
        }
        public string ClassificationName
        {
            get
            {

                switch (classification)
                {
                    case 1:
                        return "AAAA";
                    case 2:
                        return "BBBB";
                    case 3:
                        return "CCC";
                    case 4:
                        return "DDD";
                    default:
                        throw new ApplicationException("invalid precedence no");
                }
            }
        }

        public string ActionAddressees
        {
            get
            {
                return actionAddressees;
            }
        }

        public string Subject
        {
            get
            {
                return subject;
            }
            set
            {
                string s = value;
            }
        }

        public DateTime ReceivedTime
        {
            get
            {
                return receivedTime;
            }
            set
            {
                ReceivedTime = value;
            }
        }
        public int Id
        {
            get
            {
                return id;
            }
        }
        public string[] Attachments
        {
            get
            {
                string[] result = { "aaaa", "bbb" };
                return result;
            }
        }
        public string Content
        {
            get
            {
                return content;
            }
        }
        /*
        public int Rows
        {
            get
            {
                return 10;
            }

        }
        public int RowCount
        {
            get
            {

                return 0;
            }
        }
         */

        public Message(string actionAddressees, string attachments, int classification, string content,
            DateTime expiryTime, int id, int originatingAddressee, DateTime receivedTime,
            int precedence, string subject)
        {
            // TODO: Complete member initialization
            this.actionAddressees = actionAddressees;
            this.attachments = attachments;
            this.content = content;
            this.classification = classification;
            this.expiryTime = expiryTime;
            this.id = id;
            this.originatingAddressee = new OriginatingAddresseeClass(originatingAddressee);
            this.receivedTime = receivedTime;
            this.precedence = precedence;
            this.subject = subject;
        }
    }
    public class Sic
    {
        public string Code
        {
            get
            {

                return null;
            }
        }
        public string Description
        {
            get
            {

                return null;
            }
        }


    }


    public class MessageSic
    {
        public Sic Value
        {
            get
            {

                return null;
            }
        }
        public bool HasChildren
        {
            get
            {
                return false;
            }
        }
        public string Code
        {
            get
            {

                return null;
            }
        }
        public int RowCount
        {
            get
            {

                return 0;
            }
        }
    }
    class MmhsModel
    {
    }
    class Enum
    {
    }
    public class Folder// : vmFolder
    {
        public Folder ParentFolder
        {
            get
            {
                return null;
            }
        }
        public List<Folder> ChildFolders
        {
            get
            {
                return null;
            }
        }
        public int Id
        {
            get
            {
                return 0;
            }
        }
        public string DisplayName
        {
            get
            {
                return null;
            }
        }
    }

    public interface ISomeData : IEnumerable<string>
    {
        IEnumerable<string> Data { get; }
    }
    public class MessageEnum : IEnumerator
    {
        //private Message[] _message;

        // Enumerators are positioned before the first element 
        // until the first MoveNext() call. 

        public MessageEnum(Message[] list)
        {
        }
        public object Current
        {
            get
            {
                return null;
            }
        }
        public void Reset()
        {
        }
        public bool MoveNext()
        {
            return false;
        }
    }
    public class Paged<Message> : List<Message> //, IEnumerable
    {
        int _rowCount = 0;
        public int PageNumber
        {
            get;
            set;
        }

        public int RecordsPerPage(int id)
        {
            return 20;
        }
        /*
        public IEnumerator GetEnumerator()
        {
            return new MessageEnum(null);
        }
         */
        public Message Pop()
        {
            return default(Message);
        }
        public List<Message> Result
        {
            get
            {
                return this.ToList();
            }
        }

        public int RowCount
        {
            get
            {

                return _rowCount;
            }
            set
            {
                _rowCount = value;
            }
        }

    }
    public class SystemAuditEntry
    {
        private int _Id = 0;
        private DateTime _Time;
        private string _Station;
        private string _User;
        private string _Process;
        private string _Severity;
        private string _Description;



        //        public vmSystemAuditEntry(SystemAuditEntry message) : this(message.Id, message.Time, message.Station, message.User, message.Process, message.Severity, message.Description)
        public int Id
        {
            get
            {
                return _Id;
            }
            set
            {
                _Id = value;
            }
        }
        public DateTime Time
        {
            get
            {
                return _Time;
            }
            set
            {
                _Time = value;
            }
        }
        public string Station
        {
            get
            {
                return _Station;
            }
            set
            {
                _Station = value;
            }
        }
        public string User
        {
            get
            {
                return _User;
            }
            set
            {
                _User = value;
            }
        }
        public string Process
        {
            get
            {
                return _Process;
            }
            set
            {
                _Process = value;
            }
        }
        public string Severity
        {
            get
            {
                return _Severity;
            }
            set
            {
                _Severity = value;
            }
        }
        public string Description
        {
            get
            {
                return _Description;
            }
            set
            {
                _Description = value;
            }
        }


    }
}
