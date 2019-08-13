// ------------------------------------------------------------------------------
// ----- HRECOS -----------------------------------------------------------------
// ------------------------------------------------------------------------------

// copyright:   2018 Martyn Smith - USGS NY WSC

// authors:  Martyn J. Smith - USGS NY WSC

// purpose:  HABS Data Viewer

// updates:
// 08.07.2018 - MJS - Created

//CSS imports
import 'bootstrap/dist/css/bootstrap.css';
import 'font-awesome/css/font-awesome.css';
import 'leaflet/dist/leaflet.css';
import 'marker-creator/stylesheets/markers.css';
import 'select2/dist/css/select2.css';
import 'bootstrap-datepicker/dist/css/bootstrap-datepicker.css';
import './styles/main.css';

//ES6 imports
import 'bootstrap/js/dist/util';
import 'bootstrap/js/dist/modal';
import 'bootstrap/js/dist/collapse';
import 'bootstrap/js/dist/tab';
import 'select2';
import moment from 'moment'
import Highcharts from 'highcharts';
import addExporting from "highcharts/modules/exporting";
addExporting(Highcharts)
import 'bootstrap-datepicker';
import { map, control, tileLayer, featureGroup, geoJSON, Icon } from 'leaflet';
import { basemapLayer, dynamicMapLayer, imageMapLayer } from 'esri-leaflet';

//START user config variables
var MapX = '-76.60'; //set initial map longitude
var MapY = '42.88'; //set initial map latitude
var MapZoom = 10; //set initial map zoom
var sitesURL = './sitesGeoJSON.json';
var NWISivURL = 'https://nwis.waterservices.usgs.gov/nwis/iv/';
//END user config variables 

//START global variables
var theMap;
var featureCollection;
var sentinalBaseMapLayer, baseMapLayer, basemaplayerLabels;
var weatherLayer = {};
var habsSitesLayer;
var seriesData;
var parameterList = [];

var ajaxQueue = $({});
//END global variables

