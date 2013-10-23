$(function() {
    $('.container').prepend(
        '<div id = "warning" style = "width: 500px; margin-left:auto; margin-right:auto; visibility:hidden;">
				<h1>WARNING</h1>
				<p>Your browser is outdated, so some elements of this page will not display correctly.  Future versions of this page may add support for older browsers, but for now you'll have to update.  Update your browser by clicking one of the images below and following the installation directions:</p>
				<div style = "width: 134px; margin-left:auto; margin-right:auto;">
				<a href="https://www.google.com/chrome" style="border: none;"><img src="css/img/chrome_64x64.png" alt="Chrome"></a>
				<a href="https://getfirefox.com" style="border: none;"><img src="css/img/firefox_64x64.png" alt="Firefox"></a>
				<a href="https://www.opera.com" style="border: none;"><img src="css/img/opera_64x64.png" alt="Opera"></a>
				<a href="https://www.apple.com/safari" style="border: none;"><img src="css/img/safari_64x64.png" alt="Safari"></a>
				</div>
			</div>'
            );
});