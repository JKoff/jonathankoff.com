<?php
$starttime = 0;
function start_timer() {
	global $starttime;
	$mtime = microtime();
	$mtime = explode(" ",$mtime);
	$mtime = $mtime[1] + $mtime[0];
	$starttime = $mtime;
}
function stop_and_reveal_timer() {
	global $starttime;
	$mtime = microtime();
	$mtime = explode(" ",$mtime);
	$mtime = $mtime[1] + $mtime[0];
	$endtime = $mtime;
	$totaltime = ($endtime - $starttime);
	printf("<p>Execution took %.3f s.</p>",$totaltime);
}
