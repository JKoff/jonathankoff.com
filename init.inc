<?php
//ob_start("ob_gzhandler"); // Comment to remove GZIP output.
include("timer.inc");
start_timer();

$content = trim(file_get_contents("files.csv"));
$files = explode(",", $content);

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
				eval(" include('config.inc');?>".file_get_contents($filepath));
			else if($filename == "home")
				eval(" include('config.inc');?>".file_get_contents($filepath));
		} else { // Any page and JS disabled
			if($_GET['p'] == $filename)
				eval(" include('config.inc');?>".file_get_contents($filepath));
		}
	}
}
