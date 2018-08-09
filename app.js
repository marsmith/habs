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
import 'bootstrap-datepicker';
import { map, control, tileLayer, featureGroup, geoJSON, Icon } from 'leaflet';
import { basemapLayer, dynamicMapLayer } from 'esri-leaflet';

//START user config variables
var MapX = '-76.3705'; //set initial map longitude
var MapY = '42.8576'; //set initial map latitude
var MapZoom = 12; //set initial map zoom
var sitesURL = './sitesGeoJSON.json';
var NWISivURL = 'https://nwis.waterservices.usgs.gov/nwis/iv/';
//END user config variables 

//START global variables
var theMap;
var featureCollection;
var baseMapLayer, basemaplayerLabels;
var weatherLayer = {};
var habsSitesLayer;
var seriesData;

// var parameterList = [
//   {pcode:'00010', desc:'Temperature, water'},
//   {pcode:'00095', desc:'Specific cond at 25C'},
//   {pcode:'00400', desc:'pH'},
//   {pcode:'63680', desc:'Turbidity, Form Neph'},
//   {pcode:'00060', desc:'Discharge'},
//   {pcode:'00065', desc:'Gage height'}
// ];

var parameterList = [
  {pcode:'00010', desc:'Temperature, water'},
  {pcode:'00095', desc:'Specific cond at 25C'},
  {pcode:'00300', desc:'Dissolved oxygen'},
  {pcode:'00301', desc:'Dissolved oxygen, % Saturation'},
  {pcode:'00400', desc:'pH'},
  {pcode:'63680', desc:'Turbidity, Form Neph'},
  {pcode:'32318', desc:'fChlorophyll, ug/L'},
  {pcode:'32320', desc:'fChlorophyll, RFU'},
  {pcode:'32319', desc:'fPhycocyanin, ug/L'},
  {pcode:'32321', desc:'fPhycocyanin, RFU'},
  {pcode:'32295', desc:'fDOM, PPB QSE'},
  {pcode:'32322', desc:'fDOM, RFU'},
  {pcode:'00060', desc:'Discharge'},
  {pcode:'00065', desc:'Gage height'}
];

var noaaSitesJSON = './noaaSites.json';  //lookup file of all NOAA sites with USGS gages
var cwisURL = 'https://txdata.usgs.gov/CWIS/Services/1.0/services/request.ashx/getData';
var cwisOptions = {
	service: 'flow',
	states: 'NY',
	format: 'geojson'
};
var cwisRefreshInterval;
var noaaSitesJson;

var ajaxQueue = $({});
//END global variables

//instantiate map
$(document).ready(function () {
  console.log('Application Information: ' + process.env.NODE_ENV + ' ' + 'version ' + VERSION);
  $('#appVersion').html('Application Information: ' + process.env.NODE_ENV + ' ' + 'version ' + VERSION);

  Icon.Default.imagePath = './images/';

  //create map
  theMap = map('mapDiv', { zoomControl: false });

  //add zoom control with your options
  control.zoom({ position: 'topright' }).addTo(theMap);
  control.scale().addTo(theMap);

  //basemap
  baseMapLayer = tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}', {
    attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
    maxZoom: 16
  }).addTo(theMap);

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

  $('#legend').on("mouseenter", "tr", function(){
    var siteName = $(this).find('.siteName').text();
    console.log('test hover:',siteName);

    habsSitesLayer.eachLayer(function(geoJSON){
      geoJSON.eachLayer(function(layer) {
        if (siteName == layer.feature.properties['Station Name']) {
          L.popup()
          .setLatLng(layer._latlng)
          .setContent(layer.feature.properties['Station Name'])
          .openOn(theMap);
        }
      });
    });
  });

  $('#legend').on("click", "tr", function(){
    $('#stationSelect').val(null).trigger('change');
    var siteName = $(this).find('.siteName').text();
    var siteID =  $(this).find('.siteName').data('siteid');
    var id = String($(this).find('.siteName').data('id'));
    console.log('test CLICK:',this, id, siteID, siteName);

    habsSitesLayer.eachLayer(function(geoJSON){
      geoJSON.eachLayer(function(layer) {
        if (siteName == layer.feature.properties['Station Name']) {
          $('#stationSelect').select2('val', id);
          $('#graphModal').modal('show');
        }
      });
    });
  });

  habsSitesLayer.on('click', function (e) {
    $('#stationSelect').val(null).trigger('change');

    var siteName = e.layer.feature.properties['Station Name'];
    var siteID =  e.layer.feature.properties['Site ID'];
    var id = e.layer.feature.properties['id'];
    console.log(id, siteID, siteName, e);


    //openPopup(e);
    $('#stationSelect').select2('val', id);
    $('#graphModal').modal('show');
  });
  /*  END EVENT HANDLERS */

});

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
    return item.value;
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

        console.log( data);

        counter += 1;
  
        if (data.value.timeSeries.length <= 0) {
          alert('Found an NWIS site [' + siteIDs + '] but it had no data in waterservices for [' +  parameterCodes + ']');
          return;
        }

        var startTime;
    
        $(data.value.timeSeries).each(function (i, siteParamCombo) {
 
          startTime = new Date(siteParamCombo.values[0].value[0].dateTime)/1;
    
          var valueArray = siteParamCombo.values[0].value.map(function(item) {
            var seconds = new Date(item.dateTime)/1;
            return item.value/1;
            //return [seconds,item.value/1];
          });
    
          var series = {
            showInLegend: true,
            values: siteParamCombo.values[0].value,
            data: valueArray,
            color: getRandomColor(),
            siteID: siteParamCombo.sourceInfo.siteCode[0].value,
            siteName: siteParamCombo.sourceInfo.siteName,
            siteCode: siteParamCombo.name,
            variableDescription: siteParamCombo.variable.variableDescription,
            variableName: siteParamCombo.variable.variableName,
            unit: siteParamCombo.variable.unit.unitCode,
            name: siteParamCombo.sourceInfo.siteName + ' | ' + $('<div>').html(siteParamCombo.variable.variableName).text(),
          };

          //update the name to include the year if compare years is on
          if (compareYears) {
            series.name = data.value.queryInfo.note[1].value.split('INTERVAL[')[1].split('-')[0] + ' | ' + siteParamCombo.sourceInfo.siteName + ' | ' + $('<div>').html(siteParamCombo.variable.variableName).text(); 
          }
    
          seriesData.push(series);
    
        });

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
  console.log('seriesData',startTime);

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
					return Highcharts.dateFormat('%m/%d', this.value);
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
    console.log('test',obj)
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
    
    chartSetup.series.push(obj);
    
  });

	var chart = Highcharts.chart('graphContainer', chartSetup);
  
  // update colors
  // https://www.highcharts.com/demo/combo-multi-axes
  // https://stackoverflow.com/questions/12419758/changing-series-color-in-highcharts-dynamically
  // https://stackoverflow.com/questions/17837340/highcharts-dynamically-change-axis-title-color

}

