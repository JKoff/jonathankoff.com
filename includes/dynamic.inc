<?php
if(detect_opera()) return;
echo '<script type="text/javascript">';
start_js();
echo "\n";

$br = 'gen';
if(ae_detect_ie()) $br = 'ie';
$cachefile = $CACHEDIR."jsfiles.js.".$br;
if(file_has_changed($cachefile)) {
	ob_start();

	include($INCLUDEDIR."jsmin-1.1.1.php");
	eval("?>".file_get_contents($JSDIR."dynamic.js"));
	$res = ob_get_clean();
	ob_start();
	if(ae_detect_ie8()) {
		echo JSMin::minify(file_get_contents($JSDIR."yahoo-min.js"));
        echo JSMin::minify(file_get_contents($JSDIR."event-min.js"));
        echo JSMin::minify(file_get_contents($JSDIR."history-min.js"));
	} else if(!ae_detect_ie()) {
		echo JSMin::minify(file_get_contents($JSDIR."yahoo-min.js"));
		echo JSMin::minify(file_get_contents($JSDIR."event-min.js"));
		echo JSMin::minify(file_get_contents($JSDIR."history-min.js"));
	} else {
		echo JSMin::minify(file_get_contents($JSDIR."json2005.js"));
        echo JSMin::minify(file_get_contents($JSDIR."rsh.js"));
	}
	echo JSMin::minify($res);
	$fin = ob_get_clean();
	
	echo $fin;
	flush();
	$fp = fopen($cachefile, 'w');
	fwrite($fp, $fin);
	fclose($fp);
} else {
	echo file_get_contents($cachefile);
}

echo "\n";
end_js();
echo '</script>';
