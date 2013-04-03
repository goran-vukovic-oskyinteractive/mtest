//utility functions
if (!String.prototype.trim) {
    String.prototype.trim = function () { return this.replace(/^\s+|\s+$/g, ''); };
}
String.Format = function () {
    if (arguments.length < 1)
        throw new Error("invalid number of arguments");
    var format = arguments[0];
    for (var i = 1; i < arguments.length; i++) {
        var spec = "{" + (i - 1) + "}";
        if (format.indexOf(spec) < 0)
            throw new Error("invalid specifier for parameter #" + i);
        format = format.replace(spec, arguments[i]);
    }
    return format;
}


function StringBuilder(init) {

    var mem = "" + init;
    this.Append = function (s) {
        mem += s;
        this.Length = mem.length;
    };
    this.ToString = function () {
        return mem;
    };
    this.Length = mem.length;
}


function Log(entry) {
    
    if($.browser.msie)
        Debug.write(entry);
    //add for other browsers
}
function $ID(id) {
    return $("#" + id);
}
function $CL(cl) {
        return $("." + cl);
}

function Format(p1, p2, p3, p4) {
    return "[" + p1 + "," + p2 + "," + p3 + "," + p4 + "]";
}

function htmlEncode(value) {
    if (value) {
        var div = $('<div/>');
        return div.text(value).html();
    } else {
        return '';
    }
}


//classes
function DMrule(name, ruleType, matchType) {
    if (!(ruleType == DMrule.EnRuleType.SIC || ruleType == DMrule.EnRuleType.PrivacyMarking))
        throw new Error("invalid rule type");
    if (!(matchType == DMrule.EnMatchType.Equal || matchType == DMrule.EnMatchType.StartsWith))
        throw new Error("invalid match type");
    if (!name)
        throw new Error("invalid name");
    this.Name = name;
    this.RuleType = ruleType;
    this.MatchType = matchType;
    this.compareTo = function (rule) {
        if (this.RuleType < rule.RuleType)
            return -1;
        else if (this.RuleType == rule.RuleType) {
            if (this.MatchType < rule.MatchType)
                return -1;
            else if (this.MatchType == rule.MatchType) {
                return this.Name.toLowerCase().localeCompare(rule.Name.toLowerCase());
            }
            else
                return 1;
        }
        else
            return 1;
    };
}

DMrule.EnMatchType = { Equal: 2, StartsWith: 1 };
DMrule.EnRuleType = { SIC: 2, PrivacyMarking: 1 };
DMrule.compareTo = function (rule1, rule2) {
                        return rule1.compareTo(rule2);
                    }

function DMsic(id, type) {

    var id = id, type = type,
            finalized = false,
            children = []
    if (!id)
        throw new Error("invalid id");
    if (!(type == DMsic.EnType.Action || type == DMsic.EnType.Info))
        throw new Error("invalid type");

    this.Id = id;
    this.Type = type;

    this.Children = children;
    this.FinalizeData = function () {
        //this method is there so that node information is assembled only once
        if (finalized)
            throw new Error("this SIC was aleardy finalized");
        finalized = true;
        children.sort(DMrule.compareTo);
        var longNameSB = new StringBuilder("("), dataSB = new StringBuilder("[");
        for (var i = 0; i < children.length; i++) {
            var rule = children[i];
            if (i > 0) {
                if (this.Children[i - 1].RuleType == rule.RuleType)
                    longNameSB.Append(" OR ");
                else
                    longNameSB.Append(") AND (");
            }
            if (rule.RuleType == DMrule.EnRuleType.PrivacyMarking) {
                longNameSB.Append("Privacy Marking");
            }
            else {
                longNameSB.Append("SIC");
            }
            if (rule.MatchType == DMrule.EnMatchType.StartsWith) {
                longNameSB.Append(" starts with ");
            }
            else {
                longNameSB.Append(" = ");
            }
            var name = htmlEncode(rule.Name);
            //data for rules [rule type, match, start position, length]
            dataSB.Append(((i > 0) ? "," : "") + String.Format("[{0},{1},{2},{3}]", rule.RuleType, rule.MatchType, longNameSB.Length, name.length));
            longNameSB.Append(name);
        }
        this.LongName = longNameSB.ToString() + ")";
        this.Data = dataSB.ToString() + "]";
    }

    this.AddNode = function (rule) {
        if (!(rule instanceof DMrule))
            throw new Error("invalid SIC rule");        
        if (finalized)
            throw new Error("this SIC was aleardy finalized");
        if (this.Children.Count >= 25)
            throw new Error("maximum number of rules exceeded");
        children.push(rule);
    }

}
DMsic.EnType = { Action: 2, Info: 1 };