function initializeFilters(data) {

  $('.appFilter').each(function (i, obj) {

    var divID = $(obj).attr('id');
    var selectName = $(obj).data('selectname');
    var selectData = [];

    console.log('processing:',divID,selectName)

    
    if (divID === 'parameterSelect') {
            
      $.each(parameterList, function (idx,item) {
        selectData.push({
          id:idx,
          text:item.desc,
          value:item.pcode
        });
      });
    }

    if (divID === 'stationSelect') {

      $.each(data.features, function (idx,item) {
        selectData.push({
          "id":item.properties['id'],
          "text":item.properties['Station Name'],
          "value":item.properties['Site ID']
        });
      });
    }

    $('#' + divID).select2({
      placeholder: selectName,
      data:selectData,
      dropdownAutoWidth: true
    });

    //watch for any change, and spawn a parameter selector for each site that is selected
    $('#' + divID).on('change', function (e) {
      var data = $('#' + divID).select2('data');
    });

  });
}

function openPopup(e) {
  console.log('site clicked', e.layer.feature.properties);

  var popupContent = '';

  //look up better header
  $.each(e.layer.feature.properties, function (shortKey, property) {

    //make sure we have something
    if (property.length > 0) {

      if(shortKey === 'Site ID') {
        
        popupContent += '<b>' + shortKey + ':</b>&nbsp;&nbsp;<a href="https://waterdata.usgs.gov/usa/nwis/uv?' + property + '" target="_blank">' + property + '</a></br>';

      }
      //otherwise add as normal
      else popupContent += '<b>' + shortKey + ':</b>&nbsp;&nbsp;' + property + '</br>';
    }
  });

  L.popup({ minWidth: 320 })
    .setLatLng(e.latlng)
    .setContent(popupContent)
    .openOn(theMap);
}

function addToLegend(id, siteID, siteName, classString) {

  $("#legend > tbody").append('<tr><th><div><icon class="siteIcon ' + classString + '" /></div></th><th data-id="' + id + '" data-siteid="' + siteID + '" class="siteName">' + siteName + '</th>');
}

function loadSites() {

  $.ajax({
    url: sitesURL,
    success: function (data) {
      featureCollection = data;

      var geoJSONlayer = geoJSON(featureCollection, {
        pointToLayer: function (feature, latlng) {
    
          //considtional classString
          var classString = 'wmm-pin wmm-mutedblue wmm-icon-circle wmm-icon-white wmm-size-25';
    
          addToLegend(feature.properties['id'], feature.properties['Site ID'], feature.properties['Station Name'], classString);
    
          var icon = L.divIcon({ className: classString });
          return L.marker(latlng, { icon: icon });
        }
      });
    
      habsSitesLayer.addLayer(geoJSONlayer);

      initializeFilters(featureCollection);
    },
    complete: function () {
      // call a function on complete 
      $('#loading').hide();
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