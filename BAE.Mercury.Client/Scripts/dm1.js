function DMidParser(id) {
    if (!id)
        throw new Error("invalid id passed to parser");
    //var setId = -1, unitId = -1, appointmentId = -1, sicId = -1;
    var idString = id.split('_');
    if (idString.length > 1)
        this.SetId = parseInt(idString[1]);
    if (idString.length > 2)
        this.UnitId = parseInt(idString[2]);
    if (idString.length > 3)
        this.AppointmentId = parseInt(idString[3]);
    if (idString.length > 4)
        this.SicId = parseInt(idString[4]);
}

function Change(type, sic) {

    if (!(type == Change.EnType.Delete || type == Change.EnType.Edit || type == Change.EnType.Add))
        throw new Error("invalid change type");
    this.Type = type;
    if (!(sic instanceof DMsic))
        throw new Error("invalid SIC");
    this.Sic = sic;
}

Change.EnType = { Delete: -1, Edit: 0, Add: 1 };





function Set(setId, lock, ticks, appointments) {
    if (!setId)
        throw new Error("invalid set id");
    if (!(lock == Set.EnLockType.Unlocked || lock == Set.EnLockType.LockedByOthers || lock == Set.EnLockType.LockedByCurrent))
        throw new Error("invalid lock type");
    if (!ticks)
        throw new Error("invalid number of ticks");
    var sId = setId;
    this.Id = sId;
    var lockType = lock;
    this.Ticks = ticks;
    this.Changes = [];
    this.ClearChanges = function () {
        this.Changes.length = 0;
    }
    this.HasChanges = function () {
        return (this.Changes.length > 0);
    }
    this.ReadOnly = function () {
        return lockType == Set.EnLockType.LockedByOthers;
    }
    this.SetLock = function (lock) {
        lockType = lock;
    }
    this.AddChange = function (change) {
        if (this.ReadOnly())
            throw new Error("this set is read-only");
        if (!(change instanceof Change))
            throw new Error("invalid change");
        if (!(change.Sic.Id) || change.Sic.Id == 0)
            throw new Error("sic must have an id");
        if (change.Type == Change.EnType.Add || change.Type == Change.EnType.Edit) {
            if (change.Sic.Children.length <= 0)
                throw new Error("this sic must have rules");
        }
        this.Changes.push(change);
        //on first update lock the set
        if (this.Changes.length == 1) {
            if (lockType == Set.EnLockType.Unlocked) {
                setLockOn();//this.Id, true, false, true);
                //lockType = Set.EnLockType.LockedByCurrent;
            }
        }
    }
    this.LockType = function () {
        return lockType;
    }
    var listAppointments = appointments;
    this.GetAppointmentList = function(unitId) {
        for (var i = 0; i < listAppointments.length; i++) {
            if (listAppointments[i].UnitId == unitId)
                return listAppointments[i].AppointmentListHtml;
        }
        throw new Error("unit not found");
        return null;
    }

}

Set.EnLockType = { Unlocked : 0, LockedByOthers : 1, LockedByCurrent : 2 };

function resetListbox(control) {
    deHighlightControl(control);
    control.prop("selectedIndex",0);
}

function highlightControl(control) {
    control.css("background-color", "#faa");
}

function deHighlightControl(control) {
    control.css("background-color", "#fff");
}

function setSelectionValue(listbox, value) {
    listbox.val(value);
}
function getSelectionValue(listbox) {
    return listbox.val();
}
function getIntSelectionValue(listbox) {
    return parseInt(getSelectionValue(listbox));
}

