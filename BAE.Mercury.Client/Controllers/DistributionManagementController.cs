using System;
using System.Collections.Generic;
using System.Linq;
using System.Web;
using System.Web.Mvc;

namespace BAE.Mercury.Client.Controllers
{
    public class DistributionManagementController : Controller
    {
        //
        // GET: /DistributionManagement/

        public ActionResult Index()
        {
            return View();
        }

        //
        // GET: /DistributionManagement/Details/5

        public ActionResult Details(int id)
        {
            return View();
        }

        //
        // GET: /DistributionManagement/Create

        public ActionResult Create()
        {
            return View();
        }

        //
        // POST: /DistributionManagement/Create

        [HttpPost]
        public ActionResult Create(FormCollection collection)
        {
            try
            {
                // TODO: Add insert logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

        //
        // GET: /DistributionManagement/Edit/5

        public ActionResult Edit(int id)
        {
            return View();
        }

        //
        // POST: /DistributionManagement/Edit/5

        [HttpPost]
        public ActionResult Edit(int id, FormCollection collection)
        {
            try
            {
                // TODO: Add update logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }

        //
        // GET: /DistributionManagement/Delete/5

        public ActionResult Delete(int id)
        {
            return View();
        }

        //
        // POST: /DistributionManagement/Delete/5

        [HttpPost]
        public ActionResult Delete(int id, FormCollection collection)
        {
            try
            {
                // TODO: Add delete logic here

                return RedirectToAction("Index");
            }
            catch
            {
                return View();
            }
        }
    }
}
