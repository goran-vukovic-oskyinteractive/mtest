if (!String.prototype.trim) {
   String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g, '');};
}
var IE = navigator.appName == "Microsoft Internet Explorer";
var JQID = [{}, { "table": "it", "row": "ir", "text": "is", "edit": "ie", "del": "id" }, { "table": "at", "row": "ar", "text": "as", "edit": "ae", "del": "ad"}];

function $ID(id) {
    return $("#" + id);
}
function $CLASS(cl) {
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

function Sic(id, type) { //simplified version of DMSic
    if (!(type == DMsic.EnType.Action || type == DMsic.EnType.Info))
        throw new Error("invalid sic type");
    if (!id)
        throw new Error("invalid sic id");
    var ids = id.split("_");
    if (ids.length < 4)
        throw new Error("invalid sic id");
    this.Type = type;
    this.Id = id;
    this.Rules = [];
    this.AddRule = function (rule) {
        if (!(rule instanceof DMrule))
            throw new Error("invalid SIC rule");
        this.Rules.push(rule);
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
}

DMrule.EnMatchType = { Equal: 1, StartsWith: 2 };
DMrule.EnRuleType = { SIC: 1, PrivacyMarking: 2 };


function DMsic(id, type) {
    this.id = id;//can be null for new entries
    if (!(type == DMsic.EnType.Action || type == DMsic.EnType.Info))
        throw new Error("invalid type");
    this.Type = type;
    this.Children = [];
    this.longName = "(";
    this.data = "[";

    this.Data = function () {
        var text = this.data;
        return text + "]";
    }
    this.LongName = function () {
        return this.longName + ")";
    }
    this.AddNode = function (rule) {
        //var rule = DMrule(entry.name, entry.rule, entry.match);
        if (this.Children.length > 0) {
            if ((this.Children[this.Children.length - 1]).RuleType == rule.RuleType)
                this.longName += " OR ";
            else
                this.longName += ") AND (";
        }
        if (rule.RuleType == DMrule.EnRuleType.PrivacyMarking) {
            this.longName += "Privacy Marking";
        }
        else {
            this.longName += "SIC";
        }
        if (rule.MatchType == DMrule.EnMatchType.StartsWith) {
            this.longName += " starts with ";
        }
        else {
            this.longName += " = ";
        }
        var name = htmlEncode(rule.Name);
        //data for rules [rule type, match, start position, length]
        if (this.Children.length > 0) {
            var i = 6;
        }
        this.data += ((this.Children.length > 0) ? "," : "") + Format(rule.RuleType, rule.MatchType, this.longName.length, rule.Name.length);
        this.longName += name;
        this.Children.push(rule);
    }

}
DMsic.EnType = { Action: 2, Info: 1 };


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


        $(".save-yes").click(function () {
            cbox.close();
            //alert("save");
            ajaxCall("SaveSet", { data: myJsonString }, function () {
                //alert("your changes have been successfully applied");
                changeList.Changes.length = 0;
            });
            return false;

        });

        $(".save-no").click(function () {
            cbox.close();
        });

        var colorbox = $.colorbox({ href: "#save-set", inline: true, width: "700px",
            onCleanup: function () {
                $(".save-yes").off('click');
            }
        });
    }
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
                $('.required').css('border', '1px solid red');
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

    $('.required').css('border', 0);
    if (input) {
        input.val("");
    }

    var colorbox = $.colorbox({ href: href, inline: true, width: "700px",
        onCleanup: function () {
            $(clickBtn).off('click');
        }
    });

    $("#cboxLoadingOverlay").remove(); // css("display:none");
    $("#cboxLoadingGraphic").remove(); //.css("display:none");
    return false;
    
}






function addSet() {
    actionSet(this.id, $(".add-set-submit"), $("#set-name-add"), "AddSet", "#add-set");
}
function editSet() {
    actionSet(this.id, $(".edit-set-submit"), $("#set-name-edit"), "EditSet", "#edit-set");
}



function copySet() {
    actionSet(this.id, $(".copy-yes"), null, "CopySet", "#copy-set");
}

function deleteSet() {
    actionSet(this.id, $(".delete-yes"), null, "DeleteSet", "#delete-set");
}