//instantiate map
$(document).ready(function () {
  console.log('Application Information: ' + process.env.NODE_ENV + ' ' + 'version ' + VERSION);
  $('#appVersion').html('Application Information: ' + process.env.NODE_ENV + ' ' + 'version ' + VERSION);

  Icon.Default.imagePath = './images/';

  //create map
  theMap = map('mapDiv', { zoomControl: false, minZoom: 8, });

  //add zoom control with your options
  control.zoom({ position: 'topright' }).addTo(theMap);
  control.scale().addTo(theMap);

  //basemap
  baseMapLayer = tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
  }).addTo(theMap);

  var days = 7; // Days you want to subtract
  var date = new Date();
  var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));

  // sentinalBaseMapLayer = imageMapLayer({
  //   url: 'https://landsatlook.usgs.gov/arcgis/rest/services/Sentinel2/ImageServer',
  //   f:'image',
  //   format:'jpg',
  //   renderingRule:{"rasterFunction":"Stretch","rasterFunctionArguments":{"StretchType":0},"variableName":"Raster"},
  //   mosaicRule:{"mosaicMethod":"esriMosaicLockRaster","ascending":true,"lockRasterIds":[8357791,8267262,7948898,7697089,7691608,6472717],"mosaicOperation":"MT_FIRST"},
  //   imageSR:'102100',
  //   bboxSR:'102100',
  //   size:'2219,733'
  // }).addTo(theMap);

  weatherLayer.NexRad = tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/nexrad-n0q-900913/{z}/{x}/{y}.png', {opacity : 0.5 });
  weatherLayer.Precip = tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/q2-n1p-900913/{z}/{x}/{y}.png', {opacity : 0.5 });
  weatherLayer.PrecipForecast1hr = dynamicMapLayer({url: 'https://idpgis.ncep.noaa.gov/arcgis/rest/services/NWS_Forecasts_Guidance_Warnings/wpc_qpf/MapServer', layers: [7], opacity : 0.5 });
  weatherLayer.CloudCoverVisible = tileLayer('https://mesonet.agron.iastate.edu/cache/tile.py/1.0.0/goes-vis-1km-900913/{z}/{x}/{y}.png', {opacity : 0.5 });
  weatherLayer.Drought = tileLayer.wms('http://ndmc-001.unl.edu:8080/cgi-bin/mapserv.exe?map=/ms4w/apps/usdm/service/usdm_current_wms.map', {layers : 'usdm_current', bboxSR: 102100, imageSR: 102100, format: 'image/png',
  transparent: true, f: 'image', nocache: Date.now(), opacity : 0.5});

  //set initial view
  theMap.setView([MapY, MapX], MapZoom);

  //define layers
  habsSitesLayer = featureGroup().addTo(theMap);

  loadSites();
  setDates();

  $('.datepicker').datepicker({
    format: 'yyyy-mm-dd'
  });


  /*  START EVENT HANDLERS */
  $('#timePeriodSelect').select2({
    dropdownAutoWidth: true,
    minimumResultsForSearch: -1
  });

  $('.weatherBtn').click(function () {
    $(this).toggleClass('slick-btn-selection');
    var lyrID = this.id.replace('btn', '');
    setWeatherLayer(lyrID);
  });

  $('.basemapBtn').click(function () {
    $('.basemapBtn').removeClass('slick-btn-selection');
    $(this).addClass('slick-btn-selection');
    var baseMap = this.id.replace('btn', '');
    setBasemap(baseMap);
  });

  $('#mobile-main-menu').click(function () {
    $('body').toggleClass('isOpenMenu');
  });

  $('#resetView').click(function () {
    resetView();
  });

  $('#aboutButton').click(function () {
    $('#aboutModal').modal('show');
  });

  $('#showGraph').click(function () {
    getData();
  });

  $('#downloadData').click(function () {
    downloadData();
  });

  $('#mapDiv').on("click", '.openGraphingModule', function(){
    var id = String($(this).data('id'));
    $('#stationSelect').select2('val', id);
    openGraphingModule();
  });  

  $('#legend').on("mouseenter", ".site", function(){
 
    var siteName = $(this).data('sitename');

    habsSitesLayer.eachLayer(function(geoJSON){
      geoJSON.eachLayer(function(layer) { 
        
        //console.log(siteName,layer.feature.properties['Station Name'])
        if (siteName == layer.feature.properties['Station Name']) {
          layer.openPopup();
        }
      });
    });
  });

  $('#legend').on("click", ".siteData", function(){
    
    $('#stationSelect').val(null).trigger('change');
    $('#parameterSelect').val(null).trigger('change');
    $('#graphContainer').html('');

    var pcode_tsid = String($(this).data('pcode_tsid'));
    var pcode = pcode_tsid.split(':')[0];
    var siteName = $(this).data('sitename');
    var id = String($(this).data('id'));

    //console.log('parameter list:',parameterList)

    habsSitesLayer.eachLayer(function(geoJSON){
      geoJSON.eachLayer(function(layer) {
        if (siteName == layer.feature.properties['Station Name']) {

          //select station based on where click was in legend
          $('#stationSelect').val(id).trigger("change");

          //select pcode:tsid based on where click was in legend
          if (pcode_tsid) {
            $.each(parameterList, function (idx,item) {
              if (item.pcode == pcode) {
                //console.log('Found paramater match:',pcode_tsid, item);

                $("#parameterSelect").val(item.idx).trigger("change");
                getData();
                
              }
            });
          }
          openGraphingModule();
        }
      });
    });
  });

  habsSitesLayer.on('click', function (e) {
    $('#stationSelect').val(null).trigger('change');
    $('#parameterSelect').val(null).trigger('change');
    $('#graphContainer').html('');

    var siteName = e.layer.feature.properties['Station Name'];
    var siteID =  e.layer.feature.properties['Site ID'];
    var id = e.layer.feature.properties['id'];

    $('#stationSelect').select2('val', id);
  });

  habsSitesLayer.on("popupopen", function(e){
    //make sure map pans for loaded images
    $(".leaflet-popup-content img").one("load", function(){ e.popup.update(); });
  });

  /*  END EVENT HANDLERS */

});

