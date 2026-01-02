import { Pane } from "tweakpane";

const STORAGE_KEY = "procgen-debug-state-v1";

// tweakpane types are incomplete, so we use any for the runtime API
// biome-ignore lint/suspicious/noExplicitAny: tweakpane types incomplete
type TweakPane = any;
// biome-ignore lint/suspicious/noExplicitAny: tweakpane types incomplete
type FolderApi = any;
// biome-ignore lint/suspicious/noExplicitAny: tweakpane types incomplete
type BladeState = any;

export class DebugPane {
	pane: TweakPane;
	private persistenceEnabled = false;
	private restoreCallbacks: Array<() => void> = [];
	private folders: FolderApi[] = [];

	constructor(title = "Debug", expanded = false) {
		this.pane = new Pane({ title, expanded });
	}

	addFolder(title: string, expanded = true): FolderApi {
		const folder = this.pane.addFolder({ title, expanded });
		this.folders.push(folder);
		return folder;
	}

	addButton(title: string, onClick: () => void) {
		return this.pane.addButton({ title }).on("click", onClick);
	}

	private getSavedState(): BladeState | null {
		const saved = localStorage.getItem(STORAGE_KEY);
		if (!saved) return null;
		try {
			return JSON.parse(saved);
		} catch {
			localStorage.removeItem(STORAGE_KEY);
			return null;
		}
	}

	restoreState() {
		const state = this.getSavedState();
		if (state) {
			this.pane.importState(state);
			for (const callback of this.restoreCallbacks) {
				callback();
			}
		}
	}

	enablePersistence() {
		if (this.persistenceEnabled) return;
		this.persistenceEnabled = true;

		const saveState = () => {
			const state = JSON.stringify(this.pane.exportState());
			localStorage.setItem(STORAGE_KEY, state);
		};

		this.pane.on("change", saveState);
		this.pane.on("fold", saveState);

		for (const folder of this.folders) {
			folder.on("fold", saveState);
		}
	}

	onRestore(callback: () => void) {
		this.restoreCallbacks.push(callback);
	}

	reset() {
		localStorage.removeItem(STORAGE_KEY);
		window.location.reload();
	}

	dispose() {
		this.pane.dispose();
	}
}