//global variables
var JQID = [{}, { "table": "it", "row": "ir", "text": "is", "edit": "ie", "del": "id", "copy": "ic", "add": "ia" }, { "table": "at", "row": "ar", "text": "as", "edit": "ae", "del": "ad", "copy": "ac", "add": "aa"}];

var currentSet = null;

//operations

function setsLoad() {
    ajaxCall("SetsGet", null, setsPopulate);
}

function isSetChanged() {
    return (currentSet && currentSet.HasChanges())
}
function isSetLocked() {
    return (currentSet && currentSet.IsLocked())
}



function setLoad() {
    if (isSetChanged()) {
        dmAlert("Unsaved Changes", "There are unsaved changes for the currently viewed set. The changes need to be saved or cancelled before another set can be viewed.");
    }
    else
        treeLoad(this.id);
	
}

function setLock(id, lock, refresh, alert) {
    ajaxCall("SetLock", { i: id, l: lock }, function () {
        if (refresh)
            treeLoad(id);
        if (alert)
            dmAlert("Lock Set", "The set has been " + ((lock) ? "" : "un") + "locked.")
    }
//    , function (message) {
//        dmAlert("Lock Set", message);
//    }
);

}

function highlightedSetGetId() {
    //what set is highlighted
    var highlighted = $(".open");
    if (!highlighted[0]) {
        dmAlert("Select Set", "Please select a set before clicking that button.");
        return null;
    } else {
        //only the set can be edited
    }
    var span = highlighted.find(".set-name");
    return span[0].id;

}


//save cancel
function setSave() {
    if (!isSetChanged()) {
        dmAlert("Save Set", "There are not any changes.");
        return;
    } else {
        //    var id = highlightedSetGetId();
        //    setAction(id, $CL("copy-yes"), null, "SetCopy", "#copy-set", $CL("copy-no"));
        //var id = highlightedSetGetId();
        var myJsonString = JSON.stringify(currentSet);
        var action = function () {
            ajaxCall("SetSave", { data: myJsonString }, function () {
                setLock(currentSet.Id, false, true, true);
            }
            //var zzz = JSON.parse(jqXHR.responseText);
            
            
            );

        }


        dmConfirm("Save Set", "Do you wish to save the changes?", action)
    }
}

function setCancel() {
    if (!isSetChanged()) {
        dmAlert("Cancel Changes", "There are not any changes");
        return;
    } else {
        //var id = highlightedSetGetId();
        var action = function () {
            if (currentSet && currentSet.HasChanges()) {
                setLock(currentSet.Id, false, true, true);
                //treeLoad(currentSet.Id);
            }
        }

        dmConfirm("Cancel Changes", "Do you wish to cancel the changes?", action)

    }
}


//function showDialog() {
//    $("#dialog-modal").dialog({

//        width: 600,
//        height: 400
//    });
//}

function setUnlock() {
    //    var popUp = $("#dm-alert").popUpBox();
    //    popUp.showAlert("aaaa", "bbbbzzz");
    //    var popUp = $("#dm-confirm").popUpBox();
//    popUp.showConfirm("aaaa", "bbbbzzz", function (val) { alert("here") });
    var popUp = $("#dm-prompt").popUpBox();
    popUp.showPrompt("aaaa", "bbbbzzz", function (val) { alert(val) });
//        alert("OK");
    //    $("#dm-alert").dialog("open");

//    //showDialog();
//    //$("#jqdialog").dialog("open");
    return;
    if (!isSetLocked()) {
        dmAlert("Unlock Set", "The set is not locked.");
        return;
    } else {
        //var id = highlightedSetGetId();
        var action = function () {
            if (currentSet) {
                setLock(currentSet.Id, false, true, true);
                //treeLoad(currentSet.Id);
            }
        }
        dmConfirm("Unlock Set", "Do you wish to unlock the set? You will lose all the changes.", action)

    }
}



function setAdd() {
    var action = function (name) { ajaxCall("SetAdd", { n: name }, setsPopulate); }
    dmPrompt("Add Set", "Please enter the name of the set.", action)
    //setAction(null, $CL("add-set-submit"), $ID("set-name-add"), "SetAdd", "#add-set");
}