String.prototype.trim = function() {
  return this.replace(/^\s+|\s+$/g, '');
}

$.ajaxQueue = function(ajaxOpts) {
  // Hold the original complete function
  var oldComplete = ajaxOpts.complete;

  // Queue our ajax request
  ajaxQueue.queue(function(next) {
    // Create a complete callback to invoke the next event in the queue
    ajaxOpts.complete = function() {
      // Invoke the original complete if it was there
      if (oldComplete) {
        oldComplete.apply(this, arguments);
      }

      // Run the next query in the queue
      next();
    };

    // Run the query
    $.ajax(ajaxOpts);
  });
};

function openGraphingModule() {
  $('#graphModal').modal('show');
}

function setDates() {

  var dateObj = new Date();
  var currentDate = formatDate(dateObj);
  var lastWeekDate = formatDate(dateObj.getTime() - (7 * 24 * 60 * 60 * 1000));
  console.log('dates:',currentDate,lastWeekDate);

  $('#startDate').val(lastWeekDate);
  $('#endDate').val(currentDate);

}

function formatDate(date) {
  var d = new Date(date),
      month = '' + (d.getMonth() + 1),
      day = '' + d.getDate(),
      year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
}

function downloadData() {
  
  if (seriesData) {
    $(seriesData).each(function (i, data) {
      
      if (data) {
  
        // start CSV file
        var csvData = [];
        csvData.push('Site Name,"' + data.siteName + '"');
        csvData.push('Site ID,"' + data.siteID + '"');
        csvData.push('Description,"' + data.variableDescription + '"');
        csvData.push('');

        csvData.push('Time,Value');

        $(data.values).each(function (i, value) {
            csvData.push(value.dateTime + ',' + value.value);
        });
    
        //console.log(csvData);
        
        csvData = csvData.join('\n');
    
        var filename = data.siteCode.replace(':','_') + '.csv';
        downloadFile(csvData,filename);
      }
    
      else {
        alert('No data to export');
      }
    });

  }
  else {
    alert('No data to export');
  }

}

