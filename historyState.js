
/**
HistoryState 0.03
Copyright (c) 2006-2007 David Bloom
http://bloomd.home.mchsi.com
http://www.facebook.com/p/David_Bloom/76301038
Email: futuramagmail.com (add an @ before gmail.com)

Changes:
v0.03: safari 2 bugfixes
v0.02: added safari 2, 3 support
v0.01: initial release

DISCLAIMER: Although I am currently working as an intern for Google, this software is my own independent work, and is therefore neither supported nor endorsed by my employer.

Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
**/

if (typeof(window.historyState) == "undefined") {
	// See if we are running in an iframe (used in the implementation on several browsers).
	// We test the location to prevent cross-site scripting that could be done by spoofing the
	// historyState object in the parent frame. *Keep that in mind before you modify this code!*
	if ((typeof(top.window.historyState) != "undefined") &&
		(top.document.URL.split("#")[0] === document.URL.split("#")[0])) {
		// Get the child historyState object
		// var historyState = top.window.historyState._getChild();
		//alert("CHILD");
		window.historyState = top.window.historyState;
		document.write('<base target="_TOP">');
		if (top.window.historyState._addSafariEvents) {
			var _timer = setInterval(function() {
				if (/loaded|complete/.test(document.readyState)) {
					clearInterval(_timer);
					var _body = document.body;
					_body.addEventListener('selectstart',
						top.window.historyState._wk_selectEvent,false);
					_body.addEventListener('keyup',
						top.window.historyState._wk_keyUpEvent,false);
					_body.addEventListener('mousemove',
						top.window.historyState._wk_mouseMoveEvent,false);
				}
			},10);
		}
		//window.setTimeout(function(){document.body.setAttribute("onselectstart"," return top.window.historyState._wk_dragOverEvent();");},1000);
		
		//window.setTimeout(function(){document.body.setAttribute("onmouseup"," return top.window.historyState._wk_dragLeaveEvent();");},1000);
	} else {
		new function() {
			// This reduces the number of slow DOM lookups. Also,
			// the underscore prefix is used to optimize this script for
			// Javascript "compressors" such as the one at
			// http://dean.edwards.name/packer
			var _this=this,_window=window;
			var _history=_window.history,_location=_window.location,
				_document=_window.document,_navigator=_window.navigator;
			var _write=_document.write,_createElement=_document.createElement,
				_head=_document.getElementsByTagName("head")[0];
			
			_window.historyState = _this;
			
			var _makeTestFunction = function($teststring) {
				$teststring=$teststring.toLowerCase();
				return function($substring) {
					return ($teststring.indexOf($substring.toLowerCase())+1);
				};
			};

			/*********************************
			Browser detect
			*********************************/
			var _browser;
			_browser_detect: {			
				// iCab 3
				// Detection method based on http://www.muchsoft.com/inscript/features.html
				// If you don't support iCab yet, you should! It is a *very* capable browser, and supporting
				// it will make your website available to MacOS 8.5-9 users.
				if (_window.ScriptEngine && (ScriptEngine().indexOf("InScript")+1)
					&& (ScriptEngineMajorVersion() >= 3)) {
					_browser = "icab";
					break _browser_detect;
				}
				
				// Opera 8+
				if (_window.opera && opera.version
					&& (opera.version().split(".")[0]>=8)) {
					_browser = "opera";
					break _browser_detect;
				}
				
				// Konqueror
				if (_navigator.vendor === "KDE") {
					_browser = "konqueror";
					break _browser_detect;
				}
				
				var _isUserAgent = _makeTestFunction(_navigator.userAgent);
				
				// Safari, Omniweb
				if (_isUserAgent("applewebkit/")) {
					_browser = _document.evaluate?"webkit":"oldwebkit";
					break _browser_detect;
				}
				
				// Internet Explorer 6 and above
				// Create a conditional comment and read its innerText
				// innerText === "ie"		Internet Explorer 6 and above
				// innerText === ""		older Internet Explorer, non-IE browsers
				// innerText === undefined	Browsers that don't support innerText
				// (Sidenote: you don't actually need to appendChild the div to read its innerText)
				if (function(){
						try {
							var $ietest=_createElement("div");
							$ietest.innerHTML="<!--[if gte IE 6]>ie<![endif]-->";
							var $result = $ietest.innerText==="ie";
							delete $ietest;
							return $result;
						} catch(e) {
							return 0;
						}
					}()) {
					_browser = "msie";
					break _browser_detect;
				}
								
				// Gecko (Firefox)
				// Test for getElementById to filter out Netscape 4
				if ((!_isUserAgent("compatible")) &&
					(_isUserAgent("mozilla")) &&
					(_document.getElementById))	{
					_browser = "moz";
					break _browser_detect;
				}
				
				if (_isUserAgent("netpositive")) {
					alert(" \n\tOld NetPositive\n\tHas weak Javascript support\n\tPlus, my Athlon is XP\n\n--the script author");
					return false;
				}
				
				// "Generic" implementation
				// Uses only "safe" methods. Adds a counter to the end of the location bar.
				_browser="generic";
				break _browser_detect;
			}
			
			var _fireOnListenerAdd = false;
			var _listener = function() {
				_fireOnListenerAdd = true;
			};
			var _isStorageReady = false;
			var _fireOnLoadListener = false;
			var _loadListener = function () {
				_fireOnLoadListener = true;
			}
			var _fireLoadListener = function() {
				_isStorageReady = true;
				_historyQueueWaitFlush();
				if (_browser == "msie") {
					
				}
				_loadListener();
			};
			/*********************************
			Storage
			*********************************/
			var _saveQueued = false;
			var _doSave = function() {
				_browser_save();
				_saveQueued = false;
			};
			var _queueSave = function() {
				if (!(_saveQueued)) {
					_saveQueued = true;
					_window.setTimeout(_doSave,100);
				}
			};
			var _compileJS;
			if (typeof(Object.toSource) == "function") {
				_compileJS = function($data) {
					return $data.toSource();
				};
			} else {
				_compileJS = function($data) {
					return '(' + _doCompileJS($data) + ')';
				};
				_doCompileJS = function($data) {
					switch (typeof $data) {
						case "string":
							return "\""+$data.replace(/\\/g,"\\\\").replace(/\"/g,"\\\"").replace(/\'/g,"\\\'").replace(/\n/g,"\\\n").replace(/\t/g,"\\\t").replace(/\//g,"\\\/")+"\"";
							//replace(/\f/g,"\\\f").
							//replace(/\r/g,"\\\r").replace(/\b/g,"\\\b")
							// break is not needed because of return
						case "object":
							if ($data instanceof Array) {
								var $stuff=[],i = $data.length-1;
								if (i == -1) return "[]";
								do {
									$stuff[i]=(_doCompileJS($data[i]));
								} while (i--);
								return ("[" + $stuff.join(",") + "]");
							}
							if ($data instanceof Date) {
								return "(new Date(\""+_doCompileJS($data.toString())+"\"))";
							}
							
							var $stuff=[],$object,i=0;
							for ($object in $data) {
								//alert($object);
								$stuff[i++]=($object + ":" + _doCompileJS($data[$object]));
							}
							return "{"+$stuff.join(",")+"}";
						case "boolean":
						case "number":
							return ($data).toString();
						default:
							return "";
							try {
								return _doCompileJS($data.toString());
							} catch(e) {
								return "";
							}
					}
				};
			}
			var _loadCachedSession = function($data) {
			//alert("FOO!");
			//alert(_compileJS($data));
				_storedObject = $data;
				//alert("load "+(_storedObject));
				_this.session = _storedObject._session._storage;
				_this.state = _storedObject._state._storage;
				_fireLoadListener();
			};
			var _storedObject;
			var _getStoredObject = function() {
				//alert("session: "+_storedObject._session.toSource());
				_storedObject._session._storage = _this.session;
				_storedObject._state._storage = _this.state;
				return _storedObject;
			};
			// If there was actually no data stored, then recreate our storage object.
			var _noData = function() {
				var $urlFragment = _stripHash(_location.hash);
				if (_browser == 'webkit' || _browser == 'oldwebkit') {
					$urlFragment = unescape($urlFragment);
				}
				_storedObject =
					{
						_session: {
							//somethingRandom: Math.random(),
							_storage: {
							}
						},
						_state: {
							_historyInfo: [
								{
									_title: document.title,
									_urlFragment: $urlFragment
								}
							],
							_storage: [
								{
								}
							]
						}
					};
				_this.session = _storedObject._session._storage;
				_this.state = _storedObject._state._storage;
				_queueSave();
				_fireLoadListener();
				//if ($urlFragment) {
				//	_listener();
				//}
			};
			
			/*********************************
			History
			*********************************/
			// _currentIndex changes whenever history actions are queued, even though they
			// have not been executed yet. It is what is reported by the APIs.
			var _currentIndex = 0;
			// This is the actual value of the index. It is used to garbage collect if a user-initiated
			// history action takes place (address bar entry, back button while _historyQueue has
			// unexecuted actions, etc)
			var _actualIndex = 0;
			var _userInteractionValue = 0;
			var _userChangeIndex = function($newIndex,$addressBar) {
				if ($addressBar) {
					_userInteractionValue=0;
					if (_isStorageReady) {
						_this.state.splice($newIndex,_this.state.length-$newIndex);
						_storedObject._state._historyInfo.splice($newIndex+1,_storedObject._state._historyInfo.length-$newIndex-1);
					}
				} else {
					_userInteractionValue=$newIndex - _currentIndex;
				}
				_currentIndex = $newIndex;
				_actualIndex = $newIndex;
				
				// clear out queue!
				_historyQueue = new Array();
				
				_queueSave();
				
				_listener();
			};
			var _scriptChangeIndex = function($newIndex) {
				_actualIndex = $newIndex;
				_queueSave();
				if (_historyQueue.length) {
					_historyQueueStart();
				} else {
					// clear out forward history
					if (_isStorageReady) {
						if ($newIndex < _this.state.length) {
							_this.state.splice(parseInt($newIndex),_this.state.length-$newIndex);
							if ($newIndex + 1 < _this.state.length) {
								_getStoredObject()._state._historyInfo.splice($newIndex+1,_storedObject._state._historyInfo.length-$newIndex-1);
							}
						}
					}
				}
			};
			var _historyQueue = new Array();
			var _historyQueueItem = function($index,$urlFragment) {
				this._index = $index;
				this._urlFragment = $urlFragment;
			};
			
			// Our history queue adders rely on storage being ready. If storage isn't ready, we set up
			// ANOTHER queue which will basically will be flushed to the adders once storage is ready.
			// _historyQueueWaitFlush gets called by _fireLoadListener.
			var _historyQueueWaitFlush = function() {
				var _item;
				while (_historyQueueWaitingForStorage.length) {
					_item = _historyQueueWaitingForStorage.shift();
					if (_item._replace) {
						_replaceToHistoryQueue(_item._urlFragment,_item._title);
					} else {
						_addToHistoryQueue(_item._urlFragment,_item._title);
					}
				}
			};
			
			var _historyQueueWaitingForStorage = new Array();
			var _historyQueueWaitingItem = function($replace,$urlFragment,$title) {
				this._replace=$replace;
				this._urlFragment=$urlFragment;
				this._title=$title;
			};
			
			var _historyQueueStart = function() {
				if (_historyQueue.length) {
					var x = _historyQueue.shift();
					_browser_add(x._index);
				}
			};
			
			var _storedHistoryObject = function($title,$urlFragment) {
				this._title=$title;
				this._urlFragment=$urlFragment;
			};
			
			var _addToHistoryQueue = function($urlFragment,$title) {
				if (_isStorageReady) {
					var x = new _historyQueueItem(++_currentIndex,$urlFragment);
					_storedObject._state._historyInfo[_currentIndex] =
						new _storedHistoryObject(
							$title?$title:_document.title,
							$urlFragment
						);
					//alert(_compileJS(_storedObject.state.historyInfo));
					_this.state[_currentIndex] = {};
					_historyQueue.push(x);
					if (_historyQueue.length == 1) {
						_historyQueueStart();
					}
				} else {
					var x = new _historyQueueWaitingItem(false,$urlFragment,_document.title);
					_historyQueueWaitingForStorage.push(x);
				}
			};
			var _replaceToHistoryQueue = function($urlFragment,$title) {
				if (_isStorageReady) {
					_storedObject._state._historyInfo[_currentIndex] =
						new _storedHistoryObject(
							$title?$title:_document.title,
							$urlFragment
						);
					_this.state[_currentIndex] = {};
					if (_historyQueue.length) {
						_historyQueue[_historyQueue.length-1]._urlFragment = $urlFragment;
					} else {
						_browser_replace(_currentIndex);
					}
					_queueSave();
				} else {
					if (_historyQueueWaitingForStorage.length) {
						_historyQueueWaitingForStorage[_historyQueueWaitingForStorage.length-1]._urlFragment=$urlFragment;
					} else {
						var x = new _historyQueueWaitingItem(true,$urlFragment,_document.title);
						_historyQueueWaitingForStorage.push(x);
					}
				}
			};
			var _stripHash = function($hash) {
				if ($hash) {
					return $hash.substr($hash.indexOf("#")+1);
				}
				return "";
			};
			/*********************************
			Browser-specific code
			*********************************/
			switch (_browser) {
				case "msie":
					// For my convenience :-), this code is not cleanly organized
					// into "storage" and "history" parts.
				
					// It turns out that IE will cache the content of iframes which
					// have an src that is a javascript: URI that does document.write.
					// By creating the <iframe> in our <head> tag, and following it
					// with a <script> whose src is a "javascript:void(0);", we can
					// retrieve our stored session data before the rest of the scripts
					// on the page start processing.
					// (Sidenote: <iframes> in the <head> tag are not rendered and
					// therefore do not have to be hidden with CSS)
					// This does not always work, however. For example, the iframe
					// does not load the session data when the page is reloaded in some
					// cases. Also, it may not work well on some https sites. Finally, this
					// technique may not work in future versions of IE.
					// For this reason, we will occasionally "fall back" to the <textarea>
					// hack.
					
					var _ie_storageIframe;
					var _ie_historyIframe;
					
					// <meta> tag required for persistence
					// (using persistence will make the textarea work even after the user presses F5
					// or CTRL+F5 to reload the page.)
					//_write("<meta name=\"save\" content=\"history\">");
					
					// used to identify if a history change is a result of a script action
					// or of user interaction that happened to preform the action the
					// script wanted (we need to know the difference because for the
					// latter, we need to clear out any queued history tasks).
					// We can't start at zero because then when the user returns to our page
					// after pressing "back" on a different site, this would start over again at
					// zero and that could lead to some false positives.
					// But this should be a safe starting value:
					var _ie_historyChangeId=((new Date).getTime() - (new Date(1,1,(new Date).getFullYear())).getTime())*1000;
					// ^ I have been thinking about using document.uniqueID for this (an IE-only feature),
					// but it is possible that Microsoft could change its behavior in future versions of IE
					// and that would make things kind of break.
					
					var _ie_storageTextarea;
					var _ie_hasIframeLoaded = false; // did the iframe load at all?
					var _ie_iframeDataLoaded; // did the iframe load any stored data?
					
					_ie_historyIframe = _createElement("iframe");
					_ie_historyIframe.setAttribute("name","iframeForHistory");
			//		_ie_historyIframe.style.behavior = "url(#default#savehistory)";
					
					var _ie_updateHashOnStorageReady = false;
					var _ie_currentHash = _location.hash;
					_ie_updateHash = function() {
						// do we have a hash?
						if (_isStorageReady) {
							// if so: load that.
							// alert(_currentIndex);
							var $hash = _getStoredObject()._state._historyInfo[_currentIndex]._urlFragment;
							if (_stripHash(_ie_currentHash) !== _stripHash($hash)) {
						//		alert("1 "+_stripHash(_ie_currentHash)+"\n2 "+_stripHash($hash)+"\n"+_currentIndex);
								_location.hash="#"+_stripHash($hash);
								_ie_currentHash=_location.hash;
							}
						} else {
							// if not: queue that.
							_ie_updateHashOnStorageReady = true;
						}
					};
					
					var _ie_addressBarChange = false;
					var _ie_watchHash = function() {
						if (_stripHash(_location.hash) !== _stripHash(_ie_currentHash)) {
							_ie_addressBarChange = _ie_historyChangeId;
							// clear out history queue...for IE we have to do it here.
							// why? IE is weird, that's why.
							_historyQueue = new Array();
							// this is kind of a cheap way to do this, but oh well.
							_this.newState(_stripHash(_location.hash));
						}
					};
					_window.setInterval(_ie_watchHash,250);
					
					var _ie_loadCachedSession = function($data) {
						_loadCachedSession($data);
						if (_ie_updateHashOnStorageReady)
							_ie_updateHash();
					};
					
					_this._ie_reportIndex = function($index,$historyChangeId) {
						// do this document.title thing so things look okay in the history dropdown menu.
						_ie_historyIframe.contentWindow.document.title=_document.title;
						if (_ie_historyChangeId == $historyChangeId) {
							if (_ie_addressBarChange == $historyChangeId) {
								// User-initiated (address bar)
								_userChangeIndex($index,true);
								_ie_currentHash = _location.hash;
							} else {
								// Script-initiated
								_scriptChangeIndex($index);
							}
						} else {
							// User-initiated (back button)
							_userChangeIndex($index,false);
						}
					if (_ie_addressBarChange == $historyChangeId) {
						_ie_addressBarChange = -1;
					} else {
						_ie_updateHash();
					}
					_ie_historyChangeId++;
					};
					var _ie_setHistoryIframe = function($index) {
						_ie_historyIframe.src = "javascript:document.open();document.write("+_compileJS("<script type=\"text\/javascript\">top.historyState._ie_reportIndex("+$index+","+_ie_historyChangeId+");<\/script><img src=\"javascript:void(0);\">")+");document.close();";
					};
					if (!_ie_historyIframe.src) {
						_ie_setHistoryIframe(0);
					}
					_head.appendChild(_ie_historyIframe);
					
					_this._ie_iframeLoaded = function($data) {
						_ie_hasIframeLoaded = true;
						if (typeof($data) != "undefined") {
								_ie_iframeDataLoaded = true;
							if (!_isStorageReady) {
							
						//						alert(_compileJS($data));
						//	(document.documentElement.outerHTML);
								_ie_loadCachedSession($data);
							}
						} else {
							_ie_iframeDataLoaded = false;
						}
						if (_ie_storeInIframeWait) {
							_browser_save();
						}
					};
					
					var _ie_newStorageIframe = function($html) {
					//	document.title+="newstorage";
						// This variable needs to be public so that it can be accessible to the javascript
						// running in the scope of the iframe's "javascript:" SRC.
						_this._html = $html;
						var $tmp = _createElement("IFRAME");
				//		$tmp.style.behavior = "url(#default#savehistory)";
						
						// As long as "src" remains the same, whatever we document.write will remain the same.
						// (IE does NOT cache the javascript: URI itself. Instead, it caches whatever we
						// document.write, and then it associates it with that javascript: URI. So it is crucial
						// that we use the same javascript: URI so that our cached document.write will reload!)
						//if (!($tmp.src)) {
							$tmp.src = "javascript:document.open();document.write(top.historyState._html);document.close();";
						//}
						
						// Are we creating the iframe or replacing the old one?
						if (typeof(_ie_storageIframe) == "object") {
							// If we already have an iframe, swap it out with the new one.
							// (As a sidenote...we can't just recycle our old iframe by changing
							// it's src because that would mess up our history and also make
							// IE play that annoying "click" sound...)
							_head.replaceChild($tmp,_ie_storageIframe);
						} else {		
							// We don't have an iframe yet, so create one.
							_head.appendChild($tmp);
						}
						
						_ie_storageIframe=$tmp;
					};
				
					var _ie_storeInIframe = function($data) {
					//	document.title+="STORE";
						_ie_newStorageIframe("<script type=\"text\/javascript\">top.historyState._ie_iframeLoaded("+_compileJS($data)+");<\/script>");
					};
										
					// If a cached entry is used, then this HTML will not actually be loaded in the iframe.
					// But if this HTML is loaded, we know that the cache failed.
					_ie_newStorageIframe("<script type=\"text\/javascript\">top.historyState._ie_iframeLoaded();<\/script>");
					
					// !!!! I have to implement the history iframe BEFORE this so that we can know our history
					// state when the page loads...right?
					// This (hack) forces IE to wait for the javascript: URI of our IFRAME to load (and then
					// be processed by more of my script) before IE processes the rest of the page.
					_write("<script src=\"javascript:void(0);\"><\/script>");
					
					// ----
					
					// Now, set up the <textarea> fallback
					var _ie_textArea = _createElement("textarea");
					
					// id needed for persistence, even though we maintain an object reference and therefore
					// don't really need an id
					_ie_textArea.setAttribute("id","textAreaForSessionStorage");
					// behavior needed for persistence
					_ie_textArea.style.behavior = "url(#default#savehistory)";
					// doesn't actually need to be displayed
					_ie_textArea.style.display = "none";
				//	_ie_textArea.setAttribute("onload","historyState._ie_loadEvent()");
					// put it on the page
					_head.appendChild(_ie_textArea);
					
					var _ie_textAreaReady = false;
					var _ie_loadEvent = function() {
						_ie_textAreaReady = true;
					//	if (_ie_textArea.value) { alert(_ie_textArea.value) }
						//salert(_ie_textArea.value);
						if ((_ie_iframeDataLoaded == false) && (_ie_textArea.value)) {
						//	if (!(_ie_hasIframeLoaded)) {
								_ie_loadCachedSession(eval(_ie_textArea.value));
						//	}
						} else if (!(_ie_textArea.value)) {
							_noData();
						}
						if (_ie_storeInTextareaWait) {
							_browser_save();
						}
					};
					
					// check the textarea when this event fires
					// (because this is IE-only code we will attach the event the IE-only way)
					_window.attachEvent("onload",_ie_loadEvent);
					
					var _ie_storeInTextarea = function($data) {
						_ie_textArea.value = _compileJS($data);
					//	alert(_ie_textArea.value);
					};
					
					var _ie_storeInTextareaWait;
					var _ie_storeInIframeWait;
					
					// ******************************
					var _browser_save = function() {
						if (_isStorageReady) {
							if (_ie_textAreaReady) {
								_ie_storeInTextarea(_getStoredObject());
								_ie_storeInTextareaWait = false;
							} else {
								_ie_storeInTextareaWait = true;
							}
							if (_ie_hasIframeLoaded) {
								_ie_storeInIframe(_getStoredObject());
								_ie_storeInIframeWait = false;
							} else {
								_ie_storeInIframeWait = true;
							}
						}
					};
					var _browser_add = function($index) {
						_ie_setHistoryIframe($index);
					};
					var _browser_replace = function($index) {
						_ie_updateHash();
						_scriptChangeIndex($index);
						_ie_historyIframe.contentWindow.document.title=_document.title;
					};
					
					break;
				case "moz":
					// fx-new/test1.html
					// fx-anothertest.html
					//_write("<style type=\"text\/css\">body { overflow:-moz-scrollbars-none; -moz-user-select:-moz-none; -moz-user-focus:ignore; }<\/style>");

					var _moz_currentHash = _location.hash;
					var _moz_anticipatedIndex = -1;
					var _moz_anticipatedHash;
					
					// Strategically move the form around to maintain Firefox's form cache....
					_document.write("<\/head><body><form id=\"storageForm\" style=\"position:fixed;visibility:hidden;width:0px;height:0px;overflow:hidden;\"><textarea></textarea><\/form>");
					var _moz_storageForm = _document.getElementById("storageForm");
					_document.body.removeChild(_moz_storageForm);
					var _moz_oldHead = _head;
					_document.documentElement.removeChild(_head);
					var _moz_oldBody = _document.body;
					_document.documentElement.removeChild(_moz_oldBody);
					var _moz_newBody = _document.createElement("body");
					//_moz_newBody.style.overflow = "hidden";
					_moz_newBody.style.overflow = "-moz-scrollbars-none";
					_moz_newBody.style.MozUserFocus = "ignore";
					_moz_newBody.style.MozUserSelect = "none";
					
					_moz_newBody.appendChild(_moz_storageForm);
					var _moz_storageTextarea = _moz_storageForm.childNodes[0];
					_moz_storageTextarea.style.MozUserFocus = "ignore";
					_moz_storageTextarea.style.MozUserSelect = "none";
					_moz_storageTextarea.setAttribute("spellcheck","false");
					
					// For some reason, when you remove then recreate the <body>, this
					// becomes the only working way to attach event handlers.
					_moz_newBody.setAttribute("onscroll","historyState._moz_scrollEvent()");
					_moz_newBody.setAttribute("onkeydown","return historyState._moz_keyDownEvent(event);");
					_moz_newBody.setAttribute("onkeypress","return historyState._moz_keyDownEvent(event);");
					_moz_newBody.setAttribute("onkeyup","return historyState._moz_keyDownEvent(event);");					
					
					_moz_newBody.setAttribute("onmousedown","historyState._moz_activeTab();");
					_moz_newBody.setAttribute("onmouseover","historyState._moz_activeTab();");
					_moz_newBody.setAttribute("onmouseout","historyState._moz_activeTab();");
					_moz_newBody.setAttribute("onmousemove","historyState._moz_activeTab();");
					_moz_newBody.setAttribute("onmouseup","historyState._moz_activeTab();");
					_moz_newBody.setAttribute("onfocus","historyState._moz_activeTab();");
					
					
					var _moz_contentIframe = _document.createElement("iframe");
					// (For testing)
					//	_moz_contentIframe.src = "data:text/html;charset=utf-8,hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>";
					// Mozilla won't allow you to directly load the URL of the parent frame in a child frame, so we use
					// a simple workaround.
					_moz_contentIframe.src = "javascript:location.href="+_compileJS(_document.URL);
					_moz_contentIframe.style.width = "100%";
					_moz_contentIframe.style.height = "100%";
					_moz_contentIframe.style.position = "fixed";
					_moz_contentIframe.style.top = "0px";
					_moz_contentIframe.style.left = "0px";
					_moz_contentIframe.style.borderStyle = "none";
					_moz_contentIframe.style.backgroundColor = "white";
					_moz_contentIframe.style.overflow = "auto";
					
					// A spacer image is used because that works well even if the page
					// is loaded in quirks mode.
					var _moz_tallDiv = _document.createElement("div");
					_moz_tallDiv.style.position = "absolute";
					_moz_tallDiv.style.left = "100%";
					_moz_tallDiv.style.top = "100%";
					_moz_tallDiv.style.height = "auto";
			//		_moz_tallDiv.style.backgroundColor = "red";
			//		_moz_tallDiv.innerHTML="bah";
					var _moz_imageSpacer = _document.createElement("div");
					_moz_imageSpacer.style.height = "8000px";
					_moz_imageSpacer.style.width = "1px";
					_moz_imageSpacer.alt = "";
					_moz_imageSpacer.title = "";
					_moz_tallDiv.appendChild(_moz_imageSpacer);
					_moz_newBody.appendChild(_moz_tallDiv);
					
					_moz_newBody.appendChild(_moz_contentIframe);
				
					var _moz_scrollPosition = function($pos) {
						if (document.compatMode == "BackCompat") {
							if (typeof($pos) != "undefined") {
								_moz_newBody.scrollTop = $pos;
								return $pos;
							} else {
								return _moz_newBody.scrollTop;
							}
						} else {
							if (typeof($pos) != "undefined") {
								window.scrollTo(0,$pos);
								return $pos;
							} else {
								return self.pageYOffset;
							}
						}
					};
					
					// Mozilla likes to mess up the scroll position when the window is resized.
					var _moz_correctIndex = _moz_scrollPosition();
					var _moz_correctWidth = self.innerWidth;
					var _moz_correctHeight = self.innerHeight;
					var _moz_correctOuterWidth = self.outerWidth;
					var _moz_correctOuterHeight = self.outerHeight;
					
					_this._moz_scrollEvent = function() {
						//alert("SCROLLL!");
						if (_moz_scrollPosition() == _moz_correctIndex) {
							return;
						}
						if (((self.innerWidth != _moz_correctWidth) ||
							(self.innerHeight != _moz_correctHeight) ||
							(self.outerWidth != _moz_correctOuterWidth) ||
							(self.outerHeight != _moz_correctOuterHeight)) &&
							(_stripHash(_location.hash.toString()) === _stripHash(_moz_currentHash))) {
							_moz_scrollPosition(_moz_correctIndex);
							_moz_correctWidth = self.innerWidth;
							_moz_correctHeight = self.innerHeight;
							_moz_correctOuterWidth = self.outerWidth;
							_moz_correctOuterHeight = self.outerHeight;
							_moz_correctViewportOnActiveTab = false;
							return;
						}
						_moz_correctIndex = _moz_scrollPosition();
						if ((_stripHash(_location.hash.toString()) ===
							_stripHash(_moz_anticipatedHash))
							&& (_moz_anticipatedIndex == _moz_scrollPosition())) {
							_scriptChangeIndex(_moz_anticipatedIndex);
						} else {
							_userChangeIndex(parseInt(_moz_scrollPosition()),false);
						}
						_moz_anticipatedIndex = -1;
						_moz_currentHash = _location.hash;
						_moz_anticipatedHash = false;
					};
					var _moz_correctViewportOnActiveTab;
					_this._moz_activeTab = function() {
						if (_moz_correctViewportOnActiveTab) {
							_moz_correctWidth = self.innerWidth;
							_moz_correctHeight = self.innerHeight;
							_moz_correctOuterWidth = self.outerWidth;
							_moz_correctOuterHeight = self.outerHeight;
							_moz_correctViewportOnActiveTab = false;
						}
					}
					var _moz_poll = function() {
					
						if ((self.innerWidth != _moz_correctWidth) ||
							(self.innerHeight != _moz_correctHeight) ||
							(self.outerWidth != _moz_correctOuterWidth) ||
							(self.outerHeight != _moz_correctOuterHeight)) {
							_moz_scrollPosition(_moz_correctIndex);
							_moz_correctViewportOnActiveTab = true;
						}
						if ((_stripHash(_location.hash.toString()) !==
							_stripHash(_moz_currentHash))
							&& (_stripHash(_location.hash.toString()) !==
							_stripHash(_moz_anticipatedHash)) &&
							(_moz_scrollPosition() == _moz_correctIndex)) {
							_moz_scrollPosition(parseInt(_moz_scrollPosition())+1);
							_moz_correctIndex++;
							_moz_currentHash = _stripHash(_location.hash);
							 _getStoredObject()._state._historyInfo[_moz_correctIndex] = {_urlFragment:_stripHash(_moz_currentHash),_title:_document.title};
							_userChangeIndex(parseInt(_moz_scrollPosition()),true);
						}
					};
					setInterval(_moz_poll,100);
					
					_this._moz_keyDownEvent = function(e) {
						// This prevents the user from changing the scroll position by using the
						//  spacebar, home, end, page up, or page down keys, or the arrow keys.
						// I'm not sure how cross-platform this is....
						if (e.which > 40 || e.which < 32) {
							return true;
						}
						var _moz_temp = _document.createElement("input");
						_moz_temp.style.position="fixed";
						_moz_temp.setAttribute("autocomplete","off");
						_moz_newBody.appendChild(_moz_temp);
						_moz_temp.focus();
						_moz_newBody.removeChild(_moz_temp);
						delete _moz_temp;
						return false;
					};
					
					// Use a Firefox 2.0 feature if available. Firefox 2.0 spellchecks
					// textareas which is very slow, so we can use this to store our data
					// instead and only use the textarea to know which data to look up in
					// sessionStorage.
					var _moz_sessionId;
					if (_window.sessionStorage) {
						// Sessions each have a different storage key which is stored in the textarea
						// (session storage is shared in the top-level browsing context so we need to deal
						// with two instances of the site in the top-level browsing history - it is only different
						// for each browser window/tab.)
						// sessionStorage.historyState		total number of history states
						// sessionStorage.historyState0		if the textarea says "0" load this one
						if (_moz_storageTextarea.value.length) {
							_moz_sessionId = ("historyState"+_moz_storageTextarea.value);
						}
						if (sessionStorage[_moz_sessionId]) {
				//			alert(sessionStorage[_moz_sessionId]);
				//			alert(eval(sessionStorage[_moz_sessionId]));
				//alert(sessionStorage[_moz_sessionId]);
							_loadCachedSession(eval(sessionStorage[_moz_sessionId].toString()));
						} else {
							if (parseInt(sessionStorage.historyState) >= 0) {
								_moz_sessionId = ("historyState"+sessionStorage.historyState);
								_moz_storageTextarea.value = sessionStorage.historyState;
								sessionStorage.historyState = String(parseInt(sessionStorage.historyState)+1);
							} else {
								_moz_sessionId = "historyState0";
								_moz_storageTextarea.value = "0";
								sessionStorage.historyState = "1";
							}
							_noData();
						}
						var _moz_save = function($data) {
							if (_moz_sessionId) {
								//alert(_moz_sessionId);
								sessionStorage[_moz_sessionId] = _compileJS($data);
								//alert(sessionStorage[_moz_sessionId]);
							}
						}
					} else {
						if (_moz_storageTextarea.value.length) {
							_loadCachedSession(eval(_moz_storageTextarea.value));
						} else {
							_noData();
						}
						var _moz_save = function($data) {
							_moz_storageTextarea.value = _compileJS($data);
						};
					}
					
					_document.documentElement.appendChild(_moz_newBody);
					_document.write("<\/html>");
					_document.close();

					// ******************************
					var _browser_save = function() {
						_moz_save(_getStoredObject());
					};
					var _browser_add = function($index) {
						_moz_anticipatedIndex = $index;
						_moz_anticipatedHash = _getStoredObject()._state._historyInfo[$index]._urlFragment;
						if (_stripHash(_location.hash) == _moz_anticipatedHash) {
							_location.href = "#"+_stripHash(_moz_anticipatedHash)+"_";	
							_location.replace("#"+_stripHash(_moz_anticipatedHash));
						} else {
							_location.href = "#"+_stripHash(_moz_anticipatedHash);
						}
						_moz_scrollPosition($index);
						_moz_correctIndex = $index;
					};
					var _browser_replace = function($index) {
						_moz_anticipatedHash = _getStoredObject()._state._historyInfo[$index]._urlFragment;
						_location.replace("#"+_stripHash(_moz_anticipatedHash));
						_moz_correctIndex = $index;
					};
					break;
			  case "webkit":
					_this._addSafariEvents = true;
					_this._isWebkit = true;
					
					var _wk_currentHash = _location.hash;
					var _wk_anticipatedIndex = -1;
					var _wk_anticipatedHash;
					
					_document.write("<\/head><body><form id=\"storageForm\" style=\"position:fixed;visibility:hidden;width:0px;height:0px;overflow:hidden;\"><textarea disabled=\"disabled\"></textarea><\/form>");
					var _wk_storageForm = _document.getElementById("storageForm");
					_document.body.removeChild(_wk_storageForm);
					var _wk_oldHead = _head;
					_document.documentElement.removeChild(_head);
					var _wk_oldBody = _document.body;
					_document.documentElement.removeChild(_wk_oldBody);
					var _wk_newBody = _document.createElement("body");
					_wk_newBody.style.overflow = "hidden";
					//_wk_newBody.style.overflow = "-moz-scrollbars-none";
					//_wk_newBody.style.MozUserFocus = "ignore";
					//_wk_newBody.style.MozUserSelect = "none";
					
					_wk_newBody.appendChild(_wk_storageForm);
					var _wk_storageTextarea = _wk_storageForm.childNodes[0];
					//_wk_storageTextarea.style.MozUserFocus = "ignore";
					//_wk_storageTextarea.style.MozUserSelect = "none";
					_wk_storageTextarea.setAttribute("spellcheck","false");
					
					// Do we need all this Firefox crap for Safari?
					_wk_newBody.setAttribute("onscroll","historyState._wk_scrollEvent()");
					_wk_newBody.setAttribute("onkeydown","return historyState._wk_keyDownEvent(event);");
					_wk_newBody.setAttribute("onkeypress","return historyState._wk_keyDownEvent(event);");
					_wk_newBody.setAttribute("onkeyup","return historyState._wk_keyDownEvent(event);");
					_wk_newBody.setAttribute("ondragenter","return historyState._wk_dragEnterEvent();");
					_wk_newBody.setAttribute("ondragover","return historyState._wk_dragOverEvent();");
					_wk_newBody.setAttribute("ondragleave","return historyState._wk_dragLeaveEvent();");
					
					_wk_newBody.setAttribute("onmousedown","historyState._wk_activeTab();");
					_wk_newBody.setAttribute("onmouseover","historyState._wk_activeTab();");
					_wk_newBody.setAttribute("onmouseout","historyState._wk_activeTab();");
					_wk_newBody.setAttribute("onmousemove","historyState._wk_activeTab();");
					_wk_newBody.setAttribute("onmouseup","historyState._wk_activeTab();");
					_wk_newBody.setAttribute("onfocus","historyState._wk_activeTab();");
					
					
					var _wk_contentIframe = _document.createElement("iframe");
					// (For testing)
					//	_wk_contentIframe.src = "data:text/html;charset=utf-8,hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>hello<br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br><br>";
					// Mozilla won't allow you to directly load the URL of the parent frame in a child frame, so we use
					// a simple workaround.
					
					//_wk_contentIframe.setAttribute('src', "javascript:(function(){location.href="+_compileJS(_document.URL)+";})();");
					var _wk_iframe_src = 'data:text/html;charset=utf-8,<!DOCTYPE html><html><head><style type="text/css">*{border:0px;line-height;0px;margin:0px;padding:0px;}</style></head><body onscroll="window.scrollTo(0,5000);return false;" onmousewheel="window.scrollTo(0,5000);"><div style="height:5000px;"><\/div><script type=\"text\/javascript\">var x=document.createElement(\"iframe\");x.setAttribute("src",top.location.protocol+"//"+top.location.host+top.location.pathname+top.location.search);x.setAttribute("name","foo");x.setAttribute("style","width:100%;border:0px;margin:0px;padding:0px;background-color:white;");document.body.appendChild(x);</script><div style="height:5000px;"><\/div><script type="text/javascript">window.setInterval(function(){document.body.scrollTop=5000;x.setAttribute("height",window.innerHeight);},100);</script></body></html>';
					_wk_contentIframe.setAttribute('src',_wk_iframe_src);
				window.setInterval(function(){_wk_contentIframe.setAttribute('width',_wk_tallDiv.offsetLeft+16);},100);
				
					_wk_contentIframe.style.height = "100%";
					_wk_contentIframe.style.position = "fixed";
					_wk_contentIframe.style.top = "0px";
					_wk_contentIframe.style.left = "0px";
					_wk_contentIframe.style.borderStyle = "none";
					_wk_contentIframe.style.backgroundColor = "white";
					_wk_contentIframe.style.overflow = "auto";
				  //_wk_contentIframe.setAttribute('onblur','this.focus();');
			  _wk_contentIframe.setAttribute('onmousewheel','document.getElementById("storageForm").firstChild.focus();');
			  
					var _wk_tallDiv = _document.createElement("div");
					
					_wk_tallDiv.style.position = "absolute";
					_wk_tallDiv.style.left = "100%";
					_wk_tallDiv.style.top = "100%";
					_wk_tallDiv.style.height = "auto";
					var _wk_imageSpacer = _document.createElement("div");
					_wk_imageSpacer.style.height = "8000px";
					_wk_imageSpacer.style.width = "1px";
					_wk_imageSpacer.alt = "";
					_wk_imageSpacer.title = "";
					_wk_tallDiv.appendChild(_wk_imageSpacer);
					_wk_newBody.appendChild(_wk_tallDiv);
					
					_wk_newBody.appendChild(_wk_contentIframe);
					var _wk_ignoreLastScroll = false;
					var _wk_ignoreAllScroll = false;
					var _wk_scrollPosition = function($pos) {
						if (document.compatMode == "BackCompat") {
							if (typeof($pos) != "undefined") {
								_wk_newBody.scrollTop = $pos;
								return $pos;
							} else {
								return _wk_newBody.scrollTop;
							}
						} else {
							if (typeof($pos) != "undefined") {
								window.scrollTo(0,$pos);
								return $pos;
							} else {
								return self.pageYOffset;
							}
						}
					};
					
					var _wk_correctIndex = _wk_scrollPosition();
					var _wk_correctWidth = self.innerWidth;
					var _wk_correctHeight = self.innerHeight;
					var _wk_correctOuterWidth = self.outerWidth;
					var _wk_correctOuterHeight = self.outerHeight;
					var _wk_scrollWheelEvent = function(ev) {
						_wk_ignoreLastScroll=true;
						//window.blur();
					//	window.focus();
						//_wk_scrollPosition(_wk_correctIndex);
						//alert(_wk_scrollPosition());
						//alert(ev.preventDefault);
						//_wk_scrollCatcher.focus();
						ev.preventDefault();
						ev.returnValue=false;
						
					};
			    _window.onmousewheel = _wk_scrollWheelEvent;
			    _this._wk_dragEnterEvent = function() {
			    	_wk_ignoreAllScroll = true;
			    };
			    _this._wk_dragOverEvent = function() {
			    	_wk_ignoreAllScroll = true;
			    };
			    _this._wk_dragLeaveEvent = function() {
			    	_wk_ignoreAllScroll = false;
						if (_wk_scrollPosition() != _wk_correctIndex) {
			    		_wk_ignoreLastScroll = true;
			 	   	  _wk_scrollPosition(_wk_correctIndex);
			 	   	}
			 	  };
			 	  _this._wk_selectEvent = function() {
			 	  	_wk_ignoreAllScroll = true;
			 	  };
			 	  _this._wk_keyUpEvent = function() {
			 	  	if (!_wk_ignoreAllScroll) return;
						_wk_ignoreLastScroll = true;
			 	  	_wk_ignoreAllScroll = false;
			 	  	_this._wk_scrollEvent();
			 	  };
			 	  _this._wk_mouseMoveEvent = function(e) {
			 	  	if (e.button) return;
			 	  	if (!_wk_ignoreAllScroll) return;
						_wk_ignoreLastScroll = true;
			 	  	_wk_ignoreAllScroll = false;
			 	  	_this._wk_scrollEvent();
			 	  };
			    _this._wk_scrollEvent = function() {
						if (_wk_ignoreLastScroll) {
							if (_wk_scrollPosition() != _wk_correctIndex) {
								_wk_scrollPosition(_wk_correctIndex);
							} else {
								_wk_ignoreLastScroll = false;
							}
							return;
						}
						if (_wk_ignoreAllScroll) {
							if (_wk_scrollPosition() != _wk_correctIndex) {
								_wk_ignoreLastScroll = true;
								//_wk_scrollPosition(_wk_correctIndex);
							}
							return;
						}
						
						if (_wk_scrollPosition() > 1000) {
							_wk_scrollPosition(_wk_correctIndex);
							return;
						}
						//alert("SCROLLL!");
						if (_wk_scrollPosition() == _wk_correctIndex) {
							return;
						}
						if (((self.innerWidth != _wk_correctWidth) ||
							(self.innerHeight != _wk_correctHeight) ||
							(self.outerWidth != _wk_correctOuterWidth) ||
							(self.outerHeight != _wk_correctOuterHeight)) &&
							(_stripHash(_location.hash.toString()) === _stripHash(_wk_currentHash))) {
							_wk_scrollPosition(_wk_correctIndex);
							_wk_correctWidth = self.innerWidth;
							_wk_correctHeight = self.innerHeight;
							_wk_correctOuterWidth = self.outerWidth;
							_wk_correctOuterHeight = self.outerHeight;
							_wk_correctViewportOnActiveTab = false;
							return;
						}
						_wk_correctIndex = _wk_scrollPosition();
						if ((_stripHash(_location.hash.toString()) ===
							_stripHash(_wk_anticipatedHash))
							&& (_wk_anticipatedIndex == _wk_scrollPosition())) {
							_scriptChangeIndex(_wk_anticipatedIndex);
						} else {
							_userChangeIndex(parseInt(_wk_scrollPosition()),false);
						}
						_wk_anticipatedIndex = -1;
						_wk_currentHash = _location.hash;
						_wk_anticipatedHash = false;
					};
					var _wk_correctViewportOnActiveTab;
					_this._wk_activeTab = function() {
						if (_wk_correctViewportOnActiveTab) {
							_wk_correctWidth = self.innerWidth;
							_wk_correctHeight = self.innerHeight;
							_wk_correctOuterWidth = self.outerWidth;
							_wk_correctOuterHeight = self.outerHeight;
							_wk_correctViewportOnActiveTab = false;
						}
					}
					var _wk_poll = function() {
						if (top.document.title !== _document.title) {
							top.document.title = _document.title;
						}
					
						if (_wk_ignoreLastScroll || _wk_ignoreAllScroll) {
							return;
						}
						if ((self.innerWidth != _wk_correctWidth) ||
							(self.innerHeight != _wk_correctHeight) ||
							(self.outerWidth != _wk_correctOuterWidth) ||
							(self.outerHeight != _wk_correctOuterHeight)) {
							_wk_scrollPosition(_wk_correctIndex);
							_wk_correctViewportOnActiveTab = true;
						}
						if ((_stripHash(_location.hash.toString()) !==
							_stripHash(_wk_currentHash))
							&& (_stripHash(_location.hash.toString()) !==
							_stripHash(_wk_anticipatedHash)) &&
							(_wk_scrollPosition() == _wk_correctIndex)) {
							_wk_scrollPosition(parseInt(_wk_scrollPosition())+1);
							_wk_correctIndex++;
							_wk_currentHash = _location.hash;
							
							 _getStoredObject()._state._historyInfo[_wk_correctIndex] = {_urlFragment:unescape(_stripHash(_wk_currentHash)),_title:_document.title};
							_userChangeIndex(parseInt(_wk_scrollPosition()),true);
						}
					};
					setInterval(_wk_poll,100);
					
					_this._wk_keyDownEvent = function(e) {
						// This prevents the user from changing the scroll position by using the
						//  spacebar, home, end, page up, or page down keys, or the arrow keys.
						// I'm not sure how cross-platform this is....
						if (e.which > 40 || e.which < 32) {
							return true;
						}
						_wk_ignoreLastScroll = true;
						_this._wk_scrollEvent();
						//var _wk_temp = _document.createElement("input");
						//_wk_temp.style.position="fixed";
						//_wk_temp.setAttribute("autocomplete","off");
						//_wk_newBody.appendChild(_wk_temp);
						//_wk_temp.focus();
						//_wk_newBody.removeChild(_wk_temp);
						//delete _wk_temp;
						//return false;
					};
					
					
					// Use a Firefox 2.0 feature if available. Firefox 2.0 spellchecks
					// textareas which is very slow, so we can use this to store our data
					// instead and only use the textarea to know which data to look up in
					// sessionStorage.
					var _wk_sessionId;
					if (_window.sessionStorage) {
						// Sessions each have a different storage key which is stored in the textarea
						// (session storage is shared in the top-level browsing context so we need to deal
						// with two instances of the site in the top-level browsing history - it is only different
						// for each browser window/tab.)
						// sessionStorage.historyState		total number of history states
						// sessionStorage.historyState0		if the textarea says "0" load this one
						if (_wk_storageTextarea.value.length) {
							_wk_sessionId = ("historyState"+_wk_storageTextarea.value);
						}
						if (sessionStorage[_wk_sessionId]) {
				//			alert(sessionStorage[_wk_sessionId]);
				//			alert(eval(sessionStorage[_wk_sessionId]));
				//alert(sessionStorage[_wk_sessionId]);
							_loadCachedSession(eval(sessionStorage[_wk_sessionId].toString()));
						} else {
							if (parseInt(sessionStorage.historyState) >= 0) {
								_wk_sessionId = ("historyState"+sessionStorage.historyState);
								_wk_storageTextarea.value = sessionStorage.historyState;
								sessionStorage.historyState = String(parseInt(sessionStorage.historyState)+1);
							} else {
								_wk_sessionId = "historyState0";
								_wk_storageTextarea.value = "0";
								sessionStorage.historyState = "1";
							}
							_noData();
						}
						var _wk_save = function($data) {
							if (_wk_sessionId) {
								//alert(_wk_sessionId);
								sessionStorage[_wk_sessionId] = _compileJS($data);
								//alert(sessionStorage[_wk_sessionId]);
							}
						}
					} else {
					
						if (_wk_storageTextarea.value.length) {
							_loadCachedSession(eval(_wk_storageTextarea.value));
						} else {
							_noData();
						}
						var _wk_save = function($data) {
							_wk_storageTextarea.value = _compileJS($data);
						};
					}
					_document.documentElement.appendChild(_wk_newBody);
					//window.scrollBy(0);
					_document.write("<\/html><xmp>");
					_document.close();
					
					
					// ******************************
					var _browser_save = function() {
						_wk_save(_getStoredObject());
					};
					var _browser_add = function($index) {
						_wk_anticipatedIndex = $index;
						_wk_anticipatedHash = _getStoredObject()._state._historyInfo[$index]._urlFragment;
						if (unescape(_stripHash(_location.hash)) == _wk_anticipatedHash) {
							// not possible in webkit. do nothing...
						} else {
							_location.href = "#"+encodeURIComponent(_stripHash(_wk_anticipatedHash));
						}
						_wk_scrollPosition($index);
						_wk_correctIndex = $index;
					};
					var _browser_replace = function($index) {
						_wk_anticipatedHash = _getStoredObject()._state._historyInfo[$index]._urlFragment;
						var $temp = "#"+encodeURIComponent(_stripHash(_wk_anticipatedHash));
						if ($index > 0) {
							_history.go(-1);
							_location.href=$temp;
						}
						_location.replace($temp);
						_wk_scrollPosition($index);
						_wk_correctIndex = $index;
					};
					break;
				case "oldwebkit":
					var _owk_anticipatedIndex, _owk_anticipatedHash, _owk_correctIndex, _owk_correctHash, _owk_noReport = false;
					//document.write('<form id="storageForm"><textarea spellcheck="false" disabled="disabled" style="position:fixed;visibility:hidden;width:0px;height:0px;overflow:hidden;"></textarea></form><script>function xx() { };</script>');
					
					//..document.write('<input type="hidden"></input>');
					
					_document.write("<style>* { margin:0px;padding:0px;border-width:0px; } iframe { width:100%;height:100%;position:absolute;top:0px;left:0px;border-style:none;overflow:auto;background-color:white; }<\/style><\/head><body><div id=\"metaDiv\"><\/div><form id=\"storageForm\" style=\"visibility:hidden;width:0px;height:0px;overflow:hidden;\"><textarea disabled=\"disabled\"><\/textarea><textarea disabled=\"disabled\"><\/textarea><\/form></body></html><plaintext style='display:none;'>");
					
					var _owk_storageTextarea = _document.getElementsByTagName("TEXTAREA")[0];	
					
					var _owk_historyTextarea =
						_document.getElementsByTagName("TEXTAREA")[1];
					
					var _owk_save = function($data) {
						_owk_storageTextarea.value = _compileJS($data);
						_owk_historyTextarea.value = _owk_historyOffset;
					};
					
					var _owk_historyOffset = _history.length;
					
					if (_owk_historyTextarea.value.length) {
						_owk_historyOffset = parseInt(_owk_historyTextarea.value,10);
					}
					
					var _owk_index = function() {
						return _history.length - _owk_historyOffset;
					};
					
					_owk_correctIndex = _owk_index();
					_owk_correctHash = unescape(_stripHash(_location.hash));
					var _owk_hasData = false;
					if (_owk_storageTextarea.value.length) {
						_owk_hasData = true;
						_currentIndex  = _owk_correctIndex;
						_loadCachedSession(eval(_owk_storageTextarea.value));
						_owk_correctHash = _stripHash(_getStoredObject()._state._historyInfo[_owk_correctIndex]._urlFragment);
						
					} else {
						_noData();
					
					  _getStoredObject()._state._historyInfo[_owk_correctIndex]._urlFragment=_owk_correctHash;
					}
					
					
					var _owk_metaDiv = _document.getElementById('metaDiv');
					var _owk_queuedMetaHash = false;
					var _owk_queuedMetaReport = false;
					var _owk_metaBusy = false;
					var _owk_delayedMetaHash = false;
					var _owk_delayedMetaTimeout = false;
					var _owk_setMeta = function($hash,$report) {
						if (_owk_metaBusy) {
							_owk_queuedMetaHash = $hash;
							_owk_queuedMetaReport= $report;
							return;
						}
						if (_owk_delayedMetaTimeout) {
							_window.clearTimeout(_owk_delayedMetaTimeout);
						}
						_owk_metaBusy = true;
						setTimeout(function() {
							_owk_metaBusy = false;
							if (_owk_queuedMetaHash) {
								_owk_setMeta(_owk_queuedMetaHash,_owk_queuedMetaReport);
								_owk_queuedMetaHash=false;
								if (_owk_delayedMetaTimeout) {
									_window.clearTimeout(_owk_delayedMetaTimeout);
								}
							}
						},250);
						_owk_metaDiv.innerHTML = '';
						var $meta = document.createElement('meta');
						$meta.setAttribute('http-equiv','refresh');
						$meta.setAttribute('content','0.01;url='+_location.href.split('#')[0]+'#'+$hash);
						_owk_metaDiv.appendChild($meta);
						_owk_noReport = !$report;
					};
					if (_owk_hasData) {
						_owk_setMeta(_owk_correctHash);
					}
					var _owk_iframe = document.createElement("IFRAME");
					_owk_iframe.src=_location.href.split('#')[0];
					document.body.appendChild(_owk_iframe);
					
					var _owk_poll = function() {
					
						if (top.document.title !== _document.title) {
							top.document.title = _document.title;
						}
						var $index = _owk_index();
						var $repHash = unescape(_stripHash(_location.hash));
						if ($index == _owk_correctIndex && $repHash == _owk_correctHash) {
				
						} else if ($index == _owk_anticipatedIndex && $repHash == _owk_anticipatedHash) {
							_owk_correctHash = _owk_anticipatedHash;
							_owk_anticipatedHash = false;
							
							_owk_correctIndex = _owk_anticipatedIndex;
							_owk_anticipatedIndex = false;
							if (!_owk_noReport) {
								_scriptChangeIndex($index);
							}
							_owk_noReport = false;
							_browser_save();
						} else if ($repHash == _owk_correctHash && _owk_anticipatedIndex !== $index && _owk_correctIndex !== $index) {
							_owk_correctIndex = $index;
							//_owk_setMeta(_owk_anticipatedHash);
							_owk_delayedMetaHash = _stripHash(_getStoredObject()._state._historyInfo[$index]._urlFragment);
							if (_owk_delayedMetaTimeout) {
								_window.clearTimeout(_owk_delayedMetaTimeout);
							}
							_owk_anticipatedHash = _owk_delayedMetaHash;
							_owk_anticipatedIndex = $index;
							_owk_delayedMetaTimeout = _window.setTimeout(function(){
								//_owk_noReport = true;
								_owk_delayedMetaTimeout = false;
								_owk_setMeta(_owk_delayedMetaHash,false);
							},250);
							_userChangeIndex($index,false);
							
							_browser_save();
						} else if ($repHash !== _owk_anticipatedHash && _owk_anticipatedIndex == $index && $repHash !== _owk_correctHash) {
							_getStoredObject()._state._historyInfo[$index] = {_urlFragment:$repHash,_title:_document.title};
							_userChangeIndex($index,true);
							_owk_correctIndex = $index;
							_owk_anticipatedIndex = false;
							_owk_correctHash = $repHash;
							
							_browser_save();
						}
					};
					
					_window.setInterval(_owk_poll,100);
					
					
					// ******************************
					var _browser_save = function() {
						_owk_save(_getStoredObject());
					};
					var _browser_add = function($index) {
						//_owk_anticipatedIndex = $index;
						//_owk_anticipatedIndex = $index;
						//_owk_correctIndex = $index;
						_owk_anticipatedIndex = $index;
						_owk_anticipatedHash = _stripHash(_getStoredObject()._state._historyInfo[$index]._urlFragment);
						var $temp = '#``````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````````' + Math.floor(Math.random()*100000) /*+_owk_anticipatedHash+'_'*/;
						while ($temp == '#'+_owk_correctHash) {
							$temp += 'xyzzy';
						}
					  _location.href = $temp;
						_owk_correctHash = _stripHash($temp);
						//_owk_correctIndex = $index;
						setTimeout(function(){_owk_setMeta(_owk_anticipatedHash,true)},10);
					};
					var _browser_replace = function($index) {
					//	_wk_anticipatedHash = _getStoredObject()._state._historyInfo[$index]._urlFragment;
					//	_location.replace("#"+_stripHash(_wk_anticipatedHash));
					//	_wk_correctIndex = $index;
						_owk_anticipatedIndex = $index;
						_owk_anticipatedHash = _stripHash(_getStoredObject()._state._historyInfo[$index]._urlFragment);
						setTimeout(function(){_owk_setMeta(_owk_anticipatedHash,true)},10);
					};
					break;
			default:
					window.historyState=false;
					return;
			};
			
			/*********************************
			Scripting interface
			*********************************/
			/*** History ***/
			// $replace = boolean, if true then it's kind of like location.replace,
			// if false (or unspecified), it's kind of like location.assign
			_this.newState = function($urlFragment,$replace) {
				if ($replace) {
					_replaceToHistoryQueue($urlFragment);
				} else {
					_addToHistoryQueue($urlFragment);
				}
			};
			
			// default $state is current
			_this.urlFragment = function($state) {
				if (_isStorageReady) {
					if (!($state)) {
						$state = _currentIndex;
					}
					return _getStoredObject()._state._historyInfo[$state]._urlFragment;
				} else {
					return _stripHash(_location.hash);
				}
			};
			// returns the index of the current state
			_this.currentState = function() {
				return _currentIndex;
			};
			
			// gives the last user interaction with the history.
			// returns a negative number if the back button was used, a positive number if
			// the forward button was used, or zero if the address bar was used.
			// the positive or negative number is the forward or back distance...
			_this.userInteraction = function() {
				return _userInteractionValue;
			};
			
			// This will notify your script of changes and stuff.
			_this.setHistoryListener = function($listener) {
				_listener = $listener;
				if (_fireOnListenerAdd) {
					_listener();
					_fireOnListenerAdd = false;
				}
			};
			
			/*** Storage ***/
			// In some cases (after a reload for example), storage may not be accessible
			// yet because only the textarea storage has persisted (which only will work after
			// the page has loaded).
			_this.setLoadListener = function($listener) {
				_loadListener = $listener;
				if (_fireOnLoadListener) {
					_fireOnLoadListener = false;
					_loadListener();
				}
			};
			/*
			// Gets the state storage object
			// Default $state is the current state.
			_this.state = function($state) {
				if (_isStorageReady) {
					if (!$state) {
						$state = _currentIndex;
					}
					return _getStoredObject().state[_currentIndex].storage;
				}
				return false;
			};
			// Gets the session storage object
			_this.session = function() {
				if (_isStorageReady) {
					return _getStoredObject().session.storage;
				}
				return false;
			};
			*/
			// Saves changes to state and session.
			// (WARNING: this will NOT work in the onbeforeunload and
			// onunload events!)
			_this.save = function() {
				_queueSave();
			};
			// 
			
			// OLD STUFF:
			/*
			// (Note: Advantage of saving to states instead of to your own vars: states are
			// "garbage collected" when the forward history is cleared)
			// default $state is current
			// if $key is empty, then the contents of the $value array replace whatever
			// history info is stored for the state
			_this.saveState = function($key,$value,$state) {
			
			};
			// default $state is current
			// if $key is empty, then all data saved for the state is deleted
			_this.deleteState = function($key,$state) {
				
			};
			// default $state is current
			// if $key is empty, then an array is returned
			_this.loadState = function($key,$state) {
			
			};
			// if $key is empty, then the contents of the $value array replace whatever
			// history info is stored for the state
			_this.saveSession = function($key,$value) {
			
			};
			// default $state is current
			// if $key is empty, then all data saved for the state is deleted
			_this.deleteSession = function($key) {
			
			};
			// if $key is empty, then an array is returned
			_this.loadSession = function($key) {
			
			};*/
			
		}();
	}
}
