<?php
/* $timefile -> file to compare timestamp with */
function file_has_changed() {
	$content = trim(file_get_contents("files.csv"));
	$lines = explode("\n", $content);
	$files = explode(",", $lines[0]);
	$titles = explode(",", $lines[1]);
	array_push($files, "../config.inc", "js/dynamic.js", "js/yahoo-min.js", "js/event-min.js", "js/history-min.js", "includes/util.inc");
	$nargs = func_num_args(); $arg_list = func_get_args();
	$timefile = $arg_list[0];
	for($i=1; $i < $nargs; $i++) {
		array_push($files, $arg_list[$i]);
	}
    global $CACHEDIR;
	global $FILEDIR;
	$ret = false;
	foreach($files as $file) {
		if(substr($file,0,2) != "js" &&
			substr($file,0,2) != "in") $file = $FILEDIR.$file;
		if(!file_exists($timefile)) { $ret = true; break; }
		if(filemtime($file) > filemtime($timefile)) {
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
function getETag($file) {
	date_default_timezone_set('UTC');
	$dt = date("l jS \of F Y h:i:s A u",filemtime($file));
	return md5($file.$dt);
}

