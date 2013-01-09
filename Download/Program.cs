using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Net;

namespace Download
{
    class Program
    {
        static void Main(string[] args)
        {
            if (args.Length < 2)
            {
                Console.WriteLine("Usage: download URL1 URL2 <user> <password>");
                return;
            }
            Program pr = new Program();
            pr.Run(args);
        }
        private void Run(string[] args)
        {
            WebClient webClient = new WebClient();
            if (args.Length > 2)
                webClient.Credentials = new NetworkCredential(args[2], args[3]);
            webClient.DownloadFile(args[0], @"file1.html");
            webClient.DownloadFile(args[1], @"file2.html");
            Console.WriteLine("Finished downloading 2 files");

        }
    }
}