function setEdit() {
    var id = highlightedSetGetId();
    if (!id)
        return;
    var $setboxList = $ID("setbox-list");
    var $set = $setboxList.find(".open");
    var $strong = $set.find(".set-name > strong");
    var text = $strong.html();
    var action = function (text) {
        var data = new Object();
        data.i = id;
        data.n = text;
        ajaxCall("SetEdit", data, setsPopulate);
    }
    dmPrompt("Edit Set Name", "Please enter the name of the set.", action, text);
}

function setDelete() {
    var id = highlightedSetGetId();
    if (!id)
        return;
    var action = function () { ajaxCall("SetDelete", { i: id }, setsPopulate); }
    dmConfirm("Delete Set", "Are you sure you want to delete this set?", action)
}

function setCopy() {
    var id = highlightedSetGetId();
    if (!id)
        return;
    var action = function () { ajaxCall("SetCopy", { i: id }, setsPopulate); }
    dmConfirm("Copy Set", "Do you wish to make a copy of this set?", action)

}


function setActivate() {
    var $that = $(this);
    var cl = $that.attr("class");
    var off = cl.indexOf("off");
    var stateOn = (off < 0);
    var span = $ID("set-activation-status");
    var status = (!stateOn) ? "ACTIVATE" : "DEACTIVATE";

    var id = this.id; //highlightedSetGetId();
    var action = function () { ajaxCall("SetActivate", { i: id, a: stateOn}, setsPopulate); }
    dmConfirm("Activate Set", "Do you wish to " + status + " this set?", action);



}



function setsPopulate(data) {
    var setList = $("#setbox-list");
    setList.empty();
    setList.append(data);
    clickRebind(setList, "li.set > div > a", expandLevel);
    clickRebind(setList, "[id^='s_']", setLoad);
    clickRebind(setList, ".checkbox", setActivate);
	init_ajax_complete();
	dm_ajax_completed();
}
function treeLoad(id) {
    ajaxCall("SetGet", { i: id }, populateTree);
}

function ajaxCall(action, data, onDone, onFail) {
    var request = $.ajax({
        url: "DistributionManagement/" + action,
        type: "POST",
        data: data,
        dataType: "json"
    });
    request.done(function(response) {
        onDone(response);
		dm_ajax_completed();
    });
    request.fail(function (jqXHR, error) {
        if (jqXHR.status == 1001 && onFail)
            onFail(jqXHR.responseText);
        else
            alert("Request failed: " + jqXHR.responseText);
    });


    return false;
}



var sortFunc = function (a, b) {
    if (a.toLowerCase() < b.toLowerCase()) return -1;
    else if (a.toLowerCase() > b.toLowerCase()) return 1;
    else return 0;
}


function clickRebind(parent, pattern, func) {
    parent.find(pattern).each(function () {
        $(this).click(func);
    });
}


function sicPopulate(sicPopup, sic) {
    var typeList = sicPopup.find("#sic-type");
    setSelectionValue(typeList, sic.Type);
    //get the data
    var template = $("#sic-entry-template");
    for (var i = 0; i < sic.Children.length; i++) {
        var entry = createEntry(sicPopup.list, template, sic.Children[i], i);
        sicPopup.list.append(entry);
    }
}

function sicCleanUp(sicPopup) {
    //sicChanged


    //    sicList.empty();
    //    
    sicPopup.find("#popup-sic-save").off('click');
    sicPopup.find(".btn-plus").off('click');
    var typeList = sicPopup.find("#sic-type");
    setSelectionValue(typeList, 0);
    sicPopup.find("input, select").css("background-color", "#fff");
    sicPopup.list.empty();
}


function doToolTip(event) {
    event.preventDefault();
    var node = $(this).children('span.sic');
    var text = node.html();
    var ch = $(this).children('span.tooltip-content');
    ch.html(text);
    ch.stop(true, true).fadeToggle("slow");
}

