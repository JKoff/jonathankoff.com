<?php
//ob_start("ob_gzhandler"); // Comment to remove GZIP output.
include("cache.inc");
include("timer.inc");
start_timer();

$content = trim(file_get_contents("files.csv"));
$lines = explode("\n", $content);
$files = explode(",", $lines[0]);
$titles = explode(",", $lines[1]);

function xhtml() {
	return (!ae_detect_ie() && !detect_safari());
}

function detect_safari() {
    if(isset($_SERVER['HTTP_USER_AGENT']) && 
    (strpos($_SERVER['HTTP_USER_AGENT'], 'Safari') !== false))
        return true;
    else
		return false;
}
function detect_opera() {
    if(isset($_SERVER['HTTP_USER_AGENT']) && 
    (strpos($_SERVER['HTTP_USER_AGENT'], 'Opera') !== false))
        return true;
    else
		return false;
}
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
function ae_detect_ie8()
{
    if(isset($_SERVER['HTTP_USER_AGENT']) && 
    (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE 8') !== false))
        return true;
    else
        return false;
}
function start_css() {
	if(!xhtml()) echo "";
	else echo "<!--/*--><![CDATA[/*><!--*/";
	echo "\n";
}
function end_css() {
	echo "\n";
	if(!xhtml()) echo "";
	else echo "/*]]>*/-->";
}
function start_js() {
	if(!xhtml()) echo "<!--";
	else echo "<!--/*--><![CDATA[/*><!--*/";
	echo "\n";
}
function end_js() {
	echo "\n";
	if(!xhtml()) echo "-->";
	else echo "/*]]>*/-->";
}

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
	$outfmt = "<span id='$id'";
	
	$fileparts = explode(".", $file);
	$fileext = $fileparts[count($fileparts)-1];
	$img = file_get_contents($file);
	$b64 = chunk_split(base64_encode($img));
	
    if(ae_detect_ie() && !ae_detect_ie8()) {
		$cssids["__$id"] = $b64;
		//$good = $file;
		$good = "mhtml:http://$_SERVER[SERVER_NAME]$_SERVER[REQUEST_URI]!$id";
		$fmt = "background:url(%s) top left no-repeat; width:$w"."px; height:$h"."px;";
        $cssids[$id] = sprintf($fmt, $good);
    } else if(ae_detect_ie8()) {
		$b2 = base64_encode($img);
		$good = "data:image/$fileext;base64,".$b2;
		$fmt = "background:url(%s) top left no-repeat; width:$w"."px; height:$h"."px;";
		$cssids[$id] = sprintf($fmt, $good);
	} else {
		$bad = "data:image/$fileext;base64,".$b64;
		$good = str_replace("\r\n", "\\\r\n", $bad);
		$fmt = "background:url(\"%s\") top left no-repeat; width:$w"."px; height:$h"."px;";
		$cssids[$id] = sprintf($fmt, $good);
    }
	printf($outfmt);
}
function output_computed_css() {
	global $cssids;
	if(ae_detect_ie() && !ae_detect_ie8()) {
		echo "/*\r\n";
		echo "Content-Type: multipart/related; boundary=\"_ANY_STRING_WILL_DO_AS_A_SEPARATOR\"\r\n\r\n";
	}
	
	foreach($cssids as $id => $expr) {
		if($id[0] == "_") continue;
		if(ae_detect_ie() && !ae_detect_ie8()) {
			echo "--_ANY_STRING_WILL_DO_AS_A_SEPARATOR\r\n";
			echo "Content-Location:$id\r\n";
			echo "Content-Transfer-Encoding:base64\r\n\r\n";
			echo $cssids["__$id"]."\r\n";
		}
	}
	if(ae_detect_ie() && !ae_detect_ie8())
		echo "*/\r\n\r\n";
	foreach($cssids as $id => $expr) {
		if($id[0] == "_") continue;
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
