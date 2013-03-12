//var urlParts = window.location.href.split("/");
//var thisUrl =  "DistributionManagement/GetSet";

function loadSets() {
    ajaxCall("GetSets", null, populateSets);   
}

function loadSet() {
    //alert("OK");
    loadTree(this.id);
}
function test() {
    //alert("test");
}



//edit
//************
//div: #edit-set"
//button: .edit-set-submit
//input #set-name-edit"

function editSetName() {
    var id = this.id;
    $(".edit-set-submit").click(function () {
        var input = $("#set-name-edit");
        cbox.originalBorder = input.css('border');
        if (input.val().length == 0) {
            // error validation 
            alert('Please ensure the Set Name is not empty');
            input.css('border', '1px solid red');
            return false;
        }
        // pass validation
        cbox.close();
        alert("edit set" + id);
        //ajaxCall(
        return false;

    });
    var colorbox = $.colorbox({ href: "#edit-set", inline: true, width: "700px",
        onCleanup: function () {
            $(".edit-set-submit").off('click');
            var input = $("#set-name-edit");
            input.css('border', cbox.originalBorder);
        }
    });
}



//delete
//********************
//div:#delete-set
//button:.delete-yes


function deleteSet() {
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


//copy set
//*****************
//div:copy-set
//button:.copy-yes

function cloneSet() {
    var id = this.id;
    $(".copy-yes").click(function () {
        cbox.close();
        alert("clone" + id);
        return false;

    });


    var colorbox = $.colorbox({ href: "#copy-set", inline: true, width: "700px",
        onCleanup: function () {
            $(".copy-yes").off('click');
        }
    });
}

function populateSets(data) {
    var setList = $("#setbox-list");
    setList.empty();
    setList.append(data);
    clickRebind(setList, ".popup-inline-set", loadSet);
    clickRebind(setList, "[id^='s_']", loadSet);
    clickRebind(setList, "li.set > div > a", expandLevel);
    clickRebind(setList, "a.popup-set-edit", editSetName);
    clickRebind(setList, "a.popup-set-delete", deleteSet);
    clickRebind(setList, "a.popup-set-copy", cloneSet);
    
}
function loadTree(id) {
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

//    $.ajax({
//        type: "POST",
//        dataType: "json",
//        data: data,
//        url: "DistributionManagement/" + action,
//        //async: true,
//        success: function () { callBack(data) },
//        error: function (xhr, ajaxOptions, thrownError) {}, 
//        complete(function () {}
//        //alert("done");
//    });

    return false;
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
function Entry(rule, match, name) {
    this.Rule = rule;
    this.Name = name;
    this.Match = match;
}


function SicData(type) {
    this.Type = type;
    this.Children = [];
    //        var entry = {"type":data[i][0], "match":sicData[i][1], "name":longName.substr(sicData[i][2], sicData[i][3])};
    this.AddChild = function (entry) {
        this.Children.push(entry);
    }
}

//string name, bool readOnly, RuleType ruleType, MatchType matchType)
function DMrule(name, ruleType, matchType) {
    this.Name = name;
    this.RuleType = ruleType;
    this.MatchType = matchType;
    this.EnMatchType = { Equal: 1, StartsWith: 2 };
    this.EnRuleType = { SIC: 1, PrivacyMarking: 2 };
}
function DMsic(type) {
    this.EnType = { Action: 2, Info: 1 };
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
            if ((this.Children[this.Children.length - 1]).Rule == rule.Rule)
                this.longName += " OR ";
            else
                this.longName += ") AND (";
        }
        if (rule.Rule == (new DMrule()).EnRuleType.PrivacyMarking) {
            this.longName += "Privacy Marking";
        }
        else {
            this.longName += "SIC";
        }
        if (rule.Match == (new DMrule()).EnMatchType.StartsWith) {
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
        this.data += ((this.Children.length > 0) ? "," : "") + Format(rule.Rule, rule.Match, this.longName.length, rule.Name.length);
        this.longName += name;
        this.Children.push(rule);
    }

}

var changes = [];

function Change(type, id, parentId, name) {
    this.type = type;
    this.id = id;
    this.parentId = parentId;
    this.name = name;
}

function addChange(type, id, parentId, name) {
    var change = new Change(type, id, parentId, name);
    changes.push(change);
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


function sicPopulate(sicPopup, data) {
    var typeList = sicPopup.find("#sic-type");
    setSelectionValue(typeList, data.Type);
    //get the data
    var template = $("#sic-entry-template");
    for (var i = 0; i < data.Children.length; i++) {
        var entry = createEntry(sicPopup.list, template, data.Children[i], i);
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
    var graph = $("#graph");
    graph.empty();
    graph.append(data);
    clickRebind(graph, "[id^='aa_']", nodePlus);
    clickRebind(graph, "[id^='ie_']", nodeEdit);
    clickRebind(graph, "[id^='id_']", nodeMinus);
    clickRebind(graph, "[id^='ae_']", nodeEdit);
    clickRebind(graph, "[id^='ad_']", nodeMinus);

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

function createEntry(sicList, template, data, i) {
    var entry = template.clone(true);
    if (data) {
        if (!(data.Rule == new DMrule().EnRuleType.SIC || data.Rule == new DMrule().EnRuleType.PrivacyMarking))
            throw new Error("invalid sic");
        if (!(data.Match == new DMrule().EnMatchType.StartsWith || data.Match == new DMrule().EnMatchType.Equal))
            throw new Error("invalid sic match");
        if (data.Name.length <= 0)
            throw new Error("invalid data.name");
        var rule = entry.find(".rule");
        rule.prop("selectedIndex", data.Rule);
        var match = entry.find(".match");
        match.prop("selectedIndex", data.Match);
        var name = entry.find(".name");
        name.val(data.Name);
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
    var type = (id.split("_")[0] == "ae") ? new DMsic().EnType.Action : new DMsic().EnType.Info;
    var sicData = new SicData(type);
    var rowId = id.replace("e", "r");
    var row = $("#" + rowId);
    var nameSpan = row.find("span.sic")
    var longName = nameSpan.text();
    var spanClass;
    if (type == new DMsic().EnType.Info) {
        spanClass = ".sic-info";
    } else {
        spanClass = ".sic-action";
    }
    var cl = "span" + spanClass;
    var dataElement = row.find(cl);
    var text = dataElement.text();
    var data = eval(dataElement.text());
    //var template = $("#sic-entry-template");
    for (var i = 0; i < data.length; i++) {
        if (i > 25)
            throw new Error("too many entries");
        var entry = new Entry(data[i][0], data[i][1], longName.substr(data[i][2], data[i][3]));
        sicData.AddChild(entry);

    }
    return sicData;
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


$(document).ready(function () {



    $.ajaxSetup({
        cache: false
    });


    loadSets();

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
