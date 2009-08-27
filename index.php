<?php	//ob_start("ob_gzhandler"); // Comment to remove GZIP output. ?>
<?php	include("config.inc");
		include("init.inc");
		/**
			VARIABLES:
			$files: An array of filename strings
		*/
?>
<html>
	<head>
		<style type="text/css">
<?php	if(ae_detect_ie()) {	?>
			#yui-history-iframe {
				position:absolute;
				top:0; left:0;
				width:1px; height:1px;
				visibility:hidden;
			}
<?php	}	?>
		</style>
	</head>
	<body>
<?php	if(ae_detect_ie()) {	?>
			<iframe id="yui-history-iframe" src="empty.html"></iframe>
<?php	}	?>
	<input id="yui-history-field" type="hidden" />
<?php	flush(); ?>
		<div id="nav">
			<ul>
<?php			printNavig("<li><a href='$PATH/%s/'>%s</a></li>");	?>
			</ul>
		</div>
<?php	flush(); ?>
		<div>
			<div id="content">
<?php			printContent();	?>
			</div>
		</div>
<?php	flush(); ?>
<?php	include("dynamic.inc");	?>
	</body>
</html>

<?php stop_and_reveal_timer(); ?>

