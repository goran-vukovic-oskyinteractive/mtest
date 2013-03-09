using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using NLog;

namespace BAE.Mercury.Client.Infrastructure.Logging
{
    public class NLogLogger : ILogger

   {

        private Logger _logger;

  

         public NLogLogger()

         {

            _logger = LogManager.GetCurrentClassLogger();

         }

 

        public void Info(string message)

       {

           _logger.Info(message);

        }

    }

 }