(function ($) {
    // jQuery plugin definition
    $.fn.popUpBox = function () {
        //{
        // merge default and user parameters
        var box = $(this);
        if (!box.length)
            throw new Error("popup html not found");
        var popupMsg = box.find(".popup-msg");
        if (!popupMsg.length)
            throw new Error("popup message not found");
        box.okBtn = box.find(".answer-ok");
        if (!box.okBtn.length)
            throw new Error("popup ok button not found");
        var closeDialog = function () {
            box.dialog("close");
            return false;
        }

        box.okBtn.click(closeDialog); //(function () { });
        //        var onClose = function (event, ui) {
        //            alert("default close");
        //            box.okBtn.off('click');
        //            popupMsg.html("");
        //            if (box.cancelBtn)
        //                box.cancelBtn.off('click');
        //            if (box.input)
        //                box.input.val("");
        //        }
        var dialog = box.dialog({
            modal: true,
            close: function (event, ui) {
                alert("default close");
                box.okBtn.off('click');
                popupMsg.html("");
            }
        });
        //params = $.extend(new Object(), params);
        // traverse all nodes
        this.each(function () {
            // express a single node as a jQuery object

            //alert(params.message);
        });
        var openDialog = function () {
            box.dialog("open");
        }
        var staticTextSet = function (title, message) {
            box.dialog({ title: title });
            popupMsg.html(message);
        }
        this.showAlert = function (title, message) {
            staticTextSet(title, message);
            openDialog();
        }

        var cancelBtnSet = function () {

            box.cancelBtn = box.find(".answer-cancel");
            if (!box.cancelBtn.length)
                throw new Error("popup cancel button not found");
            box.cancelBtn.click(closeDialog);

        }

        this.showConfirm = function (title, message, action) {
            staticTextSet(title, message);
            box.okBtn.off("click");
            box.okBtn.click(function () {
                alert("click override");
                action();
                closeDialog();
            });
            cancelBtnSet();
            box.defaultClose = box.dialog("option", "close");
            box.dialog({ close: function () {
                alert("custom close");
                box.cancelBtn.off('click');
                box.defaultClose.call();
            }
            });
            openDialog();
        }
        this.showPrompt = function (title, message, action, text) {
            staticTextSet(title, message);
            box.input = box.find(".dm-input-box");
            if (!box.input.length)
                throw new Error("popup input control not found");
            box.okBtn.off("click");
            box.okBtn.click(function () {
                alert("click override");
                var val = box.input.attr("value").trim();
                if (val.length <= 0) {
                    // error validation 
                    //                    alert('Please ensure the text box is not empty');
                    var popUp = $("#dm-alert").popUpBox();
                    popUp.showAlert("aaaa", "bbbbzzz");

                    $CL('required').css('border', '1px solid red');
                    return false;
                } else {
                    action(val);
                    closeDialog();
                }
            });
            cancelBtnSet();

            box.defaultClose = box.dialog("option", "close");
            box.dialog({ close: function () {

                alert("custom close");
                box.cancelBtn.off('click');
                if (box.input)
                    box.input.val("");
                box.defaultClose.call();
            }
            });

            openDialog();
        }
        return this;
    };
})(jQuery);