function getTableTemplate() {
    return  $ID("sic-table-template");
}
function verifyNodeTag(node, tag) {
    var tagName = node.prop("tagName").toLowerCase();
    if (tagName != tag.toLowerCase())
        throw new Error("invalid element");
}
function getTables(tableTemplate, id) {
    var genId = getAppointmentGenId(id);
    var tableTemplates = tableTemplate.find("table").clone();

    var tableA = tableTemplates.eq(0);
    verifyNodeTag(tableA, "table");
    var attrA = "at" + genId;
    tableA.attr("id", attrA);
    tableA.children("tbody").empty();

    var tableI = tableTemplates.eq(1);
    verifyNodeTag(tableI, "table");
    var attrI = "it" + genId;
    tableI.attr("id", attrI);
    tableI.children("tbody").empty();


    return tableTemplates;
}
function getRow(tableTemplate, id, sic) {
    var jqIds = JQID[sic.Type];
    var genId = getAppointmentGenId(id);
    var spanClass;
    var rowPos;
    if (sic.Type == DMsic.EnType.Info) {
        spanClass = "sic-info";
        rowPos = 1;
    } else {
        spanClass = "sic-action";
        rowPos = 0;
    }
    var row = tableTemplate.find("tr").eq(rowPos).clone();
    var spanName = row.find("span.sic");
    var name = sic.LongName;
    spanName.html(name);
    var spanData = row.find("span." + spanClass);
    var data = sic.Data;
    spanData.html(data);
    var seqId;
    if (id[1] == "a" || id[1] == "c") { //new id
        var table = getTable(id, sic.Type);
        verifyNodeTag(table, "table");
        var seqNo = getNewSeqNo(table);
        seqId = genId + "_0" + seqNo;
        sic.Id = id[0] + "n" + seqId;
    } else {
        var seqNo = getSicExactId(id);
        seqId = genId + "_" + seqNo;
    }

    var del = row.find("td.delete > a");
    del.attr("id", jqIds.del + seqId);
    del.click(nodeMinus);
    var edit = row.find("td.edit > a");
    edit.attr("id", jqIds.edit + seqId);
    edit.click(nodeEdit);

    var copy = row.find("td.copy > a");
    copy.attr("id", jqIds.copy + seqId);
    copy.click(nodeCopy);


    var rowId = jqIds.row + seqId;
    row.attr("id", rowId);
    var tt = row.find("td.sic > a");
    tt.hover(doToolTip);
    //alert(row.attr("id"));
    return row;


}

function getSicExactId(id) {
    var split = id.split("_");
    return split[4];
    
}
function getUnitGenId(id) {
    var split = id.split("_");
    var genId = "_" + split[1] + "_" + split[2];
    return genId;
}

function getAppointmentGenId(id) {
    var split = id.split("_");
    var genId = "_" + split[1] + "_" + split[2] + "_" + split[3];
    return genId;
}
function getDivWrap(id) {
    var divId = "dw" + getAppointmentGenId(id); 
    return $ID(divId);
}
function isEmptyAppointment(id) {
    var divWrap = $ID("dw" + getAppointmentGenId(id));
    var innerTables = divWrap.find("table");
    var tables = innerTables.length;
    if (tables == 0)
        return true;
    else if (tables == 2) {
        return false;
    }
    else
        throw new Error("invalid number of tables");
}

function getTable(id, type) {
    var genId = getAppointmentGenId(id);
    var jqIds = JQID[type];
    var tid = jqIds.table + genId;
    var table = $ID(jqIds.table + genId);
    verifyNodeTag(table, "table");
    return table;
}
function appendRow(row, id, type, name) {
    //append to table
    var table = getTable(id, type);
    //alert(table.attr("id"));
    var pos = insertPos(table, name);

    if (pos != -1) {
        table.find("tr").eq(pos).before(row);
    } else {
        table.append(row);

    }
}
function getTemplateTable(tables, type) {
    var id = "#[id^=s" + JQID[type] + "]";
    var table = tables.find(id).clone();
    return table;
}
function addNode(sic) {
    //called from sicSve
    var id = sic.Id;
    var tableTemplate = getTableTemplate();
    if (isEmptyAppointment(id)) {
        //getTables(tableTemplate, id);
        var tables = getTables(tableTemplate, id);
        var divWrap = getDivWrap(id);
        divWrap.empty();
        divWrap.append(tables);
    }
    //now we have tables, append the rows
    var name = sic.LongName;
    var row = getRow(tableTemplate, id, sic);
    appendRow(row, id, sic.Type, name);

}
function updateNode(sic) {
    var id = sic.Id;
    removeNode(id);
    addNode(sic, false);
}
function removeNode(id) {
    //we find the type by id
    var prefix = id[0];
    var type;
    if (prefix == "i")
        type = DMsic.EnType.Info;
    else 
        type = DMsic.EnType.Action;

    var table = getTable(id, type);
    var action = id[1];
    var rowId = id.replace(id[1], "r");
    var row = $ID(rowId);
    row.remove();
    var wrapDiv = getDivWrap(id);
    if (wrapDiv.find("table").find("tr").length == 0) {
        //we must replace it with empty div
        wrapDiv.empty();
        var emptyDiv = $("<div class='appointment-empty-wrap'><div class='appointment-empty'></div></div>");
        wrapDiv.append(emptyDiv);
    }


}


