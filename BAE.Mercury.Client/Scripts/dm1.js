
function setSelectionValue(listbox, value) {
    listbox.val(value);
}
function getSelectionValue(listbox) {
    return parseInt(listbox.val());
}

function getTableTemplate() {
    return  $ID("sic-table-template");
}
function getTables(tableTemplate, id) {
    var genId = getAppointmentGenId(id);
    var tableTemplates = tableTemplate.find("table").clone();
    var tableI = tableTemplates.children().eq(0);
    var attrI = "it" + genId;
    tableI.attr("id", attrI);
    tableI.empty();
    var tableA = tableTemplates.children().eq(1);
    var attrA = "at" + genId;
    tableA.attr("id", attrA);
    tableA.empty();
    return tableTemplates;
}
function getRow(tableTemplate, id, data) {
    //alert('set data type');
    var jqIds = JQID[data.Type];
    var genId = getAppointmentGenId(id);
    //var row = rows[data.Type - 1].clone();
    var spanClass;
    var rowPos;
    if (data.Type == new DMsic().EnType.Info) {
        spanClass = "sic-info";
        rowPos = 0;
    } else {
        spanClass = "sic-action";
        rowPos = 1;
    }
    var row = tableTemplate.find("tr").eq(rowPos).clone();
    var spanName = row.find("span.sic");
    var name = data.LongName();
    spanName.html(name.toUpperCase());
    var spanData = row.find("span." + spanClass);
    var sicData = data.Data();
    spanData.html(sicData);
    var table = getTable(id, data.Type);
    var seqNo = getNewSeqNo(table);
    var seqId = genId + "_" + seqNo;
    var del = row.find(".delete");
    del.attr("id", jqIds.del + seqId);
    del.click(nodeMinus);
    var edit = row.find(".edit");
    edit.attr("id", jqIds.edit + seqId);
    edit.click(nodeEdit);
    //alert(row.attr("id"));
    var rowId = jqIds.row + seqId;
    row.attr("id", rowId);
    alert(row.attr("id"));
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
    else if (tables == 2)
        return false;
    else
        throw new Error("invalid number of tables");
}

function removeRow(genId, type) {
    var rowId = id.replace("", "");
    var rowOld = $ID(rowId);
}
function getTable(id, type) {
    var genId = getAppointmentGenId(id);
    var jqIds = JQID[type];
    return $ID(jqIds.table + genId);
}
function appendRow(row, id, type, name) {
    //append to table
    var table = getTable(id, type);
    //alert(table.attr("id"));
    var pos = insertPos(table, name);

    if (pos != -1) {
        ////alert("other rows");
        //table.find("tr").eq(pos).before(row);
        table.find("tr").eq(pos).before(row);
    } else {
        ////alert("no other rows");
        //we need the wrapping div
        table.append(row);

    }
}
function addNode(id, data) {
    //called from sicSve
    var tableTemplate = getTableTemplate();
    if (isEmptyAppointment(id)) {
        //getTables(tableTemplate, id);
        var tables = getTables(tableTemplate, id);
        var divWrap = getDivWrap(id);
        divWrap.empty();
        divWrap.append(tables);
    }
    //now we have tables, append the rows
    var name = data.LongName();
    var row = getRow(tableTemplate, id, data); //data.Type);
    appendRow(row, id, data.Type, name);

}
function updateNode(id, data) {
    removeNode(id);
    addNode(id, data);
}
function removeNode(id) {
    //we find the type by id
    var prefix = id[0];
    var type;
    if (prefix == "i")
        type = new DMsic().EnType.Info;
    else 
        type = new DMsic().EnType.Action;
    
    var table = getTable(id, type);
    var row = $ID(id.replace("d", "r"));
    row.remove();
    if (isEmptyAppointment(id)) {
        //we must replace it with empty div
        var emptyDiv = $("<div class='appointment-empty-wrap'><div class='appointment-empty'></div></div>");
        var wrapDiv = getDivWrap(id);
        wrpaDiv.append(id);
        
    }

    
}
function getPopup(id, sicData, type) {
//    var prefix = id.split("_")[0];
//    if (!(prefix == "aa"))
//        throw new Error("invalid edit type");


    var sicPopup = $("#sic-popup");
    var sicList = sicPopup.find("#sic-list");
    sicPopup.list = sicList;
    clickRebind(sicPopup, ".btn-plus", function () { addEntry(sicList) });
    $("#popup-sic-save").click(function () { sicSave(id, type, sicPopup, sicData) });
    var colorbox = $.colorbox({ href: "#sic-popup", inline: true, width: "700px", onCleanup: function () { sicCleanUp(sicPopup); } });
    return sicPopup;
}

function nodePlus() {
    var id = $(this)[0].id;
    ////alert("nodePlus");
    var sicData = new SicData(null);
    var sicPopup = getPopup(id, sicData, 0);
    //(Privacy marking = CCCCC or Privacy marking = DDDDD) AND (SIC=BBBBBBB or SIC=FFFFFF)
    sicPopulate(sicPopup, sicData);
    return false;


}

function highlightControl(control) {
    control.css("background-color", "#faa");
}
function errorMessage(error) {
    alert(error);
    return null;
}

function sicValidate(sicPopup, data) {

    var valid = true;
    var found = false;
    var sicPopupType = sicPopup.find("#sic-type");
    var type = getSelectionValue(sicPopupType);
    //var data = new DMsic(type);
    data.Type = type;
    if (!(type == new DMsic().EnType.Action || type == new DMsic().EnType.Info)) {
        highlightControl(sicPopupType);
        valid = false;
    }
    sicPopup.list.find("[id^='entry']").each(function () {
        found = true;
        var ruleCtl = $(this).find(".rule");
        var rule = getSelectionValue(ruleCtl);
        if (rule < 1) {
            highlightControl(ruleCtl);
            valid = false;
        }
        var matchCtl = $(this).find(".match");
        var match = getSelectionValue(matchCtl);
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
        var entry = new Entry(rule, match, name);
        data.AddNode(entry);
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

function sicSave(id, action, sicPopup, oldData) {

    var data = new DMsic(null);
    if (sicValidate(sicPopup, data)) {
        if (action == 1) {
            if (!isEqual(data, oldData)) {
                updateNode(id, data);
            }
        }
        else
            addNode(id, data);
        closePopupSic(sicPopup);
    }
    return false;
}


function nodeEdit() {
    ////alert("node edit");
    var id = $(this)[0].id;
    var sicData = getSicData(id);
    var sicPopup = getPopup(id, sicData, 1);
    sicPopulate(sicPopup, sicData);
    return false;
}


function nodeMinus(nodeId) {
    var id = $(this)[0].id;

    removeNode(id);
}
