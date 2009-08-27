<?php
echo '<script type="text/javascript">';
echo "<!--\n";

$cachefile = $CACHEDIR."jsfiles.js";
if(file_has_changed($cachefile)) {
	ob_start();

	include($INCLUDEDIR."/jsmin-1.1.1.php");
	eval("?>".file_get_contents($JSDIR."dynamic.js"));
	$res = ob_get_clean();
	ob_start();
	echo JSMin::minify(file_get_contents($JSDIR."yahoo-min.js"));
	echo JSMin::minify(file_get_contents($JSDIR."event-min.js"));
	echo JSMin::minify(file_get_contents($JSDIR."history-min.js"));
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

echo "\n-->";
echo '</script>';
?>