/*
function Alert(id) {
    var box = $ID(id);
    if (!box.length)
        throw new Error("popup html not found");
    var popupMsg = box.find(".popup-msg");
    if (!popupMsg.length)
        throw new Error("popup message not found");
    box.okBtn = box.find(".answer-ok");
    if (!popupMsg.length)
        throw new Error("popup ok button not found");
    box.okBtn.click(function () {
        return false;

    });
    box.dialog({
        //title: title,
        modal: true,
        close: function (event, ui) {
            box.okBtn.off('click');
        }
    });
    //ok button

    //dialog properties

    this.show = function (title, message) {
        if (!title)
            throw new Error("title must be provided");
        if (!message)
            throw new Error("message must be provided");
        box.dialog.title = title;
        popupMsg.html(message);
        box.dialog("open");
    }    
}

function Confirm() {
}


function Prompt() {
}


Confirm.prototype = new Confirm();
Confirm.prototype.constructor = Confirm;


Prompt.prototype = new Alert();
Prompt.prototype.constructor = Prompt;


function alertProtoype(id, title, message) {
    if (!title)
        throw new Error("title must be provided");
    if (!message)
        throw new Error("message must be provided");
    var boxId = id;
    var box = $ID(boxId);
    var popupMsg = box.find(".popup-msg");
    popupMsg.html(message);
    box.okBtn = box.find(".answer-ok");
    box.okBtn.click(function () {
        box.dialog("destroy");
        return false;

    });
    box.dialog({
        title: title,
        modal: true,
        close: function (event, ui) {
            box.okBtn.off('click');
        }
    });
    return box;

}

function mercuryAlert(title, message) {
    var box = alertProtoype("dm-alert", title, message);
    box.dialog("open");
    return;


}


function confirmPrototype(title, message, action) {
    var box = alertPrototype("dm-confirm", title, message);
    box.okBtn.click(function () {
        box.dialog("destroy");
        action();
        return false;

    });
    var cancelBtn = box.find(".answer-cancel");
    cancelBtn.click(function () {
        box.dialog().dialog("destroy");
        return false;

    });
    box.dialog.close = function (event, ui) {
        cancelBtn.off('click');
    }
    return box;
}

function dmConfirm(title, message, action) {

    var box = dmPopup("dm-confirm", title, message);
    box.dialog("open");
    return;

    box.okBtn.click(function () {
        box.dialog("destroy");
        action();
        return false;

    });
    var cancelBtn = box.find(".answer-cancel");
    cancelBtn.click(function () {
        box.dialog().dialog("destroy");
        return false;

    });
    box.dialog.close = function (event, ui) {
        cancelBtn.off('click');
    }

    box.dialog("open");
    return;

}


function promptPrototype(title, message, action, text) {
    var box = confirmProtoype("dm-prompt", title, message);
    box.okBtn.click(function () {
        var input = box.find("#dm-input-box");
        var val = input.attr("value").trim();
        if (val.length <= 0) {
            // error validation 
            alert('Please ensure the text box is not empty');
            //box//.find('.required').css('border', '1px solid red');
            highlightControl(input);
            return false;
        }
        //var data = new Object()
        //data.n = val;
        action(val);
        //okBtn.off('click');
        box.dialog("destroy");
        return false;

    });
    //    var cancelBtn = box.find(".answer-cancel");
    //    cancelBtn.click(function () {
    //        box.dialog().dialog("destroy");
    //        return false;

    //    });
    box.dialog.open = function (event, ui) {
        okBtn.off('click');
    }
    box.dialog.close = function (event, ui) {
        okBtn.off('click');
    }
}

function dmPrompt(title, message, action, text) {

    var box = dmPopup("dm-prompt", title, message);

    box.dialog("open");
    return;




    if (!title)
        throw new Error("title must be provided");
    if (!message)
        throw new Error("message must be provided");
    if (!action)
        throw new Error("action must be provided");
    var boxId = "dm-prompt";
    var box = $ID(boxId);
    var popupMsg = box.find(".popup-msg");
    popupMsg.html(message);
    var okBtn = box.find(".answer-ok");
    //    okBtn.click(function () {
    //        box.dialog("destroy");
    //        action();
    //        return false;

    //    });
    var cancelBtn = box.find(".answer-cancel");
    cancelBtn.click(function () {
        box.dialog().dialog("destroy");
        return false;

    });
    box.dialog({
        autoOpen: false,
        title: title,
        modal: true
    });


    okBtn.click(function () {
        var input = $ID("dm-input-box");
        var val = input.attr("value").trim();
        if (val.length <= 0) {
            // error validation 
            alert('Please ensure the text box is not empty');
            $CL('required').css('border', '1px solid red');
            return false;
        }
        //var data = new Object()
        //data.n = val;
        action(val);
        cbox.close();
        okBtn.off('click');
        return false;

    });

    box.dialog("open");
}
*/