function sicValidate(sicPopup, id, change) {

    var valid = true;
    var found = false;
    var sicPopupType = sicPopup.find("#sic-type");
    var sicType = getIntSelectionValue(sicPopupType);
    if (!(sicType == DMsic.EnType.Action || sicType == DMsic.EnType.Info)) {
        highlightControl(sicPopupType);
        valid = false;
        change.sic = null; // new DMsic(id, DMsic.EnType.Action); //this will be discarded
    }
    else
        change.sic = new DMsic(id, sicType);
    sicPopup.list.find("[id^='entry']").each(function () {
        found = true;
        var ruleCtl = $(this).find(".rule");
        var ruleType = getIntSelectionValue(ruleCtl);
        if (ruleType < 1) {
            highlightControl(ruleCtl);
            valid = false;
        }


        var matchCtl = $(this).find(".match");
        var matchType = getIntSelectionValue(matchCtl);
        if (matchType < 1) {
            highlightControl(matchCtl);
            valid = false;
        }
        var nameCtl = $(this).find(".name");
        var name = nameCtl.val();
        if (name.length <= 0) {
            if (matchType != DMrule.EnMatchType.IsAnything) {
                highlightControl(nameCtl);
                valid = false;
            }
        }
        name = name.trim().toUpperCase();
        if (valid) {
            var entry = new DMrule(name, ruleType, matchType);
            change.sic.AddNode(entry);
        }
    });
    if (!valid) {
        dmAlert("Save Rule", "Please enter data in the empty fields highlighted red");
        return false;
    }
    if (!found) {
        dmAlert("Save Rule", "There must be at least one entry");
        return false;
    }
    return true;
}
function sicSave(id, action, sicPopup, oldData) {

    var data = { sic: null };
    if (sicValidate(sicPopup, id, data)) {
        data.sic.FinalizeData();
        if (action == Change.EnType.Edit) {
            if (!isEqual(data, oldData)) {
                data.sic.Id = id;
                //var dmsic = new DMsic(id, data.sic.Type);
                //var dmsic = ConvertSic(data.sic);
                updateNode(data.sic);
                var change = new Change(Change.EnType.Edit, data.sic)
                currentSet.AddChange(change);

            }
        } else {
            //var dmsic = new DMsic(id, data.sic.Type);
            //var dmsic = ConvertSic(data.sic);
            addNode(data.sic, true);
            var change = new Change(Change.EnType.Add, data.sic)
            currentSet.AddChange(change);
        }
        closePopupSic(sicPopup);
    }
    return false;
}

function toggleIsAnything(matchCtl, disable) {
    var opt = matchCtl.children("option[value='" + DMrule.EnMatchType.IsAnything + "']");
    if (disable)
        opt.attr('disabled', 'disabled');
    else
        opt.removeAttr("disabled");
}


