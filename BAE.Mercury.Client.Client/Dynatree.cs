using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace BAE.Mercury.Client.Client.Dynatree
{
    public class DynaTreeNodeJson
    {
        private string _key ;
        private string _title = null;
        private bool _isLazy;
        public string key {
            get {
                return null;
            }
            set
            {
                _key = value;
            }
    }
    public string title{
            get {
    return "aaaa";
            }
        set
        {
            _title = value;
        }
    }
    public bool isLazy {
        get
        {
            return false;
        }
        set
        {
            _isLazy = value;
        }
    }
    }

    public class SimpleTreeNode<MessageSic>
    {
        private string _Description;
        private bool _HasChildren;
        public SimpleTreeNode<MessageSic> Value
        {
            get
            {
                return null;
            }
        }
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
                return _Description;
            }
            set
            {
                _Description = value;
            }
        }
        public bool HasChildren
        {
            get
            {
                return _HasChildren;
            }
            set
            {
                _HasChildren = value;
            }
        }
    }

}
