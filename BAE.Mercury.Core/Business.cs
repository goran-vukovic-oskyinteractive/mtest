using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using BAE.Mercury.Core.MmhsModel;
using BAE.Mercury.Core.DataTypes;



namespace BAE.Mercury.Core.Business
{
    //public class SystemAuditEntry
    //{
    //}
    public interface IAlertService 
    {
        //int count = alertService.GetAlerts().Count();
        IEnumerable<Alert> GetAlerts();
        int Count();
    }
    public interface IAuditTrailService
    {
        //IEnumerable<SystemAuditEntry> messages = service.ListAll();
        List<SystemAuditEntry> ListAll();
    }


}
