/*================================================================================
        %name: SessionBag.cs %
        %version: 2 %
        %date_created: Tue Nov  6 13:35:35 2012 %
        %created by : MBigglesworth79%
        Copyright: Copyright 2012 BAE Systems Australia
        All rights reserved.

   Dynamic object wrapper for httpSession. Useable by razor engine in  views
================================================================================*/


using System;
using System.Collections.Generic;
using System.Dynamic;
using System.Linq;
using System.Web;

namespace BAE.Mercury.Client.App_Code
{
    public sealed class SessionBag : DynamicObject
    {
        private static readonly SessionBag sessionBag;

        static SessionBag()
        {
            sessionBag = new SessionBag();
        }

        private SessionBag()
        {
        }

        private HttpSessionStateBase Session
        {
            get { return new HttpSessionStateWrapper(HttpContext.Current.Session); }
        }

        public override bool TryGetMember(GetMemberBinder binder, out object result)
        {
            result = Session[binder.Name];
            return true;
        }

        public override bool TrySetMember(SetMemberBinder binder, object value)
        {
            Session[binder.Name] = value;
            return true;
        }

        public override bool TryGetIndex(GetIndexBinder
               binder, object[] indexes, out object result)
        {
            int index = (int)indexes[0];
            result = Session[index];
            return result != null;
        }

        public override bool TrySetIndex(SetIndexBinder binder,
               object[] indexes, object value)
        {
            int index = (int)indexes[0];
            Session[index] = value;
            return true;
        }

        public static dynamic Current
        {
            get { return sessionBag; }
        }
    }
}