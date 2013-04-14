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
    if (!(matchType == DMrule.EnMatchType.Equal || matchType == DMrule.EnMatchType.StartsWith || matchType == DMrule.EnMatchType.IsAnything))
        throw new Error("invalid match type");
    if (name == null)
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

DMrule.EnRuleType = { SIC: 2, PrivacyMarking: 1 };
DMrule.EnMatchType = { Equal: 2, StartsWith: 1, IsAnything: 3 };
DMrule.compareTo = function (rule1, rule2) {
                        return rule1.compareTo(rule2);
                    }

function DMsic(id, type) {

    if (!id)
        throw new Error("invalid id");
    if (!(type == DMsic.EnType.Action || type == DMsic.EnType.Info))
        throw new Error("invalid type");

    var type = type,
            finalized = false,
            children = [];

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
            } else if (rule.MatchType == DMrule.EnMatchType.Equal) {
                longNameSB.Append(" = ");
            } else {
                longNameSB.Append(" is anything ");
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
function setLockType() {
    return (currentSet && currentSet.LockType())
}






function toggleSetLockIcon(id, lockType) {
    var lock = (lockType != Set.EnLockType.Unlocked); //lock icon for locked by others and by current
    var setItem = $ID(id).parent("a").parent("div").parent("li");
    setItem.toggleClass("locked", lock);
    //propagate change to items below
    var units = setItem.find("li.child");
    units.toggleClass("lock", lock);
}

function setLockOn() {
    setLock(currentSet.Id, true, false, true);
    currentSet.SetLock(Set.EnLockType.LockedByCurrent);
}


function setLockOff() {
    //we just reload
    setLock(currentSet.Id, false, true, true);
}


function setLock(id, lock, refresh, alert) {
    ajaxCall("SetLock", { i: id, l: lock }, function () {
        if (refresh)
            treeLoad(id);

        //toggle set lock
        showLockBtn(lockBtnVisible(currentSet.LockType()));

        var parser = new DMidParser(id);
        var setId = "ss_" + parser.SetId;
        if (lock)
            toggleSetLockIcon(setId, lock); //on unlock we refresh the entire graph
        //toggle the set buttons
        showSetBtns(currentSet.LockType() == Set.EnLockType.Unlocked);

        if (alert)
            dmAlert("Lock Set", "The set has been " + ((lock) ? "" : "un") + "locked.")
    });

}

function highlightedSetGetId() {
    var highlighted = $ID("setbox-list").find(".active");
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
        var myJsonString = JSON.stringify(currentSet);
        var action = function () {
            ajaxCall("SetSave", { data: myJsonString }, function () {

                setLockOff(); 
            }

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
    var action = function () {
        if (currentSet && currentSet.HasChanges()) {
            setLockOff(); 
        }
    }

        dmConfirm("Cancel Changes", "Do you wish to cancel the changes?", action)

    }
}



function dmAlert(title, message) {
    var popUp = $("#dm-alert").popUpBox();
    popUp.showAlert(title, message);
}

function dmConfirm(title, message, action) {
    var popUp = $("#dm-confirm").popUpBox();
    popUp.showConfirm(title, message, action);
}
function dmPrompt(title, message, action, text) {
    var popUp = $("#dm-prompt").popUpBox();
    popUp.showPrompt(title, message, action, text);
}


function setUnlock() {
    var lockType = setLockType();
    if (lockType == Set.EnLockType.Unlocked)
        throw new Error("The set is not locked.");
    if (lockType == Set.EnLockType.LockedByCurrent)
        throw new Error("The set is already locked by you.");
    var action = function () {
        if (currentSet) {
            setLockOff();
        }
    }
    dmConfirm("Unlock Set", "Do you wish to unlock the set? You will lose all the changes.", action);

}


function setAddFail(text) {
    dmConfirm("Add Set", text + " Do you wish to try again?", setAdd);
}

function setAdd() {
    if (isSetChanged())
            alertUnsaved();
    else {
        var action = function (name) {
            ajaxCall("SetAdd", { n: name }, setsPopulate, setAddFail);

        }
        dmPrompt("Add Set", "Please enter the name of the set.", action);
    }
}

function setEditFail(text) {
    dmConfirm("Edit Set Name", text + " Do you wish to try again?", setEdit);
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
        ajaxCall("SetEdit", data, setsPopulate, setEditFail);
    }
    dmPrompt("Edit Set Name", "Please enter the name of the set.", action, text);
}

function setDelete() {
    var id = highlightedSetGetId();
    if (!id)
        return;
    var parser = new DMidParser(id);
    var active = $ID("sa_" + parser.SetId);
    var stateOn = active.hasClass("on");
    if (stateOn)
        dmAlert("Delete Set", "You cannot delete an active set");
    else {
        var action = function () { ajaxCall("SetDelete", { i: id }, setsPopulate); }
        dmConfirm("Delete Set", "Are you sure you want to delete this set?", action)
    }
}

function setCopy() {
    var id = highlightedSetGetId();
    if (!id)
        return;
    var action = function () { ajaxCall("SetCopy", { i: id }, setsPopulate); }
    dmConfirm("Copy Set", "Do you wish to make a copy of this set?", action)

}
function setMarkActive(id) {
    $("[id^='sa_']").removeClass("on");
    $ID(id).addClass("on");
//    alert(id);
}

function setActivate() {
    if (isSetChanged()) {
        //is this the same set
        if (this.id != currentSet.Id) {
            alertUnsaved();
            return false;
        }
    } else {

        var that = $(this);
        var stateOn = that.hasClass("on");
        if (!stateOn) {

            var id = this.id; 
            var action = function () { ajaxCall("SetActivate", { i: id }, function () { setMarkActive(id) }); }
            dmConfirm("Activate Set", "Do you wish to activate this set?", action);
        }
    }
    return false;


}

function alertUnsaved() {
    dmAlert("Unsaved Changes", "There are unsaved changes for the currently viewed set. The changes need to be saved or cancelled before another set can be selected.");
}

function nodeExpand(event) {
    var id = $(this).children("span")[1].id;
    if (isSetChanged()) {
        if (id != currentSet.Id)
            alertUnsaved();
    }
    else {
        
        var parser = new DMidParser(id);
        var unit = parser.UnitId;
        if (!unit) {
            //set
            expandLevel($(this), event);
        } else {
            //unit
        }

    }
    return false;
}



function nodeSelect(event) {
    if (isSetChanged()) {
        //is this the same set
        if (this.id != currentSet.Id) {
            alertUnsaved();
            return false;
        }
        //else do nothing
    }
    else {
        $('#setbox-list li div').removeClass('active');//.removeClass('open');
        $('#setbox-list li ul li').removeClass('active');
        var parser = new DMidParser(this.id);
        var unit = parser.UnitId;
        if (!unit) {
            //set
            var parent = $(this).parent("a");
            var i = 5;
            expandLevel(parent, event);
        } else {
            //unit
        }
        var parser = new DMidParser(this.id);
        if (parser.UnitId) {
            //unit
            var parent = $(this).parent("li");
            parent.addClass("active");
        } else {
            var parent = $(this).parent("a").parent('div');
            parent.addClass("active");
        }
        treeLoad(this.id);
    }
    return true;
}


function setsPopulate(data) {
    var setList = $("#setbox-list");
    setList.empty();
    showLockBtn(false);
    showSetBtns(false);
    setList.append(data);
    clickRebind(setList, "[id^='ss_']", nodeSelect);
    clickRebind(setList, "[id^='sa_']", setActivate);
    init_ajax_complete();
    dm_ajax_completed();
    var graph = $ID("graph");
    graph.empty();
    currentSet = null;
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
        //NOTE: this is for debug only
            dmAlert("Request failed", jqXHR.responseText);
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
        $(this).off('click');
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
    sicPopup.list.find(".rule:last").focus();
}

function sicCleanUp(sicPopup) {
    sicPopup.find("#popup-sic-submit").off('click');
    sicPopup.find("#popup-sic-cancel").off('click');
    var typeCtl = sicPopup.find("#sic-type");
    setSelectionValue(typeCtl, 0);
    typeCtl.css("background-color", "#fff");
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

function showLockBtn(show) {
    var lockBtn = $ID("btn-unlock");
    lockBtn.css("visibility", show ? "visible" : "hidden");
}

function lockBtnVisible(lockType) {
    switch (lockType) {
        case Set.EnLockType.Unlocked:
            return false;
        case Set.EnLockType.LockedByOthers:
            return true;
        case Set.EnLockType.LockedByCurrent:
            return false;
        default:
            throw new Error("invalid lock type");                    
    }
}
function showSetBtns(show) {
    var editSet = $ID("edit-set");
    editSet.css("visibility", (show) ? "visible" : "hidden");
}
function populateTree(data) {
    var id = data.Id;
    var lockType = data.LockType;
    var listUnitAppointments = data.ListUnitAppointments;
    var ticks = data.Ticks;
    currentSet = new Set(id, lockType, ticks, listUnitAppointments);
    var parser = new DMidParser(id);
    if (!parser.UnitId) {
        //set
        showLockBtn(lockBtnVisible(lockType));
        showSetBtns(lockType == Set.EnLockType.Unlocked);
    }
    else {
        showLockBtn(false);
        showSetBtns(false);
    }

    toggleSetLockIcon(id, lockType);

    var unitListHtml = data.UnitListHtml;

    $sicUnit = $ID("sic-unit");
    $sicUnit.empty();
    $sicUnit.append(unitListHtml);

    var graph = $("#graph");
    graph.empty();
    graph.append(data.SetHtml);


    clickRebind(graph, "[id^='aa_']", nodePlus);
    clickRebind(graph, "[id^='ie_']", nodeEdit);
    clickRebind(graph, "[id^='ae_']", nodeEdit);
    clickRebind(graph, "[id^='id_']", nodeMinus);
    clickRebind(graph, "[id^='ad_']", nodeMinus);
    clickRebind(graph, "[id^='ic_']", nodeCopy);
    clickRebind(graph, "[id^='ac_']", nodeCopy);
    $('.tooltip').hover(doToolTip);


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
    sicList.find(".rule:last").focus();
    return false;
}


function removeEntry(sicList, entryId) {
    var entry = sicList.find("#" + entryId);
    entry.remove();
    return false;
}

function changeRuleType(ruleType, matchCtl, nameCtl) {
    setSelectionValue(matchCtl, 0);
    switch (ruleType) {
        case 0:
            matchCtl.attr('disabled', 'disabled');
            nameCtl.attr('disabled', 'disabled');
            break;
        case DMrule.EnRuleType.PrivacyMarking:
        case DMrule.EnRuleType.SIC:
            matchCtl.removeAttr("disabled");
            if (ruleType == DMrule.EnRuleType.PrivacyMarking)
                toggleIsAnything(matchCtl, true);
            else
                toggleIsAnything(matchCtl, false);
            nameCtl.attr('disabled', 'disabled');
            break;
        default:
            throw new Exception("invalid rule type");
    }
}

function changeMatchType(ruleType, matchType, nameCtl) {
    nameCtl.val("");
    switch (matchType) {
        case 0:
            nameCtl.attr('disabled', 'disabled');
            break;
        case DMrule.EnMatchType.IsAnything:
            if (ruleType == DMrule.EnRuleType.SIC) {
                nameCtl.attr("maxlength", 0);
                nameCtl.attr('disabled', 'disabled');
            }
            else {
                throw new Error("invalid rule type");
            }
            break;
        case DMrule.EnMatchType.StartsWith:
        case DMrule.EnMatchType.Equal:
            switch (ruleType) {
                case DMrule.EnRuleType.PrivacyMarking:
                    nameCtl.attr("maxlength", 128);
                    nameCtl.removeAttr("disabled");
                    break;
                case DMrule.EnRuleType.SIC:
                    nameCtl.attr("maxlength", 8);
                    nameCtl.removeAttr("disabled");
                    break;
                default:
                    throw new Error("invalid rule type");
            }
            break;
        default:
            throw new Error("invalid match type");
    }
}


function createEntry(sicList, template, rule, i) {
    var entry = template.clone(true);
    var ruleCtl = entry.find(".rule");
    var matchCtl = entry.find(".match");
    var nameCtl = entry.find(".name");
    if (rule) {
        if (!(rule.RuleType == DMrule.EnRuleType.SIC || rule.RuleType == DMrule.EnRuleType.PrivacyMarking))
            throw new Error("invalid sic");
        if (!(rule.MatchType == DMrule.EnMatchType.StartsWith || rule.MatchType == DMrule.EnMatchType.Equal || rule.MatchType == DMrule.EnMatchType.IsAnything))
            throw new Error("invalid sic match");
        if (rule.Name == null)
            throw new Error("invalid data.name");
        setSelectionValue(ruleCtl, rule.RuleType);
        changeRuleType(rule.RuleType, matchCtl, nameCtl);
        setSelectionValue(matchCtl, rule.MatchType);
        changeMatchType(rule.RuleType, rule.MatchType, nameCtl);
        nameCtl.val(rule.Name);
    } else { //we are adding a blank entry
        setSelectionValue(ruleCtl, 0);
        changeRuleType(0, matchCtl, nameCtl);
        setSelectionValue(matchCtl, 0);
        changeMatchType(0, 0, nameCtl);
        //set focus on rule
    }
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
    //$.colorbox.close();
    sicPopup.dialog("close");
    return;
}

function isEqual(data, oldData) {
    //to do
    return false;
}

$(document).ready(function () {


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






    $("#sic-unit").change(function () {
        var unitId = $('option:selected', $(this)).val()
        //reload the appointment list
        var list = currentSet.GetAppointmentList(unitId);
        var appointmens = $ID("sic-appointment");
        appointmens.empty();
        appointmens.append(list);
    });



    $('option[disabled]').css({ 'color': '#cccccc' });
    $('select').each(function (it) {
        if (this.options[this.selectedIndex].disabled)
            this.onchange();
    });




    $(".col > .rule").change(function () {
        var that = $(this);
        var ruleType = getIntSelectionValue(that); 
        var matchCtl = that.parent("div").next().children(".match"); 
        setSelectionValue(matchCtl, 0);
        var nameCtl = that.parent("div").next().next().children("input");
        nameCtl.val("");
        nameCtl.attr("readonly", true);
        changeRuleType(ruleType, matchCtl, nameCtl);
        return false;
    });



    $(".col > .match").change(function () {
        var that = $(this);
        var ruleCtl = that.parent("div").prev().children(".rule");
        var ruleType = getIntSelectionValue(ruleCtl);
        var matchType = getIntSelectionValue(that);
        var nameCtl = that.parent("div").next().children("input");
        nameCtl.removeAttr("readonly");
        changeMatchType(ruleType, matchType, nameCtl);
    });


    window.onbeforeunload = function () {
        if (isSetChanged()) {
            return "You have unsaved changes! Please save or cancel the changes.";
        }
    }
    $(function () {
        $("#jqdialog").dialog({ modal: false });

    });




})
