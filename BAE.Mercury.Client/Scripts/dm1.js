function Change(type, sic) {

    if (!(type == Change.EnType.Delete || type == Change.EnType.Edit || type == Change.EnType.Add))
        throw new Error("invalid change type");
    this.Type = type;
    if (!(sic instanceof DMsic))
        throw new Error("invalid SIC");
    this.Sic = sic;
}

Change.EnType = { Delete: -1, Edit: 0, Add: 1 };

function ChangeList(id) {
    if (!id)
        throw new Error("invalid set id");    
    this.Id = id;
    this.Changes = [];
    this.AddChange = function (change) {
        if (!(change instanceof Change))
            throw new Error("invalid change");
        if (!change.Sic.Id)
            throw new Error("sic must have an id");
        if (change.Type == Change.EnType.Add || change.Type == Change.EnType.Edit) {
            if (change.Sic.Children.length <= 0)
                throw new Error("this sic must have rules");
        }
        this.Changes.push(change);
        //on first update notify the server
        if (this.Changes.length == 1)
            this.LockSet();
    }
    this.LockSet = function () {
        if (this.Changes.length > 0)
            setLock(this.Id, true);
    }

}

var changeList = null;

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
    var table = getTable(id, sic.Type);
    verifyNodeTag(table, "table");
    var seqNo = getNewSeqNo(table);
    var seqId = genId + "_0" + seqNo;
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

/*

function removeRow(genId, type) {
    var rowId = id.replace("", "");
    var rowOld = $ID(rowId);
}
*/
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
    var row = getRow(tableTemplate, id, sic); //data.Type);
    appendRow(row, id, sic.Type, name);

}
function updateNode(sic) {
    var id = sic.Id;
    removeNode(id);
    addNode(sic);
}
function removeNode(id) {
    //we find the type by id
    alert(id);
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

function highlightControl(control) {
    control.css("background-color", "#faa");
}

function errorMessage(error) {
    alert(error);
    return null;
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
        var typeCtl = $(this).find(".rule");
        var type = getIntSelectionValue(typeCtl);
        if (type < 1) {
            highlightControl(typeCtl);
            valid = false;
        }
        var matchCtl = $(this).find(".match");
        var match = getIntSelectionValue(matchCtl);
        if (match < 1) {
            highlightControl(matchCtl);
            valid = false;
        }
        var nameCtl = $(this).find(".name");
        var name = nameCtl.val();
        if (!name) {
            highlightControl(nameCtl);
            valid = false;
        }
        name = name.trim().toUpperCase();
        if (name.length <= 0) {
            highlightControl(nameCtl);
            valid = false;
        }
        if (valid) {
            var entry = new DMrule(name, type, match);
            change.sic.AddNode(entry);
        }
    });
    if (!valid) {
        errorMessage("please enter data in the empty fields highlighted red");
        return false;
    }
    if (!found) {
        errorMessage("there must be at least one entry");
        return false;
    }
    return true;
}
/*
function addDataToChangedList(type, data) {
}
function ConvertSic(sic) {
    var dmsic = new DMsic(sic.Id, sic.Type);
    for (var i = 0; i < sic.Children.length; i++) {
        dmsic.AddNode(sic.Children[i]);
    }
    return dmsic;
}
function getSicId(actionId) {
    
}
*/
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
                changeList.AddChange(change);

            }
        } else {
            //var dmsic = new DMsic(id, data.sic.Type);
            //var dmsic = ConvertSic(data.sic);
            addNode(data.sic);
            var change = new Change(Change.EnType.Add, data.sic)
            changeList.AddChange(change);
        }
        closePopupSic(sicPopup);
    }
    return false;
}

function sicCopy(id, sic) {
    //var appointmentList = sicPopup.find("#sic-appointment");
    $CL("copy-sic-yes").click(function () {
        var appCtl = $ID("sic-appointment");
        var appointmentId = getSelectionValue(appCtl);
        cbox.close();
        alert(appointmentId);
        var addId = appointmentId.replace("dw", "aa");
        sic.Id = addId;
        addNode(sic);
        var change = new Change(Change.EnType.Add, sic)
        changeList.AddChange(change);
        return false;

    });


    var colorbox = $.colorbox({ href: "#copy-sic", inline: true, width: "700px",
        onCleanup: function () {
            $CL("copy-sic-yes").off('click');
        }
    });
    $("#cboxLoadingOverlay").remove();
    $("#cboxLoadingGraphic").remove();

}


function getPopup(id, sic, type) {


    var sicPopup = $("#sic-popup");
    var sicList = sicPopup.find("#sic-list");
    sicPopup.list = sicList;
    clickRebind(sicPopup, ".btn-plus", function () { addEntry(sicList) });
    $("#popup-sic-save").click(function () { sicSave(id, type, sicPopup, sic) });
    var colorbox = $.colorbox({ href: "#sic-popup", inline: true, width: "700px", onCleanup: function () { sicCleanUp(sicPopup); } });
    return sicPopup;
}

/*
function getPopup(id, sic, type) {


    var sicPopup = $("#sic-popup");
    var sicList = sicPopup.find("#sic-list");
    sicPopup.list = sicList;
    clickRebind(sicPopup, ".btn-plus", function () { addEntry(sicList) });
    $("#popup-sic-save").click(function () { sicSave(id, type, sicPopup, sic) });
    var colorbox = $.colorbox({ href: "#sic-popup", inline: true, width: "700px", onCleanup: function () { sicCleanUp(sicPopup); } });
    return sicPopup;
}
*/
function nodePlus() {
    var id = $(this)[0].id;
    ////alert("nodePlus");
    //var sic = new Sic(null);
    var sicPopup = getPopup(id, null, Change.EnType.Add);
    //(Privacy marking = CCCCC or Privacy marking = DDDDD) AND (SIC=BBBBBBB or SIC=FFFFFF)
    //sicPopulate(sicPopup, sic);
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

    if (confirm("do you really want to delete this rule set?") == true) {
        removeNode(id);
        var sic = new DMsic(id, ((id[0] == "i") ? DMsic.EnType.Action : DMsic.EnType.Action));
        var change = new Change(Change.EnType.Delete, sic);
        changeList.AddChange(change);

    }
}


function nodeCopy() {
    alert("node copy");
    var id = $(this)[0].id;
    var sic = getSicData(id);
    sicCopy(id, sic);
}

function setFunctions(action, id, name) {


    $.ajax({
        type: "POST",
        dataType: "json",
        data: {
            i: id,
            n: name
        },
        url: "DistributionManagement/" + action,
        success: function (data) {
            init(data);
        },
        error: function (xhr, ajaxOptions, thrownError) {
            alert(xhr.status);
            alert(thrownError);
        }
    }).complete(function () {
    });

    return false;
}