//function populateAppointments() {
//    
//}
function populateTree(data) {
    ////alert(data);
    //get the graph
    //removeScroll();
    var id = data.Id;
    var locked = data.Locked;
    var listUnitAppointments = data.ListUnitAppointments;
    currentSet = new Set(id, locked, listUnitAppointments);
    var unitListHtml = data.UnitListHtml;

    $sicUnit = $ID("sic-unit");
    $sicUnit.empty();
    $sicUnit.append(unitListHtml);

    var graph = $("#graph");
    graph.empty();
    graph.append(data.SetHtml);
    //var divSet = graph.children(".set");


    clickRebind(graph, "[id^='aa_']", nodePlus);
    clickRebind(graph, "[id^='ie_']", nodeEdit);
    clickRebind(graph, "[id^='ae_']", nodeEdit);
    clickRebind(graph, "[id^='id_']", nodeMinus);
    clickRebind(graph, "[id^='ad_']", nodeMinus);
    clickRebind(graph, "[id^='ic_']", nodeCopy);
    clickRebind(graph, "[id^='ac_']", nodeCopy);
    $('.tooltip').hover(doToolTip);

    //populate the appointment list

/*
    var appointmentList = $ID("sic-appointment");
    appointmentList.find("option:gt(0)").remove();


    var appointments = $("td.appointment");

    appointments.each(function () {
        var divName = $(this).children("div.appointment");
        var name = divName.html();
        var divId = $(this).next().children();
        //var divId = $(this).children("div");
        var id = divId.attr("id");
        var option = $("<option>" + name + "</option>");
        //var option = $("<option value='" + id + "'>" + name + "</option>");
        appointmentList.append(option);
        option.val(id);
        //alert(option.val());

    });


    //addScroll();
*/
}


function addEntry(sicList) {
    var i = sicList.find("[id^='entry']").length; //[id^='msg_']
    var maxEntries = 15;
    if (i > maxEntries) {
        alert("reached the maximum of " + maxEntries + " entries");
        return false;
    }
    var template = $("#sic-entry-template");
    var entry = createEntry(sicList, template, null, i);
    sicList.append(entry);
    return false;
}


function removeEntry(sicList, entryId) {
    var entry = sicList.find("#" + entryId);
    entry.remove();
    return false;
}

function changeEntry(name, ruleType) {
    switch (ruleType) {
        case DMrule.EnRuleType.PrivacyMarking:
            name.attr("maxlength", 128);
            break;
        case DMrule.EnRuleType.SIC:
            name.attr("maxlength", 8);
            break;
    }
}

function createEntry(sicList, template, rule, i) {
    var entry = template.clone(true);
    if (rule) {
        if (!(rule.RuleType == DMrule.EnRuleType.SIC || rule.RuleType == DMrule.EnRuleType.PrivacyMarking))
            throw new Error("invalid sic");
        if (!(rule.MatchType == DMrule.EnMatchType.StartsWith || rule.MatchType == DMrule.EnMatchType.Equal))
            throw new Error("invalid sic match");
        if (rule.Name.length <= 0)
            throw new Error("invalid data.name");
        var type = entry.find(".rule");
        setSelectionValue(type, rule.RuleType);
        var match = entry.find(".match");
        setSelectionValue(match, rule.MatchType);
        var name = entry.find(".name");
        var name = entry.find(".name");
        changeEntry(name, rule.RuleType);
        name.val(rule.Name);
    }
    //else we are adding a blank entry
    var entryId = "entry" + i;
    entry.attr("id", entryId);
    var del = entry.find(".btn-minus");
    del.attr("id", "d_" + entryId);
    del.click(function () { removeEntry(sicList, entryId); });
    return entry;
}

function getNewSeqNo(parentNode) {
    var seqNo = parseInt(parentNode.attr("sqn"));
    if (isNaN(seqNo))
        throw new Error("invalid sequence number");
    parentNode.attr("sqn", seqNo + 1);
    return seqNo;
    var m = 0;

    parentNode.find("span.sic").each(function () {
        var id = this.id;
        //split ids
        var levels = id.split('_');
        var r = parseInt(levels[levels.length - 1]);
        m = (r > m) ? r : m;
    });
    return m;
}

function insertPos(parentNode, name) {
    var pos = -1;
    parentNode.find("span.sic").each(function (index, that) {
        if (pos < 0) {
            var text = that.innerHTML; //assumed span is the first child
            var r = sortFunc(text, name);
            if (r >= 0) {
                pos = index;
            }
        }
    });
    return pos;
}




