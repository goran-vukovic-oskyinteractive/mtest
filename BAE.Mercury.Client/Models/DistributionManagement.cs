using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BAE.Mercury.Client.Models
{
    public class DMNode
    {
        protected List<DMNode> nodes = new List<DMNode>();
        protected int id, parentId;
        protected string name;
        public DMNode() { }
        public DMNode(int id, int parentId, string name)
        {
            this.id = id;
            this.parentId = parentId;
            this.name = name;
        }
        public void AddNode(DMNode node)
        {
            nodes.Add(node);
        }
        public int Id
        {
            get
            {
                return id;
            }
        }
        public int ParentId
        {
            get
            {
                return parentId;
            }
        }
        public string Name
        {
            get
            {
                return name;
            }
        }
        public List<DMNode> Nodes
        {
            get
            {
                return nodes;
            }
        }
    }
    public class DMSic : DMNode
    {
        public enum SicType
        {
            Action = 0, Info =1
        }
        private SicType sicType;
        public DMSic(int id, int parentId, string name, SicType sicType) : base(id, parentId, name)
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
    }

    public class DMAppointment : DMNode
    {
        private List<DMSic> infos = new List<DMSic>(), actions = new List<DMSic>();
        public DMAppointment(int id, int parentId, string name)
            : base(id, parentId, name) { }
        public List<DMSic> Infos
        {
            get
            {
                return infos;
            }
        }
        public List<DMSic> Actions
        {
            get
            {
                return actions;
            }
        }
        public void AddInfo(DMSic sic)
        {
            infos.Add(sic);
        }
        public void AddAction(DMSic sic)
        {
            actions.Add(sic);
        }
    }
    public class DMUnit : DMNode
    {
        public DMUnit(int id, int parentId, string name)
            : base(id, parentId, name) { }
    }
    public class DMSet : DMNode
    {
        public DMSet(int id, int parentId, string name)
            : base(id, parentId, name) { }
    }
    public class DistributionManagement : DMNode
    {
    }
/*
    public class DistributionManagementEx
    {
        public class Data
        {
            int level;
            public Data(int level)
            {
                // TODO: Complete member initialization
                this.level = level;
                //if (level == 0 || level >= 4)
                //    throw new ApplicationException("invalid node level");

            }
            //public int l
            //{
            //    get
            //    {
            //        return level;
            //    }
            //}
            public string color
            {
                get
                {
                    return "red";
                }
            }
            public int alpha
            {
                get
                {
                    return 1;
                }
            }

        }
        public class DistributionManagementNode
        {
            //Note: the notation is adjusted to AJAX, hence not corresponding to C# standard
            private int level;
            protected string tagId;
            protected int nodeId;
            protected int parentId;
            protected string nodeName;
            private List<DistributionManagementNode> childNodes;

            public DistributionManagementNode(int nodeId, string nodeName, int parentId)
            {
                this.nodeId = nodeId;
                this.nodeName = nodeName;
                this.parentId = parentId;
                this.childNodes = new List<DistributionManagementNode>();
            }
            public int GetId()
            {
                return nodeId;
            }
            public int GetParentId()
            {
                return parentId;
            }
            public void SetLevel(int level)
            {
                this.level = level;
            }
            public string id
            {
                get
                {
                    return tagId;
                }
                set
                {
                    tagId = value;
                }
            }
            public string name
            {
                get
                {
                    return nodeName;
                }
            }

            public List<DistributionManagementNode> children
            {
                get
                {
                    return childNodes;
                }
            }
            public Data data
            {
                get { return new Data(this.level); }
            }
        }

    }
 */
}