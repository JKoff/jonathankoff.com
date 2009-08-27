<?php
//ob_start("ob_gzhandler"); // Comment to remove GZIP output.
include("config.inc");
include("cache.inc");
include("timer.inc");
start_timer();

$content = trim(file_get_contents("files.csv"));
$files = explode(",", $content);

function ae_detect_ie()
{
    if(isset($_SERVER['HTTP_USER_AGENT']) && 
    (strpos($_SERVER['HTTP_USER_AGENT'], 'MSIE') !== false))
        return true;
    else
        return false;
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

function printContent() {
	global $files;
	foreach($files as $filepath) {
		$file = explode(".", $filepath);
		$filename = $file[0];
		if(!$filename) $filename = 'home';
		if(!isset($_GET['p'])) { // Home page or JS enabled
			$urlparts = explode("#", $_SERVER['REQUEST_URI'], 1);
			if(count($urlparts) > 1 && $urlparts[1] == $filename)
				echo cachedeval(" include('config.inc');?>".file_get_contents($filepath), $filepath);
			else if($filename == "home")
				echo cachedeval(" include('config.inc');?>".file_get_contents($filepath), $filepath);
		} else { // Any page and JS disabled
			if($_GET['p'] == $filename)
				echo cachedeval(" include('config.inc');?>".file_get_contents($filepath), $filepath);
		}
	}
}
