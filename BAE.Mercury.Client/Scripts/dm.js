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

/*
function Sic(id, type) { //simplified version of DMSic
    //var finalized 
    if (!(type == DMsic.EnType.Action || type == DMsic.EnType.Info))
        throw new Error("invalid sic type");
    if (!id)
        throw new Error("invalid sic id");
    var ids = id.split("_");
    if (ids.length < 4)
        throw new Error("invalid sic id");
    this.Type = type;
    this.Id = id;
    this.Children = [];
    this.AddRule = function (rule) {
        if (!(rule instanceof DMrule))
            throw new Error("invalid SIC rule");
        var index = insertIndex(this.Children, rule);
        //we also need to sort this
        this.Children.splice(index, 0, rule);
    }
    var insertIndex = function (rules, rule) {
        for (var i = 0; i < rules.length; i++) {
            if (compare(rules[i], rule) < 0) {
                return i;
            }
        }
        return -1;
    }
    var compare = function (rule1, rule2) {
        if (rule1.RuleType < rule2.RuleType)
            return -1;
        else if (rule1.RuleType == rule2.RuleType) {
            if (rule1.MatchType < rule2.MatchType)
                return -1;
            else if (rule1.MatchType == rule2.MatchType) {
                var str1 = rule1.Name.toLowerCase();
                var str2 = rule2.Name.toLowerCase();
                if (str1 < str2)
                    return -1;
                else if (str1 < str2) {
                    return 0;
                }
                else
                    return 1;
            }
            else
                return 1;
        }
        else
            return 1;
    }
}

*/

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


/*
var test = new DMsic("aaaa", DMsic.EnType.Action);


//alert(test.Id); alert(test.Type);
var data = test.Data;
//alert(data);
var rule = new DMrule("zzzz", DMrule.EnRuleType.SIC, DMrule.EnMatchType.Equal);
test.AddNode(rule);
var rule1 = new DMrule("zzzz", DMrule.EnRuleType.PrivacyMarking, DMrule.EnMatchType.Equal);
test.AddNode(rule1);
var rule2 = new DMrule("zzzz", DMrule.EnRuleType.SIC, DMrule.EnMatchType.Equal);
test.AddNode(rule2);
var data = test.Data;
//test.FinalizeData();
//alert(data);
*/


function loadSets() {
    ajaxCall("GetSets", null, populateSets);
}

function isSetChanged() {
    return (changeList && changeList.Changes.length > 0)
}

function loadSet() {
    if (isSetChanged()) {
        alert("you have changes! please press cancel button to clear the changes");
    }
    else
        loadTree(this.id);
    return false;
}

function lockSet(id) {
    ajaxCall("LockSet", { i: id }, function () { alert("the set has been locked") });

}






function saveSet() {
    if (!isSetChanged()) {
        alert("nothing to save");
        return;
    } else {
        var myJsonString = JSON.stringify(changeList);


        $CL("save-yes").click(function () {
            cbox.close();
            //alert("save");
            ajaxCall("SaveSet", { data: myJsonString }, function () {
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

function copySic(id, sic) {
    //var appointmentList = sicPopup.find("#sic-appointment");
    $CL("copy-sic-yes").click(function () {
        var appCtl = $ID("sic-appointment");
        var appointmentId = getSelectionValue(appCtl);
        cbox.close();
        alert(appointmentId);
        var addId = appointmentId.replace("dw", "aa");
        sic.Id = addId;
        var dmsic = ConvertSic(sic);
        addNode(dmsic);
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

function actionSet(id, clickBtn, input, action, href, activate) {
    clickBtn.click(function () {
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
        ajaxCall(action, data, populateSets);
        return false;

    });

    $CL('required').css('border', 0);
    if (input) {
        input.val("");
    }

    var colorbox = $.colorbox({ href: href, inline: true, width: "700px",
        onCleanup: function () {
            clickBtn.off('click');
        }
    });

    $("#cboxLoadingOverlay").remove();
    $("#cboxLoadingGraphic").remove();
    return false;
    
}






function addSet() {
    actionSet(this.id, $CL("add-set-submit"), $ID("set-name-add"), "AddSet", "#add-set");
}
function editSet() {
    actionSet(this.id, $CL("edit-set-submit"), $("#set-name-edit"), "EditSet", "#edit-set");
}



function copySet() {
    actionSet(this.id, $CL("copy-yes"), null, "CopySet", "#copy-set");
}

function deleteSet() {
    actionSet(this.id, $CL("delete-yes"), null, "DeleteSet", "#delete-set");
}

function setSet() {
    var $that = $(this);
    var cl = $that.attr("class");
    var off = cl.indexOf("off");
    var stateOn = (off < 0);
    var input = $ID("set-activation");
    var flag = (stateOn) ? "truez" : "falsez";
    input.val(flag);
    var span = $ID("set-activation-status");
    var status= (!stateOn)? "ACTIVATE" : "DEACTIVATE";
    span.html(status);
    actionSet(this.id, $CL("activate-yes"), null, "SetSet", "#activate-set", stateOn);
    

}




function populateSets(data) {
    var setList = $("#setbox-list");
    setList.empty();
    setList.append(data);
    clickRebind(setList, "li.set > div > a", expandLevel);
    clickRebind(setList, ".popup-inline-set", loadSet);
    clickRebind(setList, "[id^='s_']", loadSet);
    clickRebind(setList, ".checkbox", setSet);
    clickRebind(setList, "a.popup-set-edit", editSet);
    clickRebind(setList, "a.popup-set-delete", deleteSet);
    clickRebind(setList, "a.popup-set-copy", copySet);    
}
function loadTree(id) {
    var ids = id.split("_");
    changeList = new ChangeList(id);
    ajaxCall("GetSet", { i: id }, populateTree);
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


/*
function saveAll() {
    var hidden = $("<div id='cover'><img src='images/ajax-loader.gif' alt='please wait'/><p>please wait</p> </div>"); //style='background-color:green;position:absolute;left:0;top:0;height:100%;width:100%' 
    var body = $("body");

    var sjs = ""; // JSON.stringify(changes);
    body.append(hidden);
    throw new Error("fix **** url");
    //do an ajax call to save
    $.ajax({
        type: "POST",
        url: "~/DistributionManagement/Index",
        dataType: "json",
        success: function (data) {
            clear.length = 0;
            init(data);
        },
        error: function () {
            ////alert("fail");
        },
        data: { c: sjs}         //context: document.body
    }).done(function () {
    });

    return false;
}
*/

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
    var sicPopupNew = $("#sic-popup-new");
    sicPopupNew.remove();
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


    loadSets();


    $("#btn-save").click(function () {
        saveSet();
        return false;
    });
    $("#btn-cancel").click(function () {
        if (changeList && changeList.Changes.length > 0)
            loadTree(changeList.Id);
        return false;
    });
    $("#btn-add-set").click(function () {
        addSet();
        return false;
    });



    $("[id^=s_]").click(function () {

        loadTree(this.id);
        return;
    });


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


    $("[id^=ad_]").click(function () {
        //alert("minus");
        //loadTree(this.id);
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