function setSet() {
    var $that = $(this);
    var cl = $that.attr("class");
    var off = cl.indexOf("off");
    var stateOn = (off < 0);
    var input = $("#set-activation");
    var flag = (stateOn) ? "truez" : "falsez";
    input.val(flag);
    var span = $("#set-activation-status");
    var status= (!stateOn)? "ACTIVATE" : "DEACTIVATE";
    span.html(status);
//    if (confirm("Do you wish to change the state of this set to " + ((stateOn) ? "OFF" : "ON") + "?")) {
//        var id = this.id;
//        ajaxCall("SetSet", { i: id, s: stateOn }, populateSets);
//    }
    actionSet(this.id, $(".activate-yes"), null, "SetSet", "#activate-set", stateOn);
    

}




function deleteSetEx() {
    var id = this.id;
    if (confirm("Do you wish to delete this set?")) {
            ajaxCall("DeleteSet", { i: id }, populateSets);

        }
    return false;
    var id = this.id;
    $(".delete-yes").click(function () {
        cbox.close();
        alert("delete" + id);
        return false;

    });


    var colorbox = $.colorbox({ href: "#delete-set", inline: true, width: "700px",
        onCleanup: function () {
            $(".delete-yes").off('click');
        }
    });
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
    for (var i = 0; i < sic.Rules.length; i++) {
        var entry = createEntry(sicPopup.list, template, sic.Rules[i], i);
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


function populateTree(data) {
    ////alert(data);
    //get the graph
    //removeScroll();
    var graph = $("#graph");
    graph.empty();
    graph.append(data);
    clickRebind(graph, "[id^='aa_']", nodePlus);
    clickRebind(graph, "[id^='ie_']", nodeEdit);
    clickRebind(graph, "[id^='id_']", nodeMinus);
    clickRebind(graph, "[id^='ae_']", nodeEdit);
    clickRebind(graph, "[id^='ad_']", nodeMinus);
    //addScroll();

}


function addEntry(sicList) {
    //alert("add entry");
    //return;
    //var sicList =  $("#sic-list-new");
    var i = sicList.find("[id^='entry']").length; //[id^='msg_']
    var maxEntries = 15;
    if (i > maxEntries) {
        //alert("reached the maximum of " + maxEntries + " entries");
        return false;
    }
    var template = $("#sic-entry-template");
    var entry = createEntry(sicList, template, null, i);
    //clickRebind(entry, ".btn-minus", removeEntry);
    sicList.append(entry);
    return false;
}


function removeEntry(sicList, entryId) {
    //alert("remove entry");
    //var sicList =  $("#sic-list-new");
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
    var type = (id.split("_")[0] == "ae") ? DMsic.EnType.Action : DMsic.EnType.Info;
    var sic = new Sic(id, type);
    var rowId = id.replace("e", "r");
    var row = $("#" + rowId);
    var nameSpan = row.find("span.sic")
    var longName = nameSpan.text();
    var spanClass;
    if (type == DMsic.EnType.Info) {
        spanClass = ".sic-info";
    } else {
        spanClass = ".sic-action";
    }
    var cl = "span" + spanClass;
    var dataElement = row.find(cl);
    var text = dataElement.text();
    var data = eval(text);
    //var template = $("#sic-entry-template");
    for (var i = 0; i < data.length; i++) {
        if (i > 25)
            throw new Error("too many entries");
        var entry = new DMrule(longName.substr(data[i][2], data[i][3]), data[i][0], data[i][1]);
        sic.AddRule(entry);

    }
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

/*
function sicSave(id, action, sicPopup, oldData) {

    var data = new DMsic(id);
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
*/

$(document).ready(function () {


    changeList = null;

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


    //$(".inline").colorbox({inline:true, width:"50%"});

    $("[id^=s_]").click(function () {
        //alert("set" + this.id);

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

    /*
    $(".edit-set-submit").click(function (event) {
    event.preventDefault();
    var div = $("#add-set");
    var input = div.find("#set-name-add");
    if (input.val().length == 0) {
    // error validation 
    alert('Please ensure the Set Name is not empty');
    $('.required').css('border', '1px solid red');
    return (false);
    }
    // pass validation
    alert("Validation pass, submit form here");
    cbox.close();

    return false;
    });
    */
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
