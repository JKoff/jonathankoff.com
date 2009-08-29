<?php	ob_start();
		include("config.inc");
		include($INCLUDEDIR."init.inc");
		function jflush() { }
?>
<?php	$br = 'gen';
		if(ae_detect_ie()) $br = 'ie';
		if(ae_detect_ie8()) $br = 'ie8';
		$indexcachefile = $CACHEDIR."index.php.".$br;
		if(strstr($_SERVER['HTTP_ACCEPT_ENCODING'],'gzip')) {
			header('Content-Encoding: gzip');
			$indexcachefile = $CACHEDIR."index.php.gz".$br;
		}
		if($MASKSRV) {
			header('X-Powered-By: Pigeons');
		}
		ob_clean();
		if(!file_has_changed($indexcachefile, "../index.php", $INCLUDEDIR."init.inc", $INCLUDEDIR."cache.inc", $INCLUDEDIR."dynamic.inc")) {
			date_default_timezone_set('UTC');
			//header("ETag: \"".getETag($indexcachefile)."\"");
			header("Last-Modified: ".gmdate("D, d M Y H:i:s \G\M\T",filemtime($indexcachefile)));
			header("Expires: ".gmdate("D, d M Y H:i:s \G\M\T",filemtime($indexcachefile)+$EXPIRETIME));
			if(isset($_SERVER['HTTP_IF_NONE_MATCH']) &&
			$_SERVER['HTTP_IF_NONE_MATCH'] == "\"".getETag($indexcachefile)."\"") {
				header("HTTP/1.0 304 Not Modified");
				exit;
			}
			if(isset($_SERVER['HTTP_IF_MODIFIED_SINCE']) &&
			strtotime($_SERVER['HTTP_IF_MODIFIED_SINCE']) >=
			filemtime($indexcachefile)) {
				header("HTTP/1.0 304 Not Modified");
				exit;
			}
			echo file_get_contents($indexcachefile);
		} else {
			$fp = fopen($indexcachefile, 'w');
			fwrite($fp, "");
			fclose($fp);
			date_default_timezone_set('UTC');
			//header("ETag: ",getETag($indexcachefile));
			header("Last-Modified: ".gmdate("D, d M Y H:i:s \G\M\T",filemtime($indexcachefile)));
			header("Expires: ".gmdate("D, d M Y H:i:s \G\M\T",time()+$EXPIRETIME));
			ob_start();
			ob_start(); init_images(); ob_clean();
?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
	<head>
		<title><?php printTitle(); ?></title>
<?php	echo file_get_contents($FILEDIR."header.html");	?>
		<style type="text/css">
<?php	echo file_get_contents($CSSDIR."/default.css");	?>
<?php	if(ae_detect_ie()) {	?>
<?php		echo file_get_contents($CSSDIR."/allie.css");	?>
			#yui-history-iframe {
				position:absolute;
				top:0; left:0;
				width:1px; height:1px;
				visibility:hidden;
			}
<?php	}	?>
		</style>
<?php	if(ae_detect_ie()) {	?>
<!--[if lt IE 8]>
		<style type="text/css">
<?php		echo file_get_contents($CSSDIR."/ie67.css");	?>
		</style>
<![endif]-->
<!--[if lt IE 7]>
		<style type="text/css">
<?php		echo file_get_contents($CSSDIR."/ie6.css");	?>
		</style>
<![endif]-->
<?php	}	?>
		<style type="text/css">
<?php		output_computed_css();	?>
		</style>
	</head>
	<body>
<?php	if(ae_detect_ie()) {	?>
			<iframe id="yui-history-iframe" src="files/empty.html"></iframe>
<?php	}	?>
	<input id="yui-history-field" type="hidden" />
<?php	jflush(); ?>
		<div id="nav">
			<ul>
<?php			printNavig("<li><a href='$PATH%s/'>%s</a></li>");	?>
			</ul>
		</div>
<?php	jflush(); ?>
		<div id="content">
<?php		printContent();	?>
		</div>
<?php	jflush(); ?>
<?php	if(ae_detect_ie()) {	?>
			<script type="text/javascript" src="http://yui.yahooapis.com/2.7.0/build/yahoo-dom-event/yahoo-dom-event.js"></script>
			<script type="text/javascript" src="http://yui.yahooapis.com/2.7.0/build/history/history-min.js"></script>
<?php	}	?>
<?php	include("includes/dynamic.inc");	?>
	</body>
</html>

<?php	//stop_and_reveal_timer(); ?>
<?php	$indexfin = ob_get_clean(); ob_start();
		if(strstr($_SERVER['HTTP_ACCEPT_ENCODING'],'gzip'))
			$indexfin = gzencode(/*preg_replace("/(\r\n|\n)/","",*/$indexfin/*)*/, 9);
		$fp = fopen($indexcachefile, 'w');
		fwrite($fp, $indexfin);
		fclose($fp);
		date_default_timezone_set('UTC');
		ob_clean();
		echo $indexfin;
	}
?>

