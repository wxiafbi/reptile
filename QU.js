/*通用jquery 相关 操作功能！ xjs 2014-10-16*/
(function (window) {
    var JQ = window.JQ = function (fn, err) {
        var URL = JQ.url;
        var DATA = JQ.json;
        var PARAM = JQ.param;
        var hideloadding = JQ.hideloadding;
        var t = ajaxReq(URL, DATA, PARAM, hideloadding, fn, err);
        JQ.hideloadding = false;
    };

    var ajaxReq = function (URL, DATA, PARAM,hideloadding, fn, err) {

        if (!URL.length) {
            if (PARAM != undefined)
                URL = webRoot() + "/ServerAPI?" + PARAM + "" ;
            else
                URL = webRoot() + "/ServerAPI";
        }
        else {

            URL = URL

        }
        if (!hideloadding) {
            JQ.wait('show');
        }
        var Token = window.localStorage.getItem("Token");
        if (Token == undefined) {
            Token = '';
        }
        $.ajax({
            type: "POST",
            url: URL,
            data: DATA,
            dataType: "json",
            headers: {
                Token: Token
            },
            timeout: 10 * 1000,
            success: function (data) {
                if (data != undefined && data.TimeOut) {
                    //超时处理
                    top.location.href = retLogin();
                }
                else {
                    JQ.wait('hide');
                    fn(data);
                }
            },
            error: function (data, status) {
                JQ.wait('hide');
                if (data) {
                    if (err) {
                        if (status == 'timeout' || status == 'error')
                            err("网络连接超时");
                        else
                            err(data.responseText);
                    }
                }
            }
        });
    }

    //ajax new request 
    var webRoot = function () {
        return window.location.protocol + '//' + window.location.host;
    };

    JQ.loadfile = function (jslist, mkey) {
        var jsIndex = 0;
        for (var i in jslist) {
            names = jslist[i];

            var route = names.substring(0, names.lastIndexOf("."));
            var type = names.substring(names.lastIndexOf(".") + 1, names.length);
            var objTag;
            if (type == "js") {
                objTag = document.createElement('script');
                objTag.async = "async";
                objTag.id = route;
                objTag.src = "js/" + route + ".js";
            }
            else if (type == "css") {
                objTag = document.createElement('link');
                objTag.href = "css/" + route + ".css";
                objTag.rel = 'stylesheet';
                objTag.type = 'text/css';
                objTag.id = route + "_css";
            }
            var headObj = $(document.getElementsByTagName("head")[0]);
            var cssfile = headObj.find("#" + route + "_css").attr("type");
            var jsfile = headObj.find("#" + route).attr("src");
            if (type == "js") {
                if (jsfile == undefined) {
                    headObj.get(0).appendChild(objTag);
                    objTag.onload = objTag.onreadystatechange = function () {
                        if (!this.readyState || this.readyState == "complete" || this.readyState == "loaded") {
                            jsIndex++;
                            if (jsIndex == jslist.length) {
                                JQ.fun(mkey, events.load); //jsloadcomplete  
                            }
                        }
                    };
                }
                else {
                    jsIndex++;
                    if (jsIndex == jslist.length) {
                        JQ.fun(mkey, events.load); //jsloadcomplete  
                    }
                }
            }
            else if (type == "css") {
                if (cssfile == undefined)
                    headObj.get(0).appendChild(objTag);
            }
        }
    }

    JQ.loadpage = function (url, fn, err) {
        if (!navigator.onLine) {

            JQ.notice('web站点连接已断开', 'offline');
            return;
        }
        var URL = url + "?1=1&" + Math.random();
        var DATA = {};
        $.ajax({
            type: "get",
            url: URL,
            data: DATA,
            dataType: "html",
            success: function (data) {
                fn(data);
            },
            error: function (data) {
                //console.log("错误：" + URL + "<br>" + data.responseText);
                if (err != undefined)
                    err(data);
            }
        });
    }
    JQ.fun = function (mkey, funName, param) {
        //js eval  
        if (mkey == undefined) {
            JQ.notice('mkey is null please check it ');
            return;
        }
        if (mkey == "0")
            return;
        if (param == undefined || param == null)
            param = "";
        var fn = mkey + funName + "(" + param + ")";
        if (typeof (fn) == "string")
            window.eval(fn);
    }
    JQ.url = {};
    JQ.data = {};
    JQ.notice = function (r) {
        var html = "<div class='M_notice'>";
        html += "<div>" + r + "</div></div>";
        $("body").append(html);

        setTimeout(function () {
            $(".M_notice").animate({ opacity: '0', filter: 'progid:DXImageTransform.Microsoft.Alpha(opacity=0)' });
            setTimeout(function () { $(".M_notice").remove(); }, 500);
        }, 2500);
    }

    JQ.downfile = function (jsonData) {
        var url = webRoot() + "/ServerAPI";
        //window.open(url, '_blank'); //get
        var $form = $("<form id='download' method='post' target='ExportIframe' action='" + url + "'></form>");
        $('body').append($form);
        for (var k in jsonData){
            var input = document.createElement('input');
            input.type = 'hidden';
            input.name = k;
            input.value = jsonData[k];
            $('#download').append(input);
        }
        //add TokenInfo
        var tokenValue = window.localStorage.getItem("Token");
        if (tokenValue != undefined) {
            $('#download').append("<input type=\"hidden\" name=\"downToken\" value=\"" + tokenValue + "\">");
        }
        $('#download').submit();

        $("iframe[name=ExportIframe]").on("load", function () {
            var responseText = $("iframe")[0].contentDocument.body.getElementsByTagName("pre")[0].innerHTML;
            var r = JSON.parse(responseText);
            if (r.ErrCode == 1) {
                JQ.notice(r.ErrMsg);
            }
        })

        $('#download').remove();
    }

    JQ.openlayer = function (title, content, cssTxt, fn) {

        var contextHTML = "<div style='background-color:#fff;' class='openlayer-context' >" + content + "</div>";

        var bgHtml = "<div class='bglayer' style='display:none; width:100%;top:0px ;bottom:0px;z-index:9999999;position:fixed; background-color:#111;opacity:0.3;filter: progid:DXImageTransform.Microsoft.Alpha(opacity=30)'></div>";
        var titleHTML = "<div style='text-align: center;height:30px;line-height:30px;background-color:#ccc' class='openlayer-title'>" + title + "</div>";
        titleHTML = title == undefined ? titleHTML = "" : titleHTML;
        var contextHTML = "<div style='background-color:#000;' class='openlayer-context' >" + content + "</div>";
        var layerHtml = "<div class='openlayer' style='display:none; z-index:99999999;position:fixed;margin:auto;top:0px;bottom:0px;left:0px;right:0px;'>" + contextHTML + "</div>";
        var HTML = bgHtml + layerHtml;

        if ($("body .openlayer").get(0) == undefined) {
            $("body").append(HTML);
            var layerW = cssTxt.width != undefined ? parseInt(cssTxt.width) : 480;
            var layerH = cssTxt.height != undefined ? parseInt(cssTxt.height) : 270;

            $("body .openlayer").css({ width: layerW, height: layerH });
            $("body .bglayer").bind("click", function () { $("body .openlayer").remove(); $("body .bglayer").remove(); if (fn) { fn(); } });
            setTimeout(function () {
                $("body .openlayer").fadeIn(1000);
                $("body .bglayer").show();
            }, 100);
        }
        else {
            $("body .openlayer").remove();
        }
    };

    JQ.Countdown = function (r, type) {
        var html = "<div class='Countdown' style=' width:100%;top:300px;height:0px;z-index:999999999;position:fixed;'>";
        html += "<div class='content' style='padding:5px;max-width:300px ; border-radius:0px;line-height:30px  ;background:#000;opacity:0.5 ;filter: progid:DXImageTransform.Microsoft.Alpha(opacity=50);color:#fff; width:250px; margin:0px auto; text-align: center;  '>" + r + "</div></div>";
        if ($("body").find(".Countdown").get(0) == undefined) {
            $("body").append(html);
        }
        else {
            $("body").find(".Countdown .content").text(r);
        }
        if (type == 0) {
            setTimeout(function () {
                $(".Countdown").animate({ opacity: '0', filter: 'progid:DXImageTransform.Microsoft.Alpha(opacity=0)' });
                setTimeout(function () { $(".Countdown").remove(); }, 50);
            }, 100);
        }
    }

    //********************************************
    //加入通用弹出层
    JQ.showLayer = function (layerObj, fun) {
        var obj = layerObj;
        var bgHtml = "<div class='bglayer' style='display:none; width:100%;top:0px ;bottom:0px;z-index:0;position:fixed; background-color:#111;opacity:0.3 ;filter: progid:DXImageTransform.Microsoft.Alpha(opacity=30)'></div>";
        $("body").append(bgHtml);
        $(".bglayer").show();

        var oW = $(obj).width();
        var oH = $(obj).height();
        $(obj).height(10);
        obj.animate({ "width": oW, "height": oH }, 230);

        $(".bglayer").off("click");
        $(".bglayer").on("click", function () {
            obj.hide();
            $(".bglayer").remove();
            setTimeout(function () {
                obj.css({ "width": $(obj).width(), "height": oH });
            }, 100);
        });
        obj.show();
        if (fun != undefined) {
            fun();
        }
    };

    JQ.wait = function (type) {
        if (type.toString().toLowerCase() == 'show') {
            var bgHtml = "<div class='wait-loading' style=' width:100%;top:0px ;bottom:0px;z-index:9999999;position:fixed; background-color:#111;opacity:0 ;filter: progid:DXImageTransform.Microsoft.Alpha(opacity=0)'></div>";
            var showHtml = "<div class='wait-loading' style=' width:100%;top:0px ;bottom:0px;z-index:99999999;position:fixed;'><div style='height:100%; background:url(/View/Images/main/loading.gif) no-repeat 50% 50%'></div></div>";
            $("body").append(bgHtml + showHtml);
        }
        else if (type.toString().toLowerCase() == 'hide') {
            $("body .wait-loading").remove();
        }
    };

    // 提示框
    JQ.alert = function (r) {
        var bg = '', mes = '', imgs = '';
        if (r.code == 1) {
            bg = 'background-color: #31CD72;color: #ffffff;';
            imgs = '<img src="/View/Images/new/icon_tip1.png" />';
            mes = r.mes;
            setTimeout(function () {
                JQ.closeTips('.MW_alert');
            }, 2000);
        } else if (r.code == 2) {
            bg = 'background-color: #F56C6C;color: #ffffff;';
            imgs = '<img src="/View/Images/new/icon_tip2.png" />';
            mes = r.mes;
            setTimeout(function () {
                JQ.closeTips('.MW_alert');
            }, 5000);
        } else if (r.code == 3) {
            bg = 'background-color: #2F7CF6;color: #ffffff;';
            imgs = '<img src="/View/Images/new/icon_tip3.png" />';
            mes = r.mes;
            setTimeout(function () {
                JQ.closeTips('.MW_alert');
            }, 2000);
        } else if (r.code == 4) {
            bg = 'background-color: #F2B150;color: #ffffff;';
            imgs = '<img src="/View/Images/new/icon_tip4.png" />';
            mes = r.mes;
            setTimeout(function () {
                JQ.closeTips('.MW_alert');
            }, 2000);
        }
        var alertStr = '<div class="MW_alert" style="' + bg + '">' + imgs + mes + '</div>';
        $('body').append(alertStr);
    }

    // 操作框
    JQ.confirm = function (r, successFn, errFn) {
        var btnStr = '<span class="close">取消</span><span class="sure">确定</span>';
        var str = '<div class="MW_confirm"><div class="mask"></div>' +
            '<div class="MWB"><div class="MW_header">操作</div>' +
            '<div class="MW_mes">' + r.mes + '</div>' +
            '<div class="MW_btn">' + btnStr + '</div>' +
            '</div></div>';
        $('body').append(str);

        if (successFn) {
            $('.MW_confirm .sure').click(function () {
                successFn();
                JQ.closeTips('.MW_confirm');
            })
        }
        $('.MW_confirm .close').click(function () {
            if (errFn) {
                errFn();
            }
            JQ.closeTips('.MW_confirm');
        })
    }

    // 信息框
    JQ.message = function (mes) {
        var str = '<div class="MW_message"><div class="mask"></div>' +
            '<div class="MWB"><div class="MW_header">消息</div>' +
            '<div class="MW_mes">' + mes + '</div>' +
            '<div class="MW_btn" onclick="JQ.closeTips(\'.MW_message\')">关闭</div>' +
            '</div>' +
            '</div>';
        $('body').append(str);
    }

    // 关闭提示框
    JQ.closeTips = function (el) {
        $(el).remove();
    }

    // 删除框
    JQ.delete = function (el, mes, fn) {
        $('.MW_delete').remove();
        var top = $(el).offset().top - 96;
        var str = '<div class="MW_delete" style="top:' + top + 'px;">' +
            '<div class="inner">' +
            '<div class="mes"><i></i>' + mes + '</div>' +
            '<div class="btns"><span class="cancel">取消</span><span class="sure">确认</span></div>' +
            '</div>' +
            '<div class="arrow"></div>' +
            '</div>';
        $('body').append(str);
        var left = $(el).offset().left - $('.MW_delete').width() + 40;
        $('.MW_delete').css('left', left + 'px');
        event.stopPropagation();

        $('.MW_delete .cancel').click(function () {
            JQ.closeTips('.MW_delete');
        })

        $('.MW_delete .sure').click(function () {
            JQ.closeTips('.MW_delete');
            if (fn) {
                fn();
            }
        })
    }
    $(document).click(function (event) {
        var evt = event.srcElement ? event.srcElement : event.target;
        if ($(evt).parents().hasClass('MW_delete')) {
            return;
        }
        if ($(evt).hasClass('MW_delete')) {
            return;
        }
        JQ.closeTips('.MW_delete');
    })

    /**
     * 日期时间段(年月日)
     * @param {string} S_Ele 开始时间元素
     * @param {string} E_Ele 结束时间元素
     * @param {number} Default_Interval 默认间隔
     * @param {number} Max_Interval 最大间隔
     */
    JQ.DateSlot = function (S_Ele, E_Ele, Default_Interval, Max_Interval) {
        var Default_RangeDate = 3600 * 24 * 1000 * Default_Interval;
        var Max_RangeDate = Max_Interval ? 3600 * 24 * 1000 * Max_Interval : Max_Interval;
        $(S_Ele).datebox().datebox('calendar').calendar({ firstDay: 1 });
        $(E_Ele).datebox().datebox('calendar').calendar({ firstDay: 1 });
        $(S_Ele).datebox({
            formatter: myformatter, parser: myparser, width: 100, height: 30, editable: false, panelWidth: 200, panelHeight: 240,
            onChange: function (SelDate) {
                var Current_EndDate = $(E_Ele).datebox('getValue');
                // 结束时间范围重置
                var beginDate = new Date(SelDate);
                $(E_Ele).datebox().datebox('calendar').calendar({
                    firstDay: 1,
                    validator: function (date) {
                        if (Max_RangeDate) {
                            return SelDate <= myformatter(date) && date <= new Date(beginDate.getTime() + Max_RangeDate);
                        } else {
                            return SelDate <= myformatter(date);
                        }
                    }
                });
                if (Current_EndDate == '') {
                    if (Max_RangeDate && (Default_RangeDate > Max_RangeDate)) {
                        $(E_Ele).datebox('setValue', myformatter(new Date(beginDate.getTime() + Max_RangeDate)));
                    } else {
                        $(E_Ele).datebox('setValue', myformatter(new Date(beginDate.getTime() + Default_RangeDate)));
                    }
                } else {
                    if (new Date(Current_EndDate).getTime() < new Date(SelDate).getTime()) {
                        $(E_Ele).datebox('setValue', myformatter(new Date(beginDate.getTime() + Default_RangeDate)));
                    } else if (Max_RangeDate && (new Date(Current_EndDate).getTime() > (new Date(SelDate).getTime() + Max_RangeDate))) {
                        $(E_Ele).datebox('setValue', myformatter(new Date(beginDate.getTime() + Default_RangeDate)));
                    } else {
                        $(E_Ele).datebox('setValue', Current_EndDate);
                    }
                }
            }
        });
        $(E_Ele).datebox({
            formatter: myformatter, parser: myparser, width: 100, height: 30, editable: false, panelWidth: 200, panelHeight: 240,
        });
        $(S_Ele).datebox('setValue', myformatter(new Date(new Date().getTime() - Default_RangeDate)));
    }
    // 日期时间段(年月日 时分秒)
    JQ.DateTimeSlot = function (S_Ele, E_Ele, Default_Interval, Max_Interval, Default_Hour) {
        var Default_RangeDate = 3600 * 24 * 1000 * Default_Interval;
        var Max_RangeDate = Max_Interval ? 3600 * 24 * 1000 * Max_Interval : Max_Interval;
        $(S_Ele).datetimebox().datetimebox('calendar').calendar({ firstDay: 1 });
        $(E_Ele).datetimebox().datetimebox('calendar').calendar({ firstDay: 1 });
        $(S_Ele).datetimebox({
            formatter: formatDate, parser: parser, width: 160, height: 30, editable: false, panelWidth: 200, panelHeight: 250,
            onChange: function (SelDate) {
                var Current_EndDate = $(E_Ele).datetimebox('getValue');
                // 结束时间范围重置
                var beginDate = new Date(SelDate);
                $(E_Ele).datetimebox().datetimebox('calendar').calendar({
                    firstDay: 1,
                    validator: function (date) {
                        if (Max_RangeDate) {
                            return beginDate <= date && date <= new Date(beginDate.getTime() + Max_RangeDate);
                        } else {
                            return beginDate <= date;
                        }
                    }
                });
                if (Current_EndDate == '') {
                    if (Max_RangeDate && (Default_RangeDate > Max_RangeDate)) {
                        $(E_Ele).datetimebox('setValue', formatDate(new Date(beginDate.getTime() + Max_RangeDate)));
                    } else {
                        $(E_Ele).datetimebox('setValue', formatDate(new Date(beginDate.getTime() + Default_RangeDate)));
                    }
                } else {
                    if (new Date(Current_EndDate).getTime() <= new Date(SelDate).getTime()) {
                        $(E_Ele).datetimebox('setValue', formatDate(new Date(beginDate.getTime() + Default_RangeDate)));
                    } else if (Max_RangeDate && (new Date(Current_EndDate).getTime() > (new Date(SelDate).getTime() + Max_RangeDate))) {
                        $(E_Ele).datetimebox('setValue', formatDate(new Date(beginDate.getTime() + Default_RangeDate)));
                    } else {
                        $(E_Ele).datetimebox('setValue', Current_EndDate);
                    }
                }
            }
        });
        $(E_Ele).datetimebox({
            formatter: formatDate, parser: parser, width: 160, height: 30, editable: false, panelWidth: 200, panelHeight: 250,
        });
        Default_Hour = Default_Hour < 9 ? '0' + Default_Hour : Default_Hour;
        $(S_Ele).datetimebox('setValue', myformatter(new Date(new Date().getTime() - Default_RangeDate)) + ' ' + Default_Hour + ':00:00');
    }
})(window);