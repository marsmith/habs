<?php
//include config
include 'config.php';
include 'opendb.php';

//Access-Control-Allow-Origin header with wildcard.
header('Access-Control-Allow-Origin: *');

//sanitze input
$_GET = filter_input_array(INPUT_GET, FILTER_SANITIZE_STRING);


//get input parameters
$querySites = $_GET['sites'];
$queryParameters = $_GET['parameterCd'];
$queryStartDT = $_GET['startDT'];
$queryEndDT = $_GET['endDT'];
$tablename =  $_GET['tableName'];

//start query
$sql = "SELECT * FROM ". $dbname . "." . $tablename . " WHERE ";

//get dates
if(isset($queryStartDT) && !empty($queryStartDT) && isset($queryEndDT) && !empty($queryEndDT)){
    $sql .= "`TIMESTAMP` >= '".$queryStartDT."' AND `TIMESTAMP` <= '".$queryEndDT."'";
}

//limit records for testing
//$sql .= " LIMIT 100;";
//echo $sql;

//$sql2 = "SELECT * FROM hrecos_test.raw_data WHERE site_name='HRALBPH' LIMIT 100";
$result = mysqli_query($dbConnection, $sql) or die(mysql_error()); 
$rows = array();

while($r = mysqli_fetch_assoc($result)) {
    $rows[] = $r;
}

print json_encode(array(
    "declaredType" => "localDB",
    "queryInfo" => array(
        "criteria" => array(
            "sql" => $sql,
            "server" => $servername,
            "database" => $dbname,
            "table" => $tablename,
            "locationParam" => $querySites,
            "variableParam" => $queryParameters,
            "timeParam" => array(
                "beginDateTime" => $queryStartDT,
                "endDateTime" => $queryEndDT
            )
        )
    ),
    "value" => $rows
));

mysqli_close($dbConnection);
?> 