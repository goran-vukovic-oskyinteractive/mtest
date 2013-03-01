using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;

namespace BAE.Mercury.Client.Models
{
    public class SIC
    {

        string name;
        public SIC(string name)
        {
            this.name = name;
        }
        public string Name
        {
            get
            {
                return name;
            }
        }
    }
    public class DMAppointment
    {
        private List<SIC> infos = new List<SIC>(), actions = new List<SIC>();
        int id;
        public DMAppointment(int id)
        {
            this.id = id;
        }
        public int Id
        {
            get
            {
                return id;
            }
        }
        public List<SIC> Infos
        {
            get
            {
                return infos;
            }
        }
        public List<SIC> Actions
        {
            get
            {
                return actions;
            }
        }
        public void AddInfo(SIC sic)
        {
            infos.Add(sic);
        }
        public void AddAction(SIC sic)
        {
            actions.Add(sic);
        }
    }
    public class Unit
    {
        private List<DMAppointment> appointments;
        int id;
        public Unit(int id)
        {
            this.id = id;
        }
        public void AddAppointment(DMAppointment appointment)
        {
            appointments.Add(appointment);
        }
        
    }
    public class Set
    {
        private List<Unit> units = new List<Unit>();
        int id;
        public Set(int id)
        {
            this.id = id;
        }
        public void AddUnit(Unit unit)
        {
            units.Add(unit);
        }
    }
    public class DistributionManagement
    {
        private List<Set> sets = new List<Set>();
        public void AddSet(Set set)
        {
            sets.Add(set);
        }
        public List<Set> Sets
        {
            get
            {
                return sets;
            }
        }
    }
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
}