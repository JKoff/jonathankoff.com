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
		<script type="text/javascript" src="<?php echo $PATH; ?>historyState.js"></script>
		<style type="text/css">
			.js { display:none }
			.nojs { display:inline }
		</style>
	</head>
	<body>
<?php	flush(); ?>
		<div class="js">
			<ul>
<?php			printNavig("<li><a href='#%s' onclick='reparse1(\"%s\")'>%s</a></li>");	?>
			</ul>
		</div>
<?php	flush(); ?>
		<div class="nojs">
			<ul>
<?php			printNavig("<li><a href='$PATH%s/'>%s</a></li>");	?>
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

