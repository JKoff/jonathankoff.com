			function updateStorage() {
				if (typeof(historyState.state[historyState.currentState()]) != "string") {
					historyState.state[historyState.currentState()] = "";
				}
				//document.getElementById("storage").value = historyState.state[historyState.currentState()];
			}
			function loadListener() {
				updateStorage();
			};
			function historyListener() {
				//document.getElementById("currentValue").value = historyState.urlFragment();
				//document.getElementById("currentIndex").value = historyState.currentState();
				updateStorage();
				reparse1(historyState.urlFragment());
			};
			function storeit() {
				historyState.state[historyState.currentState()] = document.getElementById("storage").value;
				historyState.save();
				updateStorage();

			};
			historyState.setLoadListener(loadListener);
			historyState.setHistoryListener(historyListener);
			//document.getElementById("currentIndex").value = historyState.currentState();
			//document.getElementById("currentValue").value = historyState.urlFragment();