function downloadFile(data,filename) {
	var blob = new Blob([data], { type: 'text/csv;charset=utf-8;' });
	if (navigator.msSaveBlob) { // IE 10+
		navigator.msSaveBlob(blob, filename);
	} else {
		var link = document.createElement('a');
		var url = URL.createObjectURL(blob);
		if (link.download !== undefined) { // feature detection
			// Browsers that support HTML5 download attribute
			link.setAttribute('href', url);
			link.setAttribute('download', filename);
			link.style.visibility = 'hidden';
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
		else {
			window.open(url);
		}
	}
}

function getData() {

  $('#graph-loading').show();

  var compareYears = false;
  var dates = [];
  var requestDatas = [];
  var requestData = {
    format: 'json',
  };

  //----------------------------------------------
  //SHOW SELECTED SITES AS HIGHLIGHTED ON THE MAP
  //----------------------------------------------

  var siteData = $('#stationSelect').select2('data');
  var siteParameter = $('#parameterSelect').select2('data');

  //validate station and parameter selections
  if (siteData.length === 0 || siteParameter.length === 0) {
    alert('You must choose at least one station and one parameter to continue');
    $('#graph-loading').hide();
    return;
  }

  //time and date stuff
  var timeOption = $('input[name=timeSelect]:checked').val();

  //get compare years
  if ($("#compareYears").prop('checked')) {
    compareYears = true;
  }
  
  //convert periods to start and end dates with moment
  if (timeOption === 'period') {
    var period = $('#timePeriodSelect').select2('data')[0].id;
    requestData.endDT = moment().format('YYYY-MM-DD');
    requestData.startDT = moment().subtract(moment.duration(period)).format('YYYY-MM-DD'); 
  }
  else {
    requestData.startDT = $('#startDate').val();
    requestData.endDT = $('#endDate').val();
  }

  //format selections
  var siteIDs = siteData.map(function(item) {
    return item.value;
  }).join(',');
  requestData.sites = siteIDs;

  var parameterCodes = siteParameter.map(function(item) {
    return item.value.split(':')[0];
  }).join(',');
  requestData.parameterCd = parameterCodes;

  requestDatas.push(requestData);

  //if comparing years, get new dates minus one year
  if (compareYears) {

    //make copy of request and then change the dates
    var newRequestData = JSON.parse(JSON.stringify(requestData))
    newRequestData.startDT = moment(requestData.startDT).subtract(1, 'years').format('YYYY-MM-DD');
    newRequestData.endDT = moment(requestData.endDT).subtract(1, 'years').format('YYYY-MM-DD');
    requestDatas.push(newRequestData);
    
  }

  seriesData = [];
  var counter = 0;

  console.log('Processing', requestDatas.length, 'requests');

  $(requestDatas).each(function (i, inputRequest) {

    console.log('url:',inputRequest)
    $.ajaxQueue({
      url: NWISivURL, 
      data: inputRequest, 
      type: 'GET',
      success: function(data) {

        //console.log( data);

        counter += 1;
  
        if (data.value.timeSeries.length <= 0) {
          alert('Found an NWIS site [' + siteIDs + '] but it had no data in waterservices for [' +  parameterCodes + ']');
          $('#graph-loading').hide();
          return;
        }

        var startTime = data.value.queryInfo.criteria.timeParam.beginDateTime;   
        var qualifierFound = false;
    
        $(data.value.timeSeries).each(function (i, siteParamCombo) {

          $(siteParamCombo.values).each(function (i, value) {
            var valueArray = value.value.map(function(item) {
              var seconds = new Date(item.dateTime)/1;
              var itemValue = item.value/1;

              //null out the values if there is a maintenance flag
              if (item.qualifiers.indexOf('Mnt') !== -1 || item.qualifiers.indexOf('Eqp') !== -1) {
                itemValue = null;
                qualifierFound = true;
              }

              return [seconds,itemValue];
            });

            var name;
            if (value.method[0].methodDescription.length > 0) name = siteParamCombo.sourceInfo.siteName + ' | ' + $('<div>').html(siteParamCombo.variable.variableName).text() + ' | ' + value.method[0].methodDescription;
            else name = siteParamCombo.sourceInfo.siteName + ' | ' + $('<div>').html(siteParamCombo.variable.variableName).text();
      
            var series = {
              showInLegend: true,
              values: value,
              data: valueArray,
              color: getRandomColor(),
              siteID: siteParamCombo.sourceInfo.siteCode[0].value,
              siteName: siteParamCombo.sourceInfo.siteName,
              siteCode: siteParamCombo.name,
              variableDescription: siteParamCombo.variable.variableDescription,
              variableName: siteParamCombo.variable.variableName,
              unit: siteParamCombo.variable.unit.unitCode,
              name:name,
            };
  
            //update the name to include the year if compare years is on
            if (compareYears) {
              series.name = data.value.queryInfo.note[1].value.split('INTERVAL[')[1].split('-')[0] + ' | ' + siteParamCombo.sourceInfo.siteName + ' | ' + $('<div>').html(siteParamCombo.variable.variableName).text(); 
            }
      
            seriesData.push(series);
          });
        });

        //console.log('seriesData:',JSON.stringify(seriesData));

        //check if were done
        if (counter === requestDatas.length) {
          showGraph(startTime,seriesData);
        }

      }
    });
  });

}

function getRandomColor() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function showGraph(startTime,seriesData) {
  console.log('seriesData',startTime,seriesData);

  //clear out graphContainer
  $('#graphContainer').html('');

  //if there is some data, show the div
  $('#graphModal').modal('show');

	Highcharts.setOptions({
		global: { useUTC: false },
		lang: { thousandsSep: ','}
  });
  
  //chart init object
  var chartSetup = {
		chart: {
			type: 'line',
			spacingTop: 20,
			spacingLeft: 0,
			spacingBottom: 0,
    },
    plotOptions: {
      series: {
        pointStart: startTime,
        pointInterval: 900000 //15 minutes
      }
    },
		title:{
			text:''
		},
		credits: {
			enabled: false
    },
    tooltip: {
      shared: true
    },
		xAxis: {
			type: "datetime",
			labels: {
				formatter: function () {
					return Highcharts.dateFormat('%m/%d %H%P', this.value);
				},
				//rotation: 90,
				align: 'center',
				tickInterval: 172800 * 1000
			}
    },
		yAxis: [],
		series: []
  };


  //loop over series data so we can match up the axis and series indexes
  $(seriesData).each(function (i, obj) {
    var yaxis =   {
      title: { 
        text: obj.unit,
        style: {
          color: obj.color
        }
      },
      labels: {
        style: {
            color: obj.color
        }
      },
      //put odd items on opposite axis
      opposite: isOdd(i)
    };


    //need another loop to check if this series unit aleady has yaxis
    //NOT WORKING RIGHT

    //LOOP OVER ALLDATA TO GET MAX AND MIN TO SET YAXIS
    // https://www.highcharts.com/demo/combo-regression

    var exists = false;
    $(chartSetup.yAxis).each(function (i, data) { 
      if (data.title.text == obj.unit) exists = true;
    });

    if (!exists) { 
      obj.yAxis = i;
      chartSetup.yAxis.push(yaxis);
    }

    // obj.yAxis = i;
    // chartSetup.yAxis.push(yaxis);
    //console.log('here',obj)
    
    chartSetup.series.push(obj);
    
  });

	var chart = Highcharts.chart('graphContainer', chartSetup);
  
  // update colors
  // https://www.highcharts.com/demo/combo-multi-axes
  // https://stackoverflow.com/questions/12419758/changing-series-color-in-highcharts-dynamically
  // https://stackoverflow.com/questions/17837340/highcharts-dynamically-change-axis-title-color

  $('#graph-loading').hide();

}

function initializeFilters(featureCollection) {

  //sort parameter list
  parameterList.sort((a, b) => a.pcode.localeCompare(b.pcode))
  console.log('parameter list:',parameterList)

  $('.appFilter').each(function (i, obj) {

    var divID = $(obj).attr('id');
    var selectName = $(obj).data('selectname');
    var selectData = [];

    //console.log('processing:',divID,selectName)
    
    if (divID === 'parameterSelect') {

      $.each(parameterList, function (idx,item) {
        selectData.push({
          "id":item.idx,
          "text":item.pcode + ' | ' + item.desc,
          "value":item.pcode
        });
      });

      console.log('selectData:',selectData)
    }

    if (divID === 'stationSelect') {

      $.each(featureCollection.features, function (idx,feature) {
        selectData.push({
          "id":feature.properties['id'],
          "text":feature.properties['Station Name'],
          "value":feature.properties['Site ID']
        });
      });
    }

    $('#' + divID).select2({
      placeholder: selectName,
      data:selectData,
      dropdownAutoWidth: true
    });

    //console.log('checking select data for:', divID, $('#' + divID).find("option"))

    //watch for any change, and spawn a parameter selector for each site that is selected
    $('#' + divID).on('change', function (e) {
      $('#' + divID).select2('data');
    });
  });
}

function addToLegend(properties) {

  var classString = 'wmm-pin wmm-mutedblue wmm-icon-circle wmm-icon-white wmm-size-25';

  $('#legend > tbody').append('<tr class="site table-expander accordion-toggle" data-toggle="collapse" data-target=".siteData' + properties['id'] + '" data-sitename="' + properties['Station Name'] +'" data-id="' + properties['id'] + '" data-siteid="' + properties['Site ID'] + '"><td><div><icon class="siteIcon ' + classString + '" /></div></td><td><span class="siteName">' + properties['Station Name'] + '</span><span class="ml-2 badge badge-success float-right">Get Data</span></td></tr>');

  $('#legend .siteIcon').attr('style', 'margin-top: -6px !important; margin-left: 3px !important');

  //basic check for data
  if (properties.dateTime) {
    var d = new Date(properties.dateTime);  //2018-08-09T14:45:00.000-05:00
    //var n = properties.dateTime;
    var n = d.toLocaleString();
  
    //add sub-table header
    //var paramData = '<tr><td colspan="2"><table class="table table-sm mb-0"><tbody><tr data-toggle="collapse" data-target=".siteData' + properties['id'] + '" class="table-expander accordion-toggle"><th data-toggle="collapse" data-target=".multi-collapse' + properties['id'] + '" aria-expanded="false">Most recent values as of: ' + n + '<span class="collapse show multi-collapse' + properties['id'] + ' float-right">[+]</span><span class="collapse multi-collapse' + properties['id'] + ' float-right">[-]</span></th><tr>';

    //var paramData = '<tr class="siteData' + properties['id'] + ' accordian-body collapse"><td colspan="2"><table class="table table-sm mb-0"><tbody><tr><th>Most recent values as of: ' + n + '</th><tr>';

    var paramData = '<tr class="siteData' + properties['id'] + ' accordian-body collapse"><td colspan="2"><table class="table table-sm mb-0"><tbody><tr><th colspan="2">Most recent values as of: ' + n + '</th><tr>';



    //add values
    $.each(properties, function (key, value) {
      var pcode = key.split(':')[0];
      if (/^\d+$/.test(pcode) && pcode.length === 5) {
        paramData += '<tr style="padding: 0 !important;" class="site siteData" data-sitename="' + properties['Station Name'] +'" data-id="' + properties['id'] + '" data-siteid="' + properties['Site ID'] + '" data-pcode_tsid="' + key + '"><td>' + value.name + '</td><td>' + value.value + '</td></tr>';
      }
  
    });
    paramData += '</tbody></table></td><tr>';
  
    $("#legend > tbody").append(paramData);
    //$('#legend .siteIcon').attr('style', 'margin-top: -6px !important; margin-left: 3px !important');
  }
  else {
    $("#legend > tbody").append('<tr><td colspan="2"><table class="table table-sm mb-0"><tbody><tr><th colspan="2">No data found in NWIS</th><tr>');
  }

}

function loadSites() {

  $.ajax({
    url: sitesURL,
    dataType: 'json',
    success: function (data) {
      //console.log(data)

      featureCollection = data;

      //get siteID list
      var siteIDs = featureCollection.features.map(function(item) {
        return item.properties['Site ID'];
      }).join(',');

      //get most recent NWIS data
      $.getJSON(NWISivURL, {
          format: 'json',
          sites: siteIDs,
          //parameterCd: parameterCodes
        }, function success(data) {
            console.log('NWIS IV Data:',data);

            var idx = 1;

            //we need to add new NWIS data as geoJSON featureCollection attributes
            featureCollection.features.forEach(function (feature) {
              var found = false;


              data.value.timeSeries.forEach(function (NWISdata) {
                var site_data = NWISdata.name.split(':');
                var siteID = site_data[1];
                var pcode = site_data[2];
                var pcode_tsid = '';

                if (siteID === feature.properties['Site ID']) {
                  found = true;

                  NWISdata.values.forEach(function (TSID) {
                    pcode_tsid = pcode + ':' + TSID.method[0].methodID;

                    var description;
                    if (TSID.method[0].methodDescription.length > 0) description = NWISdata.variable.variableDescription + ', ' + TSID.method[0].methodDescription;
                    else description = NWISdata.variable.variableDescription;

                    var parameterObj = {
                      "idx": String(idx),
                      "pcode": pcode,
                      "desc": NWISdata.variable.variableDescription
                    };

                    //push to parameter list if we don't have it yet
                    if (!parameterList.some(item => item.pcode === pcode)) {
                      parameterList.push(parameterObj);
                      idx+=1;
                    }

                    if (!(pcode_tsid in feature.properties) ) {
                      feature.properties[pcode_tsid] = {};
                      feature.properties[pcode_tsid].value = TSID.value[0].value;
                      
                      //null out the values if there is a maintenance flag
                      if (TSID.value[0].qualifiers.indexOf('Mnt') !== -1 || TSID.value[0].qualifiers.indexOf('Eqp') !== -1 || TSID.value[0].qualifiers.indexOf('Ssn') !== -1) {
                        feature.properties[pcode_tsid].value = null;
                      }

                      feature.properties.dateTime = TSID.value[0].dateTime;
                      feature.properties[pcode_tsid].dateTime = TSID.value[0].dateTime;
                      feature.properties[pcode_tsid].qualifiers = TSID.value[0].qualifiers;
                      feature.properties[pcode_tsid].description = description;
                      feature.properties[pcode_tsid].name = NWISdata.variable.variableName + ', ' + TSID.method[0].methodDescription;
                    }
                  });
                }
              });
              if (!found) console.log('no data found for:',feature.properties['Site ID'])  
            });
            
            var geoJSONlayer = geoJSON(featureCollection, {
              pointToLayer: function (feature, latlng) {

                var classString = 'wmm-pin wmm-mutedblue wmm-icon-circle wmm-icon-white wmm-size-25';
          
                addToLegend(feature.properties);
          
                var icon = L.divIcon({ className: classString });
                return L.marker(latlng, { icon: icon });
              },
              onEachFeature: function(feature, layer) {
                var popupContent = '<b>Site ID: </b><a href="https://waterdata.usgs.gov/nwis/uv/?site_no=' + feature.properties['Site ID'] + '" target="_blank">' + feature.properties['Site ID'] + '</a><br><b>Station Name:</b> ' + feature.properties['Station Name'];

                if (feature.properties['photoURL'] && feature.properties['photoURL'].length > 0) {
                  popupContent += '<br><b>Site photo (static): </b><a href="' + feature.properties['photoURL'] + '" target="_blank">link</a>';
                }

                if (feature.properties['webcams'] && feature.properties['webcams'].length > 0) {
                  feature.properties['webcams'].forEach(function (webcam) {
                    popupContent += '<br><b>Webcam photo (live):</b><a href="' + webcam['webcamLink'] + '" target="_blank"><img style="width:100%;" src="' + webcam['webcamURL'] + '"/></a>';
                  });
                }

                popupContent += '<br><h5><span class="openGraphingModule ml-2 badge badge-success" data-sitename="' + feature.properties['Station Name'] +'" data-id="' + feature.properties['id'] + '" data-siteid="' + feature.properties['Site ID'] + '" >Get Data</span></h5>';

                layer.bindPopup(popupContent);

                //console.log('feature:',feature.properties)
              }
            });
          
            habsSitesLayer.addLayer(geoJSONlayer);
            
            initializeFilters(featureCollection);

            // call a function on complete 
            $('#loading').hide();
            $('#legend').show();
      });

    },
    complete: function () {

    }
  });
}

function setWeatherLayer(layer) {

  var layerName = weatherLayer[layer];
  
  //first check if weve added this already
  if(theMap.hasLayer(layerName)) theMap.removeLayer(layerName)
  else theMap.addLayer(layerName);
}

function setBasemap(baseMap) {

  switch (baseMap) {
    case 'Sentinel': baseMap = 'Sentinel'; break;
    case 'Streets': baseMap = 'Streets'; break;
    case 'Satellite': baseMap = 'Imagery'; break;
    case 'Clarity': baseMap = 'ImageryClarity'; break;
    case 'Topo': baseMap = 'Topographic'; break;
    case 'Terrain': baseMap = 'Terrain'; break;
    case 'Gray': baseMap = 'Gray'; break;
    case 'DarkGray': baseMap = 'DarkGray'; break;
    case 'NatGeo': baseMap = 'NationalGeographic'; break;
  }

  if (baseMapLayer) theMap.removeLayer(baseMapLayer);
  baseMapLayer = basemapLayer(baseMap);
  theMap.addLayer(baseMapLayer);
  if (basemaplayerLabels) theMap.removeLayer(basemaplayerLabels);
  if (baseMap === 'Gray' || baseMap === 'DarkGray' || baseMap === 'Imagery' || baseMap === 'Terrain') {
    basemaplayerLabels = basemapLayer(baseMap + 'Labels');
    theMap.addLayer(basemaplayerLabels);
  }
}

function camelize(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, function (letter, index) {
    return index === 0 ? letter.toLowerCase() : letter.toUpperCase();
  }).replace(/\s+/g, '');
}

function isOdd(n) {
  return !!(n % 2);
}