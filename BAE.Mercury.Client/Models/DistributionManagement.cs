using System;
using System.Diagnostics;
using System.Text;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BAE.Mercury.Client.Models
{
    public class DMnode
    {
        private List<DMnode> children = new List<DMnode>();
        private DMnode parent;
        private int id;
        private string name;
        private bool readOnly;
        //public DMnode() { }
        public DMnode(DMnode parent, int id, string name, bool readOnly)
        {
            this.id = id;
            this.name = name;
            this.readOnly = readOnly;
            this.parent = parent;
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
        public bool ReadOnly
        {
            get
            {
                return readOnly;
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
    public class DMrule : DMnode
    {
        public enum MatchType
        {
            Equal = 1, StartsWith = 2

        }
        public enum RuleType
        {
            SIC = 1, PrivacyMarking = 2
        }
        private MatchType matchType;
        private RuleType ruleType;
        private string name;
        public DMrule(DMnode parent, int id, string name, bool readOnly, RuleType ruleType, MatchType matchType)
            : base(parent, id, name, readOnly)
        {
            this.ruleType = ruleType;
            this.matchType = matchType;
            this.name = name;
        }
        public RuleType Rule
        {
            get
            {
                return ruleType;
            }
        }
        public MatchType Match
        {
            get
            {
                return matchType;
            }
        }

    }
    public class DMsic : DMnode
    {
        public enum SicType
        {
            Action = 2, Info = 1
        }
        private const string DOTS = "...";
        private int maxShortName = 80 - DOTS.Length;
        private SicType sicType;
        private StringBuilder longName = new StringBuilder("("), data = new StringBuilder("[");
        //List<DMrule> rules = new List<DMrule>();
        public DMsic(DMnode parent, int id, SicType sicType, bool readOnly)
            : base(parent, id, null, readOnly)
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
        public string ShortName
        {
            get
            {
                string shortName = LongName;
                if (shortName.Length > maxShortName)
                    return shortName.Substring(0, maxShortName) + DOTS;
                else
                    return shortName;
            }
        }
        public string LongName
        {
            get
            {
                 return longName.ToString() + ")";
            }
        }
        public string Data
        {
            get
            {
                return data.ToString() + "]";
            }
        }
        public override void AddChild(DMnode node)
        {
            if (this.Children.Count >= 25)
                throw new ApplicationException("maximum number of rules exceeded");
            //(Privacy marking = CCCCC or Privacy marking starts with DDDDD) AND (SIC=BBBBBBB or SIC=FFFFFF)
            DMrule rule = (DMrule)node;
            if (this.Children.Count > 0)
            {
                if (((DMrule)this.Children[this.Children.Count - 1]).Rule == rule.Rule)
                    longName.Append(" OR ");
                else
                    longName.Append(") AND (");
            }
            if (rule.Rule == DMrule.RuleType.PrivacyMarking)
            {
                longName.Append("Privacy Marking");
            }
            else
            {
                longName.Append("SIC");
            }
            if (rule.Match == DMrule.MatchType.StartsWith)
            {
                longName.Append(" starts with ");
            }
            else
            {
                longName.Append(" = ");
            }
            string name = System.Web.HttpUtility.HtmlEncode(rule.Name);
            //data for rules [rule type, match, start position, length]
            if (this.Children.Count > 0)
            {
                int i = 6;
            }
            data.Append(((this.Children.Count > 0) ? "," : "") + String.Format("[{0},{1},{2},{3}]", (int)rule.Rule, (int)rule.Match, longName.Length, name.Length));
            longName.Append(name);
            base.AddChild(node);
        }
    }

    public class DMappointment : DMnode
    {
        private List<DMnode> infos = new List<DMnode>();
        public DMappointment(DMnode parent, int id, string name, bool readOnly)
            : base(parent, id, name, readOnly) { }
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
        public DMunit(DMnode parent, int id, string name, bool readOnly)
            : base(parent, id, name, readOnly) { }
    }
    public class DMset : DMnode
    {
        private bool active;
        public DMset(DMnode parent, int id, string name, bool readOnly, bool active)
            : base(parent, id, name, readOnly)
        {
            this.active = active;
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
            : base(null, 0, String.Empty, false) { }
    }
}