using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BAE.Mercury.Client.Models
{
    public class DistributionManagement
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
}