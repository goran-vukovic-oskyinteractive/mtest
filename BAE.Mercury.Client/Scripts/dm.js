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



var JQID = [{}, { "table": "it", "row": "ir", "text": "is", "edit": "ie", "del": "id", "copy": "ic" }, { "table": "at", "row": "ar", "text": "as", "edit": "ae", "del": "ad", "copy": "ac"}];


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

function StringBuilder(init) {

    var mem = "" + init;
    this.Append = function(s) {
        mem += s;
        this.Length = mem.length;
    };
    this.ToString = function() {
        return mem;
    };
    this.Length = mem.length;
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

    //this.Data = null;
    //this.LongName = null;
    this.Children = children;
    this.FinalizeData = function () {
        //this method exists so that node information is assembled only once
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




function setsLoad() {
    ajaxCall("SetsGet", null, setsPopulate);
}

function isSetChanged() {
    return (changeList && changeList.Changes.length > 0)
}

function setLoad() {
    if (isSetChanged()) {
        alert("you have changes! please press cancel button to clear the changes");
    }
    else
        treeLoad(this.id);
    return false;
}

function setLock(id, lock) {
    ajaxCall("SetLock", { i: id, l:lock }, function () { alert("the set has been " + ((lock) ? "" : "un") + "locked") });

}

function highlightedSetGetId() {
    //what set is highlighted
    var highlighted = $(".open");
    if (!highlighted[0]) {
        dmAlert("Please select a set before clicking this button");
        return null;
    }
    var span = highlighted.find(".set-name");
    return span[0].id;

}

function setAlertMessage(box, message) {
    var title = box.find("h3");
    title.html(message);
    return title;
}
function dmAlert(message) {

    var boxId = "dm-alert";
    var box = $ID(boxId);
    var title = setAlertMessage(box, message);
    var okBtn = box.find(".answer-ok");
    okBtn.click(function () {
        cbox.close();
        return false;

    });
    var colorbox = $.colorbox({ href: "#" + boxId, inline: true, width: "700px",
        onCleanup: function () {
            title.html("");
        }
    });
    
}

function dmConfirm(message, action) {
    var boxId = "dm-confirm";
    var box = $ID(boxId);
    var title = setAlertMessage(box, message);
    var okBtn = box.find(".answer-ok");
    okBtn.click(function () {
        cbox.close();
        action();
        return false;

    });
    var colorbox = $.colorbox({ href: "#" + boxId, inline: true, width: "700px",
        onCleanup: function () {
            title.html("");
            okBtn.off('click');
        }
    });
    $("#cboxLoadingOverlay").remove();
    $("#cboxLoadingGraphic").remove();

}

function dmPrompt(message, action) {

    var boxId = "dm-prompt";
    var box = $ID(boxId);
    var title = setAlertMessage(box, message);
    var okBtn = box.find(".answer-ok");
    var input = $ID("dm-input-box");
    okBtn.click(function () {
        var val = input.attr("value").trim();
        if (val.length <= 0) {
            // error validation 
            alert('Please ensure the Set Name is not empty');
            $CL('required').css('border', '1px solid red');
            return false;
        }
        //var data = new Object()
        //data.n = val;
        action(val);
        cbox.close();
        return false;

    });
    var colorbox = $.colorbox({ href: "#" + boxId, inline: true, width: "700px",
        onCleanup: function () {
            title.html("");
        }
    });
    $("#cboxLoadingOverlay").remove();
    $("#cboxLoadingGraphic").remove();
}

//save cancel
function setSave() {
    if (!isSetChanged()) {
        dmAlert("There is nothing to save");
        return;
    } else {
        alert("save");
        //    var id = highlightedSetGetId();
        //    setAction(id, $CL("copy-yes"), null, "SetCopy", "#copy-set", $CL("copy-no"));
        //var id = highlightedSetGetId();
        var myJsonString = JSON.stringify(changeList);
        var action = function () {
            ajaxCall("SetSave", { data: myJsonString }, function () {
                dmAlert("your changes have been successfully applied");
                changeList.Changes.length = 0;
            });
        }


        dmConfirm("Do you wish to save the changes?", action)
    }
}
/*
function setSave1() {
    if (!isSetChanged()) {
        alert("nothing to save");
        return;
    } else {


        $CL("save-yes").click(function () {
            var myJsonString = JSON.stringify(changeList);
            cbox.close();
            ajaxCall("SetSave", { data: myJsonString }, function () {
                //alert("your changes have been successfully applied");
                changeList.Changes.length = 0;
            });
            return false;

        });

        $CL("save-no").click(function () {
            cbox.close();
        });

        var colorbox = $.colorbox({ href: "#save-set", inline: true, width: "700px",
            onCleanup: function () {
                $CL("save-yes").off('click');
            }
        });
    }
}
*/
function setCancel() {
    if (!isSetChanged()) {
        dmAlert("nothing to cancel");
        return;
    } else {
        //var id = highlightedSetGetId();
        var action = function () {
                if (changeList && changeList.Changes.length > 0) {
                    setLock(changeList.Id, false);
                    treeLoad(changeList.Id);
                }
        }

        dmConfirm("Do you wish to save the changes?", action)

    }
}

/*
function setAction1(id, actionBtn, input, action, href, cancelBtn, activate) {
    if (cancelBtn) cancelBtn.click(function () {
        cbox.close();
        return false;
    });
    actionBtn.click(function () {
        var data = new Object;
        if (id) data.i = id;
        if (input) {
            var val = input.attr("value").trim();
            if (val.length <= 0) {
                // error validation 
                alert('Please ensure the Set Name is not empty');
                $CL('required').css('border', '1px solid red');
                return false;
            }
            data.n = val;
        }
        if (typeof activate == "boolean")
            data.a = activate;
        cbox.close();
        ajaxCall(action, data, setsPopulate);
        return false;

    });

    $CL('required').css('border', 0);

    var colorbox = $.colorbox({ href: href, inline: true, width: "700px",
        onCleanup: function () {
            actionBtn.off('click');
        }, onComplete: function () {

            if (input) {
                input.val("");
                input.focus();
            }
       }


    });

    $("#cboxLoadingOverlay").remove();
    $("#cboxLoadingGraphic").remove();
    return false;
    
}
*/



function setAdd() {
    alert("add");
    var action = function (data) { ajaxCall("SetAdd", data, setsPopulate); }
    dmPrompt("Please enter the set name", action)
    //setAction(null, $CL("add-set-submit"), $ID("set-name-add"), "SetAdd", "#add-set");
}
/*
function setAdd1() {
    alert("add");
    setAction(null, $CL("add-set-submit"), $ID("set-name-add"), "SetAdd", "#add-set");
}
*/
function setEdit() {
    alert("edit");
    var id = highlightedSetGetId();
    if (!id)
        return;
    var action = function (text) {
        var data = new Object();
        data.i = id;
        data.n = text;
        ajaxCall("SetEdit", data, setsPopulate);
    }
    dmPrompt("Please enter the set name", action)
}
/*
function setEdit1() {
    alert("edit");
    var id = highlightedSetGetId();
    setAction(id, $CL("edit-set-submit"), $("#set-name-edit"), "SetEdit", "#edit-set");
}
*/

function setDelete() {
    alert("delete");
    var id = highlightedSetGetId();
    if (!id)
        return;
    var action = function () { ajaxCall("SetDelete", { i: id }, setsPopulate); }
    dmConfirm("Do you wish to delete this set?", action)
}

function setCopy() {
    alert("copy");
    var id = highlightedSetGetId();
    if (!id)
        return;
    var action = function () { ajaxCall("SetCopy", { i: id }, setsPopulate); }
    dmConfirm("Do you wish to make a copy of this set?", action)

}


function setSet() {
    alert("activate");
    var $that = $(this);
    var cl = $that.attr("class");
    var off = cl.indexOf("off");
    var stateOn = (off < 0);
    var span = $ID("set-activation-status");
    var status = (!stateOn) ? "ACTIVATE" : "DEACTIVATE";

    var id = this.id; //highlightedSetGetId();
    var action = function () { ajaxCall("SetSet", { i: id, a: stateOn}, setsPopulate); }
    dmConfirm("Do you wish to " + status + " this set?", action);



}

/*
function setSet() {
    var $that = $(this);
    var cl = $that.attr("class");
    var off = cl.indexOf("off");
    var stateOn = (off < 0);
    var span = $ID("set-activation-status");
    var status = (!stateOn) ? "ACTIVATE" : "DEACTIVATE";

    span.html(status);
    setAction(this.id, $CL("activate-yes"), null, "SetSet", "#activate-set", $CL("activate-no"), stateOn);
    
}

*/


function setsPopulate(data) {
    var setList = $("#setbox-list");
    setList.empty();
    setList.append(data);
    clickRebind(setList, "li.set > div > a", expandLevel);
    clickRebind(setList, "[id^='s_']", setLoad);
    clickRebind(setList, ".checkbox", setSet);
}
function treeLoad(id) {
    var ids = id.split("_");
    changeList = new ChangeList(id);
    ajaxCall("SetGet", { i: id }, populateTree);
}

function ajaxCall(action, data, callBack) {
    var request = $.ajax({
        url: "DistributionManagement/" + action,
        type: "POST",
        data: data,
        dataType: "json"
    });
    request.done(function(html) {
        callBack(html);
    });
    request.fail(function(jqXHR, textStatus) {
        alert( "Request failed: " + textStatus );
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
    sicPopup.find("*").css("background-color", "inherit");
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

function populateAppointments() {
    
}
function populateTree(data) {
    ////alert(data);
    //get the graph
    //removeScroll();
    var graph = $("#graph");
    graph.empty();
    graph.append(data);

    clickRebind(graph, "[id^='aa_']", nodePlus);
    clickRebind(graph, "[id^='ie_']", nodeEdit);
    clickRebind(graph, "[id^='ae_']", nodeEdit);
    clickRebind(graph, "[id^='id_']", nodeMinus);
    clickRebind(graph, "[id^='ad_']", nodeMinus);
    clickRebind(graph, "[id^='ic_']", nodeCopy);
    clickRebind(graph, "[id^='ac_']", nodeCopy);
    $('.tooltip').hover(doToolTip);

    //populate the appointment list
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


$(document).ready(function () {

    // Tooltip
    //    $('.tooltip').hover(function (event) {
    //        event.preventDefault();
    //        $(this).children('span.tooltip-content').fadeToggle();
    //    });

    changeList = null;
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
        cbox.close();
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


})


