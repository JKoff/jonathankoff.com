<?php	ob_start();
		include("config.inc");
		include($INCLUDEDIR."init.inc");
		function jflush() { }
		$br = 'gen';
		if(ae_detect_ie()) $br = 'ie';
		if(ae_detect_ie8()) $br = 'ie8';
		if(detect_safari()) $br = 'saf';
		if(detect_opera()) $br = 'oper';
		$indexcachefile = $CACHEDIR."index.php.".$br;
		$ct = "";
		if(xhtml()) $ct= 'application/xhtml+xml; charset=UTF-8';
		else $ct= 'text/html; charset=UTF-8';
		header('Content-Type: '.$ct);
		if(strstr($_SERVER['HTTP_ACCEPT_ENCODING'],'gzip')) {
			header('Content-Encoding: gzip');
			$indexcachefile = $CACHEDIR."index.php.gz".$br;
		}
		if($MASKSRV) {
			header('X-Powered-By: Pigeons');
		}
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
			ob_end_clean();
			echo file_get_contents($indexcachefile);
		} else {
			$fp = fopen($indexcachefile, 'w');
			fwrite($fp, "");
			fclose($fp);
			date_default_timezone_set('UTC');
			//header("ETag: ",getETag($indexcachefile));
			header("Last-Modified: ".gmdate("D, d M Y H:i:s \G\M\T",filemtime($indexcachefile)));
			header("Expires: ".gmdate("D, d M Y H:i:s \G\M\T",time()+$EXPIRETIME));
			init_images();
			ob_end_clean();
			ob_start();
?>
<?php	if(substr($ct, 0, 2) != "ap") {	?>
<!DOCTYPE html>
<html>
<?php } else { ?>
<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.1//EN" "http://www.w3.org/TR/xhtml11/DTD/xhtml11.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">
<?php } ?>
	<head>
<?php	if(substr($ct, 0, 2) == "ap") {	?>
			<meta http-equiv="Content-type" content="<?php echo $ct; ?>" />
<?php	} else {	?>
			<meta http-equiv="charset" content="UTF-8" />
<?php	}	?>
		<title><?php printTitle(); ?></title>
<?php	if(ae_detect_ie()) echo file_get_contents($FILEDIR."headerie.html");	?>
<?php	if(!ae_detect_ie()) echo file_get_contents($FILEDIR."header.html");	?>
		<style type="text/css"><?php start_css(); ?>
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
		<?php end_css(); ?></style>
<?php	if(ae_detect_ie()) {	?>
<!--[if lt IE 8]>
		<style type="text/css"><?php start_css(); ?>
<?php		echo file_get_contents($CSSDIR."/ie67.css");	?>
		<?php end_css(); ?></style>
<![endif]-->
<!--[if lt IE 7]>
		<style type="text/css"><?php start_css(); ?>
<?php		echo file_get_contents($CSSDIR."/ie6.css");	?>
		<?php end_css(); ?></style>
<![endif]-->
<?php	}	?>
		<style type="text/css"><?php start_css(); ?>
<?php		output_computed_css();	?>
		<?php end_css(); ?></style>
	</head>
	<body>
<?php	if(ae_detect_ie()) {	?>
			<iframe id="yui-history-iframe" src="files/empty.html"></iframe>
<?php	}	?>
	<fieldset style="display:none"><input id="yui-history-field" type="hidden" /></fieldset>
<?php	jflush(); ?>
		<div id="nav">
			<ul>
<?php			if(ae_detect_ie() || detect_safari()) printNavig("<li><a href='#%s'>%s</a></li>");
				else printNavig("<li><a href='$PATH%s/'>%s</a></li>");	?>
			</ul>
		</div>
<?php	jflush(); ?>
		<div id="content">
<?php		printContent();	?>
		</div>
<?php	jflush(); ?>
<?php	include("includes/dynamic.inc");	?>
	</body>
</html>
<?php	$indexfin = ob_get_contents(); ob_end_clean(); ob_start();
		if(strstr($_SERVER['HTTP_ACCEPT_ENCODING'],'gzip'))
			$indexfin = gzencode($indexfin, 9);
		$fp = fopen($indexcachefile, 'w');
		fwrite($fp, $indexfin);
		fclose($fp);
		date_default_timezone_set('UTC');
		ob_end_clean();
		echo $indexfin;
	}
?>
