<?php
//ob_start("ob_gzhandler"); // Comment to remove GZIP output.
include("cache.inc");
include("timer.inc");
start_timer();

$content = trim(file_get_contents("files.csv"));
$lines = explode("\n", $content);
$files = explode(",", $lines[0]);
$titles = explode(",", $lines[1]);

function is_ie_on_vista() {
	$USER_AGENT = $_SERVER['HTTP_USER_AGENT'];
	return (eregi("MSIE", $USER_AGENT) && eregi("Windows NT 6.0", $USER_AGENT));
}
function ae_detect_ie()
{
    if(isset($_SERVER['HTTP_USER_AGENT']) && 
    (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') !== false))
        return true;
    else
        return false;
}

/*
if(ae_detect_ie()) {
	$imgscontent = trim(file_get_contents("images.csv"));
	$imgs = explode(",", $imgscontent);
	
	$sep = "_ANY_STRING_WILL_DO_AS_A_SEPARATOR";
	
	if(is_ie_on_vista() && !isset($_GET['plaintext']) ){
		//$FULL_REQUEST_URI = 'http://'.$_SERVER['HTTP_HOST'].
		$uri = $FULL_REQUEST_URI;
		if(empty($_SERVER['QUERY_STRING'])){
			$uri .= '?';	
		}else{
			$uri .= '&';
		}
		$uri = 'mhtml:' . $uri . 'plaintext=1';
		header('Location: ' . $uri);
		exit;
	}
	
	header("Content-Type: multipart/related; boundary=\"$sep\"");
	
	foreach($imgs as $img) {
		echo "\r\n
	}
}
*/
function printNavig($fmt) {
	global $files;
	foreach($files as $filepath) {
		$file = explode(".", $filepath);
		$filename = $file[0];
		if(!$filename) $filename = 'home';
		printf($fmt, $filename, $filename, $filename);
	}
}

$cssids = array();
function init_images() {
	global $files;
	global $FILEDIR;
	global $css;
	foreach($files as $filepath) {
		ob_start();
		include($FILEDIR.$filepath);
		ob_clean();
	}
}
function addEmbeddedImageToCSS($id, $file) {
	global $IMGDIR;
	global $cssids;
	$file = $IMGDIR.$file;
	$sz = getimagesize($file);
	$w = $sz[0];
	$h = $sz[1];
    $fmt = "background:url(\"%s\") top left no-repeat; width:$w"."px; height:$h"."px;";
	$outfmt = "<div id='$id'";
    if(ae_detect_ie()) {
        $cssids[$id] = sprintf($fmt, $file);
        //$uri = 'http://'.$_SERVER['HTTP_HOST'
    } else {
        $fileparts = explode(".", $file);
        $fileext = $fileparts[count($fileparts)-1];
        $img = file_get_contents($file);
        $b64 = chunk_split(base64_encode($img));
        $bad = "data:image/$fileext;base64,".$b64;
        $good = str_replace("\r\n", "\\\r\n", $bad);
        $cssids[$id] = sprintf($fmt, $good);
    }
	printf($outfmt);
}
function output_computed_css() {
	global $cssids;
	foreach($cssids as $id => $expr) {
		echo "div#$id { $expr }\n";
	}
}
function printContent() {
	global $files;
	global $FILEDIR;
	foreach($files as $filepath) {
		$file = explode(".", $filepath);
		$filename = $file[0];
		if(!$filename) $filename = 'home';
		$filepathend = $filepath;
		$filepath = $FILEDIR.$filepath;
		if(!isset($_GET['p'])) {
			$urlparts = explode("#", $_SERVER['REQUEST_URI'], 1);
			if(count($urlparts) > 1 && $urlparts[1] == $filename)
				echo cachedeval(" include('config.inc');include('util.inc');?>".file_get_contents($filepath)." <?php ", $filepathend);
			else if($filename == "home")
				echo cachedeval(" include('config.inc');include('util.inc');?>".file_get_contents($filepath)." <?php ", $filepathend);
		} else { // Any page and JS disabled
			if($_GET['p'] == $filename)
				echo cachedeval(" include('config.inc');include('util.inc');?>".file_get_contents($filepath)." <?php ", $filepathend);
		}
	}
}
function printTitle() {
	global $files;
	global $titles;
	global $FILEDIR;
	foreach($files as $idx => $filepath) {
		$file = explode(".", $filepath);
		$filename = $file[0];
		if(!$filename) $filename = 'home';
		if(!isset($_GET['p'])) { // Home page or JS enabled
			$urlparts = explode("#", $_SERVER['REQUEST_URI'], 1);
			if(count($urlparts) > 1 && $urlparts[1] == $filename)
				echo $titles[$idx];
			else if($filename == "home")
				echo $titles[$idx];
		} else { // Any page and JS disabled
			if($_GET['p'] == $filename)
				echo $titles[$idx];
		}
	}
}
