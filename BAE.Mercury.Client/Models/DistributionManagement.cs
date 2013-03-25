using System;
using System.Diagnostics;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BAE.Mercury.Client.Models
{
    public class DMidParser
    {
        private int setId = -1, unitId = -1, appointmentId = -1, sicId = -1;
        public DMidParser(string id)
        {
            string[] idString = id.Split('_');
            if (idString.Length > 1)
                this.setId = Int32.Parse(idString[1]);
            if (idString.Length > 2)
                this.unitId = Int32.Parse(idString[2]);
            if (idString.Length > 3)
                this.appointmentId = Int32.Parse(idString[3]);
            if (idString.Length > 4)
                this.sicId = Int32.Parse(idString[4]);
        }
        public int SetId
        {
            get
            {
                return setId;
            }
        }
        public int UnitId
        {
            get
            {
                return unitId;
            }
        }
        public int AppointmentId
        {
            get
            {
                return appointmentId;
            }
        }
        public int SicId
        {
            get
            {
                return sicId;
            }
        }
    }
    public class DMnode
    {
        private List<DMnode> children = new List<DMnode>();
        private DMnode parent;
        private int id;
        private string name;        
        //public DMnode() { }
        public DMnode(DMnode parent, int id, string name)
        {
            this.id = id;
            this.parent = parent;
            this.name = name;
        }
        public virtual void AddChild(DMnode node)
        {
            children.Add(node);
        }
        public int Id
        {
            get
            {
                return id;
            }
        }
        public string Name
        {
            get
            {
                return name;
            }
        }
        public List<DMnode> Children
        {
            get
            {
                return children;
            }
        }
        public DMnode Parent
        {
            get
            {
                return parent;
            }
        }
    }
    public class DMrule : DMnode, IComparable<DMrule>
    {
        public enum EnMatchType
        {
            Equal = 2, StartsWith = 1

        }
        public enum EnRuleType
        {
            SIC = 2, PrivacyMarking = 1
        }
        private EnMatchType matchType;
        private EnRuleType ruleType;
        private string name;
        public DMrule(DMnode parent, string name, EnRuleType ruleType, EnMatchType matchType)
            : base(parent, -1, name)
        {
            this.ruleType = ruleType;
            this.matchType = matchType;
            this.name = name;
        }
        public EnRuleType RuleType
        {
            get
            {
                return ruleType;
            }
        }
        public EnMatchType MatchType
        {
            get
            {
                return matchType;
            }
        }
        public int CompareTo(DMrule rule)
        {
            if (this.RuleType < rule.RuleType)
                return -1;
            else if (this.RuleType == rule.RuleType)
            {
                if (this.MatchType < rule.MatchType)
                    return -1;
                else if (this.MatchType == rule.MatchType)
                {
                    var str1 = this.Name.ToLower();
                    var str2 = rule.Name.ToLower();
                    return (str1.CompareTo(str2));
                }
                else
                    return 1;
            }
            else
                return 1;
        }

    }
    public class DMsic : DMnode
    {
        public enum SicType
        {
            Action = 2, Info = 1
        }
        private bool finalized = false;
        //private const string DOTS = "...";
        //private int maxShortName = 80 - DOTS.Length;
        private SicType sicType;
        private string longName, data;
        public DMsic(DMnode parent, int id, SicType sicType)
            : base(parent, id, null)
        {
            this.sicType = sicType;
        }
        public SicType Type
        {
            get
            {
                return sicType;
            }
        }
        public void DataFinalize()
        {
            //this method exists so that node information is assembled only once
            if (finalized)
                throw new ApplicationException("this SIC was aleardy finalized");
            finalized = true;
            List<DMrule> children = this.Children.Cast<DMrule>().ToList();
            children.Sort();
            StringBuilder longNameSB = new StringBuilder("("), dataSB = new StringBuilder("[");
            for(int i = 0; i < children.Count; i++)
            {
                DMrule rule = (DMrule) children[i];
                if (i > 0)
                {
                    if (((DMrule)this.Children[i -1]).RuleType == rule.RuleType)
                        longNameSB.Append(" OR ");
                    else
                        longNameSB.Append(") AND (");
                }
                if (rule.RuleType == DMrule.EnRuleType.PrivacyMarking)
                {
                    longNameSB.Append("Privacy Marking");
                }
                else
                {
                    longNameSB.Append("SIC");
                }
                if (rule.MatchType == DMrule.EnMatchType.StartsWith)
                {
                    longNameSB.Append(" starts with ");
                }
                else
                {
                    longNameSB.Append(" = ");
                }
                string name = System.Web.HttpUtility.HtmlEncode(rule.Name);
                //data for rules [rule type, match, start position, length]
                dataSB.Append(((i > 0) ? "," : "") + String.Format("[{0},{1},{2},{3}]", (int)rule.RuleType, (int)rule.MatchType, longNameSB.Length, name.Length));
                longNameSB.Append(name);
            }
            longName = longNameSB.ToString() + ")";
            data = dataSB.ToString() + "]";


        }

        //public string ShortName
        //{
        //    get
        //    {
        //        string shortName = LongName;
        //        if (shortName.Length > maxShortName)
        //            return shortName.Substring(0, maxShortName) + DOTS;
        //        else
        //            return shortName;
        //    }
        //}
        public string LongName
        {
            get
            {

                if (!finalized)
                    throw new ApplicationException("this SIC was not finalized");
                return longName;
            }
        }
        public string Data
        {
            get
            {
                if (!finalized)
                    throw new ApplicationException("this SIC was not finalized");
                return data;
            }
        }
        public override void AddChild(DMnode node)
        {
            if (finalized)
                throw new ApplicationException("this SIC was aleardy finalized");
            if (this.Children.Count >= 25)
                throw new ApplicationException("maximum number of rules exceeded");
            //(Privacy marking = CCCCC or Privacy marking starts with DDDDD) AND (SIC=BBBBBBB or SIC=FFFFFF)
            base.AddChild(node);
        }


    }
    public class DMappointment : DMnode
    {
        private List<DMnode> infos = new List<DMnode>();
        public DMappointment(DMnode parent, int id, string name)
            : base(parent, id, name) { }
        public List<DMnode> Infos
        {
            get
            {
                return infos;
            }
        }
        public List<DMnode> Actions
        {
            get
            {
                return this.Children;
            }
        }
        public override void AddChild(DMnode node)
        {
            if (((DMsic) node).Type == DMsic.SicType.Action)
                base.AddChild(node);
            else
                infos.Add(node);

        }
    }
    public class DMunit : DMnode
    {
        private bool locked;
        public DMunit(DMnode parent, int id, string name, bool locked)
            : base(parent, id, name) 
        {
            this.locked = locked;
        }

        public bool Locked
        {
            get
            {
                return locked;
            }
        }
    }
    public class DMset : DMnode
    {
        private bool locked;
        private bool active;
        public DMset(DMnode parent, int id, string name, bool locked, bool active)
            : base(parent, id, name)
        {
            this.locked = locked;
            this.active = active;
        }
        public bool Locked
        {
            get
            {
                return locked;
            }
        }
        public bool Active
        {
            get
            {
                return active;
            }
        }
    }
    public class DistributionManagement : DMnode
    {
        public DistributionManagement()
            : base(null, 0, String.Empty) { }
    }

    //start return info 

    public class RetRule
    {
        private DMrule.EnMatchType match;
        private DMrule.EnRuleType type;
        private string name;
        public string RuleType
        {
            set
            {
                type = (DMrule.EnRuleType) Int32.Parse(value);
            }
        }
        public string Name
        {
            set
            {
                name = value;
            }
            get
            {
                return name.ToUpper();
            }
        }
        public string MatchType
        {
            set
            {
                match = (DMrule.EnMatchType) Int32.Parse(value);
            }
        }

        public DMrule.EnMatchType EnumMatchType
        {

            get{
                return match;
            }

        }
        public DMrule.EnRuleType EnumRuleType
        {
            get{
                return type;
            }
            
        }
   
    }




    public class RetSic
    {
        List<RetRule> children = new List<RetRule>();
        private int setId, unitId, appointmentId, sicId;
        private DMsic.SicType type;


        public string Id
        {
            set
            {
                DMidParser parser = new DMidParser(value);
                setId = parser.SetId;
                unitId = parser.UnitId;
                appointmentId = parser.AppointmentId;
                sicId = parser.SicId;
            }
        }
        public List<RetRule> Children
        {
            set
            {
                children = value;
            }
            get
            {
                return children;
            }
        }
        public string Type
        {
            set
            {
                type = (DMsic.SicType)Int32.Parse(value);
            }
        }

        public int SetId
        {
            get
            {
                return setId;
            }
        }
        public int UnitId
        {
            get
            {
                return unitId;
            }
        }
        public int AppointmentId
        {
            get
            {
                return appointmentId;
            }
        }
        public int SicId
        {
            get
            {
                return sicId;
            }
        }
    }
    public class RetChange
    {
        public enum EnType
        {
            Delete = -1, Edit = 0, Add = 1
        }
        private RetSic sic;
        private EnType type;
        public string Type
        {
            set
            {
                type = (EnType) Int32.Parse(value);
            }
        }
        public RetSic Sic
        {
            set
            {
                sic = value;
            }
            get
            {
                return sic;
            }
        }
        public EnType ChangeType
        {
            get
            {
                return type;
            }
        }


    }
    public class RetChangeList
    {
        private string id, unitId;
        List<RetChange> changes = new List<RetChange>();
        public string Id
        {
            set
            {
                id = value;
            }
        }
        public List<RetChange> Changes
        {
            get
            {
                return changes;
            }
        }
    }
    //end return info 

}