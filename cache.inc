<?php
include("config.inc");
/* $timefile -> file to compare timestamp with */
function file_has_changed($timefile) {
	$content = trim(file_get_contents("files.csv"));
	$files = explode(",", $content);
	array_push($files, "dynamic.js", "yahoo-min.js", "event-min.js", "history-min.js");
    global $CACHEDIR;
	$ret = false;
	$timefile;
	foreach($files as $file) {
		if(file_exists($file) &&
				(filemtime($file) > filemtime($timefile))) {
			$ret = true;
			break;
		}
	}
	return $ret;
}
function cachedeval($str, $file) {
    global $CACHEDIR;
    $cachefile = $CACHEDIR.$file;
    if(file_exists($file) &&
            (filemtime($file) < filemtime($cachefile))) {
        return file_get_contents($cachefile);
    } else {
        ob_start();
        eval($str);
        $fp = fopen($cachefile, 'w');
        $res = ob_get_clean();
        fwrite($fp, $res);
        fclose($fp);
        return $res;
    }
}

