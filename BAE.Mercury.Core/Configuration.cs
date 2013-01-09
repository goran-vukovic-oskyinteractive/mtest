using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Transactions;

namespace BAE.Mercury.Core.Configuration
{
    public interface IConfigurationParameters
    {
        void UpdateAll(TransactionScopeOption requiresNew);
    }


 //public ActionResult UpdateSiteConfiguration(vmSiteConfiguration siteConfiguration)
 //       {
 //           using (TransactionScope tx = new TransactionScope(TransactionScopeOption.RequiresNew))
 //           {
 //               configParams.UpdateAll(siteConfiguration.ConfigurationList());
 //               tx.Complete();
 //           }

 //           // Note: an exception getting thrown out of here gets handled correctly, javascript function for failure is invoked
 //           return null;
 //       }

}