function getSicData(id) {
    //var ids = id.split("_");
    var type = (id[0] == "a") ? DMsic.EnType.Action : DMsic.EnType.Info;
    var sic = new DMsic(id, type);


    var rowId = id.replace("e", "r").replace("c", "r");
    var row = $ID(rowId);
    var dataAnchor = row.children("td.sic").children("a.tooltip");
    var nameSpan = dataAnchor.children("span.sic")
    var longName = nameSpan.text();
    var spanClass;
    if (type == DMsic.EnType.Info) {
        spanClass = ".sic-info";
    } else {
        spanClass = ".sic-action";
    }
    var cl = "span" + spanClass;
    var dataElement = dataAnchor.find(cl);
    var text = dataElement.text();
    var data = eval(text);
    for (var i = 0; i < data.length; i++) {
        if (i > 25)
            throw new Error("too many entries");
        var entry = new DMrule(longName.substr(data[i][2], data[i][3]), data[i][0], data[i][1]);
        sic.AddNode(entry);

    }
    sic.FinalizeData();
    return sic;
}


function closePopupSic(sicPopup) {
    $.colorbox.close();
    return;
}

function isEqual(data, oldData) {
    //to do
    return false;
}

function colorboxClose() {
    cbox.close();
}

$(document).ready(function () {

    // Tooltip
    //    $('.tooltip').hover(function (event) {
    //        event.preventDefault();
    //        $(this).children('span.tooltip-content').fadeToggle();
    //    });

    //    changeList = null;
    cbox = jQuery.colorbox;

    $.ajaxSetup({
        cache: false
    });


    setsLoad();

    //save/cancel
    $("#btn-save").click(function () {
        setSave();
        return false;
    });
    $("#btn-cancel").click(function () {
        setCancel();
        return false;
    });
    $("#btn-unlock").click(function () {
        setUnlock();
        return false;
    });

    //set operations
    $("#btn-add-set").click(function () {
        setAdd();
        return false;
    });

    $("a.popup-set-edit").click(function () {
        setEdit();
        return false;
    });
    $("a.popup-set-delete").click(function () {
        setDelete();
        return false;
    });

    $("a.popup-set-copy").click(function () {
        setCopy();
        return false;
    });
    $("a.popup-set-activate").click(function () {
        setActivate();
        return false;
    });




    //set select
    $("[id^=s_]").click(function () {

        treeLoad(this.id);
        return;
    });


    //miscellaneous
    $CL("answer-cancel").click(function () {
        colorboxClose();
    });


    /*
    $(".edit").click(function () {
    //alert("edit");
    return false;
    });

    $(".remove").click(function () {
    //alert("minus");
    return false;
    });
    $(".name").focus(function () {
    $(this).css("background-color", "inherit");
    return false;
    });
    */

    $("[id^=ad_]").click(function () {
        //alert("minus");
        //treeLoad(this.id);
        return;
    });


    $("#sic-unit").change(function () {
        var unitId = $('option:selected', $(this)).val()
        //reload the appointment list
        var list = currentSet.GetAppointmentList(unitId);
        var appointmens = $ID("sic-appointment");
        appointmens.empty();
        appointmens.append(list);
    });

    $(".col > .rule").change(function () {
        var that = $(this);
        var rule = getIntSelectionValue(that);
        var name = //$(this).parent("div").next().children("input");
        that.parent("div").next().next().children("input");
        changeEntry(name, rule)
    });

    $('.appointment .add .popup-inline').live('click', function (event) {
        event.preventDefault();
        var hidden_dom = $(this).attr('href');
        //ie7 fix
        if (ie7) {
            hidden_dom = hidden_dom.split('/');
            hidden_dom = hidden_dom[hidden_dom.length - 1];
        }

        if ($(hidden_dom).length > 0) {
            $.colorbox({
                inline: true,
                width: "700px",
                href: hidden_dom
            });
        }
    });

//    function showDialog() {
//        $("#dialog-modal").dialog({

//            width: 600,
//            height: 400,
//            open: function (event, ui) {
//                var textarea = $('<textarea style="height: 276px;">');
//                $(this).html(textarea);
//                $(textarea).redactor({ autoresize: false });
//                $(textarea).setCode('<p>Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>');
//            }
//        });
//    }

//    $("#btn-unlock").click(function () {
//        $("#jqdialog").dialog({ modal: false });
//        return false;
//    });


    $(function () {
        // this initializes the dialog (and uses some common options that I do)
        $("#jqdialog").dialog({ modal: false });

        // next add the onclick handler
    });

})