function isValidSelect(data) {
    var valid = true;
    var unitCtl = $ID("sic-unit");
    var unitId = getSelectionValue(unitCtl);
    if (unitId == "") {
        highlightControl(unitCtl);
        valid = false;

    } else
        data.unitId = unitId;
    var appCtl = $ID("sic-appointment");
    var appointmentId = getSelectionValue(appCtl);
    if (appointmentId == "") {
        highlightControl(appCtl);
        valid = false;
    } else
        data.appointmentId = appointmentId;

    if (!valid) {
        dmAlert("Rule Validate", "please enter data in the empty fields highlighted red");
        return false;
    }
    return true;
}
function sicCopy(id, sic) {
    var box = $ID("copy-sic");
    var sicDesc = box.find(".sic-desc");
    sicDesc.html("Copy rule from " + getUnitAndAppointment(id));
    var submit = $CL("copy-sic-submit");
    submit.click(function () {
        var data = new Object();
        if (!isValidSelect(data))
            return; 
        var addId = data.appointmentId.replace("dw", "ac");
        sic.Id = addId;
        addNode(sic);
        var change = new Change(Change.EnType.Add, sic)
        currentSet.AddChange(change);
        box.dialog("close");
        return false;

    });
    var cancel = $CL("copy-sic-cancel");
    cancel.click(function () {
        box.dialog("close");
    });
    box.dialog({
        title: "Copy Sic",
        modal: true,
        resizable: false,
        close: function () {
            submit.off("click");
            sicDesc.html("");
        }
    });
    box.dialog("open");

}

function getUnitAndAppointment(id) {
    var divId = "dw" + getAppointmentGenId(id);
    var $div = $ID(divId);
    var $tdAppName = $div.parent().prev();
    var unitName = null;
    var appointmentName = null;
    //get the unit name
    var unitId = "un" + getUnitGenId(id);
    var $unit = $ID(unitId);
    var $unitTitle = $unit.children(".unit-title");
    return $unitTitle.html() + ", " + $tdAppName.children(".appointment").html();
}
function getPopup(id, sic, type) {
    
    var sicPopup = $ID("sic-popup");
    //var sicTitle = sicPopup.find(".sic-title");
    var sicTitle = (type == Change.EnType.Edit)? "Edit Rule" : "Create Rule";
    var sicDesc = sicPopup.find(".sic-desc");
    sicDesc.html("Create rule for " + getUnitAndAppointment(id));
    var sicList = sicPopup.find("#sic-list");
    sicPopup.list = sicList;
    clickRebind(sicPopup, ".btn-plus", function () { addEntry(sicList) });
    clickRebind(sicPopup, "#popup-sic-submit", function () {
        sicSave(id, type, sicPopup, sic)
    });
    clickRebind(sicPopup, "#popup-sic-cancel", function () {
        sicPopup.dialog("close");
    });

    var width = sicPopup.width();
    sicPopup.dialog({
            title: sicTitle,
            modal: true,
            width: 800,
            resizable: false,
            //autoResize:true,
            close: function () {
                sicCleanUp(sicPopup);
            }
            
//            function (event, ui) {
////                //alert("default close");
//                box.okBtn.off('click');
//                popupMsg.html("");
//            }
        });
        sicPopup.dialog("open");
    //var colorbox = $.colorbox({ href: "#sic-popup", inline: true, width: "700px", onCleanup: function () { sicCleanUp(sicPopup); } });
    return sicPopup;
}

function sicDelete(id) {
    action = function () {
        removeNode(id);
        var sic = new DMsic(id, ((id[0] == "i") ? DMsic.EnType.Action : DMsic.EnType.Action));
        var change = new Change(Change.EnType.Delete, sic);
        currentSet.AddChange(change);    
     };
    dmConfirm("Delete Rule", "Are you sure you want to delete this rule for " + getUnitAndAppointment(id), action);
}
function nodePlus() {
    var id = $(this)[0].id;
    var sicPopup = getPopup(id, null, Change.EnType.Add);
    return false;


}



function nodeEdit() {
    //alert("node edit");
    var id = $(this)[0].id;
    var sic = getSicData(id);
    var sicPopup = getPopup(id, sic, Change.EnType.Edit);
    sicPopulate(sicPopup, sic);
    return false;
}



function nodeMinus() {
    var id = $(this)[0].id;
    sicDelete(id);
}


function nodeCopy() {
    //alert("node copy");
    var id = $(this)[0].id;
    var sic = getSicData(id);
    sicCopy(id, sic);
}

