!function(e){function n(n){for(var t,i,s=n[0],l=n[1],p=n[2],d=0,u=[];d<s.length;d++)i=s[d],Object.prototype.hasOwnProperty.call(a,i)&&a[i]&&u.push(a[i][0]),a[i]=0;for(t in l)Object.prototype.hasOwnProperty.call(l,t)&&(e[t]=l[t]);for(c&&c(n);u.length;)u.shift()();return o.push.apply(o,p||[]),r()}function r(){for(var e,n=0;n<o.length;n++){for(var r=o[n],t=!0,s=1;s<r.length;s++){var l=r[s];0!==a[l]&&(t=!1)}t&&(o.splice(n--,1),e=i(i.s=r[0]))}return e}var t={},a={0:0},o=[];function i(n){if(t[n])return t[n].exports;var r=t[n]={i:n,l:!1,exports:{}};return e[n].call(r.exports,r,r.exports,i),r.l=!0,r.exports}i.m=e,i.c=t,i.d=function(e,n,r){i.o(e,n)||Object.defineProperty(e,n,{enumerable:!0,get:r})},i.r=function(e){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(e,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(e,"__esModule",{value:!0})},i.t=function(e,n){if(1&n&&(e=i(e)),8&n)return e;if(4&n&&"object"==typeof e&&e&&e.__esModule)return e;var r=Object.create(null);if(i.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:e}),2&n&&"string"!=typeof e)for(var t in e)i.d(r,t,function(n){return e[n]}.bind(null,t));return r},i.n=function(e){var n=e&&e.__esModule?function(){return e.default}:function(){return e};return i.d(n,"a",n),n},i.o=function(e,n){return Object.prototype.hasOwnProperty.call(e,n)},i.p="";var s=window.webpackJsonp=window.webpackJsonp||[],l=s.push.bind(s);s.push=n,s=s.slice();for(var p=0;p<s.length;p++)n(s[p]);var c=l;o.push([25,1]),r()}({25:function(e,n,r){"use strict";r.r(n),function(e){r(26),r(29),r(31),r(37),r(39),r(41),r(5),r(43),r(44),r(45),r(46);var n=r(4),t=r.n(n),a=r(10),o=r.n(a),i=(r(47),r(0)),s=r(7),l=r(6),p=r(11),c=r(12),d=r(13),u=r(14),m=r(15),f=r(16),g=r(17),h=r(18),b=r(19),v=r(20),x=r(21),y=r(22),w=r(23),S=r(24);o()(t.a),l.c.add(p.faBars,d.faPlus,u.faMinus,c.faInfo,m.faExclamationCircle,g.faCog,f.faQuestionCircle,h.faTwitterSquare,b.faFacebookSquare,v.faGooglePlusSquare,x.faGithubSquare,y.faFlickr,w.faYoutubeSquare,S.faInstagram),l.a.searchPseudoElements=!0,l.b.watch();var D,k,N,I,T,E,C="./sitesGeoJSON.json",O="https://nwis.waterservices.usgs.gov/nwis/iv/",M={},j=[],z=e({});function _(){e("#graphModal").modal("show")}function F(e){var n=new Date(e),r=""+(n.getMonth()+1),t=""+n.getDate(),a=n.getFullYear();return r.length<2&&(r="0"+r),t.length<2&&(t="0"+t),[a,r,t].join("-")}function P(){e("#graph-loading").show();var n=!1,r=[],a={format:"json"},o=e("#stationSelect").select2("data"),i=e("#parameterSelect").select2("data");if(0===o.length||0===i.length)return alert("You must choose at least one station and one parameter to continue"),void e("#graph-loading").hide();var s=e("input[name=timeSelect]:checked").val();if(e("#compareYears").prop("checked")&&(n=!0),"period"===s){var l=e("#timePeriodSelect").select2("data")[0].id;a.endDT=moment().format("YYYY-MM-DD"),a.startDT=moment().subtract(moment.duration(l)).format("YYYY-MM-DD")}else a.startDT=e("#startDate").val(),a.endDT=e("#endDate").val();var p=o.map(function(e){return e.value}).join(",");a.sites=p;var c=i.map(function(e){return e.value.split(":")[0]}).join(",");if(a.parameterCd=c,r.push(a),n){var d=JSON.parse(JSON.stringify(a));d.startDT=moment(a.startDT).subtract(1,"years").format("YYYY-MM-DD"),d.endDT=moment(a.endDT).subtract(1,"years").format("YYYY-MM-DD"),r.push(d)}E=[];var u=0;console.log("Processing",r.length,"requests"),e(r).each(function(a,o){console.log("url:",o),e.ajaxQueue({url:O,data:o,type:"GET",success:function(a){if(u+=1,a.value.timeSeries.length<=0)return alert("Found an NWIS site ["+p+"] but it had no data in waterservices for ["+c+"]"),void e("#graph-loading").hide();var o=a.value.queryInfo.criteria.timeParam.beginDateTime;e(a.value.timeSeries).each(function(r,t){e(t.values).each(function(r,o){var i,s=o.value.map(function(e){var n=new Date(e.dateTime)/1,r=e.value/1;return-1===e.qualifiers.indexOf("Mnt")&&-1===e.qualifiers.indexOf("Eqp")||(r=null,!0),[n,r]});i=o.method[0].methodDescription.length>0?t.sourceInfo.siteName+" | "+e("<div>").html(t.variable.variableName).text()+" | "+o.method[0].methodDescription:t.sourceInfo.siteName+" | "+e("<div>").html(t.variable.variableName).text();var l={showInLegend:!0,values:o,data:s,color:G(),siteID:t.sourceInfo.siteCode[0].value,siteName:t.sourceInfo.siteName,siteCode:t.name,variableDescription:t.variable.variableDescription,variableName:t.variable.variableName,unit:t.variable.unit.unitCode,name:i};n&&(l.name=a.value.queryInfo.note[1].value.split("INTERVAL[")[1].split("-")[0]+" | "+t.sourceInfo.siteName+" | "+e("<div>").html(t.variable.variableName).text()),E.push(l)})}),u===r.length&&function(n,r){console.log("seriesData",n,r),e("#graphContainer").html(""),e("#graphModal").modal("show"),t.a.setOptions({global:{useUTC:!1},lang:{thousandsSep:","}});var a={chart:{type:"line",spacingTop:20,spacingLeft:0,spacingBottom:0},plotOptions:{series:{pointStart:n,pointInterval:9e5}},title:{text:""},credits:{enabled:!1},tooltip:{shared:!0},xAxis:{type:"datetime",labels:{formatter:function(){return t.a.dateFormat("%m/%d %H%P",this.value)},align:"center",tickInterval:1728e5}},yAxis:[],series:[]};e(r).each(function(n,r){var t,o={title:{text:r.unit,style:{color:r.color}},labels:{style:{color:r.color}},opposite:(t=n,!!(t%2))},i=!1;e(a.yAxis).each(function(e,n){n.title.text==r.unit&&(i=!0)}),i||(r.yAxis=n,a.yAxis.push(o)),a.series.push(r)});t.a.chart("graphContainer",a);e("#graph-loading").hide()}(o,E)}})})}function G(){for(var e="#",n=0;n<6;n++)e+="0123456789ABCDEF"[Math.floor(16*Math.random())];return e}e(document).ready(function(){console.log("Application Information: production version 0.0.1"),e("#appVersion").html("Application Information: production version 0.0.1"),i.Icon.Default.imagePath="./images/",D=Object(i.map)("mapDiv",{zoomControl:!1,minZoom:8}),i.control.zoom({position:"topright"}).addTo(D),i.control.scale().addTo(D),N=Object(i.tileLayer)("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}",{attribution:"Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ",maxZoom:16}).addTo(D);var n,r,t,a=new Date;new Date(a.getTime()-6048e5);M.NexRad=Object(i.tileLayer)("https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png",{opacity:.5}),M.Precip=Object(i.tileLayer)("https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/q2-n1p-900913/{z}/{x}/{y}.png",{opacity:.5}),M.PrecipForecast1hr=Object(s.b)({url:"https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/wpc_qpf/MapServer",layers:[7],opacity:.5}),M.CloudCoverVisible=Object(i.tileLayer)("https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-vis-1km-900913/{z}/{x}/{y}.png",{opacity:.5}),M.Drought=i.tileLayer.wms("http://ndmc-001.unl.edu:8080/cgi-bin/mapserv.exe?map=/ms4w/apps/usdm/service/usdm_current_wms.map",{layers:"usdm_current",bboxSR:102100,imageSR:102100,format:"image/png",transparent:!0,f:"image",nocache:Date.now(),opacity:.5}),D.setView(["42.88","-76.60"],10),T=Object(i.featureGroup)().addTo(D),e.ajax({url:C,dataType:"json",success:function(n){var r=(k=n).features.map(function(e){return e.properties["Site ID"]}).join(",");e.getJSON(O,{format:"json",sites:r},function(n){console.log("NWIS IV Data:",n);var r=1;k.features.forEach(function(e){var t=!1;n.value.timeSeries.forEach(function(n){var a=n.name.split(":"),o=a[1],i=a[2],s="";o===e.properties["Site ID"]&&(t=!0,n.values.forEach(function(t){var a;s=i+":"+t.method[0].methodID,a=t.method[0].methodDescription.length>0?n.variable.variableDescription+", "+t.method[0].methodDescription:n.variable.variableDescription;var o={idx:String(r),pcode:i,desc:n.variable.variableDescription};j.some(e=>e.pcode===i)||(j.push(o),r+=1),s in e.properties||(e.properties[s]={},e.properties[s].value=t.value[0].value,-1===t.value[0].qualifiers.indexOf("Mnt")&&-1===t.value[0].qualifiers.indexOf("Eqp")&&-1===t.value[0].qualifiers.indexOf("Ssn")||(e.properties[s].value=null),e.properties.dateTime=t.value[0].dateTime,e.properties[s].dateTime=t.value[0].dateTime,e.properties[s].qualifiers=t.value[0].qualifiers,e.properties[s].description=a,e.properties[s].name=n.variable.variableName+", "+t.method[0].methodDescription)}))}),t||console.log("no data found for:",e.properties["Site ID"])});var t=Object(i.geoJSON)(k,{pointToLayer:function(n,r){!function(n){if(e("#legend > tbody").append('<tr class="site table-expander accordion-toggle" data-toggle="collapse" data-target=".siteData'+n.id+'" data-sitename="'+n["Station Name"]+'" data-id="'+n.id+'" data-siteid="'+n["Site ID"]+'"><td><div><icon class="siteIcon wmm-pin wmm-mutedblue wmm-icon-circle wmm-icon-white wmm-size-25" /></div></td><td><span class="siteName">'+n["Station Name"]+'</span><span class="ml-2 badge badge-success float-right">Get Data</span></td></tr>'),e("#legend .siteIcon").attr("style","margin-top: -6px !important; margin-left: 3px !important"),n.dateTime){var r=new Date(n.dateTime).toLocaleString(),t='<tr class="siteData'+n.id+' accordian-body collapse"><td colspan="2"><table class="table table-sm mb-0"><tbody><tr><th colspan="2">Most recent values as of: '+r+"</th><tr>";e.each(n,function(e,r){var a=e.split(":")[0];/^\d+$/.test(a)&&5===a.length&&(t+='<tr style="padding: 0 !important;" class="site siteData" data-sitename="'+n["Station Name"]+'" data-id="'+n.id+'" data-siteid="'+n["Site ID"]+'" data-pcode_tsid="'+e+'"><td>'+r.name+"</td><td>"+r.value+"</td></tr>")}),t+="</tbody></table></td><tr>",e("#legend > tbody").append(t)}else e("#legend > tbody").append('<tr><td colspan="2"><table class="table table-sm mb-0"><tbody><tr><th colspan="2">No data found in NWIS</th><tr>')}(n.properties);var t=L.divIcon({className:"wmm-pin wmm-mutedblue wmm-icon-circle wmm-icon-white wmm-size-25"});return L.marker(r,{icon:t})},onEachFeature:function(e,n){var r='<b>Site ID: </b><a href="https://waterdata.usgs.gov/nwis/uv/?site_no='+e.properties["Site ID"]+'" target="_blank">'+e.properties["Site ID"]+"</a><br><b>Station Name:</b> "+e.properties["Station Name"];e.properties.photoURL&&e.properties.photoURL.length>0&&(r+='<br><b>Site photo (static): </b><a href="'+e.properties.photoURL+'" target="_blank">link</a>'),e.properties.webcams&&e.properties.webcams.length>0&&e.properties.webcams.forEach(function(e){r+='<br><b>Webcam photo (live):</b><a href="'+e.webcamLink+'" target="_blank"><img style="width:100%;" src="'+e.webcamURL+'"/></a>'}),r+='<br><h5><span class="openGraphingModule ml-2 badge badge-success" data-sitename="'+e.properties["Station Name"]+'" data-id="'+e.properties.id+'" data-siteid="'+e.properties["Site ID"]+'" >Get Data</span></h5>',n.bindPopup(r)}});T.addLayer(t),function(n){j.sort((e,n)=>e.pcode.localeCompare(n.pcode)),console.log("parameter list:",j),e(".appFilter").each(function(r,t){var a=e(t).attr("id"),o=e(t).data("selectname"),i=[];"parameterSelect"===a&&(e.each(j,function(e,n){i.push({id:n.idx,text:n.pcode+" | "+n.desc,value:n.pcode})}),console.log("selectData:",i)),"stationSelect"===a&&e.each(n.features,function(e,n){i.push({id:n.properties.id,text:n.properties["Station Name"],value:n.properties["Site ID"]})}),e("#"+a).select2({placeholder:o,data:i,dropdownAutoWidth:!0}),e("#"+a).on("change",function(n){e("#"+a).select2("data")})})}(k),e("#loading").hide(),e("#legend").show()})},complete:function(){}}),n=new Date,r=F(n),t=F(n.getTime()-6048e5),console.log("dates:",r,t),e("#startDate").val(t),e("#endDate").val(r),e(".datepicker").datepicker({format:"yyyy-mm-dd"}),e("#timePeriodSelect").select2({dropdownAutoWidth:!0,minimumResultsForSearch:-1}),e(".weatherBtn").click(function(){e(this).toggleClass("slick-btn-selection");var n,r=this.id.replace("btn","");n=M[r],D.hasLayer(n)?D.removeLayer(n):D.addLayer(n)}),e(".basemapBtn").click(function(){e(".basemapBtn").removeClass("slick-btn-selection"),e(this).addClass("slick-btn-selection"),function(e){switch(e){case"Sentinel":e="Sentinel";break;case"Streets":e="Streets";break;case"Satellite":e="Imagery";break;case"Clarity":e="ImageryClarity";break;case"Topo":e="Topographic";break;case"Terrain":e="Terrain";break;case"Gray":e="Gray";break;case"DarkGray":e="DarkGray";break;case"NatGeo":e="NationalGeographic"}N&&D.removeLayer(N);N=Object(s.a)(e),D.addLayer(N),I&&D.removeLayer(I);"Gray"!==e&&"DarkGray"!==e&&"Imagery"!==e&&"Terrain"!==e||(I=Object(s.a)(e+"Labels"),D.addLayer(I))}(this.id.replace("btn",""))}),e("#mobile-main-menu").click(function(){e("body").toggleClass("isOpenMenu")}),e("#resetView").click(function(){resetView()}),e("#aboutButton").click(function(){e("#aboutModal").modal("show")}),e("#showGraph").click(function(){P()}),e("#downloadData").click(function(){E?e(E).each(function(n,r){if(r){var t=[];t.push('Site Name,"'+r.siteName+'"'),t.push('Site ID,"'+r.siteID+'"'),t.push('Description,"'+r.variableDescription+'"'),t.push(""),t.push("Time,Value"),e(r.values).each(function(e,n){t.push(n.dateTime+","+n.value)}),t=t.join("\n");var a=r.siteCode.replace(":","_")+".csv";!function(e,n){var r=new Blob([e],{type:"text/csv;charset=utf-8;"});if(navigator.msSaveBlob)navigator.msSaveBlob(r,n);else{var t=document.createElement("a"),a=URL.createObjectURL(r);void 0!==t.download?(t.setAttribute("href",a),t.setAttribute("download",n),t.style.visibility="hidden",document.body.appendChild(t),t.click(),document.body.removeChild(t)):window.open(a)}}(t,a)}else alert("No data to export")}):alert("No data to export")}),e("#mapDiv").on("click",".openGraphingModule",function(){var n=String(e(this).data("id"));e("#stationSelect").select2("val",n),_()}),e("#legend").on("mouseenter",".site",function(){var n=e(this).data("sitename");T.eachLayer(function(e){e.eachLayer(function(e){n==e.feature.properties["Station Name"]&&e.openPopup()})})}),e("#legend").on("click",".siteData",function(){e("#stationSelect").val(null).trigger("change"),e("#parameterSelect").val(null).trigger("change"),e("#graphContainer").html("");var n=String(e(this).data("pcode_tsid")),r=n.split(":")[0],t=e(this).data("sitename"),a=String(e(this).data("id"));T.eachLayer(function(o){o.eachLayer(function(o){t==o.feature.properties["Station Name"]&&(e("#stationSelect").val(a).trigger("change"),n&&e.each(j,function(n,t){t.pcode==r&&(e("#parameterSelect").val(t.idx).trigger("change"),P())}),_())})})}),T.on("click",function(n){e("#stationSelect").val(null).trigger("change"),e("#parameterSelect").val(null).trigger("change"),e("#graphContainer").html("");n.layer.feature.properties["Station Name"],n.layer.feature.properties["Site ID"];var r=n.layer.feature.properties.id;e("#stationSelect").select2("val",r)}),T.on("popupopen",function(n){e(".leaflet-popup-content img").one("load",function(){n.popup.update()})})}),String.prototype.trim=function(){return this.replace(/^\s+|\s+$/g,"")},e.ajaxQueue=function(n){var r=n.complete;z.queue(function(t){n.complete=function(){r&&r.apply(this,arguments),t()},e.ajax(n)})}}.call(this,r(1))},41:function(e,n,r){var t=r(42);"string"==typeof t&&(t=[[e.i,t,""]]);var a={hmr:!0,transform:void 0,insertInto:void 0};r(3)(t,a);t.locals&&(e.exports=t.locals)},42:function(e,n,r){(e.exports=r(2)(!1)).push([e.i,"\r\n#loading {\r\n  background: #e9e9e9;\r\n  /* position: absolute; */\r\n  height:200px;\r\n  top: 0;\r\n  right: 0;\r\n  bottom: 0;\r\n  left: 0;\r\n  opacity: 0.75;\r\n}\r\n\r\n#loading .load-text {\r\n  text-align: center;\r\n  position: relative;\r\n  top: 50%;\r\n  transform: translateY(-50%); \r\n}\r\n\r\n.tooltip-body{\r\n  width: 400px;\r\n  white-space:normal;\r\n  z-index:9999 !important;\r\n}\r\n\r\n/*\r\n    ===========================\r\n    ===========================\r\n         Navigation Bar\r\n    ===========================\r\n    ===========================\r\n*/\r\n\r\n.top-menu-btn{\r\n  background-color: transparent;\r\n  border: none;\r\n  color: rgba(255,255,255,0.5);\r\n  font-weight: 400;\r\n  text-transform: uppercase;\r\n  letter-spacing: 1.5px;\r\n  font-size: 12pt;\r\n  margin: 18px auto;\r\n  float: right;\r\n}\r\n.top-menu-btn:hover{\r\n  font-size: 12pt;\r\n  background-color: transparent;\r\n  border: none;\r\n  color: rgba(255,255,255,0.8)\r\n}\r\n.top-menu-btn:focus{\r\n  background-color: transparent;\r\n  border: none;\r\n  color: rgba(255,255,255,0.8);\r\n  font-size: 12pt;\r\n}\r\n.top-menu-btn:active{\r\n  color: rgba(255,255,255,1) !important;\r\n  background-color: transparent !important;\r\n  font-size: 12pt;\r\n  border: none;\r\n}\r\n\r\n.top-menu-brand {\r\n  padding: 14px 14px 10px;\r\n}\r\n\r\n.top-menu-brand > img {\r\n  height: 40px;\r\n}\r\n\r\n.top-menu-brand.dec-logo > img {\r\n  filter: invert(100%);\r\n}\r\n\r\n.app-name{\r\n  position: relative;\r\n  top:2px;\r\n  font-weight:300;\r\n}\r\n\r\n.app-name {\r\nposition: relative;\r\nwidth: 100%;\r\nline-height: 70px;\r\npadding: 0 10px;\r\nfont-size: 23px;\r\ncolor: #ffffff;\r\nmargin: 0;\r\nz-index: 10;\r\n}\r\n\r\n.app-name-mobile{\r\n  position: relative;\r\n  top:-2px;\r\n  font-weight:300;\r\n}\r\n\r\n.app-name-mobile {\r\ndisplay: none;\r\nposition: relative;\r\nwidth: 100%;\r\nline-height: 72px;\r\npadding: 0 10px;\r\nfont-size: 30px;\r\ncolor: #ffffff;\r\nmargin: 0;\r\nz-index: 10;\r\n\r\n}\r\n\r\n\r\n/*\r\n  ===========================\r\n  ===========================\r\n       Map\r\n  ===========================\r\n  ===========================\r\n*/\r\nhtml, body, #mapDiv {\r\npadding: 0; \r\nmargin: 0;\r\nheight: 100%;\r\nfont-family: 'Lato', sans-serif;\r\n}\r\n\r\nbody {\r\npadding-top: 72px;\r\npadding-left:470px;\r\n}\r\n\r\n.leaflet-popup-content-wrapper {\r\n  border-radius: 0px;\r\n}\r\n\r\n.openGraphingModule:hover {\r\n  cursor: pointer;\r\n}\r\n\r\n/*\r\n  ===========================\r\n  ===========================\r\n       Top menu\r\n  ===========================\r\n  ===========================\r\n*/\r\n\r\n#top-menu {\r\nposition: fixed;\r\ntop: 0;\r\nleft: 0;\r\nright: 0;\r\nbackground-color: #1d1d2b;\r\nz-index: 9;\r\n}\r\n\r\n#top-menu > div:not(.logo) {\r\nfloat: left;\r\n}\r\n\r\n#mobile-main-menu {\r\ndisplay: none;\r\ncursor: pointer;\r\n}\r\n\r\n#mobile-main-menu {\r\npadding: 24px 15px;\r\ncolor:white;\r\n}\r\n\r\n/************* END TOP MENU **************/\r\n\r\n\r\n\r\n/*\r\n  ===========================\r\n  ===========================\r\n       Main Menu\r\n  ===========================\r\n  ===========================\r\n*/\r\n\r\n#explanationPanel .card-body {\r\n  padding:0px;\r\n}\r\n\r\n.table .table {\r\n  background-color: #fff;\r\n}\r\n\r\n#paramSelector > span {\r\n  margin-bottom:6px;\r\n}\r\n\r\nselect {\r\n  width:100%;\r\n}\r\n\r\n.datepicker {\r\n  border: solid #999 1px;\r\n}    \r\n\r\n#optionsPanel button {\r\n  margin-bottom:5px;\r\n  width: 100%;\r\n}\r\n\r\n#optionsPanel .card {\r\n  background-color: #ECEEF3;\r\n}\r\n\r\n.select2-selection__choice {\r\n  font-size:12px;\r\n}\r\n\r\n.select2-search__field {\r\n  width: auto !important; \r\n}\r\n\r\n.select2-selection__choice {\r\n  font-size:12px;\r\n}\r\n\r\n#legend .table-expander {\r\n  cursor: pointer;\r\n}\r\n\r\n.table-sm{\r\n  font-size: 14px;\r\n}\r\n\r\n#legend .siteData {\r\n  cursor: pointer;\r\n}\r\n\r\n#legend .wmm-size-25.wmm-pin {\r\n  margin-top: 0px !important;\r\n}\r\n\r\n#layersPanel .card {\r\n  background-color: #ECEEF3;\r\n}\r\n\r\n#legend .card-text {\r\n  height: 40px;\r\n}\r\n\r\n.identification {\r\nfont-size: 14px;\r\nletter-spacing: 1.1px;\r\nbox-sizing: border-box;\r\npadding: 10px;\r\ndisplay: block;\r\ntext-align: center;\r\nopacity: .5;\r\n}\r\n\r\n#main-menu {\r\n  width: 470px;\r\n  height: calc(100% - 72px);\r\n  float: left;\r\n  /* background-color: #20202f; */\r\n  /* margin-top: 65px; */\r\n  position: fixed;\r\n  bottom: 0;\r\n  left: 0;\r\n  transition: left .5s ease;\r\n  background-color: #ECEEF3;\r\n  min-height: 0 !important;\r\n  z-index:1001;\r\n}\r\n\r\n.menu-content{\r\n\theight:100%\r\n}\r\n.menu-content .scrollable-content{\r\n\tdisplay: flex;\r\n  flex-direction: column;\r\n  justify-content: space-between;\r\n  height: 100%;\r\n}\r\n\r\n#main-menu .main-menu-container {\r\n  position: relative;\r\n  overflow-y: auto;\r\n  height: 100%;\r\n}\r\n\r\n#main-menu-footer {\r\n\tposition: unset;\r\n  height: auto;\r\n  overflow-y: auto;\r\n\tbox-sizing:border-box;\r\n\tpadding: 0 0 10px 0;\r\n}\r\n\r\n#main-menu .sidebar-panel {\r\nbackground-color: #ECEEF3;\r\nmargin: 0 auto;\r\nborder: none;\r\n}\r\n\r\n.card-header > svg {\r\n  float: right;\r\n}\r\n\r\n.card-header:after {\r\n  font-family: 'Font Awesome 5 Free';   \r\n  content: '\\F068';\r\n  font-weight: 900;\r\n  display:none;\r\n}\r\n.card-header.collapsed:after {\r\n  font-family: \"Font Awesome 5 Free\";\r\n  content: \"\\F067\"; \r\n  font-weight: 900;\r\n  display:none;\r\n}\r\n  \r\n#main-menu .sidebar-panel .card-title {\r\nfont-size: 10pt;\r\ntext-transform: uppercase;\r\nfont-weight: 700;\r\nletter-spacing: 1px;\r\n/* text-align: right; */\r\n}\r\n#main-menu .sidebar-panel .card-header {\r\nbox-sizing: border-box;\r\ndisplay: block;\r\nwidth: 100%;\r\npadding: 15px;\r\ncolor: #6F758E;\r\nbackground-color: #ECEEF3;\r\n}\r\n#main-menu .sidebar-panel .card-header:hover {\r\ncursor: pointer;\r\nbackground-color: rgba(255, 255, 255, 0.5);\r\ncolor: #000;\r\n}\r\n\r\n#main-menu .slick-btn {\r\nborder: none;\r\noutline: none;\r\nborder-radius: 0;\r\nfont-size: 9pt;\r\ntext-transform: uppercase;\r\nletter-spacing: 1px;\r\nbox-sizing: border-box;\r\npadding: 5px;\r\ndisplay: block;\r\nwidth: 100%;\r\ntext-align: left;\r\ncolor: #6F758E;\r\nmargin: 0 auto;\r\nborder-left: 4px solid transparent;\r\n}\r\n#main-menu .slick-btn img {\r\nheight: 25px;\r\nvertical-align: middle;\r\ndisplay: inline-block;\r\nmargin: 0 15px 0 0;\r\nborder-radius: 0;\r\nborder: none;\r\n}\r\n#main-menu .slick-btn br {\r\ndisplay: none;\r\n}\r\n#main-menu .slick-btn:hover {\r\nborder-color: #333;\r\nbackground-color: rgba(236, 238, 243, 0.5);\r\n}\r\n#main-menu .slick-btn:focus {\r\nbackground-color: #ECEEF3;\r\nborder-color: #4574CC;\r\n}\r\n\r\n#main-menu .slick-btn-selection {\r\nbackground-color: rgba(117, 136, 184, 0.5);\r\nborder-color: #4574CC !important;\r\n}\r\n\r\n.footer-links {\r\n  font-weight: 300;\r\n  letter-spacing: 1.5px;\r\n  box-sizing: border-box;\r\n  padding: 10px;\r\n  display: block;\r\n  text-align: center;\r\n  opacity: .5;\r\n  padding:3px;\r\n}\r\n\r\n.footer-links a {\r\n  display: inline-block;\r\n  box-sizing: border-box;\r\n  padding: 0 4px;\r\n  font-size: 8pt;  \r\n}\r\n\r\n.footer-icons {\r\n  padding: 10px;\r\n  letter-spacing: 6px;\r\n  text-align: center;\r\n  opacity: .5;\r\n}\r\n\r\n/************* END MAIN MENU **************/\r\n\r\n/************** Mobile friendly stuff *********/\r\n\r\n@media (max-width: 767px) {\r\n  #mobile-main-menu {\r\n    display: inline-block;\r\n  }\r\n\r\n  .isOpenMenu #main-menu {\r\n    left: 0;\r\n  }\r\n\r\n  .top-menu-brand {\r\n    display:none;\r\n  }\r\n\r\n  body {\r\n    padding-left:0px;\r\n  }\r\n\r\n  #main-menu {\r\n    left: -100%;\r\n    height: calc(100% - 72px);\r\n    width: 100%;\r\n  }\r\n\r\n  .app-name {\r\n    display: none;\r\n  }\r\n\r\n  .app-name-mobile {\r\n    display: inline;\r\n    font-size:medium;\r\n  }\r\n\r\n}",""])}});